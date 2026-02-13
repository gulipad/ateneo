"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const FULL_RAMP =
  " .'`^\",:;Il!i~+_-?][}{1)(|\\/*tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
const MONO_STACK =
  '"Geist Mono","SFMono-Regular",Menlo,Monaco,Consolas,"Liberation Mono",monospace';

const SETTINGS = {
  fontSize: 4,
  contrast: 121,
  whiteThreshold: 255,
  edgeThreshold: 32,
  varianceThreshold: 28,
  fidelity: 6,
  padX: 12,
  padY: 12,
  charWidthFactor: 0.62,
  lineHeightFactor: 1.2,
  charAspect: 0.56,
};

type HeroAsciiCanvasProps = {
  imageSrc: string;
};

type AsciiResult = {
  lines: string[];
  cols: number;
  rows: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildRamp(complexity: number) {
  const minLen = 12;
  const maxLen = FULL_RAMP.length;
  const t = (complexity - 1) / 9;
  const targetLen = Math.round(minLen + t * (maxLen - minLen));
  const chars: string[] = [];

  for (let i = 0; i < targetLen; i += 1) {
    const index = Math.round((i * (FULL_RAMP.length - 1)) / (targetLen - 1));
    chars.push(FULL_RAMP[index]);
  }

  return [...new Set(chars)].join("");
}

export function HeroAsciiCanvas({ imageSrc }: HeroAsciiCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [viewport, setViewport] = useState({ width: 1200, height: 680 });
  const [result, setResult] = useState<AsciiResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ramp = useMemo(() => buildRamp(SETTINGS.fidelity), []);

  useEffect(() => {
    const host = containerRef.current;
    if (!host) return;

    const updateViewport = () => {
      const rect = host.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      setViewport((prev) =>
        prev.width === width && prev.height === height ? prev : { width, height },
      );
    };

    updateViewport();
    const observer = new ResizeObserver(updateViewport);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const image = new Image();
    image.decoding = "async";

    image.onload = () => {
      if (cancelled) return;

      const availableW = Math.max(1, viewport.width - SETTINGS.padX * 2);
      const availableH = Math.max(1, viewport.height - SETTINGS.padY * 2);
      const charWidth = SETTINGS.fontSize * SETTINGS.charWidthFactor;
      const lineHeight = SETTINGS.fontSize * SETTINGS.lineHeightFactor;
      const maxCols = Math.max(24, Math.floor(availableW / Math.max(1, charWidth)));
      const maxRows = Math.max(24, Math.floor(availableH / Math.max(1, lineHeight)));
      const imageRatio = image.naturalHeight / image.naturalWidth;
      const rowsPerCol = imageRatio * SETTINGS.charAspect;
      const colsByHeight = Math.max(
        1,
        Math.floor(maxRows / Math.max(rowsPerCol, 0.0001)),
      );
      const cols = clamp(Math.min(maxCols, colsByHeight), 24, 520);
      const rows = clamp(Math.round(rowsPerCol * cols), 24, maxRows);

      const sample = SETTINGS.fidelity;
      const processCanvas = document.createElement("canvas");
      processCanvas.width = cols * sample;
      processCanvas.height = rows * sample;
      const context = processCanvas.getContext("2d", { willReadFrequently: true });

      if (!context) {
        setError("Could not create image processing context.");
        return;
      }

      context.drawImage(image, 0, 0, processCanvas.width, processCanvas.height);
      const pixels = context.getImageData(
        0,
        0,
        processCanvas.width,
        processCanvas.height,
      ).data;
      const width = processCanvas.width;
      const height = processCanvas.height;

      const luminanceAt = (x: number, y: number) => {
        const px = clamp(x, 0, width - 1);
        const py = clamp(y, 0, height - 1);
        const index = (py * width + px) * 4;
        const r = pixels[index] / 255;
        const g = pixels[index + 1] / 255;
        const b = pixels[index + 2] / 255;
        return 0.299 * r + 0.587 * g + 0.114 * b;
      };

      const contrastFactor = SETTINGS.contrast / 100;
      const whiteCutoff = SETTINGS.whiteThreshold / 255;
      const lines: string[] = [];

      for (let row = 0; row < rows; row += 1) {
        let line = "";
        const y0 = row * sample;

        for (let col = 0; col < cols; col += 1) {
          const x0 = col * sample;

          let sum = 0;
          let sumSquares = 0;
          for (let sy = 0; sy < sample; sy += 1) {
            for (let sx = 0; sx < sample; sx += 1) {
              const lum = luminanceAt(x0 + sx, y0 + sy);
              sum += lum;
              sumSquares += lum * lum;
            }
          }

          const count = sample * sample;
          const avg = sum / count;
          const variance = Math.max(0, sumSquares / count - avg * avg);

          const cx = x0 + Math.floor(sample / 2);
          const cy = y0 + Math.floor(sample / 2);
          const edgeMagnitude =
            (Math.abs(luminanceAt(cx + 1, cy) - luminanceAt(cx - 1, cy)) +
              Math.abs(luminanceAt(cx, cy + 1) - luminanceAt(cx, cy - 1))) *
            0.5;

          const edgeGate = clamp(
            (edgeMagnitude * 255 - SETTINGS.edgeThreshold) / 255,
            0,
            1,
          );
          const varianceGate = clamp(
            (Math.sqrt(variance) * 255 - SETTINGS.varianceThreshold) / 255,
            0,
            1,
          );

          let tone = (avg - 0.5) * contrastFactor + 0.5;
          const detailBoost = (edgeGate * 1.1 + varianceGate * 0.9) * 0.55;
          tone = clamp(tone - detailBoost * 0.28, 0, 1);

          if (tone >= whiteCutoff) {
            line += " ";
            continue;
          }

          const index = Math.floor((1 - tone) * (ramp.length - 1));
          line += ramp[index];
        }

        lines.push(line);
      }

      if (cancelled) return;
      setError(null);
      setResult({ lines, cols, rows });
    };

    image.onerror = () => {
      if (cancelled) return;
      setResult(null);
      setError(`Could not load image at ${imageSrc}`);
    };

    image.src = imageSrc;

    return () => {
      cancelled = true;
    };
  }, [imageSrc, ramp, viewport.height, viewport.width]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !result) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, viewport.width, viewport.height);
    context.fillStyle = "#02050b";
    context.fillRect(0, 0, viewport.width, viewport.height);

    const charWidth = SETTINGS.fontSize * SETTINGS.charWidthFactor;
    const lineHeight = SETTINGS.fontSize * SETTINGS.lineHeightFactor;
    const blockWidth = result.cols * charWidth;
    const blockHeight = result.rows * lineHeight;
    const originX = Math.floor((viewport.width - blockWidth) / 2);
    const originY = Math.floor((viewport.height - blockHeight) / 2);

    context.fillStyle = "#d8e6ff";
    context.font = `${SETTINGS.fontSize}px ${MONO_STACK}`;
    context.textBaseline = "top";

    for (let i = 0; i < result.lines.length; i += 1) {
      context.fillText(result.lines[i], originX, originY + i * lineHeight);
    }
  }, [result, viewport.height, viewport.width]);

  return (
    <div ref={containerRef} className="h-full w-full">
      <canvas ref={canvasRef} className="block w-full" />
      {error ? (
        <p className="px-3 py-2 text-[11px] text-red-300 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
