import { listPages } from '@/lib/store';
import GalleryClient from '@/components/GalleryClient';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const pages = listPages();
  return <GalleryClient pages={pages} />;
}
