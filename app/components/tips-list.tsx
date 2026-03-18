import { renderInlineMarkdown } from "~/components/paragraph-list";

export function TipsList({ tips }: { tips: string[] }): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-[12px] font-bold uppercase tracking-wider text-orange-300 font-mono m-0">
        ポイント
      </h3>
      <ul className="m-0 pl-0 list-none flex flex-col gap-1.5">
        {tips.map((tip, i) => (
          <li key={i} className="flex gap-2 items-start text-[14px] text-slate-300 leading-relaxed">
            <span className="text-slate-500 shrink-0 mt-[2px]">•</span>
            <span>{renderInlineMarkdown(tip)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
