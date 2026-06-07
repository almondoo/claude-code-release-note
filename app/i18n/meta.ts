// ---------------------------------------------------------------------------
// meta() 関数用のロケール解決ヘルパー。
// meta はコンポーネントではなくフックを使えないため、root loader が返した
// locale を matches 経由で取り出し、辞書ツリーを直接返す。
// 使い方: export const meta = ({ matches }) => { const d = dictFromMatches(matches); ... }
// ---------------------------------------------------------------------------

import { DEFAULT_LOCALE, isLocale } from "./config";
import { DICT, type Dictionary } from "./dict";

export const dictFromMatches = (
  matches: readonly ({ data?: unknown } | undefined)[],
): Dictionary => {
  const rootData = matches[0]?.data as { locale?: unknown } | undefined;
  const locale = isLocale(rootData?.locale) ? rootData.locale : DEFAULT_LOCALE;
  return DICT[locale];
};
