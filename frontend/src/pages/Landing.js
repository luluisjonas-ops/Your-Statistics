import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Check, LineChart, ShieldCheck, Zap, Sparkles, Wallet,
  BarChart3, Users, Bot, CalendarDays, MessageCircle,
} from "lucide-react";
import { LogoLockup } from "@/components/app/Logo";
import api from "@/lib/api";

const benefits = [
  { icon: LineChart, title: "Visão real do seu negócio", desc: "KPIs de receita, lucro e fluxo de caixa em tempo real — sem planilha, sem fórmula quebrada." },
  { icon: ShieldCheck, title: "Multiempresa e seguro", desc: "Dados 100% isolados por empresa, criptografia em trânsito, sessões com token e auditoria." },
  { icon: Zap, title: "Rápido de verdade", desc: "Interface leve, empty states inteligentes e atalhos de teclado. Feito para acelerar seu dia." },
  { icon: Sparkles, title: "IA financeira", desc: "Pergunte “quanto gastei este mês?” — e receba respostas com base nos seus dados." },
];

const how = [
  { step: "01", title: "Crie sua conta", desc: "Cadastre sua empresa em menos de 1 minuto." },
  { step: "02", title: "Configure do seu jeito", desc: "Categorias, formas de pagamento, centro de custos — tudo flexível." },
  { step: "03", title: "Lance receitas e despesas", desc: "Ou importe. O painel vive atualizado ao lado dos seus dados." },
  { step: "04", title: "Cresça com decisões certas", desc: "Relatórios claros, alertas e IA para revelar onde economizar." },
];

const features = [
  { icon: Wallet, t: "Financeiro completo" }, { icon: BarChart3, t: "Dashboards em tempo real" },
  { icon: Users, t: "Cadastro de clientes" }, { icon: CalendarDays, t: "Agenda inteligente" },
  { icon: Bot, t: "Assistente IA" }, { icon: ShieldCheck, t: "Auditoria & 2FA" },
];

const faqs = [
  { q: "Preciso de cartão para começar?", a: "Não. O cadastro é gratuito e nossa liberação é feita manualmente para garantir segurança." },
  { q: "Serve para meu tipo de negócio?", a: "Sim — salões, lojas, mercados, oficinas, restaurantes, clínicas, escritórios e prestadores de serviço já usam o Your-Statistics." },
  { q: "Meus dados são meus?", a: "Sempre. Cada empresa tem ambiente isolado, você pode exportar tudo a qualquer momento." },
  { q: "Como funciona a assinatura?", a: "Falamos direto com você pelo WhatsApp e ativamos seu plano em minutos, sob medida." },
];

export default function Landing() {
  const [wa, setWa] = useState("+5573981891863");
  useEffect(() => {
    api.get("/config/public").then((r) => setWa(r.data.whatsapp)).catch(() => {});
  }, []);
  const waLink = `https://wa.me/${wa.replace(/\D/g, "")}?text=${encodeURIComponent("Olá, gostaria de conhecer o Your-Statistics para minha empresa.")}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="ys-glass sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center">
          <Link to="/" data-testid="landing-logo"><LogoLockup /></Link>
          <nav className="hidden md:flex items-center gap-8 mx-auto text-sm text-muted-foreground">
            <a href="#beneficios" className="hover:text-foreground transition-colors">Benefícios</a>
            <a href="#como-funciona" className="hover:text-foreground transition-colors">Como funciona</a>
            <a href="#recursos" className="hover:text-foreground transition-colors">Recursos</a>
            <a href="#precos" className="hover:text-foreground transition-colors">Preços</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>
          <div className="ml-auto md:ml-0 flex items-center gap-2">
            <Link to="/login" data-testid="landing-login-btn" className="px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors">Entrar</Link>
            <Link to="/register" data-testid="landing-register-btn" className="px-4 py-2 text-sm font-medium ys-btn-primary rounded-lg">
              Criar conta
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 ys-grid-bg opacity-70" />
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5 mb-6">
              <Sparkles className="h-3.5 w-3.5" /> ERP inteligente para o seu negócio
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
              Controle inteligente.
              <br />
              <span className="text-primary">Crescimento sem limites.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Tudo do jeito da sua empresa: receitas, despesas, fluxo de caixa e dashboards em tempo real —
              num único painel elegante, rápido e feito para pequenas e médias empresas.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/register" data-testid="hero-register-btn" className="ys-btn-primary rounded-xl px-5 py-3 text-sm font-medium inline-flex items-center gap-2">
                Criar minha conta grátis <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" data-testid="hero-demo-btn" className="rounded-xl px-5 py-3 text-sm font-medium border border-border hover:bg-accent inline-flex items-center gap-2">
                Ver demonstração
              </Link>
              <a href={waLink} target="_blank" rel="noreferrer" data-testid="hero-whatsapp-btn" className="rounded-xl px-5 py-3 text-sm font-medium border border-border hover:bg-accent inline-flex items-center gap-2 text-emerald-600">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </motion.div>

          {/* Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-14 relative"
          >
            <div className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,102,255,0.25)]">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                <span className="ml-3 text-xs text-muted-foreground">app.your-statistics.com/dashboard</span>
              </div>
              <div className="grid grid-cols-4 gap-4 p-6">
                {[
                  { t: "Receita do mês", v: "R$ 82.430", c: "text-emerald-600" },
                  { t: "Despesas", v: "R$ 31.210", c: "text-rose-600" },
                  { t: "Lucro", v: "R$ 51.220", c: "text-primary" },
                  { t: "Saldo em caixa", v: "R$ 124.900", c: "text-foreground" },
                ].map((k) => (
                  <div key={k.t} className="ys-card p-4">
                    <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{k.t}</div>
                    <div className={`mt-2 font-display text-xl font-semibold ${k.c}`}>{k.v}</div>
                  </div>
                ))}
                <div className="col-span-4 ys-card p-6 h-56 relative overflow-hidden">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Fluxo mensal</div>
                  <svg viewBox="0 0 400 120" className="mt-3 w-full h-40">
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0066FF" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#0066FF" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0 90 C 40 60, 80 100, 120 70 S 200 30, 240 50 S 320 20, 400 40 L400 120 L0 120 Z" fill="url(#g1)" />
                    <path d="M0 90 C 40 60, 80 100, 120 70 S 200 30, 240 50 S 320 20, 400 40" stroke="#0066FF" strokeWidth="2" fill="none" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="absolute -top-8 -right-6 hidden md:block ys-float">
              <div className="ys-card p-4 w-56 shadow-lg">
                <div className="text-xs text-muted-foreground">Alerta inteligente</div>
                <div className="mt-1 text-sm font-medium">Fornecedor 15% acima da média</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section id="beneficios" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <div className="text-xs tracking-widest uppercase text-primary font-semibold">Por que Your-Statistics</div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              A ferramenta que faz sua empresa pensar em números.
            </h2>
          </div>
          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="ys-card ys-card-hover p-6"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
                  <b.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 font-display text-lg font-semibold">{b.title}</div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-24 px-6 bg-secondary/40">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight max-w-xl">
            Do cadastro à decisão em minutos.
          </h2>
          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {how.map((s) => (
              <div key={s.step} className="ys-card p-6">
                <div className="text-primary font-display text-2xl font-semibold">{s.step}</div>
                <div className="mt-3 font-medium">{s.title}</div>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="recursos" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight max-w-xl">
              Recursos para gerir tudo em um só lugar.
            </h2>
            <p className="text-muted-foreground max-w-md">Módulos ativos hoje e uma trilha completa que já está em construção.</p>
          </div>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {features.map((f) => (
              <div key={f.t} className="ys-card p-5 flex flex-col items-start gap-3">
                <f.icon className="h-5 w-5 text-primary" />
                <div className="text-sm font-medium">{f.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precos" className="py-24 px-6 bg-secondary/40">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Plano único, ativado pelo WhatsApp.</h2>
          <p className="mt-4 text-muted-foreground">Sem checkout automático. Falamos com você, entendemos seu negócio e liberamos sua conta com um plano justo.</p>
          <div className="mt-10 ys-card p-8 text-left">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-display text-4xl font-semibold">Plano Empresa</span>
              <span className="text-muted-foreground">— sob medida</span>
            </div>
            <ul className="mt-6 grid sm:grid-cols-2 gap-3">
              {[
                "Financeiro completo (receitas, despesas, fluxo de caixa)",
                "Dashboards e relatórios em tempo real",
                "Multi-tenant seguro por empresa",
                "Suporte humano pelo WhatsApp",
                "IA Financeira (em breve)",
                "Backups automáticos",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={waLink} target="_blank" rel="noreferrer" data-testid="pricing-request-btn" className="ys-btn-primary rounded-xl px-5 py-3 text-sm font-medium inline-flex items-center gap-2">
                <MessageCircle className="h-4 w-4" /> Solicitar assinatura
              </a>
              <Link to="/register" className="rounded-xl px-5 py-3 text-sm font-medium border border-border hover:bg-accent">
                Criar conta gratuita
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Perguntas frequentes</h2>
          <div className="mt-10 divide-y divide-border border border-border rounded-2xl overflow-hidden">
            {faqs.map((f) => (
              <details key={f.q} className="group open:bg-accent/40">
                <summary className="cursor-pointer list-none p-6 flex items-center justify-between text-left">
                  <span className="font-medium">{f.q}</span>
                  <span className="text-primary text-xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <LogoLockup />
          <div className="text-sm text-muted-foreground">© {new Date().getFullYear()} Your-Statistics. Todos os direitos reservados.</div>
        </div>
      </footer>
    </div>
  );
}
