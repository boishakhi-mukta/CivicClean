import { useState, useRef } from 'react';
import { FiCamera } from 'react-icons/fi';
import toast from 'react-hot-toast';
import {
  MAX_PHOTO_SIZE_MB,
  uploadPhotoWithFallback,
  validatePhotoFile,
} from '../utils/uploadPhoto';

const PhotoUploader = ({
  currentUrl,
  displayName   = '',
  onUploadComplete,
  onFileSelected,
  folder        = 'avatars',
  variant       = 'avatar',
  uploadOnSelect = true,
  successMessage = 'Photo uploaded!',
}) => {
  const [preview,   setPreview]   = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const inputRef = useRef(null);

  const displaySrc = preview || currentUrl || null;
  const initial    = (displayName || '?').charAt(0).toUpperCase();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validationError = validatePhotoFile(file);
    if (validationError) { toast.error(validationError); return; }

    setPreview(URL.createObjectURL(file));
    onFileSelected?.(file);

    if (!uploadOnSelect) return;

    setUploading(true);
    setProgress(0);

    try {
      const url = await uploadPhotoWithFallback(file, { folder, onProgress: setProgress });
      onUploadComplete(url);
      setUploading(false);
      toast.success(successMessage);
    } catch (error) {
      console.error('Photo upload failed:', error);
      setUploading(false);
      toast.error(error?.message || 'Upload failed. Please try again.');
    }
  };

  const imgClass = variant === 'avatar'
    ? 'w-20 h-20 rounded-full object-cover border-4 border-primary'
    : 'w-28 h-20 rounded-lg object-cover border-4 border-primary';

  return (
    <div className="flex items-center gap-5 mb-6 pb-6 border-b border-border">
      <div className="relative flex-shrink-0">
        {displaySrc ? (
          <img src={displaySrc} alt={variant === 'avatar' ? 'avatar' : 'uploaded preview'} className={imgClass} />
        ) : variant === 'avatar' ? (
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-3xl">
            {initial}
          </div>
        ) : (
          <div className="w-28 h-20 rounded-lg bg-surface-alt border-4 border-primary flex items-center justify-center text-muted">
            <FiCamera size={24} />
          </div>
        )}
        {uploading && (
          <div className={`absolute inset-0 ${variant === 'avatar' ? 'rounded-full' : 'rounded-lg'} bg-overlay/60 flex items-center justify-center`}>
            <span className="text-white text-xs font-bold">{progress}%</span>
          </div>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 bg-surface-alt text-text rounded-lg hover:bg-border/20 transition text-sm font-medium disabled:opacity-50"
        >
          <FiCamera size={15} />
          {uploading ? `Uploading ${progress}%…` : 'Choose Photo'}
        </button>
        <p className="text-xs text-muted mt-1.5">JPG, PNG or WebP · Max {MAX_PHOTO_SIZE_MB}MB</p>
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
