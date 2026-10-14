"use client";

// src/app/admin/editar/[id]/page.tsx — editar publicação

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Edit3 } from "lucide-react";
import { ToastContainer, useToast } from "@/components/toast";
import { AdminShell, ROUTES } from "@/components/admin/admin-shell";
import { FormBody, fromEvento, toPayload, useEventForm } from "@/components/admin/event-form";
import { errorMessage, getEventoById, updateEvento } from "@/app/lib/eventos-api";

type Status = "loading" | "ready" | "notfound" | "error";

const cancelClass =
    "px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors";

export default function EditarPublicacaoPage() {
    const params = useParams<{ id: string }>();
    const eventId = Number(params?.id);

    const router = useRouter();
    const { toasts, addToast, removeToast } = useToast();
    const { form, setForm, set, isInvalid } = useEventForm();
    const [status, setStatus] = useState<Status>("loading");
    const [loadError, setLoadError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (Number.isNaN(eventId)) {
            setStatus("notfound");
            return;
        }
        let cancelled = false;
        setStatus("loading");
        getEventoById(eventId)
            .then(ev => {
                if (cancelled) return;
                if (!ev) {
                    setStatus("notfound");
                    return;
                }
                setForm(fromEvento(ev));
                setStatus("ready");
            })
            .catch(e => {
                if (cancelled) return;
                setLoadError(errorMessage(e));
                setStatus("error");
            });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId]);

    const handleUpdate = async () => {
        if (isInvalid || submitting) return;
        setSubmitting(true);
        try {
            await updateEvento(eventId, toPayload(form));
            router.push(`${ROUTES.lista}?msg=updated`);
        } catch (error) {
            addToast(errorMessage(error), "error"); // mantém as alterações no formulário
            setSubmitting(false);
        }
    };

    return (
        <AdminShell>
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {status === "loading" && (
                <div className="bg-white border border-slate-200/80 rounded-xl p-8 text-center text-xs text-slate-500">
                    Carregando publicação...
                </div>
            )}

            {status === "notfound" && (
                <div className="bg-white border border-slate-200/80 rounded-xl p-8 text-center">
                    <p className="text-xs text-slate-600 mb-3">Publicação não encontrada.</p>
                    <Link href={ROUTES.lista} className="text-xs font-bold text-blue-900 hover:underline">
                        Voltar para a lista
                    </Link>
                </div>
            )}

            {status === "error" && (
                <div className="bg-white border border-rose-200 rounded-xl p-8 text-center">
                    <p className="text-xs text-slate-600 mb-3">{loadError}</p>
                    <Link href={ROUTES.lista} className="text-xs font-bold text-blue-900 hover:underline">
                        Voltar para a lista
                    </Link>
                </div>
            )}

            {status === "ready" && (
                <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <Edit3 className="w-5 h-5 text-amber-700 shrink-0" />
                            <div>
                                <h2 className="text-xs font-bold text-amber-900">Modo de Edição Ativo</h2>
                                <p className="text-xs text-amber-800">Editando: <strong>{form.titulo}</strong></p>
                            </div>
                        </div>
                        <Link
                            href={ROUTES.lista}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 transition-colors shrink-0"
                        >
                            Cancelar Edição
                        </Link>
                    </div>

                    <FormBody form={form} set={set} />

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <Link href={ROUTES.lista} className={cancelClass}>
                            Cancelar
                        </Link>
                        <button
                            onClick={handleUpdate}
                            disabled={isInvalid || submitting}
                            className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Salvando..." : "Salvar Alterações"}
                        </button>
                    </div>
                </div>
            )}
        </AdminShell>
    );
}