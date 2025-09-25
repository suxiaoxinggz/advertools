// Helper utilities for Digital Marketing Analytics Platform

// URL utilities
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function parseUrl(url: string) {
  try {
    const parsed = new URL(url);
    const queryParams: Record<string, string> = {};
    
    parsed.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    
    return {
      original_url: url,
      protocol: parsed.protocol,
      domain: parsed.hostname,
      path: parsed.pathname,
      query_params: queryParams,
      fragment: parsed.hash,
      is_valid: true
    };
  } catch (error) {
    return {
      original_url: url,
      protocol: '',
      domain: '',
      path: '',
      query_params: {},
      fragment: '',
      is_valid: false,
      error: 'Invalid URL format'
    };
  }
}

// Text processing utilities
export function extractWords(text: string, minLength: number = 2): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fff]/g, ' ') // Keep alphanumeric and Chinese characters
    .split(/\s+/)
    .filter(word => word.length >= minLength && word.trim() !== '');
}

export function calculateWordFrequency(words: string[], topWords: number = 20) {
  const frequency: Record<string, number> = {};
  const total = words.length;
  
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  return Object.entries(frequency)
    .map(([word, count]) => ({
      word,
      count,
      percentage: Math.round((count / total) * 100 * 100) / 100
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topWords);
}

// Entity extraction utilities
export function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s]+/gi;
  return text.match(urlRegex) || [];
}

export function extractEmails(text: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  return text.match(emailRegex) || [];
}

export function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w\u4e00-\u9fff]+/g;
  return text.match(hashtagRegex) || [];
}

export function extractMentions(text: string): string[] {
  const mentionRegex = /@[\w\u4e00-\u9fff]+/g;
  return text.match(mentionRegex) || [];
}

export function extractNumbers(text: string): string[] {
  const numberRegex = /\d+\.?\d*/g;
  return text.match(numberRegex) || [];
}

export function extractAllEntities(text: string) {
  return [
    ...extractUrls(text).map(url => ({ type: 'url', value: url })),
    ...extractEmails(text).map(email => ({ type: 'email', value: email })),
    ...extractHashtags(text).map(hashtag => ({ type: 'hashtag', value: hashtag })),
    ...extractMentions(text).map(mention => ({ type: 'mention', value: mention })),
    ...extractNumbers(text).map(number => ({ type: 'number', value: number }))
  ];
}

// SEM utilities
export function generateKeywordCombinations(seeds: string[], modifiers: string[] = []): string[] {
  const keywords: string[] = [];
  
  // Add original seeds
  keywords.push(...seeds);
  
  // Generate combinations with modifiers
  if (modifiers.length > 0) {
    seeds.forEach(seed => {
      modifiers.forEach(modifier => {
        keywords.push(`${modifier} ${seed}`);
        keywords.push(`${seed} ${modifier}`);
      });
    });
  }
  
  return Array.from(new Set(keywords)); // Remove duplicates
}

export function createAdFromTemplate(template: string, productName: string, maxLength: number = 30): string {
  let ad = template.replace(/\{product\}/gi, productName);
  
  const truncated = ad.length > maxLength;
  if (truncated) {
    ad = ad.substring(0, maxLength - 3) + '...';
  }
  
  return ad;
}

// SEO utilities  
export function extractBasicSeoData(html: string, url: string) {
  // Basic HTML parsing (in a real implementation, you'd use a proper HTML parser)
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || [];
  const h2Matches = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || [];
  const h3Matches = html.match(/<h3[^>]*>([^<]+)<\/h3>/gi) || [];
  
  const linkMatches = html.match(/<a[^>]*href=["']([^"']+)["']/gi) || [];
  const links = linkMatches.map(link => {
    const hrefMatch = link.match(/href=["']([^"']+)["']/i);
    return hrefMatch ? hrefMatch[1] : '';
  }).filter(href => href);
  
  const domain = new URL(url).hostname;
  const internalLinks = links.filter(link => {
    try {
      const linkUrl = new URL(link, url);
      return linkUrl.hostname === domain;
    } catch {
      return link.startsWith('/');
    }
  });
  
  const externalLinks = links.filter(link => {
    try {
      const linkUrl = new URL(link, url);
      return linkUrl.hostname !== domain;
    } catch {
      return false;
    }
  });
  
  const words = extractWords(html.replace(/<[^>]+>/g, ' '));
  
  return {
    url,
    title: titleMatch ? titleMatch[1].trim() : null,
    meta_description: metaDescMatch ? metaDescMatch[1].trim() : null,
    h1: h1Matches.map(h => h.replace(/<[^>]+>/g, '').trim()),
    h2: h2Matches.map(h => h.replace(/<[^>]+>/g, '').trim()),
    h3: h3Matches.map(h => h.replace(/<[^>]+>/g, '').trim()),
    word_count: words.length,
    links_internal: internalLinks.length,
    links_external: externalLinks.length
  };
}

// Mock SERP data generator (in real implementation, would connect to search APIs)
export function generateMockSerp(keyword: string, count: number = 10) {
  const mockDomains = [
    'wikipedia.org', 'baidu.com', 'zhihu.com', 'csdn.net', 'github.com',
    'stackoverflow.com', 'medium.com', 'blog.sina.com.cn', '163.com', 'qq.com'
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    position: i + 1,
    title: `${keyword}相关内容 - 权威解答第${i + 1}名`,
    url: `https://${mockDomains[i % mockDomains.length]}/search?q=${encodeURIComponent(keyword)}`,
    snippet: `这是关于"${keyword}"的详细介绍和分析，包含最新的行业资讯和专业见解...`,
    domain: mockDomains[i % mockDomains.length]
  }));
}

// HTTP utilities
export async function fetchWithTimeout(url: string, timeout: number = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Digital-Marketing-Analytics-Bot/1.0'
      }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}