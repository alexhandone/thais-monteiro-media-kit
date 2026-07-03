import type { SupabaseClient } from "@supabase/supabase-js";

export type AppSettings = {
  showStoriesMetrics: boolean;
};

export const defaultAppSettings: AppSettings = {
  showStoriesMetrics: true,
};

const appSettingsKey = "app_settings";

type AppSettingRow = {
  encrypted_value: string;
};

function parseSettings(value: string | null | undefined): AppSettings {
  if (!value) {
    return defaultAppSettings;
  }

  try {
    const parsed = JSON.parse(value) as Partial<AppSettings>;

    return {
      showStoriesMetrics:
        typeof parsed.showStoriesMetrics === "boolean"
          ? parsed.showStoriesMetrics
          : defaultAppSettings.showStoriesMetrics,
    };
  } catch {
    return defaultAppSettings;
  }
}

export async function getAppSettings(
  supabase: SupabaseClient,
): Promise<AppSettings> {
  const { data, error } = await supabase
    .from("app_secrets")
    .select("encrypted_value")
    .eq("key", appSettingsKey)
    .maybeSingle<AppSettingRow>();

  if (error) {
    throw new Error(`Unable to load app settings: ${error.message}`);
  }

  return parseSettings(data?.encrypted_value);
}

export async function saveAppSettings(
  supabase: SupabaseClient,
  settings: Partial<AppSettings>,
) {
  if (typeof settings.showStoriesMetrics !== "boolean") {
    return;
  }

  const nextSettings = {
    ...defaultAppSettings,
    showStoriesMetrics: settings.showStoriesMetrics,
  };

  const { error } = await supabase.from("app_secrets").upsert(
    {
      key: appSettingsKey,
      encrypted_value: JSON.stringify(nextSettings),
      updated_at: new Date().toISOString(),
      tested_at: null,
      last_test_error: null,
    },
    { onConflict: "key" },
  );

  if (error) {
    throw new Error(`Unable to save app settings: ${error.message}`);
  }
}
