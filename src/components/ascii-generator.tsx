"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEventHandler,
} from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AsciiExport } from "@/lib/ascii-export";

const DEFAULT_IMAGE = "/ateneo-schematic.png";
const FULL_RAMP =
  " .'`^\",:;Il!i~+_-?][}{1)(|\\/*tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
const MONO_STACK =
  '"Geist Mono","SFMono-Regular",Menlo,Monaco,Consolas,"Liberation Mono",monospace';
const CHAR_WIDTH_FACTOR = 0.62;
const LINE_HEIGHT_FACTOR = 1.2;
const CHAR_ASPECT = 0.56;
const PREVIEW_PAD_X = 12;
const PREVIEW_PAD_Y = 12;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hash3(a: number, b: number, c: number) {
  const x = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453123;
  return x - Math.floor(x);
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

function copyWithFallback(value: string) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

type RowSliderProps = {
  label: string;
  min: number;
  max: number;
  value: number;
  suffix?: string;
  onChange: (value: number) => void;
};

function RowSlider({ label, min, max, value, suffix = "", onChange }: RowSliderProps) {
  return (
    <div className="grid grid-cols-[98px_1fr_52px] items-center border-b border-white/10 px-3 py-2 text-xs">
      <label>{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full"
      />
      <span className="text-right text-[11px] tabular-nums">
        {value}
        {suffix}
      </span>
    </div>
  );
}

type RowToggleProps = {
  label: string;
  value: "contain" | "cover";
  onChange: (value: "contain" | "cover") => void;
};

function RowToggle({ label, value, onChange }: RowToggleProps) {
  return (
    <div className="grid grid-cols-[98px_1fr_52px] items-center border-b border-white/10 px-3 py-2 text-xs">
      <label>{label}</label>
      <div className="grid h-7 grid-cols-2 overflow-hidden border border-white/15">
        <button
          type="button"
          onClick={() => onChange("contain")}
          className={`text-[10px] ${
            value === "contain" ? "bg-white/10 text-white" : "text-slate-300"
          }`}
        >
          Contain
        </button>
        <button
          type="button"
          onClick={() => onChange("cover")}
          className={`border-l border-white/15 text-[10px] ${
            value === "cover" ? "bg-white/10 text-white" : "text-slate-300"
          }`}
        >
          Cover
        </button>
      </div>
      <span className="text-right text-[10px] text-slate-300">
        {value === "contain" ? "fit" : "fill"}
      </span>
    </div>
  );
}

export function AsciiGenerator() {
  const objectUrlRef = useRef<string | null>(null);
  const previewHostRef = useRef<HTMLDivElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [imageSource, setImageSource] = useState(DEFAULT_IMAGE);
  const [imageLabel, setImageLabel] = useState("default");

  const [fontSize, setFontSize] = useState(7);
  const [contrast, setContrast] = useState(160);
  const [whiteThreshold, setWhiteThreshold] = useState(228);
  const [edgeThreshold, setEdgeThreshold] = useState(32);
  const [varianceThreshold, setVarianceThreshold] = useState(28);
  const [complexity, setComplexity] = useState(6);
  const [fitMode, setFitMode] = useState<"contain" | "cover">("contain");
  const [imageScale, setImageScale] = useState(100);
  const [rotationDeg, setRotationDeg] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [previewSize, setPreviewSize] = useState({ width: 1200, height: 800 });

  const [charDynamism, setCharDynamism] = useState(0);
  const [dynamismSpeed, setDynamismSpeed] = useState(14);
  const [whitespaceNoise, setWhitespaceNoise] = useState(0);

  const [mouseExpandEnabled, setMouseExpandEnabled] = useState(true);
  const [mouseRadius, setMouseRadius] = useState(180);
  const [mouseStrength, setMouseStrength] = useState(44);

  const [glitchIntensity, setGlitchIntensity] = useState(0);
  const [noiseIntensity, setNoiseIntensity] = useState(0);
  const [scanlineIntensity, setScanlineIntensity] = useState(0);

  const [ascii, setAscii] = useState("");
  const [asciiLines, setAsciiLines] = useState<string[]>([]);
  const [dimensions, setDimensions] = useState({ cols: 0, rows: 0 });
  const [status, setStatus] = useState<"generating" | "ready" | "error">("generating");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [exportCopied, setExportCopied] = useState(false);

  const ramp = useMemo(() => buildRamp(complexity), [complexity]);

  const markGenerating = useCallback(() => {
    setStatus("generating");
    setError(null);
  }, []);

  useEffect(() => {
    const host = previewHostRef.current;
    if (!host) return;

    const applySize = () => {
      const rect = host.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      setPreviewSize((prev) =>
        prev.width === width && prev.height === height ? prev : { width, height },
      );
    };

    applySize();

    const observer = new ResizeObserver(applySize);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const image = new Image();
    image.decoding = "async";

    image.onload = () => {
      if (cancelled) return;

      const availableW = Math.max(1, previewSize.width - PREVIEW_PAD_X * 2);
      const availableH = Math.max(1, previewSize.height - PREVIEW_PAD_Y * 2);
      const charWidth = fontSize * CHAR_WIDTH_FACTOR;
      const lineHeight = fontSize * LINE_HEIGHT_FACTOR;
      const maxCols = Math.max(24, Math.floor(availableW / Math.max(1, charWidth)));
      const maxRows = Math.max(24, Math.floor(availableH / Math.max(1, lineHeight)));
      const imageRatio = image.naturalHeight / image.naturalWidth;
      const rowsPerCol = imageRatio * CHAR_ASPECT;
      const colsByHeight = Math.max(1, Math.floor(maxRows / Math.max(rowsPerCol, 0.0001)));
      const cols = clamp(Math.min(maxCols, colsByHeight), 24, 520);
      const rows = clamp(Math.round(rowsPerCol * cols), 24, maxRows);
      const sample = complexity;

      const processCanvas = document.createElement("canvas");
      processCanvas.width = cols * sample;
      processCanvas.height = rows * sample;

      const context = processCanvas.getContext("2d", { willReadFrequently: true });
      if (!context) {
        setStatus("error");
        setError("Could not create image processing context.");
        return;
      }

      const useLegacyDefaultTransform =
        fitMode === "contain" &&
        imageScale === 100 &&
        rotationDeg === 0 &&
        offsetX === 0 &&
        offsetY === 0;

      if (useLegacyDefaultTransform) {
        // Preserve pre-transform default behavior exactly.
        context.drawImage(image, 0, 0, processCanvas.width, processCanvas.height);
      } else {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, processCanvas.width, processCanvas.height);
        context.save();
        context.imageSmoothingEnabled = true;
        context.translate(processCanvas.width / 2 + offsetX, processCanvas.height / 2 + offsetY);
        context.rotate((rotationDeg * Math.PI) / 180);

        const baseScale =
          fitMode === "cover"
            ? Math.max(
                processCanvas.width / Math.max(1, image.naturalWidth),
                processCanvas.height / Math.max(1, image.naturalHeight),
              )
            : Math.min(
                processCanvas.width / Math.max(1, image.naturalWidth),
                processCanvas.height / Math.max(1, image.naturalHeight),
              );
        const finalScale = Math.max(0.05, (imageScale / 100) * baseScale);
        const drawWidth = image.naturalWidth * finalScale;
        const drawHeight = image.naturalHeight * finalScale;
        context.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        context.restore();
      }
      const pixels = context.getImageData(0, 0, processCanvas.width, processCanvas.height).data;
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

      const contrastFactor = contrast / 100;
      const whiteCutoff = whiteThreshold / 255;
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

          const edgeGate = clamp((edgeMagnitude * 255 - edgeThreshold) / 255, 0, 1);
          const varianceGate = clamp(
            (Math.sqrt(variance) * 255 - varianceThreshold) / 255,
            0,
            1,
          );

          let tone = (avg - 0.5) * contrastFactor + 0.5;
          const detailBoost =
            (edgeGate * 1.1 + varianceGate * 0.9) * ((complexity - 1) / 9);
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

      setAsciiLines(lines);
      setAscii(lines.join("\n"));
      setDimensions({ cols, rows });
      setError(null);
      setStatus("ready");
    };

    image.onerror = () => {
      if (cancelled) return;
      setStatus("error");
      setAscii("");
      setAsciiLines([]);
      setDimensions({ cols: 0, rows: 0 });
      setError(
        imageSource === DEFAULT_IMAGE
          ? "Default image not found at /public/ateneo-schematic.png. Upload an image to continue."
          : "Could not load the selected image.",
      );
    };

    image.src = imageSource;

    return () => {
      cancelled = true;
    };
  }, [
    complexity,
    contrast,
    edgeThreshold,
    fitMode,
    fontSize,
    imageSource,
    imageScale,
    offsetX,
    offsetY,
    previewSize.height,
    previewSize.width,
    ramp,
    rotationDeg,
    varianceThreshold,
    whiteThreshold,
  ]);

  useEffect(() => {
    const host = previewHostRef.current;
    const canvas = previewCanvasRef.current;
    if (!host || !canvas) return;

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
      const width = previewSize.width;
      const height = previewSize.height;

      if (width <= 0 || height <= 0) {
        rafId = window.requestAnimationFrame(draw);
        return;
      }

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
      context.fillStyle = "#02050b";
      context.fillRect(0, 0, width, height);

      if (!asciiLines.length) {
        context.fillStyle = "#95a2bd";
        context.font = `12px ${MONO_STACK}`;
        context.textBaseline = "middle";
        context.fillText(status === "error" ? "Error" : "Generating...", 12, height / 2);
        rafId = window.requestAnimationFrame(draw);
        return;
      }

      const cols = dimensions.cols || asciiLines[0].length;
      const rows = dimensions.rows || asciiLines.length;

      const charWidth = fontSize * CHAR_WIDTH_FACTOR;
      const lineHeight = fontSize * LINE_HEIGHT_FACTOR;
      const blockWidth = cols * charWidth;
      const blockHeight = rows * lineHeight;
      const originX = Math.floor((width - blockWidth) / 2);
      const originY = Math.max(PREVIEW_PAD_Y, Math.floor((height - blockHeight) / 2));

      const mouseCol = (mouse.x - originX) / charWidth;
      const mouseRow = (mouse.y - originY) / lineHeight;
      const mouseRadiusChars = mouseRadius / Math.max(charWidth, lineHeight);
      const timeSeed = time * (0.0008 + dynamismSpeed * 0.0004);

      context.fillStyle = "#d8e6ff";
      context.font = `${fontSize}px ${MONO_STACK}`;
      context.textBaseline = "top";

      for (let row = 0; row < asciiLines.length; row += 1) {
        const source = asciiLines[row] ?? "";
        const chars = source.split("");

        let glitchShift = 0;
        if (glitchIntensity > 0) {
          const g = hash3(row, Math.floor(time * 0.025), 13.3);
          if (g < (glitchIntensity / 100) * 0.18) {
            glitchShift =
              (hash3(row, Math.floor(time * 0.032), 89.1) - 0.5) *
              (glitchIntensity / 100) *
              26;
          }
        }

        for (let col = 0; col < chars.length; col += 1) {
          let ch = chars[col];

          if (charDynamism > 0 && ch !== " ") {
            const p = (charDynamism / 100) * 0.16;
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

          if (whitespaceNoise > 0 && ch === " ") {
            const p = (whitespaceNoise / 100) * 0.22;
            const r = hash3(col * 1.7, row * 2.1, Math.floor(timeSeed * 90) + 7);
            if (r < p) ch = ".";
          }

          if (mouseExpandEnabled && mouse.inside) {
            const dx = col - mouseCol;
            const dy = row - mouseRow;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const influence = Math.max(0, 1 - dist / mouseRadiusChars);
            if (influence > 0) {
              const strength = (mouseStrength / 100) * influence;
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

      if (scanlineIntensity > 0) {
        context.fillStyle = `rgba(2, 8, 18, ${(scanlineIntensity / 100) * 0.3})`;
        for (let y = 0; y < height; y += 3) {
          context.fillRect(0, y, width, 1);
        }
      }

      if (noiseIntensity > 0) {
        const count = Math.floor((width * height * (noiseIntensity / 100)) / 8000);
        for (let i = 0; i < count; i += 1) {
          const rx = Math.floor(hash3(i, Math.floor(time * 0.05), 91.9) * width);
          const ry = Math.floor(hash3(i, Math.floor(time * 0.07), 12.4) * height);
          const alpha = 0.08 + hash3(i, Math.floor(time * 0.09), 55.3) * 0.22;
          context.fillStyle = `rgba(216, 230, 255, ${alpha * (noiseIntensity / 100)})`;
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
  }, [
    asciiLines,
    charDynamism,
    dimensions,
    dynamismSpeed,
    glitchIntensity,
    mouseExpandEnabled,
    mouseRadius,
    mouseStrength,
    noiseIntensity,
    ramp,
    scanlineIntensity,
    status,
    whitespaceNoise,
    fontSize,
    previewSize.height,
    previewSize.width,
  ]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const onFileChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    markGenerating();
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);

    const nextUrl = URL.createObjectURL(file);
    objectUrlRef.current = nextUrl;
    setImageSource(nextUrl);
    setImageLabel(file.name);
  };

  const useDefaultImage = () => {
    markGenerating();

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setImageSource(DEFAULT_IMAGE);
    setImageLabel("default");
  };

  const exportArtifact = useMemo<AsciiExport>(
    () => ({
      version: 1,
      label: imageLabel,
      createdAt: new Date().toISOString(),
      dimensions,
      asciiLines,
      generation: {
        fontSize,
        aspectCorrection: 100,
        contrast,
        whiteThreshold,
        edgeThreshold,
        varianceThreshold,
        complexity,
        ramp,
        transform: {
          fit: fitMode,
          scale: imageScale,
          rotation: rotationDeg,
          offsetX,
          offsetY,
        },
      },
      effects: {
        charDynamism,
        dynamismSpeed,
        whitespaceNoise,
        mouseExpandEnabled,
        mouseRadius,
        mouseStrength,
        glitchIntensity,
        noiseIntensity,
        scanlineIntensity,
      },
      render: {
        charWidthFactor: CHAR_WIDTH_FACTOR,
        lineHeightFactor: LINE_HEIGHT_FACTOR,
        paddingX: PREVIEW_PAD_X,
        paddingY: PREVIEW_PAD_Y,
        foreground: "#d8e6ff",
        background: "#02050b",
        fontFamily: MONO_STACK,
      },
    }),
    [
      asciiLines,
      charDynamism,
      complexity,
      contrast,
      dimensions,
      dynamismSpeed,
      edgeThreshold,
      fitMode,
      fontSize,
      glitchIntensity,
      imageLabel,
      imageScale,
      mouseExpandEnabled,
      mouseRadius,
      mouseStrength,
      noiseIntensity,
      offsetX,
      offsetY,
      ramp,
      rotationDeg,
      scanlineIntensity,
      varianceThreshold,
      whiteThreshold,
      whitespaceNoise,
    ],
  );

  const exportJson = useMemo(
    () => JSON.stringify(exportArtifact, null, 2),
    [exportArtifact],
  );

  const copyAscii = async () => {
    if (!ascii) return;

    try {
      await navigator.clipboard.writeText(ascii);
    } catch {
      copyWithFallback(ascii);
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const copyExport = async () => {
    if (!asciiLines.length) return;

    try {
      await navigator.clipboard.writeText(exportJson);
    } catch {
      copyWithFallback(exportJson);
    }

    setExportCopied(true);
    window.setTimeout(() => setExportCopied(false), 1400);
  };

  const downloadExport = () => {
    if (!asciiLines.length) return;

    const blob = new Blob([exportJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ascii-export-${imageLabel.replace(/\.[^/.]+$/, "") || "artifact"}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="h-[100svh] w-full overflow-hidden border border-white/10 bg-[#070a11] text-slate-100">
      <div className="grid h-full w-full grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="min-h-0 border-b border-white/10 lg:border-b-0 lg:border-r lg:border-white/10">
          <Tabs defaultValue="ascii" className="h-full">
            <div className="flex h-11 items-center justify-between border-b border-white/10 px-3">
              <TabsList className="grid h-full w-[190px] grid-cols-2">
                <TabsTrigger
                  value="ascii"
                  className="h-full border-r border-white/10 data-[state=active]:bg-white/5"
                >
                  ASCII Setup
                </TabsTrigger>
                <TabsTrigger value="effects" className="h-full data-[state=active]:bg-white/5">
                  Effects
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-3 text-[11px]">
                <button
                  type="button"
                  onClick={copyAscii}
                  disabled={!ascii}
                  className="font-medium text-slate-200 disabled:opacity-40"
                >
                  {copied ? "ASCII Copied" : "Copy ASCII"}
                </button>
                <button
                  type="button"
                  onClick={copyExport}
                  disabled={!asciiLines.length}
                  className="font-medium text-slate-200 disabled:opacity-40"
                >
                  {exportCopied ? "Export Copied" : "Copy Export"}
                </button>
                <button
                  type="button"
                  onClick={downloadExport}
                  disabled={!asciiLines.length}
                  className="font-medium text-slate-200 disabled:opacity-40"
                >
                  Download
                </button>
              </div>
            </div>

            <TabsContent value="ascii" className="min-h-0 overflow-auto">
              <div className="grid grid-cols-[98px_1fr_52px] items-center border-b border-white/10 px-3 py-2 text-xs">
                <label>Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="block w-full text-[10px] text-slate-300 file:mr-2 file:rounded-none file:border file:border-white/15 file:bg-transparent file:px-2 file:py-1 file:text-[10px] file:text-slate-200"
                />
                <button
                  type="button"
                  onClick={useDefaultImage}
                  className="text-[10px] text-cyan-300"
                >
                  Reset
                </button>
              </div>

              <RowSlider
                label="Font Size"
                min={4}
                max={14}
                value={fontSize}
                onChange={(value) => {
                  markGenerating();
                  setFontSize(value);
                }}
              />

              <RowSlider label="Contrast" min={80} max={320} value={contrast} suffix="%" onChange={(value) => {
                markGenerating();
                setContrast(value);
              }} />

              <RowSlider label="White Cut" min={140} max={255} value={whiteThreshold} onChange={(value) => {
                markGenerating();
                setWhiteThreshold(value);
              }} />

              <RowSlider label="Edge Thr" min={0} max={160} value={edgeThreshold} onChange={(value) => {
                markGenerating();
                setEdgeThreshold(value);
              }} />

              <RowSlider label="Var Thr" min={0} max={160} value={varianceThreshold} onChange={(value) => {
                markGenerating();
                setVarianceThreshold(value);
              }} />

              <RowSlider label="Fidelity" min={1} max={10} value={complexity} onChange={(value) => {
                markGenerating();
                setComplexity(value);
              }} />

              <div className="border-b border-white/10 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                Transform
              </div>
              <RowToggle
                label="Fit"
                value={fitMode}
                onChange={(value) => {
                  markGenerating();
                  setFitMode(value);
                }}
              />
              <RowSlider
                label="Scale"
                min={20}
                max={260}
                value={imageScale}
                suffix="%"
                onChange={(value) => {
                  markGenerating();
                  setImageScale(value);
                }}
              />
              <RowSlider
                label="Rotate"
                min={-180}
                max={180}
                value={rotationDeg}
                suffix="deg"
                onChange={(value) => {
                  markGenerating();
                  setRotationDeg(value);
                }}
              />
              <RowSlider
                label="Offset X"
                min={-420}
                max={420}
                value={offsetX}
                onChange={(value) => {
                  markGenerating();
                  setOffsetX(value);
                }}
              />
              <RowSlider
                label="Offset Y"
                min={-420}
                max={420}
                value={offsetY}
                onChange={(value) => {
                  markGenerating();
                  setOffsetY(value);
                }}
              />

              <div className="grid grid-cols-2 gap-0 border-b border-white/10 px-3 py-2 text-[11px] text-slate-300">
                <p>Status: {status}</p>
                <p className="text-right">Ramp: {ramp.length}</p>
                <p>
                  Grid: {dimensions.cols} x {dimensions.rows}
                </p>
                <p className="truncate text-right">{imageLabel}</p>
                <p>Export: v{exportArtifact.version}</p>
                <p className="text-right">
                  {Math.round(exportJson.length / 1024)} KB
                </p>
              </div>
            </TabsContent>

            <TabsContent value="effects" className="min-h-0 overflow-auto">
              <div className="border-b border-white/10 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                Character Dynamism
              </div>
              <RowSlider
                label="Shift"
                min={0}
                max={100}
                value={charDynamism}
                suffix="%"
                onChange={setCharDynamism}
              />
              <RowSlider
                label="Speed"
                min={1}
                max={40}
                value={dynamismSpeed}
                onChange={setDynamismSpeed}
              />
              <RowSlider
                label="White Noise"
                min={0}
                max={100}
                value={whitespaceNoise}
                suffix="%"
                onChange={setWhitespaceNoise}
              />

              <div className="border-b border-white/10 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                Mouse Interaction
              </div>
              <div className="grid grid-cols-[98px_1fr_52px] items-center border-b border-white/10 px-3 py-2 text-xs">
                <label>Expand Hover</label>
                <button
                  type="button"
                  onClick={() => setMouseExpandEnabled((prev) => !prev)}
                  className="h-6 w-12 border border-white/15 text-[10px]"
                >
                  {mouseExpandEnabled ? "On" : "Off"}
                </button>
                <span className="text-right text-[11px] text-slate-300">radius</span>
              </div>
              <RowSlider
                label="Radius"
                min={40}
                max={420}
                value={mouseRadius}
                onChange={setMouseRadius}
              />
              <RowSlider
                label="Strength"
                min={0}
                max={100}
                value={mouseStrength}
                suffix="%"
                onChange={setMouseStrength}
              />

              <div className="border-b border-white/10 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                Layered Effects
              </div>
              <RowSlider
                label="Glitch"
                min={0}
                max={100}
                value={glitchIntensity}
                suffix="%"
                onChange={setGlitchIntensity}
              />
              <RowSlider
                label="Noise"
                min={0}
                max={100}
                value={noiseIntensity}
                suffix="%"
                onChange={setNoiseIntensity}
              />
              <RowSlider
                label="Scanline"
                min={0}
                max={100}
                value={scanlineIntensity}
                suffix="%"
                onChange={setScanlineIntensity}
              />
            </TabsContent>
          </Tabs>
        </aside>

        <div className="grid min-h-0 grid-rows-[36px_minmax(0,1fr)]">
          <div className="flex items-center justify-between border-b border-white/10 px-3 text-[11px] text-slate-300">
            <p>Preview</p>
            {error ? (
              <p className="truncate text-red-300">{error}</p>
            ) : (
              <p>
                Fixed canvas, dynamic render ·{" "}
                <a href="/ascii/render" className="text-cyan-300">
                  render export
                </a>
              </p>
            )}
          </div>
          <div ref={previewHostRef} className="min-h-0 overflow-hidden">
            <canvas ref={previewCanvasRef} className="h-full w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
