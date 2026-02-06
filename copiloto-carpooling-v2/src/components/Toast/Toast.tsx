'use client';

import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

const iconMap = {
    success: 'fa-circle-check',
    error: 'fa-circle-xmark',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info',
};

const colorMap = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
};

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLeaving(true);
            setTimeout(onClose, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!isVisible) return null;

    return (
        <div
            className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg text-white text-lg font-medium
                ${colorMap[type]}
                ${isLeaving ? 'animate-slide-out' : 'animate-slide-in'}
            `}
        >
            <i className={`fa-solid ${iconMap[type]} text-2xl`}></i>
            <span className="flex-1">{message}</span>
            <button
                onClick={() => {
                    setIsLeaving(true);
                    setTimeout(onClose, 300);
                }}
                className="text-white/80 hover:text-white transition cursor-pointer"
            >
                <i className="fa-solid fa-xmark text-xl"></i>
            </button>
        </div>
    );
}