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

    document.addEventListener("keydown", handleKeyDown);

    // scrollbar幅の計算とbodyスタイル変更をアニメーションフレーム外で実行し、
    // モーダル開始アニメーションの最初のフレームで強制リフローを避ける
    const rafId = requestAnimationFrame(() => {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    });

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [onClose]);
}
