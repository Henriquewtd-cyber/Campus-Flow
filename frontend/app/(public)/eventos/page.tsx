"use client";

import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/header";
import {
    Calendar,
    AlertTriangle,
    Mic,
    Newspaper,
    Award,
    Search,
    SlidersHorizontal,
    X,
    Clock,
    MapPin,
    Radio,
    ExternalLink,
    BookOpen,
    Briefcase,
    Microscope,
    GraduationCap,
    Users,
    Layers,
    Filter,
    Hash,
    Tag as TagIcon,
    ChevronRight
} from "lucide-react";

// ─── TYPES ───────────────────────────────────────────────────────────────────

// "Tag" aqui é o TIPO da publicação (EVENTO, AVISO...). As tags livres
// (palavras-chave) ficam em `keywords` / `tags: string[]`.
type Tag = "EVENTO" | "AVISO" | "PALESTRA" | "NOTÍCIA" | "CAMAT";
type Publico = "Todos" | "Graduação" | "Pós-Graduação" | "Docentes" | "Técnicos";
type Area = "Todos" | "MAC" | "MAE" | "MAT" | "LIC" | "MAP";
type Categoria = "Todas" | "Curso" | "Vagas" | "Projeto" | "Bolsa";
type DateRange = "Todos" | "Últimos 7 dias" | "Últimos 10 dias" | "Últimos 30 dias";

type Noticia = {
    id: number;
    tag: Tag;
    tags: string[];
    publico: Publico[];
    area: Area[];
    categoria: Categoria;
    title: string;
    subtitle: string;
    date: string;
    rawDate: Date;
    time: string;
    local: string;
    source: string;
    link: string;
    body: string;
    accent: string;
    glow: string;
};

// Formato devolvido pelo backend (model Event)
type EventApi = {
    id: number | null;
    dataInicio: string;
    dataFim: string | null;
    fonte: string;
    horaInicio: string | null;
    horaFim: string | null;
    link: string | null;
    local: string | null;
    subtitulo: string | null;
    textoTicker: string | null;
    tipo: string;
    titulo: string;
    tags: string[];
    publicos: string[];
    areas: string[];
    categorias: string[];
};

// ─── DATA & BRAND SYSTEM ──────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const TAG_CONFIG: Record<Tag, { accent: string; bg: string; border: string; icon: any }> = {
    "EVENTO": { accent: "#1e40af", bg: "#eff6ff", border: "#bfdbfe", icon: Calendar },
    "AVISO": { accent: "#b91c1c", bg: "#fef2f2", border: "#fecaca", icon: AlertTriangle },
    "PALESTRA": { accent: "#047857", bg: "#ecfdf5", border: "#a7f3d0", icon: Mic },
    "NOTÍCIA": { accent: "#b45309", bg: "#fffbeb", border: "#fde68a", icon: Newspaper },
    "CAMAT": { accent: "#be185d", bg: "#fdf2f8", border: "#fbcfe8", icon: Award },
};

const AREA_COLORS: Record<Area, { accent: string; bg: string; border: string }> = {
    "Todos": { accent: "#64748b", bg: "#f8fafc", border: "#e2e8f0" },
    "MAC": { accent: "#6d28d9", bg: "#f5f3ff", border: "#ddd6fe" },
    "MAE": { accent: "#047857", bg: "#ecfdf5", border: "#a7f3d0" },
    "MAT": { accent: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
    "LIC": { accent: "#c2410c", bg: "#fff7ed", border: "#ffedd5" },
    "MAP": { accent: "#be185d", bg: "#fdf2f8", border: "#fbcfe8" },
};

const CATEGORIA_COLORS: Record<Categoria, { accent: string; bg: string; border: string; icon: any }> = {
    "Todas": { accent: "#64748b", bg: "#f8fafc", border: "#e2e8f0", icon: TagIcon },
    "Curso": { accent: "#0284c7", bg: "#f0f9ff", border: "#bae6fd", icon: BookOpen },
    "Vagas": { accent: "#15803d", bg: "#f0fdf4", border: "#bbf7d0", icon: Briefcase },
    "Projeto": { accent: "#7e22ce", bg: "#faf5ff", border: "#e9d5ff", icon: Microscope },
    "Bolsa": { accent: "#b45309", bg: "#fffbeb", border: "#fde68a", icon: GraduationCap },
};

const ALL_TAGS: Tag[] = ["EVENTO", "AVISO", "PALESTRA", "NOTÍCIA", "CAMAT"];
const ALL_PUBLICOS: Publico[] = ["Todos", "Graduação", "Pós-Graduação", "Docentes", "Técnicos"];
const ALL_AREAS: Area[] = ["Todos", "MAC", "MAE", "MAT", "LIC", "MAP"];
const ALL_CATEGORIAS: Categoria[] = ["Todas", "Curso", "Vagas", "Projeto", "Bolsa"];
const ALL_DATE_RANGES: DateRange[] = ["Todos", "Últimos 7 dias", "Últimos 10 dias", "Últimos 30 dias"];

const DATE_RANGE_DAYS: Record<DateRange, number | null> = {
    "Todos": null,
    "Últimos 7 dias": 7,
    "Últimos 10 dias": 10,
    "Últimos 30 dias": 30,
};

// Quantas tags livres aparecem no card antes do "+N"
const MAX_TAGS_CARD = 3;

// ─── HELPERS (API → UI) ───────────────────────────────────────────────────────

const daysAgo = (d: number) => new Date(Date.now() - d * 86400000);

// YYYY-MM-DD no fuso local (toISOString usaria UTC e poderia voltar um dia)
const toYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

const parseDate = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00`);

const fmtDate = (iso: string) =>
    parseDate(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

const isTag = (v: string): v is Tag => (ALL_TAGS as string[]).includes(v);
const isPublico = (v: string): v is Publico => (ALL_PUBLICOS as string[]).includes(v);
const isArea = (v: string): v is Area => (ALL_AREAS as string[]).includes(v);
const isCategoria = (v: string): v is Categoria => (ALL_CATEGORIAS as string[]).includes(v);

function toNoticia(e: EventApi, idx: number): Noticia {
    // O tipo vem de `tipo`; só cai para `tags` em registros antigos
    const tag: Tag =
        [e.tipo, ...(e.tags ?? [])].map(t => t.toUpperCase()).find(isTag) ?? "NOTÍCIA";

    // Tags livres: remove as que são só um espelho do tipo (ex.: ["PALESTRA"] em eventos antigos)
    const tags = (e.tags ?? []).filter(t => !isTag(t.toUpperCase()));

    const inicio = fmtDate(e.dataInicio);
    const date = e.dataFim && e.dataFim.slice(0, 10) !== e.dataInicio.slice(0, 10)
        ? `${inicio} a ${fmtDate(e.dataFim)}`
        : inicio;

    const time = e.horaInicio
        ? e.horaFim ? `${e.horaInicio} – ${e.horaFim}` : e.horaInicio
        : "";

    return {
        id: e.id ?? -(idx + 1),
        tag,
        tags,
        publico: (e.publicos ?? []).filter(isPublico),
        area: (e.areas ?? []).filter(isArea),
        categoria: (e.categorias ?? []).find(isCategoria) ?? "Todas",
        title: e.titulo,
        subtitle: e.subtitulo ?? "",
        date,
        rawDate: parseDate(e.dataInicio),
        time,
        local: e.local ?? "",
        source: e.fonte,
        link: e.link ?? "",
        body: e.textoTicker ?? e.subtitulo ?? "",
        accent: TAG_CONFIG[tag].accent,
        glow: "transparent",
    };
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

const TagBadge = ({ tag, size = "md" }: { tag: Tag; size?: "sm" | "md" }) => {
    const config = TAG_CONFIG[tag];
    const Icon = config.icon;
    return (
        <span
            className={`inline-flex items-center gap-1 font-bold rounded-full border transition-colors uppercase tracking-wider ${size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
                }`}
            style={{ backgroundColor: config.bg, color: config.accent, borderColor: config.border }}
        >
            <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
            <span>{tag}</span>
        </span>
    );
};

const PublicoBadge = ({ p }: { p: Publico }) => (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
        {p}
    </span>
);

// Tag livre (palavra-chave). Clicável: ativa/desativa o filtro por essa tag.
const KeywordChip = ({
    label, active, onClick, size = "sm",
}: {
    label: string;
    active: boolean;
    onClick: () => void;
    size?: "sm" | "md";
}) => (
    <button
        type="button"
        aria-pressed={active}
        title={active ? `Remover filtro "${label}"` : `Filtrar por "${label}"`}
        onClick={e => { e.stopPropagation(); onClick(); }}
        className={`inline-flex items-center gap-0.5 rounded-md font-semibold border transition-colors cursor-pointer ${size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-[11px]"
            } ${active
                ? "bg-blue-900 text-white border-blue-900"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-900 hover:border-blue-200"
            }`}
    >
        <Hash className={size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3"} />
        <span>{label}</span>
    </button>
);

const SectionHeader = ({ label, icon: Icon }: { label: string; icon?: any }) => (
    <div className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-2.5 flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
        <span>{label}</span>
    </div>
);

// ─── FILTER PANEL ─────────────────────────────────────────────────────────────

const FilterPanel = ({
    selectedTags, toggleTag, clearTags,
    selectedPublico, setSelectedPublico,
    selectedArea, setSelectedArea,
    selectedCategoria, setSelectedCategoria,
    selectedDateRange, setSelectedDateRange,
    counts, onItemClick,
}: {
    selectedTags: Tag[];
    toggleTag: (t: Tag) => void;
    clearTags: () => void;
    selectedPublico: Publico;
    setSelectedPublico: (p: Publico) => void;
    selectedArea: Area;
    setSelectedArea: (a: Area) => void;
    selectedCategoria: Categoria;
    setSelectedCategoria: (c: Categoria) => void;
    selectedDateRange: DateRange;
    setSelectedDateRange: (d: DateRange) => void;
    counts: Record<string, number>;
    onItemClick?: () => void;
}) => {
    return (
        <div className="flex flex-col gap-5">
            {/* PERÍODO */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
                <SectionHeader label="Período" icon={Calendar} />
                <div className="flex flex-col gap-1">
                    {ALL_DATE_RANGES.map(dr => {
                        const active = selectedDateRange === dr;
                        return (
                            <button
                                key={dr}
                                onClick={() => { setSelectedDateRange(dr); onItemClick?.(); }}
                                className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${active
                                    ? "bg-blue-900 text-white shadow-xs"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                    }`}
                            >
                                <span>{dr}</span>
                                {active && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* TIPO DE CONTEÚDO */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
                <SectionHeader label="Tipo de Conteúdo" icon={Layers} />
                <div className="flex flex-col gap-1">
                    <button
                        onClick={() => { clearTags(); onItemClick?.(); }}
                        className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${selectedTags.length === 0
                            ? "bg-blue-900 text-white shadow-xs"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            }`}
                    >
                        <span>Todos os Tipos</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedTags.length === 0 ? "bg-blue-800 text-blue-100" : "bg-slate-100 text-slate-500"}`}>
                            {counts.total ?? 0}
                        </span>
                    </button>
                    {ALL_TAGS.map(tag => {
                        const config = TAG_CONFIG[tag];
                        const active = selectedTags.includes(tag);
                        const Icon = config.icon;
                        return (
                            <button
                                key={tag}
                                onClick={() => { toggleTag(tag); onItemClick?.(); }}
                                className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${active
                                    ? "bg-slate-900 text-white shadow-xs"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <Icon className="w-3.5 h-3.5" style={{ color: active ? "#ffffff" : config.accent }} />
                                    <span>{tag}</span>
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-500"}`}>
                                    {counts[tag] || 0}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* CATEGORIA */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
                <SectionHeader label="Categoria" icon={Filter} />
                <div className="flex flex-col gap-1">
                    {ALL_CATEGORIAS.map(cat => {
                        const active = selectedCategoria === cat;
                        const config = CATEGORIA_COLORS[cat];
                        const Icon = config.icon;
                        return (
                            <button
                                key={cat}
                                onClick={() => { setSelectedCategoria(cat); onItemClick?.(); }}
                                className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${active
                                    ? "bg-blue-900 text-white shadow-xs"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <Icon className="w-3.5 h-3.5" style={{ color: active ? "#ffffff" : config.accent }} />
                                    <span>{cat}</span>
                                </span>
                                {active && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ÁREA */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
                <SectionHeader label="Área Acadêmica" icon={BookOpen} />
                <div className="flex flex-col gap-1">
                    {ALL_AREAS.map(area => {
                        const active = selectedArea === area;
                        const config = AREA_COLORS[area];
                        return (
                            <button
                                key={area}
                                onClick={() => { setSelectedArea(area); onItemClick?.(); }}
                                className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${active
                                    ? "bg-blue-900 text-white shadow-xs"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    {area !== "Todos" && (
                                        <span className="w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center border" style={{ backgroundColor: active ? "#ffffff22" : config.bg, color: active ? "#ffffff" : config.accent, borderColor: active ? "#ffffff44" : config.border }}>
                                            {area}
                                        </span>
                                    )}
                                    <span>{area === "Todos" ? "Todas as Áreas" : area}</span>
                                </span>
                                {active && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* PÚBLICO */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
                <SectionHeader label="Público-Alvo" icon={Users} />
                <div className="flex flex-col gap-1">
                    {ALL_PUBLICOS.map(p => {
                        const active = selectedPublico === p;
                        return (
                            <button
                                key={p}
                                onClick={() => { setSelectedPublico(p); onItemClick?.(); }}
                                className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${active
                                    ? "bg-blue-900 text-white shadow-xs"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                    }`}
                            >
                                <span>{p}</span>
                                {active && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// ─── FILTER DRAWER (MOBILE) ───────────────────────────────────────────────────

const FilterDrawer = ({
    open, onClose, onClear,
    selectedTags, toggleTag, clearTags,
    selectedPublico, setSelectedPublico,
    selectedArea, setSelectedArea,
    selectedCategoria, setSelectedCategoria,
    selectedDateRange, setSelectedDateRange,
    counts,
}: {
    open: boolean; onClose: () => void; onClear: () => void;
    selectedTags: Tag[]; toggleTag: (t: Tag) => void; clearTags: () => void;
    selectedPublico: Publico; setSelectedPublico: (p: Publico) => void;
    selectedArea: Area; setSelectedArea: (a: Area) => void;
    selectedCategoria: Categoria; setSelectedCategoria: (c: Categoria) => void;
    selectedDateRange: DateRange; setSelectedDateRange: (d: DateRange) => void;
    counts: Record<string, number>;
}) => {
    useEffect(() => {
        if (open) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-slate-50 border-t border-slate-200 rounded-t-2xl max-h-[85vh] flex flex-col shadow-xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-white rounded-t-2xl">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                        <SlidersHorizontal className="w-4 h-4 text-blue-900" />
                        <span>Filtros Institucionais</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClear}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                        >
                            Limpar
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto p-5 space-y-4">
                    <FilterPanel
                        selectedTags={selectedTags} toggleTag={toggleTag} clearTags={clearTags}
                        selectedPublico={selectedPublico} setSelectedPublico={setSelectedPublico}
                        selectedArea={selectedArea} setSelectedArea={setSelectedArea}
                        selectedCategoria={selectedCategoria} setSelectedCategoria={setSelectedCategoria}
                        selectedDateRange={selectedDateRange} setSelectedDateRange={setSelectedDateRange}
                        counts={counts} onItemClick={onClose}
                    />
                </div>
            </div>
        </div>
    );
};

// ─── ACTIVE FILTER CHIPS ──────────────────────────────────────────────────────

const FilterChips = ({
    selectedTags, toggleTag,
    selectedKeywords, toggleKeyword,
    selectedPublico, setSelectedPublico,
    selectedArea, setSelectedArea,
    selectedCategoria, setSelectedCategoria,
    selectedDateRange, setSelectedDateRange,
    search, setSearch,
}: {
    selectedTags: Tag[]; toggleTag: (t: Tag) => void;
    selectedKeywords: string[]; toggleKeyword: (k: string) => void;
    selectedPublico: Publico; setSelectedPublico: (p: Publico) => void;
    selectedArea: Area; setSelectedArea: (a: Area) => void;
    selectedCategoria: Categoria; setSelectedCategoria: (c: Categoria) => void;
    selectedDateRange: DateRange; setSelectedDateRange: (d: DateRange) => void;
    search: string; setSearch: (s: string) => void;
}) => {
    const chips = [
        ...selectedTags.map(t => ({ label: t, onRemove: () => toggleTag(t) })),
        ...selectedKeywords.map(k => ({ label: `#${k}`, onRemove: () => toggleKeyword(k) })),
        ...(selectedPublico !== "Todos" ? [{ label: `Público: ${selectedPublico}`, onRemove: () => setSelectedPublico("Todos") }] : []),
        ...(selectedArea !== "Todos" ? [{ label: `Área: ${selectedArea}`, onRemove: () => setSelectedArea("Todos") }] : []),
        ...(selectedCategoria !== "Todas" ? [{ label: `Categoria: ${selectedCategoria}`, onRemove: () => setSelectedCategoria("Todas") }] : []),
        ...(selectedDateRange !== "Todos" ? [{ label: `Período: ${selectedDateRange}`, onRemove: () => setSelectedDateRange("Todos") }] : []),
        ...(search ? [{ label: `Busca: "${search}"`, onRemove: () => setSearch("") }] : []),
    ];

    if (chips.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                <span>Ativos:</span>
            </span>
            {chips.map((chip, i) => (
                <button
                    key={i}
                    onClick={chip.onRemove}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                    <span>{chip.label}</span>
                    <X className="w-3 h-3 text-blue-700 hover:text-blue-900" />
                </button>
            ))}
        </div>
    );
};

// ─── MODAL DETAILS ────────────────────────────────────────────────────────────

const Modal = ({
    item, onClose, isMobile, selectedKeywords, toggleKeyword,
}: {
    item: Noticia;
    onClose: () => void;
    isMobile: boolean;
    selectedKeywords: string[];
    toggleKeyword: (k: string) => void;
}) => {
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200"
        >
            <div
                onClick={e => e.stopPropagation()}
                className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]"
            >
                {/* MODAL HEADER */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <TagBadge tag={item.tag} />
                            {item.publico.map(p => <PublicoBadge key={p} p={p} />)}
                            {item.area.map(a => (
                                <span key={a} className="px-2 py-0.5 rounded text-[10px] font-bold border" style={{ backgroundColor: AREA_COLORS[a].bg, color: AREA_COLORS[a].accent, borderColor: AREA_COLORS[a].border }}>
                                    {a}
                                </span>
                            ))}
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold border" style={{ backgroundColor: CATEGORIA_COLORS[item.categoria].bg, color: CATEGORIA_COLORS[item.categoria].accent, borderColor: CATEGORIA_COLORS[item.categoria].border }}>
                                {item.categoria}
                            </span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors shrink-0"
                            title="Fechar"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">
                        {item.title}
                    </h2>
                    {item.subtitle && (
                        <p className="text-xs md:text-sm font-medium text-slate-600 leading-relaxed">
                            {item.subtitle}
                        </p>
                    )}

                    {item.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                            {item.tags.map(t => (
                                <KeywordChip
                                    key={t}
                                    label={t}
                                    size="md"
                                    active={selectedKeywords.includes(t)}
                                    onClick={() => { toggleKeyword(t); onClose(); }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* MODAL BODY */}
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* METADATA GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                            <Calendar className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data</div>
                                <div className="text-xs font-semibold text-slate-800">{item.date}</div>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                            <Clock className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Horário</div>
                                <div className="text-xs font-semibold text-slate-800">{item.time || "Não especificado"}</div>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Local</div>
                                <div className="text-xs font-semibold text-slate-800">{item.local || "Não especificado"}</div>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                            <Radio className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Origem / Fonte</div>
                                <div className="text-xs font-semibold text-slate-800">{item.source}</div>
                            </div>
                        </div>
                    </div>

                    {/* DETAILED CONTENT */}
                    {item.body && (
                        <div className="space-y-3">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                                Descrição Completa
                            </div>
                            {item.body.split("\n\n").map((paragraph, idx) => (
                                <p key={idx} className="text-xs md:text-sm text-slate-700 leading-relaxed">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    )}

                    {/* OFFICIAL LINK */}
                    {item.link && (
                        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="min-w-0">
                                <div className="text-[10px] font-bold text-blue-900 uppercase tracking-wider">Página Oficial</div>
                                <div className="text-xs text-blue-800 font-medium truncate">{item.link}</div>
                            </div>
                            <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 transition-colors shadow-xs shrink-0"
                            >
                                <span>Acessar Link</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── CARD ─────────────────────────────────────────────────────────────────────

const NoticiaCard = ({
    item, onClick, isMobile, selectedKeywords, toggleKeyword,
}: {
    item: Noticia;
    onClick: () => void;
    isMobile: boolean;
    selectedKeywords: string[];
    toggleKeyword: (k: string) => void;
}) => {
    const config = TAG_CONFIG[item.tag];
    const Icon = config.icon;

    const visibleKeywords = item.tags.slice(0, MAX_TAGS_CARD);
    const hiddenKeywords = item.tags.length - visibleKeywords.length;

    return (
        <div
            onClick={onClick}
            className="group bg-white border border-slate-200/80 rounded-xl p-4 md:p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex items-start gap-4"
            style={{ borderLeftWidth: 4, borderLeftColor: config.accent }}
        >
            <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                style={{ backgroundColor: config.bg, color: config.accent, borderColor: config.border }}
            >
                <Icon className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                    <TagBadge tag={item.tag} size="sm" />
                    {!isMobile && item.publico.map(p => <PublicoBadge key={p} p={p} />)}
                    {!isMobile && item.area.slice(0, 2).map(a => (
                        <span key={a} className="px-1.5 py-0.5 rounded text-[9px] font-bold border" style={{ backgroundColor: AREA_COLORS[a].bg, color: AREA_COLORS[a].accent, borderColor: AREA_COLORS[a].border }}>
                            {a}
                        </span>
                    ))}
                    <span className="text-xs text-slate-400 font-medium ml-auto">
                        {item.date}
                    </span>
                </div>

                <h3 className="text-sm md:text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors leading-snug mb-1">
                    {item.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {item.subtitle}
                </p>

                {visibleKeywords.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        {visibleKeywords.map(t => (
                            <KeywordChip
                                key={t}
                                label={t}
                                active={selectedKeywords.includes(t)}
                                onClick={() => toggleKeyword(t)}
                            />
                        ))}
                        {hiddenKeywords > 0 && (
                            <span className="text-[10px] font-semibold text-slate-400">+{hiddenKeywords}</span>
                        )}
                    </div>
                )}

                {!isMobile && (item.time || item.local) && (
                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100">
                        {item.time && (
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{item.time}</span>
                            </span>
                        )}
                        {item.local && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{item.local}</span>
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="text-slate-300 group-hover:text-blue-900 group-hover:translate-x-1 transition-all self-center">
                <ChevronRight className="w-5 h-5" />
            </div>
        </div>
    );
};

// ─── MAIN PAGE COMPONENT ──────────────────────────────────────────────────────

export default function Noticias() {
    const [noticias, setNoticias] = useState<Noticia[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
    const [selectedPublico, setSelectedPublico] = useState<Publico>("Todos");
    const [selectedArea, setSelectedArea] = useState<Area>("Todos");
    const [selectedCategoria, setSelectedCategoria] = useState<Categoria>("Todas");
    const [selectedDateRange, setSelectedDateRange] = useState<DateRange>("Todos");
    const [search, setSearch] = useState("");
    const [activeItem, setActiveItem] = useState<Noticia | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    // Envia os filtros ao backend (GET /get_eventos) sempre que algum muda
    useEffect(() => {
        const controller = new AbortController();
        const params = new URLSearchParams();

        // Tipo (EVENTO, AVISO...) e tags livres vão no mesmo parâmetro `all_tags`.
        // Se o backend usar um parâmetro separado para as tags livres, troque aqui.
        selectedTags.forEach(t => params.append("all_tags", t));
        selectedKeywords.forEach(k => params.append("all_tags", k));

        if (selectedPublico !== "Todos") params.append("all_publicos", selectedPublico);
        if (selectedArea !== "Todos") params.append("all_areas", selectedArea);
        if (selectedCategoria !== "Todas") params.append("all_categorias", selectedCategoria);

        const days = DATE_RANGE_DAYS[selectedDateRange];
        if (days) {
            params.append("data_inicio", toYMD(daysAgo(days)));
            params.append("data_fim", toYMD(new Date()));
        }

        setLoading(true);
        setError(null);

        fetch(`${API_URL}/get_eventos?${params.toString()}`, { signal: controller.signal })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json() as Promise<EventApi[]>;
            })
            .then(data => setNoticias(data.map(toNoticia)))
            .catch(err => {
                if (err.name === "AbortError") return;
                console.error("Erro ao buscar eventos:", err);
                setError("Não foi possível carregar os comunicados.");
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [selectedTags, selectedKeywords, selectedPublico, selectedArea, selectedCategoria, selectedDateRange]);

    const toggleTag = (tag: Tag) =>
        setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

    const toggleKeyword = (k: string) =>
        setSelectedKeywords(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]);

    // Limpa todos os filtros do backend (mantém o texto da busca)
    const clearFilters = () => {
        setSelectedTags([]);
        setSelectedKeywords([]);
        setSelectedPublico("Todos");
        setSelectedArea("Todos");
        setSelectedCategoria("Todas");
        setSelectedDateRange("Todos");
    };

    const clearAll = () => {
        clearFilters();
        setSearch("");
    };

    // A busca por texto continua no cliente (o backend não tem parâmetro para isso)
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return noticias;
        return noticias.filter(n =>
            n.title.toLowerCase().includes(q)
            || n.subtitle.toLowerCase().includes(q)
            || n.tags.some(t => t.toLowerCase().includes(q))
        );
    }, [noticias, search]);

    const counts = useMemo(() => {
        const c: Record<string, number> = { total: noticias.length };
        ALL_TAGS.forEach(t => { c[t] = noticias.filter(n => n.tag === t).length; });
        return c;
    }, [noticias]);

    const hasFilters = selectedTags.length > 0 || selectedKeywords.length > 0 || selectedPublico !== "Todos"
        || selectedArea !== "Todos" || selectedCategoria !== "Todas" || selectedDateRange !== "Todos" || !!search;

    const filterCount = selectedTags.length
        + selectedKeywords.length
        + (selectedPublico !== "Todos" ? 1 : 0)
        + (selectedArea !== "Todos" ? 1 : 0)
        + (selectedCategoria !== "Todas" ? 1 : 0)
        + (selectedDateRange !== "Todos" ? 1 : 0)
        + (search ? 1 : 0);

    const heading = [...selectedTags, ...selectedKeywords.map(k => `#${k}`)].join(" & ");

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
            <Header />

            {/* PAGE HEADER BANNER */}
            <div className="bg-white border-b border-slate-200 py-6 px-4 md:px-8">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                            Comunicados e Notícias Institucionais
                        </h1>
                        <p className="text-xs md:text-sm text-slate-500 mt-1">
                            Acompanhe os avisos acadêmicos, eventos, seleções e publicações do IME-USP.
                        </p>
                    </div>

                    {/* SEARCH INPUT */}
                    <div className="relative w-full md:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar comunicados..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900 transition-all placeholder:text-slate-400"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="max-w-6xl w-full mx-auto px-4 md:px-8 py-8 flex-1 flex gap-8 items-start">
                {/* DESKTOP FILTER SIDEBAR */}
                {!isMobile && (
                    <aside className="w-64 shrink-0 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto pr-1">
                        <FilterPanel
                            selectedTags={selectedTags} toggleTag={toggleTag} clearTags={() => setSelectedTags([])}
                            selectedPublico={selectedPublico} setSelectedPublico={setSelectedPublico}
                            selectedArea={selectedArea} setSelectedArea={setSelectedArea}
                            selectedCategoria={selectedCategoria} setSelectedCategoria={setSelectedCategoria}
                            selectedDateRange={selectedDateRange} setSelectedDateRange={setSelectedDateRange}
                            counts={counts}
                        />
                    </aside>
                )}

                {/* MAIN LISTING AREA */}
                <main className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                {heading || "Todos os Comunicados"}
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {filtered.length} {filtered.length !== 1 ? "publicações encontradas" : "publicação encontrada"}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {isMobile && (
                                <button
                                    onClick={() => setDrawerOpen(true)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${hasFilters
                                        ? "bg-blue-900 text-white border-blue-900 shadow-xs"
                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                        }`}
                                >
                                    <SlidersHorizontal className="w-3.5 h-3.5" />
                                    <span>Filtros {filterCount > 0 && `(${filterCount})`}</span>
                                </button>
                            )}

                            {hasFilters && (
                                <button
                                    onClick={clearAll}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                                >
                                    Limpar Filtros
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ACTIVE FILTER CHIPS */}
                    <FilterChips
                        selectedTags={selectedTags} toggleTag={toggleTag}
                        selectedKeywords={selectedKeywords} toggleKeyword={toggleKeyword}
                        selectedPublico={selectedPublico} setSelectedPublico={setSelectedPublico}
                        selectedArea={selectedArea} setSelectedArea={setSelectedArea}
                        selectedCategoria={selectedCategoria} setSelectedCategoria={setSelectedCategoria}
                        selectedDateRange={selectedDateRange} setSelectedDateRange={setSelectedDateRange}
                        search={search} setSearch={setSearch}
                    />

                    {/* CARDS LIST */}
                    <div className="flex flex-col gap-3">
                        {loading ? (
                            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-xs text-slate-500 shadow-xs">
                                Carregando comunicados...
                            </div>
                        ) : error ? (
                            <div className="bg-white border border-rose-200 rounded-2xl p-12 text-center text-xs text-rose-700 shadow-xs">
                                {error}
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-xs">
                                <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-base font-bold text-slate-800 mb-1">
                                    Nenhum comunicado encontrado
                                </h3>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                                    Tente redefinir seus filtros de busca ou alterar o termo digitado.
                                </p>
                                <button
                                    onClick={clearAll}
                                    className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 transition-colors"
                                >
                                    Ver todos os comunicados
                                </button>
                            </div>
                        ) : (
                            filtered.map(item => (
                                <NoticiaCard
                                    key={item.id}
                                    item={item}
                                    isMobile={isMobile}
                                    selectedKeywords={selectedKeywords}
                                    toggleKeyword={toggleKeyword}
                                    onClick={() => setActiveItem(item)}
                                />
                            ))
                        )}
                    </div>
                </main>
            </div>

            {/* MOBILE FILTER DRAWER */}
            {isMobile && (
                <FilterDrawer
                    open={drawerOpen} onClose={() => setDrawerOpen(false)} onClear={clearFilters}
                    selectedTags={selectedTags} toggleTag={toggleTag} clearTags={() => setSelectedTags([])}
                    selectedPublico={selectedPublico} setSelectedPublico={setSelectedPublico}
                    selectedArea={selectedArea} setSelectedArea={setSelectedArea}
                    selectedCategoria={selectedCategoria} setSelectedCategoria={setSelectedCategoria}
                    selectedDateRange={selectedDateRange} setSelectedDateRange={setSelectedDateRange}
                    counts={counts}
                />
            )}

            {/* MODAL VIEW */}
            {activeItem && (
                <Modal
                    item={activeItem}
                    onClose={() => setActiveItem(null)}
                    isMobile={isMobile}
                    selectedKeywords={selectedKeywords}
                    toggleKeyword={toggleKeyword}
                />
            )}
        </div>
    );
}