import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from '@/lib/store';

/**
 * 静态资源预览路由：
 *   /preview/pages/<page-id>/index.html|screenshot.png → generated/pages/...
 *   /preview/seed/<style>/preview.html|preview-dark.html|DESIGN.md → awesome-design-md/design-md/...
 */
const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
};

export async function GET(_req: NextRequest, { params }: { params: { path: string[] } }) {
  const rel = params.path.join('/');
  let abs: string | null = null;
  if (rel.startsWith('pages/')) abs = path.join(ROOT, 'generated', rel);
  else if (rel.startsWith('seed/')) abs = path.join(ROOT, 'awesome-design-md', 'design-md', rel.slice(5));
  if (!abs) return new NextResponse('Not found', { status: 404 });

  const resolved = path.resolve(abs);
  if (!resolved.startsWith(path.resolve(ROOT))) return new NextResponse('Forbidden', { status: 403 });
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) return new NextResponse('Not found', { status: 404 });

  const buf = fs.readFileSync(resolved);
  const type = CONTENT_TYPES[path.extname(resolved).toLowerCase()] ?? 'application/octet-stream';
  return new NextResponse(new Uint8Array(buf), {
    headers: { 'content-type': type, 'cache-control': 'no-store' },
  });
}
