"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
const FADE_DURATION_MS = 320;

type SlotState = {
  logoIndex: number;
  isVisible: boolean;
};

function createEmptySlots(): SlotState[] {
  return Array.from({ length: SLOT_COUNT }, () => ({
    logoIndex: -1,
    isVisible: true,
  }));
}

function createInitialSlots(logosLength: number): SlotState[] {
  const visibleSlotCount = Math.min(SLOT_COUNT, logosLength);
  const nextSlots = createEmptySlots();
  for (let slotIndex = 0; slotIndex < visibleSlotCount; slotIndex += 1) {
    nextSlots[slotIndex] = {
      logoIndex: slotIndex,
      isVisible: true,
    };
  }
  return nextSlots;
}

function shuffleArray<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getRandomDelayMs() {
  return 5000 + Math.floor(Math.random() * 3001);
}

function pickRandom<T>(items: T[]) {
  if (!items.length) return undefined;
  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
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
  const [slots, setSlots] = useState<SlotState[]>(() => createEmptySlots());
  const slotsRef = useRef<SlotState[]>(createEmptySlots());
  const reservedIndicesRef = useRef<Set<number>>(new Set());

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
        const shuffled = shuffleArray(valid);
        setLogos(shuffled);
        setSlots(createInitialSlots(shuffled.length));
        reservedIndicesRef.current.clear();
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
    slotsRef.current = slots;
  }, [slots]);

  useEffect(() => {
    if (!logos.length) return;

    let active = true;
    const timeoutIds: number[] = [];
    const reservedIndices = reservedIndicesRef.current;

    const scheduleSlotRotation = (slotIndex: number) => {
      const rotateTimeoutId = window.setTimeout(() => {
        if (!active) return;

        const currentSnapshot = slotsRef.current;
        const currentSlot = currentSnapshot[slotIndex];
        if (!currentSlot || currentSlot.logoIndex < 0) {
          scheduleSlotRotation(slotIndex);
          return;
        }

        const usedByOtherSlots = new Set(
          currentSnapshot
            .filter((_, index) => index !== slotIndex)
            .map((slot) => slot.logoIndex)
            .filter((logoIndex) => logoIndex >= 0),
        );

        const candidates = logos
          .map((_, logoIndex) => logoIndex)
          .filter(
            (logoIndex) =>
              logoIndex !== currentSlot.logoIndex &&
              !usedByOtherSlots.has(logoIndex) &&
              !reservedIndices.has(logoIndex),
          );

        const nextLogoIndex = pickRandom(candidates);
        if (nextLogoIndex === undefined) {
          scheduleSlotRotation(slotIndex);
          return;
        }

        reservedIndices.add(nextLogoIndex);
        setSlots((previousSlots) => {
          const previousSlot = previousSlots[slotIndex];
          if (!previousSlot) return previousSlots;
          const updatedSlots = [...previousSlots];
          updatedSlots[slotIndex] = {
            ...previousSlot,
            isVisible: false,
          };
          return updatedSlots;
        });

        const fadeTimeoutId = window.setTimeout(() => {
          if (!active) return;
          setSlots((previousSlots) => {
            const previousSlot = previousSlots[slotIndex];
            if (!previousSlot) return previousSlots;
            const updatedSlots = [...previousSlots];
            updatedSlots[slotIndex] = {
              logoIndex: nextLogoIndex,
              isVisible: true,
            };
            return updatedSlots;
          });
          reservedIndices.delete(nextLogoIndex);
          scheduleSlotRotation(slotIndex);
        }, FADE_DURATION_MS);

        timeoutIds.push(fadeTimeoutId);
      }, getRandomDelayMs() + slotIndex * 260);

      timeoutIds.push(rotateTimeoutId);
    };

    for (let slotIndex = 0; slotIndex < SLOT_COUNT; slotIndex += 1) {
      if ((slotsRef.current[slotIndex]?.logoIndex ?? -1) < 0) continue;
      scheduleSlotRotation(slotIndex);
    }

    return () => {
      active = false;
      for (const timeoutId of timeoutIds) {
        window.clearTimeout(timeoutId);
      }
      reservedIndices.clear();
    };
  }, [logos]);

  const renderedSlots = useMemo(() => {
    return Array.from({ length: SLOT_COUNT }, (_, index) => {
      const slot = slots[index];
      const logo =
        slot && slot.logoIndex >= 0 ? (logos[slot.logoIndex] ?? null) : null;
      const isVisible = slot?.isVisible ?? true;
      return { logo, isVisible, fallbackLabel: FALLBACK_LABELS[index] };
    });
  }, [logos, slots]);

  return (
    <div className="grid h-12 shrink-0 grid-cols-2 divide-x divide-white/20 border-t border-b border-white/20 md:grid-cols-4">
      {renderedSlots.map((slot, index) => (
        <div key={`slot-${index}`} className="flex items-center justify-center px-3">
          <div
            className={`transition-opacity duration-300 ${slot.isVisible ? "opacity-100" : "opacity-0"}`}
          >
            {slot.logo ? (
              <RotatingLogoImage key={slot.logo.slug} logo={slot.logo} />
            ) : (
              <span className="type-content text-[10px] uppercase tracking-[0.16em] text-white/70 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
                {slot.fallbackLabel}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
