"use client";

import { useEffect, useMemo, useState } from "react";

type StartupLogo = {
  id: string | number;
  name: string;
  slug: string;
  logoUrl: string | null;
  fallbackLogoUrl?: string | null;
};

const FALLBACK_LABELS = [
  "Solo fundadores",
  "Comunidad privada",
  "España",
  "Alta densidad de talento",
] as const;

function shuffleArray<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function RotatingLogoImage({
  logo,
}: {
  logo: StartupLogo;
}) {
  const [src, setSrc] = useState(() => logo.logoUrl ?? logo.fallbackLogoUrl ?? "");
  const [usedFallback, setUsedFallback] = useState(false);
  const initial = logo.name.trim().charAt(0).toUpperCase() || "A";

  if (!src) {
    return (
      <span className="type-content text-[11px] uppercase tracking-[0.16em] text-white/70 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
        {initial}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={logo.name}
      className="max-h-7 w-auto max-w-[132px] object-contain opacity-75 transition-opacity duration-300 filter grayscale invert hover:opacity-100"
      loading="lazy"
      onError={() => {
        if (!usedFallback && logo.fallbackLogoUrl) {
          setUsedFallback(true);
          setSrc(logo.fallbackLogoUrl);
          return;
        }
        setSrc("");
      }}
    />
  );
}

export function HeroLogoRotator() {
  const [logos, setLogos] = useState<StartupLogo[]>([]);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const response = await fetch("/api/startups-db/program/ateneo", {
          method: "GET",
          cache: "no-store",
        });
        if (!response.ok) {
          console.warn("[hero-logos] non-OK response", response.status);
          return;
        }

        const rawPayload = (await response.json()) as unknown;
        const payload = Array.isArray(rawPayload) ? (rawPayload as StartupLogo[]) : [];
        if (!isMounted) return;

        const valid = payload
          .map((item) => ({
            ...item,
            logoUrl: item.logoUrl ?? item.fallbackLogoUrl ?? null,
          }))
          .filter((item) => item.logoUrl || item.fallbackLogoUrl);
        if (!valid.length) return;
        setLogos(shuffleArray(valid));
      } catch (error) {
        console.error("[hero-logos] fetch failed", error);
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (logos.length <= 1) return;

    let timeoutId = 0;
    let active = true;

    const schedule = () => {
      const delayMs = 3000 + Math.floor(Math.random() * 2001);
      timeoutId = window.setTimeout(() => {
        if (!active) return;
        setOffset((previous) => (previous + 1) % logos.length);
        schedule();
      }, delayMs);
    };

    schedule();
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [logos]);

  const slots = useMemo(() => {
    if (!logos.length) return new Array<StartupLogo | null>(4).fill(null);
    return Array.from({ length: 4 }, (_, index) => {
      return logos[(offset + index) % logos.length] ?? null;
    });
  }, [logos, offset]);

  return (
    <div className="grid h-12 shrink-0 grid-cols-2 divide-x divide-white/20 border-t border-b border-white/20 md:grid-cols-4">
      {slots.map((logo, index) => (
        <div
          key={`${logo?.slug ?? "fallback"}-${index}`}
          className="flex items-center justify-center px-3"
        >
          {logo ? (
            <RotatingLogoImage logo={logo} />
          ) : (
            <span className="type-content text-[10px] uppercase tracking-[0.16em] text-white/70 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
              {FALLBACK_LABELS[index]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
