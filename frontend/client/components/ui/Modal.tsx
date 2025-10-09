import * as React from "react";
import { Button } from "@/components/ui/button";

export default function Modal({
  open,
  onClose,
  title,
  children,
  onConfirm,
  confirmLabel = "Confirm",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  onConfirm?: () => void;
  confirmLabel?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-lg bg-card p-6 shadow-lg">
        {title && <h3 className="text-lg font-semibold">{title}</h3>}
        <div className="mt-4">{children}</div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="px-4 py-2">Cancel</Button>
          <Button onClick={() => { onConfirm?.(); onClose(); }} className="px-4 py-2 bg-foreground text-background">{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
