import { useEffect } from "react";

/**
 * Handles common modal behaviors:
 * - Closes the modal when Escape is pressed
 * - Locks body scroll while the modal is open
 * - Compensates for scrollbar width to prevent layout shift
 */
export function useModalLock(onClose: () => void): void {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === "Escape") onClose();
    }

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [onClose]);
}
