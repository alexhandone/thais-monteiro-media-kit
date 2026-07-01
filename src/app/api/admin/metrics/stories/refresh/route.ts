import { NextResponse } from "next/server";

import { getAdminUserFromRequest } from "@/lib/admin-session";
import { refreshInstagramStoriesSnapshot } from "@/lib/instagram/stories";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getAdminUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    return NextResponse.json(await refreshInstagramStoriesSnapshot());
  } catch (error) {
    console.error("Unable to refresh Instagram stories from admin", error);
    return NextResponse.json(
      { error: "Não foi possível coletar os stories." },
      { status: 500 },
    );
  }
}
