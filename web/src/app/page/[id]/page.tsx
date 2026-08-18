import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPage } from '@/lib/store';
import PreviewFrame from '@/components/PreviewFrame';
import CurationPanel from '@/components/CurationPanel';
import Markdown from '@/components/Markdown';
import { INNOVATION_LABEL, ORIGIN_LABEL, PAGE_TYPE_LABEL, STATUS_LABEL } from '@/lib/labels';

export const dynamic = 'force-dynamic';

export default async function PageDetail({ params }: { params: { id: string } }) {
  const data = getPage(params.id);
  if (!data) notFound();
  const { meta, metaError, notes, dir } = data;

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <Link href="/" className="text-sm text-sub transition-colors hover:text-ink">← 返回画廊</Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{meta?.title ?? dir}</h1>
          <p className="mt-1.5 font-mono text-xs text-faint">{dir}</p>
        </div>
        {meta && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="chip chip-on">{ORIGIN_LABEL[meta.origin]}</span>
            <span className="chip">{PAGE_TYPE_LABEL[meta.page_type]}</span>
            <span className="chip">{INNOVATION_LABEL[meta.innovation]}</span>
            <span className="chip">{STATUS_LABEL[meta.status]}</span>
            {meta.lineage.length > 0 ? (
              meta.lineage.map((l) => (
                <Link key={l} href={`/styles?style=${encodeURIComponent(l)}`} className="chip transition-colors hover:border-accent/60 hover:text-accent">
                  ↳ {l}
                </Link>
              ))
            ) : (
              <span className="chip">↳ 无谱系（原创）</span>
            )}
          </div>
        )}
      </div>

      {metaError && (
        <div className="mt-4 rounded-lg border border-bad/40 bg-bad/10 px-4 py-3 text-sm text-bad">
          元数据异常（降级展示）：{metaError}
        </div>
      )}

      {meta && <PreviewFrame id={dir} />}

      <div className="mt-8 grid gap-8 lg:grid-cols-[380px_1fr]">
        <div className="space-y-8">
          {meta && <CurationPanel id={dir} initial={meta} />}
          {meta && (
            <section className="rounded-xl border border-edge bg-panel p-5">
              <h2 className="mb-3 text-sm font-semibold text-sub">元数据</h2>
              <dl className="space-y-2 text-sm">
                <Row k="生成者" v={meta.generator.agent} />
                <Row k="召唤人" v={meta.generator.invoked_by} />
                <Row k="创建时间" v={meta.created_at.replace('T', ' ').slice(0, 16)} />
                <Row k="AI 标签" v={meta.tags_ai.join(' · ')} />
                <Row k="人工标签" v={meta.tags_user.length ? meta.tags_user.join(' · ') : '—'} />
              </dl>
            </section>
          )}
        </div>
        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-sub">设计笔记（notes.md）</h2>
            <span className="text-xs text-faint">{notes ? '' : '未找到'}</span>
          </div>
          {notes ? (
            <div className="rounded-xl border border-edge bg-panel p-6">
              <Markdown source={notes} />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-edge p-6 text-sm text-faint">该页面没有设计笔记。</div>
          )}
        </section>
      </div>
    </main>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-20 shrink-0 text-faint">{k}</dt>
      <dd className="min-w-0 break-words text-sub">{v}</dd>
    </div>
  );
}
