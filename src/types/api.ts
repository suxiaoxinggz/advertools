// API Types for Digital Marketing Analytics Platform

// Common API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// SEO API Types
export interface CrawlRequest {
  url: string;
  limit?: number;
}

export interface CrawlResult {
  url: string;
  title?: string;
  meta_description?: string;
  h1?: string[];
  h2?: string[];
  h3?: string[];
  status_code?: number;
  word_count?: number;
  links_internal?: number;
  links_external?: number;
}

export interface SerpRequest {
  keyword: string;
  count?: number;
  location?: string;
}

export interface SerpResult {
  position: number;
  title: string;
  url: string;
  snippet: string;
  domain: string;
}

export interface SitemapRequest {
  url: string;
}

export interface SitemapResult {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

export interface RobotsRequest {
  url: string;
}

export interface RobotsResult {
  user_agent: string;
  directive: string;
  value: string;
}

// SEM API Types
export interface KeywordRequest {
  seeds: string[];
  modifiers?: string[];
}

export interface KeywordResult {
  keyword: string;
  seed: string;
  modifier?: string;
  length: number;
}

export interface AdRequest {
  product_name: string;
  template: string;
  max_length?: number;
}

export interface AdResult {
  headline: string;
  description?: string;
  length: number;
  truncated: boolean;
}

// Text Analysis API Types
export interface WordFrequencyRequest {
  text: string;
  min_length?: number;
  top_words?: number;
}

export interface WordFrequencyResult {
  word: string;
  count: number;
  percentage: number;
}

export interface EntityExtractionRequest {
  text: string;
  type: 'all' | 'urls' | 'emails' | 'hashtags' | 'mentions' | 'numbers';
}

export interface EntityResult {
  type: string;
  value: string;
  count: number;
}

// URL Analysis API Types
export interface UrlParseRequest {
  urls: string[];
}

export interface UrlParseResult {
  original_url: string;
  protocol: string;
  domain: string;
  path: string;
  query_params: Record<string, string>;
  fragment: string;
  is_valid: boolean;
}

export interface UrlValidateRequest {
  urls: string[];
  type: 'status' | 'redirect' | 'structure';
}

export interface UrlValidateResult {
  url: string;
  is_valid: boolean;
  status_code?: number;
  redirect_url?: string;
  error?: string;
}