import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
  id?: string;
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  className,
  id = 'image-upload',
}: ImageUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Convert files to base64
    const promises = acceptedFiles.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(base64Images => {
      const newImages = [...images, ...base64Images].slice(0, maxImages);
      onImagesChange(newImages);
    });
  }, [images, maxImages, onImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    maxFiles: maxImages - images.length,
    disabled: images.length >= maxImages,
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary',
          images.length >= maxImages && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} id={id} />
        {isDragActive ? (
          <p className="text-sm text-gray-600">Drop the images here...</p>
        ) : (
          <p className="text-sm text-gray-600">
            {images.length >= maxImages
              ? `Maximum ${maxImages} images allowed`
              : `Drag & drop images here, or click to select (${images.length}/${maxImages})`}
          </p>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Uploaded image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove image ${index + 1}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 