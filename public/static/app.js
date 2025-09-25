// Digital Marketing Analytics Platform - Frontend JavaScript

// Global state
let currentTool = null;
let isLoading = false;

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
      content += formatResults(data);
    }
    
    element.innerHTML = content;
  }
}

function formatResults(data) {
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return '<p class="text-gray-500 text-center py-4">没有找到结果</p>';
    }
    
    // Create table for array data
    const headers = Object.keys(data[0] || {});
    if (headers.length === 0) return '<p class="text-gray-500 text-center py-4">数据格式错误</p>';
    
    let table = '<div class="result-table"><table class="w-full">';
    table += '<thead><tr>';
    headers.forEach(header => {
      table += `<th>${header}</th>`;
    });
    table += '</tr></thead><tbody>';
    
    data.slice(0, 50).forEach(row => { // Limit to 50 rows for display
      table += '<tr>';
      headers.forEach(header => {
        const value = row[header] || '';
        const displayValue = typeof value === 'string' && value.length > 50 
          ? value.substring(0, 50) + '...' 
          : value;
        table += `<td>${displayValue}</td>`;
      });
      table += '</tr>';
    });
    
    table += '</tbody></table></div>';
    
    if (data.length > 50) {
      table += `<p class="text-sm text-gray-500 mt-2 text-center">显示前50条结果，共${data.length}条</p>`;
    }
    
    return table;
  } else if (typeof data === 'object') {
    // Display object as key-value pairs
    let content = '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
    Object.entries(data).forEach(([key, value]) => {
      content += `
        <div class="bg-gray-50 p-3 rounded">
          <span class="font-medium text-gray-700">${key}:</span>
          <span class="text-gray-900 ml-2">${value}</span>
        </div>
      `;
    });
    content += '</div>';
    return content;
  }
  
  return `<pre class="bg-gray-100 p-4 rounded text-sm overflow-x-auto">${JSON.stringify(data, null, 2)}</pre>`;
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
    showSuccess(resultsDiv, '网站爬取完成', result);
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
    const result = await apiCall('/seo/serp', 'POST', { keyword, count: parseInt(count) });
    showSuccess(resultsDiv, 'SERP分析完成', result);
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
    showSuccess(resultsDiv, 'Sitemap分析完成', result);
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
    showSuccess(resultsDiv, 'Robots.txt分析完成', result);
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
    showSuccess(resultsDiv, '关键词生成完成', result);
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
    showSuccess(resultsDiv, '广告文案创建完成', result);
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
    showSuccess(resultsDiv, '词频分析完成', result);
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
    showSuccess(resultsDiv, '实体提取完成', result);
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
    showSuccess(resultsDiv, 'URL解析完成', result);
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
    showSuccess(resultsDiv, 'URL验证完成', result);
  } catch (error) {
    showError(resultsDiv, error.message);
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  console.log('数字营销分析平台已加载');
  
  // Test API connection
  apiCall('/health')
    .then(response => {
      console.log('API连接正常:', response);
    })
    .catch(error => {
      console.error('API连接失败:', error);
    });
});