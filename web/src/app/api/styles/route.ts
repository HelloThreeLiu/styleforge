import { NextResponse } from 'next/server';
import { listDerivedStyles, listSeedStyles } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ seed: listSeedStyles(), derived: listDerivedStyles() });
}
