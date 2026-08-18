import { INDUSTRIES, MOODS, ORIGINS, PAGE_TYPES, STATUSES } from './schema';

export const ORIGIN_LABEL: Record<(typeof ORIGINS)[number], string> = {
  study: '复刻',
  remix: '混血',
  original: '原创',
};

export const STATUS_LABEL: Record<(typeof STATUSES)[number], string> = {
  draft: '草稿',
  published: '已发布',
  promoted: '已沉淀',
  archived: '已归档',
};

export const PAGE_TYPE_LABEL: Record<(typeof PAGE_TYPES)[number], string> = {
  landing: '落地页',
  dashboard: '仪表盘',
  pricing: '定价页',
  portfolio: '作品集',
  blog: '博客',
  docs: '文档',
  login: '登录页',
  'e-commerce': '电商',
  settings: '设置页',
  marketing: '营销页',
};

export const INDUSTRY_LABEL: Record<(typeof INDUSTRIES)[number], string> = {
  fintech: '金融科技',
  'dev-tool': '开发工具',
  ai: '人工智能',
  travel: '旅行',
  health: '健康',
  education: '教育',
  social: '社交',
  media: '媒体',
  enterprise: '企业服务',
  consumer: '消费品',
};

export const MOOD_LABEL: Record<(typeof MOODS)[number], string> = {
  minimal: '极简',
  dense: '高密度',
  playful: '俏皮',
  premium: '高级感',
  brutalist: '粗野主义',
  soft: '柔和',
  'dark-first': '深色优先',
  editorial: '编辑排版',
  retro: '复古',
  futuristic: '未来感',
};

export const INNOVATION_LABEL: Record<number, string> = {
  0: '0 · 纯复刻',
  1: '1 · 微调',
  2: '2 · 混血',
  3: '3 · 原创',
};
