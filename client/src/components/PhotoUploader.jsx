import { useState, useRef } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { FiCamera } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { app } from '../firebase/firebase.config';

const MAX_SIZE_MB = 5;

const PhotoUploader = ({ currentUrl, displayName = '', onUploadComplete }) => {
  const [preview,   setPreview]   = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const inputRef = useRef(null);

  const displaySrc = preview || currentUrl || null;
  const initial    = (displayName || '?').charAt(0).toUpperCase();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File too large. Max ${MAX_SIZE_MB}MB allowed.`);
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setProgress(0);

    try {
      const storage    = getStorage(app);
      const storageRef = ref(storage, `avatars/${Date.now()}_${file.name}`);
      const task       = uploadBytesResumable(storageRef, file);

      task.on(
        'state_changed',
        (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        () => {
          setUploading(false);
          toast.error('Upload failed. Please try again.');
        },
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          onUploadComplete(url);
          setUploading(false);
          toast.success('Photo uploaded!');
        }
      );
    } catch {
      setUploading(false);
      toast.error('Upload failed. Please try again.');
    }
  };

  return (
    <div className="flex items-center gap-5 mb-6 pb-6 border-b dark:border-gray-700">
      {/* Avatar preview */}
      <div className="relative flex-shrink-0">
        {displaySrc ? (
          <img
            src={displaySrc}
            alt="avatar"
            className="w-20 h-20 rounded-full object-cover border-4 border-[#d4ff00]"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-[#d4ff00] flex items-center justify-center text-[#1a3a2a] font-bold text-3xl">
            {initial}
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
            <span className="text-white text-xs font-bold">{progress}%</span>
          </div>
        )}
      </div>

      {/* Picker */}
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm font-medium disabled:opacity-50"
        >
          <FiCamera size={15} />
          {uploading ? `Uploading ${progress}%…` : 'Choose Photo'}
        </button>
        <p className="text-xs text-gray-400 mt-1.5">JPG, PNG or WebP · Max {MAX_SIZE_MB}MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default PhotoUploader;
