import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  API_KEYS: KVNamespace;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS
app.use('/api/*', cors())

// Import all route modules
import { seo } from './routes/seo'
import { sem } from './routes/sem'
import { text } from './routes/text'
import { url } from './routes/url'
import { social } from './routes/social'
import { advancedSeo } from './routes/advanced-seo'
import { exportRouter } from './routes/export'
import { apiConfig } from './routes/api-config'

// Route handlers
app.route('/api/seo', seo)
app.route('/api/sem', sem)
app.route('/api/text', text)
app.route('/api/url', url)
app.route('/api/social', social)
app.route('/api/advanced-seo', advancedSeo)
app.route('/api/export', exportRouter)
app.route('/api/config', apiConfig)

// Handle favicon.ico
app.get('/favicon.ico', (c) => {
  return new Response(null, { status: 204 })
})

// Default route
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Advertools 网页应用</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <link href="/static/styles.css" rel="stylesheet" />
      </head>
      <body class="bg-gray-50">
        <div class="min-h-screen">
          <!-- Header -->
          <header class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="flex justify-between items-center h-16">
                <div class="flex items-center">
                  <i class="fas fa-chart-line text-2xl text-blue-600 mr-3"></i>
                  <h1 class="text-xl font-bold text-gray-900">Advertools 网页应用</h1>
                </div>
                <nav class="hidden md:flex space-x-8">
                  <button class="nav-btn text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium" data-section="seo">SEO工具</button>
                  <button class="nav-btn text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium" data-section="sem">SEM工具</button>
                  <button class="nav-btn text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium" data-section="text">文本分析</button>
                  <button class="nav-btn text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium" data-section="url">URL工具</button>
                  <button class="nav-btn text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium" data-section="social">社交媒体</button>
                  <button class="nav-btn text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium" data-section="advanced">高级SEO</button>
                  <button class="nav-btn text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium" data-section="api-config">API配置</button>
                  <button class="nav-btn text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium" data-section="export">导出工具</button>
                </nav>
              </div>
            </div>
          </header>

          <!-- Main Content -->
          <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div id="app">
              <!-- Content loaded dynamically -->
            </div>
          </main>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
      </body>
    </html>
  `)
})

export default app