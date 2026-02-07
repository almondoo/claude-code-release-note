import { motion } from "motion/react";
import { EmptyIcon } from "~/components/icons";

interface EmptyStateProps {
  message: string;
  reducedMotion: boolean | null;
}

export function EmptyState({ message, reducedMotion }: EmptyStateProps): React.JSX.Element {
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="text-center bg-surface rounded-xl border border-slate-700 py-16 px-6"
    >
      <div className="mb-4">
        <EmptyIcon />
      </div>
      <p className="text-slate-500 text-sm m-0">{message}</p>
    </motion.div>
  );
}
