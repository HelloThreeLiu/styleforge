'use client';

import { useState } from 'react';
import type { PageMeta } from '@/lib/schema';
import { INDUSTRIES, MOODS, PAGE_TYPES, STATUSES } from '@/lib/schema';
import { INDUSTRY_LABEL, INNOVATION_LABEL, MOOD_LABEL, PAGE_TYPE_LABEL, STATUS_LABEL } from '@/lib/labels';

type Draft = Pick<PageMeta, 'rating' | 'status' | 'page_type' | 'industry' | 'mood' | 'innovation' | 'tags_user'>;

export default function CurationPanel({ id, initial }: { id: string; initial: PageMeta }) {
  const [draft, setDraft] = useState<Draft>({
    rating: initial.rating,
    status: initial.status,
    page_type: initial.page_type,
    industry: initial.industry,
    mood: initial.mood,
    innovation: initial.innovation,
    tags_user: initial.tags_user,
  });
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirty = JSON.stringify(draft) !== JSON.stringify({
    rating: initial.rating, status: initial.status, page_type: initial.page_type,
    industry: initial.industry, mood: initial.mood, innovation: initial.innovation, tags_user: initial.tags_user,
  });

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      setSavedAt(new Date().toLocaleTimeString('zh-CN', { hour12: false }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !draft.tags_user.includes(t)) setDraft({ ...draft, tags_user: [...draft.tags_user, t] });
    setTagInput('');
  };
  const toggleIn = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const stars = (r: number | null) => {
    if (r === null) return <span className="text-xs text-faint">未评</span>;
    const full = Math.floor(r);
    const half = r - full >= 0.5;
    return (
      <span className={`text-base ${r >= 4 ? 'text-good' : 'text-warn'}`}>
        {'★'.repeat(full)}{half ? '⯨' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
        <span className="ml-1.5 text-xs text-sub">{r.toFixed(1)}</span>
      </span>
    );
  };

  return (
    <section className="rounded-xl border border-edge bg-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-sub">策展</h2>
        <div className="flex items-center gap-2 text-xs">
          {savedAt && !dirty && <span className="text-good">已保存 {savedAt}</span>}
          {error && <span className="text-bad" title={error}>保存失败</span>}
          <button onClick={save} disabled={saving || !dirty} className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white transition-opacity disabled:opacity-40">
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
      </div>
      {error && <p className="mb-3 break-all rounded-md border border-bad/40 bg-bad/10 px-3 py-2 text-xs text-bad">{error}</p>}

      <div className="space-y-5">
        <div>
          <label className="mb-1.5 block text-xs text-faint">评分（≥ 4 可沉淀为派生风格）</label>
          <div className="flex items-center gap-3">
            {stars(draft.rating)}
            <input
              type="range" min={1} max={5} step={0.5}
              value={draft.rating ?? 3}
              onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })}
              className="h-1 flex-1 accent-[#7170ff]"
            />
            <button
              onClick={() => setDraft({ ...draft, rating: null })}
              className="text-xs text-faint transition-colors hover:text-sub"
              title="清除评分"
            >
              ✕
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-faint">状态</label>
          <div className="grid grid-cols-4 gap-1">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setDraft({ ...draft, status: s })}
                className={`rounded-md border px-2 py-1.5 text-xs transition-colors ${
                  draft.status === s ? 'border-accent/60 bg-accentSoft font-semibold text-accent' : 'border-edge text-sub hover:text-ink'
                }`}
              >
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs text-faint">页面类型</label>
            <select value={draft.page_type} onChange={(e) => setDraft({ ...draft, page_type: e.target.value as PageMeta['page_type'] })} className="field w-full">
              {PAGE_TYPES.map((t) => <option key={t} value={t}>{PAGE_TYPE_LABEL[t]}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-faint">创新度</label>
            <select value={draft.innovation} onChange={(e) => setDraft({ ...draft, innovation: Number(e.target.value) })} className="field w-full">
              {[0, 1, 2, 3].map((n) => <option key={n} value={n}>{INNOVATION_LABEL[n]}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-faint">行业（多选）</label>
          <div className="flex flex-wrap gap-1.5">
            {INDUSTRIES.map((i) => (
              <button key={i} onClick={() => setDraft({ ...draft, industry: toggleIn(draft.industry, i) as PageMeta['industry'] })} className={`chip ${draft.industry.includes(i) ? 'chip-on' : ''}`}>
                {INDUSTRY_LABEL[i]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-faint">氛围（多选）</label>
          <div className="flex flex-wrap gap-1.5">
            {MOODS.map((m) => (
              <button key={m} onClick={() => setDraft({ ...draft, mood: toggleIn(draft.mood, m) as PageMeta['mood'] })} className={`chip ${draft.mood.includes(m) ? 'chip-on' : ''}`}>
                {MOOD_LABEL[m]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-faint">人工标签（回车添加）</label>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              placeholder="如：斜切英雄区"
              className="field flex-1"
            />
            <button onClick={addTag} className="btn-sm">添加</button>
          </div>
          {draft.tags_user.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {draft.tags_user.map((t) => (
                <button key={t} onClick={() => setDraft({ ...draft, tags_user: draft.tags_user.filter((x) => x !== t) })} className="chip chip-on" title="点击移除">
                  {t} ✕
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
