"use client";

import { useMemo, useState } from "react";
import { AsciiExportCanvas } from "@/components/ascii-export-canvas";

const EXAMPLE_EXPORT = `{
  "version": 1,
  "label": "example",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "dimensions": { "cols": 8, "rows": 4 },
  "asciiLines": ["........", "..####..", "..####..", "........"],
  "generation": {
    "fontSize": 8,
    "aspectCorrection": 100,
    "contrast": 160,
    "whiteThreshold": 228,
    "edgeThreshold": 32,
    "varianceThreshold": 28,
    "complexity": 6,
    "ramp": " .:-=+*#%@",
    "transform": { "fit": "contain", "scale": 100, "rotation": 0, "offsetX": 0, "offsetY": 0 }
  },
  "effects": {
    "charDynamism": 0,
    "dynamismSpeed": 14,
    "whitespaceNoise": 0,
    "mouseExpandEnabled": true,
    "mouseRadius": 180,
    "mouseStrength": 44,
    "glitchIntensity": 0,
    "noiseIntensity": 0,
    "scanlineIntensity": 0
  },
  "render": {
    "charWidthFactor": 0.62,
    "lineHeightFactor": 1.2,
    "paddingX": 12,
    "paddingY": 12,
    "foreground": "#d8e6ff",
    "background": "#02050b",
    "fontFamily": "\\"Geist Mono\\",\\"SFMono-Regular\\",Menlo,Monaco,Consolas,\\"Liberation Mono\\",monospace"
  }
}`;

export default function AsciiRenderPage() {
  const [value, setValue] = useState(EXAMPLE_EXPORT);
  const payload = useMemo(() => value, [value]);

  return (
    <main className="h-[100svh] overflow-hidden bg-[#04060b] text-slate-100">
      <section className="h-full w-full border border-white/10 bg-[#070a11]">
        <div className="grid h-full w-full grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="border-b border-white/10 lg:border-r lg:border-b-0 lg:border-white/10">
            <div className="flex h-11 items-center justify-between border-b border-white/10 px-3 text-[11px]">
              <p className="uppercase tracking-[0.14em] text-slate-300">Render From Export</p>
              <a href="/ascii" className="text-slate-200">
                Back to Lab
              </a>
            </div>
            <textarea
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="h-[calc(100svh_-_44px)] min-h-[320px] w-full resize-none bg-transparent p-3 text-[11px] leading-relaxed text-slate-200 outline-none [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]"
              spellCheck={false}
            />
          </aside>
          <div className="grid min-h-0 grid-rows-[36px_minmax(0,1fr)]">
            <div className="flex items-center justify-between border-b border-white/10 px-3 text-[11px] text-slate-300">
              <p>Preview</p>
              <p>Image-free runtime renderer</p>
            </div>
            <AsciiExportCanvas artifact={payload} className="min-h-0 overflow-hidden" />
          </div>
        </div>
      </section>
    </main>
  );
}
