import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const imagesDir = path.join(process.cwd(), 'public/images');
const metadataPath = path.join(process.cwd(), 'data/photo-metadata.json');

async function generateMetadata() {
  try {
    console.log('Starting metadata generation...');

    const imageFiles = await fs.readdir(imagesDir);
    console.log(`Found ${imageFiles.length} images in ${imagesDir}`);

    let metadata = {};
    try {
      const existingData = await fs.readFile(metadataPath, 'utf-8');
      metadata = JSON.parse(existingData);
      console.log('Successfully read existing metadata.');
    } catch (error) {
      console.warn('Could not read existing metadata file. A new one will be created.');
    }

    let updatedCount = 0;
    for (const file of imageFiles) {
      if (!/\.jpe?g|png|webp|tiff$/i.test(file)) {
        console.log(`Skipping non-image file: ${file}`);
        continue;
      }

      if (metadata[file] && metadata[file].width && metadata[file].height && metadata[file].blurDataURL) {
        // console.log(`Skipping ${file}, metadata already exists.`);
        continue;
      }

      try {
        const imagePath = path.join(imagesDir, file);
        const image = sharp(imagePath);
        const { width, height } = await image.metadata();

        // Generate a low-quality placeholder
        const placeholderBuffer = await image.resize(10).jpeg({ quality: 50 }).toBuffer();
        const blurDataURL = `data:image/jpeg;base64,${placeholderBuffer.toString('base64')}`;

        if (!metadata[file]) {
          metadata[file] = {};
        }

        metadata[file] = {
          ...metadata[file],
          width,
          height,
          blurDataURL,
        };
        
        updatedCount++;
        console.log(`Processed ${file}: width=${width}, height=${height}`);
      } catch (err) {
        console.error(`Error processing ${file}:`, err);
      }
    }

    if (updatedCount > 0) {
        await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
        console.log(`Successfully updated metadata for ${updatedCount} images and saved to ${metadataPath}`);
    } else {
        console.log('No new images to process. Metadata file is up to date.');
    }


  } catch (error) {
    console.error('An error occurred during metadata generation:', error);
  }
}

generateMetadata(); 