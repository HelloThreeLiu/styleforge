import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'StyleForge — Agent 驱动的 UI 设计平台',
  description: '学习风格 · 生成页面 · 人工策展 · 风格进化',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-base text-ink font-sans">
        <header className="sticky top-0 z-40 border-b border-edge bg-base/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-accent text-sm font-bold text-white">S</span>
                <span className="text-[15px] font-semibold tracking-tight">StyleForge</span>
              </Link>
              <nav className="flex items-center gap-5 text-sm text-sub">
                <Link href="/" className="transition-colors hover:text-ink">画廊</Link>
                <Link href="/styles" className="transition-colors hover:text-ink">风格库</Link>
              </nav>
            </div>
            <span className="hidden text-xs text-faint sm:block">本地平台 · 文件即数据库</span>
          </div>
        </header>
        {children}
        <footer className="border-t border-edge py-8">
          <div className="mx-auto max-w-7xl px-6 text-xs text-faint">
            StyleForge · Agent 生成 · 人工策展 · 高分沉淀 · 谱系可溯 — 见 docs/PRD.md
          </div>
        </footer>
      </body>
    </html>
  );
}
