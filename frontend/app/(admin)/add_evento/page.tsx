"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { ToastContainer, useToast } from "@/components/toast";
import {
    PlusCircle,
    ListFilter,
    Edit3,
    Trash2,
    CheckCircle2,
    Calendar,
    Clock,
    MapPin,
    Radio,
    Link2,
    Star,
    Megaphone,
    Eye,
    Building2,
    Check,
    FileText,
    Tag as TagIcon
} from "lucide-react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

// NOTA: o endpoint de atualização (PUT /update_evento/:id) é uma suposição.
// Ajuste para a rota real do seu backend.
const API_URL = "http://localhost:8000";
const ID_ADM = "adm_001";

const TIPOS = ["EVENTO", "AVISO", "PALESTRA", "NOTÍCIA"];
const AREAS = ["MAC", "MAE", "MAT", "LIC", "MAP"];
const CATEGORIAS = ["Curso", "Vagas", "Projeto", "Bolsa"];
const PUBLICOS = ["Graduação", "Pós-Graduação", "Docentes", "Técnicos"];

type ColorSet = { accent: string; bg: string; border: string };
const DEFAULT_COLOR: ColorSet = { accent: "#1e40af", bg: "#eff6ff", border: "#bfdbfe" };

const TIPO_CONFIG: Record<string, ColorSet> = {
    EVENTO: { accent: "#1e40af", bg: "#eff6ff", border: "#bfdbfe" },
    AVISO: { accent: "#b91c1c", bg: "#fef2f2", border: "#fecaca" },
    PALESTRA: { accent: "#047857", bg: "#ecfdf5", border: "#a7f3d0" },
    NOTÍCIA: { accent: "#b45309", bg: "#fffbeb", border: "#fde68a" },
};

const AREA_COLORS: Record<string, ColorSet> = {
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
    "Graduação": { accent: "#1e40af", bg: "#eff6ff", border: "#bfdbfe" },
    "Pós-Graduação": { accent: "#6d28d9", bg: "#f5f3ff", border: "#ddd6fe" },
    "Docentes": { accent: "#0e7490", bg: "#ecfeff", border: "#a5f3fc" },
    "Técnicos": { accent: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
};

// ─── TYPES ────────────────────────────────────────────────────────────────────

const initialForm = {
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
    categoria: "",
    publicos: [] as string[],
};

type FormState = typeof initialForm;
type Evento = FormState & { id: number };
type SetField = <K extends keyof FormState>(key: K, value: FormState[K]) => void;
type Tab = "novo" | "lista" | "editar";

const mockEvents: Evento[] = [
    { id: 1, tipo: "EVENTO", titulo: "Semana Acadêmica de Tecnologia", dataInicio: "2025-05-05", dataFim: "2025-06-05", horaInicio: "08:00", horaFim: "18:00", local: "Auditório Principal — Bloco A", fonte: "Coord. de TI", link: "https://exemplo.edu.br/semana-tec", destaque: true, ticker: false, textoTicker: "", subtitulo: "Palestras, workshops e networking", areas: ["MAC", "MAT"], categoria: "Curso", publicos: ["Graduação", "Pós-Graduação"] },
    { id: 2, tipo: "AVISO", titulo: "Rematrícula — 1º Semestre 2026", dataInicio: "2025-05-10", dataFim: "2025-05-10", horaInicio: "", horaFim: "", local: "Portal do Aluno", fonte: "Secretaria Acadêmica", link: "https://exemplo.edu.br/rematricula", destaque: true, ticker: true, textoTicker: "Rematrícula aberta até 20/05 — acesse o Portal do Aluno", subtitulo: "Disponível 24 horas", areas: ["LIC", "MAE"], categoria: "Curso", publicos: ["Graduação"] },
    { id: 3, tipo: "PALESTRA", titulo: "IA na Saúde", dataInicio: "2025-05-12", dataFim: "2025-05-12", horaInicio: "19:00", horaFim: "21:00", local: "Sala de Conferências — Bloco C", fonte: "Dep. Ciências da Saúde", link: "https://exemplo.edu.br/ia-saude", destaque: false, ticker: false, textoTicker: "", subtitulo: "Modelos preditivos e diagnósticos", areas: ["MAP"], categoria: "Projeto", publicos: ["Pós-Graduação", "Docentes"] },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const formatDate = (d: string) =>
    new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

const isDateRangeInvalid = (f: FormState) => !!f.dataInicio && !!f.dataFim && f.dataFim < f.dataInicio;

const isFormInvalid = (f: FormState) =>
    !f.titulo.trim() || !f.dataInicio || !f.fonte.trim() || isDateRangeInvalid(f);

const inputClass =
    "w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900 transition-all placeholder:text-slate-400";

const sectionClass = "bg-white border border-slate-200/80 rounded-xl p-5 md:p-6 space-y-4 shadow-xs";
const sectionTitleClass =
    "text-xs font-bold text-blue-900 tracking-wider uppercase border-b border-slate-100 pb-3 flex items-center gap-2";

// ─── SUB-COMPONENTS (todos no nível do módulo, para não remontar a cada render) ─

const Badge = ({ tipo }: { tipo: string }) => {
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

// Grupo de chips: multi ou single, conforme `multiple`
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

const ChipGroupSingle = ({
    options, selected, onSelect, colorMap,
}: {
    options: string[];
    selected: string;
    onSelect: (v: string) => void;
    colorMap: Record<string, ColorSet>;
}) => (
    <ChipGroup
        options={options}
        selected={selected ? [selected] : []}
        onToggle={v => onSelect(v === selected ? "" : v)}
        colorMap={colorMap}
    />
);

const SmallTag = ({ label, color, bg }: { label: string; color: string; bg: string }) => (
    <span className="px-2 py-0.5 rounded text-[10px] font-bold border" style={{ backgroundColor: bg, color, borderColor: `${color}33` }}>
        {label}
    </span>
);

const Tags = ({ ev }: { ev: Pick<FormState, "areas" | "categoria" | "publicos"> }) => (
    <>
        {ev.areas?.map(a => (
            <SmallTag key={a} label={a} color={AREA_COLORS[a]?.accent || DEFAULT_COLOR.accent} bg={AREA_COLORS[a]?.bg || DEFAULT_COLOR.bg} />
        ))}
        {ev.categoria && (
            <SmallTag label={ev.categoria} color={CATEGORIA_COLORS[ev.categoria]?.accent || DEFAULT_COLOR.accent} bg={CATEGORIA_COLORS[ev.categoria]?.bg || DEFAULT_COLOR.bg} />
        )}
        {ev.publicos?.map(p => (
            <SmallTag key={p} label={p} color={PUBLICO_COLORS[p]?.accent || DEFAULT_COLOR.accent} bg={PUBLICO_COLORS[p]?.bg || DEFAULT_COLOR.bg} />
        ))}
    </>
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
    const toggleArea = (a: string) =>
        set("areas", form.areas.includes(a) ? form.areas.filter(x => x !== a) : [...form.areas, a]);
    const togglePublico = (p: string) =>
        set("publicos", form.publicos.includes(p) ? form.publicos.filter(x => x !== p) : [...form.publicos, p]);

    return (
        <div className={sectionClass}>
            <div className={sectionTitleClass}>
                <TagIcon className="w-4 h-4 text-blue-900" />
                <span>Classificação Acadêmica</span>
            </div>

            <Field label="Área Institucional" hint="selecione uma ou mais">
                <ChipGroup options={AREAS} selected={form.areas} onToggle={toggleArea} colorMap={AREA_COLORS} />
                {form.areas.length === 0 && (
                    <p className="text-[11px] text-slate-400 mt-1">Nenhuma área selecionada</p>
                )}
            </Field>

            <Field label="Categoria" hint="selecione uma">
                <ChipGroupSingle
                    options={CATEGORIAS}
                    selected={form.categoria}
                    onSelect={v => set("categoria", v)}
                    colorMap={CATEGORIA_COLORS}
                />
            </Field>

            <Field label="Público-Alvo" hint="selecione um ou mais">
                <ChipGroup options={PUBLICOS} selected={form.publicos} onToggle={togglePublico} colorMap={PUBLICO_COLORS} />
                {form.publicos.length === 0 && (
                    <p className="text-[11px] text-slate-400 mt-1">Nenhum público selecionado</p>
                )}
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

// Corpo completo do formulário, compartilhado entre "novo" e "editar"
function FormBody({ form, set }: FormProps) {
    return (
        <>
            <FormIdentificacao form={form} set={set} />
            <ClassificacaoSection form={form} set={set} />
            <FormDataLocal form={form} set={set} />
            <FormOrigemLink form={form} set={set} />
            <FormExibicao form={form} set={set} />
            <FormPreview form={form} />
        </>
    );
}

// ─── MAIN ADMIN COMPONENT ─────────────────────────────────────────────────────

export default function Admin() {
    const [tab, setTab] = useState<Tab>("novo");
    const [form, setForm] = useState<FormState>(initialForm);
    const [events, setEvents] = useState<Evento[]>(mockEvents);
    const [saved, setSaved] = useState(false);
    const [updated, setUpdated] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const { toasts, addToast, removeToast } = useToast();

    const set: SetField = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const formIsInvalid = isFormInvalid(form);

    // Envia ao backend e retorna true se deu certo
    async function sendToApi(method: "POST" | "PUT", path: string, body: unknown, successMsg: string): Promise<boolean> {
        try {
            const res = await fetch(`${API_URL}${path}`, {
                method,
                credentials: "include",

                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                addToast("Erro ao enviar formulário.", "error");
                return false;
            }
            addToast(successMsg, "success");
            return true;
        } catch (error) {
            console.error("Error submitting form:", error);
            addToast("Erro ao enviar formulário.", "error");
            return false;
        }
    }

    const handleSave = async () => {
        if (formIsInvalid || submitting) return;
        setSubmitting(true);
        const ok = await sendToApi("POST", "/add_evento", { ...form, id_adm: ID_ADM }, "Evento salvo com sucesso!");
        setSubmitting(false);
        if (!ok) return; // mantém o formulário preenchido para tentar de novo

        setEvents(e => [{ ...form, id: Date.now() }, ...e]);
        setForm(initialForm);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        setTab("lista");
    };

    const handleEdit = (ev: Evento) => {
        const { id, ...rest } = ev;
        setForm({ ...initialForm, ...rest });
        setEditingId(id);
        setTab("editar");
    };

    const handleUpdate = async () => {
        if (formIsInvalid || submitting || editingId === null) return;
        setSubmitting(true);
        const ok = await sendToApi(
            "PUT",
            `/update_evento/${editingId}`,
            { ...form, id_adm: ID_ADM },
            "Publicação atualizada com sucesso!"
        );
        setSubmitting(false);
        if (!ok) return;

        setEvents(e => e.map(ev => (ev.id === editingId ? { ...form, id: editingId } : ev)));
        setForm(initialForm);
        setEditingId(null);
        setUpdated(true);
        setTimeout(() => setUpdated(false), 3000);
        setTab("lista");
    };

    const handleCancelEdit = () => {
        setForm(initialForm);
        setEditingId(null);
        setTab("lista");
    };

    const handleDelete = (id: number) => {
        setEvents(e => e.filter(ev => ev.id !== id));
        setDeleteId(null);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
            <Header />
            <ToastContainer toasts={toasts} removeToast={removeToast} />

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

                    {/* ADMIN TABS CONTROL */}
                    <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 text-xs font-semibold">
                        <button
                            onClick={() => { setTab("novo"); setForm(initialForm); setEditingId(null); }}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${tab === "novo"
                                ? "bg-white text-blue-900 shadow-xs"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                                }`}
                        >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Nova Publicação</span>
                        </button>

                        <button
                            onClick={() => { setTab("lista"); setForm(initialForm); setEditingId(null); }}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${tab === "lista"
                                ? "bg-white text-blue-900 shadow-xs"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                                }`}
                        >
                            <ListFilter className="w-3.5 h-3.5" />
                            <span>Gerenciar ({events.length})</span>
                        </button>

                        {tab === "editar" && (
                            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 shadow-xs font-bold">
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Editando</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <main className="max-w-5xl w-full mx-auto px-4 md:px-8 py-8 flex-1">

                {saved && (
                    <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Publicação salva com sucesso e integrada aos canais de comunicação!</span>
                    </div>
                )}

                {updated && (
                    <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center gap-3 text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Publicação atualizada com sucesso!</span>
                    </div>
                )}

                {/* ── MODO EDITAR ── */}
                {tab === "editar" && (
                    <div className="space-y-6">
                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <Edit3 className="w-5 h-5 text-amber-700 shrink-0" />
                                <div>
                                    <h2 className="text-xs font-bold text-amber-900">Modo de Edição Ativo</h2>
                                    <p className="text-xs text-amber-800">Editando: <strong>{form.titulo}</strong></p>
                                </div>
                            </div>
                            <button
                                onClick={handleCancelEdit}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 transition-colors shrink-0"
                            >
                                Cancelar Edição
                            </button>
                        </div>

                        <FormBody form={form} set={set} />

                        <div className="flex items-center justify-end gap-3 pt-4">
                            <button
                                onClick={handleCancelEdit}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpdate}
                                disabled={formIsInvalid || submitting}
                                className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? "Salvando..." : "Salvar Alterações"}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── MODO NOVO ── */}
                {tab === "novo" && (
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
                                onClick={() => setForm(initialForm)}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
                            >
                                Limpar Campos
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={formIsInvalid || submitting}
                                className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? "Publicando..." : "Publicar no Portal"}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── MODO LISTA DE GESTÃO ── */}
                {tab === "lista" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Publicações Ativas</h2>
                                <p className="text-xs text-slate-500">
                                    {events.length} item(ns) cadastrados no painel institucional.
                                </p>
                            </div>
                        </div>

                        {events.length === 0 && (
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
                                                    <span>{ev.horaInicio}</span>
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
                                        <button
                                            onClick={() => handleEdit(ev)}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200/80 transition-colors w-full justify-center"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                            <span>Editar</span>
                                        </button>

                                        {deleteId === ev.id ? (
                                            <div className="flex items-center gap-1 w-full">
                                                <button
                                                    onClick={() => handleDelete(ev.id)}
                                                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors flex-1"
                                                >
                                                    Confirmar
                                                </button>
                                                <button
                                                    onClick={() => setDeleteId(null)}
                                                    className="px-2 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
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
                )}
            </main>
        </div>
    );
}