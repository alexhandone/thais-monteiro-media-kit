import { NextResponse } from "next/server";
import { z } from "zod";

import { hashAdminPassword } from "@/lib/admin-session";
import { getServerEnv } from "@/lib/env";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const setupSchema = z.object({
  setupSecret: z.string().min(24),
  name: z.string().trim().min(2).max(120),
  email: z.email(),
  password: z.string().min(8).max(160),
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const parsedBody = setupSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const env = getServerEnv();

  if (parsedBody.data.setupSecret !== env.METRICS_REFRESH_SECRET) {
    return NextResponse.json({ error: "Segredo inválido." }, { status: 401 });
  }

  const supabase = createServiceRoleSupabaseClient();
  const { count, error: countError } = await supabase
    .from("admin_users")
    .select("id", { count: "exact", head: true });

  if (countError) {
    return NextResponse.json(
      { error: "Não foi possível validar o primeiro acesso." },
      { status: 500 },
    );
  }

  if (Number(count ?? 0) > 0) {
    return NextResponse.json(
      { error: "O primeiro usuário administrativo já foi criado." },
      { status: 409 },
    );
  }

  const { error } = await supabase.from("admin_users").insert({
    name: parsedBody.data.name,
    email: parsedBody.data.email.toLowerCase(),
    password_hash: hashAdminPassword(parsedBody.data.password),
    role: "owner",
  });

  if (error) {
    return NextResponse.json(
      { error: "Não foi possível criar o usuário." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
