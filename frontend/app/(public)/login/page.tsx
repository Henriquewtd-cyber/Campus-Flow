"use client";

import { ToastContainer, useToast } from "@/components/toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Loader2, Lock, Mail, ShieldCheck, KeyRound, Building2 } from "lucide-react";

export default function Login() {
    const router = useRouter();
    const { toasts, addToast, removeToast } = useToast();

    const [email, setEmail] = useState("joao@gmail.com");
    const [senha, setSenha] = useState("admin123");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!email || !senha) {
            addToast("Preencha todos os campos", "info");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("http://localhost:8000/users/login", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password: senha }),
            });

            const data = await res.json();

            if (!res.ok) {
                addToast(data.error || "Erro ao realizar login", "error");
                setIsLoading(false);
                return;
            }

            addToast("Login realizado com sucesso!", "success");

            setTimeout(() => {
                router.push("/novo");
            }, 800);
        } catch (err) {
            console.error(err);
            addToast("Erro na requisição", "error");
            setIsLoading(false);

        } finally {
            // Executa tanto em caso de sucesso quanto de erro
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
            <Header />

            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* MAIN LOGIN WRAPPER */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
                <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-6">

                    {/* CARD HEADER */}
                    <div className="text-center space-y-2">
                        <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center mx-auto shadow-xs">
                            <KeyRound className="w-6 h-6" />
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                            <Building2 className="w-3 h-3 text-blue-900" />
                            <span>IME-USP · Acesso Restrito</span>
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                            Autenticação de Servidores
                        </h1>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto">
                            Entre com suas credenciais institucionais para gerenciar publicações no painel.
                        </p>
                    </div>

                    {/* FORM */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* EMAIL FIELD */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                <span>E-mail Institucional</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="usuario@imeusp.edu.br"
                                    value={email || ""}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900 transition-all placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {/* SENHA FIELD */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-slate-400" />
                                <span>Senha</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={senha || ""}
                                    onChange={(e) => setSenha(e.target.value)}
                                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900 transition-all placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {/* SUBMIT BUTTON */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-11 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs tracking-wide transition-all shadow-xs disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    <span>Autenticando...</span>
                                </>
                            ) : (
                                <span>Acessar Painel Administrativo</span>
                            )}
                        </button>
                    </form>

                    {/* SECURITY BANNER */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium text-center">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Sessão protegida pela infraestrutura de segurança IME-USP</span>
                    </div>

                </div>
            </main>
        </div>
    );
}