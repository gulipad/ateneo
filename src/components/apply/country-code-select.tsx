"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import type { CountryCode } from "libphonenumber-js/min";
import { getCountries, getCountryCallingCode } from "libphonenumber-js/min";
import { cn } from "@/lib/utils";

type CountryCodeSelectProps = {
  name?: string;
  value: string;
  onChange: (code: string) => void;
  className?: string;
};

function codeToFlag(code: string) {
  return code
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0)),
    );
}

function buildCountries() {
  const regionNames =
    typeof Intl !== "undefined" && typeof Intl.DisplayNames === "function"
      ? new Intl.DisplayNames(["es"], { type: "region" })
      : null;

  const entries = getCountries().map((country) => {
    const code = country.toUpperCase();
    const label = regionNames?.of(code) ?? code;
    const dial = `+${getCountryCallingCode(country as CountryCode)}`;
    const flag = codeToFlag(code);

    return {
      code,
      dial,
      label,
      flag,
      searchText: `${label} ${code} ${dial}`.toLocaleLowerCase("es-ES"),
    };
  });

  entries.sort((a, b) => a.label.localeCompare(b.label, "es-ES"));
  return entries;
}

const ALL_COUNTRIES = buildCountries();

export function CountryCodeSelect({
  name = "telefono_pais",
  value,
  onChange,
  className,
}: CountryCodeSelectProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const selected = useMemo(() => {
    return ALL_COUNTRIES.find((country) => country.code === value) ?? ALL_COUNTRIES[0];
  }, [value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("es-ES");
    if (!q) return ALL_COUNTRIES;
    return ALL_COUNTRIES.filter((country) => country.searchText.includes(q));
  }, [query]);
  const selectedIndex = useMemo(
    () => filtered.findIndex((country) => country.code === selected.code),
    [filtered, selected.code],
  );
  const resolvedActiveIndex =
    !open || !filtered.length
      ? -1
      : activeIndex >= 0 && activeIndex < filtered.length
        ? activeIndex
        : selectedIndex >= 0
          ? selectedIndex
          : 0;

  const closePanel = () => {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
  };

  const selectCountry = (code: string) => {
    onChange(code);
    closePanel();
  };

  const moveActive = (offset: number) => {
    if (!filtered.length) return;
    const start = resolvedActiveIndex >= 0 ? resolvedActiveIndex : 0;
    const next = (start + offset + filtered.length) % filtered.length;
    setActiveIndex(next);

    const targetCode = filtered[next]?.code;
    if (!targetCode || !listRef.current) return;
    const target = listRef.current.querySelector<HTMLButtonElement>(
      `[data-country-code="${targetCode}"]`,
    );
    target?.scrollIntoView({ block: "nearest" });
  };

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!hostRef.current) return;
      if (hostRef.current.contains(event.target as Node)) return;
      setOpen(false);
      setQuery("");
      setActiveIndex(-1);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <div ref={hostRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => {
          if (open) {
            closePanel();
            return;
          }
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className="flex h-11 w-full items-center justify-between gap-1 border border-white/20 bg-black px-2 text-sm text-white outline-none transition-colors focus:border-white/50 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{selected.flag} {selected.dial}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-white/75" />
      </button>
      <input type="hidden" name={name} value={selected.code} />

      {open ? (
        <div className="absolute left-0 top-full z-50 mt-2 w-[320px] border border-white/20 bg-black p-2 shadow-2xl">
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                closePanel();
                return;
              }
              if (event.key === "ArrowDown") {
                event.preventDefault();
                moveActive(1);
                return;
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                moveActive(-1);
                return;
              }
              if (event.key === "Enter") {
                event.preventDefault();
                if (resolvedActiveIndex >= 0 && filtered[resolvedActiveIndex]) {
                  selectCountry(filtered[resolvedActiveIndex].code);
                }
              }
            }}
            placeholder="Buscar país, código o prefijo (+34)"
            className="mb-2 h-9 w-full border border-white/20 bg-transparent px-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/50 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]"
          />
          <div ref={listRef} className="max-h-56 overflow-y-auto border border-white/20" role="listbox">
            {filtered.length ? (
              filtered.map((country, index) => {
                const active = country.code === selected.code;
                const focused = index === resolvedActiveIndex;
                return (
                  <button
                    key={country.code}
                    type="button"
                    data-country-code={country.code}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectCountry(country.code)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 px-2 py-2 text-left text-sm text-white transition-colors [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]",
                      focused ? "bg-white/15" : "hover:bg-white/10",
                    )}
                    role="option"
                    aria-selected={active}
                  >
                    <span className="truncate">
                      {country.flag} {country.label} ({country.code}) {country.dial}
                    </span>
                    {active ? <Check className="h-4 w-4 shrink-0" /> : null}
                  </button>
                );
              })
            ) : (
              <p className="px-2 py-2 text-xs text-white/45 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
                Sin resultados
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
