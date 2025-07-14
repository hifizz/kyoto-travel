import App from '@/app/App';
import { generatePhotoData } from '@/utils/photoUtils';
import { promises as fs } from 'fs';
import path from 'path';
import type { PhotoData } from '@/types';

export default async function Home() {
  const metadataPath = path.join(process.cwd(), 'data/photo-metadata.json');
  const metadataFile = await fs.readFile(metadataPath, 'utf8');
  const metadata = JSON.parse(metadataFile);

  // 直接基于元数据生成照片数据
  const photoData: PhotoData[] = generatePhotoData(metadata);

  return <App photoData={photoData} />;
}
