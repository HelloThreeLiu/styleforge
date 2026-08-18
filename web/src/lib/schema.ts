import { z } from 'zod';

/** 与 schema/meta.schema.json 保持同步（唯一真源） */
export const PAGE_TYPES = ['landing', 'dashboard', 'pricing', 'portfolio', 'blog', 'docs', 'login', 'e-commerce', 'settings', 'marketing'] as const;
export const INDUSTRIES = ['fintech', 'dev-tool', 'ai', 'travel', 'health', 'education', 'social', 'media', 'enterprise', 'consumer'] as const;
export const MOODS = ['minimal', 'dense', 'playful', 'premium', 'brutalist', 'soft', 'dark-first', 'editorial', 'retro', 'futuristic'] as const;
export const ORIGINS = ['study', 'remix', 'original'] as const;
export const STATUSES = ['draft', 'published', 'promoted', 'archived'] as const;

const PAGE_ID = z.string().regex(/^\d{8}-[a-z0-9]+(-[a-z0-9]+)*$/);
const STYLE_ID = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*-v[0-9]+$/);
const ISO = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?([+-]\d{2}:\d{2}|Z)$/);
const RATING = z.number().min(1).max(5).multipleOf(0.5);

export const pageMetaSchema = z.object({
  id: PAGE_ID,
  title: z.string().min(1),
  created_at: ISO,
  generator: z.object({ agent: z.string().min(1), invoked_by: z.string().min(1) }),
  origin: z.enum(ORIGINS),
  lineage: z.array(z.string().min(1)),
  page_type: z.enum(PAGE_TYPES),
  industry: z.array(z.enum(INDUSTRIES)).min(1),
  mood: z.array(z.enum(MOODS)).min(1),
  innovation: z.number().int().min(0).max(3),
  tags_ai: z.array(z.string().min(1)).min(3),
  tags_user: z.array(z.string().min(1)),
  rating: RATING.nullable(),
  status: z.enum(STATUSES),
  files: z.object({ html: z.literal('index.html'), notes: z.literal('notes.md') }),
});

export type PageMeta = z.infer<typeof pageMetaSchema>;

export const styleMetaSchema = z.object({
  id: STYLE_ID,
  name: z.string().min(1),
  created_at: ISO,
  source_page: PAGE_ID,
  lineage: z.array(z.string().min(1)).min(1),
  inherited_rating: z.number().min(1).max(5),
  rating: RATING,
  child_count: z.number().int().min(0),
  summary: z.string().min(1),
});

export type StyleMeta = z.infer<typeof styleMetaSchema>;

/** PATCH 允许人工修改的字段（origin/lineage/生成器信息不可人工改） */
export const pagePatchSchema = z.object({
  title: z.string().min(1).optional(),
  page_type: z.enum(PAGE_TYPES).optional(),
  industry: z.array(z.enum(INDUSTRIES)).min(1).optional(),
  mood: z.array(z.enum(MOODS)).min(1).optional(),
  innovation: z.number().int().min(0).max(3).optional(),
  tags_user: z.array(z.string().min(1)).optional(),
  rating: RATING.nullable().optional(),
  status: z.enum(STATUSES).optional(),
});
