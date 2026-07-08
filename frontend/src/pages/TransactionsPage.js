import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, X } from "lucide-react";
import api, { formatApiError, money } from "@/lib/api";
import { toast } from "sonner";

/**
 * Generic transactions page reused for receitas, despesas and fluxo (todos).
 */
export default function TransactionsPage({ type, title, subtitle }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState({ receita: [], despesa: [] });
  const [form, setForm] = useState({
    type: type === "all" ? "receita" : type,
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().slice(0, 10),
    payment_method: "Dinheiro",
    status: "pago",
  });

  const load = async () => {
    setLoading(true);
    try {
      const params = type === "all" ? {} : { type };
      const { data } = await api.get("/finance/transactions", { params });
      setItems(data.transactions);
    } catch (e) { toast.error(formatApiError(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [type]);
  useEffect(() => {
    api.get("/finance/categories").then((r) => {
      setCategories(r.data);
      setForm((f) => ({ ...f, category: (r.data[f.type] || ["Geral"])[0] }));
    });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/finance/transactions", { ...form, amount: parseFloat(form.amount) });
      toast.success("Lançamento registrado.");
      setOpen(false);
      setForm((f) => ({ ...f, amount: "", description: "" }));
      load();
    } catch (err) { toast.error(formatApiError(err)); }
  };

  const remove = async (id) => {
    if (!window.confirm("Excluir este lançamento?")) return;
    try {
      await api.delete(`/finance/transactions/${id}`);
      toast.success("Excluído.");
      load();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const total = items.reduce((s, t) => s + (t.type === "receita" ? 1 : -1) * t.amount, 0);
  const totalRev = items.filter(t=>t.type==='receita').reduce((s,t)=>s+t.amount, 0);
  const totalExp = items.filter(t=>t.type==='despesa').reduce((s,t)=>s+t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-muted-foreground">{subtitle}</p>
        </div>
        <button onClick={() => setOpen(true)} data-testid="tx-add-btn" className="ys-btn-primary rounded-xl px-4 py-2 text-sm font-medium inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> Novo lançamento
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="ys-card p-5">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Total receitas</div>
          <div className="mt-2 font-display text-2xl font-semibold text-emerald-600" data-testid="tx-total-revenue">{money(totalRev)}</div>
        </div>
        <div className="ys-card p-5">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Total despesas</div>
          <div className="mt-2 font-display text-2xl font-semibold text-rose-600" data-testid="tx-total-expense">{money(totalExp)}</div>
        </div>
        <div className="ys-card p-5">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Saldo</div>
          <div className={`mt-2 font-display text-2xl font-semibold ${total>=0?"text-primary":"text-rose-600"}`} data-testid="tx-total-balance">{money(total)}</div>
        </div>
      </div>

      <div className="ys-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Método</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Valor</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">Carregando…</td></tr>}
              {!loading && items.length === 0 && (
                <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">
                  Nenhum lançamento aqui ainda. Clique em <span className="font-medium text-foreground">Novo lançamento</span> para começar.
                </td></tr>
              )}
              {items.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-accent/40" data-testid={`tx-row-${t.id}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`h-8 w-8 rounded-lg grid place-items-center ${t.type==='receita' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/30'}`}>
                        {t.type==='receita' ? <ArrowUpRight className="h-4 w-4"/> : <ArrowDownRight className="h-4 w-4"/>}
                      </span>
                      <span className="font-medium">{t.description}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{t.category}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.payment_method || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(t.date).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full border capitalize ${t.status==='pago' ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-900/40' : 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/30 dark:border-amber-900/40'}`}>{t.status}</span>
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${t.type==='receita'?'text-emerald-600':'text-rose-600'}`}>
                    {t.type==='receita' ? '+' : '-'} {money(t.amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(t.id)} data-testid={`tx-delete-${t.id}`} className="p-2 rounded-lg border border-border hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={()=>setOpen(false)}>
            <motion.form
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e)=>e.stopPropagation()} onSubmit={submit}
              className="w-full max-w-lg ys-card p-6 sm:p-8 space-y-4"
              data-testid="tx-modal"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Novo lançamento</div>
                  <h3 className="mt-1 font-display text-2xl font-semibold">Registrar movimento</h3>
                </div>
                <button type="button" onClick={()=>setOpen(false)} className="p-2 rounded-lg border border-border" data-testid="tx-close-modal"><X className="h-4 w-4"/></button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {["receita","despesa"].map((t) => (
                  <button
                    type="button" key={t}
                    onClick={()=>setForm(f=>({...f, type: t, category: (categories[t]||["Geral"])[0]}))}
                    data-testid={`tx-type-${t}`}
                    className={`h-11 rounded-xl border transition ${form.type===t ? (t==='receita' ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800') : 'border-border hover:bg-accent'}`}
                  >
                    <span className="capitalize font-medium">{t}</span>
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Descrição</label>
                <input required value={form.description} onChange={(e)=>setForm(f=>({...f, description: e.target.value}))} data-testid="tx-description" className="mt-1.5 w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Ex: Venda balcão" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Valor (R$)</label>
                  <input required type="number" min="0" step="0.01" value={form.amount} onChange={(e)=>setForm(f=>({...f, amount: e.target.value}))} data-testid="tx-amount" className="mt-1.5 w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="0,00" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Data</label>
                  <input required type="date" value={form.date} onChange={(e)=>setForm(f=>({...f, date: e.target.value}))} data-testid="tx-date" className="mt-1.5 w-full h-11 px-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Categoria</label>
                  <select value={form.category} onChange={(e)=>setForm(f=>({...f, category: e.target.value}))} data-testid="tx-category" className="mt-1.5 w-full h-11 px-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {(categories[form.type] || ["Geral"]).map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Forma de pagamento</label>
                  <select value={form.payment_method} onChange={(e)=>setForm(f=>({...f, payment_method: e.target.value}))} data-testid="tx-method" className="mt-1.5 w-full h-11 px-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {["Dinheiro","PIX","Cartão de Débito","Cartão de Crédito","Transferência","Boleto"].map(m=><option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Status</label>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    {["pago","pendente"].map((s)=>(
                      <button type="button" key={s} onClick={()=>setForm(f=>({...f, status: s}))} data-testid={`tx-status-${s}`} className={`h-10 rounded-xl border transition capitalize text-sm ${form.status===s?"bg-primary text-primary-foreground border-primary":"border-border hover:bg-accent"}`}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>

              <button type="submit" data-testid="tx-submit" className="ys-btn-primary w-full h-11 rounded-xl font-medium">Registrar lançamento</button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
