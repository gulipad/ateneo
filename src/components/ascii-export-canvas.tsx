"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AsciiExport } from "@/lib/ascii-export";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hash3(a: number, b: number, c: number) {
  const x = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453123;
  return x - Math.floor(x);
}

type AsciiExportCanvasProps = {
  artifact: AsciiExport | string;
  className?: string;
  fit?: "contain" | "cover";
  trimWhitespace?: boolean;
};

function trimAsciiLines(lines: string[]) {
  let minRow = Number.POSITIVE_INFINITY;
  let maxRow = Number.NEGATIVE_INFINITY;
  let minCol = Number.POSITIVE_INFINITY;
  let maxCol = Number.NEGATIVE_INFINITY;

  for (let row = 0; row < lines.length; row += 1) {
    const source = lines[row] ?? "";
    for (let col = 0; col < source.length; col += 1) {
      if (source[col] === " ") continue;
      if (row < minRow) minRow = row;
      if (row > maxRow) maxRow = row;
      if (col < minCol) minCol = col;
      if (col > maxCol) maxCol = col;
    }
  }

  if (
    !Number.isFinite(minRow) ||
    !Number.isFinite(maxRow) ||
    !Number.isFinite(minCol) ||
    !Number.isFinite(maxCol)
  ) {
    return lines;
  }

  const out: string[] = [];
  for (let row = minRow; row <= maxRow; row += 1) {
    const source = lines[row] ?? "";
    let line = "";
    for (let col = minCol; col <= maxCol; col += 1) {
      line += source[col] ?? " ";
    }
    out.push(line);
  }
  return out;
}

export function AsciiExportCanvas({
  artifact,
  className,
  fit = "contain",
  trimWhitespace = false,
}: AsciiExportCanvasProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [viewport, setViewport] = useState({ width: 1200, height: 700 });

  const data = useMemo<AsciiExport | null>(() => {
    if (typeof artifact !== "string") return artifact;
    try {
      const parsed = JSON.parse(artifact) as AsciiExport;
      return parsed;
    } catch {
      return null;
    }
  }, [artifact]);
  const parseError = data ? null : "Invalid export JSON.";
  const sourceLines = useMemo(() => {
    if (!data) return [];
    return trimWhitespace ? trimAsciiLines(data.asciiLines) : data.asciiLines;
  }, [data, trimWhitespace]);
  const sourceCols = useMemo(
    () => sourceLines.reduce((max, line) => Math.max(max, line.length), 0),
    [sourceLines],
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const applySize = () => {
      const rect = host.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      setViewport((prev) =>
        prev.width === width && prev.height === height ? prev : { width, height },
      );
    };

    applySize();
    const observer = new ResizeObserver(applySize);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas || !data) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const mouse = { x: -1000, y: -1000, inside: false };
    let rafId = 0;

    const onPointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
      mouse.inside = true;
    };

    const onPointerLeave = () => {
      mouse.inside = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    host.addEventListener("pointermove", onPointerMove, { passive: true });
    host.addEventListener("pointerleave", onPointerLeave, { passive: true });

    const draw = (time: number) => {
      const width = viewport.width;
      const height = viewport.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetCanvasWidth = Math.floor(width * dpr);
      const targetCanvasHeight = Math.floor(height * dpr);

      if (canvas.width !== targetCanvasWidth || canvas.height !== targetCanvasHeight) {
        canvas.width = targetCanvasWidth;
        canvas.height = targetCanvasHeight;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      context.fillStyle = data.render.background;
      context.fillRect(0, 0, width, height);

      const cols = trimWhitespace ? sourceCols : data.dimensions.cols || sourceCols;
      const rows = trimWhitespace ? sourceLines.length : data.dimensions.rows || sourceLines.length;
      if (!cols || !rows) {
        rafId = window.requestAnimationFrame(draw);
        return;
      }

      const baseFontSize = data.generation.fontSize;
      const baseCharWidth = baseFontSize * data.render.charWidthFactor;
      const baseLineHeight = baseFontSize * data.render.lineHeightFactor;
      const availableW = Math.max(1, width - data.render.paddingX * 2);
      const availableH = Math.max(1, height - data.render.paddingY * 2);
      const blockW = cols * baseCharWidth;
      const blockH = rows * baseLineHeight;
      const scaleX = availableW / Math.max(1, blockW);
      const scaleY = availableH / Math.max(1, blockH);
      const displayScale =
        fit === "cover" ? Math.max(scaleX, scaleY) : Math.min(1, scaleX, scaleY);
      const fontSize = Math.max(1, baseFontSize * displayScale);
      const charWidth = Math.max(0.5, baseCharWidth * displayScale);
      const lineHeight = Math.max(1, baseLineHeight * displayScale);

      const drawBlockWidth = cols * charWidth;
      const drawBlockHeight = rows * lineHeight;
      const originX = Math.floor((width - drawBlockWidth) / 2);
      const originY = Math.floor((height - drawBlockHeight) / 2);
      const leftCols = Math.max(0, Math.ceil(originX / charWidth));
      const topRows = Math.max(0, Math.ceil(originY / lineHeight));
      const rightCols = Math.max(1, Math.ceil((width - originX) / charWidth));
      const bottomRows = Math.max(1, Math.ceil((height - originY) / lineHeight));
      const frameCols = leftCols + rightCols;
      const frameRows = topRows + bottomRows;
      const frameOriginX = originX - leftCols * charWidth;
      const frameOriginY = originY - topRows * lineHeight;

      const mouseCol = (mouse.x - frameOriginX) / charWidth;
      const mouseRow = (mouse.y - frameOriginY) / lineHeight;
      const mouseRadiusChars = data.effects.mouseRadius / Math.max(charWidth, lineHeight);
      const ramp = data.generation.ramp.length ? data.generation.ramp : " .:-=+*#%@";
      const rampIndexByChar = new Map<string, number>();
      for (let index = 0; index < ramp.length; index += 1) {
        rampIndexByChar.set(ramp[index], index);
      }
      const timeSeed = time * (0.0008 + data.effects.dynamismSpeed * 0.0004);

      context.fillStyle = data.render.foreground;
      context.font = `${fontSize}px ${data.render.fontFamily}`;
      context.textBaseline = "top";

      for (let row = 0; row < frameRows; row += 1) {
        const sourceRow = row - topRows;
        const source =
          sourceRow >= 0 && sourceRow < sourceLines.length
            ? sourceLines[sourceRow] ?? ""
            : "";
        const chars = new Array<string>(frameCols);

        let glitchShift = 0;
        if (data.effects.glitchIntensity > 0) {
          const g = hash3(row, Math.floor(time * 0.025), 13.3);
          if (g < (data.effects.glitchIntensity / 100) * 0.18) {
            glitchShift =
              (hash3(row, Math.floor(time * 0.032), 89.1) - 0.5) *
              (data.effects.glitchIntensity / 100) *
              26 *
              displayScale;
          }
        }

        for (let col = 0; col < frameCols; col += 1) {
          const sourceCol = col - leftCols;
          let ch =
            sourceCol >= 0 && sourceCol < source.length
              ? source[sourceCol] ?? " "
              : " ";

          if (data.effects.charDynamism > 0 && ch !== " ") {
            const p = (data.effects.charDynamism / 100) * 0.16;
            const r = hash3(col, row, Math.floor(timeSeed * 60));
            if (r < p) {
              const current = rampIndexByChar.get(ch);
              if (current !== undefined) {
                const dir = hash3(row, col, Math.floor(timeSeed * 80) + 1) < 0.5 ? -1 : 1;
                const next = clamp(current + dir, 0, ramp.length - 1);
                ch = ramp[next];
              }
            }
          }

          if (data.effects.whitespaceNoise > 0 && ch === " ") {
            const p = (data.effects.whitespaceNoise / 100) * 0.22;
            const r = hash3(col * 1.7, row * 2.1, Math.floor(timeSeed * 90) + 7);
            if (r < p) ch = ".";
          }

          if (data.effects.mouseExpandEnabled && mouse.inside) {
            const dx = col - mouseCol;
            const dy = row - mouseRow;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const influence = Math.max(0, 1 - dist / mouseRadiusChars);
            if (influence > 0) {
              const strength = (data.effects.mouseStrength / 100) * influence;
              const r = hash3(col, row, Math.floor(timeSeed * 120) + 41);
              if (ch === " " && r < strength * 0.5) {
                ch = ".";
              } else if (ch !== " " && r < strength * 0.24) {
                const idx = rampIndexByChar.get(ch);
                if (idx !== undefined) ch = ramp[Math.min(ramp.length - 1, idx + 1)];
              }
            }
          }

          chars[col] = ch;
        }

        const rowBaseX = frameOriginX + glitchShift;
        const rowY = frameOriginY + row * lineHeight;
        for (let col = 0; col < frameCols; col += 1) {
          const ch = chars[col] ?? " ";
          if (ch === " ") continue;
          context.fillText(ch, rowBaseX + col * charWidth, rowY);
        }
      }

      if (data.effects.scanlineIntensity > 0) {
        context.fillStyle = `rgba(2, 8, 18, ${(data.effects.scanlineIntensity / 100) * 0.3})`;
        for (let y = 0; y < height; y += Math.max(2, Math.round(3 * displayScale))) {
          context.fillRect(0, y, width, 1);
        }
      }

      if (data.effects.noiseIntensity > 0) {
        const count = Math.floor((width * height * (data.effects.noiseIntensity / 100)) / 8000);
        for (let i = 0; i < count; i += 1) {
          const rx = Math.floor(hash3(i, Math.floor(time * 0.05), 91.9) * width);
          const ry = Math.floor(hash3(i, Math.floor(time * 0.07), 12.4) * height);
          const alpha = 0.08 + hash3(i, Math.floor(time * 0.09), 55.3) * 0.22;
          context.fillStyle = `rgba(216, 230, 255, ${alpha * (data.effects.noiseIntensity / 100)})`;
          context.fillRect(rx, ry, 1, 1);
        }
      }

      rafId = window.requestAnimationFrame(draw);
    };

    rafId = window.requestAnimationFrame(draw);
    return () => {
      window.cancelAnimationFrame(rafId);
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [data, fit, sourceCols, sourceLines, trimWhitespace, viewport.height, viewport.width]);

  return (
    <div ref={hostRef} className={`h-full w-full ${className ?? ""}`}>
      <canvas ref={canvasRef} className="block h-full w-full" />
      {parseError ? (
        <p className="px-3 py-2 text-[11px] text-red-300 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
          {parseError}
        </p>
      ) : null}
    </div>
  );
}
