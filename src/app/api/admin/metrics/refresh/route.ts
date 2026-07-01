import { NextResponse } from "next/server";

import { getAdminUserFromRequest } from "@/lib/admin-session";
import { refreshInstagramSnapshot } from "@/lib/instagram/refresh";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getAdminUserFromRequest(request);

  if (!user) {
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
  } catch (error) {
    console.error("Unable to refresh Instagram metrics from admin", error);
    return NextResponse.json(
      { error: "Não foi possível atualizar as métricas." },
      { status: 500 },
    );
  }
}
