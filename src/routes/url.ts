// URL Analysis API Routes
import { Hono } from 'hono';
import type { 
  UrlParseRequest, 
  UrlValidateRequest,
  ApiResponse,
  UrlParseResult,
  UrlValidateResult
} from '../types/api';
import { 
  isValidUrl, 
  parseUrl,
  fetchWithTimeout
} from '../utils/helpers';

const url = new Hono();

// URL Parser
url.post('/parse', async (c) => {
  try {
    const body = await c.req.json<UrlParseRequest>();
    const { urls } = body;
    
    if (!urls || urls.length === 0) {
      return c.json<ApiResponse>({
        success: false,
        error: '请提供至少一个URL'
      }, 400);
    }
    
    if (urls.length > 100) {
      return c.json<ApiResponse>({
        success: false,
        error: 'URL数量不能超过100个'
      }, 400);
    }
    
    // Parse each URL
    const results: UrlParseResult[] = urls.map(url => parseUrl(url.trim()));
    
    // Calculate statistics
    const validUrls = results.filter(r => r.is_valid).length;
    const domains = [...new Set(results.filter(r => r.is_valid).map(r => r.domain))];
    const protocols = [...new Set(results.filter(r => r.is_valid).map(r => r.protocol))];
    
    return c.json<ApiResponse<{
      urls: UrlParseResult[];
      statistics: {
        total_urls: number;
        valid_urls: number;
        invalid_urls: number;
        unique_domains: number;
        protocols: string[];
        domains: string[];
      }
    }>>({
      success: true,
      data: {
        urls: results,
        statistics: {
          total_urls: urls.length,
          valid_urls: validUrls,
          invalid_urls: urls.length - validUrls,
          unique_domains: domains.length,
          protocols: protocols,
          domains: domains.slice(0, 20) // Limit displayed domains
        }
      },
      message: `成功解析 ${urls.length} 个URL，其中 ${validUrls} 个有效`
    });
    
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'URL解析失败'
    }, 500);
  }
});

// URL Validator
url.post('/validate', async (c) => {
  try {
    const body = await c.req.json<UrlValidateRequest>();
    const { urls, type } = body;
    
    if (!urls || urls.length === 0) {
      return c.json<ApiResponse>({
        success: false,
        error: '请提供至少一个URL'
      }, 400);
    }
    
    if (urls.length > 50) {
      return c.json<ApiResponse>({
        success: false,
        error: 'URL数量不能超过50个（验证模式）'
      }, 400);
    }
    
    const results: UrlValidateResult[] = [];
    
    // Validate each URL based on type
    for (const urlStr of urls) {
      const trimmedUrl = urlStr.trim();
      
      if (!trimmedUrl) {
        results.push({
          url: urlStr,
          is_valid: false,
          error: 'URL为空'
        });
        continue;
      }
      
      // Basic structure validation
      if (!isValidUrl(trimmedUrl)) {
        results.push({
          url: urlStr,
          is_valid: false,
          error: 'URL格式无效'
        });
        continue;
      }
      
      if (type === 'structure') {
        // Only check URL structure, no HTTP request
        const parsed = parseUrl(trimmedUrl);
        results.push({
          url: urlStr,
          is_valid: parsed.is_valid,
          error: parsed.is_valid ? undefined : 'URL结构无效'
        });
        continue;
      }
      
      // HTTP status validation or redirect check
      try {
        const response = await fetchWithTimeout(trimmedUrl, 5000);
        
        if (type === 'redirect') {
          // Check for redirects
          const finalUrl = response.url;
          const isRedirected = finalUrl !== trimmedUrl;
          
          results.push({
            url: urlStr,
            is_valid: true,
            status_code: response.status,
            redirect_url: isRedirected ? finalUrl : undefined
          });
        } else {
          // Status code validation
          results.push({
            url: urlStr,
            is_valid: response.status >= 200 && response.status < 400,
            status_code: response.status
          });
        }
        
      } catch (error) {
        results.push({
          url: urlStr,
          is_valid: false,
          error: error instanceof Error ? error.message : '网络请求失败'
        });
      }
    }
    
    const validUrls = results.filter(r => r.is_valid).length;
    const statusCodes = results
      .filter(r => r.status_code)
      .reduce((acc, r) => {
        const code = r.status_code!.toString();
        acc[code] = (acc[code] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    return c.json<ApiResponse<{
      urls: UrlValidateResult[];
      statistics: {
        total_urls: number;
        valid_urls: number;
        invalid_urls: number;
        status_codes: Record<string, number>;
        validation_type: string;
      }
    }>>({
      success: true,
      data: {
        urls: results,
        statistics: {
          total_urls: urls.length,
          valid_urls: validUrls,
          invalid_urls: urls.length - validUrls,
          status_codes: statusCodes,
          validation_type: type
        }
      },
      message: `成功验证 ${urls.length} 个URL，其中 ${validUrls} 个有效`
    });
    
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'URL验证失败'
    }, 500);
  }
});

// URL Cleanup (bonus feature)
url.post('/cleanup', async (c) => {
  try {
    const body = await c.req.json<{ urls: string[] }>();
    const { urls } = body;
    
    if (!urls || urls.length === 0) {
      return c.json<ApiResponse>({
        success: false,
        error: '请提供至少一个URL'
      }, 400);
    }
    
    const cleanedUrls = urls.map(urlStr => {
      try {
        const url = new URL(urlStr.trim());
        
        // Remove common tracking parameters
        const trackingParams = [
          'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
          'gclid', 'fbclid', 'msclkid', '_ga', 'mc_eid', 'mc_cid'
        ];
        
        trackingParams.forEach(param => {
          url.searchParams.delete(param);
        });
        
        // Remove fragment if it's just a tracking fragment
        if (url.hash.startsWith('#utm_') || url.hash.startsWith('#gid=')) {
          url.hash = '';
        }
        
        return {
          original: urlStr,
          cleaned: url.toString(),
          removed_params: trackingParams.filter(param => 
            new URL(urlStr.trim()).searchParams.has(param)
          )
        };
        
      } catch (error) {
        return {
          original: urlStr,
          cleaned: urlStr,
          removed_params: [],
          error: 'URL格式无效'
        };
      }
    });
    
    const totalParamsRemoved = cleanedUrls.reduce((sum, result) => 
      sum + result.removed_params.length, 0
    );
    
    return c.json<ApiResponse>({
      success: true,
      data: cleanedUrls,
      message: `成功清理 ${urls.length} 个URL，移除了 ${totalParamsRemoved} 个追踪参数`
    });
    
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'URL清理失败'
    }, 500);
  }
});

// Domain Analysis (bonus feature)
url.post('/domain-analysis', async (c) => {
  try {
    const body = await c.req.json<{ urls: string[] }>();
    const { urls } = body;
    
    if (!urls || urls.length === 0) {
      return c.json<ApiResponse>({
        success: false,
        error: '请提供至少一个URL'
      }, 400);
    }
    
    const domainStats: Record<string, {
      domain: string;
      count: number;
      urls: string[];
      subdomains: string[];
      protocols: string[];
    }> = {};
    
    urls.forEach(urlStr => {
      try {
        const url = new URL(urlStr.trim());
        const domain = url.hostname;
        const rootDomain = domain.replace(/^www\./, '').split('.').slice(-2).join('.');
        
        if (!domainStats[rootDomain]) {
          domainStats[rootDomain] = {
            domain: rootDomain,
            count: 0,
            urls: [],
            subdomains: [],
            protocols: []
          };
        }
        
        domainStats[rootDomain].count++;
        domainStats[rootDomain].urls.push(urlStr);
        
        if (!domainStats[rootDomain].subdomains.includes(domain)) {
          domainStats[rootDomain].subdomains.push(domain);
        }
        
        if (!domainStats[rootDomain].protocols.includes(url.protocol)) {
          domainStats[rootDomain].protocols.push(url.protocol);
        }
        
      } catch (error) {
        // Skip invalid URLs
      }
    });
    
    const results = Object.values(domainStats)
      .sort((a, b) => b.count - a.count);
    
    return c.json<ApiResponse>({
      success: true,
      data: results,
      message: `分析完成，发现 ${results.length} 个不同域名`
    });
    
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : '域名分析失败'
    }, 500);
  }
});

export { url };