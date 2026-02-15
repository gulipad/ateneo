import { HeroAteneoExport } from "@/components/hero-ateneo-export";
import { AsciiExportCanvas } from "@/components/ascii-export-canvas";
import type { AsciiExport } from "@/lib/ascii-export";
import asciiArtifact from "@/data/ateneo-export.json";

const FORO_SECTIONS = [
  {
    title: "Preguntas críticas",
    copy: "Bloque para dudas de alto impacto: pricing, contratación, churn, caja o decisiones de producto sin una respuesta obvia.",
  },
  {
    title: "Feedback de producto",
    copy: "Espacio para compartir landings, demos, onboarding o roadmap y recibir feedback accionable de otros fundadores.",
  },
  {
    title: "Ventas y distribución",
    copy: "Tácticas reales de adquisición, outbound, partnerships y ventas enterprise con métricas y contexto.",
  },
  {
    title: "Capital y runway",
    copy: "Conversaciones sobre fundraising, deuda, eficiencia, burn múltiple y escenarios de caja con transparencia.",
  },
  {
    title: "Operaciones de fundador",
    copy: "Decisiones de estructura, delegación, liderazgo y cultura en etapas tempranas y de escalado.",
  },
  {
    title: "Hitos y aprendizajes",
    copy: "Canal para compartir victorias, fracasos y postmortems que ayuden al resto a avanzar más rápido.",
  },
] as const;

const REQUISITOS = [
  "Ser fundador o cofundador activo de una compañía.",
  "Operar en España o construir desde España.",
  "Participar con generosidad: pedir ayuda y también aportar.",
  "Mantener confidencialidad y respeto entre miembros.",
  "No se admiten VCs, empleados ni perfiles ejecutivos no fundadores.",
] as const;

const PROCESO = [
  {
    step: "01",
    title: "Solicitud",
    copy: "Completa el formulario con contexto real sobre ti y tu empresa.",
  },
  {
    step: "02",
    title: "Revisión",
    copy: "Validamos encaje con los criterios de acceso y densidad del grupo.",
  },
  {
    step: "03",
    title: "Incorporación",
    copy: "Si hay fit, accedes al foro privado y al onboarding de la comunidad.",
  },
] as const;

const BILLBOARD_PRIMARY = "Una nueva especie de foro para fundadores.";
const BILLBOARD_SECONDARY =
  "Diseñado para operadores en España que trabajan con ambición y criterio. Menos ruido, más contexto y mejores decisiones.";

const PILARES = [
  {
    fig: "FIG 0.2",
    title: "Preguntas que importan",
    copy: "Un espacio para plantear decisiones difíciles con contexto real y respuestas de fundadores que ya pasaron por ahí.",
  },
  {
    fig: "FIG 0.3",
    title: "Feedback sin ruido",
    copy: "Producto, go-to-market, hiring y ejecución. Conversaciones directas, prácticas y orientadas a mejorar decisiones.",
  },
  {
    fig: "FIG 0.4",
    title: "Densidad de talento",
    copy: "Una comunidad curada para que cada interacción eleve el nivel: menos volumen, más criterio y más velocidad.",
  },
] as const;

export default function Page() {
  const sectionArtifact = asciiArtifact as AsciiExport;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full 2xl:max-w-[1440px] 2xl:border-x 2xl:border-white/20">
        <header className="h-16 border-y border-white/20">
          <nav className="flex h-full items-center justify-between px-6 md:px-10">
            <p className="type-content text-xs uppercase tracking-[0.22em] [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
              Ateneo
            </p>
            <div className="type-content hidden gap-8 text-xs uppercase tracking-[0.14em] [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light md:flex">
              <a
                href="#manifiesto"
                className="opacity-80 transition-opacity hover:opacity-100"
              >
                Manifiesto
              </a>
              <a
                href="#secciones"
                className="opacity-80 transition-opacity hover:opacity-100"
              >
                Secciones
              </a>
              <a
                href="#requisitos"
                className="opacity-80 transition-opacity hover:opacity-100"
              >
                Requisitos
              </a>
            </div>
          </nav>
        </header>

        <section className="w-full">
          <div className="flex min-h-[calc(100dvh-4rem)] flex-col md:h-[calc(100dvh-4rem)]">
            <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2">
              <div className="flex min-h-0 items-center border-b border-white/20 px-6 py-10 md:border-r md:border-b-0 md:px-10 md:py-12 lg:py-16">
                <div className="w-full max-w-[36rem]">
                  <h1 className="type-heading mt-2 max-w-[13ch] text-[clamp(2.6rem,5.3vw,5rem)] leading-[0.98] tracking-tight [font-family:Georgia,'Times_New_Roman',Times,serif]">
                    El foro para fundadores excepcionales.
                  </h1>
                  <p className="type-content mt-5 max-w-[42ch] text-sm leading-relaxed text-white/72 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light md:text-base">
                    Conecta con los fundadores españoles que están construyendo
                    el futuro del software Español.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <a
                      href="/apply"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="type-content inline-flex h-11 items-center border border-white px-5 text-xs uppercase tracking-[0.18em] [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light transition-colors hover:bg-white hover:text-black"
                    >
                      Únete a la red
                    </a>
                  </div>
                </div>
              </div>
              <div className="min-h-[34vh] overflow-hidden sm:min-h-[40vh] md:min-h-0">
                <HeroAteneoExport />
              </div>
            </div>

            <div className="grid h-12 shrink-0 grid-cols-2 divide-x divide-white/20 border-t border-b border-white/20 md:grid-cols-4">
              <div className="type-content flex items-center px-4 text-[10px] uppercase tracking-[0.16em] text-white/70 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
                Solo fundadores
              </div>
              <div className="type-content flex items-center px-4 text-[10px] uppercase tracking-[0.16em] text-white/70 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
                Comunidad privada
              </div>
              <div className="type-content hidden items-center px-4 text-[10px] uppercase tracking-[0.16em] text-white/70 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light md:flex">
                España
              </div>
              <div className="type-content hidden items-center px-4 text-[10px] uppercase tracking-[0.16em] text-white/70 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light md:flex">
                Alta densidad de talento
              </div>
            </div>
          </div>
        </section>

        <section className="w-full border-b border-white/20">
          <div className="border-b border-white/20 px-6 py-10 md:px-10 md:py-14">
            <p className="type-heading max-w-[27ch] text-[clamp(2rem,4.6vw,4.15rem)] leading-[1.04] tracking-[-0.02em] text-white [font-family:'Inter','Segoe_UI',system-ui,-apple-system,sans-serif]">
              {BILLBOARD_PRIMARY}{" "}
              <span className="text-white/58">{BILLBOARD_SECONDARY}</span>
            </p>
          </div>

          <div className="grid divide-y divide-white/20 md:grid-cols-3 md:divide-x md:divide-y-0">
            {PILARES.map((item, index) => (
              <article
                key={item.fig}
                className="flex flex-col px-6 py-8 md:px-8 md:py-10 lg:px-10"
              >
                <p className="type-content text-[11px] uppercase tracking-[0.2em] text-white/35 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
                  {item.fig}
                </p>
                <div className="mt-7 h-[240px] border border-white/15 bg-[#04060b] sm:h-[260px]">
                  <AsciiExportCanvas
                    artifact={sectionArtifact}
                    fit={index === 1 ? "cover" : "contain"}
                    className="h-full w-full"
                  />
                </div>
                <h3 className="type-heading mt-8 text-[2rem] leading-[1.03] tracking-tight text-white [font-family:Georgia,'Times_New_Roman',Times,serif]">
                  {item.title}
                </h3>
                <p className="type-content mt-4 max-w-[38ch] text-[1.04rem] leading-relaxed text-white/58 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
                  {item.copy}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="manifiesto"
          className="w-full border-b border-white/20 px-6 py-16 md:px-10 md:py-24"
        >
          <div className="grid gap-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/60 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
                Manifiesto
              </p>
              <h2 className="mt-4 max-w-[16ch] text-4xl leading-[1.03] [font-family:Georgia,'Times_New_Roman',Times,serif] md:text-6xl">
                La alquimia no es azar. Es foro.
              </h2>
              <p className="mt-6 max-w-[60ch] text-sm leading-relaxed text-white/72 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light md:text-base">
                En el Ateneo de 1927 coincidieron mentes que terminaron
                definiendo una era. No por casualidad: compartían contexto,
                conversación y fricción intelectual. Ateneo quiere recrear esa
                dinámica para fundadores hoy, con un entorno donde se pregunta
                mejor, se responde mejor y se ejecuta mejor.
              </p>
            </div>
            <article className="border border-white/20 bg-white/[0.02] p-6">
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/55 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
                Tesis
              </p>
              <p className="mt-4 text-sm leading-relaxed text-white/75 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
                La grandeza nunca es el objetivo. Es la consecuencia de reunir a
                las personas correctas en el foro correcto, con reglas
                correctas.
              </p>
            </article>
          </div>
        </section>

        <section
          id="secciones"
          className="w-full border-b border-white/20 px-6 py-16 md:px-10 md:py-20"
        >
          <div className="max-w-4xl">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/60 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
              Primera iteración del foro
            </p>
            <h2 className="mt-4 max-w-[18ch] text-4xl leading-[1.05] [font-family:Georgia,'Times_New_Roman',Times,serif] md:text-5xl">
              Secciones requeridas y copy inicial
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {FORO_SECTIONS.map((section) => (
              <article
                key={section.title}
                className="border border-white/20 bg-white/[0.02] p-5 md:p-6"
              >
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/62 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
                  {section.title}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/75 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
                  {section.copy}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="requisitos"
          className="w-full border-b border-white/20 px-6 py-16 md:px-10 md:py-20"
        >
          <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/60 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
                Requisitos de acceso
              </p>
              <h2 className="mt-4 max-w-[17ch] text-4xl leading-[1.05] [font-family:Georgia,'Times_New_Roman',Times,serif] md:text-5xl">
                Densidad de talento con reglas claras
              </h2>
            </div>
            <div className="grid gap-3">
              {REQUISITOS.map((item) => (
                <div
                  key={item}
                  className="border border-white/20 bg-white/[0.02] px-4 py-3 text-sm leading-relaxed text-white/75 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full px-6 py-16 md:px-10 md:py-20">
          <div className="grid gap-4 md:grid-cols-3">
            {PROCESO.map((item) => (
              <article
                key={item.step}
                className="border border-white/20 bg-white/[0.02] p-5 md:p-6"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/55 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
                  Paso {item.step}
                </p>
                <h3 className="mt-3 text-xl [font-family:Georgia,'Times_New_Roman',Times,serif]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/75 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
                  {item.copy}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-10 flex justify-end">
            <a
              href="/apply"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center border border-white px-5 text-xs uppercase tracking-[0.18em] [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light transition-colors hover:bg-white hover:text-black"
            >
              Aplicar ahora
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
