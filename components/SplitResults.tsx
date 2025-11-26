import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { downloadZip } from '../services/imageUtils';
import { GridConfig, SplitImage } from '../types';

interface SplitResultsProps {
  splits: SplitImage[];
  gridConfig: GridConfig;
  baseFilename: string;
  onReset: () => void;
}

const SplitResults: React.FC<SplitResultsProps> = ({ splits, gridConfig, baseFilename, onReset }) => {
  const { t } = useLanguage();

  const handleDownloadAll = () => {
    downloadZip(splits, `${baseFilename}_split`);
  };

  const handleDownloadSingle = (split: SplitImage) => {
    if (window.saveAs) {
      window.saveAs(split.blob, split.filename);
    } else {
      const link = document.createElement('a');
      link.href = split.dataUrl;
      link.download = split.filename;
      link.click();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-700 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{t('yourSlices')}</h2>
          <p className="text-slate-400 text-sm">
            {t('generatedInfo', { count: splits.length, rows: gridConfig.rows, cols: gridConfig.cols })}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onReset}
            className="px-6 py-2 rounded-lg text-sm font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 hover:text-white transition-colors"
          >
            {t('createNew')}
          </button>
          <button
            onClick={handleDownloadAll}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {t('downloadZip')}
          </button>
        </div>
      </div>

      <div
        className="grid gap-4 mx-auto p-4 bg-slate-800 rounded-lg shadow-inner"
        style={{
          gridTemplateColumns: `repeat(${gridConfig.cols}, minmax(0, 1fr))`
        }}
      >
        {splits.map((split) => (
          <div key={split.id} className="relative group aspect-square">
            <img
              src={split.dataUrl}
              alt={`Row ${split.row + 1} Col ${split.col + 1}`}
              className="w-full h-full object-cover border border-slate-600 rounded-sm"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-sm">
              <button
                onClick={() => handleDownloadSingle(split)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-colors"
                title={t('downloadSlice')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
            <div className="absolute top-1 left-1 bg-black/70 text-[10px] text-white px-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none">
              {split.row + 1},{split.col + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SplitResults;
