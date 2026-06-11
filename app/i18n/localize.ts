// ---------------------------------------------------------------------------
// JSON データ（リリース本文・解説ページ等）のロケール別表示ヘルパー。
// データは日本語フィールドの隣に `*_en` フィールドを持つ（例: t / t_en）。
// 英語ロケールかつ en が存在すれば en を、無ければ日本語へフォールバックする。
// ---------------------------------------------------------------------------

import type { Locale } from "./config";
import { useLocale } from "./context";

const hasContent = (v: string | string[] | undefined): boolean =>
  Array.isArray(v) ? v.length > 0 : typeof v === "string" && v.length > 0;

/** ja / en からロケールに応じた値を返す（en 欠落時は ja フォールバック）。string と string[] の両対応。 */
export const pickLocale = <T extends string | string[]>(
  ja: T,
  en: T | undefined,
  locale: Locale,
): T => (locale === "en" && hasContent(en) ? (en as T) : ja);

/** コンポーネント用: 現在ロケールを内部で取得し、(ja, en) => 値 を返す。 */
export const useL = () => {
  const { locale } = useLocale();
  return <T extends string | string[]>(ja: T, en?: T): T => pickLocale(ja, en, locale);
};
