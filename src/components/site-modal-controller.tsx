"use client";

import { useEffect, useState } from "react";

type ModalType = "carta" | "requisitos" | null;

const REQUISITOS_ACCESO = [
  "Tener el título de fundador o co-fundador de una startup tecnológica.",
  "Tener una valoración >€5M.",
  "Haber levantado fondos de capital riesgo o de aceleradoras relevantes.",
] as const;

const CARTA_BLOQUE_1 = [
  "En diciembre de 1927, tras la fachada adornada en barroco y forja del Excelentísimo Ateneo de Sevilla, tuvo lugar un singular encuentro.",
  "Madera noble vestía una sala amplia, cargada del humo denso del tabaco de pipa. Un joven Alberti encendía el pitillo de un Lorca de veintitantos, que, tras una calada torpe, difuminaba su rostro tras la neblina azulada. Al final de la estancia, Luis Cernuda, poeta local, observaba tímidamente, con la fascinación muda del discípulo. El Lázaro -futuro Nobel, Vicente Aleixandre- acompañaba en voz y espíritu, pues su enfermedad le impedía la presencia corpórea.",
  "Tras ellos, la extraña amalgama que lo hacía posible: el oro del ruedo de Sánchez Mejías y la firma institucional de Blasco Garzón, uniendo el valor y la ley al servicio del arte. Este singular encuentro, aunque en ese momento no lo sabían, fue el germen de una de las más brillantes etapas de la literatura española. La Generación del 27.",
] as const;

const CARTA_BLOQUE_2 = [
  "Acostumbramos a celebrar los grandes nombres de la Historia de manera aislada. Cada hombre y mujer su propio icono. Lorca, Alberti, Cernuda o Salinas. Pero tras la idea romántica del héroe solitario, la realidad es siempre muy distinta. Y es que hay algo que une a todos estos nombres. Se conocían. Compartían foros, cafés y tardes. Correspondencia. Como lo hicieron también Tolkien y Lewis. Schroedinger y Bohr. Neumann y Fermi. Como lo han hecho también otros nombres que por capricho del destino han quedado en el olvido de la consciencia común.",
  "Construir un movimiento literario no es en su esencia muy diferente a construir cualquier otro movimiento. Esa serendipia que desemboca en etapas doradas de distintos dominios y disciplinas no es fruto de la casualidad. Es fruto de los foros que cultivan y dan hogar a los pensadores que se hacen grandes. Esa grandeza nunca es el objetivo, sino la consecuencia.",
  "La alquimia está inventada. Construyamos el foro.",
] as const;

function CartaContent() {
  return (
    <div className="space-y-6">
      {CARTA_BLOQUE_1.map((paragraph) => (
        <p
          key={paragraph}
          className="type-content text-sm leading-relaxed text-white/78 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light"
        >
          {paragraph}
        </p>
      ))}

      <div className="flex items-center gap-3 py-1">
        <span className="h-px flex-1 bg-white/18" />
        <span className="type-content text-xs text-white/45 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
          -
        </span>
        <span className="h-px flex-1 bg-white/18" />
      </div>

      {CARTA_BLOQUE_2.map((paragraph) => (
        <p
          key={paragraph}
          className="type-content text-sm leading-relaxed text-white/78 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}

export function SiteModalController() {
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const trigger = target?.closest<HTMLElement>("[data-modal-target]");
      if (!trigger) return;

      const modalTarget = trigger.dataset.modalTarget;
      if (modalTarget !== "carta" && modalTarget !== "requisitos") return;

      event.preventDefault();
      if (modalTarget === "requisitos") setAccepted(false);
      setOpenModal(modalTarget);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenModal(null);
    };

    document.addEventListener("click", onClick);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    if (openModal) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [openModal]);

  if (!openModal) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-6">
      <button
        type="button"
        aria-label="Cerrar modal"
        onClick={() => setOpenModal(null)}
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
      />

      <div className="relative z-10 w-full max-w-[900px] border border-white/25 bg-black/92 shadow-[0_20px_80px_rgba(0,0,0,0.62)] backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/20 px-5 py-4 md:px-6">
          <p className="type-content text-[11px] uppercase tracking-[0.2em] text-white/78 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
            {openModal === "carta"
              ? "Carta fundacional"
              : "Requisitos de acceso"}
          </p>
          <button
            type="button"
            onClick={() => setOpenModal(null)}
            className="type-content inline-flex h-8 items-center border border-white/30 px-3 text-[10px] uppercase tracking-[0.14em] text-white/70 transition-colors hover:border-white hover:text-white [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]"
          >
            Cerrar
          </button>
        </div>

        <div className="max-h-[72vh] overflow-auto px-5 py-5 md:px-6 md:py-6">
          {openModal === "carta" ? (
            <CartaContent />
          ) : (
            <div className="space-y-6">
              <p className="type-content text-sm leading-relaxed text-white/72 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
                Para proteger la densidad de talento del foro, el acceso está
                limitado a perfiles que cumplan estos criterios.
              </p>

              <div className="space-y-2.5">
                {REQUISITOS_ACCESO.map((item) => (
                  <div
                    key={item}
                    className="border border-white/16 bg-white/[0.03] px-3 py-2.5"
                  >
                    <p className="type-content text-xs leading-relaxed text-white/78 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              <label className="flex items-start gap-3 py-1">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(event) => setAccepted(event.target.checked)}
                  className="mt-0.5 h-4 w-4 cursor-pointer accent-white"
                />
                <span className="type-content text-xs leading-relaxed text-white/80 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light">
                  Confirmo que he leído los requisitos y cumplo los criterios de
                  acceso al foro.
                </span>
              </label>

              <div className="flex justify-end">
                <a
                  href="/apply"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => {
                    if (!accepted) {
                      event.preventDefault();
                      return;
                    }
                    setOpenModal(null);
                  }}
                  aria-disabled={!accepted}
                  className={`type-content inline-flex h-10 items-center border px-4 text-[11px] uppercase tracking-[0.16em] [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] font-light transition-colors ${
                    accepted
                      ? "border-white/40 text-white hover:border-white hover:bg-white hover:text-black"
                      : "cursor-not-allowed border-white/20 text-white/35"
                  }`}
                >
                  Siguiente
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
