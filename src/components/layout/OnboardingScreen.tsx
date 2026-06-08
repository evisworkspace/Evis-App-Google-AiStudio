import React, { useState } from "react";
import { createCompany } from "../../services/companyService";
import type { User } from "firebase/auth";

interface Props {
    user: User;
    onComplete: (companyId: string) => void;
}

export default function OnboardingScreen({ user, onComplete }: Props) {
    const [companyName, setCompanyName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!companyName.trim()) return;
        setLoading(true);
        setError("");
        try {
            const id = crypto.randomUUID();
            await createCompany(
                id,
                {
                    name: companyName.trim(),
                    email: user.email ?? "",
                    plan: "essencial",
                    userLimit: 2,
                    obraLimit: 3,
                    configuration: {},
                    onboarding: { completedAt: new Date().toISOString() },
                    deletedAt: null,
                },
                {
                    uid: user.uid,
                    name: user.displayName ?? user.email ?? "Usuário",
                    email: user.email ?? "",
                    avatarUrl: user.photoURL,
                }
            );
            localStorage.setItem("evis_company_id", id);
            onComplete(id);
        } catch {
            setError("Erro ao criar empresa. Tente novamente.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 rounded-2xl p-8 border border-slate-800">
                <h1 className="text-2xl font-bold text-emerald-400 mb-1">EVIS</h1>
                <p className="text-slate-400 mb-6 text-sm">Bem-vindo! Configure sua empresa para começar.</p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-slate-300 text-sm mb-1 block">Nome da empresa</label>
                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Ex: Construtora Silva"
                            disabled={loading}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading || !companyName.trim()}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
                    >
                        {loading ? "Criando..." : "Criar minha empresa →"}
                    </button>
                </form>
            </div>
        </div>
    );
}
