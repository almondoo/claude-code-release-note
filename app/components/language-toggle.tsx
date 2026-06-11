import { useLocale } from "~/i18n/context";
import { useT } from "~/i18n/useT";

export const LanguageToggle = ({ className }: { className?: string }): React.JSX.Element => {
  const t = useT();
  const { locale, setLocale } = useLocale();

  return (
    <div
      className={`flex items-center gap-1 ${className ?? ""}`}
      aria-label={t.nav.languageSwitchLabel}
    >
      <button
        onClick={() => setLocale("ja")}
        className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all border cursor-pointer ${
          locale === "ja"
            ? "bg-slate-600/50 text-slate-100 border-slate-500"
            : "bg-transparent text-slate-500 border-transparent hover:text-slate-300 hover:border-slate-600"
        }`}
      >
        {t.nav.languageJa}
      </button>
      <button
        onClick={() => setLocale("en")}
        className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all border cursor-pointer ${
          locale === "en"
            ? "bg-slate-600/50 text-slate-100 border-slate-500"
            : "bg-transparent text-slate-500 border-transparent hover:text-slate-300 hover:border-slate-600"
        }`}
      >
        {t.nav.languageEn}
      </button>
    </div>
  );
};
