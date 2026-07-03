import { z } from "zod";

const serverEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  META_GRAPH_API_VERSION: z.string().default("v25.0"),
  META_APP_ID: z.string().min(1).optional(),
  META_APP_SECRET: z.string().min(1).optional(),
  META_INSTAGRAM_ACCOUNT_ID: z.string().min(1),
  META_PAGE_ID: z.string().min(1),
  META_ACCESS_TOKEN: z.string().min(1),
  METRICS_REFRESH_SECRET: z.string().min(24),
  CRON_SECRET: z.string().min(24).optional(),
  TOKEN_HASH_SECRET: z.string().min(32),
  NEXT_PUBLIC_WHATSAPP_URL: z.url(),
  NEXT_PUBLIC_INSTAGRAM_URL: z.url(),
  NEXT_PUBLIC_CONTACT_EMAIL: z.email(),
});

export function getServerEnv() {
  return serverEnvSchema.parse(process.env);
}
