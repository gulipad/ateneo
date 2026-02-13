"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type InvestorsPillInputProps = {
  label: string;
  placeholder: string;
  name?: string;
  onValuesChange?: (values: string[]) => void;
  presetValues?: string[];
  resetToken?: number;
};

type InvestorPill = {
  id: string;
  value: string;
};

const WEBSITE_PATTERN =
  /^(?:(?:https?:\/\/)?)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?::\d{2,5})?(?:[/?#][^\s]*)?$/i;

function normalizeToken(value: string) {
  return value.trim();
}

function splitCandidates(value: string) {
  return value
    .split(/[,\s]+/)
    .map((token) => normalizeToken(token))
    .filter(Boolean);
}

function isWebsite(value: string) {
  return WEBSITE_PATTERN.test(value);
}

export function InvestorsPillInput({
  label,
  placeholder,
  name = "inversores",
  onValuesChange,
  presetValues,
  resetToken,
}: InvestorsPillInputProps) {
  const inputId = useId();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<InvestorPill[]>([]);
  const nextIdRef = useRef(1);

  const serialized = useMemo(() => items.map((item) => item.value).join(","), [items]);

  useEffect(() => {
    onValuesChange?.(items.map((item) => item.value));
  }, [items, onValuesChange]);

  useEffect(() => {
    if (resetToken === undefined || !presetValues) return;
    const next = presetValues
      .map((value) => normalizeToken(value))
      .filter(Boolean)
      .map((value) => {
        const generatedId =
          typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `pill-${nextIdRef.current}`;
        nextIdRef.current += 1;
        return { id: generatedId, value };
      });
    setItems(next);
    setDraft("");
    setError(null);
  }, [presetValues, resetToken]);

  const removeTokenById = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addFromDraft = () => {
    const candidates = splitCandidates(draft);
    if (!candidates.length) return;

    const valid: string[] = [];
    const invalid: string[] = [];

    for (const token of candidates) {
      if (isWebsite(token)) {
        valid.push(token);
      } else {
        invalid.push(token);
      }
    }

    if (valid.length) {
      setItems((prev) => {
        const seen = new Set(prev.map((item) => item.value.toLocaleLowerCase("es-ES")));
        const next = [...prev];
        for (const token of valid) {
          const key = token.toLocaleLowerCase("es-ES");
          if (seen.has(key)) continue;
          seen.add(key);
          const generatedId =
            typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
              ? crypto.randomUUID()
              : `pill-${nextIdRef.current}`;
          next.push({ id: generatedId, value: token });
          nextIdRef.current += 1;
        }
        return next;
      });
      setDraft("");
    }

    if (invalid.length) {
      setError("Introduce una web valida (ej: inversor.com)");
      return;
    }
    setError(null);
  };

  return (
    <div className="grid gap-2">
      <label
        htmlFor={inputId}
        className="text-[11px] uppercase tracking-[0.12em] text-white/70 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]"
      >
        {label}
      </label>

      <div
        className={cn(
          "min-h-11 border bg-black px-3 py-2 transition-colors focus-within:border-white/50",
          error ? "border-red-400/70" : "border-white/20",
        )}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {items.map((item) => (
            <span
              key={item.id}
              className="inline-flex h-6 items-center gap-1 border border-white/25 px-2 text-[11px] text-white/90"
            >
              <span>{item.value}</span>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => removeTokenById(item.id)}
                className="text-white/75 transition-opacity hover:opacity-100"
                aria-label={`Eliminar ${item.value}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            id={inputId}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              if (error) setError(null);
            }}
            onBlur={addFromDraft}
            onKeyDown={(event) => {
              if (event.key === "Backspace" && !draft.length && items.length) {
                event.preventDefault();
                setItems((prev) => prev.slice(0, -1));
                return;
              }
              const shouldCommit =
                event.key === "Enter" || event.key === "," || event.key === " ";
              if (!shouldCommit || !draft.trim()) return;
              event.preventDefault();
              addFromDraft();
            }}
            placeholder={items.length ? "" : placeholder}
            className="h-6 min-w-[180px] flex-1 bg-transparent text-sm text-white placeholder:text-white/35 outline-none [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]"
          />
        </div>
      </div>
      {error ? (
        <p className="text-[11px] text-red-300 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
          {error}
        </p>
      ) : null}

      <input type="hidden" name={name} value={serialized} />
    </div>
  );
}
