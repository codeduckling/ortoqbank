'use server';

import ImageKit from 'imagekit';
import sharp from 'sharp';

const imageKit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

// Image optimization constants
const IMAGE_OPTIMIZATION = {
  FORMAT: 'webp',
  QUALITY: 80, // 80% quality - good balance between size and quality
  MAX_WIDTH: 500, // 500px max width for content images
} as const;

export async function uploadToImageKit(file: File) {
  const arrayBuffer = await file.arrayBuffer();

  // Optimize image before upload
  const optimizedBuffer = await sharp(Buffer.from(arrayBuffer))
    .webp({ quality: IMAGE_OPTIMIZATION.QUALITY })
    .resize(IMAGE_OPTIMIZATION.MAX_WIDTH, undefined, {
      withoutEnlargement: true,
    })
    .toBuffer();

  try {
    const response = await imageKit.upload({
      file: optimizedBuffer,
      fileName: `${file.name.split('.')[0]}.${IMAGE_OPTIMIZATION.FORMAT}`,
      useUniqueFileName: true,
    });

    return response.url;
  } catch (error) {
    console.error('ImageKit upload failed:', error);
    throw error;
  }
}
