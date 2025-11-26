import React, { useCallback, useState } from 'react';
import Dropzone from './components/Dropzone';
import GridOverlay from './components/GridOverlay';
import Logo from './components/Logo';
import SplitResults from './components/SplitResults';
import { useLanguage } from './contexts/LanguageContext';
import { loadImage, splitImage } from './services/imageUtils';
import { GridConfig, SplitImage } from './types';

const App: React.FC = () => {
  // Hooks
  const { t, language, setLanguage } = useLanguage();

  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [gridConfig, setGridConfig] = useState<GridConfig>({ rows: 3, cols: 3 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitResult, setSplitResult] = useState<SplitImage[] | null>(null);

  // Handle file selection
  const handleImageSelected = useCallback((file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setSplitResult(null); // Reset results
  }, []);

  // Handle grid change
  const handleGridChange = (key: keyof GridConfig, value: number) => {
    setGridConfig(prev => {
      const newConfig = {
        ...prev,
        [key]: Math.max(1, Math.min(20, value)) // Clamp between 1 and 20
      };

      // Reset custom positions when grid size changes
      if (key === 'rows') {
        newConfig.rowPositions = undefined;
      }
      if (key === 'cols') {
        newConfig.colPositions = undefined;
      }
      return newConfig;
    });
  };

  const handleGridDrag = useCallback((type: 'row' | 'col', index: number, newPos: number) => {
    setGridConfig(prev => {
      const newConfig = { ...prev };

      if (type === 'row') {
        const positions = prev.rowPositions
          ? [...prev.rowPositions]
          : Array.from({ length: prev.rows - 1 }, (_, i) => ((i + 1) / prev.rows) * 100);
        positions[index] = newPos;
        // Sort to prevent crossing lines? Or just let them cross? 
        // Sorting is safer for logic but might feel jumpy. Let's just update.
        // Actually, sorting is good to keep index consistent with visual order if we wanted that,
        // but here index is tied to the specific divider.
        // Let's just clamp to neighbors to avoid crossing.

        // Simple update for now
        newConfig.rowPositions = positions.sort((a, b) => a - b);
      } else {
        const positions = prev.colPositions
          ? [...prev.colPositions]
          : Array.from({ length: prev.cols - 1 }, (_, i) => ((i + 1) / prev.cols) * 100);
        positions[index] = newPos;
        newConfig.colPositions = positions.sort((a, b) => a - b);
      }

      return newConfig;
    });
  }, []);

  // Split Action
  const handleSplit = async () => {
    if (!selectedFile || !imageSrc) return;

    setIsProcessing(true);
    try {
      const img = await loadImage(selectedFile);

      // Determine filename base
      let baseFilename = selectedFile.name.split('.')[0];

      const splits = await splitImage(img, gridConfig, baseFilename);
      setSplitResult(splits);
    } catch (error) {
      console.error("Split failed:", error);
      alert(t('splitError'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSplitResult(null);
    setSelectedFile(null);
    setImageSrc(null);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col items-center py-10 px-4 sm:px-6 relative">

      {/* Language Switcher */}
      <div className="absolute top-4 right-4 flex bg-slate-800 rounded-lg p-1 border border-slate-700">
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${language === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('zh')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${language === 'zh' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          中文
        </button>
      </div>

      {/* Header */}
      <header className="mb-12 text-center max-w-2xl mt-6 flex flex-col items-center">
        <Logo className="w-20 h-20 mb-4 opacity-90 hover:scale-105 transition-transform duration-300" />
        {console.log("Title:", t('appTitle'))}
        <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-400 mb-4">
          {t('appTitle')}
        </h1>
        <p className="text-slate-400 text-lg">
          {t('appSubtitle')}
        </p>
      </header>

      <main className="w-full max-w-5xl bg-slate-900/50 rounded-2xl border border-slate-800 backdrop-blur-sm p-6 md:p-10 shadow-2xl">

        {/* Upload View */}
        {!selectedFile && (
          <Dropzone onImageSelected={handleImageSelected} />
        )}

        {/* Editor View */}
        {selectedFile && imageSrc && !splitResult && (
          <div className="flex flex-col lg:flex-row gap-8 animate-fade-in">

            {/* Left: Image Preview */}
            <div className="flex-1 min-w-0">
              <GridOverlay
                imageSrc={imageSrc}
                config={gridConfig}
                onGridDrag={handleGridDrag}
              />
            </div>

            {/* Right: Controls */}
            <div className="w-full lg:w-80 flex flex-col gap-6">
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">{t('gridSettings')}</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">{t('rows')}</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={gridConfig.rows}
                        onChange={(e) => handleGridChange('rows', parseInt(e.target.value) || 1)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">{t('cols')}</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={gridConfig.cols}
                        onChange={(e) => handleGridChange('cols', parseInt(e.target.value) || 1)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSplit}
                  disabled={isProcessing}
                  className={`w-full py-3.5 px-6 rounded-lg font-bold text-white text-lg transition-all duration-200 transform hover:-translate-y-0.5
                            ${isProcessing
                      ? 'bg-slate-700 cursor-wait opacity-80'
                      : 'bg-[#5865F2] hover:bg-[#4752C4]'
                    }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('processing')}
                      </>
                    ) : (
                      t('splitImage')
                    )}
                  </span>
                </button>

                <button
                  onClick={handleReset}
                  className="w-full py-2 px-4 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  {t('chooseDifferent')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results View */}
        {
          splitResult && imageSrc && (
            <SplitResults
              splits={splitResult}
              gridConfig={gridConfig}
              baseFilename={selectedFile?.name.split('.')[0] || 'image'}
              onReset={handleReset}
            />
          )
        }

      </main >

      <footer className="mt-12 text-slate-500 text-sm">
        <p>{t('footer')}</p>
      </footer>
    </div >
  );
};

export default App;
