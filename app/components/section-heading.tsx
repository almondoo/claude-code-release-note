export function SectionHeading({
  icon,
  label,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
}): React.JSX.Element {
  return (
    <div
      className="flex items-center gap-1.5 text-[12px] font-bold tracking-wide uppercase font-mono"
      style={{ color }}
    >
      {icon}
      {label}
    </div>
  );
}
