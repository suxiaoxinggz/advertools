// API Configuration Management
import { Hono } from 'hono';
import type { ApiResponse } from '../types/api';

type Bindings = {
  API_KEYS: KVNamespace;
}

const apiConfig = new Hono<{ Bindings: Bindings }>();

// Helper function to get all API keys from KV storage
async function getAllApiKeys(env: { API_KEYS: KVNamespace }): Promise<Record<string, string>> {
  const keys = [
    'google_search_api_key',
    'google_search_cx', 
    'twitter_bearer_token',
    'youtube_api_key',
    'knowledge_graph_api_key'
  ];
  
  const apiKeys: Record<string, string> = {};
  
  for (const key of keys) {
    const value = await env.API_KEYS.get(key);
    if (value) {
      apiKeys[key] = value;
    }
  }
  
  return apiKeys;
}

// Helper function to set API key in KV storage
async function setApiKey(env: { API_KEYS: KVNamespace }, key: string, value: string): Promise<void> {
  await env.API_KEYS.put(key, value);
}

// Helper function to delete API key from KV storage
async function deleteApiKey(env: { API_KEYS: KVNamespace }, key: string): Promise<void> {
  await env.API_KEYS.delete(key);
}

// Helper function to get single API key from KV storage
async function getApiKey(env: { API_KEYS: KVNamespace }, key: string): Promise<string | null> {
  return await env.API_KEYS.get(key);
}

// Get API configuration status
apiConfig.get('/status', async (c) => {
  const { env } = c;
  const apiKeys = await getAllApiKeys(env);
  
  const status = {
    google_search: !!apiKeys.google_search_api_key,
    google_search_cx: !!apiKeys.google_search_cx,
    twitter_bearer: !!apiKeys.twitter_bearer_token,
    youtube_api: !!apiKeys.youtube_api_key,
    knowledge_graph: !!apiKeys.knowledge_graph_api_key
  };
  
  return c.json<ApiResponse>({
    success: true,
    data: {
      configured_apis: Object.entries(status).filter(([_, configured]) => configured).map(([api, _]) => api),
      missing_apis: Object.entries(status).filter(([_, configured]) => !configured).map(([api, _]) => api),
      status: status
    },
    message: `${Object.values(status).filter(Boolean).length}/5 API已配置`
  });
});

// Set API keys
apiConfig.post('/keys', async (c) => {
  try {
    const { env } = c;
    const body = await c.req.json<{
      google_search_api_key?: string;
      google_search_cx?: string;
      twitter_bearer_token?: string;
      youtube_api_key?: string;
      knowledge_graph_api_key?: string;
    }>();
    
    let updated = 0;
    
    // Save each API key to KV storage
    for (const [key, value] of Object.entries(body)) {
      if (value && value.trim()) {
        await setApiKey(env, key, value.trim());
        updated++;
      }
    }
    
    // Get all current API keys for response
    const currentApiKeys = await getAllApiKeys(env);
    
    return c.json<ApiResponse>({
      success: true,
      data: {
        updated_keys: updated,
        configured_apis: Object.keys(currentApiKeys)
      },
      message: `成功更新 ${updated} 个API密钥`
    });
    
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'API密钥配置失败'
    }, 500);
  }
});

// Remove API keys
apiConfig.delete('/keys/:api', async (c) => {
  const { env } = c;
  const api = c.req.param('api');
  
  // Check if API key exists
  const existingKey = await getApiKey(env, api);
  
  if (existingKey) {
    await deleteApiKey(env, api);
    return c.json<ApiResponse>({
      success: true,
      message: `已删除 ${api} 的API密钥`
    });
  }
  
  return c.json<ApiResponse>({
    success: false,
    error: 'API密钥不存在'
  }, 404);
});

// Test API connection
apiConfig.post('/test/:api', async (c) => {
  const { env } = c;
  const api = c.req.param('api');
  
  try {
    const apiKeys = await getAllApiKeys(env);
    
    switch (api) {
      case 'google_search':
        if (!apiKeys.google_search_api_key || !apiKeys.google_search_cx) {
          throw new Error('需要Google Search API Key和Custom Search Engine ID');
        }
        
        const searchResponse = await fetch(
          `https://www.googleapis.com/customsearch/v1?key=${apiKeys.google_search_api_key}&cx=${apiKeys.google_search_cx}&q=test&num=1`
        );
        
        if (!searchResponse.ok) {
          const errorData = await searchResponse.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `HTTP ${searchResponse.status}`);
        }
        
        break;
        
      case 'twitter':
        if (!apiKeys.twitter_bearer_token) {
          throw new Error('需要Twitter Bearer Token');
        }
        
        const twitterResponse = await fetch('https://api.twitter.com/2/users/me', {
          headers: {
            'Authorization': `Bearer ${apiKeys.twitter_bearer_token}`
          }
        });
        
        if (!twitterResponse.ok) {
          const errorData = await twitterResponse.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `HTTP ${twitterResponse.status}`);
        }
        
        break;
        
      case 'youtube':
        if (!apiKeys.youtube_api_key) {
          throw new Error('需要YouTube Data API Key');
        }
        
        const youtubeResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&type=video&maxResults=1&key=${apiKeys.youtube_api_key}`
        );
        
        if (!youtubeResponse.ok) {
          const errorData = await youtubeResponse.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `HTTP ${youtubeResponse.status}`);
        }
        
        break;
        
      default:
        throw new Error('不支持的API类型');
    }
    
    return c.json<ApiResponse>({
      success: true,
      message: `${api} API连接测试成功`
    });
    
  } catch (error) {
    let errorMessage = error instanceof Error ? error.message : 'API连接测试失败';
    
    // Provide more helpful error messages
    if (errorMessage.includes('403')) {
      errorMessage = 'API密钥无效或权限不足 (HTTP 403)';
    } else if (errorMessage.includes('400')) {
      errorMessage = 'API请求参数错误，请检查CSE ID是否正确 (HTTP 400)';
    } else if (errorMessage.includes('404')) {
      errorMessage = 'API端点不存在，请检查API密钥和CSE配置 (HTTP 404)';
    } else if (errorMessage.includes('429')) {
      errorMessage = 'API请求频率过高，请稍后再试 (HTTP 429)';
    }
    
    return c.json<ApiResponse>({
      success: false,
      error: errorMessage
    }, 400);
  }
});

// Get API key for internal use by other route modules
export async function getApiKeyForRoute(env: { API_KEYS: KVNamespace }, keyName: string): Promise<string | null> {
  return await env.API_KEYS.get(keyName);
}

export { apiConfig };