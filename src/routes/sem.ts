// SEM Marketing API Routes
import { Hono } from 'hono';
import type { 
  KeywordRequest, 
  AdRequest,
  ApiResponse,
  KeywordResult,
  AdResult
} from '../types/api';
import { 
  generateKeywordCombinations, 
  createAdFromTemplate 
} from '../utils/helpers';

const sem = new Hono();

// Keyword Generator
sem.post('/keywords', async (c) => {
  try {
    const body = await c.req.json<KeywordRequest>();
    const { seeds, modifiers = [] } = body;
    
    if (!seeds || seeds.length === 0) {
      return c.json<ApiResponse>({
        success: false,
        error: '请提供至少一个种子关键词'
      }, 400);
    }
    
    // Filter empty seeds and modifiers
    const validSeeds = seeds.filter(seed => seed.trim());
    const validModifiers = modifiers.filter(mod => mod.trim());
    
    if (validSeeds.length === 0) {
      return c.json<ApiResponse>({
        success: false,
        error: '请提供有效的种子关键词'
      }, 400);
    }
    
    // Generate keyword combinations
    const keywords = generateKeywordCombinations(validSeeds, validModifiers);
    
    // Add some common SEM modifiers for better results
    const commonModifiers = [
      '购买', '价格', '怎么样', '哪家好', '推荐', '评价', '多少钱',
      '官网', '品牌', '厂家', '销售', '服务', '咨询', '免费'
    ];
    
    const enhancedKeywords = generateKeywordCombinations(validSeeds, [...validModifiers, ...commonModifiers]);
    
    // Create result objects with metadata
    const results: KeywordResult[] = enhancedKeywords.map(keyword => {
      const words = keyword.split(' ');
      const seed = validSeeds.find(s => keyword.includes(s)) || validSeeds[0];
      const modifier = words.find(word => !validSeeds.includes(word) && word !== seed);
      
      return {
        keyword,
        seed,
        modifier,
        length: keyword.length
      };
    });
    
    // Sort by relevance (shorter keywords first, then alphabetically)
    results.sort((a, b) => {
      if (a.length !== b.length) {
        return a.length - b.length;
      }
      return a.keyword.localeCompare(b.keyword);
    });
    
    return c.json<ApiResponse<KeywordResult[]>>({
      success: true,
      data: results.slice(0, 500), // Limit to 500 keywords
      message: `成功生成 ${Math.min(results.length, 500)} 个关键词`
    });
    
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : '关键词生成失败'
    }, 500);
  }
});

// Ad Creator
sem.post('/ads', async (c) => {
  try {
    const body = await c.req.json<AdRequest>();
    const { product_name, template, max_length = 30 } = body;
    
    if (!product_name?.trim()) {
      return c.json<ApiResponse>({
        success: false,
        error: '请提供产品或服务名称'
      }, 400);
    }
    
    if (!template?.trim()) {
      return c.json<ApiResponse>({
        success: false,
        error: '请提供广告模板'
      }, 400);
    }
    
    if (!template.includes('{product}')) {
      return c.json<ApiResponse>({
        success: false,
        error: '广告模板必须包含 {product} 占位符'
      }, 400);
    }
    
    // Generate multiple ad variations
    const variations = [
      template,
      template + ' - 立即咨询',
      template + ' - 免费试用',
      template + ' - 专业服务',
      '专业' + template,
      '优质' + template,
      '品牌' + template
    ];
    
    const results: AdResult[] = variations.map(tpl => {
      const ad = createAdFromTemplate(tpl, product_name, max_length);
      const originalLength = tpl.replace(/\{product\}/gi, product_name).length;
      
      return {
        headline: ad,
        description: `基于模板生成的广告文案，产品：${product_name}`,
        length: ad.length,
        truncated: originalLength > max_length
      };
    });
    
    // Add some predefined ad templates for better results
    const predefinedTemplates = [
      '{product} - 品质保证，值得信赖',
      '专业{product}服务，立即咨询',
      '{product}优惠促销中，限时特价',
      '选择{product}，选择品质生活',
      '{product}解决方案，专业团队',
      '高品质{product}，用户首选'
    ];
    
    predefinedTemplates.forEach(tpl => {
      if (results.length < 20) { // Limit total results
        const ad = createAdFromTemplate(tpl, product_name, max_length);
        const originalLength = tpl.replace(/\{product\}/gi, product_name).length;
        
        results.push({
          headline: ad,
          description: `预设模板生成的广告文案`,
          length: ad.length,
          truncated: originalLength > max_length
        });
      }
    });
    
    // Remove duplicates and sort by length
    const uniqueResults = results.filter((result, index, self) => 
      index === self.findIndex(r => r.headline === result.headline)
    );
    
    uniqueResults.sort((a, b) => a.length - b.length);
    
    return c.json<ApiResponse<AdResult[]>>({
      success: true,
      data: uniqueResults,
      message: `成功生成 ${uniqueResults.length} 个广告文案变体`
    });
    
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : '广告文案生成失败'
    }, 500);
  }
});

// Batch Ad Creation (bonus feature)
sem.post('/ads/batch', async (c) => {
  try {
    const body = await c.req.json<{
      products: string[];
      template: string;
      max_length?: number;
    }>();
    
    const { products, template, max_length = 30 } = body;
    
    if (!products || products.length === 0) {
      return c.json<ApiResponse>({
        success: false,
        error: '请提供至少一个产品名称'
      }, 400);
    }
    
    if (!template?.trim() || !template.includes('{product}')) {
      return c.json<ApiResponse>({
        success: false,
        error: '请提供包含 {product} 占位符的广告模板'
      }, 400);
    }
    
    const allResults: (AdResult & { product: string })[] = [];
    
    products.forEach(product => {
      if (product.trim()) {
        const ad = createAdFromTemplate(template, product, max_length);
        const originalLength = template.replace(/\{product\}/gi, product).length;
        
        allResults.push({
          product: product.trim(),
          headline: ad,
          description: `批量生成的广告文案，产品：${product}`,
          length: ad.length,
          truncated: originalLength > max_length
        });
      }
    });
    
    return c.json<ApiResponse>({
      success: true,
      data: allResults,
      message: `成功为 ${allResults.length} 个产品生成广告文案`
    });
    
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : '批量广告文案生成失败'
    }, 500);
  }
});

export { sem };