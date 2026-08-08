"use client";

import { useState, useMemo, useEffect } from "react";

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

// ─── DATA ────────────────────────────────────────────────────────────────────

const TAG_COLORS: Record<Tag, { accent: string; glow: string; bg: string }> = {
    "EVENTO": { accent: "#3b82f6", glow: "rgba(59,130,246,0.35)", bg: "rgba(59,130,246,0.12)" },
    "AVISO": { accent: "#f43f5e", glow: "rgba(244,63,94,0.35)", bg: "rgba(244,63,94,0.12)" },
    "PALESTRA": { accent: "#10b981", glow: "rgba(16,185,129,0.35)", bg: "rgba(16,185,129,0.12)" },
    "NOTÍCIA": { accent: "#f59e0b", glow: "rgba(245,158,11,0.35)", bg: "rgba(245,158,11,0.12)" },
    "CAMAT": { accent: "#f472b6", glow: "rgba(244,114,182,0.35)", bg: "rgba(244,114,182,0.12)" },
};

const AREA_COLORS: Record<Area, { accent: string; bg: string }> = {
    "Todos": { accent: "#94a3b8", bg: "rgba(148,163,184,0.1)" },
    "MAC": { accent: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
    "MAE": { accent: "#34d399", bg: "rgba(52,211,153,0.12)" },
    "MAT": { accent: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
    "LIC": { accent: "#fb923c", bg: "rgba(251,146,60,0.12)" },
    "MAP": { accent: "#f472b6", bg: "rgba(244,114,182,0.12)" },
};

const CATEGORIA_COLORS: Record<Categoria, { accent: string; bg: string }> = {
    "Todas": { accent: "#94a3b8", bg: "rgba(148,163,184,0.1)" },
    "Curso": { accent: "#38bdf8", bg: "rgba(56,189,248,0.12)" },
    "Vagas": { accent: "#4ade80", bg: "rgba(74,222,128,0.12)" },
    "Projeto": { accent: "#c084fc", bg: "rgba(192,132,252,0.12)" },
    "Bolsa": { accent: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
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
        accent: "#3b82f6", glow: "rgba(59,130,246,0.35)",
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
        accent: "#f43f5e", glow: "rgba(244,63,94,0.35)",
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
        accent: "#10b981", glow: "rgba(16,185,129,0.35)",
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
        accent: "#f59e0b", glow: "rgba(245,158,11,0.35)",
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
        accent: "#3b82f6", glow: "rgba(59,130,246,0.35)",
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
        accent: "#f43f5e", glow: "rgba(244,63,94,0.35)",
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
        accent: "#10b981", glow: "rgba(16,185,129,0.35)",
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
        accent: "#f59e0b", glow: "rgba(245,158,11,0.35)",
    },
];

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

const TagBadge = ({ tag, size = "md" }: { tag: Tag; size?: "sm" | "md" }) => {
    const c = TAG_COLORS[tag];
    return (
        <span style={{
            fontSize: size === "sm" ? 9 : 10, fontWeight: 800,
            background: c.bg, color: c.accent,
            padding: size === "sm" ? "2px 8px" : "3px 12px",
            borderRadius: 20, border: `1px solid ${c.accent}44`,
            letterSpacing: 1.2, textTransform: "uppercase" as const,
            whiteSpace: "nowrap" as const,
        }}>{tag}</span>
    );
};

const PublicoBadge = ({ p }: { p: Publico }) => (
    <span style={{
        fontSize: 9, fontWeight: 700,
        background: "rgba(255,255,255,0.06)", color: "#94a3b8",
        padding: "2px 8px", borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.1)",
        letterSpacing: 0.3, whiteSpace: "nowrap" as const,
    }}>{p}</span>
);

// ─── SECTION HEADER ───────────────────────────────────────────────────────────

const SectionHeader = ({ label }: { label: string }) => (
    <div style={{
        fontSize: 10, fontWeight: 800, color: "#475569",
        letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 14,
    }}>{label}</div>
);

// ─── FILTER PANEL (shared content) ───────────────────────────────────────────

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
    const panelStyle = {
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14, padding: 18,
    };

    const baseBtn = (active: boolean, accent?: string) => ({
        background: active ? (accent ? `${accent}22` : "rgba(59,130,246,0.15)") : "transparent",
        border: `1px solid ${active ? (accent ? `${accent}44` : "#3b82f644") : "rgba(255,255,255,0.07)"}`,
        borderLeft: `3px solid ${active ? (accent || "#3b82f6") : "transparent"}`,
        borderRadius: 8, padding: "8px 12px", cursor: "pointer",
        textAlign: "left" as const,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        color: active ? (accent || "#3b82f6") : "#64748b",
        fontSize: 12, fontWeight: 700, transition: "all 0.15s ease",
        width: "100%",
    });

    return (
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
            {/* DATA */}
            <div style={panelStyle}>
                <SectionHeader label="Período" />
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                    {ALL_DATE_RANGES.map(dr => {
                        const active = selectedDateRange === dr;
                        return (
                            <button key={dr} onClick={() => { setSelectedDateRange(dr); onItemClick?.(); }}
                                style={baseBtn(active, "#6366f1")}>
                                <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                    <span style={{ fontSize: 12 }}>
                                        {dr === "Todos" ? "🗓️" : dr === "Últimos 7 dias" ? "⚡" : dr === "Últimos 10 dias" ? "📅" : "🔄"}
                                    </span>
                                    {dr}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* TIPO */}
            <div style={panelStyle}>
                <SectionHeader label="Tipo de Conteúdo" />
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                    <button onClick={() => { clearTags(); onItemClick?.(); }} style={{
                        background: selectedTags.length === 0 ? "rgba(59,130,246,0.15)" : "transparent",
                        border: `1px solid ${selectedTags.length === 0 ? "#3b82f644" : "rgba(255,255,255,0.07)"}`,
                        borderRadius: 8, padding: "8px 12px", cursor: "pointer",
                        textAlign: "left" as const,
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        color: selectedTags.length === 0 ? "#3b82f6" : "#64748b",
                        fontSize: 12, fontWeight: 700, transition: "all 0.15s ease",
                    }}>
                        <span>Todos</span>
                        <span style={{ fontSize: 10, background: "rgba(255,255,255,0.08)", padding: "1px 6px", borderRadius: 6, color: "#64748b" }}>
                            {noticias.length}
                        </span>
                    </button>
                    {ALL_TAGS.map(tag => {
                        const c = TAG_COLORS[tag];
                        const active = selectedTags.includes(tag);
                        return (
                            <button key={tag} onClick={() => { toggleTag(tag); onItemClick?.(); }} style={{
                                background: active ? c.bg : "transparent",
                                border: `1px solid ${active ? c.accent + "44" : "rgba(255,255,255,0.07)"}`,
                                borderLeft: `3px solid ${active ? c.accent : "transparent"}`,
                                borderRadius: 8, padding: "8px 12px", cursor: "pointer",
                                textAlign: "left" as const,
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                color: active ? c.accent : "#64748b",
                                fontSize: 12, fontWeight: 700, transition: "all 0.15s ease",
                            }}>
                                <span>{tag}</span>
                                <span style={{
                                    fontSize: 10,
                                    background: active ? c.bg : "rgba(255,255,255,0.08)",
                                    padding: "1px 6px", borderRadius: 6,
                                    color: active ? c.accent : "#64748b",
                                }}>{counts[tag]}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* CATEGORIA */}
            <div style={panelStyle}>
                <SectionHeader label="Categoria" />
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                    {ALL_CATEGORIAS.map(cat => {
                        const active = selectedCategoria === cat;
                        const c = CATEGORIA_COLORS[cat];
                        return (
                            <button key={cat} onClick={() => { setSelectedCategoria(cat); onItemClick?.(); }}
                                style={{
                                    background: active ? c.bg : "transparent",
                                    border: `1px solid ${active ? c.accent + "44" : "rgba(255,255,255,0.07)"}`,
                                    borderLeft: `3px solid ${active ? c.accent : "transparent"}`,
                                    borderRadius: 8, padding: "8px 12px", cursor: "pointer",
                                    textAlign: "left" as const,
                                    display: "flex", alignItems: "center", gap: 8,
                                    color: active ? c.accent : "#64748b",
                                    fontSize: 12, fontWeight: 700, transition: "all 0.15s ease",
                                    width: "100%",
                                }}>
                                <span style={{ fontSize: 12 }}>
                                    {cat === "Todas" ? "🏷️" : cat === "Curso" ? "📚" : cat === "Vagas" ? "💼" : cat === "Projeto" ? "🔬" : "🎓"}
                                </span>
                                {cat}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ÁREA */}
            <div style={panelStyle}>
                <SectionHeader label="Área" />
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                    {ALL_AREAS.map(area => {
                        const active = selectedArea === area;
                        const c = AREA_COLORS[area];
                        return (
                            <button key={area} onClick={() => { setSelectedArea(area); onItemClick?.(); }}
                                style={{
                                    background: active ? c.bg : "transparent",
                                    border: `1px solid ${active ? c.accent + "44" : "rgba(255,255,255,0.07)"}`,
                                    borderLeft: `3px solid ${active ? c.accent : "transparent"}`,
                                    borderRadius: 8, padding: "8px 12px", cursor: "pointer",
                                    textAlign: "left" as const,
                                    display: "flex", alignItems: "center", gap: 8,
                                    color: active ? c.accent : "#64748b",
                                    fontSize: 12, fontWeight: 700, transition: "all 0.15s ease",
                                    width: "100%",
                                }}>
                                {area !== "Todos" && (
                                    <span style={{
                                        width: 18, height: 18, borderRadius: 4,
                                        background: c.bg, border: `1px solid ${c.accent}44`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 8, fontWeight: 900, color: c.accent, flexShrink: 0,
                                    }}>{area}</span>
                                )}
                                {area === "Todos" ? "Todas as áreas" : area}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* PÚBLICO */}
            <div style={panelStyle}>
                <SectionHeader label="Público-Alvo" />
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                    {ALL_PUBLICOS.map(p => {
                        const active = selectedPublico === p;
                        return (
                            <button key={p} onClick={() => { setSelectedPublico(p); onItemClick?.(); }} style={{
                                background: active ? "rgba(99,102,241,0.15)" : "transparent",
                                border: `1px solid ${active ? "#6366f144" : "rgba(255,255,255,0.07)"}`,
                                borderLeft: `3px solid ${active ? "#6366f1" : "transparent"}`,
                                borderRadius: 8, padding: "8px 12px", cursor: "pointer",
                                textAlign: "left" as const,
                                color: active ? "#818cf8" : "#64748b",
                                fontSize: 12, fontWeight: 700, transition: "all 0.15s ease",
                                width: "100%",
                            }}>{p}</button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// ─── FILTER DRAWER (mobile bottom sheet) ─────────────────────────────────────

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

    return (
        <>
            <div onClick={onClose} style={{
                position: "fixed", inset: 0, zIndex: 60,
                background: "rgba(0,0,0,0.65)",
                opacity: open ? 1 : 0,
                pointerEvents: open ? "auto" : "none",
                transition: "opacity 0.25s ease",
                backdropFilter: "blur(3px)",
            }} />
            <div style={{
                position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 61,
                background: "#0d1526",
                borderTop: "2px solid #3b82f6",
                borderRadius: "20px 20px 0 0",
                maxHeight: "88dvh",
                transform: open ? "translateY(0)" : "translateY(100%)",
                transition: "transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)",
                display: "flex", flexDirection: "column" as const,
                boxShadow: "0 -8px 60px rgba(59,130,246,0.25)",
            }}>
                <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 6px", flexShrink: 0 }}>
                    <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)" }} />
                </div>
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0 20px 14px", flexShrink: 0,
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: "#f8fafc" }}>Filtros</span>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => { clearTags(); setSelectedPublico("Todos"); setSelectedArea("Todos"); setSelectedCategoria("Todas"); setSelectedDateRange("Todos"); }} style={{
                            background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)",
                            borderRadius: 8, padding: "6px 14px",
                            color: "#f43f5e", fontSize: 11, fontWeight: 700, cursor: "pointer",
                        }}>Limpar</button>
                        <button onClick={onClose} style={{
                            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 8, width: 34, height: 34,
                            color: "#94a3b8", cursor: "pointer", fontSize: 16,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>✕</button>
                    </div>
                </div>
                <div style={{ overflowY: "auto", flex: 1, padding: "16px 20px 32px" }}>
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
        </>
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
        ...selectedTags.map(t => ({ label: t, color: TAG_COLORS[t].accent, onRemove: () => toggleTag(t) })),
        ...(selectedPublico !== "Todos" ? [{ label: selectedPublico, color: "#818cf8", onRemove: () => setSelectedPublico("Todos") }] : []),
        ...(selectedArea !== "Todos" ? [{ label: selectedArea, color: AREA_COLORS[selectedArea].accent, onRemove: () => setSelectedArea("Todos") }] : []),
        ...(selectedCategoria !== "Todas" ? [{ label: selectedCategoria, color: CATEGORIA_COLORS[selectedCategoria].accent, onRemove: () => setSelectedCategoria("Todas") }] : []),
        ...(selectedDateRange !== "Todos" ? [{ label: selectedDateRange, color: "#6366f1", onRemove: () => setSelectedDateRange("Todos") }] : []),
        ...(search ? [{ label: `"${search}"`, color: "#64748b", onRemove: () => setSearch("") }] : []),
    ];
    if (chips.length === 0) return null;
    return (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 14 }}>
            {chips.map((chip, i) => (
                <button key={i} onClick={chip.onRemove} style={{
                    display: "flex", alignItems: "center", gap: 5,
                    background: `${chip.color}18`,
                    border: `1px solid ${chip.color}44`,
                    borderRadius: 20, padding: "4px 10px 4px 12px",
                    color: chip.color, fontSize: 11, fontWeight: 700, cursor: "pointer",
                }}>
                    {chip.label} <span style={{ fontSize: 11, opacity: 0.7 }}>✕</span>
                </button>
            ))}
        </div>
    );
};

// ─── MODAL ────────────────────────────────────────────────────────────────────

const Modal = ({ item, onClose, isMobile }: { item: Noticia; onClose: () => void; isMobile: boolean }) => {
    const c = TAG_COLORS[item.tag];
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    return (
        <div onClick={onClose} style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
            padding: isMobile ? 0 : 24,
            backdropFilter: "blur(4px)",
        }}>
            <div onClick={e => e.stopPropagation()} style={{
                background: "#0d1526",
                border: `1px solid ${c.accent}44`,
                borderTop: `3px solid ${c.accent}`,
                borderRadius: isMobile ? "20px 20px 0 0" : 16,
                width: "100%", maxWidth: isMobile ? "100%" : 660,
                maxHeight: isMobile ? "92dvh" : "85vh",
                overflow: "hidden",
                display: "flex", flexDirection: "column" as const,
                boxShadow: `0 0 80px ${c.glow}`,
            }}>
                {isMobile && (
                    <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px", flexShrink: 0 }}>
                        <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)" }} />
                    </div>
                )}

                <div style={{
                    padding: isMobile ? "14px 20px 16px" : "24px 28px 20px",
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                    background: `linear-gradient(160deg, ${c.accent}18, transparent 60%)`,
                    flexShrink: 0,
                }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" as const }}>
                                <TagBadge tag={item.tag} />
                                {item.publico.map(p => <PublicoBadge key={p} p={p} />)}
                                {item.area.slice(0, 3).map(a => (
                                    <span key={a} style={{
                                        fontSize: 9, fontWeight: 800,
                                        background: AREA_COLORS[a].bg, color: AREA_COLORS[a].accent,
                                        padding: "2px 7px", borderRadius: 6,
                                        border: `1px solid ${AREA_COLORS[a].accent}44`,
                                        letterSpacing: 0.5,
                                    }}>{a}</span>
                                ))}
                                <span style={{
                                    fontSize: 9, fontWeight: 800,
                                    background: CATEGORIA_COLORS[item.categoria].bg,
                                    color: CATEGORIA_COLORS[item.categoria].accent,
                                    padding: "2px 7px", borderRadius: 6,
                                    border: `1px solid ${CATEGORIA_COLORS[item.categoria].accent}44`,
                                }}>{item.categoria}</span>
                            </div>
                            <h2 style={{
                                fontSize: isMobile ? 20 : 26, fontWeight: 900, color: "#f8fafc",
                                margin: 0, lineHeight: 1.2, letterSpacing: -0.3,
                                textShadow: `0 0 40px ${c.glow}`,
                            }}>{item.title}</h2>
                            <p style={{ fontSize: isMobile ? 13 : 14, color: "#94a3b8", margin: "8px 0 0", lineHeight: 1.5 }}>
                                {item.subtitle}
                            </p>
                        </div>
                        <button onClick={onClose} style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 8, width: 34, height: 34, flexShrink: 0,
                            color: "#94a3b8", cursor: "pointer", fontSize: 16,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>✕</button>
                    </div>
                </div>

                <div style={{ overflowY: "auto", flex: 1 }}>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr",
                        gap: 10,
                        padding: isMobile ? "16px 20px 0" : "20px 28px 0",
                    }}>
                        {[
                            ["📅 Data", item.date],
                            ["🕐 Horário", item.time || "—"],
                            ["📍 Local", item.local],
                            ["📡 Fonte", item.source],
                        ].map(([label, val]) => (
                            <div key={label} style={{
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.07)",
                                borderLeft: `3px solid ${c.accent}`,
                                borderRadius: 10, padding: "10px 14px",
                            }}>
                                <div style={{ fontSize: 10, color: "#475569", fontWeight: 700, marginBottom: 3, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>{label}</div>
                                <div style={{ fontSize: isMobile ? 12 : 13, fontWeight: 600, color: "#e2e8f0" }}>{val}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ padding: isMobile ? "16px 20px" : "20px 28px" }}>
                        <div style={{
                            fontSize: 10, fontWeight: 800, color: "#475569",
                            letterSpacing: 2, textTransform: "uppercase" as const,
                            marginBottom: 12, display: "flex", alignItems: "center", gap: 8,
                        }}>
                            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                            Sobre
                            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                        </div>
                        {item.body.split("\n\n").map((para, i) => (
                            <p key={i} style={{
                                fontSize: isMobile ? 13 : 14, color: "#94a3b8",
                                lineHeight: 1.75, margin: "0 0 14px",
                                borderLeft: i === 0 ? `2px solid ${c.accent}` : "none",
                                paddingLeft: i === 0 ? 14 : 0,
                            }}>{para}</p>
                        ))}
                    </div>

                    <div style={{
                        margin: isMobile ? "0 20px 28px" : "0 28px 24px",
                        background: "rgba(255,255,255,0.03)",
                        border: `1px solid ${c.accent}33`,
                        borderRadius: 10, padding: "14px 16px",
                        display: "flex",
                        flexDirection: isMobile ? "column" as const : "row" as const,
                        alignItems: isMobile ? "stretch" : "center",
                        gap: 12,
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 10, color: "#475569", fontWeight: 700, marginBottom: 3, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Link</div>
                            <div style={{ fontSize: 12, color: c.accent, fontWeight: 600, wordBreak: "break-all" as const }}>{item.link}</div>
                        </div>
                        <a href={item.link} target="_blank" rel="noopener noreferrer" style={{
                            background: c.accent, color: "#fff",
                            fontSize: 12, fontWeight: 800,
                            padding: "11px 20px", borderRadius: 8,
                            textDecoration: "none", letterSpacing: 0.5,
                            boxShadow: `0 0 16px ${c.glow}`,
                            textAlign: "center" as const, whiteSpace: "nowrap" as const,
                        }}>Acessar →</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── CARD ─────────────────────────────────────────────────────────────────────

const NoticiaCard = ({ item, onClick, isMobile }: { item: Noticia; onClick: () => void; isMobile: boolean }) => {
    const [hover, setHover] = useState(false);
    const c = TAG_COLORS[item.tag];
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                background: hover ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.025)",
                borderTop: `1px solid ${hover ? c.accent + "55" : "rgba(255,255,255,0.07)"}`,
                borderRight: `1px solid ${hover ? c.accent + "55" : "rgba(255,255,255,0.07)"}`,
                borderBottom: `1px solid ${hover ? c.accent + "55" : "rgba(255,255,255,0.07)"}`,
                borderLeft: `3px solid ${c.accent}`,
                borderRadius: 12, padding: isMobile ? "14px 14px" : "16px 20px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: hover ? `0 0 24px ${c.glow}` : "none",
                display: "flex", gap: isMobile ? 12 : 16, alignItems: "flex-start",
            }}
        >
            <div style={{
                width: isMobile ? 36 : 40, height: isMobile ? 36 : 40,
                borderRadius: 10, flexShrink: 0,
                background: c.bg, border: `1px solid ${c.accent}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: isMobile ? 16 : 18,
            }}>
                {item.tag === "EVENTO" ? "📅" : item.tag === "AVISO" ? "⚠️" : item.tag === "PALESTRA" ? "🎤" : "📰"}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5, flexWrap: "wrap" as const }}>
                    <TagBadge tag={item.tag} size="sm" />
                    {!isMobile && item.publico.map(p => <PublicoBadge key={p} p={p} />)}
                    {!isMobile && item.area.slice(0, 2).map(a => (
                        <span key={a} style={{
                            fontSize: 9, fontWeight: 800,
                            background: AREA_COLORS[a].bg, color: AREA_COLORS[a].accent,
                            padding: "2px 6px", borderRadius: 5,
                            border: `1px solid ${AREA_COLORS[a].accent}33`,
                        }}>{a}</span>
                    ))}
                    {!isMobile && (
                        <span style={{
                            fontSize: 9, fontWeight: 700,
                            background: CATEGORIA_COLORS[item.categoria].bg,
                            color: CATEGORIA_COLORS[item.categoria].accent,
                            padding: "2px 6px", borderRadius: 5,
                            border: `1px solid ${CATEGORIA_COLORS[item.categoria].accent}33`,
                        }}>{item.categoria}</span>
                    )}
                    <span style={{ fontSize: 10, color: "#475569", marginLeft: "auto" }}>{item.date}</span>
                </div>
                <h3 style={{ fontSize: isMobile ? 14 : 15, fontWeight: 800, color: "#f1f5f9", margin: "0 0 4px", lineHeight: 1.3 }}>
                    {item.title}
                </h3>
                <p style={{
                    fontSize: 12, color: "#64748b", margin: 0, lineHeight: 1.5,
                    overflow: "hidden", textOverflow: "ellipsis",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as never,
                }}>{item.subtitle}</p>
                {!isMobile && item.time && (
                    <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                        <span style={{ fontSize: 11, color: "#475569" }}>🕐 {item.time}</span>
                        <span style={{ fontSize: 11, color: "#475569" }}>📍 {item.local}</span>
                    </div>
                )}
            </div>

            <div style={{
                color: hover ? c.accent : "#334155",
                fontSize: 22, flexShrink: 0,
                transition: "all 0.2s ease",
                transform: hover ? "translateX(3px)" : "none",
                alignSelf: "center",
            }}>›</div>
        </div>
    );
};

// ─── PAGE ─────────────────────────────────────────────────────────────────────

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
        <div style={{
            fontFamily: "'Segoe UI', system-ui, sans-serif",
            background: "#070d1a",
            minHeight: "100vh",
            color: "#e2e8f0",
            fontSize: 13,
        }}>
            <div style={{
                position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
                backgroundImage: "linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
            }} />

            <header style={{
                position: "sticky", top: 0, zIndex: 50,
                background: "rgba(7,13,26,0.97)",
                borderBottom: "2px solid #3b82f6",
                padding: isMobile ? "0 16px" : "0 32px",
                height: isMobile ? 56 : 64,
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                boxShadow: "0 0 40px rgba(59,130,246,0.2)",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                    <div style={{
                        width: isMobile ? 34 : 40, height: isMobile ? 34 : 40,
                        borderRadius: 9,
                        background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 0 16px rgba(59,130,246,0.4)", flexShrink: 0,
                    }}>
                        <svg width={isMobile ? 18 : 22} height={isMobile ? 18 : 22} viewBox="0 0 26 26" fill="none">
                            <rect x="3" y="14" width="5" height="8" rx="1" fill="#fff" />
                            <rect x="10.5" y="9" width="5" height="13" rx="1" fill="#fff" />
                            <rect x="18" y="5" width="5" height="17" rx="1" fill="#fff" />
                            <circle cx="5.5" cy="7" r="3" fill="rgba(255,255,255,0.7)" />
                        </svg>
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: isMobile ? 13 : 17, color: "#f8fafc", letterSpacing: 1, textTransform: "uppercase" as const }}>
                            {isMobile ? "IE" : "IME-USP 2026"}
                        </div>
                        {!isMobile && (
                            <div style={{ fontSize: 10, color: "#475569", letterSpacing: 0.5, textTransform: "uppercase" as const }}>
                                Portal de Notícias &amp; Comunicados
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ position: "relative", flex: 1, maxWidth: isMobile ? "none" : 300 }}>
                    <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#475569" }}>🔍</span>
                    <input
                        type="text"
                        placeholder={isMobile ? "Buscar..." : "Buscar notícias..."}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            width: "100%", boxSizing: "border-box" as const,
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 10, padding: "8px 12px 8px 32px",
                            color: "#e2e8f0", fontSize: 13, outline: "none",
                        }}
                    />
                </div>

                {isMobile && (
                    <button onClick={() => setDrawerOpen(true)} style={{
                        background: hasFilters ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.06)",
                        border: `1px solid ${hasFilters ? "#3b82f666" : "rgba(255,255,255,0.1)"}`,
                        borderRadius: 10, padding: "8px 12px",
                        color: hasFilters ? "#60a5fa" : "#94a3b8",
                        fontSize: 12, fontWeight: 700, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
                        whiteSpace: "nowrap" as const,
                    }}>
                        ⚙️{filterCount > 0 ? ` ${filterCount}` : " Filtros"}
                    </button>
                )}
            </header>

            <div style={{
                position: "relative", zIndex: 1,
                maxWidth: 1100, margin: "0 auto",
                padding: isMobile ? "20px 16px 40px" : isTablet ? "28px 20px" : "32px 28px",
                display: "flex", gap: 28, alignItems: "flex-start",
            }}>
                {!isMobile && (
                    <aside style={{
                        width: isTablet ? 200 : 220,
                        flexShrink: 0,
                        position: "sticky", top: 84,
                        maxHeight: "calc(100vh - 100px)",
                        overflowY: "auto",
                        scrollbarWidth: "none" as const,
                    }}>
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

                <main style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        display: "flex", alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 14, gap: 12, flexWrap: "wrap" as const,
                    }}>
                        <div>
                            <h1 style={{
                                fontSize: isMobile ? 20 : 24, fontWeight: 900,
                                color: "#f8fafc", margin: 0, letterSpacing: -0.3,
                            }}>
                                {selectedTags.length === 0 ? "Todos os comunicados" : selectedTags.join(" + ")}
                            </h1>
                            <p style={{ fontSize: 12, color: "#475569", margin: "4px 0 0" }}>
                                {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
                                {selectedPublico !== "Todos" ? ` · ${selectedPublico}` : ""}
                                {selectedArea !== "Todos" ? ` · ${selectedArea}` : ""}
                                {selectedCategoria !== "Todas" ? ` · ${selectedCategoria}` : ""}
                                {selectedDateRange !== "Todos" ? ` · ${selectedDateRange}` : ""}
                            </p>
                        </div>
                        {!isMobile && hasFilters && (
                            <button onClick={clearAll} style={{
                                background: "rgba(244,63,94,0.12)",
                                border: "1px solid rgba(244,63,94,0.3)",
                                borderRadius: 8, padding: "7px 14px",
                                color: "#f43f5e", fontSize: 11, fontWeight: 700, cursor: "pointer",
                            }}>✕ Limpar filtros</button>
                        )}
                    </div>

                    {isMobile && (
                        <FilterChips
                            selectedTags={selectedTags} toggleTag={toggleTag}
                            selectedPublico={selectedPublico} setSelectedPublico={setSelectedPublico}
                            selectedArea={selectedArea} setSelectedArea={setSelectedArea}
                            selectedCategoria={selectedCategoria} setSelectedCategoria={setSelectedCategoria}
                            selectedDateRange={selectedDateRange} setSelectedDateRange={setSelectedDateRange}
                            search={search} setSearch={setSearch}
                        />
                    )}

                    <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                        {filtered.length === 0 ? (
                            <div style={{
                                background: "rgba(255,255,255,0.025)",
                                border: "1px solid rgba(255,255,255,0.07)",
                                borderRadius: 14,
                                padding: isMobile ? "40px 20px" : 48,
                                textAlign: "center" as const,
                            }}>
                                <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>Nenhum resultado encontrado</div>
                                <div style={{ fontSize: 12, color: "#475569" }}>Tente ajustar os filtros ou a busca</div>
                            </div>
                        ) : filtered.map(item => (
                            <NoticiaCard key={item.id} item={item} isMobile={isMobile} onClick={() => setActiveItem(item)} />
                        ))}
                    </div>
                </main>
            </div>

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

            {activeItem && (
                <Modal item={activeItem} onClose={() => setActiveItem(null)} isMobile={isMobile} />
            )}
        </div>
    );
}