import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { app } from '../firebase/firebase.config';

export const MAX_PHOTO_SIZE_MB = 5;

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

export const validatePhotoFile = (file) => {
  if (!file) return 'Please choose a photo.';
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return 'Please choose a JPG, PNG, or WebP image.';
  }
  if (file.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
    return `File too large. Max ${MAX_PHOTO_SIZE_MB}MB allowed.`;
  }
  return null;
};

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

const createStoragePath = (folder, fileName) => {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const randomId = window.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
  return `${folder}/${Date.now()}_${randomId}_${safeName}`;
};

export const uploadPhotoFile = (file, { folder = 'avatars', onProgress, timeoutMs = 10000 } = {}) => {
  const validationError = validatePhotoFile(file);
  if (validationError) {
    return Promise.reject(new Error(validationError));
  }

  const storage = getStorage(app);
  const storageRef = ref(storage, createStoragePath(folder, file.name));
  const task = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      task.cancel();
      reject(new Error('storage/timeout'));
    }, timeoutMs);

    task.on(
      'state_changed',
      (snapshot) => {
        onProgress?.(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
      },
      (error) => {
        clearTimeout(timeout);
        reject(error);
      },
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

export const uploadPhotoWithFallback = async (file, options = {}) => {
  try {
    return await uploadPhotoFile(file, options);
  } catch (error) {
    console.warn('Firebase photo upload failed, saving local image data instead:', error);
    return readPhotoAsDataUrl(file);
  }
};
