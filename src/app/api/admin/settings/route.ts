import { NextResponse } from "next/server";

import { getAdminUserFromRequest } from "@/lib/admin-session";
import { getAppSettings, saveAppSettings } from "@/lib/app-settings";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getAdminUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const settings = await getAppSettings(createServiceRoleSupabaseClient());

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Unable to load admin settings", error);
    return NextResponse.json(
      { error: "Não foi possível carregar as configurações." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const user = await getAdminUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    showStoriesMetrics?: unknown;
  } | null;

  if (!body || typeof body.showStoriesMetrics !== "boolean") {
    return NextResponse.json(
      { error: "Informe uma configuração válida." },
      { status: 400 },
    );
  }

  try {
    const supabase = createServiceRoleSupabaseClient();
    await saveAppSettings(supabase, {
      showStoriesMetrics: body.showStoriesMetrics,
    });
    const settings = await getAppSettings(supabase);

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Unable to save admin settings", error);
    return NextResponse.json(
      { error: "Não foi possível salvar as configurações." },
      { status: 500 },
    );
  }
}
