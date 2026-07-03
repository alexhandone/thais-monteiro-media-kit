import { NextResponse } from "next/server";
import { z } from "zod";

import { isAuthorizedAdminApiRequest } from "@/lib/admin-session";
import { exchangeAndSaveMetaUserToken } from "@/lib/meta-token";

export const runtime = "nodejs";

const metaTokenExchangeSchema = z.object({
  userToken: z.string().trim().min(20),
});

export async function POST(request: Request) {
  if (!(await isAuthorizedAdminApiRequest(request))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsedBody = metaTokenExchangeSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({ error: "User Token inválido." }, { status: 400 });
  }

  try {
    return NextResponse.json(
      await exchangeAndSaveMetaUserToken(parsedBody.data.userToken),
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível converter e salvar o token da Meta.";

    console.error("Unable to exchange Meta user token", error);

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
