import { motion, useReducedMotion } from "motion/react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { GlossaryTerm, GlossaryCategory } from "./constants";

// ── Types ────────────────────────────────────────────────────────────────

interface GlossaryPanelProps {
  terms: GlossaryTerm[];
  categories: GlossaryCategory[];
  isOpen: boolean;
  onClose: () => void;
  activeTermId: string | null;
  onTermClick: (termId: string) => void;
}

type ScreenMode = "xl" | "lg" | "mobile";

// ── useScreenMode hook ───────────────────────────────────────────────────

function useScreenMode(): ScreenMode {
  const [mode, setMode] = useState<ScreenMode>("xl");

  useEffect(() => {
    function detect(): void {
      const w = window.innerWidth;
      if (w >= 1280) setMode("xl");
      else if (w >= 1024) setMode("lg");
      else setMode("mobile");
    }
    detect();
    window.addEventListener("resize", detect);
    return () => window.removeEventListener("resize", detect);
  }, []);

  return mode;
}

// ── Shared Backdrop ─────────────────────────────────────────────────────

function Backdrop({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }): React.JSX.Element {
  return (
    <div
      className="fixed inset-0 z-40 transition-opacity duration-300"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? "auto" : "none",
      }}
      onClick={onClick}
    />
  );
}

// ── Panel Content (shared) ───────────────────────────────────────────────

function PanelContent({
  terms,
  categories,
  activeTermId,
  onTermClick,
}: {
  terms: GlossaryTerm[];
  categories: GlossaryCategory[];
  activeTermId: string | null;
  onTermClick: (termId: string) => void;
}): React.JSX.Element {
  const [expandedTermId, setExpandedTermId] = useState<string | null>(null);
  const termRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Scroll to active term when activeTermId changes
  useEffect(() => {
    if (!activeTermId) return;
    setExpandedTermId(activeTermId);
    const el = termRefs.current.get(activeTermId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeTermId]);

  // Group terms by category
  const grouped = useMemo(() => {
    const map = new Map<string, GlossaryTerm[]>();
    for (const t of terms) {
      const list = map.get(t.category) || [];
      list.push(t);
      map.set(t.category, list);
    }
    return map;
  }, [terms]);

  const categoryMap = useMemo(() => {
    const m = new Map<string, GlossaryCategory>();
    for (const c of categories) m.set(c.id, c);
    return m;
  }, [categories]);

  const handleTermClick = useCallback(
    (termId: string) => {
      setExpandedTermId((prev) => (prev === termId ? null : termId));
      onTermClick(termId);
    },
    [onTermClick],
  );

  const setTermRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) termRefs.current.set(id, el);
    else termRefs.current.delete(id);
  }, []);

  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden">
      {/* Title */}
      <div className="px-1">
        <h3
          className="m-0 font-bold text-slate-200 text-[13px]"
        >
          用語集
        </h3>
        <span className="text-[11px] text-slate-500">
          {terms.length} 用語
        </span>
      </div>

      {/* Terms list */}
      <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col gap-4 pr-1">
        {Array.from(grouped.entries()).map(([catId, catTerms]) => {
          const cat = categoryMap.get(catId);
          return (
            <div key={catId} className="flex flex-col gap-1.5">
              {/* Category header */}
              <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 px-1 pb-1">
                {cat?.label || catId}
              </div>

              {/* Term cards */}
              {catTerms.map((term) => {
                const isActive = term.id === activeTermId;
                const isExpanded = term.id === expandedTermId;
                const termCat = categoryMap.get(term.category);

                return (
                  <div
                    key={term.id}
                    ref={(el) => setTermRef(term.id, el)}
                    onClick={() => handleTermClick(term.id)}
                    className={`rounded-lg px-3 py-2.5 cursor-pointer transition-all duration-200 ${
                      isActive
                        ? "border-l-2 border-blue-500 bg-blue-500/5"
                        : "border-l-2 border-transparent hover:bg-slate-800/50"
                    }`}
                    style={{
                      background: isActive
                        ? "rgba(59,130,246,0.05)"
                        : undefined,
                    }}
                  >
                    {/* Term header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-[13px] font-semibold text-slate-200 leading-tight">
                          {term.term}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {term.termEn}
                        </span>
                      </div>
                      {/* Category badge */}
                      {termCat && (
                        <span
                          className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                          style={{
                            backgroundColor: termCat.color + "18",
                            color: termCat.color,
                          }}
                        >
                          {termCat.label}
                        </span>
                      )}
                    </div>

                    {/* Short description (always visible) */}
                    <p className="text-[12px] text-slate-400 leading-relaxed m-0 mt-1.5">
                      {term.short}
                    </p>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-700/50 flex flex-col gap-2.5">
                        <p className="text-[12px] text-slate-400 leading-[1.7] m-0">
                          {term.description}
                        </p>

                        {/* Related terms */}
                        {term.relatedTerms && term.relatedTerms.length > 0 && (
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-600">
                              関連用語
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {term.relatedTerms.map((relId) => {
                                const relTerm = terms.find(
                                  (t) => t.id === relId,
                                );
                                if (!relTerm) return null;
                                return (
                                  <button
                                    key={relId}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTermClick(relId);
                                    }}
                                    className="rounded px-2 py-0.5 text-[11px] text-blue-400 bg-blue-500/10 border border-blue-500/20 cursor-pointer hover:bg-blue-500/20 transition-colors"
                                  >
                                    {relTerm.term}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── GlossaryPanel ────────────────────────────────────────────────────────

export function GlossaryPanel({
  terms,
  categories,
  isOpen,
  onClose,
  activeTermId,
  onTermClick,
}: GlossaryPanelProps): React.JSX.Element | null {
  const screenMode = useScreenMode();
  const reducedMotion = useReducedMotion();

  // ── xl: always-visible right column ──
  if (screenMode === "xl") {
    return (
      <motion.aside
        className="w-[240px] shrink-0"
        initial={reducedMotion ? false : { opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="sticky top-[80px] max-h-[calc(100vh-100px)] flex flex-col">
          <PanelContent
            terms={terms}
            categories={categories}
            activeTermId={activeTermId}
            onTermClick={onTermClick}
          />
        </div>
      </motion.aside>
    );
  }

  // ── lg: slide-in overlay from right ──
  if (screenMode === "lg") {
    return (
      <>
        <Backdrop isOpen={isOpen} onClick={onClose} />
        <div
          className="fixed top-0 right-0 bottom-0 z-50 w-[320px] bg-slate-900 border-l border-slate-700 flex flex-col transition-transform duration-300 ease-in-out"
          style={{
            transform: isOpen ? "translateX(0)" : "translateX(100%)",
          }}
        >
          {/* Close button */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <span className="text-[13px] font-semibold text-slate-300">
              用語集
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-transparent border border-slate-700 text-slate-400 cursor-pointer hover:bg-slate-800 hover:text-slate-300 transition-colors"
              aria-label="閉じる"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden px-4 py-3">
            <PanelContent
              terms={terms}
              categories={categories}
              activeTermId={activeTermId}
              onTermClick={onTermClick}
            />
          </div>
        </div>
      </>
    );
  }

  // ── mobile: bottom sheet ──
  return (
    <MobileBottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="px-4 py-3 flex-1 overflow-hidden">
        <PanelContent
          terms={terms}
          categories={categories}
          activeTermId={activeTermId}
          onTermClick={onTermClick}
        />
      </div>
    </MobileBottomSheet>
  );
}

// ── Mobile Bottom Sheet ──────────────────────────────────────────────────

function MobileBottomSheet({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const currentTranslateY = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    currentTranslateY.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragStartY.current === null || !sheetRef.current) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    // Only allow dragging downward
    if (delta > 0) {
      currentTranslateY.current = delta;
      sheetRef.current.style.transform = `translateY(${delta}px)`;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!sheetRef.current) return;
    // If dragged more than 80px down, close
    if (currentTranslateY.current > 80) {
      onClose();
    }
    sheetRef.current.style.transform = "";
    dragStartY.current = null;
    currentTranslateY.current = 0;
  }, [onClose]);

  return (
    <>
      <Backdrop isOpen={isOpen} onClick={onClose} />
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700 flex flex-col transition-transform duration-300 ease-in-out"
        style={{
          maxHeight: "60vh",
          borderRadius: "16px 16px 0 0",
          transform: isOpen ? "translateY(0)" : "translateY(100%)",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center py-3 cursor-grab">
          <div className="w-10 h-1 rounded-full bg-slate-600" />
        </div>

        {children}
      </div>
    </>
  );
}

// ── GlossaryTrigger (floating button) ────────────────────────────────────

export function GlossaryTrigger({
  onClick,
  termCount,
}: {
  onClick: () => void;
  termCount: number;
}): React.JSX.Element | null {
  const screenMode = useScreenMode();

  if (screenMode === "xl") {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className="fixed z-30 flex items-center gap-2 rounded-full bg-[#1E293B] border border-slate-600 text-slate-300 px-4 py-2.5 cursor-pointer shadow-lg hover:opacity-90 transition-opacity"
      style={{
        bottom: 20,
        right: 20,
      }}
      aria-label="用語集を開く"
    >
      {/* Book icon */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2V3zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7V3z" />
      </svg>
      <span className="text-[13px] font-medium">用語集</span>
      <span
        className="rounded-full bg-blue-500/20 text-blue-400 text-[11px] font-bold min-w-[20px] h-5 flex items-center justify-center px-1"
      >
        {termCount}
      </span>
    </button>
  );
}
