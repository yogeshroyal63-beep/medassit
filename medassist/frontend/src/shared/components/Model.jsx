import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/**
 * Generic modal overlay component.
 * Usage:
 *   <Modal open={open} onClose={() => setOpen(false)} title="My Dialog">
 *     <p>Content here</p>
 *   </Modal>
 */
const Modal = ({ open, onClose, title, children }) => {
  const panelRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (!panelRef.current?.contains(e.target)) onClose(); }}
    >
      <div
        ref={panelRef}
        className="glass-card relative w-full max-w-lg rounded-3xl p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
          <button
            onClick={onClose}
            className="ml-auto rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
