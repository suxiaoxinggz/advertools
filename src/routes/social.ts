// Social Media Analysis API Routes
import { Hono } from 'hono';
import type { ApiResponse } from '../types/api';

const social = new Hono();

// Twitter-like Social Media Analysis
social.post('/analyze-posts', async (c) => {
  try {
    const body = await c.req.json<{
      posts: string[];
      analysis_type: 'engagement' | 'sentiment' | 'hashtags' | 'mentions';
    }>();
    
    const { posts, analysis_type } = body;
    
    if (!posts || posts.length === 0) {
      return c.json<ApiResponse>({
        success: false,
        error: '请提供社交媒体帖子内容'
      }, 400);
    }
    
    let results: any[] = [];
    
    switch (analysis_type) {
      case 'hashtags':
        results = posts.map((post, index) => {
          const hashtags = post.match(/#[\w\u4e00-\u9fff]+/g) || [];
          return {
            post_id: index + 1,
            content: post.substring(0, 100) + '...',
            hashtags: hashtags,
            hashtag_count: hashtags.length,
            reach_estimate: hashtags.length * Math.floor(Math.random() * 1000) + 500
          };
        });
        break;
        
      case 'mentions':
        results = posts.map((post, index) => {
          const mentions = post.match(/@[\w\u4e00-\u9fff]+/g) || [];
          return {
            post_id: index + 1,
            content: post.substring(0, 100) + '...',
            mentions: mentions,
            mention_count: mentions.length,
            engagement_score: mentions.length * 2.5 + Math.random() * 10
          };
        });
        break;
        
      case 'engagement':
        results = posts.map((post, index) => {
          const length = post.length;
          const hashtags = (post.match(/#[\w\u4e00-\u9fff]+/g) || []).length;
          const mentions = (post.match(/@[\w\u4e00-\u9fff]+/g) || []).length;
          const urls = (post.match(/https?:\/\/[^\s]+/g) || []).length;
          
          const engagement_score = Math.min(100, 
            (hashtags * 15) + (mentions * 10) + (urls * 8) + 
            Math.max(0, 50 - length / 10) + Math.random() * 20
          );
          
          return {
            post_id: index + 1,
            content: post.substring(0, 100) + '...',
            engagement_score: Math.round(engagement_score * 100) / 100,
            predicted_likes: Math.floor(engagement_score * 3.2),
            predicted_shares: Math.floor(engagement_score * 1.1),
            predicted_comments: Math.floor(engagement_score * 0.8),
            optimal_time: ['9:00-11:00', '14:00-16:00', '19:00-21:00'][Math.floor(Math.random() * 3)]
          };
        });
        break;
        
      case 'sentiment':
        const positiveWords = ['好', '棒', '赞', '优秀', '喜欢', '完美', '厉害', 'good', 'great', 'awesome', 'love', 'amazing'];
        const negativeWords = ['坏', '差', '糟糕', '讨厌', '垃圾', '失望', 'bad', 'terrible', 'hate', 'awful', 'disappointing'];
        
        results = posts.map((post, index) => {
          const lowerPost = post.toLowerCase();
          const positiveCount = positiveWords.reduce((count, word) => 
            count + (lowerPost.match(new RegExp(word, 'g')) || []).length, 0
          );
          const negativeCount = negativeWords.reduce((count, word) => 
            count + (lowerPost.match(new RegExp(word, 'g')) || []).length, 0
          );
          
          let sentiment = 'neutral';
          let score = 0;
          
          if (positiveCount > negativeCount) {
            sentiment = 'positive';
            score = Math.min(1, (positiveCount - negativeCount) / Math.max(positiveCount + negativeCount, 1));
          } else if (negativeCount > positiveCount) {
            sentiment = 'negative';
            score = -Math.min(1, (negativeCount - positiveCount) / Math.max(positiveCount + negativeCount, 1));
          }
          
          return {
            post_id: index + 1,
            content: post.substring(0, 100) + '...',
            sentiment: sentiment,
            sentiment_score: Math.round(score * 100) / 100,
            confidence: Math.round(Math.abs(score) * 100),
            positive_indicators: positiveWords.filter(word => lowerPost.includes(word)),
            negative_indicators: negativeWords.filter(word => lowerPost.includes(word))
          };
        });
        break;
    }
    
    return c.json<ApiResponse>({
      success: true,
      data: results,
      message: `成功分析 ${posts.length} 条社交媒体帖子的${analysis_type}数据`
    });
    
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : '社交媒体分析失败'
    }, 500);
  }
});

// Social Media Trend Analysis
social.post('/trend-analysis', async (c) => {
  try {
    const body = await c.req.json<{
      hashtags: string[];
      time_period: string;
    }>();
    
    const { hashtags, time_period } = body;
    
    if (!hashtags || hashtags.length === 0) {
      return c.json<ApiResponse>({
        success: false,
        error: '请提供要分析的话题标签'
      }, 400);
    }
    
    // Mock trend data generation
    const trendData = hashtags.map(hashtag => {
      const baseVolume = Math.floor(Math.random() * 10000) + 1000;
      const growth = (Math.random() - 0.5) * 200; // -100% to +100% growth
      
      return {
        hashtag: hashtag.startsWith('#') ? hashtag : `#${hashtag}`,
        current_volume: baseVolume,
        growth_rate: Math.round(growth * 100) / 100,
        trend_direction: growth > 0 ? 'up' : growth < -10 ? 'down' : 'stable',
        engagement_rate: Math.round((Math.random() * 8 + 2) * 100) / 100,
        related_hashtags: [
          `#${hashtag.replace('#', '')}分析`,
          `#${hashtag.replace('#', '')}趋势`,
          `#热门${hashtag.replace('#', '')}`
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        peak_hours: ['9-11', '14-16', '19-21'][Math.floor(Math.random() * 3)],
        geographic_focus: ['北京', '上海', '广州', '深圳'][Math.floor(Math.random() * 4)]
      };
    });
    
    // Calculate overall trends
    const totalVolume = trendData.reduce((sum, item) => sum + item.current_volume, 0);
    const avgGrowth = trendData.reduce((sum, item) => sum + item.growth_rate, 0) / trendData.length;
    
    const summary = {
      total_hashtags: hashtags.length,
      total_volume: totalVolume,
      average_growth: Math.round(avgGrowth * 100) / 100,
      trending_count: trendData.filter(item => item.trend_direction === 'up').length,
      declining_count: trendData.filter(item => item.trend_direction === 'down').length,
      stable_count: trendData.filter(item => item.trend_direction === 'stable').length
    };
    
    return c.json<ApiResponse>({
      success: true,
      data: {
        trends: trendData,
        summary: summary,
        time_period: time_period
      },
      message: `成功分析 ${hashtags.length} 个话题标签的趋势数据`
    });
    
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : '趋势分析失败'
    }, 500);
  }
});

// Social Media Content Optimizer
social.post('/content-optimizer', async (c) => {
  try {
    const body = await c.req.json<{
      content: string;
      platform: 'twitter' | 'weibo' | 'linkedin' | 'instagram';
      target_audience: string;
    }>();
    
    const { content, platform, target_audience } = body;
    
    if (!content?.trim()) {
      return c.json<ApiResponse>({
        success: false,
        error: '请提供要优化的内容'
      }, 400);
    }
    
    // Platform-specific limits and recommendations
    const platformLimits = {
      twitter: { maxLength: 280, optimalHashtags: 2, optimalMentions: 1 },
      weibo: { maxLength: 140, optimalHashtags: 3, optimalMentions: 2 },
      linkedin: { maxLength: 1300, optimalHashtags: 5, optimalMentions: 3 },
      instagram: { maxLength: 2200, optimalHashtags: 10, optimalMentions: 2 }
    };
    
    const limits = platformLimits[platform];
    const currentLength = content.length;
    const currentHashtags = (content.match(/#[\w\u4e00-\u9fff]+/g) || []).length;
    const currentMentions = (content.match(/@[\w\u4e00-\u9fff]+/g) || []).length;
    
    // Generate optimization suggestions
    const suggestions = [];
    
    if (currentLength > limits.maxLength) {
      suggestions.push({
        type: 'length',
        priority: 'high',
        message: `内容长度超出${platform}限制，当前${currentLength}字符，建议缩短至${limits.maxLength}字符以内`,
        action: '删减内容'
      });
    } else if (currentLength < limits.maxLength * 0.5) {
      suggestions.push({
        type: 'length',
        priority: 'medium',
        message: `内容可以更丰富，当前${currentLength}字符，可扩展至${limits.maxLength}字符`,
        action: '增加内容'
      });
    }
    
    if (currentHashtags < limits.optimalHashtags) {
      suggestions.push({
        type: 'hashtags',
        priority: 'medium',
        message: `建议增加话题标签，当前${currentHashtags}个，推荐${limits.optimalHashtags}个`,
        action: '添加相关标签'
      });
    } else if (currentHashtags > limits.optimalHashtags * 1.5) {
      suggestions.push({
        type: 'hashtags',
        priority: 'low',
        message: `话题标签过多可能影响阅读，当前${currentHashtags}个，建议控制在${limits.optimalHashtags}个左右`,
        action: '精简标签'
      });
    }
    
    if (currentMentions > limits.optimalMentions * 2) {
      suggestions.push({
        type: 'mentions',
        priority: 'low',
        message: `提及过多用户可能被视为垃圾信息，当前${currentMentions}个，建议控制在${limits.optimalMentions}个左右`,
        action: '减少提及'
      });
    }
    
    // Generate optimized content suggestions
    let optimizedContent = content;
    if (currentLength > limits.maxLength) {
      optimizedContent = content.substring(0, limits.maxLength - 3) + '...';
    }
    
    const result = {
      original_content: content,
      optimized_content: optimizedContent,
      platform: platform,
      target_audience: target_audience,
      current_stats: {
        length: currentLength,
        hashtags: currentHashtags,
        mentions: currentMentions,
        urls: (content.match(/https?:\/\/[^\s]+/g) || []).length
      },
      platform_limits: limits,
      optimization_score: Math.max(0, 100 - (suggestions.filter(s => s.priority === 'high').length * 30) - 
                                              (suggestions.filter(s => s.priority === 'medium').length * 15) - 
                                              (suggestions.filter(s => s.priority === 'low').length * 5)),
      suggestions: suggestions,
      recommended_posting_times: ['9:00-11:00', '14:00-16:00', '19:00-21:00'],
      engagement_prediction: {
        likes: Math.floor(Math.random() * 100) + 20,
        shares: Math.floor(Math.random() * 50) + 10,
        comments: Math.floor(Math.random() * 30) + 5
      }
    };
    
    return c.json<ApiResponse>({
      success: true,
      data: result,
      message: `成功优化${platform}平台的内容，优化得分：${result.optimization_score}`
    });
    
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : '内容优化失败'
    }, 500);
  }
});

export { social };