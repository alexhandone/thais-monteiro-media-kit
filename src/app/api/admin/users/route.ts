import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getAdminUserFromRequest,
  hashAdminPassword,
} from "@/lib/admin-session";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const createUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email(),
  password: z.string().min(8).max(160),
});

export async function GET(request: Request) {
  const user = await getAdminUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, name, email, role, active, created_at, last_login_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Não foi possível carregar os usuários." },
      { status: 500 },
    );
  }

  return NextResponse.json({ users: data ?? [] });
}

export async function POST(request: Request) {
  const user = await getAdminUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const parsedBody = createUserSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.from("admin_users").insert({
    name: parsedBody.data.name,
    email: parsedBody.data.email.toLowerCase(),
    password_hash: hashAdminPassword(parsedBody.data.password),
    role: "admin",
  });

  if (error) {
    const message = error.code === "23505"
      ? "Já existe um usuário com este e-mail."
      : "Não foi possível criar o usuário.";

    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
