import { AsciiGenerator } from "@/components/ascii-generator";

export default function AsciiPage() {
  return (
    <main className="h-[100svh] overflow-hidden bg-[#04060b] text-slate-100">
      <AsciiGenerator />
    </main>
  );
}
