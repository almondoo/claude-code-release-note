export const ModalSection = ({
  label,
  accentColor,
  children,
}: {
  label: string;
  accentColor: string;
  children: React.ReactNode;
}): React.JSX.Element => {
  return (
    <div className="flex flex-col gap-2.5">
      <div
        className="text-[12px] font-bold tracking-wide uppercase font-mono"
        style={{ color: accentColor }}
      >
        {label}
      </div>
      {children}
    </div>
  );
};
