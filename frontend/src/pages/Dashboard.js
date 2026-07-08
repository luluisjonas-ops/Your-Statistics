import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar,
} from "recharts";
import { TrendingUp, TrendingDown, Wallet, PieChart, Activity, AlertCircle, ArrowUpRight, ArrowDownRight, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api, { money } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

function Kpi({ label, value, tone = "text-foreground", icon: Icon, hint, testid }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="ys-card p-5"
      data-testid={testid}
    >
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-[11px] uppercase tracking-widest font-semibold">{label}</span>
        {Icon && <Icon className={`h-4 w-4 ${tone}`} />}
      </div>
      <div className={`mt-2 font-display text-2xl md:text-3xl font-semibold ${tone}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/finance/dashboard");
      setData(data);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const empty = !loading && data && data.kpis.transactions_count === 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Olá, {user?.name?.split(" ")[0]}.</h1>
          <p className="mt-1 text-muted-foreground">Aqui está o resumo financeiro da {user?.company}.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => nav("/app/revenues")} data-testid="dash-add-revenue" className="rounded-xl px-4 py-2 text-sm font-medium border border-border hover:bg-accent inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Nova receita
          </button>
          <button onClick={() => nav("/app/expenses")} data-testid="dash-add-expense" className="rounded-xl px-4 py-2 text-sm font-medium ys-btn-primary inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Nova despesa
          </button>
        </div>
      </div>

      {empty && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="ys-card p-8 md:p-10 relative overflow-hidden"
          data-testid="dash-empty-state"
        >
          <div className="absolute inset-0 ys-shimmer opacity-20 pointer-events-none" />
          <div className="relative max-w-2xl">
            <div className="text-xs uppercase tracking-widest text-primary font-semibold">Comece por aqui</div>
            <h2 className="mt-3 font-display text-2xl font-semibold">Seu painel está pronto para receber os primeiros lançamentos.</h2>
            <p className="mt-2 text-muted-foreground">
              Cadastre uma receita e uma despesa — mesmo que seja um teste — e veja seus KPIs, gráficos e alertas
              ganharem vida em tempo real.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => nav("/app/revenues")} className="ys-btn-primary rounded-xl px-4 py-2 text-sm font-medium" data-testid="empty-cta-revenue">
                Registrar primeira receita
              </button>
              <button onClick={() => nav("/app/expenses")} className="rounded-xl px-4 py-2 text-sm border border-border hover:bg-accent" data-testid="empty-cta-expense">
                Registrar primeira despesa
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi testid="kpi-revenue-today" label="Receita do dia" value={money(data?.kpis.revenue_today)} tone="text-emerald-600" icon={ArrowUpRight} />
        <Kpi testid="kpi-revenue-month" label="Receita do mês" value={money(data?.kpis.revenue_month)} tone="text-emerald-600" icon={TrendingUp} />
        <Kpi testid="kpi-expense-month" label="Despesas do mês" value={money(data?.kpis.expense_month)} tone="text-rose-600" icon={TrendingDown} />
        <Kpi testid="kpi-profit" label="Lucro do mês" value={money(data?.kpis.profit_month)} tone="text-primary" icon={PieChart} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi testid="kpi-balance" label="Saldo em caixa" value={money(data?.kpis.balance)} icon={Wallet} />
        <Kpi testid="kpi-pending" label="Contas pendentes" value={data?.kpis.pending_bills ?? 0} tone="text-amber-600" icon={AlertCircle} />
        <Kpi testid="kpi-tx-count" label="Lançamentos" value={data?.kpis.transactions_count ?? 0} icon={Activity} />
        <Kpi testid="kpi-flow" label="Fluxo líquido" value={money((data?.kpis.revenue_month || 0) - (data?.kpis.expense_month || 0))} tone={((data?.kpis.revenue_month||0)-(data?.kpis.expense_month||0))>=0?"text-emerald-600":"text-rose-600"} icon={ArrowDownRight} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 ys-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Últimos 12 meses</div>
              <div className="mt-1 font-display text-lg font-semibold">Receita vs Despesa</div>
            </div>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthly || []}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.30} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" fontSize={12} tickMargin={8} />
                <YAxis fontSize={12} width={70} tickFormatter={(v)=>`R$${v/1000}k`} />
                <Tooltip formatter={(v)=>money(v)} />
                <Area type="monotone" dataKey="receita" stroke="#10B981" fill="url(#rev)" strokeWidth={2} />
                <Area type="monotone" dataKey="despesa" stroke="#EF4444" fill="url(#exp)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ys-card p-5">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Últimos 7 dias</div>
          <div className="mt-1 font-display text-lg font-semibold">Movimentação semanal</div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.weekly || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" fontSize={11} tickFormatter={(d)=>d.slice(5)} />
                <YAxis fontSize={12} width={60} tickFormatter={(v)=>`R$${v/1000}k`} />
                <Tooltip formatter={(v)=>money(v)} />
                <Bar dataKey="receita" fill="#10B981" radius={[6,6,0,0]} />
                <Bar dataKey="despesa" fill="#EF4444" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="ys-card p-5" data-testid="dash-recent">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Últimas movimentações</div>
            <div className="mt-1 font-display text-lg font-semibold">Ao vivo</div>
          </div>
        </div>
        {(!data?.recent || data.recent.length === 0) ? (
          <div className="mt-6 text-sm text-muted-foreground border border-dashed border-border rounded-xl p-8 text-center">
            Nenhuma movimentação ainda. Cadastre sua primeira receita ou despesa.
          </div>
        ) : (
          <div className="mt-4 divide-y divide-border">
            {data.recent.map((t) => (
              <div key={t.id} className="py-3 flex items-center gap-4">
                <div className={`h-9 w-9 rounded-xl grid place-items-center ${t.type === "receita" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" : "bg-rose-50 text-rose-600 dark:bg-rose-950/30"}`}>
                  {t.type === "receita" ? <ArrowUpRight className="h-4 w-4"/> : <ArrowDownRight className="h-4 w-4"/>}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{t.description}</div>
                  <div className="text-xs text-muted-foreground">{t.category} · {new Date(t.date).toLocaleDateString("pt-BR")}</div>
                </div>
                <div className={`font-semibold ${t.type === "receita" ? "text-emerald-600" : "text-rose-600"}`}>
                  {t.type === "receita" ? "+" : "-"} {money(t.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
