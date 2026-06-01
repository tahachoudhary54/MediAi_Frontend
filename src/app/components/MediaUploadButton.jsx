"use client";
import { useState, useRef } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import axios from 'axios';
import api from '@/lib/api';

/**
 * MediaUploadButton
 * Uploads image to backend → Cloudinary → returns real secure_url via onUpload(url)
 * Props:
 *   onUpload: (url: string) => void   — called with Cloudinary URL after upload
 */
export default function MediaUploadButton({ onUpload, onClear }) {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      setError('Only image files are supported');
      return;
    }

    // Validate size (10 MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10 MB limit');
      return;
    }

    setError('');
    setProgress(0);

    // Show local preview immediately
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    // Upload to backend → Cloudinary
    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const res = await api.post(`/ai/upload-symptom-image`, formData, {
        onUploadProgress: (evt) => {
          if (evt.total) {
            setProgress(Math.round((evt.loaded / evt.total) * 100));
          }
        },
      });

      if (res.data.success) {
        const cloudinaryUrl = res.data.data.url;
        onUpload(cloudinaryUrl);
      } else {
        setError(res.data.message || 'Upload failed');
        setPreview(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Upload failed');
      setPreview(null);
    } finally {
      setUploading(false);
      setProgress(0);
      // Reset input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const clearImage = () => {
    setPreview(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
    if (onClear) onClear();
  };

  return (
    <div className="flex items-center gap-2">
      {/* Upload trigger */}
      <label
        className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-all
          ${uploading
            ? 'bg-teal-400 cursor-not-allowed text-white'
            : 'bg-teal-600 hover:bg-teal-700 text-white'
          }`}
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{progress > 0 ? `${progress}%` : 'Uploading…'}</span>
          </>
        ) : (
          <>
            <ImageIcon className="h-4 w-4" />
            <span>Image</span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </label>

      {/* Preview thumbnail */}
      {preview && !uploading && (
        <div className="relative w-10 h-10 rounded-md overflow-hidden border border-slate-200 shadow-sm flex-shrink-0">
          <img src={preview} alt="preview" className="object-cover w-full h-full" />
          <button
            onClick={clearImage}
            className="absolute top-0 right-0 bg-black/60 text-white rounded-bl-md p-0.5 hover:bg-black/80"
            title="Remove image"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Error message */}
      {error && <span className="text-red-600 text-xs max-w-[150px] leading-tight">{error}</span>}
    </div>
  );
}
