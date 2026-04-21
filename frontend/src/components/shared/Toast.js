import React, { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast-container">
      <div className={`app-toast ${type}`}>
        <i className={`bi ${type === "success" ? "bi-check-circle-fill" : "bi-exclamation-circle-fill"}`}></i>
        {message}
      </div>
    </div>
  );
}
