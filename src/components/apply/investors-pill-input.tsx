"use client";

import { useMemo, useState } from "react";

type InvestorsPillInputProps = {
  label: string;
  placeholder: string;
  name?: string;
};

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function InvestorsPillInput({
  label,
  placeholder,
  name = "inversores",
}: InvestorsPillInputProps) {
  const [draft, setDraft] = useState("");
  const [items, setItems] = useState<string[]>([]);

  const serialized = useMemo(() => items.join(","), [items]);

  const appendTokens = (source: string) => {
    const tokens = source
      .split(",")
      .map((value) => normalize(value))
      .filter(Boolean);

    if (!tokens.length) return;

    setItems((prev) => {
      const seen = new Set(prev.map((item) => item.toLocaleLowerCase("es-ES")));
      const next = [...prev];
      for (const token of tokens) {
        const key = token.toLocaleLowerCase("es-ES");
        if (seen.has(key)) continue;
        seen.add(key);
        next.push(token);
      }
      return next;
    });
  };

  const commitDraft = () => {
    if (!draft.trim()) return;
    appendTokens(draft);
    setDraft("");
  };

  const removeAt = (index: number) => {
    setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <label className="grid gap-2">
      <span className="text-[11px] uppercase tracking-[0.12em] text-white/70 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
        {label}
      </span>
      <div className="min-h-11 border border-white/20 bg-transparent px-3 py-2 transition-colors focus-within:border-white/50">
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="inline-flex h-6 items-center gap-1 border border-white/25 px-2 text-[11px] text-white/90 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]"
            >
              {item}
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="text-white/65 transition-opacity hover:opacity-100"
                aria-label={`Eliminar ${item}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commitDraft}
            onKeyDown={(event) => {
              if (event.key === "," || event.key === "Enter") {
                event.preventDefault();
                commitDraft();
              }
            }}
            placeholder={placeholder}
            className="h-6 min-w-[140px] flex-1 bg-transparent text-sm text-white placeholder:text-white/35 outline-none [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]"
          />
        </div>
      </div>
      <input type="hidden" name={name} value={serialized} />
    </label>
  );
}
