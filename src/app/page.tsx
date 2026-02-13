import { HeroAteneoExport } from "@/components/hero-ateneo-export";

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full 2xl:max-w-[1440px] 2xl:border-x 2xl:border-white/20">
        <header className="h-16 border-y border-white/20">
          <nav className="flex h-full items-center justify-between px-6 md:px-10">
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

        <section className="w-full">
          <div className="grid h-[calc(100dvh-4rem)] grid-rows-[minmax(0,1fr)_auto]">
            <div className="grid h-full min-h-0 md:grid-cols-2">
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
              <div className="h-full min-h-0 overflow-hidden md:min-h-0">
                <HeroAteneoExport />
              </div>
            </div>

            <div className="grid h-12 grid-cols-2 divide-x divide-white/20 border-t border-b border-white/20 md:grid-cols-4">
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

        <section className="w-full border-b border-white/20 px-6 py-16 md:px-10 md:py-24">
          <div className="grid gap-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/60 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
                Prototype Section
              </p>
              <h2 className="mt-4 max-w-[16ch] text-4xl leading-[1.03] [font-family:Georgia,'Times_New_Roman',Times,serif] md:text-6xl">
                Temporary Content For Scroll Behavior Checks
              </h2>
              <p className="mt-6 max-w-[58ch] text-sm leading-relaxed text-white/70 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] md:text-base">
                This section is intentionally synthetic. It exists only to force
                additional page depth so you can validate sticky behavior, hero
                exit timing, and transitions while scrolling.
              </p>
            </div>

            <div className="grid gap-4 md:pt-2">
              {["Signal Mapping", "Facade Study", "Lighting Pass"].map((label) => (
                <article
                  key={label}
                  className="border border-white/20 bg-white/[0.02] p-5 md:p-6"
                >
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/55 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
                    {label}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/75 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
                    Placeholder copy for layout stress-testing. Replace with real
                    editorial content once the scroll and hero choreography are
                    finalized.
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-14 grid gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-20 border border-white/15 bg-gradient-to-r from-white/[0.05] to-transparent"
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
