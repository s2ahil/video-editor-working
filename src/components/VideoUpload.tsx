import React, { useCallback, useState } from 'react';
import { Upload, Video, FileText } from 'lucide-react';

interface VideoUploadProps {
  onVideoUpload: (file: File) => void;
  uploadedVideo: File | null;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onVideoUpload, uploadedVideo }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        onVideoUpload(file);
      }
    }
  }, [onVideoUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('video/')) {
        onVideoUpload(file);
      }
    }
  }, [onVideoUpload]);

  if (uploadedVideo) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center space-x-3">
          <Video className="w-8 h-8 text-purple-500" />
          <div>
            <p className="text-white font-medium">{uploadedVideo.name}</p>
            <p className="text-gray-400 text-sm">
              {(uploadedVideo.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
        dragActive
          ? 'border-purple-500 bg-purple-500/10'
          : 'border-gray-600 hover:border-gray-500'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="video/*"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-white font-medium mb-2">
        Drag and drop your video here
      </p>
      <p className="text-gray-400 text-sm">
        or click to browse files
      </p>
      <p className="text-gray-500 text-xs mt-2">
        Supports MP4, MOV, AVI, and more
      </p>
    </div>
  );
};

export default VideoUpload;