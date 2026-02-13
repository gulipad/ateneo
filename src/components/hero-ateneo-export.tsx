"use client";

import { AsciiExportCanvas } from "@/components/ascii-export-canvas";
import type { AsciiExport } from "@/lib/ascii-export";
import artifact from "@/data/ateneo-export.json";

export function HeroAteneoExport() {
  return (
    <AsciiExportCanvas
      artifact={artifact as AsciiExport}
      className="h-full w-full"
      fit="contain"
    />
  );
}
