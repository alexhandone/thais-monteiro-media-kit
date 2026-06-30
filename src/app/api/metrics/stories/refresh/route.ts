import { NextResponse } from "next/server";

import { refreshInstagramStoriesSnapshot } from "@/lib/instagram/stories";
import { isAuthorizedMetricsRefresh } from "@/lib/metrics-auth";

export const runtime = "nodejs";

async function handleRefresh(request: Request) {
  if (!isAuthorizedMetricsRefresh(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const snapshot = await refreshInstagramStoriesSnapshot();

    return NextResponse.json(snapshot);
  } catch (error) {
    console.error("Unable to refresh Instagram story metrics", error);

    return NextResponse.json(
      { error: "Unable to refresh Instagram story metrics." },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  return handleRefresh(request);
}

export async function POST(request: Request) {
  return handleRefresh(request);
}
