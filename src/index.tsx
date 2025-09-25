import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer } from './renderer'

// Import API routes
import { seo } from './routes/seo'
import { sem } from './routes/sem'
import { text } from './routes/text'
import { url } from './routes/url'

const app = new Hono()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// API Routes
app.route('/api/seo', seo)
app.route('/api/sem', sem)
app.route('/api/text', text)
app.route('/api/url', url)

app.use(renderer)

// Main dashboard page
app.get('/', (c) => {
  return c.render(
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <nav class="bg-white shadow-lg border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center">
              <i class="fas fa-chart-line text-2xl text-primary mr-3"></i>
              <h1 class="text-xl font-bold text-gray-900">数字营销分析平台</h1>
            </div>
            <div class="hidden md:flex items-center space-x-6">
              <a href="#seo" class="text-gray-700 hover:text-primary transition-colors">SEO工具</a>
              <a href="#sem" class="text-gray-700 hover:text-primary transition-colors">SEM营销</a>
              <a href="#text" class="text-gray-700 hover:text-primary transition-colors">文本分析</a>
              <a href="#url" class="text-gray-700 hover:text-primary transition-colors">URL工具</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">
            <i class="fas fa-rocket text-primary mr-3"></i>
            全能数字营销分析工具
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            基于advertools Python包构建的Web平台，提供SEO分析、SEM优化、文本挖掘和URL处理等全方位营销工具
          </p>
        </div>

        {/* Main Tool Categories */}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* SEO Tools */}
          <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div class="text-center">
              <div class="bg-gradient-to-r from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-search text-white text-2xl"></i>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">SEO分析工具</h3>
              <p class="text-gray-600 text-sm mb-4">网站爬虫、SERP分析、Sitemap处理</p>
              <button onclick="showSEOTools()" class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors">
                开始分析
              </button>
            </div>
          </div>

          {/* SEM Tools */}
          <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div class="text-center">
              <div class="bg-gradient-to-r from-green-500 to-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-bullseye text-white text-2xl"></i>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">SEM营销工具</h3>
              <p class="text-gray-600 text-sm mb-4">关键词生成、广告文本创建</p>
              <button onclick="showSEMTools()" class="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors">
                创建广告
              </button>
            </div>
          </div>

          {/* Text Analysis */}
          <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div class="text-center">
              <div class="bg-gradient-to-r from-purple-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-file-alt text-white text-2xl"></i>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">文本分析</h3>
              <p class="text-gray-600 text-sm mb-4">词频统计、实体提取、情感分析</p>
              <button onclick="showTextTools()" class="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors">
                分析文本
              </button>
            </div>
          </div>

          {/* URL Tools */}
          <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div class="text-center">
              <div class="bg-gradient-to-r from-orange-500 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-link text-white text-2xl"></i>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">URL分析工具</h3>
              <p class="text-gray-600 text-sm mb-4">URL解析、批量处理、质量检测</p>
              <button onclick="showURLTools()" class="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors">
                处理URL
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div id="main-content" class="bg-white rounded-xl shadow-lg p-8">
          <div class="text-center text-gray-500">
            <i class="fas fa-mouse-pointer text-4xl mb-4"></i>
            <p class="text-xl">选择上方的工具开始分析</p>
            <p class="text-sm mt-2">点击任意工具卡片来开始使用相应的分析功能</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div class="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-white rounded-lg p-6 text-center shadow-md">
            <div class="text-2xl font-bold text-blue-500">15+</div>
            <div class="text-sm text-gray-600">SEO分析功能</div>
          </div>
          <div class="bg-white rounded-lg p-6 text-center shadow-md">
            <div class="text-2xl font-bold text-green-500">8+</div>
            <div class="text-sm text-gray-600">SEM营销工具</div>
          </div>
          <div class="bg-white rounded-lg p-6 text-center shadow-md">
            <div class="text-2xl font-bold text-purple-500">12+</div>
            <div class="text-sm text-gray-600">文本分析方法</div>
          </div>
          <div class="bg-white rounded-lg p-6 text-center shadow-md">
            <div class="text-2xl font-bold text-orange-500">6+</div>
            <div class="text-sm text-gray-600">URL处理功能</div>
          </div>
        </div>
      </div>
    </div>
  )
})

// API Routes will be added here
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

export default app
