"use client";

// src/components/admin/admin-shell.tsx
// Cabeçalho do painel + abas de navegação, compartilhados pelas páginas do admin.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Edit3, ListFilter, PlusCircle } from "lucide-react";
import { Header } from "@/components/header";

export const ROUTES = {
    novo: "/novo",
    lista: "/editar",
    editar: (id: number) => `/editar/${id}`,
};

const tabClass = (active: boolean) =>
    `flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${active
        ? "bg-white text-blue-900 shadow-xs"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
    }`;

export function AdminShell({ children }: { children: React.ReactNode }) {
    const pathname = (usePathname() ?? "").replace(/\/$/, "");
    const isNovo = pathname === ROUTES.novo;
    const isLista = pathname === ROUTES.lista;
    const isEditing = !isLista && pathname.startsWith(ROUTES.lista);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
            <Header />

            {/* DASHBOARD SUB-HEADER BANNER */}
            <div className="bg-white border-b border-slate-200 py-5 px-4 md:px-8">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-900 text-[11px] font-semibold mb-1">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>Painel Administrativo IME-USP</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Gestão de Comunicados e Publicações
                        </h1>
                    </div>

                    {/* ADMIN TABS */}
                    <nav className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 text-xs font-semibold">
                        <Link href={ROUTES.novo} className={tabClass(isNovo)}>
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Nova Publicação</span>
                        </Link>

                        <Link href={ROUTES.lista} className={tabClass(isLista)}>
                            <ListFilter className="w-3.5 h-3.5" />
                            <span>Gerenciar</span>
                        </Link>

                        {isEditing && (
                            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 shadow-xs font-bold">
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Editando</span>
                            </div>
                        )}
                    </nav>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <main className="max-w-5xl w-full mx-auto px-4 md:px-8 py-8 flex-1">
                {children}
            </main>
        </div>
    );
}