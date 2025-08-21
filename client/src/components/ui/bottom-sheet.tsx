import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader as CenterDialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


type BottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  swipeToClose?: boolean;
  swipeCloseThreshold?: number; // pixels
};

const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  swipeToClose = true,
  swipeCloseThreshold = 140,
}) => {
  const isMobile = useIsMobile();
  const [dragY, setDragY] = useState(0);
  const startYRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      setDragY(0);
      startYRef.current = null;
      isDraggingRef.current = false;
    }
  }, [open]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!swipeToClose) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    startYRef.current = e.clientY;
    isDraggingRef.current = true;
  }, [swipeToClose]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!swipeToClose) return;
    if (!isDraggingRef.current || startYRef.current === null) return;
    const delta = e.clientY - startYRef.current;
    const clamped = Math.max(0, delta);
    setDragY(clamped);
  }, [swipeToClose]);

  const endDrag = useCallback(() => {
    if (!swipeToClose) return;
    if (!isDraggingRef.current) return;
    if (dragY > swipeCloseThreshold) {
      // Reset drag before closing to avoid transform conflicts
      setDragY(0);
      onOpenChange(false);
    } else {
      setDragY(0);
    }
    isDraggingRef.current = false;
    startYRef.current = null;
  }, [dragY, onOpenChange, swipeCloseThreshold, swipeToClose]);

  // Desktop: use centered dialog with close button
  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={className}>
          {(title || description) && (
            <CenterDialogHeader>
              {title && <DialogTitle>{title}</DialogTitle>}
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </CenterDialogHeader>
          )}
          <div className="mt-2">{children}</div>
        </DialogContent>
      </Dialog>
    );
  }

  // Mobile: swipeable bottom sheet
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        hideCloseButton
        className={cn("z-[60] rounded-t-2xl rounded-b-none min-h-[30vh]", className)}
        ref={(node) => {
          contentRef.current = node;
        }}
        style={swipeToClose && dragY > 0 ? { transform: `translateY(${dragY}px)` } : undefined}
      >
        {/* Expanded draggable area at the very top */}
        <div
          className="absolute inset-x-0 top-0 h-12 flex items-center justify-center z-10 select-none touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClick={() => { if (dragY === 0) onOpenChange(false); }}
        >
          <div className="h-1 w-20 rounded-full bg-muted-foreground/40" />
        </div>
        {(title || description) && (
          <SheetHeader className="px-1 select-none">
            {title && <SheetTitle>{title}</SheetTitle>}
            {description && (
              <SheetDescription>{description}</SheetDescription>
            )}
          </SheetHeader>
        )}
        <div
          className="mt-2"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BottomSheet;


