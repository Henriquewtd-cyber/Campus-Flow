"use client";

// src/app/admin/editar/page.tsx — lista de publicações (entrada da edição) e remoção

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, Edit3, Megaphone, MapPin, Radio, Star, Trash2 } from "lucide-react";
import { ToastContainer, useToast } from "@/components/toast";
import { AdminShell, ROUTES } from "@/components/admin/admin-shell";
import { Badge, Tags, formatDate } from "@/components/admin/event-form";
import { deleteEvento, errorMessage, getEventos, type EventoApi } from "@/app/lib/eventos-api";

type EventoComId = EventoApi & { id: number };

export default function GerenciarPublicacoesPage() {
    const { toasts, addToast, removeToast } = useToast();
    const [events, setEvents] = useState<EventoComId[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Confirmação vinda das páginas de adicionar/editar (?msg=created | updated)
    useEffect(() => {
        const msg = new URLSearchParams(window.location.search).get("msg");
        if (!msg) return;
        if (msg === "created") addToast("Publicação salva com sucesso!", "success");
        if (msg === "updated") addToast("Publicação atualizada com sucesso!", "success");
        window.history.replaceState(null, "", ROUTES.lista);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setLoadError(null);
        getEventos()
            .then(data => {
                if (!cancelled) setEvents(data.filter((e): e is EventoComId => e.id != null));
            })
            .catch(e => { if (!cancelled) setLoadError(errorMessage(e)); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [reloadKey]);

    const handleDelete = async (id: number) => {
        if (deleting) return;
        setDeleting(true);
        try {
            const res = await deleteEvento(id);
            setEvents(e => e.filter(ev => ev.id !== id));
            setDeleteId(null);
            addToast(res.message || "Publicação removida.", "success");
        } catch (error) {
            addToast(errorMessage(error), "error");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <AdminShell>
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            <div className="space-y-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Publicações Ativas</h2>
                    <p className="text-xs text-slate-500">
                        {loading ? "Carregando..." : `${events.length} item(ns) cadastrados no painel institucional.`}
                    </p>
                </div>

                {loading && (
                    <div className="bg-white border border-slate-200/80 rounded-xl p-8 text-center text-xs text-slate-500">
                        Carregando publicações...
                    </div>
                )}

                {!loading && loadError && (
                    <div className="bg-white border border-rose-200 rounded-xl p-8 text-center">
                        <p className="text-xs text-slate-600 mb-3">{loadError}</p>
                        <button
                            onClick={() => setReloadKey(k => k + 1)}
                            className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 transition-colors"
                        >
                            Tentar novamente
                        </button>
                    </div>
                )}

                {!loading && !loadError && events.length === 0 && (
                    <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-xs text-slate-500">
                        Nenhuma publicação cadastrada.
                    </div>
                )}

                <div className="space-y-3">
                    {events.map(ev => (
                        <div
                            key={ev.id}
                            className="bg-white border border-slate-200/80 rounded-xl p-4 md:p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 shadow-xs hover:border-slate-300 transition-all"
                        >
                            <div className="space-y-2 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge tipo={ev.tipo} />
                                    {ev.destaque && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                                            <span>DESTAQUE</span>
                                        </span>
                                    )}
                                    {ev.ticker && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                            <Megaphone className="w-3 h-3 text-emerald-600" />
                                            <span>TICKER</span>
                                        </span>
                                    )}
                                    <Tags ev={ev} />
                                </div>

                                <h3 className="text-base font-bold text-slate-900 leading-snug">{ev.titulo}</h3>
                                {ev.subtitulo && (
                                    <p className="text-xs text-slate-500 line-clamp-1">{ev.subtitulo}</p>
                                )}

                                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100">
                                    {ev.dataInicio && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3 text-slate-400" />
                                            <span>{formatDate(ev.dataInicio)}</span>
                                        </span>
                                    )}
                                    {ev.horaInicio && (
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-slate-400" />
                                            <span>{ev.horaInicio.slice(0, 5)}</span>
                                        </span>
                                    )}
                                    {ev.local && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3 text-slate-400" />
                                            <span>{ev.local}</span>
                                        </span>
                                    )}
                                    {ev.fonte && (
                                        <span className="flex items-center gap-1 text-blue-900 font-semibold">
                                            <Radio className="w-3 h-3 text-blue-700" />
                                            <span>{ev.fonte}</span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* ACTIONS */}
                            <div className="flex md:flex-col items-center justify-end gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                                <Link
                                    href={ROUTES.editar(ev.id)}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200/80 transition-colors w-full justify-center"
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>Editar</span>
                                </Link>

                                {deleteId === ev.id ? (
                                    <div className="flex items-center gap-1 w-full">
                                        <button
                                            onClick={() => handleDelete(ev.id)}
                                            disabled={deleting}
                                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors flex-1 disabled:opacity-50"
                                        >
                                            {deleting ? "Removendo..." : "Confirmar"}
                                        </button>
                                        <button
                                            onClick={() => setDeleteId(null)}
                                            disabled={deleting}
                                            className="px-2 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setDeleteId(ev.id)}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors w-full justify-center"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Remover</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminShell>
    );
}