import { motion } from "motion/react";
import { useRef } from "react";

import { CloseIcon } from "~/components/icons";
import { useModalLock } from "~/hooks/useModalLock";

interface DetailModalShellProps {
  accentColor: string;
  onClose: () => void;
  reducedMotion: boolean | null;
  maxWidth?: string;
  icon: React.ReactNode;
  iconBackground?: string;
  headerContent: React.ReactNode;
  children: React.ReactNode;
  overlayClassName?: string;
  bodyClassName?: string;
}

export function DetailModalShell({
  accentColor,
  onClose,
  reducedMotion,
  maxWidth = "640px",
  icon,
  iconBackground,
  headerContent,
  children,
  overlayClassName = "fixed inset-0 z-[1000] bg-black/60 backdrop-blur-[4px] flex items-center justify-center p-6",
  bodyClassName = "p-6 overflow-y-auto flex-1 flex flex-col gap-5",
}: DetailModalShellProps): React.JSX.Element {
  const overlayRef = useRef<HTMLDivElement>(null);
  useModalLock(onClose);

  return (
    <motion.div
      ref={overlayRef}
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reducedMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className={overlayClassName}
    >
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reducedMotion ? undefined : { opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="bg-surface rounded-2xl w-full overflow-hidden flex flex-col"
        style={{
          maxWidth,
          maxHeight: "85vh",
          border: `1px solid ${accentColor}30`,
          boxShadow: `0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px ${accentColor}15`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-start gap-3.5 relative border-b border-slate-700 shrink-0"
          style={{
            padding: "20px 24px",
            background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}40)` }}
          />
          <div
            className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
            style={{
              background: iconBackground ?? accentColor + "18",
              color: accentColor,
            }}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">{headerContent}</div>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="close-btn bg-transparent border-none text-slate-500 cursor-pointer p-1 rounded-md flex items-center justify-center transition-colors shrink-0"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className={bodyClassName}>{children}</div>
      </motion.div>
    </motion.div>
  );
}
