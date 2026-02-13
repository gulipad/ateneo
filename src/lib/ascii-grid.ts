function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

type GridOptions = {
  availableWidth: number;
  availableHeight: number;
  charWidth: number;
  lineHeight: number;
  imageWidth: number;
  imageHeight: number;
  minCols?: number;
  minRows?: number;
  maxCols?: number;
};

export function calculateAsciiGrid(options: GridOptions) {
  const {
    availableWidth,
    availableHeight,
    charWidth,
    lineHeight,
    imageWidth,
    imageHeight,
    minCols = 24,
    minRows = 24,
    maxCols = 520,
  } = options;

  const safeCharWidth = Math.max(0.001, charWidth);
  const safeLineHeight = Math.max(0.001, lineHeight);
  const maxByWidth = Math.max(1, Math.floor(availableWidth / safeCharWidth));
  const maxByHeight = Math.max(1, Math.floor(availableHeight / safeLineHeight));
  const limitedMaxCols = Math.min(maxByWidth, maxCols);

  const imageRatio = imageHeight / Math.max(1, imageWidth);
  const cellRatio = safeCharWidth / safeLineHeight;
  const targetRowsPerCol = imageRatio * cellRatio;
  const safeTarget = Math.max(0.0001, targetRowsPerCol);

  let cols = limitedMaxCols;
  let rows = Math.max(1, Math.round(cols * safeTarget));

  if (rows > maxByHeight) {
    rows = maxByHeight;
    cols = Math.max(1, Math.round(rows / safeTarget));
  }

  cols = clamp(cols, 1, limitedMaxCols);
  rows = clamp(rows, 1, maxByHeight);

  if (cols < minCols || rows < minRows) {
    const upscale = Math.max(minCols / Math.max(1, cols), minRows / Math.max(1, rows));
    cols = clamp(Math.round(cols * upscale), 1, limitedMaxCols);
    rows = clamp(Math.round(cols * safeTarget), 1, maxByHeight);
  }

  return { cols, rows };
}
