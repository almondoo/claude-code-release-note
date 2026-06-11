// ---------------------------------------------------------------------------
// meta() 関数用のロケール解決ヘルパー。
// meta はコンポーネントではなくフックを使えないため、root loader が返した
// locale を matches 経由で取り出し、辞書ツリーを直接返す。
// 使い方: export const meta = ({ matches }) => { const d = dictFromMatches(matches); ... }
// ---------------------------------------------------------------------------

import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";
import { DICT, type Dictionary } from "./dict";

/** meta() の matches から root loader が解決した locale を取り出す（無効/未設定なら ja）。 */
export const localeFromMatches = (matches: readonly ({ data?: unknown } | undefined)[]): Locale => {
  const rootData = matches[0]?.data as { locale?: unknown } | undefined;
  return isLocale(rootData?.locale) ? rootData.locale : DEFAULT_LOCALE;
};

export const dictFromMatches = (matches: readonly ({ data?: unknown } | undefined)[]): Dictionary =>
  DICT[localeFromMatches(matches)];
