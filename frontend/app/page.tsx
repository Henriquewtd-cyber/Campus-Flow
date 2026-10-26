import Link from "next/link";
import { Header } from "@/components/header";
import { Newspaper, LayoutDashboard, Monitor, ArrowRight, ShieldCheck, Clock, Building2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-12 flex flex-col justify-center">
        {/* HERO HEADER */}
        <div className="max-w-3xl mb-12 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-900 text-xs font-semibold mb-4">
            <Building2 className="w-3.5 h-3.5" />
            <span>Instituto de Matemática e Estatística — USP</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-3">
            Plataforma Institucional CampusFlow
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            Central unificada de comunicação acadêmica, gestão de comunicados, agendamentos e exibição digital do campus.
          </p>
        </div>

        {/* NAVIGATION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* CARD 1: PUBLIC PORTAL */}
          <Link
            href="/eventos"
            className="group bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900 mb-5 group-hover:bg-blue-900 group-hover:text-white transition-colors">
                <Newspaper className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-900 transition-colors">
                Portal de Eventos e Notícias
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Acesse comunicados acadêmicos, prazos de rematrícula, palestras e informações gerais da comunidade.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-900">
              <span>Acessar notícias</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* CARD 2: ADMIN MANAGEMENT */}
          <Link
            href="/novo"
            className="group bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 mb-5 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-slate-900 transition-colors">
                Gestão Administrativa
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Publicação de eventos, gerenciamento de comunicados ativos, categorização e configuração de avisos no rodapé.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-800">
              <span>Painel de gestão</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* CARD 3: DIGITAL SIGNAGE KIOSK */}
          <Link
            href="/slides"
            className="group bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xs hover:shadow-md hover:border-slate-700 transition-all flex flex-col justify-between text-white"
          >
            <div>
              <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Monitor className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">
                Painel TV (Sinalização)
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Modo de exibição contínua para monitores e totens do campus com rotação de destaques e QR codes.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-blue-400 group-hover:text-blue-300">
              <span>Abrir modo TV</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* INSTITUTIONAL FOOTER BAR */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-900" />
            <span>Sistema seguro operado pela Coordenação de TI do IME-USP</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Versão 2026.1 · Atualizado em tempo real</span>
          </div>
        </div>
      </main>
    </div>
  );
}

