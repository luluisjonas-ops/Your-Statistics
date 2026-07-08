import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { LogoLockup } from "@/components/app/Logo";
import { useAuth } from "@/context/AuthContext";
import { formatApiError } from "@/lib/api";
import { toast } from "sonner";

const BUSINESS_TYPES = [
  "Salão de beleza", "Loja de roupas", "Mercado", "Oficina", "Gráfica",
  "Restaurante", "Padaria", "Clínica", "Escritório", "Prestador de serviços",
  "Farmácia", "Academia", "Comunicação visual", "Outro",
];
const EMPLOYEES = ["1-5", "6-20", "21-50", "51-100", "100+"];
const STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const Field = ({ label, ...props }) => (
  <div>
    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
    <input
      {...props}
      className="mt-1.5 w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
    />
  </div>
);

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "", company: "", phone: "", whatsapp: "",
    city: "", state: "SP",
    email: "", password: "", confirm: "",
    business_type: "Salão de beleza", employees_count: "1-5",
    terms: false,
  });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) return setError("A senha deve ter ao menos 6 caracteres.");
    if (form.password !== form.confirm) return setError("As senhas não coincidem.");
    if (!form.terms) return setError("Você precisa aceitar os termos para continuar.");
    setLoading(true);
    try {
      const { confirm, terms, ...payload } = form;
      await register(payload);
      toast.success("Conta criada! Vamos analisar sua liberação.");
      nav("/pending-approval");
    } catch (err) {
      setError(formatApiError(err));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto p-6 sm:p-10">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground" data-testid="register-back">
          <ArrowLeft className="h-4 w-4" /> voltar
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-8 grid lg:grid-cols-[1fr_1.2fr] gap-10"
        >
          <div>
            <LogoLockup />
            <h1 className="mt-6 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Crie sua conta<br />e assuma o controle.
            </h1>
            <p className="mt-4 text-muted-foreground max-w-md">
              Cadastro rápido. Após enviar, nossa equipe avalia e libera seu acesso — para garantir segurança e um atendimento humano.
            </p>
            <div className="mt-8 text-sm">
              Já tem conta?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline" data-testid="register-to-login">Entrar</Link>
            </div>
          </div>

          <form onSubmit={submit} className="ys-card p-6 sm:p-8 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nome completo" required value={form.name} onChange={set("name")} placeholder="Seu nome" data-testid="reg-name" />
              <Field label="Empresa" required value={form.company} onChange={set("company")} placeholder="Nome da sua empresa" data-testid="reg-company" />
              <Field label="Telefone" value={form.phone} onChange={set("phone")} placeholder="(00) 0000-0000" data-testid="reg-phone" />
              <Field label="WhatsApp" value={form.whatsapp} onChange={set("whatsapp")} placeholder="(00) 90000-0000" data-testid="reg-whatsapp" />
              <Field label="Cidade" value={form.city} onChange={set("city")} placeholder="Sua cidade" data-testid="reg-city" />
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</label>
                <select value={form.state} onChange={set("state")} data-testid="reg-state" className="mt-1.5 w-full h-11 px-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Field label="E-mail" required type="email" value={form.email} onChange={set("email")} placeholder="voce@empresa.com" data-testid="reg-email" />
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo de empresa</label>
                <select value={form.business_type} onChange={set("business_type")} data-testid="reg-business-type" className="mt-1.5 w-full h-11 px-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {BUSINESS_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quantidade de funcionários</label>
                <select value={form.employees_count} onChange={set("employees_count")} data-testid="reg-employees" className="mt-1.5 w-full h-11 px-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {EMPLOYEES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Senha</label>
                <div className="relative mt-1.5">
                  <input required type={show ? "text" : "password"} value={form.password} onChange={set("password")} data-testid="reg-password" className="w-full h-11 px-4 pr-11 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" placeholder="Mínimo 6 caracteres"/>
                  <button type="button" onClick={() => setShow((s)=>!s)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground" data-testid="reg-toggle-show">
                    {show ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                  </button>
                </div>
              </div>
              <Field label="Confirmar senha" required type={show ? "text" : "password"} value={form.confirm} onChange={set("confirm")} placeholder="Repita a senha" data-testid="reg-confirm" />
            </div>

            <label className="flex items-start gap-3 text-sm text-muted-foreground">
              <input type="checkbox" checked={form.terms} onChange={(e)=>setForm((f)=>({...f, terms: e.target.checked}))} data-testid="reg-terms" className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary/30" />
              <span>
                Aceito os <a className="underline hover:text-foreground" href="#">Termos de Uso</a> e a <a className="underline hover:text-foreground" href="#">Política de Privacidade</a> do Your-Statistics.
              </span>
            </label>

            {error && (
              <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2 dark:bg-rose-950/30 dark:border-rose-900/40" data-testid="reg-error">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} data-testid="reg-submit-btn" className="ys-btn-primary w-full h-11 rounded-xl font-medium disabled:opacity-60">
              {loading ? "Criando conta…" : "Criar conta"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
