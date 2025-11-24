import React, { useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface DropzoneProps {
  onImageSelected: (file: File) => void;
}

const Dropzone: React.FC<DropzoneProps> = ({ onImageSelected }) => {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndPass(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndPass(e.target.files[0]);
    }
  };

  const validateAndPass = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(t('dropzoneError'));
      return;
    }
    onImageSelected(file);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer group ${
        isDragging
          ? 'border-indigo-500 bg-indigo-500/10'
          : 'border-slate-600 hover:border-indigo-400 hover:bg-slate-800'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p className="text-lg font-medium text-slate-200">
            {t('dropzoneTitle')} <span className="text-indigo-400">{t('dropzoneBrowse')}</span>
          </p>
          <p className="text-sm text-slate-400 mt-1">{t('dropzoneSupport')}</p>
        </div>
      </div>
    </div>
  );
};

export default Dropzone;