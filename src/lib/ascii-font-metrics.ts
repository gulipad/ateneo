function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function measureMonospaceCharWidth(
  fontSize: number,
  fontFamily: string,
  fallbackFactor: number,
) {
  if (typeof document === "undefined") return fontSize * fallbackFactor;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return fontSize * fallbackFactor;

  context.font = `${fontSize}px ${fontFamily}`;
  const sample = "MMMMMMMMMMMM";
  const width = context.measureText(sample).width / sample.length;
  if (!Number.isFinite(width) || width <= 0) return fontSize * fallbackFactor;
  return width;
}

export function measureAsciiVisualCharWidth(
  fontSize: number,
  fontFamily: string,
  ramp: string,
  fallbackFactor: number,
) {
  if (typeof document === "undefined") return fontSize * fallbackFactor;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return fontSize * fallbackFactor;

  context.font = `${fontSize}px ${fontFamily}`;
  const advance = measureMonospaceCharWidth(fontSize, fontFamily, fallbackFactor);
  const chars = [...new Set(ramp.replace(/\s/g, "").split(""))].slice(0, 64);

  let sum = 0;
  let count = 0;
  for (const ch of chars) {
    const m = context.measureText(ch);
    const ink = Math.abs(m.actualBoundingBoxLeft) + Math.abs(m.actualBoundingBoxRight);
    if (Number.isFinite(ink) && ink > 0) {
      sum += ink;
      count += 1;
    }
  }

  if (!count) return advance;
  const avgInk = sum / count;

  // Keep width in a safe range relative to advance width.
  return clamp(avgInk * 1.04, advance * 0.52, advance * 0.96);
}
