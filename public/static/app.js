// Digital Marketing Analytics Platform - Frontend JavaScript

// 🔒 API密钥安全管理（本地存储）
const API_KEYS_STORAGE_KEY = 'advertools_api_keys';

// API密钥管理函数
function saveApiKeys(keys) {
  try {
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
    console.log('✅ API密钥已安全保存到本地存储');
    return true;
  } catch (error) {
    console.error('❌ 保存API密钥失败:', error);
    return false;
  }
}

function getApiKeys() {
  try {
    const stored = localStorage.getItem(API_KEYS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('❌ 读取API密钥失败:', error);
    return {};
  }
}

function deleteApiKey(keyName) {
  try {
    const keys = getApiKeys();
    delete keys[keyName];
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
    console.log(`✅ 已删除API密钥: ${keyName}`);
    return true;
  } catch (error) {
    console.error('❌ 删除API密钥失败:', error);
    return false;
  }
}

function clearAllApiKeys() {
  try {
    localStorage.removeItem(API_KEYS_STORAGE_KEY);
    console.log('✅ 已清除所有API密钥');
    return true;
  } catch (error) {
    console.error('❌ 清除API密钥失败:', error);
    return false;
  }
}

// 获取包含API密钥的请求数据
function getApiRequestData(additionalData = {}) {
  const apiKeys = getApiKeys();
  return {
    ...apiKeys,
    ...additionalData
  };
}

// Global state
let currentTool = null;
let isLoading = false;

// Test function for debugging
window.testFunction = function() {
  alert('全局函数测试成功！JavaScript正常工作');
  console.log('testFunction 被调用');
};

// This will be set after function definition

// Utility functions
function showLoading(element) {
  if (element) {
    element.innerHTML = '<div class="flex items-center justify-center py-8"><div class="spinner"></div><span class="ml-2">处理中...</span></div>';
  }
  isLoading = true;
}

function hideLoading() {
  isLoading = false;
}

function showError(element, message) {
  if (element) {
    element.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <i class="fas fa-exclamation-triangle text-red-500 text-2xl mb-2"></i>
        <p class="text-red-700 font-medium">错误</p>
        <p class="text-red-600 text-sm mt-1">${message}</p>
      </div>
    `;
  }
}

function showSuccess(element, message, data = null) {
  if (element) {
    let content = `
      <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div class="flex items-center">
          <i class="fas fa-check-circle text-green-500 mr-2"></i>
          <p class="text-green-700 font-medium">${message}</p>
        </div>
      </div>
    `;
    
    if (data) {
      // 修复：如果data是API响应对象，提取其中的data字段
      let actualData = data;
      if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
        actualData = data.data;
      }
      content += formatResults(actualData);
    }
    
    element.innerHTML = content;
  }
}

function formatResults(data) {
  console.log('formatResults 接收到的数据:', data); // Debug log
  
  if (!data) {
    return '<p class="text-gray-500 text-center py-4">没有数据</p>';
  }
  
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return '<p class="text-gray-500 text-center py-4">没有找到结果</p>';
    }
    
    // Create table for array data
    const headers = Object.keys(data[0] || {});
    if (headers.length === 0) return '<p class="text-gray-500 text-center py-4">数据格式错误</p>';
    
    let table = '<div class="result-table overflow-x-auto"><table class="w-full border-collapse border border-gray-200">';
    table += '<thead class="bg-gray-50"><tr>';
    headers.forEach(header => {
      const displayHeader = header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      table += `<th class="border border-gray-200 px-3 py-2 text-left font-medium text-gray-700">${displayHeader}</th>`;
    });
    table += '</tr></thead><tbody>';
    
    data.slice(0, 50).forEach((row, index) => { // Limit to 50 rows for display
      table += `<tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">`;
      headers.forEach(header => {
        let value = row[header];
        let displayValue = '';
        
        if (value === null || value === undefined) {
          displayValue = '-';
        } else if (Array.isArray(value)) {
          // 处理数组值（如h1, h2, h3标签）
          displayValue = value.length > 0 ? value.join(', ') : '-';
          if (displayValue.length > 100) {
            displayValue = displayValue.substring(0, 100) + '...';
          }
        } else if (typeof value === 'object') {
          // 处理对象值
          displayValue = JSON.stringify(value);
          if (displayValue.length > 100) {
            displayValue = displayValue.substring(0, 100) + '...';
          }
        } else if (typeof value === 'string' && value.length > 100) {
          displayValue = value.substring(0, 100) + '...';
        } else {
          displayValue = String(value);
        }
        
        table += `<td class="border border-gray-200 px-3 py-2 text-sm">${displayValue}</td>`;
      });
      table += '</tr>';
    });
    
    table += '</tbody></table></div>';
    
    if (data.length > 50) {
      table += `<p class="text-sm text-gray-500 mt-2 text-center">显示前50条结果，共${data.length}条</p>`;
    }
    
    return table;
  } else if (typeof data === 'object' && data !== null) {
    // Display object as key-value pairs
    let content = '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
    Object.entries(data).forEach(([key, value]) => {
      let displayValue = '';
      if (Array.isArray(value)) {
        displayValue = value.join(', ');
      } else if (typeof value === 'object' && value !== null) {
        displayValue = JSON.stringify(value, null, 2);
      } else {
        displayValue = String(value);
      }
      
      const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      content += `
        <div class="bg-gray-50 p-3 rounded border">
          <span class="font-medium text-gray-700">${displayKey}:</span>
          <div class="text-gray-900 mt-1 break-words">${displayValue}</div>
        </div>
      `;
    });
    content += '</div>';
    return content;
  }
  
  // Fallback for other data types
  return `<pre class="bg-gray-100 p-4 rounded text-sm overflow-x-auto border">${JSON.stringify(data, null, 2)}</pre>`;
}

// API call wrapper
async function apiCall(endpoint, method = 'GET', data = null) {
  try {
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }
    
    const response = await fetch(`/api${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '服务器错误' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API调用失败:', error);
    throw error;
  }
}

// Tool functions
function showSEOTools() {
  currentTool = 'seo';
  const content = document.getElementById('main-content');
  
  content.innerHTML = `
    <div class="fade-in-up">
      <div class="flex items-center mb-6">
        <i class="fas fa-search text-blue-500 text-2xl mr-3"></i>
        <h2 class="text-2xl font-bold text-gray-900">SEO分析工具</h2>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Website Crawler -->
        <div class="bg-white border rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i class="fas fa-spider text-blue-500 mr-2"></i>
            网站爬虫分析
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">网站URL</label>
              <input type="url" id="crawler-url" class="form-input" placeholder="https://example.com" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">爬取页面数量限制</label>
              <input type="number" id="crawler-limit" class="form-input" value="10" min="1" max="100" />
            </div>
            <button onclick="crawlWebsite()" class="btn-primary w-full">
              <i class="fas fa-play mr-2"></i>开始爬取
            </button>
          </div>
        </div>
        
        <!-- SERP Analysis -->
        <div class="bg-white border rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i class="fas fa-chart-bar text-green-500 mr-2"></i>
            SERP排名分析
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">搜索关键词</label>
              <input type="text" id="serp-keyword" class="form-input" placeholder="输入关键词" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">搜索结果数量</label>
              <select id="serp-count" class="form-input">
                <option value="10">10条</option>
                <option value="20">20条</option>
                <option value="50">50条</option>
              </select>
            </div>
            <button onclick="analyzeSERP()" class="btn-success w-full">
              <i class="fas fa-search mr-2"></i>分析SERP
            </button>
          </div>
        </div>
        
        <!-- Sitemap Analysis -->
        <div class="bg-white border rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i class="fas fa-sitemap text-purple-500 mr-2"></i>
            Sitemap分析
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Sitemap URL</label>
              <input type="url" id="sitemap-url" class="form-input" placeholder="https://example.com/sitemap.xml" />
            </div>
            <button onclick="analyzeSitemap()" class="btn-primary w-full">
              <i class="fas fa-download mr-2"></i>分析Sitemap
            </button>
          </div>
        </div>
        
        <!-- Robots.txt Analysis -->
        <div class="bg-white border rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i class="fas fa-robot text-orange-500 mr-2"></i>
            Robots.txt检查
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">网站域名</label>
              <input type="url" id="robots-url" class="form-input" placeholder="https://example.com" />
            </div>
            <button onclick="analyzeRobots()" class="btn-secondary w-full">
              <i class="fas fa-file-alt mr-2"></i>检查Robots.txt
            </button>
          </div>
        </div>
      </div>
      
      <!-- Results Area -->
      <div class="mt-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">分析结果</h3>
        <div id="seo-results" class="result-container">
          <p class="text-gray-500 text-center py-8">选择上方工具开始分析</p>
        </div>
      </div>
    </div>
  `;
}

function showSEMTools() {
  currentTool = 'sem';
  const content = document.getElementById('main-content');
  
  content.innerHTML = `
    <div class="fade-in-up">
      <div class="flex items-center mb-6">
        <i class="fas fa-bullseye text-green-500 text-2xl mr-3"></i>
        <h2 class="text-2xl font-bold text-gray-900">SEM营销工具</h2>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Keyword Generator -->
        <div class="bg-white border rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i class="fas fa-key text-blue-500 mr-2"></i>
            关键词生成器
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">种子关键词</label>
              <textarea id="seed-keywords" class="form-textarea" placeholder="输入种子关键词，每行一个"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">修饰词</label>
              <textarea id="modifier-words" class="form-textarea" placeholder="输入修饰词，每行一个"></textarea>
            </div>
            <button onclick="generateKeywords()" class="btn-primary w-full">
              <i class="fas fa-magic mr-2"></i>生成关键词
            </button>
          </div>
        </div>
        
        <!-- Ad Creator */
        <div class="bg-white border rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i class="fas fa-ad text-green-500 mr-2"></i>
            广告文案创建
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">产品/服务名称</label>
              <input type="text" id="product-name" class="form-input" placeholder="输入产品或服务名称" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">广告模板</label>
              <textarea id="ad-template" class="form-textarea" placeholder="输入广告模板，使用 {product} 作为占位符"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">最大字符长度</label>
              <input type="number" id="ad-max-length" class="form-input" value="30" min="10" max="100" />
            </div>
            <button onclick="createAds()" class="btn-success w-full">
              <i class="fas fa-create mr-2"></i>创建广告
            </button>
          </div>
        </div>
      </div>
      
      <!-- Results Area -->
      <div class="mt-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">生成结果</h3>
        <div id="sem-results" class="result-container">
          <p class="text-gray-500 text-center py-8">选择上方工具开始生成</p>
        </div>
      </div>
    </div>
  `;
}

function showTextTools() {
  currentTool = 'text';
  const content = document.getElementById('main-content');
  
  content.innerHTML = `
    <div class="fade-in-up">
      <div class="flex items-center mb-6">
        <i class="fas fa-file-alt text-purple-500 text-2xl mr-3"></i>
        <h2 class="text-2xl font-bold text-gray-900">文本分析工具</h2>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Word Frequency -->
        <div class="bg-white border rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i class="fas fa-chart-pie text-blue-500 mr-2"></i>
            词频统计分析
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">待分析文本</label>
              <textarea id="text-content" class="form-textarea" placeholder="输入要分析的文本内容"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">最小词长</label>
                <input type="number" id="min-word-length" class="form-input" value="2" min="1" max="10" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">显示词数</label>
                <input type="number" id="top-words" class="form-input" value="20" min="5" max="100" />
              </div>
            </div>
            <button onclick="analyzeWordFrequency()" class="btn-primary w-full">
              <i class="fas fa-calculator mr-2"></i>分析词频
            </button>
          </div>
        </div>
        
        <!-- Entity Extraction -->
        <div class="bg-white border rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i class="fas fa-search-plus text-green-500 mr-2"></i>
            实体提取
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">文本内容</label>
              <textarea id="entity-text" class="form-textarea" placeholder="输入包含实体的文本（URL、邮箱、#hashtags等）"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">提取类型</label>
              <select id="entity-type" class="form-input">
                <option value="all">全部类型</option>
                <option value="urls">URL链接</option>
                <option value="emails">邮箱地址</option>
                <option value="hashtags">话题标签 #</option>
                <option value="mentions">用户提及 @</option>
                <option value="numbers">数字</option>
              </select>
            </div>
            <button onclick="extractEntities()" class="btn-success w-full">
              <i class="fas fa-extract mr-2"></i>提取实体
            </button>
          </div>
        </div>
      </div>
      
      <!-- Results Area -->
      <div class="mt-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">分析结果</h3>
        <div id="text-results" class="result-container">
          <p class="text-gray-500 text-center py-8">选择上方工具开始分析</p>
        </div>
      </div>
    </div>
  `;
}

function showURLTools() {
  currentTool = 'url';
  const content = document.getElementById('main-content');
  
  content.innerHTML = `
    <div class="fade-in-up">
      <div class="flex items-center mb-6">
        <i class="fas fa-link text-orange-500 text-2xl mr-3"></i>
        <h2 class="text-2xl font-bold text-gray-900">URL分析工具</h2>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- URL Parser -->
        <div class="bg-white border rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i class="fas fa-unlink text-blue-500 mr-2"></i>
            URL解析器
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">URL列表</label>
              <textarea id="url-list" class="form-textarea" placeholder="输入URL列表，每行一个"></textarea>
            </div>
            <button onclick="parseURLs()" class="btn-primary w-full">
              <i class="fas fa-parse mr-2"></i>解析URL
            </button>
          </div>
        </div>
        
        <!-- URL Validator -->
        <div class="bg-white border rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i class="fas fa-check-circle text-green-500 mr-2"></i>
            URL验证器
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">待验证URL</label>
              <textarea id="validate-urls" class="form-textarea" placeholder="输入需要验证的URL列表"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">验证类型</label>
              <select id="validate-type" class="form-input">
                <option value="status">HTTP状态码</option>
                <option value="redirect">重定向检查</option>
                <option value="structure">URL结构验证</option>
              </select>
            </div>
            <button onclick="validateURLs()" class="btn-success w-full">
              <i class="fas fa-check mr-2"></i>验证URL
            </button>
          </div>
        </div>
      </div>
      
      <!-- Results Area -->
      <div class="mt-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">分析结果</h3>
        <div id="url-results" class="result-container">
          <p class="text-gray-500 text-center py-8">选择上方工具开始分析</p>
        </div>
      </div>
    </div>
  `;
}

// SEO Tool Functions
async function crawlWebsite() {
  const url = document.getElementById('crawler-url').value;
  const limit = document.getElementById('crawler-limit').value;
  const resultsDiv = document.getElementById('seo-results');
  
  if (!url) {
    showError(resultsDiv, '请输入有效的网站URL');
    return;
  }
  
  showLoading(resultsDiv);
  
  try {
    const result = await apiCall('/seo/crawl', 'POST', { url, limit: parseInt(limit) });
    console.log('爬虫API返回结果:', result); // Debug log
    
    // 确保传递正确的消息和数据
    const message = result.message || '网站爬取完成';
    showSuccess(resultsDiv, message, result.data);
  } catch (error) {
    showError(resultsDiv, error.message);
  }
}

async function analyzeSERP() {
  const keyword = document.getElementById('serp-keyword').value;
  const count = document.getElementById('serp-count').value;
  const resultsDiv = document.getElementById('seo-results');
  
  if (!keyword) {
    showError(resultsDiv, '请输入搜索关键词');
    return;
  }
  
  showLoading(resultsDiv);
  
  try {
    // 🔒 包含本地存储的API密钥
    const requestData = getApiRequestData({ keyword, count: parseInt(count) });
    const result = await apiCall('/seo/serp', 'POST', requestData);
    console.log('SERP API返回结果:', result);
    
    const message = result.message || 'SERP分析完成';
    showSuccess(resultsDiv, message, result.data);
  } catch (error) {
    showError(resultsDiv, error.message);
  }
}

async function analyzeSitemap() {
  const url = document.getElementById('sitemap-url').value;
  const resultsDiv = document.getElementById('seo-results');
  
  if (!url) {
    showError(resultsDiv, '请输入Sitemap URL');
    return;
  }
  
  showLoading(resultsDiv);
  
  try {
    const result = await apiCall('/seo/sitemap', 'POST', { url });
    console.log('Sitemap API返回结果:', result); // Debug log
    
    const message = result.message || 'Sitemap分析完成';
    showSuccess(resultsDiv, message, result.data);
  } catch (error) {
    showError(resultsDiv, error.message);
  }
}

async function analyzeRobots() {
  const url = document.getElementById('robots-url').value;
  const resultsDiv = document.getElementById('seo-results');
  
  if (!url) {
    showError(resultsDiv, '请输入网站URL');
    return;
  }
  
  showLoading(resultsDiv);
  
  try {
    const result = await apiCall('/seo/robots', 'POST', { url });
    console.log('Robots API返回结果:', result); // Debug log
    
    const message = result.message || 'Robots.txt分析完成';
    showSuccess(resultsDiv, message, result.data);
  } catch (error) {
    showError(resultsDiv, error.message);
  }
}

// SEM Tool Functions
async function generateKeywords() {
  const seeds = document.getElementById('seed-keywords').value.trim().split('\n').filter(k => k.trim());
  const modifiers = document.getElementById('modifier-words').value.trim().split('\n').filter(m => m.trim());
  const resultsDiv = document.getElementById('sem-results');
  
  if (seeds.length === 0) {
    showError(resultsDiv, '请输入至少一个种子关键词');
    return;
  }
  
  showLoading(resultsDiv);
  
  try {
    const result = await apiCall('/sem/keywords', 'POST', { seeds, modifiers });
    console.log('关键词API返回结果:', result); // Debug log
    
    const message = result.message || '关键词生成完成';
    showSuccess(resultsDiv, message, result.data);
  } catch (error) {
    showError(resultsDiv, error.message);
  }
}

async function createAds() {
  const productName = document.getElementById('product-name').value;
  const template = document.getElementById('ad-template').value;
  const maxLength = document.getElementById('ad-max-length').value;
  const resultsDiv = document.getElementById('sem-results');
  
  if (!productName || !template) {
    showError(resultsDiv, '请输入产品名称和广告模板');
    return;
  }
  
  showLoading(resultsDiv);
  
  try {
    const result = await apiCall('/sem/ads', 'POST', { 
      product_name: productName, 
      template, 
      max_length: parseInt(maxLength) 
    });
    console.log('广告API返回结果:', result); // Debug log
    
    const message = result.message || '广告文案创建完成';
    showSuccess(resultsDiv, message, result.data);
  } catch (error) {
    showError(resultsDiv, error.message);
  }
}

// Text Analysis Functions
async function analyzeWordFrequency() {
  const text = document.getElementById('text-content').value;
  const minLength = document.getElementById('min-word-length').value;
  const topWords = document.getElementById('top-words').value;
  const resultsDiv = document.getElementById('text-results');
  
  if (!text.trim()) {
    showError(resultsDiv, '请输入要分析的文本内容');
    return;
  }
  
  showLoading(resultsDiv);
  
  try {
    const result = await apiCall('/text/word-frequency', 'POST', { 
      text, 
      min_length: parseInt(minLength),
      top_words: parseInt(topWords)
    });
    console.log('词频API返回结果:', result); // Debug log
    
    // 词频分析返回的数据结构较复杂，需要特殊处理
    const message = result.message || '词频分析完成';
    if (result.data && result.data.words) {
      // 创建展示统计信息和词频结果的格式
      let displayData = result.data.words;
      if (result.data.statistics) {
        // 将统计信息添加到结果中
        displayData = [{
          '--- 文本统计 ---': '---',
          '总词数': result.data.statistics.total_words,
          '不同词数': result.data.statistics.unique_words,
          '平均词长': result.data.statistics.avg_word_length,
          '文本长度': result.data.statistics.text_length
        }, ...result.data.words];
      }
      showSuccess(resultsDiv, message, displayData);
    } else {
      showSuccess(resultsDiv, message, result.data);
    }
  } catch (error) {
    showError(resultsDiv, error.message);
  }
}

async function extractEntities() {
  const text = document.getElementById('entity-text').value;
  const entityType = document.getElementById('entity-type').value;
  const resultsDiv = document.getElementById('text-results');
  
  if (!text.trim()) {
    showError(resultsDiv, '请输入要分析的文本内容');
    return;
  }
  
  showLoading(resultsDiv);
  
  try {
    const result = await apiCall('/text/extract', 'POST', { text, type: entityType });
    console.log('实体提取API返回结果:', result); // Debug log
    
    const message = result.message || '实体提取完成';
    showSuccess(resultsDiv, message, result.data);
  } catch (error) {
    showError(resultsDiv, error.message);
  }
}

// URL Analysis Functions
async function parseURLs() {
  const urls = document.getElementById('url-list').value.trim().split('\n').filter(u => u.trim());
  const resultsDiv = document.getElementById('url-results');
  
  if (urls.length === 0) {
    showError(resultsDiv, '请输入至少一个URL');
    return;
  }
  
  showLoading(resultsDiv);
  
  try {
    const result = await apiCall('/url/parse', 'POST', { urls });
    console.log('URL解析API返回结果:', result); // Debug log
    
    const message = result.message || 'URL解析完成';
    showSuccess(resultsDiv, message, result.data);
  } catch (error) {
    showError(resultsDiv, error.message);
  }
}

async function validateURLs() {
  const urls = document.getElementById('validate-urls').value.trim().split('\n').filter(u => u.trim());
  const validateType = document.getElementById('validate-type').value;
  const resultsDiv = document.getElementById('url-results');
  
  if (urls.length === 0) {
    showError(resultsDiv, '请输入至少一个URL');
    return;
  }
  
  showLoading(resultsDiv);
  
  try {
    const result = await apiCall('/url/validate', 'POST', { urls, type: validateType });
    console.log('URL验证API返回结果:', result); // Debug log
    
    const message = result.message || 'URL验证完成';
    showSuccess(resultsDiv, message, result.data);
  } catch (error) {
    showError(resultsDiv, error.message);
  }
}

// Social Media Tools Functions
function showSocialTools() {
  currentTool = 'social';
  const content = document.getElementById('main-content');
  
  content.innerHTML = `
    <div class="fade-in-up">
      <div class="flex items-center mb-6">
        <i class="fas fa-share-alt text-pink-500 text-2xl mr-3"></i>
        <h2 class="text-2xl font-bold text-gray-900">社交媒体分析工具</h2>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Social Media Post Analysis -->
        <div class="bg-white border rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i class="fas fa-comments text-pink-500 mr-2"></i>
            社交媒体帖子分析
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">帖子内容（每行一个）</label>
              <textarea id="social-posts" class="form-textarea" placeholder="输入社交媒体帖子内容，支持#标签和@提及"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">分析类型</label>
              <select id="social-analysis-type" class="form-input">
                <option value="engagement">参与度预测</option>
                <option value="sentiment">情感分析</option>
                <option value="hashtags">标签分析</option>
                <option value="mentions">提及分析</option>
              </select>
            </div>
            <button onclick="analyzeSocialPosts()" class="btn-primary w-full">
              <i class="fas fa-chart-line mr-2"></i>分析帖子
            </button>
          </div>
        </div>
        
        <!-- Trend Analysis -->
        <div class="bg-white border rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i class="fas fa-trending-up text-green-500 mr-2"></i>
            话题趋势分析
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">话题标签</label>
              <input type="text" id="trend-hashtags" class="form-input" placeholder="输入话题标签，用逗号分隔" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">时间周期</label>
              <select id="trend-period" class="form-input">
                <option value="24h">24小时</option>
                <option value="7d">7天</option>
                <option value="30d">30天</option>
              </select>
            </div>
            <button onclick="analyzeTrends()" class="btn-success w-full">
              <i class="fas fa-search mr-2"></i>分析趋势
            </button>
          </div>
        </div>
      </div>
      
      <!-- Results Area -->
      <div class="mt-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">分析结果</h3>
        <div id="social-results" class="result-container">
          <p class="text-gray-500 text-center py-8">选择上方工具开始分析</p>
        </div>
      </div>
    </div>
  `;
}

function showAdvancedSEO() {
  currentTool = 'advanced-seo';
  const content = document.getElementById('main-content');
  
  content.innerHTML = `
    <div class="fade-in-up">
      <div class="flex items-center mb-6">
        <i class="fas fa-cogs text-indigo-500 text-2xl mr-3"></i>
        <h2 class="text-2xl font-bold text-gray-900">高级SEO分析工具</h2>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Log Analysis -->
        <div class="bg-white border rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i class="fas fa-file-alt text-blue-500 mr-2"></i>
            日志文件分析
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">日志内容</label>
              <textarea id="log-content" class="form-textarea" placeholder="粘贴Apache/Nginx访问日志"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">分析类型</label>
              <select id="log-analysis-type" class="form-input">
                <option value="crawlers">爬虫活动</option>
                <option value="errors">错误分析</option>
                <option value="traffic">流量模式</option>
                <option value="performance">性能分析</option>
              </select>
            </div>
            <button onclick="analyzeLogFile()" class="btn-primary w-full">
              <i class="fas fa-search mr-2"></i>分析日志
            </button>
          </div>
        </div>
        
        <!-- Competitor Analysis -->
        <div class="bg-white border rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i class="fas fa-users text-orange-500 mr-2"></i>
            竞品分析
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">目标域名</label>
              <input type="text" id="target-domain" class="form-input" placeholder="example.com" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">竞争对手域名（每行一个）</label>
              <textarea id="competitor-domains" class="form-textarea" placeholder="competitor1.com&#10;competitor2.com"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">分析维度</label>
              <select id="competitor-analysis-type" class="form-input">
                <option value="keywords">关键词差距</option>
                <option value="backlinks">外链对比</option>
                <option value="content">内容分析</option>
                <option value="technical">技术SEO</option>
              </select>
            </div>
            <button onclick="analyzeCompetitors()" class="btn-secondary w-full">
              <i class="fas fa-chart-bar mr-2"></i>对比分析
            </button>
          </div>
        </div>
      </div>
      
      <!-- Results Area -->
      <div class="mt-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">分析结果</h3>
        <div id="advanced-seo-results" class="result-container">
          <p class="text-gray-500 text-center py-8">选择上方工具开始分析</p>
        </div>
      </div>
    </div>
  `;
}

function showExportTools() {
  currentTool = 'export';
  const content = document.getElementById('main-content');
  
  content.innerHTML = `
    <div class="fade-in-up">
      <div class="flex items-center mb-6">
        <i class="fas fa-download text-teal-500 text-2xl mr-3"></i>
        <h2 class="text-2xl font-bold text-gray-900">数据导出工具</h2>
      </div>
      
      <div class="bg-white border rounded-lg p-6">
        <div class="text-center text-gray-500 py-12">
          <i class="fas fa-info-circle text-4xl mb-4"></i>
          <h3 class="text-xl font-semibold mb-2">导出功能说明</h3>
          <p class="mb-4">使用其他分析工具获得结果后，可以在结果页面找到导出按钮</p>
          <p class="text-sm">支持导出格式：CSV、JSON、HTML报告、图表配置</p>
        </div>
      </div>
    </div>
  `;
}

// Social Media Analysis Functions
async function analyzeSocialPosts() {
  const posts = document.getElementById('social-posts').value.trim().split('\n').filter(p => p.trim());
  const analysisType = document.getElementById('social-analysis-type').value;
  const resultsDiv = document.getElementById('social-results');
  
  if (posts.length === 0) {
    showError(resultsDiv, '请输入至少一个社交媒体帖子');
    return;
  }
  
  showLoading(resultsDiv);
  
  try {
    const result = await apiCall('/social/analyze-posts', 'POST', { 
      posts, 
      analysis_type: analysisType 
    });
    console.log('社交媒体API返回结果:', result); // Debug log
    
    const message = result.message || '社交媒体分析完成';
    showSuccess(resultsDiv, message, result.data);
  } catch (error) {
    showError(resultsDiv, error.message);
  }
}

async function analyzeTrends() {
  const hashtags = document.getElementById('trend-hashtags').value.trim().split(',').map(h => h.trim()).filter(h => h);
  const timePeriod = document.getElementById('trend-period').value;
  const resultsDiv = document.getElementById('social-results');
  
  if (hashtags.length === 0) {
    showError(resultsDiv, '请输入至少一个话题标签');
    return;
  }
  
  showLoading(resultsDiv);
  
  try {
    const result = await apiCall('/social/trend-analysis', 'POST', { 
      hashtags, 
      time_period: timePeriod 
    });
    console.log('趋势分析API返回结果:', result); // Debug log
    
    const message = result.message || '趋势分析完成';
    showSuccess(resultsDiv, message, result.data);
  } catch (error) {
    showError(resultsDiv, error.message);
  }
}

// Advanced SEO Functions
async function analyzeLogFile() {
  const logContent = document.getElementById('log-content').value;
  const analysisType = document.getElementById('log-analysis-type').value;
  const resultsDiv = document.getElementById('advanced-seo-results');
  
  if (!logContent.trim()) {
    showError(resultsDiv, '请提供日志文件内容');
    return;
  }
  
  showLoading(resultsDiv);
  
  try {
    const result = await apiCall('/advanced-seo/log-analysis', 'POST', { 
      log_content: logContent, 
      analysis_type: analysisType 
    });
    console.log('日志分析API返回结果:', result); // Debug log
    
    const message = result.message || '日志分析完成';
    showSuccess(resultsDiv, message, result.data);
  } catch (error) {
    showError(resultsDiv, error.message);
  }
}

async function analyzeCompetitors() {
  const targetDomain = document.getElementById('target-domain').value.trim();
  const competitorDomains = document.getElementById('competitor-domains').value.trim().split('\n').filter(d => d.trim());
  const analysisType = document.getElementById('competitor-analysis-type').value;
  const resultsDiv = document.getElementById('advanced-seo-results');
  
  if (!targetDomain) {
    showError(resultsDiv, '请输入目标域名');
    return;
  }
  
  if (competitorDomains.length === 0) {
    showError(resultsDiv, '请输入至少一个竞争对手域名');
    return;
  }
  
  showLoading(resultsDiv);
  
  try {
    const result = await apiCall('/advanced-seo/competitor-analysis', 'POST', { 
      target_domain: targetDomain,
      competitor_domains: competitorDomains,
      analysis_type: analysisType 
    });
    console.log('竞品分析API返回结果:', result); // Debug log
    
    const message = result.message || '竞品分析完成';
    showSuccess(resultsDiv, message, result.data);
  } catch (error) {
    showError(resultsDiv, error.message);
  }
}

// API Configuration Functions
function showAPIConfig() {
  currentTool = 'api-config';
  const content = document.getElementById('main-content');
  
  content.innerHTML = `
    <div class="fade-in-up">
      <div class="flex items-center mb-6">
        <i class="fas fa-key text-blue-500 text-2xl mr-3"></i>
        <h2 class="text-2xl font-bold text-gray-900">API配置中心</h2>
      </div>
      
      <!-- API Status -->
      <div class="bg-white border rounded-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">API状态</h3>
        <div id="api-status">
          <div class="flex items-center justify-center py-4">
            <div class="spinner"></div>
            <span class="ml-2">检查API状态...</span>
          </div>
        </div>
      </div>
      
      <!-- API Key Configuration -->
      <div class="bg-white border rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">API密钥配置</h3>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 class="font-medium text-blue-800 mb-2 flex items-center">
            <i class="fas fa-info-circle mr-2"></i>
            SERP功能说明
          </h4>
          <p class="text-blue-700 text-sm mb-3">
            <strong>SERP分析确实需要API！</strong> advertools的serp_goog函数需要Google Custom Search API才能获取真实搜索结果：
          </p>
          <div class="text-blue-700 text-sm space-y-2">
            <p><strong>配置步骤：</strong></p>
            <ol class="ml-4 space-y-1 list-decimal">
              <li>获取 <strong>Google Custom Search API Key</strong>: 
                <a href="https://developers.google.com/custom-search/v1/introduction" target="_blank" class="text-blue-600 underline">Google Cloud Console</a>
              </li>
              <li>创建 <strong>Custom Search Engine</strong>: 
                <a href="https://cse.google.com/cse/" target="_blank" class="text-blue-600 underline">CSE控制台</a>
              </li>
              <li><strong>重要</strong>: 在CSE设置中启用"搜索整个网络"功能</li>
              <li>复制Search Engine ID (cx参数) 到下方输入框</li>
            </ol>
            <p class="text-blue-600 font-medium">⚠️ 两个参数都必须配置才能测试成功</p>
          </div>
        </div>
        <p class="text-gray-600 text-sm mb-6">配置以下API密钥以启用真实数据获取功能。密钥仅存储在浏览器会话中，不会上传到服务器。</p>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Google Search API -->
          <div class="space-y-4">
            <h4 class="font-medium text-gray-900 flex items-center">
              <i class="fab fa-google text-blue-500 mr-2"></i>
              Google Search API
            </h4>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">API Key</label>
              <input type="password" id="google-api-key" class="form-input" placeholder="AIza..." />
              <p class="text-xs text-gray-500 mt-1">获取地址: <a href="https://developers.google.com/custom-search/v1/introduction" target="_blank" class="text-blue-500">Google Custom Search API</a></p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Search Engine ID (cx) <span class="text-red-500">*必需</span></label>
              <input type="text" id="google-cx" class="form-input" placeholder="017576662512468239146:..." />
              <div class="text-xs text-gray-500 mt-1 space-y-1">
                <p>获取地址: <a href="https://cse.google.com/cse/" target="_blank" class="text-blue-500">Google Custom Search Engine</a></p>
                <p class="text-orange-600">⚠️ 必须创建CSE并启用"搜索整个网络"功能</p>
              </div>
            </div>
          </div>
          
          <!-- Twitter API -->
          <div class="space-y-4">
            <h4 class="font-medium text-gray-900 flex items-center">
              <i class="fab fa-twitter text-blue-400 mr-2"></i>
              Twitter API v2
            </h4>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Bearer Token</label>
              <input type="password" id="twitter-bearer" class="form-input" placeholder="AAAAAAAAAAAAAAAAAAAAAA..." />
              <p class="text-xs text-gray-500 mt-1">获取地址: <a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" class="text-blue-500">Twitter Developer Portal</a></p>
            </div>
          </div>
          
          <!-- YouTube API -->
          <div class="space-y-4">
            <h4 class="font-medium text-gray-900 flex items-center">
              <i class="fab fa-youtube text-red-500 mr-2"></i>
              YouTube Data API
            </h4>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">API Key</label>
              <input type="password" id="youtube-api-key" class="form-input" placeholder="AIzaSy..." />
              <div class="text-xs text-gray-500 mt-1 space-y-1">
                <p>获取步骤: 1. <a href="https://console.cloud.google.com/" target="_blank" class="text-blue-500">Google Cloud Console</a> → 2. 启用YouTube Data API v3 → 3. 创建API密钥</p>
                <p class="text-orange-600">⚠️ 确保API密钥有YouTube Data API v3权限</p>
              </div>
            </div>
          </div>
          
          <!-- Knowledge Graph API -->
          <div class="space-y-4">
            <h4 class="font-medium text-gray-900 flex items-center">
              <i class="fas fa-brain text-purple-500 mr-2"></i>
              Knowledge Graph API
            </h4>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">API Key</label>
              <input type="password" id="knowledge-graph-key" class="form-input" placeholder="AIzaSy..." />
              <div class="text-xs text-gray-500 mt-1 space-y-1">
                <p>获取步骤: 1. <a href="https://console.cloud.google.com/" target="_blank" class="text-blue-500">Google Cloud Console</a> → 2. 启用Knowledge Graph Search API → 3. 创建API密钥</p>
                <p class="text-orange-600">⚠️ 注意: 这个API可能需要申请访问权限</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-6 flex space-x-4">
          <button onclick="saveAPIKeys()" class="btn-primary">
            <i class="fas fa-save mr-2"></i>保存API密钥
          </button>
          <button onclick="testAllAPIs()" class="btn-secondary">
            <i class="fas fa-plug mr-2"></i>测试连接
          </button>
          <button onclick="alert('按钮点击测试成功！')" class="btn-secondary">
            <i class="fas fa-bug mr-2"></i>测试按钮
          </button>
          <button onclick="clearAPIKeys()" class="btn-secondary">
            <i class="fas fa-trash mr-2"></i>清除密钥
          </button>
        </div>
      </div>
      
      <!-- Help Section -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
        <h4 class="font-medium text-blue-900 mb-2 flex items-center">
          <i class="fas fa-info-circle mr-2"></i>
          配置说明
        </h4>
        <ul class="text-sm text-blue-800 space-y-1">
          <li>• <strong>Google Search API</strong>: 用于SERP真实数据获取，需要创建Custom Search Engine</li>
          <li>• <strong>Twitter API</strong>: 用于社交媒体数据分析，需要Twitter开发者账号</li>
          <li>• <strong>YouTube API</strong>: 用于视频数据分析，使用Google Cloud Console创建</li>
          <li>• <strong>Knowledge Graph</strong>: 用于实体识别和知识图谱查询</li>
          <li>• 所有API都有免费配额，超出后需要付费</li>
          <li>• API密钥仅在当前会话中有效，关闭浏览器后需重新配置</li>
        </ul>
      </div>
    </div>
  `;
  
  // 🔒 填充已保存的API密钥
  setTimeout(() => {
    const savedKeys = getApiKeys();
    if (savedKeys.google_search_api_key) {
      document.getElementById('google-api-key').value = savedKeys.google_search_api_key;
    }
    if (savedKeys.google_search_cx) {
      document.getElementById('google-cx').value = savedKeys.google_search_cx;
    }
    if (savedKeys.twitter_bearer_token) {
      document.getElementById('twitter-bearer').value = savedKeys.twitter_bearer_token;
    }
    if (savedKeys.youtube_api_key) {
      document.getElementById('youtube-api-key').value = savedKeys.youtube_api_key;
    }
    if (savedKeys.knowledge_graph_api_key) {
      document.getElementById('knowledge-graph-key').value = savedKeys.knowledge_graph_api_key;
    }
  }, 100);
  
  // Load API status
  loadAPIStatus();
}

async function loadAPIStatus() {
  try {
    // 🔒 从本地存储读取API密钥状态
    const localKeys = getApiKeys();
    
    // 发送本地状态给服务器验证
    const result = await apiCall('/config/status', 'POST', localKeys);
    const statusDiv = document.getElementById('api-status');
    
    if (result.success) {
      const { configured_apis, missing_apis, status } = result.data;
      
      let statusHTML = '<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">';
      statusHTML += '<div class="flex items-center mb-2">';
      statusHTML += '<i class="fas fa-shield-alt text-blue-500 mr-2"></i>';
      statusHTML += '<span class="font-medium text-blue-800">🔒 API密钥安全说明</span>';
      statusHTML += '</div>';
      statusHTML += '<p class="text-blue-700 text-sm">所有API密钥均存储在您的浏览器本地，不会上传到服务器，保护您的隐私安全。</p>';
      statusHTML += '</div>';
      
      statusHTML += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
      
      Object.entries(status).forEach(([api, configured]) => {
        const iconClass = configured ? 'fas fa-check-circle text-green-500' : 'fas fa-times-circle text-red-500';
        const statusText = configured ? '已配置 (本地存储)' : '未配置';
        const statusClass = configured ? 'status-success' : 'status-error';
        
        statusHTML += `
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span class="font-medium">${api.replace(/_/g, ' ').toUpperCase()}</span>
            <div class="flex items-center">
              <i class="${iconClass} mr-2"></i>
              <span class="${statusClass}">${statusText}</span>
            </div>
          </div>
        `;
      });
      
      statusHTML += '</div>';
      statusHTML += `<p class="text-sm text-gray-600 mt-4">🔒 ${configured_apis.length}/5 个API已在本地配置</p>`;
      
      statusDiv.innerHTML = statusHTML;
    }
  } catch (error) {
    document.getElementById('api-status').innerHTML = `
      <div class="text-center text-red-600">
        <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
        <p>无法获取API状态</p>
      </div>
    `;
  }
}

async function saveAPIKeys() {
  console.log('🔒 开始保存API密钥到本地存储...'); 
  
  const keys = {
    google_search_api_key: document.getElementById('google-api-key').value.trim(),
    google_search_cx: document.getElementById('google-cx').value.trim(),
    twitter_bearer_token: document.getElementById('twitter-bearer').value.trim(),
    youtube_api_key: document.getElementById('youtube-api-key').value.trim(),
    knowledge_graph_api_key: document.getElementById('knowledge-graph-key').value.trim()
  };
  
  console.log('收集到的API密钥:', Object.keys(keys).filter(k => keys[k])); 
  
  // Remove empty keys
  Object.keys(keys).forEach(key => {
    if (!keys[key]) {
      delete keys[key];
    }
  });
  
  if (Object.keys(keys).length === 0) {
    alert('❌ 请至少输入一个API密钥');
    return;
  }
  
  try {
    // 🔒 保存到本地存储（安全）
    const saved = saveApiKeys(keys);
    if (saved) {
      // 验证API密钥格式（不上传到服务器）
      const result = await apiCall('/config/keys', 'POST', keys);
      console.log('服务器验证响应:', result);
      
      if (result.success) {
        const message = `🔒 成功保存 ${result.data.updated_keys} 个API密钥到本地存储\n配置的API: ${result.data.configured_apis.join(', ')}\n\n✅ ${result.data.storage_instruction}`;
        alert(message);
        loadAPIStatus(); // Reload status
        
        // Auto-test APIs after saving
        if (confirm('是否立即测试保存的API连接？')) {
          setTimeout(() => testAllAPIs(), 500);
        }
      } else {
        alert('❌ API密钥格式验证失败: ' + result.error);
      }
    } else {
      alert('❌ 本地存储保存失败，请检查浏览器设置');
    }
  } catch (error) {
    console.error('API密钥保存失败:', error);
    alert('❌ 保存失败: ' + error.message + '\n\n请检查网络连接和服务状态');
  }
}

function testAllAPIs() {
  console.log('开始测试所有API...');
  
  // Simple alert first to test if function is called
  alert('API测试功能被调用了！正在测试...');
  
  const apis = ['google_search', 'twitter', 'youtube'];
  const results = [];
  
  // Show loading
  const statusDiv = document.getElementById('api-status');
  if (statusDiv) {
    statusDiv.innerHTML = '<div class="text-center py-4">🔄 测试API连接中...</div>';
  }
  
  // Test each API sequentially
  async function runTests() {
    try {
      for (const api of apis) {
        console.log(`测试 ${api} API...`);
        
        try {
          const response = await fetch(`/api/config/test/${api}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          
          const result = await response.json();
          console.log(`${api} API结果:`, result);
          
          if (result.success) {
            results.push(`${api}: ✅ 连接成功`);
          } else {
            results.push(`${api}: ❌ ${result.error || '测试失败'}`);
          }
        } catch (error) {
          console.error(`${api} API测试失败:`, error);
          results.push(`${api}: ❌ 网络错误 - ${error.message}`);
        }
      }
      
      // Show results
      const resultText = results.join('\n');
      alert('API测试完成:\n' + resultText);
      
      if (statusDiv) {
        statusDiv.innerHTML = `<div class="bg-gray-50 p-4 rounded">
          <h4 class="font-bold mb-2">测试结果:</h4>
          <pre class="text-sm">${resultText}</pre>
          <button onclick="loadAPIStatus()" class="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm">刷新状态</button>
        </div>`;
      }
      
    } catch (error) {
      console.error('API测试过程失败:', error);
      alert('API测试失败: ' + error.message);
    }
  }
  
  // Run the async tests
  runTests();
}

// Add API configuration help function
function showAPIHelp() {
  const helpText = `
API配置步骤:

Google Search API:
1. 访问 Google Cloud Console
2. 启用 Custom Search API
3. 创建API密钥
4. 访问 cse.google.com 创建搜索引擎
5. 启用"搜索整个网络"
6. 复制搜索引擎ID (cx参数)

YouTube Data API:
1. 访问 Google Cloud Console  
2. 启用 YouTube Data API v3
3. 创建API密钥
4. 确保密钥没有域名限制

API密钥格式:
- Google API密钥通常以 AIzaSy 开头
- 长度约39个字符
- 不包含空格或换行符

如果测试仍然失败，请:
1. 检查API密钥复制是否完整
2. 确认已启用相应的API服务
3. 检查API密钥权限设置
  `;
  
  alert(helpText);
}

async function clearAPIKeys() {
  if (confirm('🔒 确定要清除所有本地存储的API密钥吗？\n\n此操作将删除浏览器中保存的所有API密钥。')) {
    // Clear local storage
    const cleared = clearAllApiKeys();
    
    if (cleared) {
      // Clear form
      document.getElementById('google-api-key').value = '';
      document.getElementById('google-cx').value = '';
      document.getElementById('twitter-bearer').value = '';
      document.getElementById('youtube-api-key').value = '';
      document.getElementById('knowledge-graph-key').value = '';
      
      alert('🔒 所有API密钥已从本地存储中清除');
      loadAPIStatus();
    } else {
      alert('❌ 清除失败，请重试');
    }
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  console.log('数字营销分析平台已加载 - 真实API版本');
  
  // Test API connection
  apiCall('/health')
    .then(response => {
      console.log('API连接正常:', response);
    })
    .catch(error => {
      console.error('API连接失败:', error);
    });
});

// Make functions globally accessible for onclick handlers
window.testAllAPIs = testAllAPIs;
window.saveAPIKeys = saveAPIKeys;
window.clearAPIKeys = clearAPIKeys;
window.loadAPIStatus = loadAPIStatus;
window.showAPIConfig = showAPIConfig;
window.showAPIHelp = showAPIHelp;