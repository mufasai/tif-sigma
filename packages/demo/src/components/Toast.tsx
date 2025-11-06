import { FC, useEffect, useState } from "react";
import { MdCheckCircle, MdError, MdInfo, MdWarning } from "react-icons/md";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

const Toast: FC<ToastProps> = ({ message, type, duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <MdCheckCircle />;
      case "error":
        return <MdError />;
      case "warning":
        return <MdWarning />;
      case "info":
        return <MdInfo />;
    }
  };

  return (
    <div className={`toast toast-${type} ${isVisible ? "toast-visible" : "toast-hidden"}`}>
      <span className="toast-icon">{getIcon()}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }}>
        ×
      </button>
    </div>
  );
};

export default Toast;
