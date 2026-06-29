import { getServerEnv } from "../env";

type GraphParams = Record<string, string | number | boolean | undefined | null>;

type GraphErrorPayload = {
  error?: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
  };
};

export async function graphGet<T>(
  path: string,
  params: GraphParams = {},
): Promise<T> {
  const env = getServerEnv();
  const normalizedPath = path.replace(/^\/+/, "");
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  }

  searchParams.set("access_token", env.META_ACCESS_TOKEN);

  const response = await fetch(
    `https://graph.facebook.com/${env.META_GRAPH_API_VERSION}/${normalizedPath}?${searchParams.toString()}`,
    { cache: "no-store" },
  );
  const payload = (await response.json().catch(() => ({}))) as GraphErrorPayload;

  if (!response.ok) {
    const apiMessage = payload.error?.message ?? response.statusText;
    throw new Error(`Meta Graph API error: ${apiMessage}`);
  }

  if (payload.error) {
    throw new Error(
      `Meta Graph API error: ${payload.error.message ?? "Unknown API error"}`,
    );
  }

  return payload as T;
}
