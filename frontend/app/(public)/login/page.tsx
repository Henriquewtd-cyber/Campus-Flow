"use client";

import { ToastContainer, useToast } from "@/components/toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Login() {
    const router = useRouter();
    const { toasts, addToast, removeToast } = useToast();

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password: senha }),
            });


            const data = await res.json();

            console.log(data);
            if (!res.ok) {
                addToast(data.error || "Erro ao realizar login", "error");
                setIsLoading(false);
                return;
            }

            addToast("Login realizado com sucesso!", "success");

            setTimeout(() => {
                router.push("/add_evento");
            }, 800);
        } catch (err) {
            console.error(err);
            addToast("Erro na requisição", "error");
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-gray-100 to-gray-200 p-4">

            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* LOADING OVERLAY */}
            {isLoading && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                        <p className="text-slate-600 font-medium">Entrando...</p>
                    </div>
                </div>
            )}

            {/* CARD */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <h1 className="text-2xl font-bold text-center text-slate-800">
                        Entrar
                    </h1>

                    {/* EMAIL */}
                    <input
                        type="email"
                        placeholder="Email"
                        className="h-11 px-4 rounded-lg text-black cborder border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    {/* SENHA */}
                    <input
                        type="password"
                        placeholder="Senha"
                        className="h-11 px-4 rounded-lg text-black cborder border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setSenha(e.target.value)}
                    />

                    {/* CHECKBOX */}


                    {/* BUTTON */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="h-11 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Entrando...
                            </span>
                        ) : (
                            "Entrar"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}