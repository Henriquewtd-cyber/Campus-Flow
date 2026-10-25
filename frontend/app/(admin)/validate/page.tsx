"use client";

// src/app/(admin)/validate/page.tsx  →  URL: /validate
// Lista os eventos pendentes (extraídos de e-mails pelo Gemini via n8n), deixa
// revisar/editar cada um com o mesmo formulário do admin e, ao confirmar:
//   1) POST   /add_evento
//   2) DELETE /n8n_remove_event/{id do pendente}   (automático)
// "Excluir" vai direto ao DELETE. Qualquer falha é tratada como erro.

import { useCallback, useEffect, useRef, useState } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    Inbox,
    Loader2,
    RefreshCw,
    Trash2,
} from "lucide-react";
import {
    AREAS,
    Badge,
    CATEGORIAS,
    FormBody,
    MAX_TAGS,
    MAX_TAG_LENGTH,
    PUBLICOS,
    TIPOS,
    formatDate,
    toPayload,
    useEventForm,
    type FormState,
} from "@/components/admin/event-form";
import { addEvento, errorMessage, getPendentes, removePendente, type PendenteApi } from "@/app/lib/eventos-api";
import { AdminShell } from "@/components/admin/admin-shell";

// ─── API ──────────────────────────────────────────────────────────────────────

// As chamadas HTTP vêm de @/app/lib/eventos-api: addEvento, getPendentes e removePendente.

// ─── TIPOS ────────────────────────────────────────────────────────────────────

type EventoBruto = Record<string, unknown>;

type Pendente = PendenteApi;

type Item = {
    pend: Pendente;
    initial: FormState;
    avisos: string[]; // o que foi corrigido/descartado ao carregar
};

// ─── NORMALIZAÇÃO (dado bruto do Gemini → estado do formulário) ───────────────

const PLACEHOLDER = /^(ausente|n\/a|não informado|nao informado|-)$/i;

const clean = (v: unknown): string => {
    if (typeof v !== "string") return "";
    const s = v.trim();
    return PLACEHOLDER.test(s) ? "" : s;
};

const asDate = (v: unknown) => {
    const s = clean(v);
    return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : "";
};

const asTime = (v: unknown) => {
    const s = clean(v);
    return /^\d{2}:\d{2}/.test(s) ? s.slice(0, 5) : "";
};

// Mantém só valores permitidos (ignorando maiúsculas/minúsculas) e reporta o resto
function pickAllowed(values: unknown, allowed: string[], campo: string, avisos: string[]): string[] {
    const arr = Array.isArray(values) ? values.filter((x): x is string => typeof x === "string") : [];
    const ok: string[] = [];
    const descartados: string[] = [];

    for (const v of arr) {
        const canon = allowed.find(a => a.toLowerCase() === v.trim().toLowerCase());
        if (canon) { if (!ok.includes(canon)) ok.push(canon); }
        else descartados.push(v);
    }
    if (descartados.length) {
        avisos.push(`${campo}: ${descartados.map(d => `"${d}"`).join(", ")} não existe(m) na lista e foi/foram removido(s).`);
    }
    return ok;
}

function cleanTags(values: unknown): string[] {
    const arr = Array.isArray(values) ? values.filter((x): x is string => typeof x === "string") : [];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const t of arr) {
        const v = t.trim().slice(0, MAX_TAG_LENGTH);
        if (!v || seen.has(v.toLowerCase())) continue;
        seen.add(v.toLowerCase());
        out.push(v);
        if (out.length >= MAX_TAGS) break;
    }
    return out;
}

function fromBruto(e: EventoBruto): { form: FormState; avisos: string[] } {
    const avisos: string[] = [];

    const tipoRaw = clean(e.tipo).toUpperCase();
    const tipo = TIPOS.includes(tipoRaw) ? tipoRaw : "EVENTO";
    if (!TIPOS.includes(tipoRaw)) {
        avisos.push(`tipo: "${String(e.tipo ?? "")}" é inválido; ajustado para EVENTO (confira).`);
    }

    const dataInicio = asDate(e.dataInicio);
    if (!dataInicio) {
        avisos.push(`dataInicio: valor ${e.dataInicio == null ? "ausente" : `"${String(e.dataInicio)}"`} não é uma data válida; preencha manualmente.`);
    }

    const ticker = e.ticker === true;

    const form: FormState = {
        tipo,
        titulo: clean(e.titulo),
        subtitulo: clean(e.subtitulo),
        dataInicio,
        dataFim: asDate(e.dataFim),
        horaInicio: asTime(e.horaInicio),
        horaFim: asTime(e.horaFim),
        local: clean(e.local),
        fonte: clean(e.fonte),
        link: clean(e.link),
        destaque: e.destaque === true,
        ticker,
        textoTicker: ticker ? clean(e.textoTicker).slice(0, 120) : "",
        areas: pickAllowed(e.areas, AREAS, "areas", avisos),
        categorias: pickAllowed(e.categorias, CATEGORIAS, "categorias", avisos),
        publicos: pickAllowed(e.publicos, PUBLICOS, "publicos", avisos),
        tags: cleanTags(e.tags),
    };

    if (!form.fonte) avisos.push("fonte: vazia; preencha manualmente.");
    return { form, avisos };
}

function toItem(p: Pendente): Item | null {
    // Pendentes sem evento não são enviados pelo n8n; se algum chegar, é ignorado.
    const e = p.dados_brutos?.eventoEncontrado ? p.dados_brutos.evento : null;
    if (!e) return null;
    const { form, avisos } = fromBruto(e);
    return { pend: p, initial: form, avisos };
}

// ─── CARD DE UM PENDENTE ──────────────────────────────────────────────────────

function motivosInvalido(f: FormState): string[] {
    const m: string[] = [];
    if (!f.titulo.trim()) m.push("título");
    if (!f.dataInicio) m.push("data de início");
    if (!f.fonte.trim()) m.push("fonte");
    if (f.dataInicio && f.dataFim && f.dataFim < f.dataInicio) m.push("data fim (anterior ao início)");
    return m;
}

function PendenteCard({
    item, defaultOpen, onDone,
}: {
    item: Item;
    defaultOpen: boolean;
    onDone: (id: number, acao: "publicado" | "excluido") => void;
}) {
    const { pend, initial, avisos } = item;
    const { form, set, isInvalid } = useEventForm(initial);

    const [open, setOpen] = useState(defaultOpen);
    const [confirming, setConfirming] = useState(false);
    const [busy, setBusy] = useState<null | "publicar" | "excluir">(null);
    const [posted, setPosted] = useState(false); // POST já feito (evita duplicar numa nova tentativa)
    const [error, setError] = useState<string | null>(null);

    const faltando = motivosInvalido(form);
    const errosBackend = pend.erros_validacao ?? [];
    const lockado = busy !== null || posted;

    const publicar = async () => {
        setBusy("publicar");
        setError(null);
        let enviado = posted;
        try {
            if (!enviado) {
                await addEvento(toPayload(form));
                enviado = true;
                setPosted(true);
            }
            await removePendente(pend.id);
            onDone(pend.id, "publicado");
        } catch (e) {
            const msg = errorMessage(e);
            setError(
                enviado
                    ? `O evento foi cadastrado, mas a remoção do pendente falhou (${msg}). Ao tentar de novo, só a remoção será repetida; o evento não será duplicado.`
                    : `Não foi possível cadastrar o evento (${msg}).`
            );
            setBusy(null);
            setConfirming(false);
        }
    };

    const excluir = async () => {
        setBusy("excluir");
        setError(null);
        try {
            await removePendente(pend.id);
            onDone(pend.id, "excluido");
        } catch (e) {
            setError(`Não foi possível excluir o pendente (${errorMessage(e)}).`);
            setBusy(null);
        }
    };

    return (
        <div className={`bg-white border rounded-2xl shadow-xs overflow-hidden ${error ? "border-rose-300" : "border-slate-200/80"}`}>
            {/* CABEÇALHO (sempre visível) */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                aria-expanded={open}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge tipo={form.tipo} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Pendente #{pend.id}
                        </span>
                        {posted && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                CADASTRADO
                            </span>
                        )}
                        {(errosBackend.length > 0 || avisos.length > 0) && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                <AlertTriangle className="w-3 h-3" />
                                <span>{errosBackend.length + avisos.length} alerta(s)</span>
                            </span>
                        )}
                        {isInvalid && (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                                INCOMPLETO
                            </span>
                        )}
                    </div>
                    <div className="text-sm font-bold text-slate-900 truncate">
                        {form.titulo || "(sem título)"}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {form.dataInicio ? formatDate(form.dataInicio) : "sem data"}
                        {form.fonte ? ` · ${form.fonte}` : ""}
                    </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-4 md:p-5 space-y-4">
                    {/* ALERTAS */}
                    {errosBackend.length > 0 && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 space-y-1">
                            <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                                Erros de validação do backend
                            </div>
                            <ul className="list-disc pl-4 text-xs text-rose-800 space-y-0.5">
                                {errosBackend.map((e, i) => <li key={i}>{e}</li>)}
                            </ul>
                        </div>
                    )}
                    {avisos.length > 0 && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 space-y-1">
                            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                                Ajustes feitos ao carregar (revise)
                            </div>
                            <ul className="list-disc pl-4 text-xs text-amber-900 space-y-0.5">
                                {avisos.map((a, i) => <li key={i}>{a}</li>)}
                            </ul>
                        </div>
                    )}

                    {/* FORMULÁRIO (travado após o POST ou durante o envio) */}
                    <fieldset disabled={lockado} className="space-y-4 min-w-0 border-0 p-0 m-0 disabled:opacity-70">
                        <FormBody form={form} set={set} />
                    </fieldset>

                    {/* ERRO DE ENVIO */}
                    {error && (
                        <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-3.5 text-xs font-semibold text-rose-800">
                            {error}
                        </div>
                    )}

                    {/* AÇÕES */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                        <button
                            type="button"
                            onClick={excluir}
                            disabled={busy !== null || posted}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            {busy === "excluir" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            <span>Excluir pendente</span>
                        </button>

                        {!confirming ? (
                            <div className="flex flex-col items-start sm:items-end gap-1">
                                <button
                                    type="button"
                                    onClick={() => setConfirming(true)}
                                    disabled={(isInvalid && !posted) || busy !== null}
                                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs cursor-pointer"
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>{posted ? "Tentar remover pendente" : "Validar e publicar"}</span>
                                </button>
                                {isInvalid && !posted && (
                                    <span className="text-[11px] text-rose-600 font-semibold">
                                        Falta preencher: {faltando.join(", ")}.
                                    </span>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-semibold text-slate-700">
                                    {posted ? "Remover o pendente agora?" : "Publicar este evento e remover o pendente?"}
                                </span>
                                <button
                                    type="button"
                                    onClick={publicar}
                                    disabled={busy !== null}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-600 disabled:opacity-60 transition-colors cursor-pointer"
                                >
                                    {busy === "publicar" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>Sim, confirmar</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConfirming(false)}
                                    disabled={busy !== null}
                                    className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-60 transition-colors cursor-pointer"
                                >
                                    Cancelar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── PÁGINA ───────────────────────────────────────────────────────────────────

export default function ValidatePage() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [publicados, setPublicados] = useState(0);
    const [excluidos, setExcluidos] = useState(0);

    const reqId = useRef(0); // ignora respostas antigas se houver um novo carregamento

    const carregar = useCallback(async () => {
        const id = ++reqId.current;
        setLoading(true);
        setError(null);
        try {
            const data = await getPendentes();
            if (id !== reqId.current) return;
            setItems(data.map(toItem).filter((x): x is Item => x !== null));
        } catch (e) {
            if (id !== reqId.current) return;
            console.error("Erro ao buscar pendentes:", e);
            setError(errorMessage(e));
        } finally {
            if (id === reqId.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        carregar();
        return () => { reqId.current++; };
    }, [carregar]);

    const onDone = (id: number, acao: "publicado" | "excluido") => {
        setItems(prev => prev.filter(i => i.pend.id !== id));
        if (acao === "publicado") setPublicados(n => n + 1);
        else setExcluidos(n => n + 1);
    };

    return (
        <AdminShell>
            <div className="max-w-4xl w-full mx-auto px-4 md:px-8 py-8 space-y-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
                            Validação de eventos pendentes
                        </h1>
                        <p className="text-xs md:text-sm text-slate-500 mt-1">
                            Eventos extraídos de e-mails. Revise, edite se preciso e confirme para publicar.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => carregar()}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-60 transition-colors cursor-pointer shrink-0"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                        <span>Atualizar</span>
                    </button>
                </div>

                {(publicados > 0 || excluidos > 0) && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                            {publicados} publicado(s) · {excluidos} excluído(s) nesta sessão
                        </span>
                    </div>
                )}

                {loading && items.length === 0 ? (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-xs text-slate-500 shadow-xs">
                        Carregando pendentes...
                    </div>
                ) : error ? (
                    <div className="bg-white border border-rose-200 rounded-2xl p-12 text-center text-xs text-rose-700 shadow-xs">
                        {error}
                    </div>
                ) : items.length === 0 ? (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-xs">
                        <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <h2 className="text-base font-bold text-slate-800 mb-1">Nenhum evento pendente</h2>
                        <p className="text-xs text-slate-500">Tudo validado por aqui.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-xs font-semibold text-slate-500">
                            {items.length} pendente{items.length !== 1 ? "s" : ""}
                        </p>
                        {items.map((item, idx) => (
                            <PendenteCard
                                key={item.pend.id}
                                item={item}
                                defaultOpen={idx === 0}
                                onDone={onDone}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AdminShell>
    );
}