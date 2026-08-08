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
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        textColor: "text-green-800",
        icon: CheckCircle,
    },
    error: {
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        textColor: "text-red-800",
        icon: AlertCircle,
    },
    info: {
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        textColor: "text-blue-800",
        icon: Info,
    },
}

interface ToastProps {
    toasts: Toast[]
    removeToast: (id: string) => void
}

export function ToastContainer({ toasts, removeToast }: ToastProps) {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast) => {
                const config = toastConfig[toast.type]
                const Icon = config.icon

                return (
                    <div
                        key={toast.id}
                        className={`${config.bgColor} ${config.borderColor} ${config.textColor} border rounded-lg p-4 shadow-lg max-w-sm animate-in fade-in slide-in-from-top-2 duration-300`}
                    >
                        <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 shrink-0" />
                            <p className="flex-1 text-sm font-medium">{toast.message}</p>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-current opacity-70 hover:opacity-100"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
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