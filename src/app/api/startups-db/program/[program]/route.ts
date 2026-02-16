import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

type StartupRecord = {
  id: string | number;
  name: string;
  slug: string;
  website?: string | null;
  export_to_website?: boolean;
};

type FounderForumApplication = {
  id: string | number;
  company_website: string | null;
};

type ProgramRecord = {
  id: string | number;
  name: string;
};

function isMissingColumnError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const record = error as { code?: string; message?: string };
  return (
    record.code === "42703" ||
    record.message?.toLowerCase().includes("column") === true
  );
}

function normalizeDomain(raw: string) {
  const trimmed = raw.trim().toLowerCase().replace(/^https?:\/\//, "");
  return trimmed.replace(/\/.*$/, "");
}

function buildFaviconUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(domain)}&sz=128`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ program: string }> },
) {
  const { program } = await params;
  const programName = program.trim().toLowerCase();

  if (!programName) {
    return NextResponse.json(
      { error: "Program inválido." },
      { status: 400 },
    );
  }

  const { data: foundPrograms, error: programError } = await supabase
    .from("programs")
    .select("id, name")
    .ilike("name", `%${programName}%`)
    .limit(5);

  const foundProgram =
    (foundPrograms as ProgramRecord[] | null)?.find(
      (item) => item.name.trim().toLowerCase() === programName,
    ) ?? (foundPrograms as ProgramRecord[] | null)?.[0];

  if (programError) {
    console.error("[logos] programs error", programError);
  }

  if (foundProgram) {
    const { data: startupPrograms, error: membershipError } = await supabase
      .from("startup_programs")
      .select("startup_id")
      .eq("program_id", foundProgram.id);

    if (membershipError) {
      console.error("[logos] startup_programs error", membershipError);
    } else {
      const startupIds = (startupPrograms ?? []).map((item) => item.startup_id);

      if (startupIds.length) {
        const startupsQuery = supabase
          .from("startups")
          .select("*")
          .in("id", startupIds)
          .eq("export_to_website", true)
          .order("name", { ascending: true });

        let startupsResult = await startupsQuery;
        if (startupsResult.error && isMissingColumnError(startupsResult.error)) {
          startupsResult = await supabase
            .from("startups")
            .select("*")
            .in("id", startupIds)
            .order("name", { ascending: true });
        }

        if (startupsResult.error) {
          console.error("[logos] startups error", startupsResult.error);
        } else {
          const startups = (startupsResult.data ?? []) as StartupRecord[];
          const startupsWithLogos = await Promise.all(
            startups.map(async (startup) => {
              let logoUrl: string | null = null;
              let fallbackLogoUrl: string | null = null;

              const websiteDomain = startup.website
                ? normalizeDomain(startup.website)
                : "";
              if (websiteDomain) {
                fallbackLogoUrl = buildFaviconUrl(websiteDomain);
              }

              const { data: files, error: listError } = await supabase.storage
                .from("startup-logos")
                .list(startup.slug);

              if (!listError && files && files.length > 0) {
                const logoFile =
                  files.find((file) => file.name.startsWith("logo.")) ??
                  files.find((file) =>
                    /\.(png|jpg|jpeg|svg|webp)$/i.test(file.name),
                  );

                if (logoFile) {
                  const publicUrl = supabase.storage
                    .from("startup-logos")
                    .getPublicUrl(`${startup.slug}/${logoFile.name}`).data.publicUrl;
                  logoUrl = publicUrl;
                }
              }

              return {
                id: startup.id,
                name: startup.name,
                slug: startup.slug,
                logoUrl,
                fallbackLogoUrl,
              };
            }),
          );

          const withLogos = startupsWithLogos.filter(
            (item) => item.logoUrl || item.fallbackLogoUrl,
          );
          if (withLogos.length > 0) {
            return NextResponse.json(withLogos);
          }
        }
      }
    }
  }

  // Fallback for Ateneo DB shape: derive logos from founder forum application websites.
  const { data: applications, error: applicationsError } = await supabase
    .from("founder_forum_applications")
    .select("id, company_website")
    .not("company_website", "is", null)
    .limit(500);

  if (applicationsError) {
    console.error("[logos] founder_forum_applications error", applicationsError);
    return NextResponse.json([]);
  }

  const uniqueDomains = Array.from(
    new Set(
      ((applications ?? []) as FounderForumApplication[])
        .map((item) => (item.company_website ? normalizeDomain(item.company_website) : ""))
        .filter(Boolean),
    ),
  );

  const fallbackLogos = uniqueDomains.map((domain, index) => ({
    id: `${index + 1}`,
    name: domain,
    slug: domain.replace(/[^a-z0-9-]/g, "-"),
    logoUrl: `https://logo.clearbit.com/${domain}`,
    fallbackLogoUrl: buildFaviconUrl(domain),
  }));

  return NextResponse.json(fallbackLogos);
}
