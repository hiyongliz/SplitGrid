export interface SplitImage {
  id: string;
  blob: Blob;
  dataUrl: string;
  row: number;
  col: number;
  filename: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface GridConfig {
  rows: number;
  cols: number;
}

export interface AnalysisResult {
  summary: string;
  suggestedFilename: string;
}

// Augment window for external libs loaded via script tag
declare global {
  interface Window {
    JSZip: any;
    saveAs: any;
  }
}