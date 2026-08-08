"use client";

import { useState } from "react";
import { ToastContainer, useToast } from "@/components/toast";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const TIPOS = ["EVENTO", "AVISO", "PALESTRA", "NOTÍCIA"];
const AREAS = ["MAC", "MAE", "MAT", "LIC", "MAP"];
const CATEGORIAS = ["Curso", "Vagas", "Projeto", "Bolsa"];
const PUBLICOS = ["Graduação", "Pós-Graduação", "Docentes", "Técnicos"];

const CORES = {} as Record<string, string>;
CORES.EVENTO = "#1a3a6b";
CORES.AVISO = "#0e7490";
CORES.PALESTRA = "#065f46";
CORES["NOTÍCIA"] = "#7c3aed";

const AREA_COLORS: Record<string, { accent: string; bg: string; border: string }> = {
    MAC: { accent: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd" },
    MAE: { accent: "#059669", bg: "#ecfdf5", border: "#6ee7b7" },
    MAT: { accent: "#2563eb", bg: "#eff6ff", border: "#93c5fd" },
    LIC: { accent: "#ea580c", bg: "#fff7ed", border: "#fdba74" },
    MAP: { accent: "#db2777", bg: "#fdf2f8", border: "#f9a8d4" },
};

const CATEGORIA_COLORS: Record<string, { accent: string; bg: string; border: string }> = {
    Curso: { accent: "#0284c7", bg: "#f0f9ff", border: "#7dd3fc" },
    Vagas: { accent: "#16a34a", bg: "#f0fdf4", border: "#86efac" },
    Projeto: { accent: "#9333ea", bg: "#faf5ff", border: "#d8b4fe" },
    Bolsa: { accent: "#d97706", bg: "#fffbeb", border: "#fcd34d" },
};

const PUBLICO_COLORS: Record<string, { accent: string; bg: string; border: string }> = {
    "Graduação": { accent: "#1a3a6b", bg: "#eff6ff", border: "#93c5fd" },
    "Pós-Graduação": { accent: "#6d28d9", bg: "#f5f3ff", border: "#c4b5fd" },
    "Docentes": { accent: "#0e7490", bg: "#ecfeff", border: "#67e8f9" },
    "Técnicos": { accent: "#15803d", bg: "#f0fdf4", border: "#86efac" },
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

const mockEvents = [
    { id: 1, tipo: "EVENTO", titulo: "Semana Acadêmica de Tecnologia", dataInicio: "2025-05-05", dataFim: "2025-06-05", horaInicio: "08:00", horaFim: "18:00", local: "Auditório Principal — Bloco A", fonte: "Coord. de TI", link: "https://exemplo.edu.br/semana-tec", destaque: true, ticker: false, textoTicker: "", subtitulo: "Palestras, workshops e networking", areas: ["MAC", "MAT"], categoria: "Curso", publicos: ["Graduação", "Pós-Graduação"] },
    { id: 2, tipo: "AVISO", titulo: "Rematrícula — 1º Semestre 2026", dataInicio: "2025-05-10", dataFim: "2025-05-10", horaInicio: "", horaFim: "", local: "Portal do Aluno", fonte: "Secretaria Acadêmica", link: "https://exemplo.edu.br/rematricula", destaque: true, ticker: true, textoTicker: "Rematrícula aberta até 20/05 — acesse o Portal do Aluno", subtitulo: "Disponível 24 horas", areas: ["LIC", "MAE"], categoria: "Curso", publicos: ["Graduação"] },
    { id: 3, tipo: "PALESTRA", titulo: "IA na Saúde", dataInicio: "2025-05-12", dataFim: "2025-05-12", horaInicio: "19:00", horaFim: "21:00", local: "Sala de Conferências — Bloco C", fonte: "Dep. Ciências da Saúde", link: "https://exemplo.edu.br/ia-saude", destaque: false, ticker: false, textoTicker: "", subtitulo: "Modelos preditivos e diagnósticos", areas: ["MAP"], categoria: "Projeto", publicos: ["Pós-Graduação", "Docentes"] },
];

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

const Badge = ({ tipo }: { tipo: string }) => (
    <span style={{ fontSize: 10, fontWeight: 700, background: CORES[tipo] || "#1a3a6b", color: "#fff", padding: "2px 10px", borderRadius: 20, letterSpacing: 0.5 }}>{tipo}</span>
);

const Field = ({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: 0.5, display: "flex", gap: 4, alignItems: "center" }}>
            {label}
            {required && <span style={{ color: "#e11d48", fontSize: 12 }}>*</span>}
            {hint && <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 400 }}>— {hint}</span>}
        </label>
        {children}
    </div>
);

const inputStyle: React.CSSProperties = {
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 13,
    color: "#0f172a",
    background: "#fff",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
};

const Toggle = ({ label, checked, onChange, desc }: { label: string; checked: boolean; onChange: (checked: boolean) => void; desc: string }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, background: checked ? "#f0f4ff" : "#f8fafc", border: `1px solid ${checked ? "#c7d7f8" : "#e2e8f0"}`, borderRadius: 10, padding: "12px 14px", cursor: "pointer", transition: "all 0.2s" }} onClick={() => onChange(!checked)}>
        <div style={{ width: 40, height: 22, borderRadius: 11, background: checked ? "#1a3a6b" : "#cbd5e1", position: "relative", transition: "all 0.2s", flexShrink: 0, marginTop: 1 }}>
            <div style={{ width: 16, height: 16, borderRadius: 8, background: "#fff", position: "absolute", top: 3, left: checked ? 21 : 3, transition: "all 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
        </div>
        <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{label}</div>
            {desc && <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{desc}</div>}
        </div>
    </div>
);

// Multi-select chip group
const ChipGroup = ({
    options, selected, onToggle, colorMap,
}: {
    options: string[];
    selected: string[];
    onToggle: (v: string) => void;
    colorMap: Record<string, { accent: string; bg: string; border: string }>;
}) => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {options.map(opt => {
            const active = selected.includes(opt);
            const c = colorMap[opt] || { accent: "#1a3a6b", bg: "#eff6ff", border: "#93c5fd" };
            return (
                <div
                    key={opt}
                    onClick={() => onToggle(opt)}
                    style={{
                        padding: "7px 14px",
                        borderRadius: 20,
                        border: `2px solid ${active ? c.border : "#e2e8f0"}`,
                        background: active ? c.bg : "#fff",
                        color: active ? c.accent : "#475569",
                        fontWeight: 700, fontSize: 12,
                        cursor: "pointer",
                        transition: "all 0.15s",
                        letterSpacing: 0.3,
                        userSelect: "none" as const,
                    }}
                >
                    {active && <span style={{ marginRight: 5, fontSize: 10 }}>✓</span>}
                    {opt}
                </div>
            );
        })}
    </div>
);

// Single-select chip group
const ChipGroupSingle = ({
    options, selected, onSelect, colorMap,
}: {
    options: string[];
    selected: string;
    onSelect: (v: string) => void;
    colorMap: Record<string, { accent: string; bg: string; border: string }>;
}) => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {options.map(opt => {
            const active = selected === opt;
            const c = colorMap[opt] || { accent: "#1a3a6b", bg: "#eff6ff", border: "#93c5fd" };
            return (
                <div
                    key={opt}
                    onClick={() => onSelect(active ? "" : opt)}
                    style={{
                        padding: "7px 14px",
                        borderRadius: 20,
                        border: `2px solid ${active ? c.border : "#e2e8f0"}`,
                        background: active ? c.bg : "#fff",
                        color: active ? c.accent : "#475569",
                        fontWeight: 700, fontSize: 12,
                        cursor: "pointer",
                        transition: "all 0.15s",
                        letterSpacing: 0.3,
                        userSelect: "none" as const,
                    }}
                >
                    {active && <span style={{ marginRight: 5, fontSize: 10 }}>✓</span>}
                    {opt}
                </div>
            );
        })}
    </div>
);

// Small tag badge for list view
const SmallTag = ({ label, color, bg }: { label: string; color: string; bg: string }) => (
    <span style={{ fontSize: 10, fontWeight: 700, background: bg, color, padding: "2px 8px", borderRadius: 10, border: `1px solid ${color}33` }}>{label}</span>
);

// ─── FORM SECTION ─────────────────────────────────────────────────────────────

function ClassificacaoSection({ form, set }: { form: typeof initialForm; set: (k: string, v: any) => void }) {
    const toggleArea = (a: string) =>
        set("areas", form.areas.includes(a) ? form.areas.filter(x => x !== a) : [...form.areas, a]);
    const togglePublico = (p: string) =>
        set("publicos", form.publicos.includes(p) ? form.publicos.filter(x => x !== p) : [...form.publicos, p]);

    return (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1a3a6b", letterSpacing: 1, paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>CLASSIFICAÇÃO</div>

            <Field label="Área" hint="selecione uma ou mais">
                <ChipGroup
                    options={AREAS}
                    selected={form.areas}
                    onToggle={toggleArea}
                    colorMap={AREA_COLORS}
                />
                {form.areas.length === 0 && (
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Nenhuma área selecionada</div>
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
                <ChipGroup
                    options={PUBLICOS}
                    selected={form.publicos}
                    onToggle={togglePublico}
                    colorMap={PUBLICO_COLORS}
                />
                {form.publicos.length === 0 && (
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Nenhum público selecionado</div>
                )}
            </Field>
        </div>
    );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

// Mock id_adm — in production this would come from auth context / session
const ID_ADM = "adm_001";

export default function Admin() {
    const [tab, setTab] = useState("novo");
    const [form, setForm] = useState(initialForm);
    const [events, setEvents] = useState(mockEvents);
    const [saved, setSaved] = useState(false);
    const [updated, setUpdated] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { toasts, addToast, removeToast } = useToast();

    const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

    async function handleSubmit(data: typeof initialForm) {
        try {
            const res = await fetch("http://localhost:8000/add_evento", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, id_adm: ID_ADM }),
            });
            if (!res.ok) { addToast("Erro ao enviar formulário.", "error"); return; }
            addToast("Evento salvo com sucesso!", "success");
        } catch (error) {
            console.error("Error submitting form:", error);
            addToast("Erro ao enviar formulário.", "error");
        }
    }

    const handleSave = () => {
        if (!form.titulo || !form.dataInicio || !form.fonte) return;
        handleSubmit(form);
        setEvents(e => [{ ...form, id: Date.now() }, ...e]);
        setForm(initialForm);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        setTab("lista");
    };

    const handleEdit = (ev: any) => {
        setForm({ ...ev });
        setEditingId(ev.id);
        setTab("editar");
    };

    const handleUpdate = () => {
        if (!form.titulo || !form.dataInicio || !form.fonte) return;
        setEvents(e => e.map(ev => ev.id === editingId ? { ...form, id: editingId } : ev));
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

    const tabStyle = (t: string) => ({
        padding: "10px 24px",
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
        letterSpacing: 0.3,
        color: tab === t ? "#1a3a6b" : "#64748b",
        background: "none",

        // Reset de bordas gerais
        border: "none",

        // Definição granular da borda inferior para evitar bugs de rerender
        borderBottomWidth: 2,
        borderBottomStyle: "solid" as const,
        borderBottomColor: tab === t ? "#1a3a6b" : "transparent",
    });

    const formIsValid = !form.titulo || !form.dataInicio || !form.fonte;

    // Shared form body sections
    const FormIdentificacao = () => (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1a3a6b", letterSpacing: 1, paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>IDENTIFICAÇÃO</div>
            <Field label="Tipo de Publicação" required>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {TIPOS.map(t => (
                        <div key={t} onClick={() => set("tipo", t)} style={{ padding: "7px 16px", borderRadius: 20, border: `2px solid ${form.tipo === t ? CORES[t] : "#e2e8f0"}`, background: form.tipo === t ? CORES[t] : "#fff", color: form.tipo === t ? "#fff" : "#475569", fontWeight: 700, fontSize: 12, cursor: "pointer", transition: "all 0.15s", letterSpacing: 0.5 }}>{t}</div>
                    ))}
                </div>
            </Field>
            <Field label="Título" required>
                <input style={inputStyle} placeholder="Ex: Semana Acadêmica de Tecnologia" value={form.titulo} onChange={e => set("titulo", e.target.value)} />
            </Field>
            <Field label="Subtítulo / Descrição breve" hint="aparece abaixo do título no painel">
                <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 72 }} placeholder="Descreva o evento em uma ou duas frases..." value={form.subtitulo} onChange={e => set("subtitulo", e.target.value)} />
            </Field>
        </div>
    );

    const FormDataLocal = () => (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1a3a6b", letterSpacing: 1, paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>DATA, HORÁRIO E LOCAL</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                <Field label="Data Início" required><input type="date" style={inputStyle} value={form.dataInicio} onChange={e => set("dataInicio", e.target.value)} /></Field>
                <Field label="Data Fim" hint="opcional"><input type="date" style={inputStyle} value={form.dataFim} onChange={e => set("dataFim", e.target.value)} /></Field>
                <Field label="Horário Início" hint="opcional"><input type="time" style={inputStyle} value={form.horaInicio} onChange={e => set("horaInicio", e.target.value)} /></Field>
                <Field label="Horário Fim" hint="opcional"><input type="time" style={inputStyle} value={form.horaFim} onChange={e => set("horaFim", e.target.value)} /></Field>
            </div>
            <Field label="Local / Endereço">
                <input style={inputStyle} placeholder="Ex: Auditório Principal — Bloco A" value={form.local} onChange={e => set("local", e.target.value)} />
            </Field>
        </div>
    );

    const FormOrigemLink = () => (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1a3a6b", letterSpacing: 1, paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>ORIGEM E LINK</div>
            <Field label="Fonte / Origem da Informação" required hint="setor ou departamento responsável">
                <input style={inputStyle} placeholder="Ex: Coordenação de Tecnologia da Informação" value={form.fonte} onChange={e => set("fonte", e.target.value)} />
            </Field>
            <Field label="Link / URL" hint="será usado para gerar o QR Code">
                <input style={inputStyle} placeholder="https://exemplo.edu.br/evento" value={form.link} onChange={e => set("link", e.target.value)} />
                {form.link && (
                    <div style={{ fontSize: 11, color: "#22c55e", marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#22c55e" /><path d="M7 12l3.5 3.5L17 8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        QR Code será gerado automaticamente para este link
                    </div>
                )}
            </Field>
        </div>
    );

    const FormExibicao = () => (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1a3a6b", letterSpacing: 1, paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>EXIBIÇÃO NO PAINEL</div>
            <Toggle label="Exibir como Destaque Principal" desc="O evento rotaciona na área central grande do painel" checked={form.destaque} onChange={v => set("destaque", v)} />
            <Toggle label="Incluir no Ticker de Avisos (rodapé)" desc="O texto rolará continuamente na faixa inferior do painel" checked={form.ticker} onChange={v => set("ticker", v)} />
            {form.ticker && (
                <Field label="Texto do Ticker" hint="mensagem curta para o rodapé">
                    <input style={inputStyle} placeholder="Ex: Inscrições abertas até 08/05 — acesse o Portal do Aluno" value={form.textoTicker} onChange={e => set("textoTicker", e.target.value)} maxLength={120} />
                    <div style={{ fontSize: 10, color: "#94a3b8", textAlign: "right" }}>{form.textoTicker.length}/120 caracteres</div>
                </Field>
            )}
        </div>
    );

    const FormPreview = () => form.titulo ? (
        <div style={{ background: "#f0f4ff", border: "1px solid #c7d7f8", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#1a3a6b", letterSpacing: 1, marginBottom: 10 }}>PRÉ-VISUALIZAÇÃO</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                <Badge tipo={form.tipo} />
                {form.destaque && <span style={{ fontSize: 10, color: "#94a3b8" }}>• DESTAQUE</span>}
                {form.areas.map(a => <SmallTag key={a} label={a} color={AREA_COLORS[a]?.accent || "#1a3a6b"} bg={AREA_COLORS[a]?.bg || "#eff6ff"} />)}
                {form.categoria && <SmallTag label={form.categoria} color={CATEGORIA_COLORS[form.categoria]?.accent || "#1a3a6b"} bg={CATEGORIA_COLORS[form.categoria]?.bg || "#eff6ff"} />}
                {form.publicos.map(p => <SmallTag key={p} label={p} color={PUBLICO_COLORS[p]?.accent || "#1a3a6b"} bg={PUBLICO_COLORS[p]?.bg || "#eff6ff"} />)}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>{form.titulo}</div>
            {form.subtitulo && <div style={{ fontSize: 13, color: "#475569", marginTop: 6 }}>{form.subtitulo}</div>}
            <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
                {form.dataInicio && (
                    <span style={{ fontSize: 11, color: "#64748b" }}>
                        📅 {new Date(form.dataInicio + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                        {form.dataFim ? ` – ${new Date(form.dataFim + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}` : ""}
                    </span>
                )}
                {form.horaInicio && <span style={{ fontSize: 11, color: "#64748b" }}>🕐 {form.horaInicio}{form.horaFim ? ` – ${form.horaFim}` : ""}</span>}
                {form.local && <span style={{ fontSize: 11, color: "#64748b" }}>📍 {form.local}</span>}
            </div>
            {form.fonte && <div style={{ fontSize: 11, color: "#1a3a6b", fontWeight: 600, marginTop: 8 }}>📡 Fonte: {form.fonte}</div>}
        </div>
    ) : null;

    return (
        <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", background: "#f8fafc", minHeight: "100vh", color: "#1e293b", fontSize: 13 }}>
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* HEADER */}
            <header style={{ background: "#fff", borderBottom: "2px solid #1a3a6b", padding: "12px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: "#1a3a6b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="22" height="22" viewBox="0 0 26 26" fill="none"><rect x="3" y="14" width="5" height="8" rx="1" fill="#fff" /><rect x="10.5" y="9" width="5" height="13" rx="1" fill="#fff" /><rect x="18" y="5" width="5" height="17" rx="1" fill="#fff" /><circle cx="5.5" cy="7" r="3" fill="#93c5fd" /></svg>
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#1a3a6b" }}>IME-USP 2026</div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>Painel Administrativo — Gerenciar Conteúdo</div>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#1a3a6b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="#fff" opacity="0.9" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" /></svg>
                    </div>
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>Administrador</div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>admin@imeusp.edu.br</div>
                    </div>
                </div>
            </header>

            {/* TABS */}
            <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 32px", display: "flex", gap: 4 }}>
                <button style={tabStyle("novo")} onClick={() => { setTab("novo"); setForm(initialForm); setEditingId(null); }}>+ Novo Evento / Aviso</button>
                <button style={tabStyle("lista")} onClick={() => setTab("lista")}>
                    Gerenciar Publicações
                    <span style={{ marginLeft: 8, background: "#1a3a6b", color: "#fff", fontSize: 10, padding: "2px 7px", borderRadius: 10 }}>{events.length}</span>
                </button>
                {tab === "editar" && (
                    <button style={tabStyle("editar")}>✏️ Editando Publicação</button>
                )}
            </div>

            <main style={{ maxWidth: 860, margin: "0 auto", padding: "28px 24px" }}>

                {saved && (
                    <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "12px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#22c55e" /><path d="M7 12l3.5 3.5L17 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#15803d" }}>Publicação salva com sucesso e adicionada ao painel!</span>
                    </div>
                )}

                {updated && (
                    <div style={{ background: "#eff6ff", border: "1px solid #93c5fd", borderRadius: 10, padding: "12px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#3b82f6" /><path d="M7 12l3.5 3.5L17 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#1d4ed8" }}>Publicação atualizada com sucesso!</span>
                    </div>
                )}

                {/* ── FORM EDITAR ── */}
                {tab === "editar" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        <div style={{ background: "#eff6ff", border: "1px solid #93c5fd", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#1d4ed8" }}>Modo de Edição</div>
                                <div style={{ fontSize: 11, color: "#3b82f6" }}>Você está editando: <strong>{form.titulo}</strong></div>
                            </div>
                            <button onClick={handleCancelEdit} style={{ marginLeft: "auto", padding: "6px 14px", borderRadius: 7, border: "1px solid #93c5fd", background: "#fff", fontSize: 12, fontWeight: 600, color: "#3b82f6", cursor: "pointer" }}>Cancelar edição</button>
                        </div>

                        <FormIdentificacao />
                        <ClassificacaoSection form={form} set={set} />
                        <FormDataLocal />
                        <FormOrigemLink />
                        <FormExibicao />
                        <FormPreview />

                        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                            <button onClick={handleCancelEdit} style={{ padding: "10px 24px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}>Cancelar</button>
                            <button onClick={handleUpdate} disabled={formIsValid} style={{ padding: "10px 28px", borderRadius: 8, border: "none", background: formIsValid ? "#cbd5e1" : "#3b82f6", color: "#fff", fontSize: 13, fontWeight: 700, cursor: formIsValid ? "not-allowed" : "pointer", letterSpacing: 0.3 }}>
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                )}

                {/* ── FORM NOVO ── */}
                {tab === "novo" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        <div>
                            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0" }}>Nova Publicação</h2>
                            <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Preencha as informações abaixo para adicionar um evento, aviso ou palestra ao painel institucional.</p>
                        </div>

                        <FormIdentificacao />
                        <ClassificacaoSection form={form} set={set} />
                        <FormDataLocal />
                        <FormOrigemLink />
                        <FormExibicao />
                        <FormPreview />

                        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                            <button onClick={() => setForm(initialForm)} style={{ padding: "10px 24px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}>Limpar</button>
                            <button onClick={handleSave} disabled={formIsValid} style={{ padding: "10px 28px", borderRadius: 8, border: "none", background: formIsValid ? "#cbd5e1" : "#1a3a6b", color: "#fff", fontSize: 13, fontWeight: 700, cursor: formIsValid ? "not-allowed" : "pointer", letterSpacing: 0.3 }}>
                                Publicar no Painel
                            </button>
                        </div>
                    </div>
                )}

                {/* ── LISTA ── */}
                {tab === "lista" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0" }}>Publicações Ativas</h2>
                            <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{events.length} publicação(ões) no painel institucional.</p>
                        </div>

                        {events.map((ev: any) => (
                            <div key={ev.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 18px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                                <div style={{ width: 44, height: 44, borderRadius: 8, background: CORES[ev.tipo] || "#1a3a6b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="3" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1.5" /><line x1="8" y1="3" x2="8" y2="7" stroke="white" strokeWidth="1.8" strokeLinecap="round" /><line x1="16" y1="3" x2="16" y2="7" stroke="white" strokeWidth="1.8" strokeLinecap="round" /><rect x="7" y="12" width="4" height="4" rx="1" fill="white" /></svg>
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                                        <Badge tipo={ev.tipo} />
                                        {ev.destaque && <span style={{ fontSize: 10, background: "#fef9c3", color: "#854d0e", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>⭐ DESTAQUE</span>}
                                        {ev.ticker && <span style={{ fontSize: 10, background: "#f0fdf4", color: "#166534", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>📢 TICKER</span>}
                                        {ev.areas?.map((a: string) => (
                                            <SmallTag key={a} label={a} color={AREA_COLORS[a]?.accent || "#1a3a6b"} bg={AREA_COLORS[a]?.bg || "#eff6ff"} />
                                        ))}
                                        {ev.categoria && (
                                            <SmallTag label={ev.categoria} color={CATEGORIA_COLORS[ev.categoria]?.accent || "#1a3a6b"} bg={CATEGORIA_COLORS[ev.categoria]?.bg || "#eff6ff"} />
                                        )}
                                        {ev.publicos?.map((p: string) => (
                                            <SmallTag key={p} label={p} color={PUBLICO_COLORS[p]?.accent || "#1a3a6b"} bg={PUBLICO_COLORS[p]?.bg || "#eff6ff"} />
                                        ))}
                                    </div>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{ev.titulo}</div>
                                    {ev.subtitulo && <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{ev.subtitulo}</div>}
                                    <div style={{ display: "flex", gap: 14, marginTop: 7, flexWrap: "wrap" }}>
                                        {ev.dataInicio && <span style={{ fontSize: 11, color: "#64748b" }}>📅 {new Date(ev.dataInicio + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}{(ev.dataFim && ev.dataFim !== ev.dataInicio) ? ` – ${new Date(ev.dataFim + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}` : ""}</span>}
                                        {ev.horaInicio && <span style={{ fontSize: 11, color: "#64748b" }}>🕐 {ev.horaInicio}{ev.horaFim ? ` – ${ev.horaFim}` : ""}</span>}
                                        {ev.local && <span style={{ fontSize: 11, color: "#64748b" }}>📍 {ev.local}</span>}
                                        {ev.fonte && <span style={{ fontSize: 11, color: "#1a3a6b", fontWeight: 600 }}>📡 {ev.fonte}</span>}
                                    </div>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                                    <button onClick={() => handleEdit(ev)} style={{ padding: "6px 14px", borderRadius: 7, border: "1px solid #93c5fd", background: "#eff6ff", fontSize: 12, fontWeight: 600, color: "#3b82f6", cursor: "pointer" }}>✏️ Editar</button>
                                    {deleteId === ev.id ? (
                                        <div style={{ display: "flex", gap: 6 }}>
                                            <button onClick={() => handleDelete(ev.id)} style={{ padding: "6px 10px", borderRadius: 7, border: "none", background: "#ef4444", fontSize: 11, fontWeight: 700, color: "#fff", cursor: "pointer" }}>Confirmar</button>
                                            <button onClick={() => setDeleteId(null)} style={{ padding: "6px 10px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#fff", fontSize: 11, fontWeight: 600, color: "#64748b", cursor: "pointer" }}>Cancelar</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setDeleteId(ev.id)} style={{ padding: "6px 14px", borderRadius: 7, border: "1px solid #fecaca", background: "#fff5f5", fontSize: 12, fontWeight: 600, color: "#ef4444", cursor: "pointer" }}>Remover</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}