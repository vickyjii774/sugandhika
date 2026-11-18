import { useRef, useState, useCallback } from 'react';
import { Upload, X, Image } from 'lucide-react';

export default function ImageUpload({
  value,
  onChange,
  label = 'Upload Image',
  accept = 'image/*',
  maxSizeMB = 5,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const validate = (file) => {
    setError('');
    if (!file) return false;
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.');
      return false;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB.`);
      return false;
    }
    return true;
  };

  const handleFile = useCallback(
    (file) => {
      if (validate(file)) {
        onChange(file);
      }
    },
    [onChange]
  );

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleRemove = () => {
    onChange(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const previewUrl =
    value instanceof File ? URL.createObjectURL(value) : value;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}

      {previewUrl ? (
        <div className="relative inline-block group">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-xl border border-gray-200 shadow-sm"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition-colors"
            aria-label="Remove image"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative cursor-pointer flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-8 transition-all ${
            dragging
              ? 'border-brand bg-brand-cream/50'
              : 'border-gray-300 hover:border-brand hover:bg-brand-cream/30'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-brand-cream flex items-center justify-center">
            {dragging ? (
              <Image className="w-6 h-6 text-brand" />
            ) : (
              <Upload className="w-6 h-6 text-brand-light" />
            )}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              {dragging ? 'Drop to upload' : 'Click or drag to upload'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Accepts images up to {maxSizeMB}MB
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        aria-label={label}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
