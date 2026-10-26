"use client";

// src/components/admin/event-form.tsx
// Tudo que é comum a "adicionar" e "editar": constantes, tipos, conversões
// formulário <-> Event do backend, seções do formulário e preview.

import { useState } from "react";
import {
    Calendar,
    CheckCircle2,
    Check,
    Clock,
    Eye,
    FileText,
    Hash,
    Link2,
    MapPin,
    Radio,
    Star,
    Tag as TagIcon,
    X,
} from "lucide-react";
import type { EventPayload, EventoApi } from "@/app/lib/eventos-api";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────


export const TIPOS = ["EVENTO", "AVISO", "PALESTRA", "NOTÍCIA"];
export const AREAS = ["Todas as áreas", "MAC", "MAE", "MAT", "LIC", "MAP"];
export const CATEGORIAS = ["Curso", "Vagas", "Projeto", "Bolsa"];
export const PUBLICOS = [
    "Todos os públicos",
    "Graduação",
    "Pós-Graduação",
    "Docentes",
    "Técnicos",
];

export const MAX_TAGS = 10;
export const MAX_TAG_LENGTH = 30;

type ColorSet = { accent: string; bg: string; border: string };

const DEFAULT_COLOR: ColorSet = {
    accent: "#1e40af",
    bg: "#eff6ff",
    border: "#bfdbfe",
};

const TIPO_CONFIG: Record<string, ColorSet> = {
    EVENTO: { accent: "#1e40af", bg: "#eff6ff", border: "#bfdbfe" },
    AVISO: { accent: "#b91c1c", bg: "#fef2f2", border: "#fecaca" },
    PALESTRA: { accent: "#047857", bg: "#ecfdf5", border: "#a7f3d0" },
    NOTÍCIA: { accent: "#b45309", bg: "#fffbeb", border: "#fde68a" },
};

const AREA_COLORS: Record<string, ColorSet> = {
    "Todas as áreas": { accent: "#334155", bg: "#f1f5f9", border: "#cbd5e1" },
    MAC: { accent: "#6d28d9", bg: "#f5f3ff", border: "#ddd6fe" },
    MAE: { accent: "#047857", bg: "#ecfdf5", border: "#a7f3d0" },
    MAT: { accent: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
    LIC: { accent: "#c2410c", bg: "#fff7ed", border: "#ffedd5" },
    MAP: { accent: "#be185d", bg: "#fdf2f8", border: "#fbcfe8" },
};

const CATEGORIA_COLORS: Record<string, ColorSet> = {
    Curso: { accent: "#0284c7", bg: "#f0f9ff", border: "#bae6fd" },
    Vagas: { accent: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
    Projeto: { accent: "#7e22ce", bg: "#faf5ff", border: "#e9d5ff" },
    Bolsa: { accent: "#b45309", bg: "#fffbeb", border: "#fde68a" },
};

const PUBLICO_COLORS: Record<string, ColorSet> = {
    "Todos os públicos": { accent: "#334155", bg: "#f1f5f9", border: "#cbd5e1" },
    "Graduação": { accent: "#1e40af", bg: "#eff6ff", border: "#bfdbfe" },
    "Pós-Graduação": { accent: "#6d28d9", bg: "#f5f3ff", border: "#ddd6fe" },
    "Docentes": { accent: "#0e7490", bg: "#ecfeff", border: "#a5f3fc" },
    "Técnicos": { accent: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
};
// ─── FORM STATE ───────────────────────────────────────────────────────────────

export const initialForm = {
    tipo: "EVENTO",
    titulo: "",
    subtitulo: "",
    dataInicio: "",
    dataFim: "",
    horaInicio: "",
    horaFim: "",
    local: "",
    fonte: "",
    link: "",
    destaque: false,
    ticker: false,
    textoTicker: "",
    areas: [] as string[],
    categorias: [] as string[],
    publicos: [] as string[],
    tags: [] as string[],
};

export type FormState = typeof initialForm;
export type SetField = <K extends keyof FormState>(key: K, value: FormState[K]) => void;

export function useEventForm(initial: FormState = initialForm) {
    const [form, setForm] = useState<FormState>(initial);
    const set: SetField = (k, v) => setForm(f => ({ ...f, [k]: v }));
    return {
        form,
        setForm,
        set,
        reset: () => setForm(initialForm),
        isInvalid: isFormInvalid(form),
    };
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export const formatDate = (d: string) =>
    new Date(d.slice(0, 10) + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

const isDateRangeInvalid = (f: FormState) => !!f.dataInicio && !!f.dataFim && f.dataFim < f.dataInicio;

export const isFormInvalid = (f: FormState) =>
    !f.titulo.trim() || !f.dataInicio || !f.fonte.trim() || isDateRangeInvalid(f);

const nullIfEmpty = (s: string) => (s.trim() ? s.trim() : null);
const trimTime = (s?: string | null) => (s ? s.slice(0, 5) : "");

// "todos" é exclusivo: se vier junto com outras opções, fica só ele
const normalizeAreas = (arr: string[] = []) =>
    arr.includes("Todas as áreas") ? ["Todas as áreas"] : arr;

const normalizePublicos = (arr: string[] = []) =>
    arr.includes("Todos os públicos") ? ["Todos os públicos"] : arr;

// Formulário -> model `Event` do backend
export const toPayload = (f: FormState): EventPayload => ({
    tipo: f.tipo,
    titulo: f.titulo.trim(),
    subtitulo: nullIfEmpty(f.subtitulo),
    dataInicio: f.dataInicio,
    dataFim: nullIfEmpty(f.dataFim),
    horaInicio: nullIfEmpty(f.horaInicio),
    horaFim: nullIfEmpty(f.horaFim),
    local: nullIfEmpty(f.local),
    fonte: f.fonte.trim(),
    link: nullIfEmpty(f.link),
    destaque: f.destaque,
    ticker: f.ticker,
    textoTicker: f.ticker ? nullIfEmpty(f.textoTicker) : null,
    tags: f.tags,
    publicos: normalizePublicos(f.publicos),
    areas: normalizeAreas(f.areas),
    categorias: f.categorias,
});

// Event do backend -> estado do formulário (null vira "")
export const fromEvento = (e: EventoApi): FormState => ({
    tipo: e.tipo,
    titulo: e.titulo,
    subtitulo: e.subtitulo ?? "",
    dataInicio: e.dataInicio.slice(0, 10),
    dataFim: e.dataFim ? e.dataFim.slice(0, 10) : "",
    horaInicio: trimTime(e.horaInicio),
    horaFim: trimTime(e.horaFim),
    local: e.local ?? "",
    fonte: e.fonte,
    link: e.link ?? "",
    destaque: e.destaque,
    ticker: e.ticker,
    textoTicker: e.textoTicker ?? "",
    areas: normalizeAreas(e.areas ?? []),
    categorias: e.categorias ?? [],
    publicos: normalizePublicos(e.publicos ?? []),
    tags: e.tags ?? [],
});

const inputClass =
    "w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900 transition-all placeholder:text-slate-400";

const sectionClass = "bg-white border border-slate-200/80 rounded-xl p-5 md:p-6 space-y-4 shadow-xs";
const sectionTitleClass =
    "text-xs font-bold text-blue-900 tracking-wider uppercase border-b border-slate-100 pb-3 flex items-center gap-2";

// ─── SMALL COMPONENTS (também usados pela lista de gestão) ────────────────────

export const Badge = ({ tipo }: { tipo: string }) => {
    const config = TIPO_CONFIG[tipo] || DEFAULT_COLOR;
    return (
        <span
            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider"
            style={{ backgroundColor: config.bg, color: config.accent, borderColor: config.border }}
        >
            {tipo}
        </span>
    );
};

const SmallTag = ({ label, color, bg }: { label: string; color: string; bg: string }) => (
    <span className="px-2 py-0.5 rounded text-[10px] font-bold border" style={{ backgroundColor: bg, color, borderColor: `${color}33` }}>
        {label}
    </span>
);

export const Tags = ({ ev }: { ev: Pick<FormState, "areas" | "categorias" | "publicos"> }) => (
    <>
        {ev.areas?.map(a => (
            <SmallTag key={a} label={a} color={AREA_COLORS[a]?.accent || DEFAULT_COLOR.accent} bg={AREA_COLORS[a]?.bg || DEFAULT_COLOR.bg} />
        ))}
        {ev.categorias?.map(c => (
            <SmallTag key={c} label={c} color={CATEGORIA_COLORS[c]?.accent || DEFAULT_COLOR.accent} bg={CATEGORIA_COLORS[c]?.bg || DEFAULT_COLOR.bg} />
        ))}
        {ev.publicos?.map(p => (
            <SmallTag key={p} label={p} color={PUBLICO_COLORS[p]?.accent || DEFAULT_COLOR.accent} bg={PUBLICO_COLORS[p]?.bg || DEFAULT_COLOR.bg} />
        ))}
    </>
);

const Field = ({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <span>{label}</span>
            {required && <span className="text-rose-600 font-bold">*</span>}
            {hint && <span className="text-[11px] text-slate-400 font-normal ml-1">— {hint}</span>}
        </label>
        {children}
    </div>
);

const Toggle = ({ label, checked, onChange, desc }: { label: string; checked: boolean; onChange: (checked: boolean) => void; desc: string }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-full text-left flex items-start gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer ${checked
            ? "bg-blue-50/70 border-blue-200"
            : "bg-slate-50 border-slate-200/80 hover:bg-slate-100/60"
            }`}
    >
        <div className={`w-9 h-5 rounded-full relative transition-colors shrink-0 mt-0.5 ${checked ? "bg-blue-900" : "bg-slate-300"}`}>
            <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-all shadow-xs ${checked ? "left-4.75" : "left-0.75"}`} />
        </div>
        <div>
            <div className="text-xs font-bold text-slate-900">{label}</div>
            {desc && <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{desc}</div>}
        </div>
    </button>
);

const ChipGroup = ({
    options, selected, onToggle, colorMap,
}: {
    options: string[];
    selected: string[];
    onToggle: (v: string) => void;
    colorMap: Record<string, ColorSet>;
}) => (
    <div className="flex items-center gap-2 flex-wrap">
        {options.map(opt => {
            const active = selected.includes(opt);
            const c = colorMap[opt] || DEFAULT_COLOR;
            return (
                <button
                    key={opt}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onToggle(opt)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none ${active
                        ? "shadow-xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    style={active ? { backgroundColor: c.bg, color: c.accent, borderColor: c.border } : {}}
                >
                    {active && <Check className="w-3.5 h-3.5" />}
                    <span>{opt}</span>
                </button>
            );
        })}
    </div>
);

// ─── FORM SECTIONS ────────────────────────────────────────────────────────────

type FormProps = { form: FormState; set: SetField };

function FormIdentificacao({ form, set }: FormProps) {
    return (
        <div className={sectionClass}>
            <div className={sectionTitleClass}>
                <FileText className="w-4 h-4 text-blue-900" />
                <span>Identificação da Publicação</span>
            </div>

            <Field label="Tipo de Publicação" required>
                <div className="flex items-center gap-2 flex-wrap">
                    {TIPOS.map(t => {
                        const active = form.tipo === t;
                        const config = TIPO_CONFIG[t];
                        return (
                            <button
                                key={t}
                                type="button"
                                onClick={() => set("tipo", t)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${active
                                    ? "shadow-xs"
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                    }`}
                                style={active ? { backgroundColor: config.bg, color: config.accent, borderColor: config.border } : {}}
                            >
                                {t}
                            </button>
                        );
                    })}
                </div>
            </Field>

            <Field label="Título" required>
                <input
                    type="text"
                    placeholder="Ex: Semana Acadêmica de Tecnologia"
                    value={form.titulo}
                    onChange={e => set("titulo", e.target.value)}
                    className={inputClass}
                />
            </Field>

            <Field label="Subtítulo / Descrição Breve" hint="aparece abaixo do título no portal público">
                <textarea
                    placeholder="Descreva a publicação em poucas frases para a lista principal..."
                    value={form.subtitulo}
                    onChange={e => set("subtitulo", e.target.value)}
                    className="w-full min-h-20 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900 transition-all placeholder:text-slate-400 resize-y"
                />
            </Field>
        </div>
    );
}

function ClassificacaoSection({ form, set }: FormProps) {
    const toggle = (
        key: "areas" | "categorias" | "publicos",
        value: string
    ) => {
        const atual = form[key];

        // Categorias continuam permitindo múltiplas seleções.
        if (key === "categorias") {
            set(
                key,
                atual.includes(value)
                    ? atual.filter(x => x !== value)
                    : [...atual, value]
            );
            return;
        }

        const todos = key === "areas"
            ? "Todas as áreas"
            : "Todos os públicos";

        // Desmarcar a opção selecionada.
        if (atual.includes(value)) {
            set(key, atual.filter(x => x !== value));
            return;
        }

        // A opção abrangente é exclusiva.
        if (value === todos) {
            set(key, [todos]);
            return;
        }

        // Selecionar uma opção específica remove a opção abrangente.
        set(key, [...atual.filter(x => x !== todos), value]);
    };

    return (
        <div className={sectionClass}>
            <div className={sectionTitleClass}>
                <TagIcon className="w-4 h-4 text-blue-900" />
                <span>Classificação Acadêmica</span>
            </div>

            <Field label="Área Institucional" hint="selecione uma ou mais">
                <ChipGroup options={AREAS} selected={form.areas} onToggle={v => toggle("areas", v)} colorMap={AREA_COLORS} />
                {form.areas.length === 0 && (
                    <p className="text-[11px] text-slate-400 mt-1">Nenhuma área selecionada</p>
                )}
            </Field>

            <Field label="Categoria" hint="selecione uma ou mais">
                <ChipGroup options={CATEGORIAS} selected={form.categorias} onToggle={v => toggle("categorias", v)} colorMap={CATEGORIA_COLORS} />
                {form.categorias.length === 0 && (
                    <p className="text-[11px] text-slate-400 mt-1">Nenhuma categoria selecionada</p>
                )}
            </Field>

            <Field label="Público-Alvo" hint="selecione um ou mais">
                <ChipGroup options={PUBLICOS} selected={form.publicos} onToggle={v => toggle("publicos", v)} colorMap={PUBLICO_COLORS} />
                {form.publicos.length === 0 && (
                    <p className="text-[11px] text-slate-400 mt-1">Nenhum público selecionado</p>
                )}
            </Field>
        </div>
    );
}

function FormTags({ form, set }: FormProps) {
    const [draft, setDraft] = useState("");

    const addTags = (raw: string) => {
        const novas = raw
            .split(",")
            .map(t => t.trim().slice(0, MAX_TAG_LENGTH))
            .filter(Boolean);

        if (novas.length === 0) return;

        const existentes = new Set(form.tags.map(t => t.toLowerCase()));
        const resultado = [...form.tags];

        for (const t of novas) {
            if (resultado.length >= MAX_TAGS) break;
            if (existentes.has(t.toLowerCase())) continue;
            existentes.add(t.toLowerCase());
            resultado.push(t);
        }

        set("tags", resultado);
    };

    const removeTag = (tag: string) => set("tags", form.tags.filter(t => t !== tag));

    const commitDraft = () => {
        addTags(draft);
        setDraft("");
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commitDraft();
        } else if (e.key === "Backspace" && !draft && form.tags.length > 0) {
            removeTag(form.tags[form.tags.length - 1]);
        }
    };

    const limiteAtingido = form.tags.length >= MAX_TAGS;

    return (
        <div className={sectionClass}>
            <div className={sectionTitleClass}>
                <Hash className="w-4 h-4 text-blue-900" />
                <span>Tags</span>
            </div>

            <Field label="Palavras-chave" hint="Enter ou vírgula para adicionar">
                <input
                    type="text"
                    placeholder={limiteAtingido ? `Limite de ${MAX_TAGS} tags atingido` : "Ex: Quant Finance, Itaú BBA"}
                    value={draft}
                    disabled={limiteAtingido}
                    maxLength={MAX_TAG_LENGTH}
                    onChange={e => {
                        const v = e.target.value;
                        // colar "a, b, c" adiciona tudo de uma vez
                        if (v.includes(",")) {
                            addTags(v);
                            setDraft("");
                        } else {
                            setDraft(v);
                        }
                    }}
                    onKeyDown={onKeyDown}
                    onBlur={commitDraft}
                    className={`${inputClass} disabled:opacity-60 disabled:cursor-not-allowed`}
                />

                {form.tags.length > 0 ? (
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                        {form.tags.map(tag => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-semibold border bg-slate-50 text-slate-700 border-slate-200"
                            >
                                <span>{tag}</span>
                                <button
                                    type="button"
                                    aria-label={`Remover tag ${tag}`}
                                    onClick={() => removeTag(tag)}
                                    className="p-0.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-[11px] text-slate-400 mt-1">Nenhuma tag adicionada</p>
                )}

                <div className="text-[10px] text-slate-400 text-right font-medium">
                    {form.tags.length}/{MAX_TAGS} tags
                </div>
            </Field>
        </div>
    );
}

function FormDataLocal({ form, set }: FormProps) {
    const rangeInvalid = isDateRangeInvalid(form);
    const dateClass = "w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900 transition-all";

    return (
        <div className={sectionClass}>
            <div className={sectionTitleClass}>
                <Calendar className="w-4 h-4 text-blue-900" />
                <span>Data, Horário e Local</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Field label="Data Início" required>
                    <input type="date" value={form.dataInicio} onChange={e => set("dataInicio", e.target.value)} className={dateClass} />
                </Field>

                <Field label="Data Fim" hint="opcional">
                    <input
                        type="date"
                        value={form.dataFim}
                        min={form.dataInicio || undefined}
                        onChange={e => set("dataFim", e.target.value)}
                        className={dateClass}
                    />
                </Field>

                <Field label="Horário Início" hint="opcional">
                    <input type="time" value={form.horaInicio} onChange={e => set("horaInicio", e.target.value)} className={dateClass} />
                </Field>

                <Field label="Horário Fim" hint="opcional">
                    <input type="time" value={form.horaFim} onChange={e => set("horaFim", e.target.value)} className={dateClass} />
                </Field>
            </div>

            {rangeInvalid && (
                <p className="text-[11px] text-rose-600 font-semibold">
                    A data de fim não pode ser anterior à data de início.
                </p>
            )}

            <Field label="Local / Endereço">
                <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Ex: Auditório Principal — Bloco A"
                        value={form.local}
                        onChange={e => set("local", e.target.value)}
                        className={`${inputClass} pl-9`}
                    />
                </div>
            </Field>
        </div>
    );
}

function FormOrigemLink({ form, set }: FormProps) {
    return (
        <div className={sectionClass}>
            <div className={sectionTitleClass}>
                <Radio className="w-4 h-4 text-blue-900" />
                <span>Origem e Link de Acesso</span>
            </div>

            <Field label="Fonte / Departamentos Responsáveis" required hint="departamento autor">
                <input
                    type="text"
                    placeholder="Ex: Coordenação de Tecnologia da Informação"
                    value={form.fonte}
                    onChange={e => set("fonte", e.target.value)}
                    className={inputClass}
                />
            </Field>

            <Field label="Link / URL da Inscrição ou Notícia" hint="utilizado para geração automática de QR Code no Painel TV">
                <div className="relative">
                    <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="https://exemplo.edu.br/evento"
                        value={form.link}
                        onChange={e => set("link", e.target.value)}
                        className={`${inputClass} pl-9`}
                    />
                </div>
                {form.link && (
                    <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5 mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>QR Code será gerado automaticamente para exibições em totens do campus.</span>
                    </p>
                )}
            </Field>
        </div>
    );
}

function FormExibicao({ form, set }: FormProps) {
    return (
        <div className={sectionClass}>
            <div className={sectionTitleClass}>
                <Eye className="w-4 h-4 text-blue-900" />
                <span>Configurações de Exibição</span>
            </div>

            <div className="space-y-3">
                <Toggle
                    label="Exibir em Destaque Principal"
                    desc="Destaca a publicação na área central dos slides de sinalização digital do campus."
                    checked={form.destaque}
                    onChange={v => set("destaque", v)}
                />

                <Toggle
                    label="Incluir no Ticker de Avisos (Rodapé)"
                    desc="Exibe uma mensagem contínua em formato letreiro na faixa inferior do painel."
                    checked={form.ticker}
                    onChange={v => set("ticker", v)}
                />

                {form.ticker && (
                    <Field label="Texto do Ticker de Avisos" hint="mensagem concisa para rolagem no rodapé">
                        <div className="space-y-1">
                            <input
                                type="text"
                                placeholder="Ex: Inscrições abertas até 08/05 — acesse o Portal do Aluno"
                                value={form.textoTicker}
                                onChange={e => set("textoTicker", e.target.value)}
                                maxLength={120}
                                className={inputClass}
                            />
                            <div className="text-[10px] text-slate-400 text-right font-medium">
                                {form.textoTicker.length}/120 caracteres
                            </div>
                        </div>
                    </Field>
                )}
            </div>
        </div>
    );
}

function FormPreview({ form }: { form: FormState }) {
    if (!form.titulo) return null;

    return (
        <div className="bg-blue-50/50 border border-blue-200/80 rounded-xl p-5 space-y-3">
            <div className="text-[11px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>Pré-visualização do Card</span>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-2.5 shadow-xs">
                <div className="flex items-center gap-2 flex-wrap">
                    <Badge tipo={form.tipo} />
                    {form.destaque && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                            <span>DESTAQUE</span>
                        </span>
                    )}
                    <Tags ev={form} />
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{form.titulo}</h3>
                {form.subtitulo && (
                    <p className="text-xs text-slate-600 leading-relaxed">{form.subtitulo}</p>
                )}

                {form.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {form.tags.map(t => (
                            <span key={t} className="text-[10px] font-semibold text-slate-500">#{t}</span>
                        ))}
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100">
                    {form.dataInicio && (
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>
                                {formatDate(form.dataInicio)}
                                {form.dataFim ? ` – ${formatDate(form.dataFim)}` : ""}
                            </span>
                        </span>
                    )}
                    {form.horaInicio && (
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{form.horaInicio}{form.horaFim ? ` – ${form.horaFim}` : ""}</span>
                        </span>
                    )}
                    {form.local && (
                        <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{form.local}</span>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

// Corpo completo do formulário, usado nas páginas de adicionar e editar
export function FormBody({ form, set }: FormProps) {
    return (
        <>
            <FormIdentificacao form={form} set={set} />
            <ClassificacaoSection form={form} set={set} />
            <FormTags form={form} set={set} />
            <FormDataLocal form={form} set={set} />
            <FormOrigemLink form={form} set={set} />
            <FormExibicao form={form} set={set} />
            <FormPreview form={form} />
        </>
    );
}