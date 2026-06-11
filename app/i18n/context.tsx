// ---------------------------------------------------------------------------
// ロケール状態の Context。
// 初期値は root loader が解決したロケール（SSR と一致）。
// setLocale で即時切替（リロード無し）＋ Cookie 書込＋ <html lang> 更新を行う。
// ---------------------------------------------------------------------------

import { createContext, useCallback, useContext, useState } from "react";
import { useRevalidator } from "react-router";
import { DEFAULT_LOCALE, localeCookieString, type Locale } from "./config";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
});

interface LocaleProviderProps {
  locale: Locale;
  children: React.ReactNode;
}

export const LocaleProvider = ({ locale: initialLocale, children }: LocaleProviderProps) => {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const revalidator = useRevalidator();

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      if (typeof document !== "undefined") {
        document.cookie = localeCookieString(next);
        document.documentElement.lang = next;
      }
      // root loader を再実行し、meta(<title>/description 等)を新ロケールで再計算させる。
      // body の表示は context 経由で既に即時切替済みのため、リロードは発生しない。
      revalidator.revalidate();
    },
    [revalidator],
  );

  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>;
};

export const useLocale = (): LocaleContextValue => useContext(LocaleContext);
