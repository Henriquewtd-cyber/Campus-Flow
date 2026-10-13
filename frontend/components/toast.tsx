"use client"

import { useEffect, useState } from "react"
import { X, AlertCircle, CheckCircle, Info } from "lucide-react"

export type ToastType = "success" | "error" | "info"

interface Toast {
    id: string
    message: string
    type: ToastType
}

const toastConfig = {
    success: {
        bgColor: "bg-emerald-50/95",
        borderColor: "border-emerald-200",
        textColor: "text-emerald-900",
        iconColor: "text-emerald-600",
        icon: CheckCircle,
    },
    error: {
        bgColor: "bg-rose-50/95",
        borderColor: "border-rose-200",
        textColor: "text-rose-900",
        iconColor: "text-rose-600",
        icon: AlertCircle,
    },
    info: {
        bgColor: "bg-slate-900/95",
        borderColor: "border-slate-800",
        textColor: "text-slate-100",
        iconColor: "text-blue-400",
        icon: Info,
    },
}

interface ToastProps {
    toasts: Toast[]
    removeToast: (id: string) => void
}

export function ToastContainer({ toasts, removeToast }: ToastProps) {
    return (
        <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none">
            {toasts.map((toast) => {
                const config = toastConfig[toast.type]
                const Icon = config.icon

                return (
                    <div
                        key={toast.id}
                        className={`${config.bgColor} ${config.borderColor} ${config.textColor} border rounded-xl p-3.5 shadow-md max-w-sm w-full pointer-events-auto backdrop-blur-xs flex items-center justify-between gap-3 transition-all duration-200`}
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <Icon className={`w-4 h-4 shrink-0 ${config.iconColor}`} />
                            <p className="text-xs font-semibold leading-snug truncate">{toast.message}</p>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md transition-colors shrink-0"
                            title="Fechar"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = (message: string, type: ToastType = "info", duration = 4000) => {
        const id = Date.now().toString()
        setToasts((prev) => [...prev, { id, message, type }])

        setTimeout(() => {
            removeToast(id)
        }, duration)

        return id
    }

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }

    return { toasts, addToast, removeToast }
}