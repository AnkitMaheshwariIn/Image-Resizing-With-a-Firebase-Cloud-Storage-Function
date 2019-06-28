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
    const tmpFilePath = join(workingDir, 'source.png');

    // ********* ADDITIONAL PROCESS IN BETWEEN - STARTS *********
    console.log('object.contentType is - ' + object.contentType);
    if (object.contentType.includes('image')) {
      console.log('Object includes image');
    } else {
      console.log('Object not includes image');
    }

    // add extension .png to file - if contentType found 'application/octet-stream'
    // this is required because in website they are adding images in product without any extension
    // if extension (.png, .jpg, jpeg) are missing - so, first we need to add that extension
    if (object.contentType.includes('application/octet-stream')) {

      // 1. Ensure dir exists
      await fs.ensureDir(workingDir);

      // 2. Download Source File
      await bucket.file(filePath).download({
        destination: tmpFilePath
      });
      
      // 3. add extension to image
      const thumbName = `${fileName}.png`;

      console.log('add extension .png to file now, and upload to GCS');
      // Upload to GCS - Google Cloud Storage
      return bucket.upload(tmpFilePath, {
        destination: join(bucketDir, thumbName)
      });
      // this terminates function here.
    }
    // ********* ADDITIONAL PROCESS IN BETWEEN - OVER *********

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
