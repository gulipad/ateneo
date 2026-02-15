"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type FontPair = {
  label: string;
  heading: string;
  content: string;
};

const FONT_PAIRS: FontPair[] = [
  {
    label: "Editorial (Serif + Sans)",
    heading: "Georgia,'Times New Roman',Times,serif",
    content: "'Avenir Next','Segoe UI',Inter,system-ui,sans-serif",
  },
  {
    label: "Humanista (Palatino + Sans)",
    heading: "'Iowan Old Style','Palatino Linotype',Palatino,serif",
    content: "'Helvetica Neue','Segoe UI',Arial,sans-serif",
  },
  {
    label: "Producto (Sans + Sans)",
    heading: "'Avenir Next','Inter','Segoe UI',system-ui,sans-serif",
    content: "'Inter','Segoe UI',Roboto,system-ui,sans-serif",
  },
  {
    label: "Grotesk (Neo + Humanist)",
    heading: "'Helvetica Neue','Arial Nova',Arial,sans-serif",
    content: "'Avenir Next','Segoe UI',Inter,system-ui,sans-serif",
  },
  {
    label: "Transicional (Baskerville)",
    heading: "'Baskerville','Times New Roman',Times,serif",
    content: "'Gill Sans','Segoe UI',Arial,sans-serif",
  },
  {
    label: "Institucional (Classic + UI)",
    heading: "'Times New Roman',Times,serif",
    content: "'Segoe UI','Avenir Next',Inter,system-ui,sans-serif",
  },
  {
    label: "Neutral Web (Verdana + Trebuchet)",
    heading: "Verdana,'Segoe UI',sans-serif",
    content: "'Trebuchet MS','Segoe UI',Arial,sans-serif",
  },
  {
    label: "Tech (Serif + Mono)",
    heading: "Georgia,'Times New Roman',Times,serif",
    content: "'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation Mono',monospace",
  },
];

type TypographyExplorerProps = {
  children: ReactNode;
};

export function TypographyExplorer({ children }: TypographyExplorerProps) {
  const scopeRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [pairIndex, setPairIndex] = useState(7);
  const [headingScale, setHeadingScale] = useState(1);
  const [contentScale, setContentScale] = useState(0.88);
  const [headingWeight, setHeadingWeight] = useState(600);
  const [contentWeight, setContentWeight] = useState(200);

  const activeLabel = FONT_PAIRS[pairIndex]?.label ?? FONT_PAIRS[0].label;

  useEffect(() => {
    const contentScope = contentRef.current;
    if (!contentScope) return;
    const pair = FONT_PAIRS[pairIndex] ?? FONT_PAIRS[0];

    const applyStyles = (
      selector: string,
      scale: number,
      weight: number,
      family: string,
      baseKey: "typeHeadingBaseSize" | "typeContentBaseSize",
    ) => {
      const nodes = contentScope.querySelectorAll<HTMLElement>(selector);
      for (const node of nodes) {
        if (!node.dataset[baseKey]) {
          const computed = window.getComputedStyle(node);
          node.dataset[baseKey] = computed.fontSize;
        }

        const base = Number.parseFloat(node.dataset[baseKey] || "16");
        node.style.fontSize = `${(base * scale).toFixed(2)}px`;
        node.style.fontWeight = String(weight);
        node.style.fontFamily = family;
        node.style.fontVariationSettings = `"wght" ${weight}`;
        node.style.setProperty("-webkit-font-smoothing", "antialiased");
      }
    };

    applyStyles(
      ".type-content, p, a, button, label, input, textarea, select, li, small",
      contentScale,
      contentWeight,
      pair.content,
      "typeContentBaseSize",
    );
    applyStyles(
      ".type-heading, h1, h2, h3, h4, h5, h6",
      headingScale,
      headingWeight,
      pair.heading,
      "typeHeadingBaseSize",
    );
  }, [contentScale, contentWeight, headingScale, headingWeight, pairIndex]);

  const goPrev = () =>
    setPairIndex((prev) => (prev - 1 + FONT_PAIRS.length) % FONT_PAIRS.length);
  const goNext = () => setPairIndex((prev) => (prev + 1) % FONT_PAIRS.length);

  return (
    <div ref={scopeRef} className="type-explorer-scope relative">
      <div ref={contentRef}>{children}</div>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed right-5 bottom-5 z-40 inline-flex h-10 items-center border border-white/35 bg-black/90 px-4 text-[11px] uppercase tracking-[0.16em] text-white/85 backdrop-blur [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]"
      >
        {open ? "Cerrar Type Lab" : "Abrir Type Lab"}
      </button>

      {open ? (
        <aside className="fixed right-5 bottom-17 z-40 w-[420px] max-w-[calc(100vw-2.5rem)] border border-white/25 bg-black/95 p-4 text-white backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/70 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
            Explorador tipografico
          </p>

          <div className="mt-3 border border-white/20 p-3">
            <p className="text-sm text-white">{activeLabel}</p>
            <p className="mt-1 text-[11px] text-white/55 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
              Par {pairIndex + 1} de {FONT_PAIRS.length}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={goPrev}
                className="h-8 border border-white/25 text-[11px] uppercase tracking-[0.12em] [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={goNext}
                className="h-8 border border-white/25 text-[11px] uppercase tracking-[0.12em] [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]"
              >
                Siguiente
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <label className="grid gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.12em] text-white/65 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
                Escala heading ({headingScale.toFixed(2)})
              </span>
              <input
                type="range"
                className="w-full"
                min="0.9"
                max="1.7"
                step="0.01"
                value={headingScale}
                onChange={(event) => setHeadingScale(Number(event.target.value))}
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.12em] text-white/65 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
                Escala content ({contentScale.toFixed(2)})
              </span>
              <input
                type="range"
                className="w-full"
                min="0.8"
                max="1.25"
                step="0.02"
                value={contentScale}
                onChange={(event) => setContentScale(Number(event.target.value))}
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.12em] text-white/65 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
                Peso heading ({headingWeight})
              </span>
              <input
                type="range"
                className="w-full"
                min="200"
                max="800"
                step="25"
                value={headingWeight}
                onChange={(event) => setHeadingWeight(Number(event.target.value))}
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.12em] text-white/65 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
                Peso content ({contentWeight})
              </span>
              <input
                type="range"
                className="w-full"
                min="200"
                max="700"
                step="25"
                value={contentWeight}
                onChange={(event) => setContentWeight(Number(event.target.value))}
              />
            </label>
          </div>
        </aside>
      ) : null}
    </div>
  );
}
