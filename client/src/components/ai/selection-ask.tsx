import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { Button } from "@/components/ui/button";

type Position = { top: number; left: number } | null;

/**
 * Renders a floating "Спросить у ИИ" button near the current text selection.
 * Appears only when non-empty text is selected and we're not on the AI page.
 */
const SelectionAsk = () => {
  const workspaceId = useWorkspaceId();
  const location = useLocation();

  const isAiPage = useMemo(() => location.pathname.includes("/ai"), [location.pathname]);

  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<Position>(null);
  const [selectedText, setSelectedText] = useState("");

  useEffect(() => {
    if (isAiPage) {
      setIsVisible(false);
      setPosition(null);
      return;
    }

    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        setIsVisible(false);
        setPosition(null);
        return;
      }

      const text = selection.toString().trim();
      if (!text) {
        setIsVisible(false);
        setPosition(null);
        setSelectedText("");
        return;
      }

      setSelectedText(text);
      // Position near selection bounds
      const range = selection.getRangeAt(0).cloneRange();
      let rect = range.getBoundingClientRect();
      if ((!rect || (rect.top === 0 && rect.bottom === 0)) && range.getClientRects().length > 0) {
        rect = range.getClientRects()[0];
      }

      if (!rect) {
        setIsVisible(false);
        setPosition(null);
        return;
      }

      const offset = 8; // px below the selection
      const tentativeLeft = rect.left + rect.width / 2; // center horizontally
      const estimatedWidth = 160; // approximate button width
      const left = Math.min(
        Math.max(tentativeLeft - estimatedWidth / 2, 8),
        window.innerWidth - estimatedWidth - 8
      );
      const top = Math.min(rect.bottom + offset, window.innerHeight - 48 - 8);

      setPosition({ top, left });
      setIsVisible(true);
    };

    const hide = () => {
      setIsVisible(false);
      setPosition(null);
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("scroll", hide, true);
    document.addEventListener("keydown", hide, true);
    document.addEventListener("mousedown", (e) => {
      // If clicking inside our button, keep visible until navigation happens
      const target = e.target as HTMLElement;
      if (target.closest?.("#selection-ask-button")) return;
      hide();
    }, true);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("scroll", hide, true);
      document.removeEventListener("keydown", hide, true);
    };
  }, [isAiPage]);

  if (isAiPage || !isVisible || !position) return null;

  return (
    <div
      id="selection-ask-button"
      className="fixed z-[60] pointer-events-auto"
      style={{ top: position.top, left: position.left }}
    >
      <Link to={`/workspace/${workspaceId}/ai`} state={{ prefillQuestion: selectedText }}>
        <Button size="sm" className="rounded-full shadow-md">
          Спросить у ИИ
        </Button>
      </Link>
    </div>
  );
};

export default SelectionAsk;


