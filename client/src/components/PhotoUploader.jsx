// ─────────────────────────────────────────────────────────────────────────────
// PhotoUploader.jsx — A reusable photo picker and uploader widget.
//
// It is used in two places:
//   1. Profile page — lets a user change their avatar photo.
//   2. Report Issue form — lets a citizen attach a photo of the problem.
//
// How it works:
//   • The user clicks "Choose Photo" which opens the device's file picker.
//   • The selected image is shown immediately as a preview (so the user can
//     see their choice before anything is saved).
//   • The file is uploaded to Firebase Storage and a progress percentage
//     is shown on top of the preview while uploading.
//   • Once done, the public download URL is passed back to the parent component.
//
// If Firebase upload fails (e.g. Storage rules block it), the photo is saved
// as a base64 data string instead — a built-in safety fallback.
//
// Props:
//   currentUrl      — the existing photo URL to show before the user picks a new one
//   displayName     — used to generate an initial-letter placeholder if no photo exists
//   onUploadComplete — called with the final URL when upload finishes
//   onFileSelected   — called with the raw File object when a file is picked (before upload)
//   folder           — the Firebase Storage folder to upload into (e.g. "avatars")
//   variant          — "avatar" (round) or anything else (rectangular)
//   uploadOnSelect   — if false, the upload is deferred until the parent triggers it
//   successMessage   — the toast message to show when the upload succeeds
// ─────────────────────────────────────────────────────────────────────────────

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
  // Local preview URL — updated immediately when a file is chosen
  const [preview,   setPreview]   = useState(null);

  // True while the upload is in progress
  const [uploading, setUploading] = useState(false);

  // 0–100 upload progress shown on top of the preview image
  const [progress,  setProgress]  = useState(0);

  // Hidden file input element — triggered programmatically by the button
  const inputRef = useRef(null);

  // Show the local preview first; if none, fall back to the saved URL
  const displaySrc = preview || currentUrl || null;

  // First letter of the name, used when there is no photo to show
  const initial    = (displayName || '?').charAt(0).toUpperCase();

  // Called every time the user selects a file from their device
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reject files that are too large or the wrong type (only JPG/PNG/WebP allowed)
    const validationError = validatePhotoFile(file);
    if (validationError) { toast.error(validationError); return; }

    // Show the chosen image as a preview right away, before the upload starts
    setPreview(URL.createObjectURL(file));
    onFileSelected?.(file);

    // If the parent wants to handle the upload itself, stop here
    if (!uploadOnSelect) return;

    // Start uploading to Firebase Storage
    setUploading(true);
    setProgress(0);

    try {
      const url = await uploadPhotoWithFallback(file, { folder, onProgress: setProgress });
      onUploadComplete(url); // Pass the final URL back to the parent
      setUploading(false);
      toast.success(successMessage);
    } catch (error) {
      console.error('Photo upload failed:', error);
      setUploading(false);
      toast.error(error?.message || 'Upload failed. Please try again.');
    }
  };

  // Round border for avatars, rectangular for issue photos
  const imgClass = variant === 'avatar'
    ? 'w-20 h-20 rounded-full object-cover border-4 border-primary'
    : 'w-28 h-20 rounded-lg object-cover border-4 border-primary';

  return (
    <div className="flex items-center gap-5 mb-6 pb-6 border-b border-border">

      {/* Left side: photo preview (or initial-letter / camera placeholder) */}
      <div className="relative flex-shrink-0">
        {displaySrc ? (
          <img src={displaySrc} alt={variant === 'avatar' ? 'avatar' : 'uploaded preview'} className={imgClass} />
        ) : variant === 'avatar' ? (
          /* No photo yet — show a circle with the user's initial letter */
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-3xl">
            {initial}
          </div>
        ) : (
          /* No photo yet — show a camera icon placeholder for issue photos */
          <div className="w-28 h-20 rounded-lg bg-surface-alt border-4 border-primary flex items-center justify-center text-muted">
            <FiCamera size={24} />
          </div>
        )}

        {/* Progress overlay shown while the file is uploading (e.g. "42%") */}
        {uploading && (
          <div className={`absolute inset-0 ${variant === 'avatar' ? 'rounded-full' : 'rounded-lg'} bg-overlay/60 flex items-center justify-center`}>
            <span className="text-white text-xs font-bold">{progress}%</span>
          </div>
        )}
      </div>

      {/* Right side: "Choose Photo" button + format hint */}
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()} // programmatically open the file picker
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 bg-surface-alt text-text rounded-lg hover:bg-border/20 transition text-sm font-medium disabled:opacity-50"
        >
          <FiCamera size={15} />
          {uploading ? `Uploading ${progress}%…` : 'Choose Photo'}
        </button>
        <p className="text-xs text-muted mt-1.5">JPG, PNG or WebP · Max {MAX_PHOTO_SIZE_MB}MB</p>

        {/* Hidden <input type="file"> — the button above clicks it invisibly */}
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
