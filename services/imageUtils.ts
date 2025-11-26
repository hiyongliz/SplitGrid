import { GridConfig, SplitImage } from "../types";

export const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
  });
};

export const splitImage = async (
  image: HTMLImageElement,
  config: GridConfig,
  baseFilename: string
): Promise<SplitImage[]> => {
  const { rows: configRows, cols: configCols, rowPositions, colPositions } = config;

  // Treat 0 as 1 for splitting purposes (0 cuts = 1 piece)
  const rows = configRows === 0 ? 1 : configRows;
  const cols = configCols === 0 ? 1 : configCols;

  // Calculate cut points (in pixels)
  // Default equal distribution if no custom positions
  const rowCuts = [0];
  if (rowPositions && rowPositions.length === rows - 1) {
    rowPositions.forEach(p => rowCuts.push((p / 100) * image.height));
  } else {
    for (let i = 1; i < rows; i++) {
      rowCuts.push((i / rows) * image.height);
    }
  }
  rowCuts.push(image.height);

  const colCuts = [0];
  if (colPositions && colPositions.length === cols - 1) {
    colPositions.forEach(p => colCuts.push((p / 100) * image.width));
  } else {
    for (let i = 1; i < cols; i++) {
      colCuts.push((i / cols) * image.width);
    }
  }
  colCuts.push(image.width);

  const splits: SplitImage[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = colCuts[c];
      const y = rowCuts[r];
      const width = colCuts[c + 1] - colCuts[c];
      const height = rowCuts[r + 1] - rowCuts[r];

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      canvas.width = width;
      canvas.height = height;

      // Draw the specific section of the source image
      ctx.drawImage(
        image,
        x, // source x
        y, // source y
        width, // source width
        height, // source height
        0, // dest x
        0, // dest y
        width, // dest width
        height // dest height
      );

      // Convert to blob and data URL
      const dataUrl = canvas.toDataURL('image/png');
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/png')
      );

      splits.push({
        id: `row-${r}-col-${c}`,
        blob,
        dataUrl,
        row: r,
        col: c,
        filename: `${baseFilename}_row${r + 1}_col${c + 1}.png`
      });
    }
  }

  return splits;
};

export const downloadZip = async (images: SplitImage[], zipName: string) => {
  if (!window.JSZip || !window.saveAs) {
    console.error("JSZip or FileSaver not loaded");
    return;
  }

  const zip = new window.JSZip();
  images.forEach((img) => {
    zip.file(img.filename, img.blob);
  });

  const content = await zip.generateAsync({ type: "blob" });
  window.saveAs(content, `${zipName}.zip`);
};

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
