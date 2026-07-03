import type { ReactNode } from "react";

import { ContentRanking } from "@/components/metrics/ContentRanking";
import { InterestsEditorial } from "@/components/metrics/InterestsEditorial";
import { MetricsCharts } from "@/components/metrics/MetricsCharts";
import { buildComparedMetricsViewModelSafe } from "@/components/metrics/metrics-data";
import { MetricsHeroInfographic } from "@/components/metrics/MetricsHeroInfographic";
import { MetricsStatus } from "@/components/metrics/MetricsStatus";
import { StoriesInsights } from "@/components/metrics/StoriesInsights";
import { getAppSettings } from "@/lib/app-settings";
import { getRecentStorySnapshots } from "@/lib/instagram/stories";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

type MetricsDashboardProps = {
  supabase: ReturnType<typeof createServiceRoleSupabaseClient>;
  footerNote: ReactNode;
};

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

async function getPreviousPeriodSnapshot(
  supabase: ReturnType<typeof createServiceRoleSupabaseClient>,
  currentPeriodStart: string,
) {
  const { data, error } = await supabase
    .from("instagram_metric_snapshots")
    .select(
      "period_start, period_end, collected_at, profile, overview_metrics, demographics, top_content, raw_api_payload",
    )
    .lte("period_end", currentPeriodStart)
    .order("period_end", { ascending: false })
    .order("collected_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to load previous Instagram period snapshot: ${error.message}`,
    );
  }

  return data;
}

export async function MetricsDashboard({
  supabase,
  footerNote,
}: MetricsDashboardProps) {
  const snapshot = await getLatestSnapshot(supabase);

  if (!snapshot) {
    return (
      <MetricsStatus
        title="Métricas em preparação"
        body="O acesso está válido, mas ainda não há snapshot salvo. Atualize o snapshot pela rotina de refresh para liberar este painel."
        variant="preparing"
      />
    );
  }

  const [appSettings, previousSnapshot] = await Promise.all([
    getAppSettings(supabase),
    getPreviousPeriodSnapshot(supabase, String(snapshot.period_start)),
  ]);
  const stories = appSettings.showStoriesMetrics
    ? await getRecentStorySnapshots(30)
    : [];
  const viewModel = buildComparedMetricsViewModelSafe(
    { ...snapshot, stories },
    previousSnapshot ? { ...previousSnapshot, stories: [] } : null,
  );

  if (!viewModel) {
    return (
      <MetricsStatus
        title="Métricas indisponíveis"
        body="O snapshot encontrado está incompleto ou em um formato inesperado. Atualize a coleta para preparar um novo painel."
        variant="preparing"
      />
    );
  }

  return (
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

        {appSettings.showStoriesMetrics ? (
          <StoriesInsights stories={viewModel.stories} />
        ) : null}

        <ContentRanking items={viewModel.topContent} />
        <InterestsEditorial />

        <section className="rounded-lg border border-border-soft bg-paper p-5 text-sm leading-7 text-muted">
          {footerNote}
        </section>
      </div>
    </main>
  );
}
