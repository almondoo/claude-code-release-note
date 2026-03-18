interface BaseCardProps {
  accentColor: string;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
  gradientOpacity?: string;
  children: React.ReactNode;
}

export const BaseCard = ({
  accentColor,
  onClick,
  className,
  style,
  gradientOpacity = "40",
  children,
}: BaseCardProps): React.JSX.Element => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`hover-card bg-surface rounded-xl border border-slate-700 flex flex-col cursor-pointer relative overflow-hidden ${className ?? ""}`}
      style={{ "--accent": accentColor, ...style } as React.CSSProperties}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl"
        style={{
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}${gradientOpacity})`,
        }}
      />
      {children}
    </div>
  );
};
