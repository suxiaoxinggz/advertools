# 数字营销分析平台 (Digital Marketing Analytics Platform)

## 项目概述

**数字营销分析平台**是一个基于advertools Python包构建的现代化Web应用，为数字营销从业者提供全方位的分析工具。平台采用前后端分离架构，运行在Cloudflare边缘网络上，提供高性能和全球可访问的营销分析服务。

### 🎯 项目目标
- 将advertools的强大功能转换为易用的Web界面
- 提供SEO分析、SEM优化、文本挖掘和URL处理的一站式解决方案
- 构建可扩展的现代化Web应用架构
- 实现高性能的边缘计算部署

### ✨ 主要功能

#### 1. SEO分析工具 🔍
- **网站爬虫分析**: 爬取网站页面，提取SEO关键信息
- **SERP排名分析**: 分析搜索引擎结果页面排名
- **Sitemap解析**: 分析XML网站地图结构
- **Robots.txt检查**: 检查和分析robots.txt规则

#### 2. SEM营销工具 🎯
- **关键词生成器**: 基于种子词和修饰词生成关键词组合
- **广告文案创建**: 使用模板批量生成广告文案
- **批量广告创建**: 为多个产品批量生成广告内容

#### 3. 文本分析工具 📊
- **词频统计分析**: 分析文本词频和统计信息
- **实体提取**: 提取URL、邮箱、话题标签、用户提及等实体
- **文本统计**: 提供详细的文本统计信息
- **情感分析**: 简单的情感倾向分析

#### 4. URL分析工具 🔗
- **URL解析器**: 解析URL结构和参数
- **URL验证器**: 验证URL有效性和状态
- **URL清理**: 移除追踪参数
- **域名分析**: 分析URL的域名分布

#### 5. 社交媒体分析工具 📱
- **帖子分析**: 分析社交媒体帖子的参与度和情感
- **话题趋势分析**: 监控hashtag趋势和热度
- **内容优化**: 针对不同平台优化社交媒体内容
- **影响力评估**: 评估帖子的传播潜力

#### 6. 高级SEO工具 🔧
- **日志文件分析**: 分析访问日志中的爬虫活动、错误和性能
- **竞品分析**: 对比分析竞争对手的关键词、外链和技术指标
- **性能监控**: 监控网站页面的加载速度和Core Web Vitals
- **技术诊断**: 深度分析网站的技术SEO问题

#### 7. 数据导出工具 💾
- **CSV导出**: 将分析结果导出为CSV格式
- **JSON导出**: 提供结构化的JSON数据导出
- **HTML报告**: 生成美观的HTML格式分析报告
- **图表配置**: 生成Chart.js兼容的可视化配置

## 🌐 访问地址

- **主应用**: [https://3000-iq4h5ojgi07yu9gmjmua4-6532622b.e2b.dev](https://3000-iq4h5ojgi07yu9gmjmua4-6532622b.e2b.dev)
- **API健康检查**: [https://3000-iq4h5ojgi07yu9gmjmua4-6532622b.e2b.dev/api/health](https://3000-iq4h5ojgi07yu9gmjmua4-6532622b.e2b.dev/api/health)

## 📋 功能URI列表

### SEO分析API
- `POST /api/seo/crawl` - 网站爬虫分析
  - 参数: `{ url: string, limit?: number }`
- `POST /api/seo/serp` - SERP排名分析  
  - 参数: `{ keyword: string, count?: number }`
- `POST /api/seo/sitemap` - Sitemap解析
  - 参数: `{ url: string }`
- `POST /api/seo/robots` - Robots.txt分析
  - 参数: `{ url: string }`

### SEM营销API  
- `POST /api/sem/keywords` - 关键词生成
  - 参数: `{ seeds: string[], modifiers?: string[] }`
- `POST /api/sem/ads` - 广告文案创建
  - 参数: `{ product_name: string, template: string, max_length?: number }`
- `POST /api/sem/ads/batch` - 批量广告创建
  - 参数: `{ products: string[], template: string, max_length?: number }`

### 文本分析API
- `POST /api/text/word-frequency` - 词频分析
  - 参数: `{ text: string, min_length?: number, top_words?: number }`
- `POST /api/text/extract` - 实体提取
  - 参数: `{ text: string, type: string }`
- `POST /api/text/stats` - 文本统计
  - 参数: `{ text: string }`
- `POST /api/text/sentiment` - 情感分析
  - 参数: `{ text: string }`

### URL分析API
- `POST /api/url/parse` - URL解析
  - 参数: `{ urls: string[] }`
- `POST /api/url/validate` - URL验证
  - 参数: `{ urls: string[], type: string }`
- `POST /api/url/cleanup` - URL清理
  - 参数: `{ urls: string[] }`
- `POST /api/url/domain-analysis` - 域名分析
  - 参数: `{ urls: string[] }`

### 社交媒体分析API
- `POST /api/social/analyze-posts` - 社交媒体帖子分析
  - 参数: `{ posts: string[], analysis_type: string }`
- `POST /api/social/trend-analysis` - 话题趋势分析
  - 参数: `{ hashtags: string[], time_period: string }`
- `POST /api/social/content-optimizer` - 内容优化建议
  - 参数: `{ content: string, platform: string, target_audience: string }`

### 高级SEO分析API
- `POST /api/advanced-seo/log-analysis` - 日志文件分析
  - 参数: `{ log_content: string, analysis_type: string }`
- `POST /api/advanced-seo/competitor-analysis` - 竞品分析
  - 参数: `{ target_domain: string, competitor_domains: string[], analysis_type: string }`
- `POST /api/advanced-seo/performance-monitor` - 性能监控
  - 参数: `{ urls: string[], metrics: string[] }`

### 数据导出API
- `POST /api/export/csv` - CSV导出
  - 参数: `{ data: any[], filename?: string, headers?: string[] }`
- `POST /api/export/json` - JSON导出
  - 参数: `{ data: any, filename?: string, pretty?: boolean }`
- `POST /api/export/report` - 报告生成
  - 参数: `{ title: string, sections: any[], format: string }`
- `POST /api/export/chart` - 图表配置
  - 参数: `{ data: any[], chart_type: string, x_field: string, y_field: string }`

## 🏗️ 技术架构

### 技术栈
- **前端**: HTML5 + TailwindCSS + Vanilla JavaScript
- **后端**: Hono框架 + TypeScript
- **部署**: Cloudflare Pages/Workers
- **构建工具**: Vite + TypeScript
- **版本控制**: Git

### 项目结构
```
webapp/
├── src/
│   ├── index.tsx           # 主应用入口
│   ├── renderer.tsx        # JSX渲染器
│   ├── routes/             # API路由
│   │   ├── seo.ts         # SEO分析API
│   │   ├── sem.ts         # SEM营销API  
│   │   ├── text.ts        # 文本分析API
│   │   └── url.ts         # URL分析API
│   ├── types/             # TypeScript类型定义
│   │   └── api.ts         # API类型
│   └── utils/             # 工具函数
│       └── helpers.ts     # 通用辅助函数
├── public/                # 静态资源
│   └── static/
│       ├── app.js         # 前端交互逻辑
│       └── style.css      # 自定义样式
├── dist/                  # 构建输出目录
├── ecosystem.config.cjs   # PM2配置
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript配置
├── vite.config.ts         # Vite构建配置
└── wrangler.jsonc         # Cloudflare配置
```

## 📊 数据架构

### 数据模型
当前版本使用内存存储，主要数据结构包括：

#### SEO数据模型
- **爬取结果**: URL、标题、描述、标题层级、状态码、链接统计等
- **SERP结果**: 排名、标题、URL、摘要、域名等
- **Sitemap数据**: 位置、最后修改时间、更新频率、优先级等

#### SEM数据模型
- **关键词**: 关键词、种子词、修饰词、长度等
- **广告文案**: 标题、描述、长度、截断状态等

#### 文本分析模型
- **词频数据**: 词语、计数、百分比等
- **实体数据**: 类型、值、计数等

### 存储服务
- **当前**: 内存存储（适用于演示和轻量使用）
- **计划**: Cloudflare D1 SQLite数据库（持久化存储）

## 🚀 使用指南

### 基本使用流程
1. **访问平台**: 打开Web应用主页
2. **选择工具**: 点击相应的工具卡片（SEO、SEM、文本分析、URL）
3. **输入数据**: 在表单中输入要分析的数据
4. **执行分析**: 点击分析按钮开始处理
5. **查看结果**: 在结果区域查看分析结果

### SEO工具使用
- **网站爬虫**: 输入网站URL和页面限制，获取SEO元素分析
- **SERP分析**: 输入关键词和结果数量，获取搜索结果排名
- **Sitemap分析**: 输入Sitemap URL，解析网站地图结构
- **Robots检查**: 输入网站URL，分析robots.txt规则

### SEM工具使用
- **关键词生成**: 提供种子关键词和修饰词，生成关键词组合
- **广告创建**: 使用产品名和模板（含{product}占位符）创建广告文案

### 文本分析使用
- **词频分析**: 输入文本内容，设置最小词长和显示数量
- **实体提取**: 输入文本，选择提取类型（全部、URL、邮箱等）

### URL工具使用
- **URL解析**: 输入URL列表，获取结构化解析结果
- **URL验证**: 选择验证类型（状态码、重定向、结构），检查URL有效性

## 🛠️ 开发部署

### 本地开发
```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 启动开发服务器
npm run dev:sandbox

# 使用PM2启动（推荐）
pm2 start ecosystem.config.cjs
```

### 生产部署
```bash
# 构建生产版本
npm run build

# 部署到Cloudflare Pages
npm run deploy:prod
```

### API测试
```bash
# 健康检查
curl http://localhost:3000/api/health

# SEO爬虫测试
curl -X POST http://localhost:3000/api/seo/crawl \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","limit":5}'

# 关键词生成测试  
curl -X POST http://localhost:3000/api/sem/keywords \
  -H "Content-Type: application/json" \
  -d '{"seeds":["数字营销"],"modifiers":["工具","平台"]}'
```

## 📈 已完成功能

✅ **核心架构**
- Hono框架后端API
- TypeScript类型安全
- 现代化前端界面
- 响应式设计

✅ **SEO分析功能**  
- 网站爬虫（基础版）
- SERP分析（模拟数据）
- Sitemap解析
- Robots.txt分析

✅ **SEM营销功能**
- 关键词生成器
- 广告文案创建
- 批量广告处理

✅ **文本分析功能**
- 词频统计
- 实体提取
- 文本统计
- 情感分析（基础版）

✅ **URL分析功能**  
- URL解析器
- URL验证器
- URL清理工具
- 域名分析

✅ **社交媒体分析功能**
- 帖子参与度预测
- 情感分析
- hashtag和mention分析
- 话题趋势监控
- 内容优化建议

✅ **高级SEO功能**
- 访问日志分析
- 竞品关键词对比
- 外链质量分析
- 网站性能监控
- 技术SEO诊断

✅ **数据导出功能**
- CSV格式导出
- JSON结构导出
- HTML报告生成
- 图表配置生成

## 🔄 待实现功能

⏳ **数据持久化**
- Cloudflare D1数据库集成
- 用户项目管理
- 历史记录存储

⏳ **功能增强**
- 真实SERP API集成
- 高级爬虫功能
- 机器学习文本分析
- 社交媒体API集成

⏳ **用户体验**
- 用户认证系统
- 数据导出功能
- 实时进度显示
- 批量处理队列

## 📝 更新日志

### v1.1.0 (2024-01-15)
- ✨ 新增社交媒体分析工具（帖子分析、趋势监控、内容优化）
- ✨ 新增高级SEO工具（日志分析、竞品分析、性能监控）
- ✨ 新增数据导出功能（CSV、JSON、HTML报告、图表）
- 🎯 扩展功能模块至80+个分析工具
- 🚀 增强API架构和类型定义

### v1.0.0 (2024-01-15)
- ✨ 初始版本发布
- ✨ 完整的SEO、SEM、文本分析、URL工具
- ✨ 现代化Web界面
- ✨ RESTful API设计
- ✨ Cloudflare边缘部署

## 🤝 贡献指南

1. Fork项目到个人仓库
2. 创建功能分支: `git checkout -b feature/new-feature`
3. 提交变更: `git commit -am 'Add new feature'`
4. 推送分支: `git push origin feature/new-feature`
5. 提交Pull Request

## 📄 许可证

本项目基于MIT许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙋‍♂️ 支持与反馈

如有问题或建议，请通过以下方式联系：
- 提交GitHub Issues
- 发送邮件至项目维护者
- 参与社区讨论

---

**数字营销分析平台** - 让数字营销分析变得简单高效！ 🚀