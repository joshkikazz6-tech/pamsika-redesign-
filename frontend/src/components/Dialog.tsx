import React, { useEffect, useRef } from 'react';

export type DialogVariant = 'success' | 'error' | 'warning' | 'confirm' | 'info';

const VARIANT_ICON: Record<DialogVariant, string> = {
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  confirm: 'help',
  info: 'info',
};

interface DialogAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface DialogProps {
  open: boolean;
  onClose: () => void;
  variant?: DialogVariant;
  title: string;
  description?: string;
  /** Custom body content. If provided, takes priority over `description`. */
  children?: React.ReactNode;
  primaryAction: DialogAction;
  secondaryAction?: DialogAction;
  /** Use the destructive (red) style for the primary button, e.g. delete confirmations. */
  destructive?: boolean;
  /** Clicking the backdrop closes the dialog. Defaults to true. */
  closeOnBackdrop?: boolean;
}

/**
 * Pa_mSikA's shared themed dialog. Used for confirmation, success, error, and
 * warning popups across the site so every modal shares the same card style,
 * animation, and button treatment.
 */
export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  variant = 'info',
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
  destructive = false,
  closeOnBackdrop = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    // Move focus into the dialog for accessibility.
    cardRef.current?.focus();
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="pm-dialog-backdrop"
      onClick={() => {
        if (closeOnBackdrop) onClose();
      }}
    >
      <div
        ref={cardRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="pm-dialog-title"
        aria-describedby={description ? 'pm-dialog-description' : undefined}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="pm-dialog-card max-w-sm p-6 outline-none"
      >
        <div className="flex items-start gap-4">
          <div className={`pm-dialog-icon pm-dialog-icon--${variant}`}>
            <span className="material-symbols-outlined text-[26px]">{VARIANT_ICON[variant]}</span>
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h3 id="pm-dialog-title" className="font-serif-source text-lg font-bold text-[#121c2a] dark:text-white">
              {title}
            </h3>
            {children ? (
              <div id="pm-dialog-description" className="text-xs text-[#4a4455] dark:text-zinc-400 mt-1.5 leading-relaxed">
                {children}
              </div>
            ) : description ? (
              <p id="pm-dialog-description" className="text-xs text-[#4a4455] dark:text-zinc-400 mt-1.5 leading-relaxed">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 mt-6">
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              disabled={secondaryAction.disabled}
              className="pm-dialog-btn-secondary px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-60 cursor-pointer"
            >
              {secondaryAction.label}
            </button>
          )}
          <button
            type="button"
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
            className={`pm-dialog-btn-primary ${destructive ? 'pm-dialog-btn-primary--danger' : ''} px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all disabled:opacity-60 cursor-pointer`}
          >
            {primaryAction.label}
          </button>
        </div>
      </div>
    </div>
  );
};