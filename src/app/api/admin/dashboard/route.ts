import { NextResponse } from "next/server";

import { getAdminUserFromRequest } from "@/lib/admin-session";
import { getSavedMetaTokenStatus } from "@/lib/meta-token";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "UTC",
});

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function buildDailySeries(
  leadDates: string[],
  viewDates: string[],
  days = 14,
) {
  const today = startOfUtcDay(new Date());
  const leadCounts = new Map<string, number>();
  const viewCounts = new Map<string, number>();

  for (const createdAt of leadDates) {
    const key = isoDate(new Date(createdAt));
    leadCounts.set(key, (leadCounts.get(key) ?? 0) + 1);
  }

  for (const createdAt of viewDates) {
    const key = isoDate(new Date(createdAt));
    viewCounts.set(key, (viewCounts.get(key) ?? 0) + 1);
  }

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - (days - index - 1));
    const key = isoDate(date);

    return {
      date: key,
      label: dateFormatter.format(date),
      leads: leadCounts.get(key) ?? 0,
      views: viewCounts.get(key) ?? 0,
    };
  });
}

async function countRows(
  table: "leads" | "site_page_views",
  since?: string,
) {
  const supabase = createServiceRoleSupabaseClient();
  let query = supabase.from(table).select("id", { count: "exact", head: true });

  if (since) {
    query = query.gte("created_at", since);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(`Unable to count ${table}: ${error.message}`);
  }

  return Number(count ?? 0);
}

export async function GET(request: Request) {
  const user = await getAdminUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const supabase = createServiceRoleSupabaseClient();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setUTCDate(fourteenDaysAgo.getUTCDate() - 13);

    const [
      totalViews,
      recentViews,
      totalLeads,
      recentLeads,
      latestLeads,
      dailyLeads,
      dailyViews,
      latestSnapshot,
      metaToken,
    ] = await Promise.all([
      countRows("site_page_views"),
      countRows("site_page_views", sevenDaysAgo.toISOString()),
      countRows("leads"),
      countRows("leads", sevenDaysAgo.toISOString()),
      supabase
        .from("leads")
        .select("id, company_or_name, email, phone, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("leads")
        .select("created_at")
        .gte("created_at", fourteenDaysAgo.toISOString()),
      supabase
        .from("site_page_views")
        .select("created_at")
        .gte("created_at", fourteenDaysAgo.toISOString()),
      supabase
        .from("instagram_metric_snapshots")
        .select("period_start, period_end, collected_at")
        .order("collected_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      getSavedMetaTokenStatus(),
    ]);

    if (latestLeads.error) {
      throw new Error(latestLeads.error.message);
    }
    if (dailyLeads.error) {
      throw new Error(dailyLeads.error.message);
    }
    if (dailyViews.error) {
      throw new Error(dailyViews.error.message);
    }
    if (latestSnapshot.error) {
      throw new Error(latestSnapshot.error.message);
    }

    return NextResponse.json({
      cards: {
        totalViews,
        recentViews,
        totalLeads,
        recentLeads,
      },
      daily: buildDailySeries(
        (dailyLeads.data ?? []).map((item) => item.created_at),
        (dailyViews.data ?? []).map((item) => item.created_at),
      ),
      latestLeads: latestLeads.data ?? [],
      latestSnapshot: latestSnapshot.data ?? null,
      metaToken,
    });
  } catch (error) {
    console.error("Unable to load admin dashboard", error);
    return NextResponse.json(
      { error: "Não foi possível carregar o dashboard." },
      { status: 500 },
    );
  }
}
