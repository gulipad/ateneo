"use server";

import { supabase } from "@/lib/supabase-server";

const NAME_PATTERN = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]{2,100}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9()\-\s]{6,16}$/;
const LINKEDIN_PATTERN =
  /^(?:[a-zA-Z0-9-]{3,100}|(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_%\-]{3,100}\/?)$/i;
const TWITTER_PATTERN = /^@?[A-Za-z0-9_]{1,15}$/;
const WEBSITE_PATTERN =
  /^(?:(?:https?:\/\/)?)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?::\d{2,5})?(?:[/?#][^\s]*)?$/i;

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
    twitter: string;
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

function normalizeLinkedIn(raw: string): string {
  const trimmed = raw.trim();
  const match = trimmed.match(
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_%\-]+)\/?/i,
  );
  if (match) return match[1].toLowerCase();
  return trimmed.toLowerCase();
}

function validate(
  payload: SubmissionPayload,
): { valid: true } | { valid: false; error: string } {
  const { personal, empresa } = payload;

  if (!NAME_PATTERN.test(personal.nombre.trim()))
    return { valid: false, error: "Nombre inválido." };
  if (!NAME_PATTERN.test(personal.apellidos.trim()))
    return { valid: false, error: "Apellidos inválidos." };
  if (!EMAIL_PATTERN.test(personal.email.trim()))
    return { valid: false, error: "Email inválido." };
  if (!PHONE_PATTERN.test(personal.telefono.localNumber.trim()))
    return { valid: false, error: "Teléfono inválido." };
  if (!LINKEDIN_PATTERN.test(personal.linkedin.trim()))
    return { valid: false, error: "LinkedIn inválido." };
  if (!TWITTER_PATTERN.test(personal.twitter.trim()))
    return { valid: false, error: "Twitter inválido." };
  if (!personal.rol.trim())
    return { valid: false, error: "Selecciona un rol." };
  if (!personal.titulo.trim())
    return { valid: false, error: "Título es obligatorio." };
  if (!WEBSITE_PATTERN.test(empresa.web.trim()))
    return { valid: false, error: "Web de empresa inválida." };
  if (!empresa.capitalLevantado.trim())
    return { valid: false, error: "Selecciona capital levantado." };
  if (!empresa.rangoIngresos.trim())
    return { valid: false, error: "Selecciona rango de ingresos." };
  if (!empresa.inversoresWeb.length)
    return { valid: false, error: "Añade al menos un inversor." };

  return { valid: true };
}

export async function submitApplication(
  payload: SubmissionPayload,
): Promise<{ success: true } | { success: false; error: string }> {
  const validation = validate(payload);
  if (!validation.valid) return { success: false, error: validation.error };

  const { personal, empresa, otros } = payload;

  // 1. Insert member
  const { data: member, error: memberError } = await supabase
    .from("founder_forum_members")
    .insert({
      first_name: personal.nombre.trim(),
      last_name: personal.apellidos.trim(),
      email: personal.email.trim().toLowerCase(),
      phone_country_code: personal.telefono.countryCode,
      phone_dial_code: personal.telefono.dialCode,
      phone_local_number: personal.telefono.localNumber.trim(),
      phone_full: personal.telefono.full.trim(),
      linkedin: normalizeLinkedIn(personal.linkedin),
      twitter: personal.twitter.trim(),
    })
    .select("id")
    .single();

  if (memberError) {
    console.error("[apply] member insert failed", memberError);
    return {
      success: false,
      error: "Error al registrar tus datos. Inténtalo de nuevo.",
    };
  }

  // 2. Insert application
  const { data: application, error: applicationError } = await supabase
    .from("founder_forum_applications")
    .insert({
      member_id: member.id,
      startup_id: null,
      role: personal.rol,
      title: personal.titulo.trim(),
      company_website: empresa.web.trim(),
      capital_raised: empresa.capitalLevantado,
      revenue_range: empresa.rangoIngresos,
      investor_websites: empresa.inversoresWeb,
      referred_by: otros.referidoPor || null,
      discovery_channel: otros.descubrimiento || null,
    })
    .select("id")
    .single();

  if (applicationError) {
    console.error("[apply] application insert failed", applicationError);
    // Cleanup orphaned member
    await supabase.from("founder_forum_members").delete().eq("id", member.id);
    return {
      success: false,
      error: "Error al enviar la solicitud. Inténtalo de nuevo.",
    };
  }

  // 3. Insert inbox event
  const { error: inboxError } = await supabase.from("inbox_events").insert({
    event_type: "founder_forum_application",
    candidate_id: null,
    startup_id: null,
    founder_forum_application_id: application.id,
  });

  if (inboxError) {
    console.error("[apply] inbox event insert failed", inboxError);
    // Cleanup application and member
    await supabase
      .from("founder_forum_applications")
      .delete()
      .eq("id", application.id);
    await supabase.from("founder_forum_members").delete().eq("id", member.id);
    return {
      success: false,
      error: "Error al procesar la solicitud. Inténtalo de nuevo.",
    };
  }

  return { success: true };
}
