"use client";

import { useEffect, useState } from "react";

type CtaMode = "hidden" | "fixed" | "docked";

function getSectionBottom(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return window.scrollY + rect.bottom;
}

export function PersistentJoinCta() {
  const [mode, setMode] = useState<CtaMode>("hidden");

  useEffect(() => {
    let frameId = 0;

    const updateMode = () => {
      const como = document.getElementById("como");
      const que = document.getElementById("que");
      if (!como || !que) {
        setMode("hidden");
        return;
      }

      const scrollTop = window.scrollY;
      const viewportBottom = scrollTop + window.innerHeight;
      const comoBottom = getSectionBottom(como);
      const queBottom = getSectionBottom(que);
      const revealOffset = Math.min(520, window.innerHeight * 0.6);
      const hideOffset = Math.min(680, window.innerHeight * 0.78);
      const showAt = comoBottom - revealOffset;
      const hideAt = comoBottom - hideOffset;

      setMode((current) => {
        if (current === "hidden" && scrollTop < showAt) return "hidden";
        if (current !== "hidden" && scrollTop < hideAt) return "hidden";
        if (viewportBottom >= queBottom) return "docked";
        return "fixed";
      });
    };

    const requestUpdate = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateMode);
    };

    updateMode();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  const isDocked = mode === "docked";
  const isVisible = mode !== "hidden";

  return (
    <div
      className={`pointer-events-none z-40 transition-all duration-300 ${
        isDocked
          ? "absolute inset-x-0 bottom-6 px-6 md:bottom-8 md:px-10"
          : "fixed inset-x-0 bottom-6 px-6 md:px-10"
      }`}
      aria-hidden={!isVisible}
    >
      <div
        className={`${isVisible ? "pointer-events-auto" : "pointer-events-none"} mx-auto flex w-full max-w-[640px] items-center justify-between gap-4 border border-white/25 bg-white/[0.06] px-4 py-3 shadow-[0_18px_56px_rgba(0,0,0,0.52)] backdrop-blur-xl transition-all duration-300 md:px-5 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <p className="type-content text-[10px] uppercase tracking-[0.16em] text-white/72 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
          Comunidad privada para fundadores
        </p>
        <a
          href="/apply"
          target="_blank"
          rel="noopener noreferrer"
          className="type-content inline-flex h-10 shrink-0 items-center border border-white/40 bg-black/25 px-4 text-[11px] uppercase tracking-[0.16em] text-white transition-colors hover:border-white hover:bg-white hover:text-black [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light"
        >
          Únete al foro
        </a>
      </div>
    </div>
  );
}
