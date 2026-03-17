import { AnimatePresence, motion } from "motion/react";

interface ItemGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  reducedMotion: boolean | null;
  hasMounted?: boolean;
}

export function ItemGrid<T>({
  items,
  renderItem,
  keyExtractor,
  reducedMotion,
  hasMounted = false,
}: ItemGridProps<T>): React.JSX.Element {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3.5">
      <AnimatePresence mode="popLayout">
        {items.map((item, i) => (
          <motion.div
            key={keyExtractor(item)}
            layout={!reducedMotion}
            initial={
              reducedMotion
                ? false
                : hasMounted
                  ? { opacity: 0 }
                  : { opacity: 0, y: 15 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={
              reducedMotion
                ? undefined
                : {
                    opacity: 0,
                    scale: 0.96,
                    transition: { duration: 0.15 },
                  }
            }
            transition={{
              duration: 0.2,
              delay:
                reducedMotion || hasMounted
                  ? 0
                  : Math.min(i * 0.04, 0.4),
            }}
          >
            {renderItem(item, i)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
