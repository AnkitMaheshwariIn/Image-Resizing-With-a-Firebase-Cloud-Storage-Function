# Image-Resizing-With-a-Firebase-Cloud-Storage-Function

What this function does -> Image Resizing With a Firebase Cloud Storage Function.

The single most common Cloud Function use-case for a storage bucket is to resize images to thumbnails in the background.

Link to this code -> https://angularfirebase.com/lessons/image-thumbnail-resizer-cloud-function/

## NOTE: VARIOUS OTHER MODIFICATIONS DONE IN THIS CODE TO GET THIS CODE WORKING WITHOUT ERRORS.


---------------------------------------------------------------------------------------------


AFTER CLONING THIS REPOSITORY
1. Run: firebase use --add
- to select the desired project.

2. then Run: firebase deploy --only functions
- to deploy to firebase cloud functions


---------------------------------------------------------------------------------------------


Note/Warnining:
It is very easy to trigger an infinite loop in a Storage function. In this function, we give our thumbs a special name of thumb@ and exit the early if this string exists in the file name. Otherwise, each thumb upload would trigger more uploads for ever and ever until the end of time… Leaving us tons of files to delete and a huge Firebase bill.

Other Info:
Thumbnail Generator
Now we’re ready to build the function. The most difficult part of this function is keeping track of the file paths. We need to (1) download the source file to the function’s filesystem, then (2) save the thumbnails to the filesystem, and finally (3) upload the thumbs back to the storage bucket.

For more detail click here: https://angularfirebase.com/lessons/image-thumbnail-resizer-cloud-function/