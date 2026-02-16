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
const SLOT_COUNT = 4;
const FADE_DURATION_MS = 280;

function shuffleArray<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getRandomDelayMs() {
  return 3000 + Math.floor(Math.random() * 2001);
}

function getNextIndex(previousIndex: number, logosLength: number, slotIndex: number) {
  if (logosLength <= 1) return previousIndex;
  const maxStep = Math.max(1, logosLength - 1);
  const randomStep = 1 + Math.floor(Math.random() * maxStep);
  return (previousIndex + randomStep + slotIndex) % logosLength;
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

function RotatingLogoSlot({
  logos,
  slotIndex,
  fallbackLabel,
}: {
  logos: StartupLogo[];
  slotIndex: number;
  fallbackLabel: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(() =>
    logos.length ? slotIndex % logos.length : -1,
  );
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (logos.length <= 1) return;

    let rotateTimeoutId = 0;
    let fadeTimeoutId = 0;
    let active = true;

    const schedule = () => {
      rotateTimeoutId = window.setTimeout(() => {
        if (!active) return;
        setIsVisible(false);

        fadeTimeoutId = window.setTimeout(() => {
          if (!active) return;
          setCurrentIndex((previousIndex) =>
            getNextIndex(previousIndex, logos.length, slotIndex),
          );
          setIsVisible(true);
          schedule();
        }, FADE_DURATION_MS);
      }, getRandomDelayMs() + slotIndex * 180);
    };

    schedule();
    return () => {
      active = false;
      window.clearTimeout(rotateTimeoutId);
      window.clearTimeout(fadeTimeoutId);
    };
  }, [logos, slotIndex]);

  const logo = currentIndex >= 0 ? logos[currentIndex] ?? null : null;

  return (
    <div className="flex items-center justify-center px-3">
      <div
        className={`transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
      >
        {logo ? (
          <RotatingLogoImage key={logo.slug} logo={logo} />
        ) : (
          <span className="type-content text-[10px] uppercase tracking-[0.16em] text-white/70 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
            {fallbackLabel}
          </span>
        )}
      </div>
    </div>
  );
}

export function HeroLogoRotator() {
  const [logos, setLogos] = useState<StartupLogo[]>([]);
  const logosKey = useMemo(() => logos.map((logo) => logo.slug).join("|"), [logos]);

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

  return (
    <div className="grid h-12 shrink-0 grid-cols-2 divide-x divide-white/20 border-t border-b border-white/20 md:grid-cols-4">
      {Array.from({ length: SLOT_COUNT }, (_, index) => (
        <RotatingLogoSlot
          key={`slot-${index}-${logosKey}`}
          logos={logos}
          slotIndex={index}
          fallbackLabel={FALLBACK_LABELS[index]}
        />
      ))}
    </div>
  );
}
