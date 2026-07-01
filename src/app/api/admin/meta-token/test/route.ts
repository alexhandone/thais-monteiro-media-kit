import { NextResponse } from "next/server";
import { z } from "zod";

import { isAuthorizedAdminApiRequest } from "@/lib/admin-session";
import { getServerEnv } from "@/lib/env";
import { graphGet } from "@/lib/instagram/client";
import { updateMetaTokenTestStatus } from "@/lib/meta-token";

export const runtime = "nodejs";

const metaTokenTestSchema = z.object({
  token: z.string().trim().min(20).optional(),
});

export async function POST(request: Request) {
  if (!(await isAuthorizedAdminApiRequest(request))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown = {};

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsedBody = metaTokenTestSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({ error: "Token inválido." }, { status: 400 });
  }

  try {
    const env = getServerEnv();
    const profile = await graphGet<{
      id: string;
      username?: string;
      name?: string;
    }>(
      env.META_INSTAGRAM_ACCOUNT_ID,
      { fields: "id,username,name" },
      parsedBody.data.token ? { accessToken: parsedBody.data.token } : undefined,
    );

    await updateMetaTokenTestStatus(null);

    return NextResponse.json({
      ok: true,
      account: {
        id: profile.id,
        username: profile.username ?? null,
        name: profile.name ?? null,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido da Meta API.";

    try {
      await updateMetaTokenTestStatus(message);
    } catch (statusError) {
      console.error("Unable to update Meta token test status", statusError);
    }

    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
