import { NextResponse } from "next/server";
import { z } from "zod";

import {
  createRawAccessToken,
  createTokenExpiration,
  hashAccessToken,
} from "@/lib/access-token";
import { getServerEnv } from "@/lib/env";
import { checkLeadRateLimit, getClientIp } from "@/lib/lead-rate-limit";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

const leadRequestSchema = z.object({
  companyOrName: z.string().trim().min(2).max(160),
  email: z.email(),
  phone: z.string().trim().min(8).max(40),
  website: z.string().optional(),
});

const leadRateLimitAttempts = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsedBody = leadRequestSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid lead payload." }, { status: 400 });
  }

  if (parsedBody.data.website?.trim()) {
    // Honeypot submissions are treated as neutral success so bots do not learn the field.
    return NextResponse.json({ redirectTo: null, expiresAt: null });
  }

  const rateLimit = checkLeadRateLimit(
    getClientIp(request.headers),
    leadRateLimitAttempts,
  );

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Unable to create lead access token." },
      { status: 429 },
    );
  }

  try {
    const env = getServerEnv();
    const supabase = createServiceRoleSupabaseClient();
    const { companyOrName, email, phone } = parsedBody.data;

    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        company_or_name: companyOrName,
        email,
        phone,
      })
      .select("id")
      .single();

    if (leadError || !lead) {
      throw leadError ?? new Error("Lead insert did not return an id.");
    }

    const rawToken = createRawAccessToken();
    const tokenHash = hashAccessToken(rawToken, env.TOKEN_HASH_SECRET);
    const expiresAt = createTokenExpiration();

    const { error: tokenError } = await supabase
      .from("metric_access_tokens")
      .insert({
        lead_id: lead.id,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
      });

    if (tokenError) {
      await supabase.from("leads").delete().eq("id", lead.id);
      throw tokenError;
    }

    return NextResponse.json({
      redirectTo: `/metricas/${rawToken}`,
      expiresAt: expiresAt.toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to create lead access token." },
      { status: 500 },
    );
  }
}
