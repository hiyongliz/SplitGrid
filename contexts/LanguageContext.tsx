import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'en' | 'zh';

export const translations = {
  en: {
    appTitle: "SplitGrid",
    appSubtitle: "Split your images into perfect grids in seconds.",
    dropzoneTitle: "Drop your image here, or",
    dropzoneBrowse: "browse",
    dropzoneSupport: "Supports PNG, JPG, JPEG, WEBP",
    dropzoneError: "Please upload an image file.",
    gridSettings: "Grid Settings",
    rows: "Rows",
    cols: "Columns",
    processing: "Processing...",
    splitImage: "Split Image",
    chooseDifferent: "Choose Different Image",
    yourSlices: "Your Slices",
    generatedInfo: "{count} images generated ({rows}x{cols})",
    createNew: "Create New",
    downloadZip: "Download ZIP",
    downloadSlice: "Download this slice",
    splitError: "Failed to split image.",
    footer: "Powered by React and Tailwind",
  },
  zh: {
    appTitle: "SplitGrid",
    appSubtitle: "几秒钟内将您的图片完美切割成网格。",
    dropzoneTitle: "将图片拖到此处，或",
    dropzoneBrowse: "浏览",
    dropzoneSupport: "支持 PNG, JPG, JPEG, WEBP",
    dropzoneError: "请上传图片文件。",
    gridSettings: "网格设置",
    rows: "行数",
    cols: "列数",
    processing: "处理中...",
    splitImage: "切割图片",
    chooseDifferent: "选择其他图片",
    yourSlices: "切割结果",
    generatedInfo: "已生成 {count} 张图片 ({rows}x{cols})",
    createNew: "重新开始",
    downloadZip: "下载 ZIP",
    downloadSlice: "下载此切片",
    splitError: "图片切割失败。",
    footer: "基于 React 和 Tailwind 构建",
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en'], params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh');

  const t = (key: keyof typeof translations['en'], params?: Record<string, string | number>) => {
    let text = translations[language][key] || translations['en'][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};