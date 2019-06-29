import * as functions from 'firebase-functions';

// What this function does -> Image Resizing With a Firebase Cloud Storage Function
// The single most common Cloud Function use-case for a storage bucket is to resize images to thumbnails in the background.

// Link to this code -> https://angularfirebase.com/lessons/image-thumbnail-resizer-cloud-function/
// Note: various other modifications done in this code to get this code working without errors.

import * as Storage from '@google-cloud/storage';
const gcs = Storage();

import { tmpdir } from 'os';
import { join, dirname } from 'path';

import * as sharp from 'sharp';
import * as fs from 'fs-extra';

export const generateThumbs = functions.storage
  .object()
  .onFinalize(async object => {
    const bucket = gcs.bucket(object.bucket);
    const filePath = object.name;
    const fileName = filePath.split('/').pop();
    
    const bucketDir = dirname(filePath);

    const workingDir = join(tmpdir(), 'thumbs');
    console.log('Code updated!!');
    const timestamp = Math.floor(Date.now() / 1000);
    const tmpFilePath = join(workingDir, 'source_' + timestamp + '.png');

    // CONTINUE WITH ACTUAL PROCESS
    if ((fileName.includes('thumb@') || !object.contentType.includes('image'))) {
      console.log('exiting function');
      return false;
    } else {
      console.log('continuing function');
    }

    // 1. Ensure thumbnail dir exists
    await fs.ensureDir(workingDir);

    // 2. Download Source File
    await bucket.file(filePath).download({
      destination: tmpFilePath
    });

    // 3. Resize the images and define an array of upload promises
    const sizes = [64, 128, 256];

    const uploadPromises = sizes.map(async size => {
      const thumbName = `thumb@${size}_${fileName}`;
      const thumbPath = join(workingDir, thumbName);

      // Resize source image
      await sharp(tmpFilePath)
        .resize(size, size)
        .toFile(thumbPath);

      // Upload to GCS
      return bucket.upload(thumbPath, {
        destination: join(bucketDir, thumbName)
      });
    });

    // 4. Run the upload operations
    await Promise.all(uploadPromises);

    // 5. Cleanup remove the tmp/thumbs from the filesystem
    return fs.remove(workingDir);
  });
