// ---------------------------------------------------------------------------
// useT: 現在ロケールの翻訳辞書オブジェクトを返すフック。
// 使い方: const t = useT(); t.nav.releaseNote / t.releaseNote.changes(5)
// ---------------------------------------------------------------------------

import { useLocale } from "./context";
import { DICT, type Dictionary } from "./dict";

export const useT = (): Dictionary => {
  const { locale } = useLocale();
  return DICT[locale];
};
