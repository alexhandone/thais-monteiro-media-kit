import { NextResponse } from "next/server";

import { getServerEnv } from "@/lib/env";
import { refreshInstagramSnapshot } from "@/lib/instagram/refresh";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const env = getServerEnv();
  const expectedAuthorization = `Bearer ${env.METRICS_REFRESH_SECRET}`;

  if (request.headers.get("authorization") !== expectedAuthorization) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const snapshot = await refreshInstagramSnapshot();

    return NextResponse.json({
      periodStart: snapshot.period_start,
      periodEnd: snapshot.period_end,
      collectedAt: snapshot.collected_at,
      topContentCount: snapshot.top_content.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to refresh Instagram metrics." },
      { status: 500 },
    );
  }
}

