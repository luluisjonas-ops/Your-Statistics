import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, Filter, MoreVertical, CheckCircle2, PauseCircle, Trash2,
  RefreshCw, Users, Clock, ShieldCheck, LogOut,
} from "lucide-react";
import { LogoLockup } from "@/components/app/Logo";
import api, { formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const statusStyle = {
  aprovado: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-900/40",
  pendente: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/30 dark:border-amber-900/40",
  suspenso: "text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-950/30 dark:border-rose-900/40",
};

export default function MasterPanel() {
  const { logout, user } = useAuth();
  const nav = useNavigate();
  const [users, setUsers] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pendente: 0, aprovado: 0, suspenso: 0 });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/users", { params: { q, status } });
      setUsers(data.users);
      setCounts(data.counts);
    } catch (e) { toast.error(formatApiError(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q, status]);

  const act = async (userId, action) => {
    try {
      if (action === "delete") {
        if (!window.confirm("Tem certeza que deseja excluir esta conta? Todos os dados financeiros serão apagados.")) return;
        await api.delete(`/admin/users/${userId}`);
        toast.success("Conta excluída.");
      } else {
        await api.post(`/admin/users/${userId}/${action}`);
        toast.success({approve: "Conta aprovada.", suspend: "Conta suspensa.", reactivate: "Conta reativada."}[action] || "Ação concluída.");
      }
      load();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const kpis = useMemo(() => ([
    { label: "Total", value: counts.total, icon: Users, tone: "text-foreground" },
    { label: "Aguardando aprovação", value: counts.pendente, icon: Clock, tone: "text-amber-600" },
    { label: "Aprovadas", value: counts.aprovado, icon: CheckCircle2, tone: "text-emerald-600" },
    { label: "Suspensas", value: counts.suspenso, icon: PauseCircle, tone: "text-rose-600" },
  ]), [counts]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="ys-glass sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-6 h-[68px] flex items-center">
          <LogoLockup />
          <div className="ml-3 hidden sm:inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-primary/30 text-primary bg-primary/5">
            <ShieldCheck className="h-3 w-3" /> Painel Master
          </div>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="hidden md:inline text-muted-foreground">{user?.email}</span>
            <button onClick={async () => { await logout(); nav("/login"); }} data-testid="master-logout" className="p-2 rounded-lg border border-border hover:bg-accent">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-6 md:p-10">
        <motion.h1
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl sm:text-4xl font-semibold tracking-tight"
        >
          Bem-vindo, {user?.name?.split(" ")[0]}.
        </motion.h1>
        <p className="mt-2 text-muted-foreground">Gerencie empresas, aprovações e acessos.</p>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="ys-card p-5">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs uppercase tracking-widest">{k.label}</span>
                <k.icon className={`h-4 w-4 ${k.tone}`} />
              </div>
              <div className={`mt-2 font-display text-3xl font-semibold ${k.tone}`} data-testid={`master-kpi-${k.label.toLowerCase().replaceAll(' ', '-')}`}>
                {k.value}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 ys-card overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, empresa, e-mail…"
                data-testid="master-search"
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {["", "pendente", "aprovado", "suspenso"].map((s) => (
                <button key={s || "all"} data-testid={`master-filter-${s || "all"}`}
                  onClick={() => setStatus(s)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${status === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}>
                  {s ? s : "todos"}
                </button>
              ))}
              <button onClick={load} data-testid="master-reload" className="ml-2 p-2 rounded-lg border border-border hover:bg-accent"><RefreshCw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 font-medium">Empresa / Usuário</th>
                  <th className="px-4 py-3 font-medium">Contato</th>
                  <th className="px-4 py-3 font-medium">Local</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Cadastro</th>
                  <th className="px-4 py-3 font-medium">Último acesso</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">Carregando…</td></tr>
                )}
                {!loading && users.length === 0 && (
                  <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">Nenhum usuário encontrado.</td></tr>
                )}
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-accent/40" data-testid={`master-user-row-${u.email}`}>
                    <td className="px-4 py-4">
                      <div className="font-medium">{u.company || "—"}</div>
                      <div className="text-muted-foreground text-xs">{u.name} · {u.email}</div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div>{u.phone || "—"}</div>
                      <div className="text-muted-foreground text-xs">WhatsApp: {u.whatsapp || "—"}</div>
                    </td>
                    <td className="px-4 py-4 text-sm">{u.city ? `${u.city}, ${u.state}` : "—"}</td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full border capitalize ${statusStyle[u.status] || ""}`}>{u.status}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{new Date(u.created_at).toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{u.last_login ? new Date(u.last_login).toLocaleString("pt-BR") : "—"}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 justify-end">
                        {u.status === "pendente" && (
                          <button onClick={() => act(u.id, "approve")} data-testid={`master-approve-${u.email}`} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition">Aprovar</button>
                        )}
                        {u.status === "aprovado" && (
                          <button onClick={() => act(u.id, "suspend")} data-testid={`master-suspend-${u.email}`} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-accent">Suspender</button>
                        )}
                        {u.status === "suspenso" && (
                          <button onClick={() => act(u.id, "reactivate")} data-testid={`master-reactivate-${u.email}`} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-accent">Reativar</button>
                        )}
                        <button onClick={() => setSelected(u)} data-testid={`master-view-${u.email}`} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-accent">Detalhes</button>
                        {u.role !== "admin" && (
                          <button onClick={() => act(u.id, "delete")} data-testid={`master-delete-${u.email}`} className="p-1.5 rounded-lg border border-border hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg ys-card p-6 sm:p-8" onClick={(e) => e.stopPropagation()} data-testid="master-details-modal">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Detalhes</div>
                <h3 className="mt-1 font-display text-2xl font-semibold">{selected.company}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="p-2"><MoreVertical className="h-4 w-4"/></button>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              {[
                ["Nome", selected.name], ["E-mail", selected.email], ["Telefone", selected.phone || "—"],
                ["WhatsApp", selected.whatsapp || "—"], ["Cidade", `${selected.city || "—"}${selected.state ? " / "+selected.state : ""}`],
                ["Tipo", selected.business_type || "—"], ["Funcionários", selected.employees_count || "—"],
                ["Cadastro", new Date(selected.created_at).toLocaleString("pt-BR")], ["Status", selected.status],
              ].map(([k,v]) => (
                <div key={k}>
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{k}</div>
                  <div className="mt-1 font-medium">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
