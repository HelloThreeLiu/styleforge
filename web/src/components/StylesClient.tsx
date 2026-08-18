'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { DerivedStyle, SeedStyle } from '@/lib/store';
import { SEED_CATEGORY_ORDER } from '@/lib/seed-data';

export default function StylesClient({ seed, derived }: { seed: SeedStyle[]; derived: DerivedStyle[] }) {
  const [tab, setTab] = useState<'seed' | 'derived'>('seed');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<string>('all');

  // 支持 /styles?style=xxx 深链（来自详情页谱系徽章）
  useEffect(() => {
    const style = new URLSearchParams(window.location.search).get('style');
    if (style) setQ(style);
  }, []);

  const filteredSeed = seed.filter(
    (s) =>
      (category === 'all' || s.category === category) &&
      (!q || `${s.name} ${s.description} ${s.category}`.toLowerCase().includes(q.toLowerCase()))
  );
  const grouped = SEED_CATEGORY_ORDER.map((c) => ({ category: c, items: filteredSeed.filter((s) => s.category === c) })).filter((g) => g.items.length);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">风格库</h1>
          <p className="mt-1 text-sm text-sub">{seed.length} 个种子风格（只读） · {derived.length} 个派生风格（进化产物）</p>
        </div>
        <div className="flex items-center gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索风格…" className="field w-52" />
          <div className="flex items-center gap-1 rounded-lg border border-edge bg-panel p-1">
            <button onClick={() => setTab('seed')} className={`rounded-md px-3 py-1.5 text-xs transition-colors ${tab === 'seed' ? 'bg-accentSoft font-semibold text-accent' : 'text-sub hover:text-ink'}`}>种子风格</button>
            <button onClick={() => setTab('derived')} className={`rounded-md px-3 py-1.5 text-xs transition-colors ${tab === 'derived' ? 'bg-accentSoft font-semibold text-accent' : 'text-sub hover:text-ink'}`}>派生风格</button>
          </div>
        </div>
      </div>

      {tab === 'seed' ? (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <button onClick={() => setCategory('all')} className={`chip ${category === 'all' ? 'chip-on' : ''}`}>全部分类</button>
            {SEED_CATEGORY_ORDER.map((c) => (
              <button key={c} onClick={() => setCategory(c)} className={`chip ${category === c ? 'chip-on' : ''}`}>{c}</button>
            ))}
          </div>
          <div className="mt-6 space-y-10">
            {grouped.length === 0 && <div className="rounded-xl border border-dashed border-edge py-16 text-center text-sm text-faint">没有匹配的风格。</div>}
            {grouped.map((g) => (
              <section key={g.category}>
                <h2 className="mb-4 text-sm font-semibold text-faint">{g.category} <span className="ml-1 font-normal">· {g.items.length}</span></h2>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {g.items.map((s) => <SeedCard key={s.name} style={s} />)}
                </div>
              </section>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-6">
          {derived.length === 0 ? (
            <div className="rounded-xl border border-dashed border-edge px-6 py-16 text-center text-sm text-faint">
              还没有派生风格。给一个 ≥ 4 分的页面点击「沉淀」流程（见 PRD §8.7 与 AGENTS.md §10）。
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {derived.map((d) => <DerivedCard key={d.dir} style={d} />)}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

function SeedCard({ style }: { style: SeedStyle }) {
  const [preview, setPreview] = useState<'off' | 'light' | 'dark'>('off');
  const src = preview === 'light' ? `/preview/seed/${style.name}/preview.html` : preview === 'dark' ? `/preview/seed/${style.name}/preview-dark.html` : null;

  return (
    <div className="overflow-hidden rounded-xl border border-edge bg-panel">
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <h3 className="truncate font-mono text-sm font-medium text-ink">{style.name}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-sub">{style.description}</p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          {style.hasPreview && (
            <button onClick={() => setPreview(preview === 'light' ? 'off' : 'light')} className="btn-sm">浅色预览</button>
          )}
          {style.hasDark && (
            <button onClick={() => setPreview(preview === 'dark' ? 'off' : 'dark')} className="btn-sm">深色预览</button>
          )}
        </div>
      </div>
      {src && (
        <div className="border-t border-edge">
          <iframe src={src} title={`${style.name} 预览`} className="h-[420px] w-full border-0 bg-white" />
        </div>
      )}
    </div>
  );
}

function DerivedCard({ style }: { style: DerivedStyle }) {
  const m = style.meta;
  const [copied, setCopied] = useState(false);
  if (!m) {
    return (
      <div className="rounded-xl border border-bad/40 bg-panel p-4 text-sm text-bad">
        <span className="font-mono">{style.dir}</span> — meta.json 异常：{style.metaError}
      </div>
    );
  }
  const prompt = `学习 generated/styles/${m.id} 的 DESIGN.md（遵守仓库 AGENTS.md），可以再混入一点 ${m.lineage[0] ?? 'notion'}，做一个落地页。`;

  return (
    <div className="rounded-xl border border-edge bg-panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">{m.name} <span className="ml-1 font-mono text-xs text-faint">{m.id}</span></h3>
          <p className="mt-1.5 text-sm text-sub">{m.summary}</p>
        </div>
        <div className="text-right text-xs">
          <div className="font-semibold text-good">★ {m.rating.toFixed(1)}</div>
          <div className="mt-0.5 text-faint">继承 {m.inherited_rating.toFixed(1)}</div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {m.lineage.map((l) => <span key={l} className="chip">↳ {l}</span>)}
        <Link href={`/page/${m.source_page}`} className="chip transition-colors hover:border-accent/60 hover:text-accent">源自 {m.source_page}</Link>
        <span className={`chip ${style.childCountActual > 0 ? 'chip-on' : ''}`}>{style.childCountActual} 个子代页面</span>
      </div>
      <div className="mt-4 rounded-lg border border-dashed border-edge bg-base p-3">
        <div className="mb-1.5 text-[10px] uppercase tracking-widest text-faint">建议召唤指令（复制给 Agent）</div>
        <div className="flex items-start justify-between gap-3">
          <code className="min-w-0 break-all font-mono text-xs leading-relaxed text-sub">{prompt}</code>
          <button
            onClick={async () => { try { await navigator.clipboard.writeText(prompt); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {} }}
            className="btn-sm shrink-0"
          >
            {copied ? '已复制 ✓' : '复制'}
          </button>
        </div>
      </div>
    </div>
  );
}
