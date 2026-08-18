'use client';

import React from 'react';

/** 极简 Markdown 渲染：标题 / 段落 / 列表 / 表格 / 粗体 / 行内代码（内容为自家 notes.md，信任源） */

function inline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.filter(Boolean).map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={`${keyPrefix}-${i}`} className="font-semibold text-ink">{p.slice(2, -2)}</strong>;
    if (p.startsWith('`') && p.endsWith('`')) return <code key={`${keyPrefix}-${i}`} className="rounded bg-panel2 px-1.5 py-0.5 font-mono text-[0.85em] text-accent">{p.slice(1, -1)}</code>;
    return <React.Fragment key={`${keyPrefix}-${i}`}>{p}</React.Fragment>;
  });
}

export default function Markdown({ source }: { source: string }) {
  const lines = source.split('\n');
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  let table: string[][] = [];

  const flushList = () => {
    if (list.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="my-3 list-disc space-y-1 pl-5 text-sm text-sub">
          {list.map((item, i) => <li key={i}>{inline(item, `li-${blocks.length}-${i}`)}</li>)}
        </ul>
      );
      list = [];
    }
  };
  const flushTable = () => {
    if (table.length) {
      const [head, ...rows] = table;
      blocks.push(
        <div key={`tb-${blocks.length}`} className="my-4 overflow-x-auto rounded-lg border border-edge">
          <table className="w-full text-left text-xs">
            <thead className="bg-panel2 text-faint">
              <tr>{head.map((c, i) => <th key={i} className="px-3 py-2 font-medium">{inline(c, `th-${i}`)}</th>)}</tr>
            </thead>
            <tbody className="text-sub">
              {rows.map((r, ri) => (
                <tr key={ri} className="border-t border-edge">
                  {r.map((c, ci) => <td key={ci} className="px-3 py-2 align-top">{inline(c, `td-${ri}-${ci}`)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      table = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^\|.*\|$/.test(line.trim())) {
      const cells = line.trim().slice(1, -1).split('|').map((c) => c.trim());
      if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue; // 分隔行
      flushList();
      table.push(cells);
      continue;
    }
    flushTable();
    if (!line.trim()) { flushList(); continue; }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      flushList();
      const level = h[1].length;
      const content = inline(h[2], `h-${blocks.length}`);
      const cls = ['text-lg font-semibold mt-6 mb-2', 'text-base font-semibold mt-5 mb-2', 'text-sm font-semibold mt-4 mb-1.5', 'text-sm font-medium mt-3 mb-1'][level - 1];
      blocks.push(React.createElement(`h${Math.min(level + 1, 6)}`, { key: `h-${blocks.length}`, className: cls }, content));
      continue;
    }
    if (/^[-*]\s+/.test(line)) { list.push(line.replace(/^[-*]\s+/, '')); continue; }
    if (/^---+$/.test(line.trim())) { flushList(); blocks.push(<hr key={`hr-${blocks.length}`} className="my-5 border-edge" />); continue; }
    if (line.trim().startsWith('>')) { flushList(); blocks.push(<blockquote key={`bq-${blocks.length}`} className="my-3 border-l-2 border-accent/50 pl-4 text-sm italic text-sub">{inline(line.replace(/^>\s?/, ''), `bq-${blocks.length}`)}</blockquote>); continue; }
    flushList();
    blocks.push(<p key={`p-${blocks.length}`} className="my-2.5 text-sm leading-relaxed text-sub">{inline(line, `p-${blocks.length}`)}</p>);
  }
  flushList();
  flushTable();

  return <div className="markdown">{blocks}</div>;
}
