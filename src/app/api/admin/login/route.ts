import { NextResponse } from "next/server";
import { z } from "zod";

import {
  adminSessionCookieName,
  createAdminSessionExpiration,
  createAdminSessionToken,
  hashAdminSessionToken,
  verifyAdminPassword,
} from "@/lib/admin-session";
import { getServerEnv } from "@/lib/env";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  active: boolean;
};

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const parsedBody = loginSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, name, email, password_hash, role, active")
    .eq("email", parsedBody.data.email.toLowerCase())
    .maybeSingle<AdminUserRow>();

  if (error || !data || !data.active) {
    return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
  }

  if (!verifyAdminPassword(parsedBody.data.password, data.password_hash)) {
    return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
  }

  const env = getServerEnv();
  const rawToken = createAdminSessionToken();
  const expiresAt = createAdminSessionExpiration();
  const { error: sessionError } = await supabase.from("admin_sessions").insert({
    user_id: data.id,
    token_hash: hashAdminSessionToken(rawToken, env.TOKEN_HASH_SECRET),
    expires_at: expiresAt.toISOString(),
  });

  if (sessionError) {
    return NextResponse.json(
      { error: "Não foi possível criar a sessão." },
      { status: 500 },
    );
  }

  await supabase
    .from("admin_users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", data.id);

  const response = NextResponse.json({
    user: {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
    },
  });

  response.cookies.set(adminSessionCookieName, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return response;
}
