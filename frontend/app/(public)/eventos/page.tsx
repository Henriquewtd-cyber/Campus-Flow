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
    Tag as TagIcon,
    ChevronRight
} from "lucide-react";

// ─── TYPES ───────────────────────────────────────────────────────────────────

type Tag = "EVENTO" | "AVISO" | "PALESTRA" | "NOTÍCIA" | "CAMAT";
type Publico = "Todos" | "Graduação" | "Pós-Graduação" | "Docentes" | "Técnicos";
type Area = "Todos" | "MAC" | "MAE" | "MAT" | "LIC" | "MAP";
type Categoria = "Todas" | "Curso" | "Vagas" | "Projeto" | "Bolsa";
type DateRange = "Todos" | "Últimos 7 dias" | "Últimos 10 dias" | "Últimos 30 dias";

type Noticia = {
    id: number;
    tag: Tag;
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

// ─── DATA & BRAND SYSTEM ──────────────────────────────────────────────────────

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

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);

const noticias: Noticia[] = [
    {
        id: 1, tag: "EVENTO", publico: ["Graduação", "Pós-Graduação"],
        area: ["MAC", "MAT"], categoria: "Curso",
        title: "Semana Acadêmica de Tecnologia",
        subtitle: "Palestras, workshops e networking com profissionais do mercado de tecnologia",
        date: "05 de Maio, 2025", rawDate: daysAgo(2), time: "08h00 – 18h00",
        local: "Auditório Principal — Bloco A",
        source: "Coordenação de Tecnologia da Informação",
        link: "https://exemplo.edu.br/semana-tec",
        body: "A Semana Acadêmica de Tecnologia é um evento anual que reúne estudantes, professores e profissionais do mercado para discutir as tendências e inovações da área. Nesta edição, contaremos com mais de 20 palestras, 8 workshops práticos e uma feira de estágios com empresas parceiras.\n\nOs temas abordados incluem: Inteligência Artificial, Cloud Computing, Segurança da Informação, DevOps e muito mais. As inscrições para os workshops são limitadas e devem ser feitas pelo Portal do Aluno.\n\nParticipantes receberão certificado de horas complementares após confirmação de presença.",
        accent: "#1e40af", glow: "transparent",
    },
    {
        id: 2, tag: "AVISO", publico: ["Graduação"],
        area: ["LIC", "MAE"], categoria: "Curso",
        title: "Rematrícula — 1º Semestre 2026",
        subtitle: "Período de rematrícula online para todos os cursos de graduação presencial",
        date: "10 a 20 de Maio, 2025", rawDate: daysAgo(5), time: "Disponível 24 horas",
        local: "Portal do Aluno — sistema.edu.br",
        source: "Secretaria Acadêmica",
        link: "https://exemplo.edu.br/rematricula",
        body: "O período de rematrícula para o 1º semestre de 2026 estará disponível das 00h00 do dia 10/05 até as 23h59 do dia 20/05 exclusivamente pelo Portal do Aluno.\n\nAtenção: alunos com pendências financeiras ou documentais não poderão realizar a rematrícula até regularização da situação junto à Secretaria Acadêmica. O não cumprimento do prazo implica em trancamento automático.\n\nEm caso de dúvidas, entre em contato com a Secretaria pelo e-mail secretaria@exemplo.edu.br ou compareça presencialmente no Bloco B, sala 102.",
        accent: "#b91c1c", glow: "transparent",
    },
    {
        id: 3, tag: "PALESTRA", publico: ["Graduação", "Pós-Graduação", "Docentes"],
        area: ["MAP", "MAT"], categoria: "Projeto",
        title: "Inteligência Artificial na Saúde",
        subtitle: "Como modelos preditivos estão transformando diagnósticos e tratamentos modernos",
        date: "12 de Maio, 2025", rawDate: daysAgo(4), time: "19h00 – 21h00",
        local: "Sala de Conferências — Bloco C",
        source: "Departamento de Ciências da Saúde",
        link: "https://exemplo.edu.br/ia-saude",
        body: "A palestra contará com a presença da Dra. Ana Luiza Ferreira, pesquisadora do Hospital Albert Einstein e referência nacional em aplicações de machine learning para diagnóstico clínico.\n\nSerão abordados casos reais de uso de IA no diagnóstico de câncer por imagem, predição de sepse em UTIs e personalização de tratamentos oncológicos. O evento é aberto a toda a comunidade acadêmica.\n\nInscrições gratuitas mas obrigatórias pelo link do evento. Vagas limitadas a 80 participantes presenciais. A palestra também será transmitida ao vivo pelo canal institucional no YouTube.",
        accent: "#047857", glow: "transparent",
    },
    {
        id: 4, tag: "NOTÍCIA", publico: ["Todos"],
        area: ["MAC", "MAE", "MAT", "LIC", "MAP"], categoria: "Projeto",
        title: "Alunos vencem hackathon nacional de inovação",
        subtitle: "Equipe do curso de Engenharia de Software conquista 1º lugar com solução de acessibilidade",
        date: "28 de Abril, 2025", rawDate: daysAgo(18), time: "",
        local: "São Paulo — SP",
        source: "Assessoria de Comunicação",
        link: "https://exemplo.edu.br/hackathon",
        body: "A equipe FormateAI, composta pelos alunos Lucas Mendes, Beatriz Costa e Rafael Teixeira do 5º período de Engenharia de Software, conquistou o 1º lugar no HackBrasil 2025, maior hackathon de inovação do país.\n\nO projeto desenvolvido, batizado de AccessPath, utiliza visão computacional para auxiliar pessoas com deficiência visual a navegar em ambientes internos de forma autônoma. A solução foi desenvolvida em 48 horas e impressionou os juízes pela robustez técnica e impacto social.\n\nA premiação incluiu R$ 50.000 em dinheiro, aceleração na AWS e mentorias com executivos de grandes empresas de tecnologia.",
        accent: "#b45309", glow: "transparent",
    },
    {
        id: 5, tag: "EVENTO", publico: ["Graduação", "Técnicos"],
        area: ["LIC", "MAP"], categoria: "Vagas",
        title: "Feira de Profissões 2025",
        subtitle: "Encontre oportunidades de estágio e emprego com mais de 40 empresas parceiras",
        date: "15 de Maio, 2025", rawDate: daysAgo(1), time: "10h00 – 17h00",
        local: "Ginásio Poliesportivo — Campus Central",
        source: "Escritório de Carreiras",
        link: "https://exemplo.edu.br/feira",
        body: "A Feira de Profissões é o maior evento de empregabilidade do instituto, reunindo mais de 40 empresas de diferentes setores para apresentar oportunidades de estágio, trainee e emprego.\n\nEste ano, contaremos com workshops de currículo e LinkedIn, simulações de entrevista com profissionais de RH e uma área exclusiva para startups da região. Traga seu currículo impresso e atualizado.\n\nAs empresas confirmadas incluem representantes dos setores de tecnologia, saúde, finanças, engenharia e educação. A entrada é gratuita para toda a comunidade acadêmica com apresentação da carteirinha estudantil.",
        accent: "#1e40af", glow: "transparent",
    },
    {
        id: 6, tag: "AVISO", publico: ["Docentes", "Técnicos"],
        area: ["MAC", "MAT"], categoria: "Vagas",
        title: "Atualização do Sistema de Ponto Eletrônico",
        subtitle: "Nova versão do sistema entra em vigor a partir de 1º de Junho de 2025",
        date: "08 de Maio, 2025", rawDate: daysAgo(8), time: "",
        local: "Portal RH — rh.exemplo.edu.br",
        source: "Departamento de Recursos Humanos",
        link: "https://exemplo.edu.br/ponto",
        body: "Informamos que o sistema de ponto eletrônico será atualizado a partir do dia 1º de junho de 2025. A nova versão contará com autenticação biométrica via aplicativo mobile, histórico completo de registros e funcionalidade de justificativa de ausências online.\n\nTodos os servidores deverão instalar o novo aplicativo ePonto Institucional (disponível para iOS e Android) e realizar o cadastro biométrico até o dia 25/05 nas estações de cadastramento instaladas no RH e no Bloco Administrativo.\n\nO sistema legado continuará operacional em paralelo até 30/06. Dúvidas pelo e-mail rh@exemplo.edu.br.",
        accent: "#b91c1c", glow: "transparent",
    },
    {
        id: 7, tag: "PALESTRA", publico: ["Pós-Graduação", "Docentes"],
        area: ["MAE", "LIC"], categoria: "Bolsa",
        title: "Metodologias de Pesquisa Aplicada",
        subtitle: "Seminário sobre métodos qualitativos e quantitativos para dissertações e teses",
        date: "20 de Maio, 2025", rawDate: daysAgo(3), time: "14h00 – 17h00",
        local: "Biblioteca Central — Sala de Estudos Coletivos",
        source: "Programa de Pós-Graduação",
        link: "https://exemplo.edu.br/pesquisa",
        body: "O seminário abordará as principais metodologias de pesquisa científica aplicadas a dissertações de mestrado e teses de doutorado, com foco prático em como escolher e justificar o método mais adequado para cada objeto de estudo.\n\nOs palestrantes são o Prof. Dr. Marcos Antônio Silva (UFSP) e a Profa. Dra. Cláudia Rocha (Unicamp), ambos com extensa experiência na orientação de pesquisas de pós-graduação nas áreas de ciências humanas, exatas e biológicas.\n\nEvento voltado principalmente a alunos de mestrado e doutorado, mas aberto a graduandos interessados em iniciação científica.",
        accent: "#047857", glow: "transparent",
    },
    {
        id: 8, tag: "NOTÍCIA", publico: ["Todos"],
        area: ["MAC", "MAE", "MAT", "LIC", "MAP"], categoria: "Bolsa",
        title: "Nova biblioteca digital com 50 mil títulos disponível",
        subtitle: "Plataforma integrada oferece acesso gratuito a livros, artigos e periódicos internacionais",
        date: "01 de Maio, 2025", rawDate: daysAgo(25), time: "",
        local: "biblioteca.exemplo.edu.br",
        source: "Biblioteca Central",
        link: "https://exemplo.edu.br/biblioteca",
        body: "A Biblioteca Central anuncia a disponibilização da nova plataforma de biblioteca digital, com acesso a mais de 50.000 títulos entre livros técnicos, obras literárias, artigos científicos e periódicos internacionais.\n\nO acesso é feito mediante login institucional (mesmo usuário e senha do e-mail da instituição) diretamente pelo endereço biblioteca.exemplo.edu.br ou pelo aplicativo BiblioApp, disponível para iOS e Android.\n\nA plataforma também conta com ferramentas de marcação, criação de listas de leitura e histórico de acesso. Todos os alunos, professores e técnico-administrativos têm acesso pleno e gratuito durante o período de vínculo com a instituição.",
        accent: "#b45309", glow: "transparent",
    },
];

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

const TagBadge = ({ tag, size = "md" }: { tag: Tag; size?: "sm" | "md" }) => {
    const config = TAG_CONFIG[tag];
    const Icon = config.icon;
    return (
        <span
            className={`inline-flex items-center gap-1 font-bold rounded-full border transition-colors uppercase tracking-wider ${
                size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
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
                                className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                                    active
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
                        className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                            selectedTags.length === 0
                                ? "bg-blue-900 text-white shadow-xs"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                    >
                        <span>Todos os Tipos</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedTags.length === 0 ? "bg-blue-800 text-blue-100" : "bg-slate-100 text-slate-500"}`}>
                            {noticias.length}
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
                                className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                                    active
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
                                className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                                    active
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
                                className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                                    active
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
                                className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                                    active
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
    open, onClose,
    selectedTags, toggleTag, clearTags,
    selectedPublico, setSelectedPublico,
    selectedArea, setSelectedArea,
    selectedCategoria, setSelectedCategoria,
    selectedDateRange, setSelectedDateRange,
    counts,
}: {
    open: boolean; onClose: () => void;
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
                            onClick={() => { clearTags(); setSelectedPublico("Todos"); setSelectedArea("Todos"); setSelectedCategoria("Todas"); setSelectedDateRange("Todos"); }}
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
    selectedPublico, setSelectedPublico,
    selectedArea, setSelectedArea,
    selectedCategoria, setSelectedCategoria,
    selectedDateRange, setSelectedDateRange,
    search, setSearch,
}: {
    selectedTags: Tag[]; toggleTag: (t: Tag) => void;
    selectedPublico: Publico; setSelectedPublico: (p: Publico) => void;
    selectedArea: Area; setSelectedArea: (a: Area) => void;
    selectedCategoria: Categoria; setSelectedCategoria: (c: Categoria) => void;
    selectedDateRange: DateRange; setSelectedDateRange: (d: DateRange) => void;
    search: string; setSearch: (s: string) => void;
}) => {
    const chips = [
        ...selectedTags.map(t => ({ label: t, onRemove: () => toggleTag(t) })),
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

const Modal = ({ item, onClose, isMobile }: { item: Noticia; onClose: () => void; isMobile: boolean }) => {
    const config = TAG_CONFIG[item.tag];

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
                    <p className="text-xs md:text-sm font-medium text-slate-600 leading-relaxed">
                        {item.subtitle}
                    </p>
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
                                <div className="text-xs font-semibold text-slate-800">{item.local}</div>
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

const NoticiaCard = ({ item, onClick, isMobile }: { item: Noticia; onClick: () => void; isMobile: boolean }) => {
    const config = TAG_CONFIG[item.tag];
    const Icon = config.icon;

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
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [selectedPublico, setSelectedPublico] = useState<Publico>("Todos");
    const [selectedArea, setSelectedArea] = useState<Area>("Todos");
    const [selectedCategoria, setSelectedCategoria] = useState<Categoria>("Todas");
    const [selectedDateRange, setSelectedDateRange] = useState<DateRange>("Todos");
    const [search, setSearch] = useState("");
    const [activeItem, setActiveItem] = useState<Noticia | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    useEffect(() => {
        const check = () => {
            setIsMobile(window.innerWidth < 768);
            setIsTablet(window.innerWidth < 1024);
        };
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const toggleTag = (tag: Tag) =>
        setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

    const clearAll = () => {
        setSelectedTags([]);
        setSelectedPublico("Todos");
        setSelectedArea("Todos");
        setSelectedCategoria("Todas");
        setSelectedDateRange("Todos");
        setSearch("");
    };

    const getDateLimit = (range: DateRange): Date | null => {
        if (range === "Últimos 7 dias") return daysAgo(7);
        if (range === "Últimos 10 dias") return daysAgo(10);
        if (range === "Últimos 30 dias") return daysAgo(30);
        return null;
    };

    const filtered = useMemo(() => noticias.filter(n => {
        if (selectedTags.length > 0 && !selectedTags.includes(n.tag)) return false;
        if (selectedPublico !== "Todos" && !n.publico.includes(selectedPublico)) return false;
        if (selectedArea !== "Todos" && !n.area.includes(selectedArea)) return false;
        if (selectedCategoria !== "Todas" && n.categoria !== selectedCategoria) return false;
        const dateLimit = getDateLimit(selectedDateRange);
        if (dateLimit && n.rawDate < dateLimit) return false;
        if (search.trim()) {
            const q = search.toLowerCase();
            if (!n.title.toLowerCase().includes(q) && !n.subtitle.toLowerCase().includes(q)) return false;
        }
        return true;
    }), [selectedTags, selectedPublico, selectedArea, selectedCategoria, selectedDateRange, search]);

    const counts = useMemo(() => {
        const c: Record<string, number> = {};
        ALL_TAGS.forEach(t => { c[t] = noticias.filter(n => n.tag === t).length; });
        return c;
    }, []);

    const hasFilters = selectedTags.length > 0 || selectedPublico !== "Todos" || selectedArea !== "Todos"
        || selectedCategoria !== "Todas" || selectedDateRange !== "Todos" || !!search;

    const filterCount = selectedTags.length
        + (selectedPublico !== "Todos" ? 1 : 0)
        + (selectedArea !== "Todos" ? 1 : 0)
        + (selectedCategoria !== "Todas" ? 1 : 0)
        + (selectedDateRange !== "Todos" ? 1 : 0)
        + (search ? 1 : 0);

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
                                {selectedTags.length === 0 ? "Todos os Comunicados" : selectedTags.join(" & ")}
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {filtered.length} publicação{filtered.length !== 1 ? "ões" : "ão"} encontrada{filtered.length !== 1 ? "s" : ""}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {isMobile && (
                                <button
                                    onClick={() => setDrawerOpen(true)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                        hasFilters
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
                        selectedPublico={selectedPublico} setSelectedPublico={setSelectedPublico}
                        selectedArea={selectedArea} setSelectedArea={setSelectedArea}
                        selectedCategoria={selectedCategoria} setSelectedCategoria={setSelectedCategoria}
                        selectedDateRange={selectedDateRange} setSelectedDateRange={setSelectedDateRange}
                        search={search} setSearch={setSearch}
                    />

                    {/* CARDS LIST */}
                    <div className="flex flex-col gap-3">
                        {filtered.length === 0 ? (
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
                    open={drawerOpen} onClose={() => setDrawerOpen(false)}
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
                <Modal item={activeItem} onClose={() => setActiveItem(null)} isMobile={isMobile} />
            )}
        </div>
    );
}