// Text Analysis API Routes
import { Hono } from 'hono';
import type { 
  WordFrequencyRequest, 
  EntityExtractionRequest,
  ApiResponse,
  WordFrequencyResult,
  EntityResult
} from '../types/api';
import { 
  extractWords, 
  calculateWordFrequency,
  extractUrls,
  extractEmails,
  extractHashtags,
  extractMentions,
  extractNumbers,
  extractAllEntities
} from '../utils/helpers';

const text = new Hono();

// Word Frequency Analysis
text.post('/word-frequency', async (c) => {
  try {
    const body = await c.req.json<WordFrequencyRequest>();
    const { text: inputText, min_length = 2, top_words = 20 } = body;
    
    if (!inputText?.trim()) {
      return c.json<ApiResponse>({
        success: false,
        error: '请提供要分析的文本内容'
      }, 400);
    }
    
    // Extract words from text
    const words = extractWords(inputText, min_length);
    
    if (words.length === 0) {
      return c.json<ApiResponse>({
        success: false,
        error: '文本中没有找到有效的词语'
      }, 400);
    }
    
    // Calculate frequency
    const results = calculateWordFrequency(words, top_words);
    
    // Add some statistics
    const totalWords = words.length;
    const uniqueWords = new Set(words).size;
    const avgWordLength = Math.round(
      words.reduce((sum, word) => sum + word.length, 0) / words.length * 100
    ) / 100;
    
    return c.json<ApiResponse<{
      words: WordFrequencyResult[];
      statistics: {
        total_words: number;
        unique_words: number;
        avg_word_length: number;
        text_length: number;
      }
    }>>({
      success: true,
      data: {
        words: results,
        statistics: {
          total_words: totalWords,
          unique_words: uniqueWords,
          avg_word_length: avgWordLength,
          text_length: inputText.length
        }
      },
      message: `成功分析文本，找到 ${uniqueWords} 个不同词语，共 ${totalWords} 个词`
    });
    
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : '词频分析失败'
    }, 500);
  }
});

// Entity Extraction
text.post('/extract', async (c) => {
  try {
    const body = await c.req.json<EntityExtractionRequest>();
    const { text: inputText, type } = body;
    
    if (!inputText?.trim()) {
      return c.json<ApiResponse>({
        success: false,
        error: '请提供要分析的文本内容'
      }, 400);
    }
    
    let entities: string[] = [];
    let entityType = type;
    
    // Extract entities based on type
    switch (type) {
      case 'urls':
        entities = extractUrls(inputText);
        break;
      case 'emails':
        entities = extractEmails(inputText);
        break;
      case 'hashtags':
        entities = extractHashtags(inputText);
        break;
      case 'mentions':
        entities = extractMentions(inputText);
        break;
      case 'numbers':
        entities = extractNumbers(inputText);
        break;
      case 'all':
      default:
        const allEntities = extractAllEntities(inputText);
        
        // Group by type and count
        const groupedEntities: Record<string, EntityResult> = {};
        
        allEntities.forEach(entity => {
          if (!groupedEntities[entity.type]) {
            groupedEntities[entity.type] = {
              type: entity.type,
              value: '',
              count: 0
            };
          }
          groupedEntities[entity.type].count++;
        });
        
        // Also return individual entities by type
        const results = {
          summary: Object.values(groupedEntities),
          urls: extractUrls(inputText),
          emails: extractEmails(inputText),
          hashtags: extractHashtags(inputText),
          mentions: extractMentions(inputText),
          numbers: extractNumbers(inputText)
        };
        
        return c.json<ApiResponse>({
          success: true,
          data: results,
          message: `成功提取所有类型实体，共找到 ${allEntities.length} 个实体`
        });
    }
    
    // Count frequency of each entity
    const entityCounts: Record<string, number> = {};
    entities.forEach(entity => {
      entityCounts[entity] = (entityCounts[entity] || 0) + 1;
    });
    
    // Create results array
    const results: EntityResult[] = Object.entries(entityCounts)
      .map(([value, count]) => ({
        type: entityType,
        value,
        count
      }))
      .sort((a, b) => b.count - a.count);
    
    return c.json<ApiResponse<EntityResult[]>>({
      success: true,
      data: results,
      message: `成功提取 ${entityType} 类型实体，找到 ${results.length} 个不同实体，共 ${entities.length} 次出现`
    });
    
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : '实体提取失败'
    }, 500);
  }
});

// Text Statistics (bonus feature)
text.post('/stats', async (c) => {
  try {
    const body = await c.req.json<{ text: string }>();
    const { text: inputText } = body;
    
    if (!inputText?.trim()) {
      return c.json<ApiResponse>({
        success: false,
        error: '请提供要分析的文本内容'
      }, 400);
    }
    
    // Basic text statistics
    const characters = inputText.length;
    const charactersNoSpaces = inputText.replace(/\s/g, '').length;
    const words = extractWords(inputText, 1);
    const sentences = inputText.split(/[.!?]+/).filter(s => s.trim()).length;
    const paragraphs = inputText.split(/\n\s*\n/).filter(p => p.trim()).length;
    
    // Reading time estimation (average 200 words per minute)
    const readingTimeMinutes = Math.ceil(words.length / 200);
    
    // Language detection (simple heuristic)
    const chineseChars = (inputText.match(/[\u4e00-\u9fff]/g) || []).length;
    const englishWords = (inputText.match(/[a-zA-Z]+/g) || []).length;
    const primaryLanguage = chineseChars > englishWords ? 'Chinese' : 'English';
    
    const stats = {
      characters,
      characters_no_spaces: charactersNoSpaces,
      words: words.length,
      sentences,
      paragraphs,
      reading_time_minutes: readingTimeMinutes,
      primary_language: primaryLanguage,
      chinese_characters: chineseChars,
      english_words: englishWords,
      avg_words_per_sentence: sentences > 0 ? Math.round(words.length / sentences * 100) / 100 : 0,
      avg_sentence_length: sentences > 0 ? Math.round(characters / sentences * 100) / 100 : 0
    };
    
    return c.json<ApiResponse>({
      success: true,
      data: stats,
      message: '文本统计分析完成'
    });
    
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : '文本统计分析失败'
    }, 500);
  }
});

// Sentiment Analysis (mock implementation)
text.post('/sentiment', async (c) => {
  try {
    const body = await c.req.json<{ text: string }>();
    const { text: inputText } = body;
    
    if (!inputText?.trim()) {
      return c.json<ApiResponse>({
        success: false,
        error: '请提供要分析的文本内容'
      }, 400);
    }
    
    // Simple sentiment analysis (mock implementation)
    const positiveWords = ['好', '优秀', '棒', '赞', '喜欢', '满意', '推荐', 'good', 'great', 'excellent', 'amazing', 'love', 'like'];
    const negativeWords = ['坏', '差', '糟糕', '不好', '讨厌', '失望', '垃圾', 'bad', 'terrible', 'awful', 'hate', 'dislike', 'poor'];
    
    const text = inputText.toLowerCase();
    const positiveCount = positiveWords.reduce((count, word) => {
      return count + (text.match(new RegExp(word, 'g')) || []).length;
    }, 0);
    
    const negativeCount = negativeWords.reduce((count, word) => {
      return count + (text.match(new RegExp(word, 'g')) || []).length;
    }, 0);
    
    let sentiment = 'neutral';
    let score = 0;
    
    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      score = Math.min((positiveCount - negativeCount) / Math.max(positiveCount + negativeCount, 1), 1);
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      score = -Math.min((negativeCount - positiveCount) / Math.max(positiveCount + negativeCount, 1), 1);
    }
    
    const confidence = Math.abs(score);
    
    const result = {
      sentiment,
      score: Math.round(score * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      positive_words: positiveCount,
      negative_words: negativeCount,
      details: {
        positive_indicators: positiveWords.filter(word => text.includes(word)),
        negative_indicators: negativeWords.filter(word => text.includes(word))
      }
    };
    
    return c.json<ApiResponse>({
      success: true,
      data: result,
      message: `情感分析完成，检测到${sentiment}情感（置信度：${Math.round(confidence * 100)}%）`
    });
    
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : '情感分析失败'
    }, 500);
  }
});

export { text };