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
};

export function AsciiExportCanvas({
  artifact,
  className,
  fit = "contain",
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

      const cols = data.dimensions.cols || data.asciiLines[0]?.length || 0;
      const rows = data.dimensions.rows || data.asciiLines.length;
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
      const blockLeft = originX;
      const blockTop = originY;
      const blockRight = originX + drawBlockWidth;
      const blockBottom = originY + drawBlockHeight;

      const mouseCol = (mouse.x - originX) / charWidth;
      const mouseRow = (mouse.y - originY) / lineHeight;
      const mouseRadiusChars = data.effects.mouseRadius / Math.max(charWidth, lineHeight);
      const ramp = data.generation.ramp;
      const timeSeed = time * (0.0008 + data.effects.dynamismSpeed * 0.0004);

      context.fillStyle = data.render.foreground;
      context.font = `${fontSize}px ${data.render.fontFamily}`;
      context.textBaseline = "top";

      for (let row = 0; row < data.asciiLines.length; row += 1) {
        const source = data.asciiLines[row] ?? "";
        const chars = source.split("");

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

        for (let col = 0; col < chars.length; col += 1) {
          let ch = chars[col];

          if (data.effects.charDynamism > 0 && ch !== " ") {
            const p = (data.effects.charDynamism / 100) * 0.16;
            const r = hash3(col, row, Math.floor(timeSeed * 60));
            if (r < p) {
              const current = ramp.indexOf(ch);
              if (current >= 0) {
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
                const idx = ramp.indexOf(ch);
                if (idx >= 0) ch = ramp[Math.min(ramp.length - 1, idx + 1)];
              }
            }
          }

          chars[col] = ch;
        }

        context.fillText(chars.join(""), originX + glitchShift, originY + row * lineHeight);
      }

      // Extend whitespace-noise to the full canvas so the padded area also feels active.
      if (data.effects.whitespaceNoise > 0) {
        const density = (data.effects.whitespaceNoise / 100) * 0.018;
        const gridCols = Math.max(1, Math.floor(width / Math.max(charWidth, 1)));
        const gridRows = Math.max(1, Math.floor(height / Math.max(lineHeight, 1)));
        const salt = Math.floor(timeSeed * 42) + 911;

        for (let row = 0; row < gridRows; row += 1) {
          const y = row * lineHeight;
          for (let col = 0; col < gridCols; col += 1) {
            const x = col * charWidth;
            const insideBlock =
              x >= blockLeft && x <= blockRight && y >= blockTop && y <= blockBottom;
            if (insideBlock) continue;

            const r = hash3(col * 1.13, row * 0.87, salt);
            if (r < density) {
              context.fillText(".", x, y);
            }
          }
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
  }, [data, fit, viewport.height, viewport.width]);

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
