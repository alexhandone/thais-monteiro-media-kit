import crypto from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getServerEnv } from "@/lib/env";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const pageViewSchema = z.object({
  path: z.string().trim().min(1).max(300),
  referrer: z.string().trim().max(500).optional().nullable(),
});

function hashValue(value: string | null) {
  if (!value) {
    return null;
  }

  return crypto
    .createHash("sha256")
    .update(`${getServerEnv().TOKEN_HASH_SECRET}:${value}`)
    .digest("hex");
}

function getClientIp(headers: Headers) {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    null
  );
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const parsedBody = pageViewSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({ ok: true });
  }

  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.from("site_page_views").insert({
    path: parsedBody.data.path,
    referrer: parsedBody.data.referrer || null,
    ip_hash: hashValue(getClientIp(request.headers)),
    user_agent_hash: hashValue(request.headers.get("user-agent")),
  });

  if (error) {
    console.error("Unable to record page view", error);
  }

  return NextResponse.json({ ok: true });
}
