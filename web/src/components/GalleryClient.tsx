'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { GalleryPage } from '@/lib/store';
import { INDUSTRIES, MOODS, ORIGINS, PAGE_TYPES, STATUSES } from '@/lib/schema';
import { INDUSTRY_LABEL, INNOVATION_LABEL, MOOD_LABEL, ORIGIN_LABEL, PAGE_TYPE_LABEL, STATUS_LABEL } from '@/lib/labels';

type Sort = 'new' | 'ratingDesc' | 'ratingAsc';

export default function GalleryClient({ pages }: { pages: GalleryPage[] }) {
  const [q, setQ] = useState('');
  const [origin, setOrigin] = useState<string>('all');
  const [pageType, setPageType] = useState<string>('all');
  const [industries, setIndustries] = useState<string[]>([]);
  const [moods, setMoods] = useState<string[]>([]);
  const [innovation, setInnovation] = useState<string>('all');
  const [ratingMin, setRatingMin] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [sort, setSort] = useState<Sort>('new');
  const [showMore, setShowMore] = useState(false);

  const valid = pages.filter((p) => p.meta);
  const rated = valid.filter((p) => p.meta!.rating !== null);
  const avg = rated.length ? rated.reduce((s, p) => s + (p.meta!.rating ?? 0), 0) / rated.length : null;

  const filtered = useMemo(() => {
    const list = pages.filter((p) => {
      const m = p.meta;
      if (!m) return statusFilter === 'all' || statusFilter === 'broken';
      if (statusFilter === 'active' && m.status === 'archived') return false;
      if (statusFilter === 'archived' && m.status !== 'archived') return false;
      if (origin !== 'all' && m.origin !== origin) return false;
      if (pageType !== 'all' && m.page_type !== pageType) return false;
      if (industries.length && !industries.some((i) => m.industry.includes(i as never))) return false;
      if (moods.length && !moods.some((x) => m.mood.includes(x as never))) return false;
      if (innovation !== 'all' && m.innovation !== Number(innovation)) return false;
      if (ratingMin !== 'all' && (m.rating ?? 0) < Number(ratingMin)) return false;
      if (q) {
        const hay = `${m.title} ${m.id} ${m.tags_ai.join(' ')} ${m.tags_user.join(' ')} ${m.lineage.join(' ')}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
    list.sort((a, b) => {
      if (sort === 'new') return (b.meta?.created_at ?? b.dir).localeCompare(a.meta?.created_at ?? a.dir);
      const ra = a.meta?.rating ?? -1;
      const rb = b.meta?.rating ?? -1;
      return sort === 'ratingDesc' ? rb - ra : ra - rb;
    });
    return list;
  }, [pages, q, origin, pageType, industries, moods, innovation, ratingMin, statusFilter, sort]);

  const toggle = (list: string[], v: string, set: (x: string[]) => void) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">画廊</h1>
          <p className="mt-1 text-sm text-sub">
            {pages.length} 个页面 · {rated.length} 个已评{avg !== null ? ` · 均分 ${avg.toFixed(1)}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索标题 / 标签 / 谱系…" className="field w-56" />
          <select value={origin} onChange={(e) => setOrigin(e.target.value)} className="field">
            <option value="all">全部模式</option>
            {ORIGINS.map((o) => <option key={o} value={o}>{ORIGIN_LABEL[o]}</option>)}
          </select>
          <select value={pageType} onChange={(e) => setPageType(e.target.value)} className="field">
            <option value="all">全部类型</option>
            {PAGE_TYPES.map((t) => <option key={t} value={t}>{PAGE_TYPE_LABEL[t]}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field">
            <option value="new">最新优先</option>
            <option value="ratingDesc">评分最高</option>
            <option value="ratingAsc">评分最低</option>
          </select>
          <button onClick={() => setShowMore(!showMore)} className="btn-sm">
            {showMore ? '收起筛选 ▲' : '更多筛选 ▼'}
          </button>
        </div>
      </div>

      {showMore && (
        <div className="mt-4 space-y-3 rounded-xl border border-edge bg-panel p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs text-faint">行业</span>
            {INDUSTRIES.map((i) => (
              <button key={i} onClick={() => toggle(industries, i, setIndustries)} className={`chip ${industries.includes(i) ? 'chip-on' : ''}`}>
                {INDUSTRY_LABEL[i]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs text-faint">氛围</span>
            {MOODS.map((m) => (
              <button key={m} onClick={() => toggle(moods, m, setMoods)} className={`chip ${moods.includes(m) ? 'chip-on' : ''}`}>
                {MOOD_LABEL[m]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-faint">创新度</span>
            <select value={innovation} onChange={(e) => setInnovation(e.target.value)} className="field">
              <option value="all">全部</option>
              {[0, 1, 2, 3].map((n) => <option key={n} value={n}>{INNOVATION_LABEL[n]}</option>)}
            </select>
            <span className="ml-3 text-xs text-faint">评分下限</span>
            <select value={ratingMin} onChange={(e) => setRatingMin(e.target.value)} className="field">
              <option value="all">不限</option>
              <option value="3">≥ 3</option>
              <option value="3.5">≥ 3.5</option>
              <option value="4">≥ 4（可沉淀）</option>
              <option value="4.5">≥ 4.5</option>
            </select>
            <span className="ml-3 text-xs text-faint">状态</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="field">
              <option value="active">活跃（未归档）</option>
              <option value="archived">仅归档</option>
              <option value="all">全部</option>
            </select>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="mt-16 rounded-xl border border-dashed border-edge py-20 text-center text-sm text-faint">
          没有符合条件的页面。召唤一个 Agent 开始创作吧（见 AGENTS.md）。
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => <Card key={p.dir} page={p} />)}
        </div>
      )}
    </main>
  );
}

function Card({ page }: { page: GalleryPage }) {
  const [imgFailed, setImgFailed] = useState(false);
  const m = page.meta;
  const isNew = m ? Date.now() - new Date(m.created_at).getTime() < 72 * 3600 * 1000 : false;

  return (
    <Link href={`/page/${page.dir}`} className="group block overflow-hidden rounded-xl border border-edge bg-panel transition-colors hover:border-accent/50">
      <div className="relative aspect-[16/10] overflow-hidden border-b border-edge bg-panel2">
        {m && page.hasScreenshot && !imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/preview/pages/${page.dir}/screenshot.png`}
            alt={m.title}
            className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 text-xs text-faint">
            <span className="text-2xl"> ◱ </span>
            <span>{m ? '暂无截图 · 运行 npm run snapshot' : 'meta.json 异常'}</span>
          </div>
        )}
        {isNew && m && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold tracking-wider text-white">NEW</span>
        )}
        {m?.status === 'promoted' && (
          <span className="absolute right-3 top-3 rounded-full border border-good/50 bg-good/15 px-2 py-0.5 text-[10px] font-semibold text-good">已沉淀</span>
        )}
        {m?.status === 'archived' && (
          <span className="absolute right-3 top-3 rounded-full border border-edge bg-base/80 px-2 py-0.5 text-[10px] text-faint">已归档</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 truncate text-sm font-medium">{m?.title ?? page.dir}</h3>
          {m?.rating !== null && m?.rating !== undefined ? (
            <span className={`shrink-0 text-xs font-semibold ${(m.rating ?? 0) >= 4 ? 'text-good' : 'text-sub'}`}>
              ★ {m.rating.toFixed(1)}
            </span>
          ) : (
            <span className="shrink-0 text-xs text-faint">未评</span>
          )}
        </div>
        {m ? (
          <>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="chip chip-on">{ORIGIN_LABEL[m.origin]}</span>
              <span className="chip">{PAGE_TYPE_LABEL[m.page_type]}</span>
              {m.lineage.map((l) => <span key={l} className="chip">↳ {l}</span>)}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {m.mood.slice(0, 3).map((x) => <span key={x} className="text-[10px] text-faint">#{MOOD_LABEL[x]}</span>)}
            </div>
          </>
        ) : (
          <p className="mt-2 line-clamp-2 text-xs text-bad">{page.metaError}</p>
        )}
      </div>
    </Link>
  );
}
