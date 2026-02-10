import { useState, useEffect } from "react";

export function ProgressIndicator() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress(Math.min(1, scrollTop / docHeight));
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-[3px]"
      style={{ background: "rgba(15,23,42,0.5)" }}
    >
      <div
        className="h-full transition-[width] duration-150"
        style={{
          width: `${progress * 100}%`,
          background: "linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899)",
        }}
      />
    </div>
  );
}
