import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  onImageUpload: (file: File | null) => void;
}

const MAX_IMAGE_DIMENSION = 1024; // Max width/height for the compressed image
const COMPRESSION_QUALITY = 0.85; // JPEG quality

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (files: FileList | null) => {
    const file = files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // Increased original file limit to 10MB
        alert("File is too large. Please select an image under 10MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          if (width > height) {
            if (width > MAX_IMAGE_DIMENSION) {
              height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
              width = MAX_IMAGE_DIMENSION;
            }
          } else {
            if (height > MAX_IMAGE_DIMENSION) {
              width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
              height = MAX_IMAGE_DIMENSION;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedDataUrl = canvas.toDataURL('image/jpeg', COMPRESSION_QUALITY);
          setImagePreview(compressedDataUrl);

          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              onImageUpload(compressedFile);
            }
          }, 'image/jpeg', COMPRESSION_QUALITY);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setImagePreview(null);
    onImageUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };
  
  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileChange(files);
  };
  
  return (
    <div>
      <label 
        className={`relative flex justify-center w-full h-64 px-4 transition bg-white border-2 ${imagePreview ? 'border-green-300' : 'border-gray-300 border-dashed'} rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none`}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {imagePreview ? (
          <>
            <img src={imagePreview} alt="Preview" className="object-contain h-full w-full" />
            <button
              type="button"
              onClick={handleClearImage}
              className="absolute top-2 right-2 bg-white/70 text-black rounded-full p-1.5 hover:bg-white"
              aria-label="Remove image"
            >
              &times;
            </button>
          </>
        ) : (
          <span className="flex flex-col items-center justify-center space-x-2 text-center">
            <UploadIcon className="w-10 h-10 text-gray-400"/>
            <span className="font-medium text-gray-600">
              Drop an image, or{' '}
              <span className="text-green-600 underline">browse</span>
            </span>
             <span className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</span>
          </span>
        )}
        <input 
          type="file" 
          name="file_upload" 
          className="hidden" 
          accept="image/png, image/jpeg, image/webp"
          onChange={(e) => handleFileChange(e.target.files)} 
          ref={fileInputRef}
        />
      </label>
    </div>
  );
};

export default ImageUploader;