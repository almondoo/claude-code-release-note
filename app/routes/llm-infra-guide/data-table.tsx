interface DataTableProps {
  caption?: string;
  headers: string[];
  rows: string[][];
  footnote?: string;
  accentColor?: string;
}

const CELL_FORMATS: Record<string, { color: string; prefix: string }> = {
  "対応": { color: "#10B981", prefix: "\u2713 " },
  "非対応": { color: "#64748B", prefix: "\u2717 " },
  "確認要": { color: "#F59E0B", prefix: "? " },
};

const stickyColumnStyle: React.CSSProperties = {
  position: "sticky",
  left: 0,
  zIndex: 1,
};

export function DataTable({ caption, headers, rows, footnote, accentColor }: DataTableProps): React.JSX.Element {
  const headerBg = accentColor
    ? `color-mix(in srgb, ${accentColor} 8%, #1E293B)`
    : "#1E293B";

  return (
    <div className="flex flex-col gap-1.5">
      {caption && (
        <span className="text-[13px] font-semibold text-slate-400 px-1">
          {caption}
        </span>
      )}
      <div className="survey-table-wrap rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full border-collapse text-[14px] min-w-[500px]">
            <thead>
              <tr style={{ background: headerBg }}>
                {headers.map((h, i) => (
                  <th
                    key={i}
                    className="text-left px-3 py-2.5 font-semibold text-slate-300 whitespace-nowrap border-b border-slate-700"
                    style={i === 0 ? { ...stickyColumnStyle, background: headerBg } : undefined}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="survey-table-row">
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="px-3 py-2 text-slate-400 border-b border-slate-700/50 whitespace-nowrap"
                      style={ci === 0 ? {
                        ...stickyColumnStyle,
                        background: "#0F172A",
                        fontWeight: 500,
                        color: "#CBD5E1",
                      } : undefined}
                    >
                      {formatCell(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {footnote && (
        <span className="text-[12px] text-slate-500 italic px-1 leading-relaxed">
          {footnote}
        </span>
      )}
    </div>
  );
}

function formatCell(cell: string): React.ReactNode {
  const fmt = CELL_FORMATS[cell];
  if (fmt) return <span style={{ color: fmt.color }}>{fmt.prefix}{cell}</span>;
  if (cell.includes("\u2605")) return <span style={{ color: "#F59E0B" }}>{cell}</span>;
  return cell;
}
