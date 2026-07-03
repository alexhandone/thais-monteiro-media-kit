import crypto from "node:crypto";

import { getServerEnv } from "./env";
import { createServiceRoleSupabaseClient } from "./supabase/server";

const tokenSecretKey = "meta_access_token";
const encryptionPrefix = "v1";
const cacheTtlMs = 60_000;

type MetaTokenRow = {
  encrypted_value: string;
  updated_at: string | null;
  tested_at: string | null;
  last_test_error: string | null;
};

type CachedMetaToken = {
  token: string;
  expiresAt: number;
};

type LongLivedTokenResponse = {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
  error?: {
    message?: string;
  };
};

type AccountsResponse = {
  data?: Array<{
    id?: string;
    name?: string;
    access_token?: string;
    instagram_business_account?: {
      id?: string;
      username?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

let cachedMetaToken: CachedMetaToken | null = null;

function deriveKey(secret: string) {
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptMetaAccessToken(token: string, secret: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", deriveKey(secret), iv);
  const encrypted = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    encryptionPrefix,
    iv.toString("base64url"),
    authTag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(":");
}

export function decryptMetaAccessToken(payload: string, secret: string) {
  const [version, iv, authTag, encrypted] = payload.split(":");

  if (version !== encryptionPrefix || !iv || !authTag || !encrypted) {
    throw new Error("Invalid encrypted Meta token payload.");
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    deriveKey(secret),
    Buffer.from(iv, "base64url"),
  );

  decipher.setAuthTag(Buffer.from(authTag, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function resolveMetaAccessToken(
  encryptedToken: string | null | undefined,
  envToken: string,
  encryptionSecret: string,
) {
  if (encryptedToken) {
    return decryptMetaAccessToken(encryptedToken, encryptionSecret);
  }

  return envToken;
}

export function maskMetaAccessToken(token: string | null | undefined) {
  if (!token) {
    return null;
  }

  if (token.length < 12) {
    return "*".repeat(token.length);
  }

  return `${token.slice(0, 4)}...${token.slice(-4)}`;
}

export function resetActiveMetaAccessTokenCache() {
  cachedMetaToken = null;
}

function requireMetaAppCredentials() {
  const env = getServerEnv();

  if (!env.META_APP_ID || !env.META_APP_SECRET) {
    throw new Error(
      "Configure META_APP_ID e META_APP_SECRET para converter o User Token automaticamente.",
    );
  }

  return {
    ...env,
    META_APP_ID: env.META_APP_ID,
    META_APP_SECRET: env.META_APP_SECRET,
  };
}

async function graphJson<T>(path: string, params: Record<string, string>) {
  const env = getServerEnv();
  const searchParams = new URLSearchParams(params);
  const response = await fetch(
    `https://graph.facebook.com/${env.META_GRAPH_API_VERSION}/${path}?${searchParams.toString()}`,
    { cache: "no-store" },
  );
  const payload = (await response.json().catch(() => ({}))) as T & {
    error?: { message?: string };
  };

  if (!response.ok || payload.error) {
    throw new Error(
      `Meta Graph API error: ${payload.error?.message ?? response.statusText}`,
    );
  }

  return payload;
}

async function exchangeForLongLivedUserToken(userToken: string) {
  const env = requireMetaAppCredentials();
  const payload = await graphJson<LongLivedTokenResponse>("oauth/access_token", {
    grant_type: "fb_exchange_token",
    client_id: env.META_APP_ID,
    client_secret: env.META_APP_SECRET,
    fb_exchange_token: userToken,
  });

  if (!payload.access_token) {
    throw new Error("A Meta não retornou um token de usuário de longa duração.");
  }

  return {
    token: payload.access_token,
    expiresIn: payload.expires_in ?? null,
  };
}

function selectConfiguredPageToken(
  accounts: AccountsResponse,
  pageId: string,
  instagramAccountId: string,
) {
  const pages = accounts.data ?? [];
  const page =
    pages.find((item) => item.id === pageId) ??
    pages.find((item) => item.instagram_business_account?.id === instagramAccountId);

  if (!page?.access_token) {
    throw new Error(
      "Não foi possível encontrar a Page Access Token da página/Instagram configurados.",
    );
  }

  return {
    pageId: page.id ?? null,
    pageName: page.name ?? null,
    instagramAccount: page.instagram_business_account ?? null,
    token: page.access_token,
  };
}

async function getPageAccessTokenFromUserToken(userToken: string) {
  const env = getServerEnv();
  const accounts = await graphJson<AccountsResponse>("me/accounts", {
    fields: "id,name,access_token,instagram_business_account{id,username}",
    access_token: userToken,
  });

  return selectConfiguredPageToken(
    accounts,
    env.META_PAGE_ID,
    env.META_INSTAGRAM_ACCOUNT_ID,
  );
}

async function validateInstagramPageToken(pageToken: string) {
  const env = getServerEnv();

  await graphJson(env.META_INSTAGRAM_ACCOUNT_ID, {
    fields: "id,username,name",
    access_token: pageToken,
  });
}

export async function getSavedMetaTokenStatus() {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("app_secrets")
    .select("encrypted_value, updated_at, tested_at, last_test_error")
    .eq("key", tokenSecretKey)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load Meta token status: ${error.message}`);
  }

  const row = data as MetaTokenRow | null;

  if (!row) {
    return {
      source: "env" as const,
      saved: false,
      maskedToken: null,
      updatedAt: null,
      testedAt: null,
      lastTestError: null,
    };
  }

  const env = getServerEnv();
  const token = decryptMetaAccessToken(row.encrypted_value, env.TOKEN_HASH_SECRET);

  return {
    source: "admin" as const,
    saved: true,
    maskedToken: maskMetaAccessToken(token),
    updatedAt: row.updated_at,
    testedAt: row.tested_at,
    lastTestError: row.last_test_error,
  };
}

export async function getActiveMetaAccessToken() {
  const now = Date.now();

  if (cachedMetaToken && cachedMetaToken.expiresAt > now) {
    return cachedMetaToken.token;
  }

  const env = getServerEnv();
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("app_secrets")
    .select("encrypted_value")
    .eq("key", tokenSecretKey)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load Meta access token: ${error.message}`);
  }

  const row = data as Pick<MetaTokenRow, "encrypted_value"> | null;
  const token = resolveMetaAccessToken(
    row?.encrypted_value,
    env.META_ACCESS_TOKEN,
    env.TOKEN_HASH_SECRET,
  );

  cachedMetaToken = {
    token,
    expiresAt: now + cacheTtlMs,
  };

  return token;
}

export async function saveMetaAccessToken(token: string) {
  const env = getServerEnv();
  const encryptedValue = encryptMetaAccessToken(token, env.TOKEN_HASH_SECRET);
  const now = new Date().toISOString();
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.from("app_secrets").upsert(
    {
      key: tokenSecretKey,
      encrypted_value: encryptedValue,
      updated_at: now,
      tested_at: null,
      last_test_error: null,
    },
    { onConflict: "key" },
  );

  if (error) {
    throw new Error(`Unable to save Meta access token: ${error.message}`);
  }

  resetActiveMetaAccessTokenCache();

  return {
    maskedToken: maskMetaAccessToken(token),
    updatedAt: now,
  };
}

export async function exchangeAndSaveMetaUserToken(userToken: string) {
  const longLivedUserToken = await exchangeForLongLivedUserToken(userToken);
  const pageToken = await getPageAccessTokenFromUserToken(longLivedUserToken.token);
  await validateInstagramPageToken(pageToken.token);
  const saved = await saveMetaAccessToken(pageToken.token);
  await updateMetaTokenTestStatus(null);

  return {
    ...saved,
    page: {
      id: pageToken.pageId,
      name: pageToken.pageName,
      instagramAccount: pageToken.instagramAccount,
    },
    userTokenExpiresIn: longLivedUserToken.expiresIn,
  };
}

export async function updateMetaTokenTestStatus(errorMessage: string | null) {
  const now = new Date().toISOString();
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase
    .from("app_secrets")
    .update({
      tested_at: now,
      last_test_error: errorMessage,
    })
    .eq("key", tokenSecretKey);

  if (error) {
    throw new Error(`Unable to update Meta token test status: ${error.message}`);
  }

  return {
    testedAt: now,
    lastTestError: errorMessage,
  };
}
