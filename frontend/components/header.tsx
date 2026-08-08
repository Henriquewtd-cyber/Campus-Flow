"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Bell, User, Calendar, DollarSign } from "lucide-react"
import { usePathname } from 'next/navigation'

export function Header() {
    const pathname = usePathname()
    const [showHeader, setShowHeader] = useState(true)

    useEffect(() => {
        if (pathname.startsWith("/new-appointment")) {
            setShowHeader(false)
        } else {
            setShowHeader(true)
        }
    }, [pathname])

    if (!showHeader) return null

    return (
        <header className="bg-white border-b border-slate-200 px-6 py-4 select-none">
            <div className="flex items-center justify-between">

                {/* LOGO — opção C */}
                <div className="flex items-center gap-3.5">
                    {/* Barra accent vertical */}
                    <div className="w-1 h-11 rounded-full bg-blue-600 shrink-0" />

                    {/* Ícone SVG */}
                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <circle cx="9" cy="7" r="3" fill="#1e40af" />
                            <path
                                d="M3 19c0-3.314 2.686-6 6-6s6 2.686 6 6"
                                stroke="#1e40af"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />
                            <circle cx="17" cy="9" r="2.2" fill="#60a5fa" />
                            <path
                                d="M14.5 19c0-2.485 1.567-4.5 3.5-4.5s3.5 2.015 3.5 4.5"
                                stroke="#60a5fa"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>

                    {/* Textos */}
                    <div className="leading-tight">
                        <h1 className="text-[15px] font-bold text-slate-800 tracking-tight leading-none">
                            ClientManager
                        </h1>
                        <p className="text-[10px] font-medium text-slate-400 tracking-widest uppercase mt-1">
                            Gestão de Clientes
                        </p>
                    </div>
                </div>

                {/* Ícones da direita */}
                <div className="flex items-center space-x-4">
                    <button className="bg-transparent hover:bg-slate-200">
                        <Bell className="w-5 h-5 text-slate-700" />
                    </button>

                    <Link href="/schedule">
                        <button className="bg-transparent hover:bg-slate-200">
                            <Calendar className="w-5 h-5 text-slate-700" />
                        </button>
                    </Link>

                    <Link href="/finance">
                        <button className="bg-transparent hover:bg-slate-200">
                            <DollarSign className="w-5 h-5 text-slate-700" />
                        </button>
                    </Link>

                    <Link href="/login">
                        <button className="bg-transparent hover:bg-slate-200">
                            <User className="w-5 h-5 text-slate-700" />
                        </button>
                    </Link>
                </div>

            </div>
        </header>
    )
}