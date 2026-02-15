"use client";

import { useEffect, useState } from "react";
import { AsciiExportCanvas } from "@/components/ascii-export-canvas";
import type { AsciiExport } from "@/lib/ascii-export";
import artifact from "@/data/ateneo-export.json";

export function HeroAteneoExport() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const onChange = () => setIsMobile(media.matches);

    onChange();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }

    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);

  return (
    <AsciiExportCanvas
      artifact={artifact as AsciiExport}
      className="h-full w-full"
      fit={isMobile ? "cover" : "contain"}
    />
  );
}
