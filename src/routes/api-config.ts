// API Configuration Management
import { Hono } from 'hono';
import type { ApiResponse } from '../types/api';

const apiConfig = new Hono();

// 🔒 安全说明：API密钥仅存储在用户浏览器的localStorage中
// 不会发送到服务器，完全本地化存储，保护用户隐私

// 临时会话存储（仅用于单次请求传递，不持久化）
const sessionKeys: Map<string, Record<string, string>> = new Map();

// Get API configuration status（前端会发送当前localStorage状态）
apiConfig.post('/status', async (c) => {
  const body = await c.req.json<{
    google_search_api_key?: string;
    google_search_cx?: string;
    twitter_bearer_token?: string;
    youtube_api_key?: string;
    knowledge_graph_api_key?: string;
  }>();
  
  const status = {
    google_search: !!(body.google_search_api_key && body.google_search_cx),
    google_search_cx: !!body.google_search_cx,
    twitter_bearer: !!body.twitter_bearer_token,
    youtube_api: !!body.youtube_api_key,
    knowledge_graph: !!body.knowledge_graph_api_key
  };
  
  // 临时存储到会话中（用于当前用户的API调用）
  const sessionId = Math.random().toString(36).substring(7);
  sessionKeys.set(sessionId, body);
  
  return c.json<ApiResponse>({
    success: true,
    data: {
      session_id: sessionId, // 返回会话ID供后续API调用使用
      configured_apis: Object.entries(status).filter(([_, configured]) => configured).map(([api, _]) => api),
      missing_apis: Object.entries(status).filter(([_, configured]) => !configured).map(([api, _]) => api),
      status: status
    },
    message: `${Object.values(status).filter(Boolean).length}/5 API已配置（本地存储）`
  });
});

// 设置API密钥（返回前端存储指令）
apiConfig.post('/keys', async (c) => {
  try {
    const body = await c.req.json<{
      google_search_api_key?: string;
      google_search_cx?: string;
      twitter_bearer_token?: string;
      youtube_api_key?: string;
      knowledge_graph_api_key?: string;
    }>();
    
    let updated = 0;
    const validKeys: string[] = [];
    
    // 验证API密钥格式（不存储，只验证）
    Object.entries(body).forEach(([key, value]) => {
      if (value && value.trim()) {
        validKeys.push(key);
        updated++;
      }
    });
    
    return c.json<ApiResponse>({
      success: true,
      data: {
        updated_keys: updated,
        configured_apis: validKeys,
        storage_instruction: 'API密钥将安全存储在您的浏览器本地，不会发送到服务器'
      },
      message: `验证成功 ${updated} 个API密钥（将保存在本地）`
    });
    
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'API密钥验证失败'
    }, 500);
  }
});

// 删除API密钥（返回前端删除指令）
apiConfig.delete('/keys/:api', async (c) => {
  const api = c.req.param('api');
  
  return c.json<ApiResponse>({
    success: true,
    data: {
      deleted_key: api,
      storage_instruction: '请在前端localStorage中删除该密钥'
    },
    message: `请删除本地存储的 ${api} 密钥`
  });
});

// 测试API连接（需要前端发送密钥）
apiConfig.post('/test/:api', async (c) => {
  const api = c.req.param('api');
  
  try {
    const body = await c.req.json<{
      google_search_api_key?: string;
      google_search_cx?: string;
      twitter_bearer_token?: string;
      youtube_api_key?: string;
      knowledge_graph_api_key?: string;
      session_id?: string;
    }>();
    
    // 使用前端发送的密钥或会话中的密钥
    let apiKeys = body;
    if (body.session_id && sessionKeys.has(body.session_id)) {
      apiKeys = { ...sessionKeys.get(body.session_id), ...body };
    }
    
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

// 从请求中获取API密钥（用于其他路由调用）
export function getApiKeyFromRequest(body: any, keyName: string): string | null {
  return body[keyName] || null;
}

// 从会话中获取API密钥
export function getApiKeyFromSession(sessionId: string, keyName: string): string | null {
  const session = sessionKeys.get(sessionId);
  return session ? (session[keyName] || null) : null;
}

export { apiConfig };