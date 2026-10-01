/** Central, typed access to environment variables. Server-side only. */
export const env = {
  isProd: process.env.NODE_ENV === "production",
  waDriver: process.env.WA_DRIVER ?? "simulated",
  defaultCountryCode: process.env.DEFAULT_COUNTRY_CODE ?? "62",
  timezone: process.env.APP_TIMEZONE ?? "Asia/Jakarta",
  sessionDays: Number(process.env.SESSION_DAYS ?? 7),
  seedAdminEmail: process.env.SEED_ADMIN_EMAIL ?? "admin@wame.local",
  seedAdminPassword: process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!",
  /** When no mail transport is configured, the reset link is returned in the API response. Set to "false" in production. */
  exposeResetLink: process.env.EXPOSE_RESET_LINK !== "false",
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    baseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  },
};
