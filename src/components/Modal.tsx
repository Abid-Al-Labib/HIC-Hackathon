import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  contentClassName?: string;
  closeOnBackdropClick?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  contentClassName,
  closeOnBackdropClick = true,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => {
            if (closeOnBackdropClick) onClose();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
        >
          <motion.div
            key="modal-content"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            className={cn(
              "relative w-full max-w-2xl max-h-[90vh] overflow-y-auto",
              "bg-posthog-sage dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-posthog-border dark:border-slate-700",
              contentClassName
            )}
          >
            {(title || description) && (
              <div className="px-8 pt-8 pb-4 border-b border-posthog-border/40 dark:border-slate-800">
                {title && (
                  <h2
                    id="modal-title"
                    className="text-2xl font-bold tracking-tight text-posthog-deep-ink dark:text-slate-100"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="mt-1 text-sm text-posthog-ink/70 dark:text-slate-400">
                    {description}
                  </p>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={cn(
                "absolute top-4 right-4 p-2 rounded-full",
                "text-posthog-ink/60 dark:text-slate-400 hover:text-posthog-deep-ink dark:hover:text-slate-100",
                "hover:bg-posthog-light-sage dark:hover:bg-slate-800 transition-colors"
              )}
            >
              <X size={18} />
            </button>

            <div className={cn("p-8", title || description ? "pt-6" : "")}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
