import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

// ============================================================================
// Toast Notification — floating notifications with auto-dismiss
// ============================================================================

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    duration?: number;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, duration = 5000, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Animate in
        requestAnimationFrame(() => setVisible(true));

        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300); // Wait for exit animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircle size={20} />,
        error: <AlertCircle size={20} />,
        info: <Info size={20} />,
    };

    const colors = {
        success: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
        error: 'border-red-500/50 bg-red-500/10 text-red-400',
        info: 'border-blue-500/50 bg-blue-500/10 text-blue-400',
    };

    return (
        <div
            className={`
        fixed top-6 right-6 z-[100] max-w-sm
        flex items-start gap-3 px-4 py-3
        rounded-xl border backdrop-blur-xl shadow-2xl
        transition-all duration-300 ease-out
        ${colors[type]}
        ${visible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}
      `}
        >
            <span className="mt-0.5 flex-shrink-0">{icons[type]}</span>
            <p className="text-sm font-medium leading-relaxed flex-1">{message}</p>
            <button
                onClick={() => {
                    setVisible(false);
                    setTimeout(onClose, 300);
                }}
                className="mt-0.5 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;

// ============================================================================
// useToast — hook for managing toast state
// ============================================================================
interface ToastItem {
    id: string;
    message: string;
    type: ToastType;
}

export function useToast() {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = (message: string, type: ToastType = 'info') => {
        // Simple fallback for crypto.randomUUID() if needed
        const id = typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2, 11);
        setToasts((prev) => [...prev, { id, message, type }]);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const ToastContainer: React.FC = () => (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
            {toasts.map((t, i) => (
                <div key={t.id} className="pointer-events-auto" style={{ transform: `translateY(${i * 4}px)` }}>
                    <Toast
                        message={t.message}
                        type={t.type}
                        onClose={() => removeToast(t.id)}
                    />
                </div>
            ))}
        </div>
    );

    return { showToast, ToastContainer };
}
