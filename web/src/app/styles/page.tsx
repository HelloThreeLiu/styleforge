import { listDerivedStyles, listSeedStyles } from '@/lib/store';
import StylesClient from '@/components/StylesClient';

export const dynamic = 'force-dynamic';

export default function StylesPage() {
  const seed = listSeedStyles();
  const derived = listDerivedStyles();
  return <StylesClient seed={seed} derived={derived} />;
}
