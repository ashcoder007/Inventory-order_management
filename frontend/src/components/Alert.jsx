import { CheckCircle2, XCircle } from "lucide-react";

export default function Alert({ type = "info", message, onClose }) {
  if (!message) {
    return null;
  }

  const Icon = type === "success" ? CheckCircle2 : XCircle;

  return (
    <div className={`alert ${type}`}>
      <Icon size={18} />
      <span>{message}</span>
      {onClose && (
        <button className="icon-button" type="button" onClick={onClose} aria-label="Close message">
          ×
        </button>
      )}
    </div>
  );
}
