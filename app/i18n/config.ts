// ---------------------------------------------------------------------------
// i18n 設定: ロケール定義と Cookie 連携ヘルパー。
// デフォルトは日本語。サポートは日本語・英語の2言語。
// ---------------------------------------------------------------------------

export const SUPPORTED_LOCALES = ["ja", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ja";
export const LOCALE_COOKIE_NAME = "locale";

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (SUPPORTED_LOCALES as readonly string[]).includes(value);

/** SSR: Request の Cookie ヘッダーからロケールを解決。無効/未設定ならデフォルト(ja)。 */
export const getLocaleFromRequest = (request: Request): Locale => {
  const cookie = request.headers.get("Cookie");
  if (cookie) {
    const match = cookie.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE_NAME}=([^;]+)`));
    if (match && isLocale(match[1])) return match[1];
  }
  return DEFAULT_LOCALE;
};

/** クライアント: document.cookie に書き込む文字列（1年保持）。 */
export const localeCookieString = (locale: Locale): string =>
  `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=31536000; samesite=lax`;
