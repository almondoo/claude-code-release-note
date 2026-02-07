export function Footer({ children }: { children?: React.ReactNode }): React.JSX.Element {
  return (
    <div className="text-center p-6 mt-6 text-slate-500 text-xs border-t border-slate-700">
      {children || "Claude Code Release Notes Viewer"}
    </div>
  );
}
