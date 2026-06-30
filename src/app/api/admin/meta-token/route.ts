import { NextResponse } from "next/server";
import { z } from "zod";

import { isAuthorizedAdminRequest } from "@/lib/admin-auth";
import {
  getSavedMetaTokenStatus,
  saveMetaAccessToken,
} from "@/lib/meta-token";

export const runtime = "nodejs";

const metaTokenSchema = z.object({
  token: z.string().trim().min(20),
});

export async function GET(request: Request) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    return NextResponse.json(await getSavedMetaTokenStatus());
  } catch (error) {
    console.error("Unable to load Meta token status", error);

    return NextResponse.json(
      { error: "Não foi possível carregar o status do token." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsedBody = metaTokenSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({ error: "Token inválido." }, { status: 400 });
  }

  try {
    return NextResponse.json(await saveMetaAccessToken(parsedBody.data.token));
  } catch (error) {
    console.error("Unable to save Meta access token", error);

    return NextResponse.json(
      { error: "Não foi possível salvar o token." },
      { status: 500 },
    );
  }
}
