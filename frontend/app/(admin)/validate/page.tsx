"use client";

// src/app/(admin)/validate/page.tsx  →  URL: /validate
// Lista os eventos pendentes (extraídos de e-mails pelo Gemini via n8n), deixa
// revisar/editar cada um com o mesmo formulário do admin e, ao confirmar:
//   1) POST   /add_evento
//   2) DELETE /n8n_remove_event/{id do pendente}   (automático)
// "Excluir" vai direto ao DELETE. Qualquer falha é tratada como erro.
//
// dados_brutos chega como { evento, messageId, sugestoes }. Formato antigo
// (o próprio evento direto em dados_brutos) continua suportado.

import { useCallback, useEffect, useRef, useState } from "react";
import {
    AlertTriangle,
    Check,
    CheckCircle2,
    ChevronDown,
    Copy,
    Inbox,
    Loader2,
    RefreshCw,
    Sparkles,
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
    sugestoes: EventoBruto | null; // sugestões de campos geradas pela IA (só leitura)
};

const isRecord = (v: unknown): v is EventoBruto =>
    !!v && typeof v === "object" && !Array.isArray(v);

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
function pickAllowed(
    values: unknown,
    allowed: string[],
    campo: string,
    avisos: string[]
): string[] {
    const arr = Array.isArray(values)
        ? values.filter((x): x is string => typeof x === "string")
        : [];

    const todosLabel =
        campo === "areas"
            ? "Todas as áreas"
            : campo === "publicos"
                ? "Todos os públicos"
                : null;

    // Compatibilidade com dados antigos do n8n que usam "todos".
    const temTodos = arr.some(
        v => v.trim().toLowerCase() === "todos" ||
            (todosLabel !== null &&
                v.trim().toLowerCase() === todosLabel.toLowerCase())
    );

    if (temTodos && todosLabel) {
        return [todosLabel];
    }

    const ok: string[] = [];
    const descartados: string[] = [];

    for (const v of arr) {
        const canon = allowed.find(
            a => a.toLowerCase() === v.trim().toLowerCase()
        );

        if (canon) {
            if (!ok.includes(canon)) ok.push(canon);
        } else {
            descartados.push(v);
        }
    }

    if (descartados.length) {
        avisos.push(
            `${campo}: ${descartados.map(d => `"${d}"`).join(", ")} não existe(m) na lista e foi/foram removido(s).`
        );
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
    const raw: unknown = p.dados_brutos;

    if (!isRecord(raw)) return null;

    // Formato novo: { evento, messageId, sugestoes }. Formato antigo: o próprio evento.
    const evento = isRecord(raw.evento) ? raw.evento : raw;
    const sugestoes = isRecord(raw.sugestoes) ? raw.sugestoes : null;

    const { form, avisos } = fromBruto(evento);

    return { pend: p, initial: form, avisos, sugestoes };
}


// ─── SUGESTÕES (campo a campo, com cópia rápida) ──────────────────────────────

const CAMPOS_SUGESTAO: { key: keyof FormState; label: string }[] = [
    { key: "titulo", label: "Título" },
    { key: "subtitulo", label: "Subtítulo" },
    { key: "tipo", label: "Tipo" },
    { key: "dataInicio", label: "Data início" },
    { key: "dataFim", label: "Data fim" },
    { key: "horaInicio", label: "Horário início" },
    { key: "horaFim", label: "Horário fim" },
    { key: "local", label: "Local" },
    { key: "fonte", label: "Fonte" },
    { key: "link", label: "Link" },
    { key: "tags", label: "Tags" },
    { key: "areas", label: "Áreas" },
    { key: "categorias", label: "Categorias" },
    { key: "publicos", label: "Públicos" },
    { key: "destaque", label: "Destaque" },
    { key: "ticker", label: "Ticker" },
    { key: "textoTicker", label: "Texto do ticker" },
];

// Texto que será exibido/copiado. Vazio = campo sem sugestão (não aparece).
// Arrays viram "a, b, c": colado no campo de tags, adiciona todas de uma vez.
function sugestaoTexto(v: unknown): string {
    if (Array.isArray(v)) {
        return v.filter((x): x is string => typeof x === "string" && !!x.trim()).join(", ");
    }
    if (typeof v === "boolean") return v ? "Sim" : "";
    return clean(v);
}

const normCompare = (v: unknown): string => {
    if (Array.isArray(v)) return v.map(x => String(x).trim().toLowerCase()).sort().join("|");
    if (typeof v === "boolean") return v ? "sim" : "";
    return String(v ?? "").trim().toLowerCase();
};

function CopyButton({ text, label }: { text: string; label: string }) {
    const [copied, setCopied] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            // fallback para contextos sem Clipboard API (http, navegadores antigos)
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
        }
        setCopied(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), 1500);
    };

    return (
        <button
            type="button"
            onClick={copy}
            aria-label={`Copiar ${label}`}
            title={`Copiar ${label}`}
            className={`inline-flex items-center gap-1 shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${copied
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                }`}
        >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copiado" : "Copiar"}</span>
        </button>
    );
}

function SugestoesPanel({ sugestoes, form }: { sugestoes: EventoBruto; form: FormState }) {
    const [open, setOpen] = useState(true);

    const linhas = CAMPOS_SUGESTAO
        .map(({ key, label }) => ({ key, label, texto: sugestaoTexto(sugestoes[key]) }))
        .filter(l => l.texto);

    if (linhas.length === 0) return null;

    return (
        <div className="rounded-xl border border-violet-200 bg-violet-50/60 overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                aria-expanded={open}
                className="w-full flex items-center gap-2 px-3.5 py-3 text-left cursor-pointer hover:bg-violet-50 transition-colors"
            >
                <Sparkles className="w-4 h-4 text-violet-700" />
                <span className="flex-1 text-[11px] font-bold text-violet-800 uppercase tracking-wider">
                    Sugestões da IA ({linhas.length} campo{linhas.length !== 1 ? "s" : ""})
                </span>
                <ChevronDown className={`w-4 h-4 text-violet-500 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <ul className="divide-y divide-violet-100 border-t border-violet-100 bg-white">
                    {linhas.map(({ key, label, texto }) => {
                        const igual = normCompare(form[key]) === normCompare(sugestoes[key]);
                        return (
                            <li key={key} className="flex items-start gap-3 px-3.5 py-2.5">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            {label}
                                        </span>
                                        {igual && (
                                            <span className="text-[10px] font-semibold text-slate-400">
                                                · já igual ao formulário
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs font-medium text-slate-800 break-words">
                                        {texto}
                                    </div>
                                </div>
                                <CopyButton text={texto} label={label} />
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
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
    const { pend, initial, avisos, sugestoes } = item;
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
                        {sugestoes && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">
                                <Sparkles className="w-3 h-3" />
                                <span>SUGESTÕES</span>
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

                    {/* SUGESTÕES DA IA (fora do fieldset: copiar continua funcionando após o POST) */}
                    {sugestoes && <SugestoesPanel sugestoes={sugestoes} form={form} />}

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