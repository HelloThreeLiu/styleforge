'use client';

import { useState } from 'react';

const DEVICES = [
  { label: '桌面', width: 1280 },
  { label: '平板', width: 768 },
  { label: '手机', width: 375 },
];

export default function PreviewFrame({ id }: { id: string }) {
  const [width, setWidth] = useState(1280);
  const [nonce, setNonce] = useState(0);
  const src = `/preview/pages/${id}/index.html?_=${nonce}`;

  return (
    <section className="mt-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-edge bg-panel p-1">
          {DEVICES.map((d) => (
            <button
              key={d.width}
              onClick={() => setWidth(d.width)}
              className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                width === d.width ? 'bg-accentSoft font-semibold text-accent' : 'text-sub hover:text-ink'
              }`}
            >
              {d.label} <span className="ml-1 text-[10px] opacity-60">{d.width}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setNonce((n) => n + 1)} className="btn-sm">刷新</button>
          <a href={src} target="_blank" rel="noreferrer" className="btn-sm">新窗口打开 ↗</a>
        </div>
      </div>
      <div className="flex justify-center rounded-xl border border-edge bg-panel2 p-3">
        <div
          className="h-[640px] max-w-full overflow-hidden rounded-lg border border-edge bg-white shadow-2xl transition-[width] duration-200"
          style={{ width }}
        >
          <iframe
            key={`${width}-${nonce}`}
            src={`/preview/pages/${id}/index.html?_=${nonce}`}
            title={`页面预览 ${id}`}
            className="h-full w-full border-0"
          />
        </div>
      </div>
    </section>
  );
}
