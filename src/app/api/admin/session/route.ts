import { NextResponse } from "next/server";

import { getAdminUserFromRequest } from "@/lib/admin-session";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function hasAdminUser() {
  const supabase = createServiceRoleSupabaseClient();
  const { count, error } = await supabase
    .from("admin_users")
    .select("id", { count: "exact", head: true });

  if (error) {
    throw new Error(`Unable to check admin users: ${error.message}`);
  }

  return Number(count ?? 0) > 0;
}

export async function GET(request: Request) {
  try {
    const [user, exists] = await Promise.all([
      getAdminUserFromRequest(request),
      hasAdminUser(),
    ]);

    return NextResponse.json({
      authenticated: Boolean(user),
      requiresSetup: !exists,
      user,
    });
  } catch (error) {
    console.error("Unable to load admin session", error);
    return NextResponse.json(
      { error: "Não foi possível carregar a sessão." },
      { status: 500 },
    );
  }
}
