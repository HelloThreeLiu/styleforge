import { NextRequest, NextResponse } from 'next/server';
import { getPage, updatePage } from '@/lib/store';
import { pagePatchSchema } from '@/lib/schema';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const data = getPage(params.id);
  if (!data) return NextResponse.json({ error: '页面不存在' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求体不是合法 JSON' }, { status: 400 });
  }
  const patch = pagePatchSchema.safeParse(body);
  if (!patch.success) {
    return NextResponse.json({ error: patch.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') }, { status: 400 });
  }
  const result = updatePage(params.id, patch.data);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result.meta);
}
