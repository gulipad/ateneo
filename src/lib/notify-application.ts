import { resend } from "@/lib/resend";

type ApplicationPayload = {
  personal: {
    nombre: string;
    apellidos: string;
    email: string;
    telefono: { full: string };
    linkedin: string;
    twitter: string | null;
    rol: string;
    titulo: string;
  };
  empresa: {
    web: string;
    capitalLevantado: string;
    rangoIngresos: string;
    inversoresWeb: string[];
  };
  otros: {
    referidoPor: string | null;
    descubrimiento: string | null;
  };
};

export async function notifyApplication(payload: ApplicationPayload) {
  const { personal, empresa, otros } = payload;

  const html = `
<div style="font-family: monospace; max-width: 600px; margin: 0 auto;">
  <h2 style="margin-bottom: 24px;">Nueva solicitud — Founder Forum</h2>

  <h3 style="margin-bottom: 8px;">Personal</h3>
  <table style="border-collapse: collapse; width: 100%; margin-bottom: 24px;">
    <tr><td style="padding: 4px 8px; color: #666;">Nombre</td><td style="padding: 4px 8px;">${personal.nombre} ${personal.apellidos}</td></tr>
    <tr><td style="padding: 4px 8px; color: #666;">Email</td><td style="padding: 4px 8px;">${personal.email}</td></tr>
    <tr><td style="padding: 4px 8px; color: #666;">Teléfono</td><td style="padding: 4px 8px;">${personal.telefono.full}</td></tr>
    <tr><td style="padding: 4px 8px; color: #666;">LinkedIn</td><td style="padding: 4px 8px;">linkedin.com/in/${personal.linkedin}</td></tr>
    ${personal.twitter ? `<tr><td style="padding: 4px 8px; color: #666;">Twitter</td><td style="padding: 4px 8px;">@${personal.twitter.replace(/^@/, "")}</td></tr>` : ""}
    <tr><td style="padding: 4px 8px; color: #666;">Rol</td><td style="padding: 4px 8px;">${personal.rol}</td></tr>
    <tr><td style="padding: 4px 8px; color: #666;">Título</td><td style="padding: 4px 8px;">${personal.titulo}</td></tr>
  </table>

  <h3 style="margin-bottom: 8px;">Empresa</h3>
  <table style="border-collapse: collapse; width: 100%; margin-bottom: 24px;">
    <tr><td style="padding: 4px 8px; color: #666;">Web</td><td style="padding: 4px 8px;">${empresa.web}</td></tr>
    <tr><td style="padding: 4px 8px; color: #666;">Capital levantado</td><td style="padding: 4px 8px;">${empresa.capitalLevantado}</td></tr>
    <tr><td style="padding: 4px 8px; color: #666;">Ingresos</td><td style="padding: 4px 8px;">${empresa.rangoIngresos}</td></tr>
    <tr><td style="padding: 4px 8px; color: #666;">Inversores</td><td style="padding: 4px 8px;">${empresa.inversoresWeb.join(", ")}</td></tr>
  </table>

  <h3 style="margin-bottom: 8px;">Otros</h3>
  <table style="border-collapse: collapse; width: 100%; margin-bottom: 24px;">
    <tr><td style="padding: 4px 8px; color: #666;">Referido por</td><td style="padding: 4px 8px;">${otros.referidoPor || "—"}</td></tr>
    <tr><td style="padding: 4px 8px; color: #666;">Descubrimiento</td><td style="padding: 4px 8px;">${otros.descubrimiento || "—"}</td></tr>
  </table>

  <p style="margin-top: 32px;">
    <a href="https://signal.goexponential.org" style="color: #2563eb;">Revisar en Signal &rarr;</a>
  </p>
</div>
  `.trim();

  await resend.emails.send({
    from: "hello@goexponential.org",
    to: "guli@goexponential.org",
    subject: `Nueva solicitud: ${personal.nombre} ${personal.apellidos} — ${empresa.web}`,
    html,
  });
}
