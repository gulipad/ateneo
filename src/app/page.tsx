import { HeroAteneoExport } from "@/components/hero-ateneo-export";
import { HeroLogoRotator } from "@/components/hero-logo-rotator";
import { AsciiExportCanvas } from "@/components/ascii-export-canvas";
import { PersistentJoinCta } from "@/components/persistent-join-cta";
import { SiteModalController } from "@/components/site-modal-controller";
import Image from "next/image";
import Link from "next/link";
import type { AsciiExport } from "@/lib/ascii-export";
import conocimientoArtifact from "@/data/conocimiento-export.json";
import consejoArtifact from "@/data/consejo-export.json";
import recomendacionesArtifact from "@/data/recomendaciones-export.json";
import fundadoresNetworkArtifact from "@/data/fundadores-network-export.json";

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

const QUE_ITEMS = [
  {
    title: "Conocimiento",
    copy: "Entérate de lo que está pasando. Aprende las mejores prácticas y tendencias de la industria de otros fundadores excepcionales.",
  },
  {
    title: "Consejo",
    copy: "Aprende sobre estructura, delegación, liderazgo y cultura, con un canal para compartir hitos, fracasos y postmortems.",
  },
  {
    title: "Recomendaciones",
    copy: " Recibe recomendaciones sobre inversores, abogados, empleadosy otros aspectos clave para la vida de fundador.",
  },
] as const;

const NETWORK_CANVAS_ASPECT_RATIO =
  (fundadoresNetworkArtifact.dimensions.cols *
    fundadoresNetworkArtifact.render.charWidthFactor) /
  (fundadoresNetworkArtifact.dimensions.rows *
    fundadoresNetworkArtifact.render.lineHeightFactor);

function PlaceholderIllustration({ variant }: { variant: number }) {
  if (variant === 0) {
    return (
      <svg viewBox="0 0 260 190" className="h-full w-full">
        <g fill="none" stroke="rgba(226,232,240,0.38)" strokeWidth="1.2">
          <polygon points="130,24 220,72 130,118 40,72" />
          <polygon points="130,50 188,82 130,114 72,82" />
          <path d="M40 72v64l90 48 90-48V72" />
          <path d="M72 126l58 32 58-32" />
        </g>
      </svg>
    );
  }

  if (variant === 1) {
    return (
      <svg viewBox="0 0 260 190" className="h-full w-full">
        <g fill="none" stroke="rgba(226,232,240,0.35)" strokeWidth="1.2">
          <rect x="42" y="68" width="60" height="56" rx="4" />
          <rect x="98" y="36" width="60" height="56" rx="4" />
          <rect x="154" y="68" width="60" height="56" rx="4" />
          <rect x="98" y="100" width="60" height="56" rx="4" />
          <path d="M42 124l56 32 60-32 56 32" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 260 190" className="h-full w-full">
      <g fill="none" stroke="rgba(226,232,240,0.34)" strokeWidth="1.2">
        <path d="M36 134L146 76l78 40" />
        <path d="M44 142L146 88l70 36" />
        <path d="M52 150L146 100l62 32" />
        <path d="M60 158L146 112l54 28" />
        <path d="M68 166L146 124l46 24" />
        <path d="M76 174L146 136l38 20" />
      </g>
    </svg>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full 2xl:max-w-[1440px] 2xl:border-x 2xl:border-white/20">
        <header className="h-16 border-y border-white/20">
          <nav className="flex h-full items-center justify-between px-6 md:px-10">
            <Link href="/" aria-label="Ir a inicio">
              <Image
                src="/ateneo.svg"
                alt="Ateneo"
                width={188}
                height={30}
                priority
                className="h-7 w-auto md:h-8"
              />
            </Link>
            <div className="type-content flex items-center gap-4 text-xs uppercase tracking-[0.14em] [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
              <a
                href="/apply"
                target="_blank"
                rel="noopener noreferrer"
                data-modal-target="requisitos"
                className="inline-flex h-9 items-center border border-white/40 px-4 text-[10px] tracking-[0.16em] transition-colors hover:border-white hover:bg-white hover:text-black md:h-10 md:px-5 md:text-[11px]"
              >
                Unete a Ateneo
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
                    Un espacio independiente para acelerar el ecosistema
                    español. Sólo para fundadores.
                  </p>
                </div>
              </div>
              <div className="min-h-[34vh] overflow-hidden p-2 sm:min-h-[40vh] sm:p-3 md:min-h-0 md:p-0">
                <HeroAteneoExport />
              </div>
            </div>

            <HeroLogoRotator />
          </div>
        </section>

        <section
          id="por-que"
          className="w-full border-b border-white/20 px-6 py-12 md:px-10 md:py-16"
        >
          <div className="grid gap-10 md:grid-cols-2 md:gap-14">
            <div className="border-b border-white/20 pb-8 md:border-b-0 md:pb-0">
              <p className="type-content text-[11px] uppercase tracking-[0.22em] text-white/45 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
                Por qué
              </p>
              <h2 className="type-heading mt-4 max-w-[15ch] text-[clamp(2rem,3.8vw,3.5rem)] leading-[1.03] tracking-tight [font-family:Georgia,'Times_New_Roman',Times,serif]">
                La brillantez no nace del vacío.
              </h2>
            </div>

            <div className="md:pt-1 md:pl-8 lg:pl-12">
              <p className="type-content max-w-[64ch] text-[1.02rem] leading-relaxed text-white/68 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
                Ateneo nace de un principio fundamental: el efecto multiplicador
                de un ecosistema es directamente proporcional al conocimiento
                compartido entre sus miembros. La etapas doradas de un
                movimiento son consecuencia de dar un espacio común a las mentes
                más brillantes. Queremos una nueva etapa dorada para el software
                español.
              </p>

              <button
                type="button"
                data-modal-target="carta"
                className="type-content group mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/70 transition-colors hover:text-white [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light"
              >
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                  ↗
                </span>
                <span className="underline decoration-white/20 underline-offset-4 transition-colors group-hover:decoration-white/60">
                  Leer carta fundacional
                </span>
              </button>
            </div>
          </div>
        </section>

        <section
          id="como"
          className="w-full border-b border-white/20 px-6 py-16 md:px-10 md:py-24"
        >
          <div className="grid gap-10 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div>
              <p className="type-content text-[11px] uppercase tracking-[0.22em] text-white/60 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
                Cómo
              </p>
              <h2 className="mt-4 max-w-[16ch] text-4xl leading-[1.03] [font-family:Georgia,'Times_New_Roman',Times,serif] md:text-6xl">
                Fabricamos serendipia.
              </h2>
              <p className="type-content mt-6 max-w-[58ch] text-[1.02rem] leading-relaxed text-white/68 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
                El ecosistema español está fragmentado. Ateneo busca
                concentrarlo en un espacio independiente, selectivo, y de
                confianza.
              </p>
            </div>

            <div className="grid gap-4 md:pt-2">
              <article className="border border-white/20 bg-white/[0.02] p-6">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/55 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
                  Independiente
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/75 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
                  Ateneo no depende de ninguna institución. No es de ningún
                  fondo, empresa o fundación. Es autogestionado.
                </p>
              </article>

              <article className="border border-white/20 bg-white/[0.02] p-6">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/55 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
                  Altamente selectivo
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/75 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
                  Sólo para fundadores. No VCs, empleados ni perfiles
                  ejecutivos.
                </p>
              </article>

              <article className="border border-white/20 bg-white/[0.02] p-6">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/55 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
                  Confidencial
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/75 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
                  Es un entorno de alta confianza. Lo que se habla en el foro,
                  se queda en el foro.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          id="que"
          className="relative w-full px-6 py-14 pb-32 md:px-10 md:py-16 md:pb-36"
        >
          <div>
            <p className="type-content text-[11px] uppercase tracking-[0.22em] text-white/60 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
              Qué
            </p>
            <h2 className="type-heading mt-4 max-w-[24ch] text-[clamp(2rem,3.8vw,3.5rem)] leading-[1.03] [font-family:Georgia,'Times_New_Roman',Times,serif]">
              Un canal para compartir las claves para crecer
            </h2>
          </div>

          <div className="mt-10 md:border-x md:border-white/20">
            <div className="grid md:grid-cols-3 md:divide-x md:divide-white/20">
              {QUE_ITEMS.map((item, index) => (
                <article
                  key={item.title}
                  className="px-0 py-6 md:px-8 md:py-8 lg:px-10"
                >
                  <div className="mt-4 h-[180px] md:h-[200px]">
                    {index === 0 ? (
                      <AsciiExportCanvas
                        artifact={conocimientoArtifact as AsciiExport}
                        className="h-full w-full"
                        fit="contain"
                        trimWhitespace
                        background="transparent"
                      />
                    ) : index === 1 ? (
                      <AsciiExportCanvas
                        artifact={consejoArtifact as AsciiExport}
                        className="h-full w-full"
                        fit="contain"
                        trimWhitespace
                        background="transparent"
                      />
                    ) : index === 2 ? (
                      <AsciiExportCanvas
                        artifact={recomendacionesArtifact as AsciiExport}
                        className="h-full w-full"
                        fit="contain"
                        trimWhitespace
                        background="transparent"
                      />
                    ) : (
                      <PlaceholderIllustration variant={index} />
                    )}
                  </div>

                  <p className="type-content mt-6 text-[11px] uppercase tracking-[0.2em] text-white/72 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
                    {item.title}
                  </p>
                  <p className="type-content mt-3 max-w-[44ch] text-sm leading-relaxed text-white/65 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
                    {item.copy}
                  </p>
                </article>
              ))}
            </div>
          </div>
          <PersistentJoinCta />
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
        </section>

        <section className="w-full px-6 pt-0 pb-8 text-center md:px-10 md:pt-1 md:pb-10">
          <div
            className="inline-block h-[340px] overflow-hidden md:h-[480px]"
            style={{ aspectRatio: NETWORK_CANVAS_ASPECT_RATIO }}
          >
            <AsciiExportCanvas
              artifact={fundadoresNetworkArtifact as AsciiExport}
              className="h-full w-full"
              fit="contain"
              trimWhitespace
              background="transparent"
            />
          </div>
        </section>

        <footer className="w-full border-t border-white/20 px-6 py-10 md:px-10 md:py-14">
          <div className="grid gap-4 md:grid-cols-3 md:items-end">
            <Link href="/" aria-label="Ir a inicio" className="inline-flex">
              <Image
                src="/ateneo.svg"
                alt="Ateneo"
                width={188}
                height={30}
                className="h-6 w-auto opacity-85 transition-opacity hover:opacity-100"
              />
            </Link>
            <p className="type-content text-[10px] uppercase tracking-[0.16em] text-white/45 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light md:text-center">
              Comunidad privada de fundadores en España
            </p>
            <div className="md:text-right">
              <a
                href="/apply"
                target="_blank"
                rel="noopener noreferrer"
                data-modal-target="requisitos"
                className="type-content inline-flex h-9 items-center border border-white/35 px-4 text-[10px] uppercase tracking-[0.16em] text-white/85 transition-colors hover:border-white hover:bg-white hover:text-black [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light"
              >
                Unete a Ateneo
              </a>
            </div>
          </div>
        </footer>
      </div>
      <SiteModalController />
    </main>
  );
}
