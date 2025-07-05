import App from '@/app/App';
import { generatePhotoData } from '@/utils/photoUtils';
import { promises as fs } from 'fs';
import path from 'path';
import type { PhotoData } from '@/types';

export default async function Home() {
  const basePhotoData = generatePhotoData();
  const metadataPath = path.join(process.cwd(), 'data/photo-metadata.json');
  const metadataFile = await fs.readFile(metadataPath, 'utf8');
  const metadata = JSON.parse(metadataFile);

  const photoData: PhotoData[] = basePhotoData.map((photo) => {
    const photoFilename = photo.original.split('/').pop();
    if (photoFilename && metadata[photoFilename]) {
      return {
        ...photo,
        ...metadata[photoFilename]
      };
    }
    return photo;
  });

  return <App photoData={photoData} />;
}
