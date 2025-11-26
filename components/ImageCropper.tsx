import React, { useEffect, useRef, useState } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useLanguage } from '../contexts/LanguageContext';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedAreaPixels: PixelCrop) => void;
  onCancel: () => void;
  onSkip: () => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCropComplete, onCancel, onSkip }) => {
  const { t } = useLanguage();
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [zoom, setZoom] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    if (aspect) {
      setCrop(centerAspectCrop(width, height, aspect));
    } else {
      setCrop(centerCrop(
        {
          unit: '%',
          width: 90,
          height: 90
        },
        width,
        height
      ));
    }
  };

  useEffect(() => {
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      if (aspect) {
        setCrop(centerAspectCrop(width, height, aspect));
      }
    }
  }, [aspect]);


  const handleSave = () => {
    if (completedCrop && imgRef.current) {
      const img = imgRef.current;
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;

      const naturalCrop: PixelCrop = {
        ...completedCrop,
        x: completedCrop.x * scaleX,
        y: completedCrop.y * scaleY,
        width: completedCrop.width * scaleX,
        height: completedCrop.height * scaleY,
      };

      onCropComplete(naturalCrop);
    } else if (imgRef.current) {
      // If no crop interaction happened, use full image
      const { naturalWidth, naturalHeight } = imgRef.current;
      onCropComplete({
        unit: 'px',
        x: 0,
        y: 0,
        width: naturalWidth,
        height: naturalHeight
      });
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 rounded-xl overflow-hidden">
      <div className="relative flex-1 bg-black min-h-[400px] flex items-center justify-center p-4 overflow-auto">
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={aspect}
          className="max-h-full"
        >
          <img
            ref={imgRef}
            alt={t('cropImageAlt')}
            src={imageSrc}
            onLoad={onImageLoad}
            className="object-contain"
            style={{
              maxHeight: `${600 * zoom}px`,
              maxWidth: `${zoom * 100}%`
            }}
          />
        </ReactCrop>
      </div>

      <div className="p-6 bg-slate-800 border-t border-slate-700 flex flex-col gap-4">

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-400">{t('zoom')}</span>
          <input
            type="range"
            value={zoom}
            min={0.5}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <div className="flex gap-4 justify-end">
          <button
            onClick={onSkip}
            className="px-6 py-2 rounded-lg text-sm font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 hover:text-white transition-colors"
          >
            {t('skip')}
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-lg text-sm font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 hover:text-white transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-lg hover:shadow-indigo-500/25"
          >
            {t('crop')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
