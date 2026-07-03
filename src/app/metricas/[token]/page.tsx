import type { Metadata } from "next";

import { MetricsDashboard } from "@/components/metrics/MetricsDashboard";
import { MetricsStatus } from "@/components/metrics/MetricsStatus";
import { SiteHeader } from "@/components/public/SiteHeader";
import { Footer } from "@/components/shared/Footer";
import { WhatsAppFloatingButton } from "@/components/shared/WhatsAppFloatingButton";
import { hashAccessToken } from "@/lib/access-token";
import { getServerEnv } from "@/lib/env";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

type MetricsPageProps = {
  params: Promise<{ token: string }>;
};

type AccessTokenRow = {
  id: string;
  expires_at: string;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Métricas | Thais Monteiro",
  robots: {
    index: false,
    follow: false,
  },
};

async function validateToken(rawToken: string) {
  const env = getServerEnv();
  const supabase = createServiceRoleSupabaseClient();
  const tokenHash = hashAccessToken(rawToken, env.TOKEN_HASH_SECRET);

  const { data, error } = await supabase
    .from("metric_access_tokens")
    .select("id, expires_at")
    .eq("token_hash", tokenHash)
    .maybeSingle<AccessTokenRow>();

  if (error) {
    throw new Error(`Unable to validate metrics token: ${error.message}`);
  }

  if (!data || new Date(data.expires_at).getTime() <= Date.now()) {
    return { valid: false, supabase } as const;
  }

  const { error: updateError } = await supabase
    .from("metric_access_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id);

  if (updateError) {
    console.error("Unable to update metrics token usage");
  }

  return { valid: true, supabase } as const;
}

export default async function MetricsPage({ params }: MetricsPageProps) {
  const { token } = await params;
  const access = await validateToken(token);

  if (!access.valid) {
    return (
      <div className="min-h-screen bg-background font-sans text-foreground">
        <SiteHeader linkPrefix="/" />
        <MetricsStatus
          title="Link de métricas expirado"
          body="Por segurança, este acesso dura 7 dias. Solicite um novo link pelo formulário para consultar os dados atualizados."
          ctaLabel="Solicitar novo acesso"
          ctaHref="/#metricas"
        />
        <Footer />
        <WhatsAppFloatingButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <SiteHeader linkPrefix="/" />
      <MetricsDashboard
        supabase={access.supabase}
        footerNote="Este link funciona por 7 dias. Depois disso, é necessário preencher o formulário novamente para receber um novo acesso."
      />
      <Footer />
      <WhatsAppFloatingButton />
    </div>
  );
}
