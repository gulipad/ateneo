import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="flex h-[100dvh] flex-col items-center justify-center bg-black text-white">
      <p className="text-[10px] uppercase tracking-[0.16em] text-white/60 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
        Solicitud enviada
      </p>
      <h1 className="mt-4 text-3xl [font-family:Georgia,'Times_New_Roman',Times,serif]">
        Gracias por tu solicitud
      </h1>
      <p className="mt-4 max-w-md text-center text-sm text-white/60 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
        Hemos recibido tu solicitud correctamente. Nos pondremos en contacto
        contigo pronto.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-10 items-center border border-white/40 px-5 text-xs uppercase tracking-[0.18em] text-white/70 transition-colors hover:border-white hover:text-white [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
