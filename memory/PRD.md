# Your-Statistics — PRD

## Original Problem Statement (Resumo)
SaaS ERP financeiro premium chamado **Your-Statistics** (slogan: "Controle inteligente. Crescimento sem limites."). Aparência de empresa bilionária (Stripe, Notion, Linear, Vercel, Apple) — nunca template comum. Multi-tenant, público-alvo: salões, lojas, mercados, oficinas, gráficas, restaurantes, padarias, clínicas, escritórios, prestadores. Cadastro exige aprovação manual pelo administrador. Pagamento via WhatsApp (sem checkout automático). Painel Master exclusivo para admin. Dashboard começa VAZIO e orienta o usuário a cadastrar. UI em Português BR.

**Stack utilizada:** React 19 + Tailwind + shadcn + Recharts + Framer Motion + FastAPI + MongoDB (Motor) + JWT/bcrypt.

## User Personas
- **Admin (Luís)** — dono do sistema (luluis@gmail.com). Aprova/suspende/reativa contas. Vê todas as empresas.
- **Empresário cliente** — cadastra sua empresa, aguarda aprovação, gerencia finanças, cadastra clientes, produtos etc (Fase 2).
- **Visitante** — chega pela landing page, converte via "Criar conta" ou "WhatsApp".

## Core Requirements (static)
1. Multi-tenant com isolamento total por `tenant_id`.
2. Nada visível antes do login (exceto landing + login + register).
3. Aprovação manual antes de acesso ao ERP.
4. Painel Master seguro (rota `/master`, guard admin-only).
5. Dashboard começa vazio, sem dados falsos.
6. WhatsApp `+5573981891863` no botão "Solicitar assinatura" e na tela de pendente.
7. Design premium (Outfit + Inter, rounded-2xl, glassmorphism, framer-motion micro-anim).
8. Todos os elementos interativos com `data-testid`.

## What's Implemented (Fase 1 — 08/07/2026)
- **Auth**: JWT (7d) + bcrypt, cookie httpOnly + Bearer, /register, /login, /logout, /auth/me.
- **Seed automático**: admin `luluis@gmail.com` + demo (`demo@yourstatistics.com`/`Demo@2026!`) + pending (`pendente@yourstatistics.com`/`Pendente@2026!`).
- **Landing page** premium com hero, benefícios, como funciona, recursos, preços, FAQ, rodapé.
- **/register** completo (nome, empresa, contatos, cidade/UF, tipo, funcionários, senha+confirm, termos).
- **/pending-approval** com botão WhatsApp pré-preenchido.
- **Painel Master** `/master`: lista empresas/usuários, KPIs, busca, filtros (todos/pendente/aprovado/suspenso), aprovar/suspender/reativar/excluir/detalhes.
- **Sidebar** com todos os módulos (Financeiro ativo, demais "Em breve"), avatar, logout.
- **Dashboard cliente** `/app/dashboard`: 8 KPIs em tempo real, empty state elegante, gráficos AreaChart 12 meses + BarChart 7 dias, "Últimas movimentações".
- **Módulo Financeiro**: `/app/revenues`, `/app/expenses`, `/app/financial`, `/app/cashflow` (create/list/delete + totals), categorias e formas de pagamento pré-definidas.
- **Guards de rota**: pendente → /pending-approval; não-admin bloqueado em /master; unauth bloqueado em /app/*.

## Backlog (Prioritizado)
### P0 — Próximas features
- [ ] Login social (Google/Apple) via Emergent Google Auth
- [ ] Editar transações (hoje só criar/excluir)
- [ ] Recuperação de senha (esqueci minha senha)

### P1 — Gestão do cliente (foco solicitado pelo usuário)
- [ ] Módulo **Clientes** (cadastro, histórico, LTV, agenda)
- [ ] Módulo **Fornecedores**
- [ ] Módulo **Produtos + Estoque** (SKU, custo/venda, alertas de estoque baixo)
- [ ] Módulo **Funcionários** (folha, comissões)
- [ ] Módulo **Agenda** com calendário

### P1 — Financeiro avançado
- [ ] Bancos, PIX, Cartões, Contas recorrentes, Parcelamentos, Transferências, Centro de custos
- [ ] Relatórios (DRE, extrato, comparativo, exportação PDF/Excel)
- [ ] Metas mensais e alertas inteligentes

### P2 — Inteligência & Diferenciais
- [ ] **IA Financeira** (Claude Sonnet 4.5) — perguntas em linguagem natural sobre os próprios dados
- [ ] 2FA, auditoria detalhada, backups automáticos exportáveis
- [ ] Configurações da empresa (logo, dados fiscais, permissões de equipe)

## Test Credentials
Ver `/app/memory/test_credentials.md`.
