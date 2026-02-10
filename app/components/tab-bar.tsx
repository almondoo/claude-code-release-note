import { useRef } from "react";
import { motion } from "motion/react";

export interface TabItem {
  id: string;
  label: string;
  color: string;
}

interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  renderIcon?: (tab: TabItem, isActive: boolean) => React.ReactNode;
  reducedMotion: boolean | null;
}

export function TabBar({
  tabs,
  activeTab,
  onTabChange,
  renderIcon,
  reducedMotion,
}: TabBarProps): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      ref={ref}
      className="flex gap-1 mb-5 overflow-x-auto pb-1 scrollbar-none"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const icon = renderIcon?.(tab, isActive);
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`shrink-0 rounded-[10px] text-[14px] font-sans cursor-pointer transition-all whitespace-nowrap flex items-center gap-1.5 px-4 py-2.5 ${
              isActive ? "font-semibold" : "font-medium tab-btn-inactive"
            }`}
            style={{
              border: isActive ? `1px solid ${tab.color}40` : "1px solid transparent",
              background: isActive ? tab.color + "18" : "transparent",
              color: isActive ? tab.color : "#64748B",
            }}
          >
            {icon}
            {tab.label}
          </button>
        );
      })}
    </motion.div>
  );
}
