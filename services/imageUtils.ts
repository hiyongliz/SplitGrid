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
  const { rows, cols } = config;
  const chunkWidth = image.width / cols;
  const chunkHeight = image.height / rows;
  const splits: SplitImage[] = [];

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  canvas.width = chunkWidth;
  canvas.height = chunkHeight;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Clear canvas for new draw
      ctx.clearRect(0, 0, chunkWidth, chunkHeight);

      // Draw the specific section of the source image
      ctx.drawImage(
        image,
        c * chunkWidth, // source x
        r * chunkHeight, // source y
        chunkWidth, // source width
        chunkHeight, // source height
        0, // dest x
        0, // dest y
        chunkWidth, // dest width
        chunkHeight // dest height
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