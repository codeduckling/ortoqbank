'use server';

import ImageKit from 'imagekit';

const imageKit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function uploadToImageKit(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const response = await imageKit.upload({
      file: buffer,
      fileName: file.name,
    });

    return response.url;
  } catch (error) {
    console.error('ImageKit upload failed:', error);
    throw error;
  }
}
