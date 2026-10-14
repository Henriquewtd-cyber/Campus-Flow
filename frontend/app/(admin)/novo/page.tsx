"use client";

// src/app/admin/novo/page.tsx — adicionar publicação

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, useToast } from "@/components/toast";
import { AdminShell, ROUTES } from "@/components/admin/admin-shell";
import { FormBody, toPayload, useEventForm } from "@/components/admin/event-form";
import { addEvento, errorMessage } from "@/app/lib/eventos-api";

export default function NovaPublicacaoPage() {
    const router = useRouter();
    const { toasts, addToast, removeToast } = useToast();
    const { form, set, reset, isInvalid } = useEventForm();
    const [submitting, setSubmitting] = useState(false);

    const handleSave = async () => {
        if (isInvalid || submitting) return;
        setSubmitting(true);
        try {
            await addEvento(toPayload(form));
            // o toast mora nesta página, então a confirmação segue na URL para a lista exibir
            router.push(`${ROUTES.lista}?msg=created`);
        } catch (error) {
            addToast(errorMessage(error), "error"); // mantém o formulário preenchido
            setSubmitting(false);
        }
    };

    return (
        <AdminShell>
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            <div className="space-y-6">
                <div className="space-y-1">
                    <h2 className="text-lg font-bold text-slate-900">Nova Publicação Institucional</h2>
                    <p className="text-xs text-slate-500">
                        Preencha o formulário abaixo para adicionar um aviso, evento ou comunicação aos portais IME-USP.
                    </p>
                </div>

                <FormBody form={form} set={set} />

                <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                        onClick={reset}
                        disabled={submitting}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors disabled:opacity-50"
                    >
                        Limpar Campos
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isInvalid || submitting}
                        className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? "Publicando..." : "Publicar no Portal"}
                    </button>
                </div>
            </div>
        </AdminShell>
    );
}