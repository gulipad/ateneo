"use server";

import { supabase } from "@/lib/supabase-server";
import { notifyApplication } from "@/lib/notify-application";

const NAME_PATTERN = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]{2,100}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9()\-\s]{6,16}$/;
const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;
const DIAL_CODE_PATTERN = /^\+\d{1,4}$/;
const LINKEDIN_PATTERN =
  /^(?:[a-zA-Z0-9-]{3,100}|(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_%\-]{3,100}\/?)$/i;
const TWITTER_PATTERN = /^@?[A-Za-z0-9_]{1,15}$/;
const WEBSITE_PATTERN =
  /^(?:(?:https?:\/\/)?)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?::\d{2,5})?(?:[/?#][^\s]*)?$/i;
const OPTIONS_ROL = new Set(["Fundador", "Co-fundador", "Otro"]);
const OPTIONS_CAPITAL = new Set([
  "Bootstrapped",
  "<1M€",
  "1-5M€",
  "5-10M€",
  "10-50M€",
  "+50M€",
]);
const OPTIONS_INGRESOS = new Set([
  "Pre-revenue",
  "<1M€",
  "1-5M€",
  "5-10M€",
  "10-50M€",
  "+50M€",
]);
const OPTIONS_DESCUBRIMIENTO = new Set([
  "LinkedIn",
  "Boca a boca",
  "Búsqueda",
  "Twitter",
  "Reddit",
  "ChatGPT & otros",
]);
const MAX_INVESTORS = 50;

type SubmissionPayload = {
  personal: {
    nombre: string;
    apellidos: string;
    email: string;
    telefono: {
      countryCode: string;
      dialCode: string;
      localNumber: string;
      full: string;
    };
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

type ValidSubmissionPayload = {
  personal: {
    nombre: string;
    apellidos: string;
    email: string;
    telefono: {
      countryCode: string;
      dialCode: string;
      localNumber: string;
      full: string;
    };
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

function normalizeWebsite(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  return trimmed.replace(/^https?:\/\//i, "");
}

function normalizeLinkedIn(raw: string): string {
  const trimmed = raw.trim();
  const match = trimmed.match(
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_%\-]+)\/?/i,
  );
  if (match) return match[1].toLowerCase();
  return trimmed.toLowerCase();
}

function validateAndNormalize(
  payload: SubmissionPayload,
):
  | { valid: true; payload: ValidSubmissionPayload }
  | { valid: false; error: string } {
  if (!payload || typeof payload !== "object") {
    return { valid: false, error: "Payload inválido." };
  }

  const { personal, empresa } = payload;
  if (
    !personal ||
    !empresa ||
    !payload.otros ||
    typeof payload.otros !== "object"
  ) {
    return { valid: false, error: "Payload incompleto." };
  }

  if (!personal.telefono || typeof personal.telefono !== "object") {
    return { valid: false, error: "Teléfono inválido." };
  }
  if (!Array.isArray(empresa.inversoresWeb)) {
    return { valid: false, error: "Inversores inválidos." };
  }

  const asTrimmedString = (value: unknown) =>
    typeof value === "string" ? value.trim() : "";

  const nombre = asTrimmedString(personal.nombre);
  const apellidos = asTrimmedString(personal.apellidos);
  const email = asTrimmedString(personal.email).toLowerCase();
  const countryCode = asTrimmedString(personal.telefono.countryCode).toUpperCase();
  const dialCode = asTrimmedString(personal.telefono.dialCode);
  const localNumber = asTrimmedString(personal.telefono.localNumber);
  const linkedin = asTrimmedString(personal.linkedin);
  const twitter = asTrimmedString(personal.twitter);
  const rol = asTrimmedString(personal.rol);
  const titulo = asTrimmedString(personal.titulo);
  const web = asTrimmedString(empresa.web).toLowerCase();
  const capitalLevantado = asTrimmedString(empresa.capitalLevantado);
  const rangoIngresos = asTrimmedString(empresa.rangoIngresos);
  const referidoPor = asTrimmedString(payload.otros.referidoPor) || null;
  const descubrimiento = asTrimmedString(payload.otros.descubrimiento) || null;

  const normalizedInvestors = Array.from(
    new Set(
      empresa.inversoresWeb
        .map((website) => normalizeWebsite(asTrimmedString(website)))
        .filter((website) => website.length > 0),
    ),
  );

  if (!NAME_PATTERN.test(nombre))
    return { valid: false, error: "Nombre inválido." };
  if (!NAME_PATTERN.test(apellidos))
    return { valid: false, error: "Apellidos inválidos." };
  if (!EMAIL_PATTERN.test(email))
    return { valid: false, error: "Email inválido." };
  if (!COUNTRY_CODE_PATTERN.test(countryCode))
    return { valid: false, error: "Prefijo de país inválido." };
  if (!DIAL_CODE_PATTERN.test(dialCode))
    return { valid: false, error: "Código de marcación inválido." };
  if (!PHONE_PATTERN.test(localNumber))
    return { valid: false, error: "Teléfono inválido." };
  if (!LINKEDIN_PATTERN.test(linkedin))
    return { valid: false, error: "LinkedIn inválido." };
  if (twitter && !TWITTER_PATTERN.test(twitter))
    return { valid: false, error: "Twitter inválido." };
  if (!OPTIONS_ROL.has(rol))
    return { valid: false, error: "Selecciona un rol." };
  if (!titulo)
    return { valid: false, error: "Título es obligatorio." };
  if (!WEBSITE_PATTERN.test(web))
    return { valid: false, error: "Web de empresa inválida." };
  if (!OPTIONS_CAPITAL.has(capitalLevantado))
    return { valid: false, error: "Selecciona capital levantado." };
  if (!OPTIONS_INGRESOS.has(rangoIngresos))
    return { valid: false, error: "Selecciona rango de ingresos." };
  if (!normalizedInvestors.length)
    return { valid: false, error: "Añade al menos un inversor." };
  if (normalizedInvestors.length > MAX_INVESTORS)
    return {
      valid: false,
      error: `Máximo ${MAX_INVESTORS} inversores permitidos.`,
    };
  if (!normalizedInvestors.every((website) => WEBSITE_PATTERN.test(website))) {
    return { valid: false, error: "Hay webs de inversores inválidas." };
  }
  if (descubrimiento && !OPTIONS_DESCUBRIMIENTO.has(descubrimiento)) {
    return { valid: false, error: "Canal de descubrimiento inválido." };
  }

  return {
    valid: true,
    payload: {
      personal: {
        nombre,
        apellidos,
        email,
        telefono: {
          countryCode,
          dialCode,
          localNumber,
          full: [dialCode, localNumber].join(" "),
        },
        linkedin: normalizeLinkedIn(linkedin),
        twitter: twitter || null,
        rol,
        titulo,
      },
      empresa: {
        web,
        capitalLevantado,
        rangoIngresos,
        inversoresWeb: normalizedInvestors,
      },
      otros: {
        referidoPor,
        descubrimiento,
      },
    },
  };
}

function isMissingOnConflictConstraint(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const record = error as { code?: string; message?: string };
  return (
    record.code === "42P10" ||
    record.message?.includes("no unique or exclusion constraint") === true
  );
}

type RecordId = string | number;

async function getOrCreateMember(
  personal: ValidSubmissionPayload["personal"],
): Promise<{ id: RecordId } | { error: string }> {
  const memberPayload = {
    first_name: personal.nombre,
    last_name: personal.apellidos,
    email: personal.email,
    phone_country_code: personal.telefono.countryCode,
    phone_dial_code: personal.telefono.dialCode,
    phone_local_number: personal.telefono.localNumber,
    phone_full: personal.telefono.full,
    linkedin: personal.linkedin,
    twitter: personal.twitter,
  };

  const upsertResult = await supabase
    .from("founder_forum_members")
    .upsert(memberPayload, { onConflict: "email" })
    .select("id")
    .maybeSingle();

  if (!upsertResult.error && upsertResult.data?.id != null) {
    return { id: upsertResult.data.id };
  }
  if (upsertResult.error && !isMissingOnConflictConstraint(upsertResult.error)) {
    console.error("[apply] member upsert failed", upsertResult.error);
    return {
      error: "Error al registrar tus datos. Inténtalo de nuevo.",
    };
  }

  // Fallback path for DBs without unique(email) conflict target.
  const existingMemberResult = await supabase
    .from("founder_forum_members")
    .select("id")
    .eq("email", personal.email)
    .maybeSingle();

  if (existingMemberResult.error) {
    console.error("[apply] member lookup failed", existingMemberResult.error);
    return {
      error: "Error al registrar tus datos. Inténtalo de nuevo.",
    };
  }

  if (existingMemberResult.data?.id != null) {
    const { error: updateError } = await supabase
      .from("founder_forum_members")
      .update(memberPayload)
      .eq("id", existingMemberResult.data.id);

    if (updateError) {
      console.error("[apply] member update failed", updateError);
      return {
        error: "Error al registrar tus datos. Inténtalo de nuevo.",
      };
    }

    return { id: existingMemberResult.data.id };
  }

  const insertResult = await supabase
    .from("founder_forum_members")
    .insert(memberPayload)
    .select("id")
    .single();

  if (!insertResult.error && insertResult.data?.id != null) {
    return { id: insertResult.data.id };
  }

  // If a race happened, fetch again and reuse.
  const racedMemberResult = await supabase
    .from("founder_forum_members")
    .select("id")
    .eq("email", personal.email)
    .maybeSingle();

  if (!racedMemberResult.error && racedMemberResult.data?.id != null) {
    return { id: racedMemberResult.data.id };
  }

  console.error("[apply] member insert failed", insertResult.error);
  return {
    error: "Error al registrar tus datos. Inténtalo de nuevo.",
  };
}

async function getOrCreateApplication(
  payload: ValidSubmissionPayload,
  memberId: RecordId,
): Promise<{ id: RecordId } | { error: string }> {
  const { personal, empresa, otros } = payload;

  const applicationPayload = {
    member_id: memberId,
    startup_id: null,
    role: personal.rol,
    title: personal.titulo,
    company_website: empresa.web,
    capital_raised: empresa.capitalLevantado,
    revenue_range: empresa.rangoIngresos,
    investor_websites: empresa.inversoresWeb,
    referred_by: otros.referidoPor,
    discovery_channel: otros.descubrimiento,
  };

  const existingApplicationResult = await supabase
    .from("founder_forum_applications")
    .select("id")
    .eq("member_id", memberId)
    .eq("role", personal.rol)
    .eq("title", personal.titulo)
    .eq("company_website", empresa.web)
    .eq("capital_raised", empresa.capitalLevantado)
    .eq("revenue_range", empresa.rangoIngresos)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingApplicationResult.error) {
    console.error(
      "[apply] application lookup failed",
      existingApplicationResult.error,
    );
    return {
      error: "Error al enviar la solicitud. Inténtalo de nuevo.",
    };
  }

  if (existingApplicationResult.data?.id != null) {
    return { id: existingApplicationResult.data.id };
  }

  const applicationInsertResult = await supabase
    .from("founder_forum_applications")
    .insert(applicationPayload)
    .select("id")
    .single();

  if (!applicationInsertResult.error && applicationInsertResult.data?.id != null) {
    return { id: applicationInsertResult.data.id };
  }

  console.error("[apply] application insert failed", applicationInsertResult.error);
  return {
    error: "Error al enviar la solicitud. Inténtalo de nuevo.",
  };
}

async function ensureInboxEvent(applicationId: RecordId): Promise<{
  ok: true;
} | {
  ok: false;
  error: string;
}> {
  const existingEventResult = await supabase
    .from("inbox_events")
    .select("event_id")
    .eq("event_type", "founder_forum_application")
    .eq("founder_forum_application_id", applicationId)
    .limit(1)
    .maybeSingle();

  if (existingEventResult.error) {
    console.error("[apply] inbox event lookup failed", existingEventResult.error);
    return {
      ok: false,
      error: "Error al procesar la solicitud. Inténtalo de nuevo.",
    };
  }

  if (existingEventResult.data?.event_id != null) {
    return { ok: true };
  }

  const insertEventResult = await supabase.from("inbox_events").insert({
    event_type: "founder_forum_application",
    candidate_id: null,
    startup_id: null,
    founder_forum_application_id: applicationId,
  });

  if (!insertEventResult.error) {
    return { ok: true };
  }

  // Retry lookup in case a concurrent request inserted the same event.
  const raceEventResult = await supabase
    .from("inbox_events")
    .select("event_id")
    .eq("event_type", "founder_forum_application")
    .eq("founder_forum_application_id", applicationId)
    .limit(1)
    .maybeSingle();

  if (!raceEventResult.error && raceEventResult.data?.event_id != null) {
    return { ok: true };
  }

  console.error("[apply] inbox event insert failed", insertEventResult.error);
  return {
    ok: false,
    error: "Error al procesar la solicitud. Inténtalo de nuevo.",
  };
}

export async function submitApplication(
  payload: SubmissionPayload,
): Promise<{ success: true } | { success: false; error: string }> {
  const validation = validateAndNormalize(payload);
  if (!validation.valid) return { success: false, error: validation.error };

  const memberResult = await getOrCreateMember(validation.payload.personal);
  if ("error" in memberResult) {
    return { success: false, error: memberResult.error };
  }

  const applicationResult = await getOrCreateApplication(
    validation.payload,
    memberResult.id,
  );
  if ("error" in applicationResult) {
    return { success: false, error: applicationResult.error };
  }

  const inboxResult = await ensureInboxEvent(applicationResult.id);
  if (!inboxResult.ok) {
    return {
      success: false,
      error: inboxResult.error,
    };
  }

  notifyApplication(validation.payload).catch((err) => {
    console.error("[apply] notification email failed", err);
  });

  return { success: true };
}
