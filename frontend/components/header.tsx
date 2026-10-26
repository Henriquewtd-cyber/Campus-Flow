"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Bell, User, Calendar, DollarSign, Newspaper, LayoutDashboard, Monitor } from "lucide-react"
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
        <header className="bg-white border-b border-slate-200/80 px-4 md:px-8 py-3.5 select-none sticky top-0 z-40 shadow-xs">
            <div className="max-w-7xl mx-auto flex items-center justify-between">

                {/* LOGO & INSTITUTIONAL TITLE */}
                <Link href="/eventos" className="flex items-center gap-3.5 group text-left">
                    <div className="w-10 h-10 rounded-lg bg-blue-900 flex items-center justify-center text-white font-bold shadow-xs shrink-0 group-hover:bg-blue-800 transition-colors">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                            <path d="M6 6h10" />
                            <path d="M6 10h10" />
                        </svg>
                    </div>

                    <div className="leading-tight">
                        <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            CampusFlow
                            <span className="text-[10px] uppercase font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200/60">
                                IME-USP
                            </span>
                        </h1>
                        <p className="text-[11px] font-medium text-slate-500 tracking-wide">
                            Portal Institucional de Comunicação
                        </p>
                    </div>
                </Link>

                {/* CENTER NAVIGATION LINKS */}
                <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg border border-slate-200/60 text-xs font-medium text-slate-600">
                    <Link
                        href="/eventos"
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${pathname === "/eventos"
                            ? "bg-white text-blue-900 shadow-xs font-semibold"
                            : "hover:text-slate-900 hover:bg-slate-200/50"
                            }`}
                    >
                        <Newspaper className="w-3.5 h-3.5" />
                        <span>Notícias</span>
                    </Link>
                    <Link
                        href="/editar"
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${pathname.startsWith("/editar") || pathname.startsWith("/novo")
                            ? "bg-white text-blue-900 shadow-xs font-semibold"
                            : "hover:text-slate-900 hover:bg-slate-200/50"
                            }`}
                    >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>Gestão</span>
                    </Link>
                    <Link
                        href="/slides"
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${pathname === "/slides"
                            ? "bg-white text-blue-900 shadow-xs font-semibold"
                            : "hover:text-slate-900 hover:bg-slate-200/50"
                            }`}
                    >
                        <Monitor className="w-3.5 h-3.5" />
                        <span>Painel TV</span>
                    </Link>
                </nav>

                {/* RIGHT ACTION BUTTONS */}
                <div className="flex items-center space-x-1.5">


                    <Link href="/login">
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-900 text-white hover:bg-blue-800 transition-all shadow-xs">
                            <User className="w-3.5 h-3.5" />
                            <span>Acesso Restrito</span>
                        </button>
                    </Link>
                </div>

            </div>
        </header>
    )
}
