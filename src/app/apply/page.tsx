import Link from "next/link";
import { InvestorsPillInput } from "@/components/apply/investors-pill-input";

const OPTIONS_ROL = ["Fundador", "Co-fundador", "Otro"] as const;
const OPTIONS_CAPITAL = [
  "Bootstrapped",
  "<1M€",
  "1-5M€",
  "5-10M€",
  "10-50M€",
  "+50M€",
] as const;
const OPTIONS_INGRESOS = [
  "Pre-revenue",
  "<1M€",
  "1-5M€",
  "5-10M€",
  "10-50M€",
  "+50M€",
] as const;
const OPTIONS_DESCUBRIMIENTO = [
  "LinkedIn",
  "Boca a boca",
  "Búsqueda",
  "Twitter",
  "Reddit",
  "ChatGPT & otros",
] as const;

function FieldLabel({ children, optional = false }: { children: string; optional?: boolean }) {
  return (
    <span className="text-[11px] uppercase tracking-[0.12em] text-white/70 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
      {children}
      {optional ? <span className="ml-2 text-white/40">(Opcional)</span> : null}
    </span>
  );
}

export default function ApplyPage() {
  return (
    <main className="h-[100dvh] overflow-hidden bg-black text-white">
      <div className="mx-auto flex h-full w-full flex-col 2xl:max-w-[1440px] 2xl:border-x 2xl:border-white/20">
        <header className="h-16 border-y border-white/20">
          <nav className="flex h-full items-center justify-between px-6 md:px-10">
            <p className="text-xs uppercase tracking-[0.22em] [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
              Ateneo
            </p>
            <div className="hidden gap-8 text-xs uppercase tracking-[0.14em] [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] md:flex">
              <Link href="/ascii" className="opacity-80 transition-opacity hover:opacity-100">
                ASCII Lab
              </Link>
              <Link href="/apply" className="opacity-100">
                Apply
              </Link>
              <span className="opacity-80">Archive</span>
            </div>
          </nav>
        </header>

        <section className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_4rem] border-b border-white/20 md:border-r md:border-b-0">
            <div className="min-h-0 overflow-y-auto">
              <form className="space-y-8 px-6 py-8 md:px-10 md:py-10">
                <section className="space-y-4">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/65 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
                    Personal
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2">
                      <FieldLabel>Nombre</FieldLabel>
                      <input
                        type="text"
                        className="h-11 border border-white/20 bg-transparent px-3 text-sm text-white outline-none transition-colors focus:border-white/50 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]"
                      />
                    </label>
                    <label className="grid gap-2">
                      <FieldLabel>Apellidos</FieldLabel>
                      <input
                        type="text"
                        className="h-11 border border-white/20 bg-transparent px-3 text-sm text-white outline-none transition-colors focus:border-white/50 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]"
                      />
                    </label>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2">
                      <FieldLabel>Email</FieldLabel>
                      <input
                        type="email"
                        className="h-11 border border-white/20 bg-transparent px-3 text-sm text-white outline-none transition-colors focus:border-white/50 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]"
                      />
                    </label>
                    <label className="grid gap-2">
                      <FieldLabel>Teléfono</FieldLabel>
                      <input
                        type="tel"
                        className="h-11 border border-white/20 bg-transparent px-3 text-sm text-white outline-none transition-colors focus:border-white/50 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]"
                      />
                    </label>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2">
                      <FieldLabel>LinkedIn URL</FieldLabel>
                      <input
                        type="url"
                        className="h-11 border border-white/20 bg-transparent px-3 text-sm text-white outline-none transition-colors focus:border-white/50 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]"
                      />
                    </label>
                    <label className="grid gap-2">
                      <FieldLabel>Twitter @</FieldLabel>
                      <input
                        type="text"
                        className="h-11 border border-white/20 bg-transparent px-3 text-sm text-white outline-none transition-colors focus:border-white/50 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]"
                      />
                    </label>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2">
                      <FieldLabel>Rol</FieldLabel>
                      <select className="h-11 border border-white/20 bg-black px-3 text-sm text-white outline-none transition-colors focus:border-white/50 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
                        <option value="">Selecciona...</option>
                        {OPTIONS_ROL.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-2">
                      <FieldLabel>Título</FieldLabel>
                      <input
                        type="text"
                        className="h-11 border border-white/20 bg-transparent px-3 text-sm text-white outline-none transition-colors focus:border-white/50 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]"
                      />
                    </label>
                  </div>
                </section>

                <section className="space-y-4">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/65 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
                    Empresa
                  </p>
                  <div className="grid gap-4">
                    <label className="grid gap-2">
                      <FieldLabel>Web</FieldLabel>
                      <input
                        type="url"
                        className="h-11 border border-white/20 bg-transparent px-3 text-sm text-white outline-none transition-colors focus:border-white/50 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]"
                      />
                    </label>
                    <label className="grid gap-2">
                      <FieldLabel>Capital levantado</FieldLabel>
                      <select className="h-11 border border-white/20 bg-black px-3 text-sm text-white outline-none transition-colors focus:border-white/50 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
                        <option value="">Selecciona...</option>
                        {OPTIONS_CAPITAL.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-2">
                      <FieldLabel>Rango de ingresos</FieldLabel>
                      <select className="h-11 border border-white/20 bg-black px-3 text-sm text-white outline-none transition-colors focus:border-white/50 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
                        <option value="">Selecciona...</option>
                        {OPTIONS_INGRESOS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                    <InvestorsPillInput
                      label="Inversores (Web)"
                      placeholder="Escribe y separa por comas"
                    />
                  </div>
                </section>

                <section className="space-y-4 pb-8">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/65 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
                    Otros
                  </p>
                  <label className="grid gap-2">
                    <FieldLabel optional>¿Te ha referido alguien de la comunidad?</FieldLabel>
                    <input
                      type="text"
                      className="h-11 border border-white/20 bg-transparent px-3 text-sm text-white outline-none transition-colors focus:border-white/50 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]"
                    />
                  </label>
                  <label className="grid gap-2">
                    <FieldLabel optional>¿Cómo has oído hablar de Ateneo?</FieldLabel>
                    <select className="h-11 border border-white/20 bg-black px-3 text-sm text-white outline-none transition-colors focus:border-white/50 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
                      <option value="">Selecciona...</option>
                      {OPTIONS_DESCUBRIMIENTO.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                </section>
              </form>
            </div>

            <div className="flex h-16 items-center justify-end border-t border-white/20 px-6 md:px-10">
              <button
                type="button"
                className="inline-flex h-10 items-center border border-white px-5 text-xs uppercase tracking-[0.18em] [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] transition-colors hover:bg-white hover:text-black"
              >
                Enviar solicitud
              </button>
            </div>
          </div>

          <aside className="hidden min-h-0 items-center justify-center border-l border-white/20 p-8 md:flex md:p-10">
            <div className="w-full max-w-[440px] border border-white/20 bg-white/[0.02] p-6">
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/60 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
                Vista previa
              </p>
              <div className="mt-4 border border-white/20 bg-black/60 p-6">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/65 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
                  Solicitud Ateneo
                </p>
                <p className="mt-10 text-2xl [font-family:Georgia,'Times_New_Roman',Times,serif]">
                  Nombre Apellidos
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/55 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
                  Tarjeta de aplicación
                </p>
                <div className="mt-8 grid grid-cols-2 gap-3 text-[10px] uppercase tracking-[0.14em] text-white/55 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
                  <span>ID APL-204</span>
                  <span className="text-right">SEVILLA</span>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
