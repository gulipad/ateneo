import { HeroAteneoExport } from "@/components/hero-ateneo-export";

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-y border-white/20">
        <nav className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 md:px-10">
          <p className="text-xs uppercase tracking-[0.22em] [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
            Ateneo
          </p>
          <div className="hidden gap-8 text-xs uppercase tracking-[0.14em] [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] md:flex">
            <a href="/ascii" className="opacity-80 transition-opacity hover:opacity-100">
              ASCII Lab
            </a>
            <span className="opacity-80">Archive</span>
            <span className="opacity-80">Contact</span>
          </div>
        </nav>
      </header>

      <section className="mx-auto w-full max-w-[1440px] border-x border-white/20">
        <div className="grid min-h-[calc(100vh-4rem)] grid-rows-[1fr_auto]">
          <div className="grid h-full md:grid-cols-2">
            <div className="flex h-full items-center border-b border-white/20 px-6 py-16 md:border-r md:border-b-0 md:px-10 md:py-20">
              <div>
                <h1 className="max-w-[18ch] text-5xl leading-[1.02] tracking-tight [font-family:Georgia,'Times_New_Roman',Times,serif] md:text-7xl">
                  A Digital Facade For Ateneo De Sevilla
                </h1>
                <p className="mt-5 max-w-[56ch] text-sm leading-relaxed text-white/72 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] md:text-base">
                  We are shaping an interactive visual system around the facade.
                  This hero now pairs narrative on the left with live ASCII on the
                  right.
                </p>
                <div className="mt-8">
                  <a
                    href="/ascii"
                    className="inline-flex h-11 items-center border border-white px-5 text-xs uppercase tracking-[0.18em] [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] transition-colors hover:bg-white hover:text-black"
                  >
                    Open ASCII Lab
                  </a>
                </div>
              </div>
            </div>
            <div className="h-full min-h-[460px] border-b border-white/20 md:min-h-0">
              <HeroAteneoExport />
            </div>
          </div>

          <div className="grid h-12 grid-cols-2 divide-x divide-white/20 border-t border-white/20 md:grid-cols-4">
            <div className="flex items-center px-4 text-[10px] uppercase tracking-[0.16em] text-white/70 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
              Logo 01
            </div>
            <div className="flex items-center px-4 text-[10px] uppercase tracking-[0.16em] text-white/70 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
              Logo 02
            </div>
            <div className="hidden items-center px-4 text-[10px] uppercase tracking-[0.16em] text-white/70 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] md:flex">
              Logo 03
            </div>
            <div className="hidden items-center px-4 text-[10px] uppercase tracking-[0.16em] text-white/70 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] md:flex">
              Logo 04
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
