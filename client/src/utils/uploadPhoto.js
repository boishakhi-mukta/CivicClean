// ─────────────────────────────────────────────────────────────────────────────
// uploadPhoto.js — All the helper functions for handling photo files.
//
// Functions:
//
//   validatePhotoFile(file)
//     Checks that the chosen file is a JPG/PNG/WebP and is under 5 MB.
//     Returns an error string if invalid, or null if the file is fine.
//
//   readPhotoAsDataUrl(file)
//     Converts a photo file into a base64 string that can be stored directly
//     in the database and displayed in an <img> tag — no hosting needed.
//     Used as a fallback when Firebase Storage upload fails.
//
//   uploadPhotoFile(file, options)
//     Uploads a photo to Firebase Storage (Google's file hosting service).
//     Reports progress (0–100%) while uploading.
//     Times out after 3 seconds to avoid the user waiting forever if Firebase
//     Storage rules block the upload.
//     Returns the public HTTPS download URL on success.
//
//   uploadPhotoWithFallback(file, options)
//     The safe version to call from components.
//     Tries uploadPhotoFile first; if that fails for any reason, automatically
//     falls back to readPhotoAsDataUrl so the user always gets a photo saved.
//
// MAX_PHOTO_SIZE_MB — exported constant (5 MB) used in PhotoUploader's hint text.
//
// getUploadErrorMessage(error) — converts Firebase Storage error codes into
//     plain-English messages the user can understand.
// ─────────────────────────────────────────────────────────────────────────────

import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { app } from '../firebase/firebase.config';

// Maximum allowed file size in megabytes
export const MAX_PHOTO_SIZE_MB = 5;

// Translates Firebase Storage error codes into human-readable messages
export const getUploadErrorMessage = (error) => {
  if (error?.code === 'storage/unauthorized') {
    return 'Upload blocked by Firebase Storage rules. Please allow authenticated image uploads.';
  }
  if (error?.code === 'storage/unauthenticated') {
    return 'Please log in before uploading a photo.';
  }
  if (error?.code === 'storage/canceled') {
    return 'Upload canceled.';
  }
  if (error?.code === 'storage/retry-limit-exceeded') {
    return 'Upload timed out. Please try again.';
  }
  return error?.message || 'Upload failed. Please try again.';
};

// Checks file type and size — returns an error string or null
export const validatePhotoFile = (file) => {
  if (!file) return 'Please choose a photo.';
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return 'Please choose a JPG, PNG, or WebP image.';
  }
  if (file.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
    return `File too large. Max ${MAX_PHOTO_SIZE_MB}MB allowed.`;
  }
  return null; // file is valid
};

// Reads a photo file and returns it as a base64 data URL string
// (a long text string that encodes the entire image — can be used as an img src)
export const readPhotoAsDataUrl = (file) => (
  new Promise((resolve, reject) => {
    const validationError = validatePhotoFile(file);
    if (validationError) {
      reject(new Error(validationError));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the selected photo.'));
    reader.readAsDataURL(file);
  })
);

// Generates a unique storage path to avoid name collisions
// e.g. "avatars/1704067200000_abc123_my_photo.jpg"
const createStoragePath = (folder, fileName) => {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_'); // remove special characters
  const randomId = window.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
  return `${folder}/${Date.now()}_${randomId}_${safeName}`;
};

// Uploads a file to Firebase Storage with progress reporting
// Times out after 3 seconds to avoid blocking the user indefinitely
export const uploadPhotoFile = (file, { folder = 'avatars', onProgress, timeoutMs = 3000 } = {}) => {
  const validationError = validatePhotoFile(file);
  if (validationError) {
    return Promise.reject(new Error(validationError));
  }

  const storage = getStorage(app);
  const storageRef = ref(storage, createStoragePath(folder, file.name));
  const task = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    // Cancel the upload and reject if it takes too long
    const timeout = setTimeout(() => {
      task.cancel();
      reject(new Error('storage/timeout'));
    }, timeoutMs);

    task.on(
      'state_changed',
      // Progress update — calculate percentage and pass to the caller
      (snapshot) => {
        onProgress?.(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
      },
      // Upload failed
      (error) => {
        clearTimeout(timeout);
        reject(error);
      },
      // Upload complete — get the public download URL
      async () => {
        clearTimeout(timeout);
        try {
          resolve(await getDownloadURL(task.snapshot.ref));
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};

// The safe wrapper to call from components.
// If Firebase Storage upload fails, falls back to saving the photo as base64
// so the user always ends up with their photo saved one way or another.
export const uploadPhotoWithFallback = async (file, options = {}) => {
  try {
    return await uploadPhotoFile(file, options);
  } catch (error) {
    console.warn('Firebase photo upload failed, saving local image data instead:', error);
    return readPhotoAsDataUrl(file);
  }
};
