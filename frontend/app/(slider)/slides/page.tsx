"use client";

import { useState, useEffect, useRef, type ReactElement } from "react";

type QRCodeProps = { value: string; size?: number };

const QRCode = ({ value, size = 80 }: QRCodeProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.fillStyle = "#fff";
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
    return <canvas ref={canvasRef} width={size} height={size} style={{ display: "block", borderRadius: 6, border: "2px solid rgba(255,255,255,0.15)" }} />;
};

const IconEvento = () => (
    <svg width="48" height="48" viewBox="0 0 52 52" fill="none">
        <rect x="6" y="10" width="40" height="36" rx="5" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
        <rect x="6" y="10" width="40" height="14" rx="5" fill="rgba(255,255,255,0.2)" />
        <rect x="6" y="20" width="40" height="4" fill="rgba(255,255,255,0.2)" />
        <line x1="17" y1="6" x2="17" y2="16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="35" y1="6" x2="35" y2="16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="14" y="28" width="8" height="8" rx="2" fill="white" opacity="0.9" />
        <rect x="26" y="28" width="8" height="8" rx="2" fill="white" opacity="0.4" />
        <rect x="14" y="38" width="8" height="4" rx="2" fill="white" opacity="0.4" />
        <rect x="26" y="38" width="8" height="4" rx="2" fill="white" opacity="0.25" />
    </svg>
);

const IconAviso = () => (
    <svg width="48" height="48" viewBox="0 0 52 52" fill="none">
        <circle cx="26" cy="26" r="20" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
        <line x1="26" y1="15" x2="26" y2="30" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <circle cx="26" cy="37" r="2.5" fill="white" />
    </svg>
);

const IconPalestra = () => (
    <svg width="48" height="48" viewBox="0 0 52 52" fill="none">
        <rect x="8" y="8" width="36" height="24" rx="4" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
        <line x1="15" y1="17" x2="37" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
        <line x1="15" y1="23" x2="28" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <line x1="26" y1="32" x2="26" y2="42" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="16" y1="42" x2="36" y2="42" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

type TagType = "EVENTO" | "AVISO" | "PALESTRA";
const tagIcons: Record<TagType, ReactElement> = { EVENTO: <IconEvento />, AVISO: <IconAviso />, PALESTRA: <IconPalestra /> };

type EventType = {
    id: number; tag: TagType; title: string; subtitle: string;
    date: string; time: string; local: string; source: string; link: string;
    accent: string; accentLight: string; glow: string;
};

const events: EventType[] = [
    {
        id: 1, tag: "EVENTO", title: "Semana Acadêmica de Tecnologia",
        subtitle: "Palestras, workshops e networking com profissionais do mercado",
        date: "05 de Maio, 2025", time: "08h00 – 18h00",
        local: "Auditório Principal — Bloco A", source: "Coordenação de Tecnologia da Informação",
        link: "https://exemplo.edu.br/semana-tec",
        accent: "#3b82f6", accentLight: "rgba(59,130,246,0.18)", glow: "rgba(59,130,246,0.35)",
    },
    {
        id: 2, tag: "AVISO", title: "Rematrícula — 1º Semestre 2026",
        subtitle: "Período de rematrícula online para todos os cursos de graduação",
        date: "10 a 20 de Maio, 2025", time: "Disponível 24 horas",
        local: "Portal do Aluno — sistema.edu.br", source: "Secretaria Acadêmica",
        link: "https://exemplo.edu.br/rematricula",
        accent: "#f59e0b", accentLight: "rgba(245,158,11,0.18)", glow: "rgba(245,158,11,0.35)",
    },
    {
        id: 3, tag: "PALESTRA", title: "Inteligência Artificial na Saúde",
        subtitle: "Como modelos preditivos estão transformando diagnósticos e tratamentos",
        date: "12 de Maio, 2025", time: "19h00 – 21h00",
        local: "Sala de Conferências — Bloco C", source: "Departamento de Ciências da Saúde",
        link: "https://exemplo.edu.br/ia-saude",
        accent: "#10b981", accentLight: "rgba(16,185,129,0.18)", glow: "rgba(16,185,129,0.35)",
    },
];

type SideItem = { id: number; type: string; title: string; date: string; time: string; source: string; link: string; };

const sideItems: SideItem[] = [
    { id: 1, type: "EVENTO", title: "Workshop de Robótica", date: "07 Mai", time: "14h", source: "Lab. de Engenharia", link: "https://exemplo.edu.br/robotica" },
    { id: 2, type: "NOTÍCIA", title: "Alunos vencem hackathon nacional", date: "02 Mai", time: "", source: "Assessoria de Comunicação", link: "https://exemplo.edu.br/hackathon" },
    { id: 3, type: "EVENTO", title: "Defesas de TCC — Engenharia", date: "09 Mai", time: "09h", source: "Coord. de Engenharia", link: "https://exemplo.edu.br/tcc" },
    { id: 4, type: "NOTÍCIA", title: "Nova biblioteca digital disponível", date: "01 Mai", time: "", source: "Biblioteca Central", link: "https://exemplo.edu.br/biblioteca" },
    { id: 5, type: "EVENTO", title: "Feira de Profissões 2025", date: "15 Mai", time: "10h", source: "Escritório de Carreiras", link: "https://exemplo.edu.br/feira" },
];

const typeColor: Record<string, string> = {
    "EVENTO": "#3b82f6", "NOTÍCIA": "#f59e0b", "PALESTRA": "#10b981", "AVISO": "#f43f5e",
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


    return (
        <div style={{
            fontFamily: "'Segoe UI', system-ui, sans-serif",
            background: "#070d1a",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            color: "#e2e8f0",
            fontSize: 13,
            overflow: "hidden",
        }}>
            {/* GRID DE LINHAS DE FUNDO */}
            <div style={{
                position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
                backgroundImage: "linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
            }} />

            {/* HEADER */}
            <header style={{
                position: "relative", zIndex: 10,
                background: "rgba(7,13,26,0.95)",
                borderBottom: `2px solid ${ev.accent}`,
                padding: "0 28px",
                height: 68,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexShrink: 0,
                transition: "border-color 0.6s ease",
                boxShadow: `0 0 40px ${ev.glow}`,
            }}>
                {/* LOGO + NOME */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                        width: 46, height: 46, borderRadius: 10,
                        background: `linear-gradient(135deg, ${ev.accent}, ${ev.accent}88)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: `0 0 16px ${ev.glow}`,
                        transition: "background 0.6s ease, box-shadow 0.6s ease",
                        flexShrink: 0,
                    }}>
                        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                            <rect x="3" y="14" width="5" height="8" rx="1" fill="#fff" />
                            <rect x="10.5" y="9" width="5" height="13" rx="1" fill="#fff" />
                            <rect x="18" y="5" width="5" height="17" rx="1" fill="#fff" />
                            <circle cx="5.5" cy="7" r="3" fill="rgba(255,255,255,0.7)" />
                        </svg>
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 18, color: "#f8fafc", letterSpacing: 1.5, textTransform: "uppercase" }}>IME-USP 2026</div>
                        <div style={{ fontSize: 10, color: "#64748b", marginTop: 1, letterSpacing: 0.5, textTransform: "uppercase" }}>Painel de Comunicação Institucional</div>
                    </div>
                </div>

                {/* LINHA DIVISÓRIA CENTRAL */}
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)", margin: "0 32px" }} />

                {/* RELÓGIO */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{
                        fontSize: 34, fontWeight: 800, color: "#f8fafc",
                        letterSpacing: 2, lineHeight: 1, fontVariantNumeric: "tabular-nums",
                        textShadow: `0 0 20px ${ev.glow}`,
                        transition: "text-shadow 0.6s ease",
                    }}>{timeStr}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 3, textTransform: "capitalize", letterSpacing: 0.3 }}>{dateStr}</div>
                </div>
            </header>

            {/* CORPO */}
            <main style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0, position: "relative", zIndex: 1 }}>

                {/* SEÇÃO DESTAQUE */}
                <section style={{
                    flex: 1, padding: "24px 28px",
                    display: "flex", flexDirection: "column", gap: 16,
                    minWidth: 0,
                    opacity: fade ? 1 : 0,
                    transition: "opacity 0.4s ease",
                }}>
                    {/* TAG + LABEL */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{
                            background: ev.accent, color: "#fff",
                            fontSize: 10, fontWeight: 800, padding: "4px 14px",
                            borderRadius: 20, letterSpacing: 1.5, textTransform: "uppercase",
                            boxShadow: `0 0 12px ${ev.glow}`,
                        }}>{ev.tag}</span>
                        <span style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: 2,
                            color: ev.accent, textTransform: "uppercase",
                            opacity: 0.8,
                        }}>◆ Destaque</span>
                    </div>

                    {/* TÍTULO */}
                    <h1 style={{
                        fontSize: 40, fontWeight: 900, color: "#f8fafc",
                        lineHeight: 1.1, margin: 0, letterSpacing: -0.5,
                        textShadow: `0 0 60px ${ev.glow}`,
                        transition: "text-shadow 0.6s ease",
                    }}>{ev.title}</h1>

                    <p style={{ fontSize: 16, color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>{ev.subtitle}</p>

                    {/* CARDS DE INFO */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
                        {[["📅 Data", ev.date], ["🕐 Horário", ev.time], ["📍 Local", ev.local], ["📡 Fonte", ev.source]].map(([l, v]) => (
                            <div key={l} style={{
                                background: "rgba(255,255,255,0.04)",
                                border: `1px solid rgba(255,255,255,0.08)`,
                                borderLeft: `3px solid ${ev.accent}`,
                                borderRadius: 10,
                                padding: "12px 16px",
                                transition: "border-color 0.6s ease",
                            }}>
                                <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{l}</div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{v}</div>
                            </div>
                        ))}
                    </div>

                    {/* BARRA ÍCONE + LINK + QR */}
                    <div style={{
                        display: "flex", alignItems: "stretch", marginTop: 4,
                        background: "rgba(255,255,255,0.03)",
                        border: `1px solid rgba(255,255,255,0.08)`,
                        borderRadius: 14, overflow: "hidden",
                    }}>
                        {/* ÍCONE */}
                        <div style={{
                            width: 110,
                            background: `linear-gradient(160deg, ${ev.accent}cc, ${ev.accent}44)`,
                            display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center",
                            gap: 8, padding: "16px 10px", flexShrink: 0,
                            boxShadow: `inset -1px 0 0 rgba(255,255,255,0.06)`,
                        }}>
                            {tagIcons[ev.tag]}
                            <span style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.9)", letterSpacing: 1.5, textTransform: "uppercase" }}>{ev.tag}</span>
                        </div>

                        {/* CENTRO */}
                        <div style={{ flex: 1, padding: "16px 20px", display: "flex", flexDirection: "column", justifyContent: "center", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
                            <div style={{ fontSize: 10, color: "#475569", fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Link do evento</div>
                            <div style={{ fontSize: 13, color: ev.accent, fontWeight: 600, wordBreak: "break-all" }}>{ev.link}</div>
                            <div style={{ marginTop: 16, display: "flex", gap: 6, alignItems: "center" }}>
                                {events.map((e, i) => (
                                    <div key={i}
                                        onClick={() => { setFade(false); setTimeout(() => { setActive(i); setFade(true); }, 300); }}
                                        style={{
                                            width: i === active ? 32 : 8, height: 8, borderRadius: 4,
                                            background: i === active ? ev.accent : "rgba(255,255,255,0.15)",
                                            cursor: "pointer",
                                            transition: "all 0.3s ease",
                                            boxShadow: i === active ? `0 0 8px ${ev.glow}` : "none",
                                        }} />
                                ))}
                            </div>
                        </div>

                        {/* QR */}
                        <div style={{
                            padding: "16px 20px", borderLeft: "1px solid rgba(255,255,255,0.06)",
                            display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center",
                            gap: 8, flexShrink: 0,
                        }}>
                            <div style={{ fontSize: 10, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Saiba mais</div>
                            <QRCode value={ev.link} size={96} />
                        </div>
                    </div>
                </section>

                {/* DIVISOR VERTICAL BRILHANTE */}
                <div style={{
                    width: 1,
                    background: `linear-gradient(to bottom, transparent, ${ev.accent}66, transparent)`,
                    flexShrink: 0,
                    transition: "background 0.6s ease",
                }} />

                {/* LATERAL */}
                <aside style={{
                    width: 270,
                    background: "rgba(255,255,255,0.02)",
                    padding: "16px 14px",
                    display: "flex", flexDirection: "column", gap: 8,
                    overflowY: "auto",
                }}>
                    <div style={{
                        fontSize: 10, fontWeight: 800, color: "#475569",
                        letterSpacing: 2, marginBottom: 4, paddingBottom: 10,
                        borderBottom: "1px solid rgba(255,255,255,0.07)",
                        textTransform: "uppercase",
                    }}>Próximos Eventos &amp; Notícias</div>

                    {sideItems.map(item => {
                        const c = typeColor[item.type] || "#3b82f6";
                        return (
                            <div key={item.id} style={{
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.07)",
                                borderLeft: `3px solid ${c}`,
                                borderRadius: 10, padding: "10px 12px",
                                display: "flex", gap: 10, alignItems: "flex-start",
                            }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                                        <span style={{
                                            fontSize: 9, fontWeight: 800,
                                            background: `${c}22`,
                                            color: c, padding: "2px 8px",
                                            borderRadius: 10, letterSpacing: 0.5,
                                            border: `1px solid ${c}44`,
                                        }}>{item.type}</span>
                                        {item.date && (
                                            <span style={{ fontSize: 10, color: "#475569" }}>
                                                {item.date}{item.time ? ` · ${item.time}` : ""}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", lineHeight: 1.3 }}>{item.title}</div>
                                    <div style={{ fontSize: 10, color: "#475569", marginTop: 4 }}>Via: {item.source}</div>
                                </div>
                                <div style={{ flexShrink: 0 }}>
                                    <QRCode value={item.link} size={52} />
                                </div>
                            </div>
                        );
                    })}
                </aside>
            </main>

            {/* TICKER RODAPÉ */}
            <footer style={{
                position: "relative", zIndex: 10,
                background: "rgba(7,13,26,0.98)",
                borderTop: `2px solid ${ev.accent}`,
                height: 38,
                display: "flex", alignItems: "center",
                overflow: "hidden", flexShrink: 0,
                boxShadow: `0 0 30px ${ev.glow}`,
                transition: "border-color 0.6s ease, box-shadow 0.6s ease",
            }}>
                <div style={{
                    background: ev.accent,
                    padding: "0 18px", height: "100%",
                    display: "flex", alignItems: "center",
                    flexShrink: 0,
                    boxShadow: `4px 0 16px ${ev.glow}`,
                    transition: "background 0.6s ease, box-shadow 0.6s ease",
                }}>
                    <span style={{ fontSize: 10, fontWeight: 900, color: "#fff", letterSpacing: 2, whiteSpace: "nowrap", textTransform: "uppercase" }}>Avisos</span>
                </div>
                <div style={{ overflow: "hidden", flex: 1 }}>
                    <div ref={tickerRef} style={{
                        display: "inline-block", whiteSpace: "nowrap",
                        fontSize: 12, paddingLeft: 24, color: "#94a3b8", letterSpacing: 0.3,
                    }}>
                        {tickerText + "     ◆     " + tickerText}
                    </div>
                </div>
            </footer>
        </div>
    );
}