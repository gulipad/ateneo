"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { submitApplication } from "./actions";
import { getCountryCallingCode, type CountryCode } from "libphonenumber-js/min";
import { CountryCodeSelect } from "@/components/apply/country-code-select";
import { InvestorsPillInput } from "@/components/apply/investors-pill-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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

const NAME_PATTERN = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]{2,100}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9()\-\s]{6,16}$/;
const LINKEDIN_PATTERN =
  /^(?:[a-zA-Z0-9-]{3,100}|(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_%\-]{3,100}\/?)$/i;
const TWITTER_PATTERN = /^@?[A-Za-z0-9_]{1,15}$/;
const WEBSITE_PATTERN =
  /^(?:(?:https?:\/\/)?)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?::\d{2,5})?(?:[/?#][^\s]*)?$/i;

type FormValues = {
  nombre: string;
  apellidos: string;
  email: string;
  telefonoPais: string;
  telefono: string;
  linkedin: string;
  twitter: string;
  rol: string;
  titulo: string;
  web: string;
  capital: string;
  ingresos: string;
  referido: string;
  descubrimiento: string;
};

const INITIAL_VALUES: FormValues = {
  nombre: "",
  apellidos: "",
  email: "",
  telefonoPais: "ES",
  telefono: "",
  linkedin: "",
  twitter: "",
  rol: "",
  titulo: "",
  web: "",
  capital: "",
  ingresos: "",
  referido: "",
  descubrimiento: "",
};

const DUMMY_VALUES: FormValues = {
  nombre: "Ana",
  apellidos: "García López",
  email: "ana.garcia@nova-startup.es",
  telefonoPais: "ES",
  telefono: "600 123 456",
  linkedin: "linkedin.com/in/anagarcia",
  twitter: "@anagarcia",
  rol: "Fundador",
  titulo: "CEO",
  web: "nova-startup.es",
  capital: "1-5M€",
  ingresos: "<1M€",
  referido: "María Pérez",
  descubrimiento: "LinkedIn",
};

const DUMMY_INVESTORS = ["sequoiacap.com", "khoslaventures.com", "indexventures.com"];

function getDialFromCountry(countryCode: string) {
  try {
    return `+${getCountryCallingCode(countryCode as CountryCode)}`;
  } catch {
    return "";
  }
}

function buildSubmissionPayload(values: FormValues, investors: string[]) {
  const telefonoPrefijo = getDialFromCountry(values.telefonoPais);
  const telefonoNumero = values.telefono.trim();
  const telefonoCompleto = [telefonoPrefijo, telefonoNumero].filter(Boolean).join(" ");

  return {
    personal: {
      nombre: values.nombre.trim(),
      apellidos: values.apellidos.trim(),
      email: values.email.trim(),
      telefono: {
        countryCode: values.telefonoPais,
        dialCode: telefonoPrefijo,
        localNumber: telefonoNumero,
        full: telefonoCompleto,
      },
      linkedin: values.linkedin.trim(),
      twitter: values.twitter.trim(),
      rol: values.rol,
      titulo: values.titulo.trim(),
    },
    empresa: {
      web: values.web.trim(),
      capitalLevantado: values.capital,
      rangoIngresos: values.ingresos,
      inversoresWeb: investors,
    },
    otros: {
      referidoPor: values.referido.trim() || null,
      descubrimiento: values.descubrimiento || null,
    },
  };
}

function FieldLabel({
  children,
  optional = false,
}: {
  children: string;
  optional?: boolean;
}) {
  return (
    <span className="text-[11px] uppercase tracking-[0.12em] text-white/70 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
      {children}
      {optional ? <span className="ml-2 text-white/40">(Opcional)</span> : null}
    </span>
  );
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebounced(value);
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [delayMs, value]);

  return debounced;
}

function textInputClass(isInvalid: boolean) {
  return cn(
    "h-11 border bg-transparent px-3 text-sm text-white placeholder:text-white/35 outline-none transition-colors [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]",
    isInvalid
      ? "border-red-400/70 focus:border-red-300"
      : "border-white/20 focus:border-white/50",
  );
}

function clampUnit(value: number) {
  return Math.max(-1, Math.min(1, value));
}

type PreviewPointerState = { x: number; y: number; active: boolean };

function ApplicationPreviewCard({
  applicantName,
  pointer,
  values,
}: {
  applicantName: string;
  pointer: PreviewPointerState;
  values: FormValues;
}) {
  const rotationX = pointer.active ? pointer.y * -10 : 0;
  const rotationY = pointer.active ? pointer.x * 13 : 0;
  const translateX = pointer.active ? pointer.x * 4 : 0;
  const translateY = pointer.active ? pointer.y * 3 : 0;
  const translateZ = pointer.active ? 14 : 0;

  const lightX = 52 + pointer.x * 28;
  const lightY = 35 + pointer.y * 24;
  const sweepX = 50 + pointer.x * 24;
  const sweepY = 48 + pointer.y * 18;

  const cardStyle: CSSProperties = {
    transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg) translate3d(${translateX}px, ${translateY}px, ${translateZ}px)`,
    transformStyle: "preserve-3d",
    transition: pointer.active
      ? "transform 80ms linear, box-shadow 120ms linear"
      : "transform 520ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 520ms cubic-bezier(0.22, 1, 0.36, 1)",
    boxShadow: pointer.active
      ? `${pointer.x * -16}px ${22 + pointer.y * 12}px 56px rgba(0, 0, 0, 0.62), 0 0 0 1px rgba(255,255,255,0.18), inset 0 0 0 1px rgba(255,255,255,0.12)`
      : "0 24px 52px rgba(0, 0, 0, 0.58), 0 0 0 1px rgba(255,255,255,0.12), inset 0 0 0 1px rgba(255,255,255,0.09)",
  };

  const highlightStyle: CSSProperties = {
    background: `radial-gradient(circle at ${lightX}% ${lightY}%, rgba(255,255,255,0.28), rgba(255,255,255,0.11) 18%, rgba(255,255,255,0.03) 38%, transparent 62%)`,
    opacity: pointer.active ? 0.9 : 0.55,
    transition: pointer.active ? "opacity 90ms linear" : "opacity 280ms ease",
  };

  const sweepStyle: CSSProperties = {
    background: `linear-gradient(120deg, transparent 24%, rgba(255,255,255,0.2) 46%, transparent 60%)`,
    transform: `translate(${(sweepX - 50) * 0.75}px, ${(sweepY - 50) * 0.4}px)`,
    opacity: pointer.active ? 0.35 : 0.2,
    transition: pointer.active
      ? "transform 90ms linear, opacity 90ms linear"
      : "transform 360ms ease, opacity 280ms ease",
    mixBlendMode: "screen",
  };

  const emailValue = values.email.trim() || "tu@email.com";
  const phoneValue =
    [getDialFromCountry(values.telefonoPais), values.telefono.trim()]
      .filter(Boolean)
      .join(" ") || "+34 600 000 000";
  const linkedinValue = values.linkedin.trim() || "linkedin.com/in/usuario";
  const roleValue = values.rol || "Rol";
  const titleValue = values.titulo.trim() || "Título";
  const websiteValue =
    values.web.trim().replace(/^https?:\/\//i, "") || "empresa.com";

  return (
    <div className="w-full max-w-[470px] [perspective:1400px]">
      <div
        className="relative aspect-[1.58/1] overflow-hidden rounded-[18px] border border-white/20 bg-[#050a12] px-6 py-5"
        style={cardStyle}
      >
        <div className="pointer-events-none absolute inset-0 opacity-65" style={highlightStyle} />
        <div className="pointer-events-none absolute inset-0 opacity-35" style={sweepStyle} />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_0%_0%,rgba(120,150,200,0.12),transparent_54%),radial-gradient(120%_100%_at_100%_100%,rgba(65,88,128,0.14),transparent_58%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-30 [background:repeating-linear-gradient(118deg,rgba(255,255,255,0.08)_0px,rgba(255,255,255,0.08)_1px,transparent_1px,transparent_5px)]" />
        <div className="pointer-events-none absolute inset-0 rounded-[18px] border border-white/14" />

        <div
          className="relative z-10 flex h-full flex-col"
          style={{ transform: "translateZ(32px)" }}
        >
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-white/45 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
            <span>ID APL-204</span>
            <span>{roleValue}</span>
          </div>

          <div className="mt-4">
            <p className="text-[clamp(1.35rem,2vw,1.95rem)] leading-[1.05] [font-family:Georgia,'Times_New_Roman',Times,serif]">
              {applicantName}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-white/56 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
              {titleValue}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-[0.14em] text-white/45 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
                Email
              </p>
              <p className="truncate text-[11px] text-white/82 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
                {emailValue}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-[0.14em] text-white/45 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
                Teléfono
              </p>
              <p className="truncate text-[11px] text-white/82 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
                {phoneValue}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-[0.14em] text-white/45 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
                LinkedIn
              </p>
              <p className="truncate text-[11px] text-white/82 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
                {linkedinValue}
              </p>
            </div>
          </div>

          <div className="mt-auto border-t border-white/20 pt-3">
            <p className="text-[9px] uppercase tracking-[0.14em] text-white/45 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
              Web
            </p>
            <p className="truncate text-[11px] text-white/86 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
              {websiteValue}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ApplyPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [investors, setInvestors] = useState<string[]>([]);
  const [previewPointer, setPreviewPointer] = useState<PreviewPointerState>({
    x: 0,
    y: 0,
    active: false,
  });
  const [investorsResetToken, setInvestorsResetToken] = useState<number | undefined>(
    undefined,
  );
  const debouncedValues = useDebouncedValue(values, 1000);

  const updateField = <K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const missingFields = useMemo(() => {
    const missing: string[] = [];
    if (!values.nombre.trim()) missing.push("Nombre");
    if (!values.apellidos.trim()) missing.push("Apellidos");
    if (!values.email.trim()) missing.push("Email");
    if (!values.telefono.trim()) missing.push("Teléfono");
    if (!values.linkedin.trim()) missing.push("LinkedIn URL");
    if (!values.rol.trim()) missing.push("Rol");
    if (!values.titulo.trim()) missing.push("Título");
    if (!values.web.trim()) missing.push("Web");
    if (!values.capital.trim()) missing.push("Capital levantado");
    if (!values.ingresos.trim()) missing.push("Rango de ingresos");
    if (!investors.length) missing.push("Inversores (Web)");
    return missing;
  }, [investors.length, values]);

  const invalidByField = useMemo(() => {
    const settled = <K extends keyof FormValues>(field: K) =>
      values[field] === debouncedValues[field] &&
      values[field].trim().length > 0;

    return {
      nombre: settled("nombre") && !NAME_PATTERN.test(values.nombre.trim()),
      apellidos:
        settled("apellidos") && !NAME_PATTERN.test(values.apellidos.trim()),
      email: settled("email") && !EMAIL_PATTERN.test(values.email.trim()),
      telefono:
        settled("telefono") && !PHONE_PATTERN.test(values.telefono.trim()),
      linkedin:
        settled("linkedin") && !LINKEDIN_PATTERN.test(values.linkedin.trim()),
      twitter:
        settled("twitter") && !TWITTER_PATTERN.test(values.twitter.trim()),
      web: settled("web") && !WEBSITE_PATTERN.test(values.web.trim()),
    };
  }, [debouncedValues, values]);

  const invalidFields = useMemo(() => {
    const invalid: string[] = [];
    if (invalidByField.nombre) invalid.push("Nombre");
    if (invalidByField.apellidos) invalid.push("Apellidos");
    if (invalidByField.email) invalid.push("Email");
    if (invalidByField.telefono) invalid.push("Teléfono");
    if (invalidByField.linkedin) invalid.push("LinkedIn URL");
    if (invalidByField.twitter) invalid.push("Twitter @");
    if (invalidByField.web) invalid.push("Web");
    return invalid;
  }, [invalidByField]);

  const submitDisabled = missingFields.length > 0 || invalidFields.length > 0;
  const submitTooltip = useMemo(() => {
    if (!submitDisabled) return "";

    const parts: string[] = [];
    if (missingFields.length) parts.push(`Faltan: ${missingFields.join(", ")}`);
    if (invalidFields.length)
      parts.push(`Formato inválido: ${invalidFields.join(", ")}`);
    return parts.join(" · ");
  }, [invalidFields, missingFields, submitDisabled]);

  const applicantName =
    `${values.nombre} ${values.apellidos}`.trim() || "Nombre Apellidos";
  const submissionPayload = useMemo(
    () => buildSubmissionPayload(values, investors),
    [investors, values],
  );

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const previous = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      htmlOverscroll: html.style.overscrollBehavior,
      bodyOverscroll: body.style.overscrollBehavior,
    };

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overscrollBehavior = "none";

    return () => {
      html.style.overflow = previous.htmlOverflow;
      body.style.overflow = previous.bodyOverflow;
      html.style.overscrollBehavior = previous.htmlOverscroll;
      body.style.overscrollBehavior = previous.bodyOverscroll;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // "fn+F10" generally reaches the browser as "F10".
      if (event.key !== "F10" || event.repeat) return;
      event.preventDefault();

      setValues(DUMMY_VALUES);
      setInvestors(DUMMY_INVESTORS);
      setInvestorsResetToken(Date.now());

      const payload = buildSubmissionPayload(DUMMY_VALUES, DUMMY_INVESTORS);
      console.log("[apply] Prefill dummy payload", payload);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const onSubmit = () => {
    if (submitDisabled || isPending) return;
    startTransition(() => {
      void (async () => {
        try {
          const result = await submitApplication(submissionPayload);
          if (result.success) {
            router.push("/success");
          } else {
            toast.error(result.error);
          }
        } catch (error) {
          console.error("[apply] unexpected submit failure", error);
          toast.error("No se pudo enviar. Inténtalo de nuevo.");
        }
      })();
    });
  };

  const onPreviewPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    setPreviewPointer({ x: clampUnit(x), y: clampUnit(y), active: true });
  };

  const onPreviewPointerLeave = () =>
    setPreviewPointer({ x: 0, y: 0, active: false });

  return (
    <main className="h-[100dvh] overflow-hidden bg-black text-white">
      <div className="mx-auto flex h-full w-full flex-col 2xl:max-w-[1440px] 2xl:border-x 2xl:border-white/20">
        <header className="h-16 border-y border-white/20">
          <nav className="flex h-full items-center px-6 md:px-10">
            <Image
              src="/ateneo.svg"
              alt="Ateneo"
              width={188}
              height={30}
              priority
              className="h-7 w-auto md:h-8"
            />
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
                        required
                        value={values.nombre}
                        onChange={(event) =>
                          updateField("nombre", event.target.value)
                        }
                        placeholder="Ej: Ana"
                        className={textInputClass(invalidByField.nombre)}
                      />
                    </label>
                    <label className="grid gap-2">
                      <FieldLabel>Apellidos</FieldLabel>
                      <input
                        type="text"
                        required
                        value={values.apellidos}
                        onChange={(event) =>
                          updateField("apellidos", event.target.value)
                        }
                        placeholder="Ej: García López"
                        className={textInputClass(invalidByField.apellidos)}
                      />
                    </label>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2">
                      <FieldLabel>Email</FieldLabel>
                      <input
                        type="email"
                        required
                        value={values.email}
                        onChange={(event) =>
                          updateField("email", event.target.value)
                        }
                        placeholder="tu@email.com"
                        className={textInputClass(invalidByField.email)}
                      />
                    </label>
                    <label className="grid gap-2">
                      <FieldLabel>Teléfono</FieldLabel>
                      <div className="flex gap-2">
                        <CountryCodeSelect
                          className="w-[116px] shrink-0"
                          value={values.telefonoPais}
                          onChange={(code) => updateField("telefonoPais", code)}
                        />
                        <input
                          type="tel"
                          required
                          value={values.telefono}
                          onChange={(event) =>
                            updateField("telefono", event.target.value)
                          }
                          placeholder="600 000 000"
                          className={cn(
                            textInputClass(invalidByField.telefono),
                            "flex-1",
                          )}
                        />
                      </div>
                    </label>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2">
                      <FieldLabel>LinkedIn URL</FieldLabel>
                      <input
                        type="text"
                        required
                        value={values.linkedin}
                        onChange={(event) =>
                          updateField("linkedin", event.target.value)
                        }
                        placeholder="linkedin.com/in/usuario o usuario"
                        className={textInputClass(invalidByField.linkedin)}
                      />
                    </label>
                    <label className="grid gap-2">
                      <FieldLabel optional>Twitter @</FieldLabel>
                      <input
                        type="text"
                        value={values.twitter}
                        onChange={(event) =>
                          updateField("twitter", event.target.value)
                        }
                        placeholder="@usuario"
                        className={textInputClass(invalidByField.twitter)}
                      />
                    </label>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2">
                      <FieldLabel>Rol</FieldLabel>
                      <Select
                        name="rol"
                        value={values.rol || undefined}
                        onValueChange={(value) => updateField("rol", value)}
                      >
                        <SelectTrigger
                          className={cn(
                            values.rol
                              ? ""
                              : "border-white/20 focus:border-white/50",
                          )}
                        >
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                        <SelectContent>
                          {OPTIONS_ROL.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>
                    <label className="grid gap-2">
                      <FieldLabel>Título</FieldLabel>
                      <input
                        type="text"
                        required
                        value={values.titulo}
                        onChange={(event) =>
                          updateField("titulo", event.target.value)
                        }
                        placeholder="Ej: CEO"
                        className={textInputClass(false)}
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
                        type="text"
                        required
                        value={values.web}
                        onChange={(event) =>
                          updateField("web", event.target.value)
                        }
                        placeholder="empresa.com"
                        className={textInputClass(invalidByField.web)}
                      />
                    </label>
                    <label className="grid gap-2">
                      <FieldLabel>Capital levantado</FieldLabel>
                      <Select
                        name="capital_levantado"
                        value={values.capital || undefined}
                        onValueChange={(value) => updateField("capital", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tramo" />
                        </SelectTrigger>
                        <SelectContent>
                          {OPTIONS_CAPITAL.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>
                    <label className="grid gap-2">
                      <FieldLabel>Rango de ingresos</FieldLabel>
                      <Select
                        name="rango_ingresos"
                        value={values.ingresos || undefined}
                        onValueChange={(value) =>
                          updateField("ingresos", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona rango" />
                        </SelectTrigger>
                        <SelectContent>
                          {OPTIONS_INGRESOS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>
                    <InvestorsPillInput
                      label="Inversores (Web)"
                      placeholder="inversor.com + coma, espacio o Enter"
                      onValuesChange={setInvestors}
                      presetValues={DUMMY_INVESTORS}
                      resetToken={investorsResetToken}
                    />
                  </div>
                </section>

                <section className="space-y-4 pb-8">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/65 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
                    Otros
                  </p>
                  <label className="grid gap-2">
                    <FieldLabel optional>
                      ¿Te ha referido alguien de la comunidad?
                    </FieldLabel>
                    <input
                      type="text"
                      value={values.referido}
                      onChange={(event) =>
                        updateField("referido", event.target.value)
                      }
                      placeholder="Nombre y apellidos"
                      className={textInputClass(false)}
                    />
                  </label>
                  <label className="grid gap-2">
                    <FieldLabel optional>
                      ¿Cómo has oído hablar de Ateneo?
                    </FieldLabel>
                    <Select
                      name="descubrimiento"
                      value={values.descubrimiento || undefined}
                      onValueChange={(value) =>
                        updateField("descubrimiento", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona canal" />
                      </SelectTrigger>
                      <SelectContent>
                        {OPTIONS_DESCUBRIMIENTO.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>
                </section>
              </form>
            </div>

            <div className="flex h-16 items-center justify-end border-t border-white/20 px-6 md:px-10">
              <div className="group relative">
                {submitDisabled ? (
                  <div className="pointer-events-none absolute bottom-full right-0 mb-2 w-[340px] border border-white/25 bg-black px-3 py-2 text-[11px] leading-relaxed text-white/80 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
                    {submitTooltip}
                  </div>
                ) : null}
                <button
                  type="button"
                  title={submitTooltip || undefined}
                  disabled={submitDisabled || isPending}
                  onClick={onSubmit}
                  className="inline-flex h-10 items-center border border-white px-5 text-xs uppercase tracking-[0.18em] [font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation_Mono',monospace] transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-white/35 disabled:text-white/40 disabled:hover:bg-transparent disabled:hover:text-white/40"
                >
                  {isPending ? "Enviando..." : "Enviar solicitud"}
                </button>
              </div>
            </div>
          </div>

          <aside
            className="hidden min-h-0 items-center justify-center border-l border-white/20 p-8 md:flex md:p-10"
            onPointerMove={onPreviewPointerMove}
            onPointerLeave={onPreviewPointerLeave}
          >
            <ApplicationPreviewCard
              applicantName={applicantName}
              pointer={previewPointer}
              values={values}
            />
          </aside>
        </section>
      </div>
    </main>
  );
}
