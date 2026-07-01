import type { Metadata } from "next";

import { ContentRanking } from "@/components/metrics/ContentRanking";
import { InterestsEditorial } from "@/components/metrics/InterestsEditorial";
import { MetricsHeroInfographic } from "@/components/metrics/MetricsHeroInfographic";
import { MetricsCharts } from "@/components/metrics/MetricsCharts";
import { MetricsStatus } from "@/components/metrics/MetricsStatus";
import { StoriesInsights } from "@/components/metrics/StoriesInsights";
import { buildComparedMetricsViewModelSafe } from "@/components/metrics/metrics-data";
import { SiteHeader } from "@/components/public/SiteHeader";
import { Footer } from "@/components/shared/Footer";
import { WhatsAppFloatingButton } from "@/components/shared/WhatsAppFloatingButton";
import { hashAccessToken } from "@/lib/access-token";
import { getServerEnv } from "@/lib/env";
import { getRecentStorySnapshots } from "@/lib/instagram/stories";
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

async function getLatestSnapshot(
  supabase: ReturnType<typeof createServiceRoleSupabaseClient>,
) {
  const { data, error } = await supabase
    .from("instagram_metric_snapshots")
    .select(
      "period_start, period_end, collected_at, profile, overview_metrics, demographics, top_content, raw_api_payload",
    )
    .order("collected_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load Instagram metrics snapshot: ${error.message}`);
  }

  return data;
}

async function getPreviousSnapshot(
  supabase: ReturnType<typeof createServiceRoleSupabaseClient>,
  currentCollectedAt: string,
) {
  const { data, error } = await supabase
    .from("instagram_metric_snapshots")
    .select(
      "period_start, period_end, collected_at, profile, overview_metrics, demographics, top_content, raw_api_payload",
    )
    .lt("collected_at", currentCollectedAt)
    .order("collected_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load previous Instagram snapshot: ${error.message}`);
  }

  return data;
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

  const snapshot = await getLatestSnapshot(access.supabase);

  if (!snapshot) {
    return (
      <div className="min-h-screen bg-background font-sans text-foreground">
        <SiteHeader linkPrefix="/" />
        <MetricsStatus
          title="Métricas em preparação"
          body="O acesso está válido, mas ainda não há snapshot salvo. Atualize o snapshot pela rotina de refresh para liberar este painel."
          variant="preparing"
        />
        <Footer />
        <WhatsAppFloatingButton />
      </div>
    );
  }

  const stories = await getRecentStorySnapshots(30);
  const previousSnapshot = await getPreviousSnapshot(
    access.supabase,
    String(snapshot.collected_at),
  );
  const viewModel = buildComparedMetricsViewModelSafe(
    { ...snapshot, stories },
    previousSnapshot ? { ...previousSnapshot, stories: [] } : null,
  );

  if (!viewModel) {
    return (
      <div className="min-h-screen bg-background font-sans text-foreground">
        <SiteHeader linkPrefix="/" />
        <MetricsStatus
          title="Métricas indisponíveis"
          body="O snapshot encontrado está incompleto ou em um formato inesperado. Atualize a coleta para preparar um novo painel."
          variant="preparing"
        />
        <Footer />
        <WhatsAppFloatingButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <SiteHeader linkPrefix="/" />
      <main className="px-5 pb-10 pt-0 sm:px-8 sm:pt-0 lg:px-10 lg:pb-14">
        <div className="mx-auto grid w-full min-w-0 max-w-7xl gap-8 [&>*]:min-w-0">
          <MetricsHeroInfographic
            periodLabel={viewModel.periodLabel}
            collectedAtLabel={viewModel.collectedAtLabel}
            profileHandle={viewModel.profileHandle}
            cards={viewModel.overviewCards}
          />

          <header className="hidden min-w-0 gap-6 overflow-hidden rounded-lg bg-paper p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_0.42fr]">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                Instagram - últimos 30 dias
              </p>
              <h1 className="mt-4 break-words font-display text-4xl font-normal leading-none sm:text-7xl">
                Painel analítico {viewModel.profileHandle}
              </h1>
            </div>
            <dl className="grid min-w-0 content-end gap-4 text-sm leading-6 text-muted">
              <div>
                <dt className="font-semibold text-foreground">Período</dt>
                <dd>{viewModel.periodLabel}</dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Coleta</dt>
                <dd>{viewModel.collectedAtLabel}</dd>
              </div>
            </dl>
          </header>

          <MetricsCharts
            performanceSeries={viewModel.performanceSeries}
            gender={viewModel.demographics.gender}
            cities={viewModel.demographics.city}
            countries={viewModel.demographics.country}
            age={viewModel.demographics.age}
            viewFollowerType={viewModel.viewBreakdowns.followerType}
            viewMediaProductType={viewModel.viewBreakdowns.mediaProductType}
            interactionMediaProductType={
              viewModel.viewBreakdowns.interactionMediaProductType
            }
          />

          <StoriesInsights stories={viewModel.stories} />

          <ContentRanking items={viewModel.topContent} />
          <InterestsEditorial />

          <section className="rounded-lg border border-border-soft bg-paper p-5 text-sm leading-7 text-muted">
            Este link funciona por 7 dias. Depois disso, é necessário preencher o
            formulário novamente para receber um novo acesso.
          </section>
        </div>
      </main>
      <Footer />
      <WhatsAppFloatingButton />
    </div>
  );
}
