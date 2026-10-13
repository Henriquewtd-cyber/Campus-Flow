"use client";

import { useState, useEffect, useRef } from "react";
import {
    Calendar,
    AlertTriangle,
    Mic,
    Clock,
    MapPin,
    Radio,
    QrCode,
    Building2,
    Sparkles,
    ChevronRight,
    ExternalLink
} from "lucide-react";

type QRCodeProps = { value: string; size?: number };

const QRCode = ({ value, size = 130 }: QRCodeProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);
        const hash = [...value].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0);
        const grid = 21;
        const cell = Math.floor(size / (grid + 2));
        const off = Math.floor((size - cell * grid) / 2);
        const seeded = (x: number, y: number) => {
            const h = Math.abs((hash ^ (x * 397)) ^ (y * 1031));
            return (h % 3 !== 0);
        };
        const finder = (fx: number, fy: number) => {
            for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) {
                const v = (r === 0 || r === 6 || c === 0 || c === 6) ? true : (r >= 2 && r <= 4 && c >= 2 && c <= 4);
                if (v) { ctx.fillStyle = "#0f172a"; ctx.fillRect(off + (fx + c) * cell, off + (fy + r) * cell, cell, cell); }
            }
        };
        finder(0, 0); finder(grid - 7, 0); finder(0, grid - 7);
        ctx.fillStyle = "#0f172a";
        for (let r = 0; r < grid; r++) for (let c = 0; c < grid; c++) {
            if ((r < 8 && c < 8) || (r < 8 && c > grid - 9) || (r > grid - 9 && c < 8)) continue;
            if (seeded(c, r)) ctx.fillRect(off + c * cell, off + r * cell, cell - 1, cell - 1);
        }
    }, [value, size]);
    return <canvas ref={canvasRef} width={size} height={size} className="block rounded-xl border border-slate-200 bg-white p-2 shadow-xs" />;
};

type TagType = "EVENTO" | "AVISO" | "PALESTRA";

const TAG_ICONS: Record<TagType, any> = {
    EVENTO: Calendar,
    AVISO: AlertTriangle,
    PALESTRA: Mic,
};

const CTA_LABELS: Record<TagType, string> = {
    EVENTO: "INSCREVA-SE",
    AVISO: "SAIBA MAIS",
    PALESTRA: "ACESSE O LINK",
};

type EventType = {
    id: number; tag: TagType; title: string; subtitle: string;
    date: string; time: string; local: string; source: string; link: string;
    accent: string; accentLight: string; glow: string;
};

const events: EventType[] = [
    {
        id: 1, tag: "EVENTO", title: "Semana Acadêmica de Tecnologia",
        subtitle: "Palestras, workshops e networking com profissionais renomados do mercado de tecnologia e inovação.",
        date: "05 de Maio, 2025", time: "08h00 – 18h00",
        local: "Auditório Principal — Bloco A", source: "Coordenação de TI",
        link: "https://exemplo.edu.br/semana-tec",
        accent: "#1e40af", accentLight: "#eff6ff", glow: "transparent",
    },
    {
        id: 2, tag: "AVISO", title: "Rematrícula — 1º Semestre 2026",
        subtitle: "Período de rematrícula online obrigatório para todos os estudantes dos cursos de graduação.",
        date: "10 a 20 de Maio, 2025", time: "Disponível 24h",
        local: "Portal do Aluno (sistema.edu.br)", source: "Secretaria Acadêmica",
        link: "https://exemplo.edu.br/rematricula",
        accent: "#b91c1c", accentLight: "#fef2f2", glow: "transparent",
    },
    {
        id: 3, tag: "PALESTRA", title: "Inteligência Artificial na Saúde",
        subtitle: "Como modelos preditivos e diagnósticos por imagem estão transformando a medicina moderna.",
        date: "12 de Maio, 2025", time: "19h00 – 21h00",
        local: "Sala de Conferências — Bloco C", source: "Dep. Ciências da Saúde",
        link: "https://exemplo.edu.br/ia-saude",
        accent: "#047857", accentLight: "#ecfdf5", glow: "transparent",
    },
];

type SideItem = { id: number; type: string; title: string; date: string; time: string; source: string; link: string; };

const sideItems: SideItem[] = [
    { id: 1, type: "EVENTO", title: "Workshop de Robótica Prática", date: "07 Mai", time: "14h00", source: "Lab. Engenharia", link: "https://exemplo.edu.br/robotica" },
    { id: 2, type: "NOTÍCIA", title: "Alunos vencem hackathon nacional", date: "02 Mai", time: "Hoje", source: "Comunicação", link: "https://exemplo.edu.br/hackathon" },
    { id: 3, type: "EVENTO", title: "Sessão de Defesas de TCC", date: "09 Mai", time: "09h00", source: "Coord. Engenharia", link: "https://exemplo.edu.br/tcc" },
    { id: 4, type: "NOTÍCIA", title: "Nova Biblioteca Digital Liberada", date: "01 Mai", time: "Disponível", source: "Biblioteca Central", link: "https://exemplo.edu.br/biblioteca" },
];

const typeColor: Record<string, string> = {
    "EVENTO": "#1e40af", "NOTÍCIA": "#b45309", "PALESTRA": "#047857", "AVISO": "#b91c1c",
};

const tickers = [
    "Biblioteca aberta de segunda a sábado das 7h às 22h",
    "Inscrições para monitoria abertas até 08/05 — acesse o Portal do Aluno",
    "Restaurante universitário: cardápio disponível no app institucional",
    "Proibido o uso de celulares durante as aulas — resolução nº 42/2025",
    "Wi-Fi gratuito disponível em todos os blocos com login institucional",
    "Vagas de estágio publicadas no portal — confira oportunidades",
];

export default function Painel() {
    const [now, setNow] = useState(new Date());
    const [active, setActive] = useState(0);
    const [fade, setFade] = useState(true);
    const tickerRef = useRef<HTMLDivElement | null>(null);
    const tickerText = tickers.join("     ◆     ");

    useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

    const [timeStr, setTimeStr] = useState("");

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setTimeStr(
                now.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                })
            );
        };

        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const t = setInterval(() => {
            setFade(false);
            setTimeout(() => { setActive(p => (p + 1) % events.length); setFade(true); }, 400);
        }, 8000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        let pos = 0;
        const el = tickerRef.current;
        if (!el) return;
        const w = el.scrollWidth / 2;
        const step = () => { pos += 0.7; if (pos >= w) pos = 0; el.style.transform = `translateX(-${pos}px)`; requestAnimationFrame(step); };
        const id = requestAnimationFrame(step);
        return () => cancelAnimationFrame(id);
    }, []);

    const ev = events[active];
    const dateStr = now.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
    const TagIconComponent = TAG_ICONS[ev.tag] || Calendar;
    const ctaLabel = CTA_LABELS[ev.tag] || "SAIBA MAIS";

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans select-none overflow-hidden">
            {/* HEADER INSTITUCIONAL LIMPO */}
            <header className="relative z-10 bg-white border-b-2 border-blue-900 px-8 h-20 flex items-center justify-between shrink-0 shadow-xs">
                {/* BRANDING */}
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-900 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="font-black text-lg text-slate-900 tracking-wider uppercase flex items-center gap-2.5">
                            <span>IME-USP</span>
                            <span className="text-xs bg-blue-50 text-blue-900 px-3 py-0.5 rounded-full border border-blue-200/80 font-bold tracking-wide">
                                SINALIZAÇÃO DIGITAL
                            </span>
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                            Instituto de Matemática e Estatística · Universidade de São Paulo
                        </div>
                    </div>
                </div>

                {/* RELÓGIO & DATA */}
                <div className="text-right shrink-0 flex items-center gap-6">
                    <div className="h-10 w-px bg-slate-200" />
                    <div>
                        <div className="text-3xl lg:text-4xl font-black text-blue-900 tracking-widest leading-none font-mono">
                            {timeStr}
                        </div>
                        <div className="text-xs text-slate-500 font-semibold mt-1 capitalize">
                            {dateStr}
                        </div>
                    </div>
                </div>
            </header>

            {/* CONTEÚDO PRINCIPAL DE ALTA VISIBILIDADE À DISTÂNCIA */}
            <main className="flex-1 flex overflow-hidden min-h-0 relative z-1">
                {/* SEÇÃO CENTRAL DO SLIDE EM DESTAQUE */}
                <section
                    className={`flex-1 p-8 lg:p-10 flex flex-col justify-between min-w-0 transition-opacity duration-400 ${
                        fade ? "opacity-100" : "opacity-0"
                    }`}
                >
                    <div className="space-y-6">
                        {/* TAG BADGE DE CATEGORIA */}
                        <div className="flex items-center gap-3">
                            <span
                                className="text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-2 shadow-xs"
                                style={{ backgroundColor: ev.accent }}
                            >
                                <TagIconComponent className="w-4 h-4" />
                                <span>{ev.tag}</span>
                            </span>
                            <span className="text-xs font-extrabold tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                <span>COMUNICADO EM DESTAQUE</span>
                            </span>
                        </div>

                        {/* TÍTULO PRINCIPAL (GIGANTE PARA LEITURA À DISTÂNCIA) */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight max-w-4xl">
                            {ev.title}
                        </h1>

                        {/* BANNER DE DATA, HORÁRIO E LOCAL EM DESTAQUE */}
                        <div className="inline-flex flex-wrap items-center gap-x-6 gap-y-2 bg-white border border-slate-200/90 rounded-2xl p-4 px-6 shadow-xs border-l-6" style={{ borderLeftColor: ev.accent }}>
                            <div className="flex items-center gap-2 text-sm md:text-base font-bold text-slate-900">
                                <Calendar className="w-5 h-5 text-blue-900 shrink-0" />
                                <span>{ev.date}</span>
                            </div>

                            {ev.time && (
                                <div className="flex items-center gap-2 text-sm md:text-base font-bold text-slate-900 border-l border-slate-200 pl-6">
                                    <Clock className="w-5 h-5 text-blue-900 shrink-0" />
                                    <span>{ev.time}</span>
                                </div>
                            )}

                            {ev.local && (
                                <div className="flex items-center gap-2 text-sm md:text-base font-bold text-slate-900 border-l border-slate-200 pl-6">
                                    <MapPin className="w-5 h-5 text-blue-900 shrink-0" />
                                    <span>{ev.local}</span>
                                </div>
                            )}
                        </div>

                        {/* DESCRIÇÃO CURTA DE ALTA LEGIBILIDADE */}
                        <p className="text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl">
                            {ev.subtitle}
                        </p>
                    </div>

                    {/* RODAPÉ DO SLIDE COM CONTROLES E EMBLEMA DE ORIGEM */}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-200/80">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <Radio className="w-4 h-4 text-blue-900" />
                            <span>Fonte: {ev.source}</span>
                        </div>

                        {/* PAGINAÇÃO DE SLIDES */}
                        <div className="flex items-center gap-2.5">
                            {events.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setFade(false); setTimeout(() => { setActive(i); setFade(true); }, 300); }}
                                    className={`h-2.5 rounded-full transition-all cursor-pointer ${
                                        i === active
                                            ? "w-10 bg-blue-900"
                                            : "w-2.5 bg-slate-300 hover:bg-slate-400"
                                    }`}
                                    title={`Slide ${i + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* DIVISOR VERTICAL */}
                <div className="w-px bg-slate-200 shrink-0" />

                {/* COLUNA LATERAL DE QR CODE & PRÓXIMOS EVENTOS (SIMPLIFICADA E LEGÍVEL) */}
                <aside className="w-80 lg:w-96 bg-white p-6 flex flex-col justify-between gap-6 border-l border-slate-200 shrink-0">
                    {/* BLOCO PRINCIPAL DO QR CODE COM CHAMADA CLEAR CTA */}
                    <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 flex flex-col items-center text-center gap-3 shadow-xs">
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <QrCode className="w-4 h-4 text-blue-900" />
                            <span>SAIBA MAIS NO CELULAR</span>
                        </div>

                        {/* QR CODE GRANDE PARA ESCANEAMENTO À DISTÂNCIA */}
                        <div className="my-1">
                            <QRCode value={ev.link} size={140} />
                        </div>

                        <div className="w-full bg-blue-900 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs">
                            <span>{ctaLabel}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </div>
                    </div>

                    {/* PAINEL DE PRÓXIMAS PUBLICAÇÕES (SIMPLIFICADO, MAIOR E SEM QR CODES MINÚSCULOS) */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-3 mb-3">
                            Próximas Publicações
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                            {sideItems.map(item => {
                                const c = typeColor[item.type] || "#1e40af";
                                return (
                                    <div
                                        key={item.id}
                                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 border-l-4 shadow-xs"
                                        style={{ borderLeftColor: c }}
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span
                                                className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                                                style={{ backgroundColor: `${c}15`, color: c, border: `1px solid ${c}33` }}
                                            >
                                                {item.type}
                                            </span>
                                            <span className="text-[11px] font-bold text-slate-500">
                                                {item.date} {item.time ? `· ${item.time}` : ""}
                                            </span>
                                        </div>
                                        <div className="text-xs font-bold text-slate-900 leading-snug">
                                            {item.title}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </aside>
            </main>

            {/* FAIXA INFERIOR DE TICKER / AVISOS INSTITUCIONAIS */}
            <footer className="relative z-10 bg-blue-900 border-t-2 border-blue-950 h-11 flex items-center overflow-hidden shrink-0 shadow-xs">
                <div className="bg-blue-950 px-5 h-full flex items-center shrink-0">
                    <span className="text-xs font-black text-white uppercase tracking-widest whitespace-nowrap">
                        Avisos Gerais
                    </span>
                </div>
                <div className="overflow-hidden flex-1">
                    <div
                        ref={tickerRef}
                        className="inline-block whitespace-nowrap text-sm font-bold text-white tracking-wide pl-6"
                    >
                        {tickerText + "     ◆     " + tickerText}
                    </div>
                </div>
            </footer>
        </div>
    );
}