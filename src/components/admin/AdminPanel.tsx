"use client";

import {
  BarChart3,
  CheckCircle2,
  KeyRound,
  LogOut,
  Mail,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReactNode } from "react";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type SessionPayload = {
  authenticated: boolean;
  requiresSetup: boolean;
  user: AdminUser | null;
};

type TokenStatus = {
  source: "admin" | "env";
  saved: boolean;
  maskedToken: string | null;
  updatedAt: string | null;
  testedAt: string | null;
  lastTestError: string | null;
};

type DashboardPayload = {
  cards: {
    totalViews: number;
    recentViews: number;
    totalLeads: number;
    recentLeads: number;
  };
  daily: Array<{ label: string; leads: number; views: number }>;
  latestLeads: Array<{
    id: string;
    company_or_name: string;
    email: string;
    phone: string;
    created_at: string;
  }>;
  latestSnapshot: {
    period_start: string;
    period_end: string;
    collected_at: string;
  } | null;
  metaToken: TokenStatus;
};

type AdminUserRow = AdminUser & {
  active: boolean;
  created_at: string;
  last_login_at: string | null;
};

type RequestState = {
  type: "idle" | "success" | "error";
  message: string;
};

const initialState: RequestState = { type: "idle", message: "" };
const numberFormatter = new Intl.NumberFormat("pt-BR");

function formatNumber(value: number) {
  return numberFormatter.format(Number(value ?? 0));
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Ainda não registrado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

async function parseJsonResponse(response: Response) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      typeof payload.error === "string"
        ? payload.error
        : "Não foi possível concluir a ação.",
    );
  }

  return payload;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#6d675f]">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        placeholder={placeholder}
        className="w-full border border-[#1f1e1a]/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ef2346]"
      />
    </label>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 bg-[#ef2346] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#1f1e1a] disabled:cursor-wait disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function AdminPanel() {
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "metrics" | "users">(
    "dashboard",
  );
  const [requestState, setRequestState] = useState<RequestState>(initialState);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const [setupSecret, setSetupSecret] = useState("");
  const [setupName, setSetupName] = useState("");
  const [setupEmail, setSetupEmail] = useState("");
  const [setupPassword, setSetupPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [metaToken, setMetaToken] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");

  async function runAction<T>(
    action: string,
    callback: () => Promise<T>,
    successMessage?: string,
  ) {
    setLoadingAction(action);
    setRequestState(initialState);

    try {
      const result = await callback();
      if (successMessage) {
        setRequestState({ type: "success", message: successMessage });
      }
      return result;
    } catch (error) {
      setRequestState({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível concluir a ação.",
      });
      return null;
    } finally {
      setLoadingAction(null);
    }
  }

  async function loadSession() {
    const payload = (await parseJsonResponse(
      await fetch("/api/admin/session"),
    )) as SessionPayload;
    setSession(payload);
    return payload;
  }

  async function loadDashboard() {
    const payload = (await parseJsonResponse(
      await fetch("/api/admin/dashboard"),
    )) as DashboardPayload;
    setDashboard(payload);
  }

  async function loadUsers() {
    const payload = (await parseJsonResponse(
      await fetch("/api/admin/users"),
    )) as { users: AdminUserRow[] };
    setUsers(payload.users);
  }

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const payload = (await parseJsonResponse(
          await fetch("/api/admin/session"),
        )) as SessionPayload;

        if (!mounted) {
          return;
        }

        setSession(payload);

        if (payload.authenticated) {
          await Promise.all([loadDashboard(), loadUsers()]);
        }
      } catch {
        if (mounted) {
          setSession({ authenticated: false, requiresSetup: false, user: null });
        }
      }
    }

    void init();

    return () => {
      mounted = false;
    };
  }, []);

  async function setupFirstUser() {
    await runAction(
      "setup",
      async () => {
        await parseJsonResponse(
          await fetch("/api/admin/setup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              setupSecret,
              name: setupName,
              email: setupEmail,
              password: setupPassword,
            }),
          }),
        );
        await loadSession();
      },
      "Usuário administrativo criado. Faça login para continuar.",
    );
  }

  async function login() {
    const payload = await runAction(
      "login",
      async () =>
        parseJsonResponse(
          await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: loginEmail, password: loginPassword }),
          }),
        ),
      "Login realizado.",
    );

    if (payload) {
      await loadSession();
      await loadDashboard();
      await loadUsers();
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setSession({ authenticated: false, requiresSetup: false, user: null });
    setDashboard(null);
    setUsers([]);
  }

  async function testToken() {
    await runAction(
      "test-token",
      async () =>
        parseJsonResponse(
          await fetch("/api/admin/meta-token/test", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(metaToken.trim() ? { token: metaToken } : {}),
          }),
        ),
      "Conexão com a Meta validada.",
    );
    await loadDashboard();
  }

  async function saveToken() {
    await runAction(
      "save-token",
      async () =>
        parseJsonResponse(
          await fetch("/api/admin/meta-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: metaToken }),
          }),
        ),
      "Token salvo com segurança.",
    );
    setMetaToken("");
    await loadDashboard();
  }

  async function refreshMetrics() {
    await runAction(
      "metrics",
      async () =>
        parseJsonResponse(
          await fetch("/api/admin/metrics/refresh", { method: "POST" }),
        ),
      "Snapshot geral atualizado.",
    );
    await loadDashboard();
  }

  async function refreshStories() {
    await runAction(
      "stories",
      async () =>
        parseJsonResponse(
          await fetch("/api/admin/metrics/stories/refresh", { method: "POST" }),
        ),
      "Coleta de stories executada.",
    );
  }

  async function createUser() {
    await runAction(
      "create-user",
      async () =>
        parseJsonResponse(
          await fetch("/api/admin/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: newUserName,
              email: newUserEmail,
              password: newUserPassword,
            }),
          }),
        ),
      "Novo usuário cadastrado.",
    );
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPassword("");
    await loadUsers();
  }

  const isBusy = Boolean(loadingAction);

  if (!session) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#efede8] px-5">
        <RefreshCw className="animate-spin text-[#ef2346]" />
      </main>
    );
  }

  if (session.requiresSetup) {
    return (
      <AuthShell title="Primeiro acesso" subtitle="Crie o primeiro usuário admin.">
        <Field label="Segredo inicial" value={setupSecret} onChange={setSetupSecret} type="password" />
        <Field label="Nome" value={setupName} onChange={setSetupName} />
        <Field label="E-mail" value={setupEmail} onChange={setSetupEmail} type="email" />
        <Field label="Senha" value={setupPassword} onChange={setSetupPassword} type="password" />
        <PrimaryButton onClick={setupFirstUser} disabled={isBusy}>
          <ShieldCheck size={16} /> Criar admin
        </PrimaryButton>
        <StateMessage state={requestState} />
      </AuthShell>
    );
  }

  if (!session.authenticated) {
    return (
      <AuthShell title="Login administrativo" subtitle="Acesse o painel da Thais Monteiro.">
        <Field label="E-mail" value={loginEmail} onChange={setLoginEmail} type="email" />
        <Field label="Senha" value={loginPassword} onChange={setLoginPassword} type="password" />
        <PrimaryButton onClick={login} disabled={isBusy}>
          <KeyRound size={16} /> Entrar
        </PrimaryButton>
        <StateMessage state={requestState} />
      </AuthShell>
    );
  }

  return (
    <main className="min-h-screen bg-[#efede8] px-5 py-8 text-[#1f1e1a] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 border-b border-[#1f1e1a]/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#1f1e1a]/10 bg-white/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#ef2346]">
              <ShieldCheck size={15} /> Área administrativa
            </p>
            <h1 className="font-serif text-5xl leading-none md:text-7xl">
              Painel admin
            </h1>
            <p className="mt-3 text-sm text-[#6d675f]">
              Logado como {session.user?.name}
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 border border-[#1f1e1a]/10 bg-white/60 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] transition hover:border-[#ef2346] hover:text-[#ef2346]"
          >
            <LogOut size={15} /> Sair
          </button>
        </header>

        <nav className="mb-6 flex flex-wrap gap-2">
          {[
            ["dashboard", "Dashboard", BarChart3],
            ["metrics", "Métricas", Sparkles],
            ["users", "Usuários", Users],
          ].map(([value, label, Icon]) => (
            <button
              key={String(value)}
              type="button"
              onClick={() => setActiveTab(value as typeof activeTab)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                activeTab === value
                  ? "bg-[#1f1e1a] text-white"
                  : "bg-white/60 text-[#6d675f] hover:text-[#ef2346]"
              }`}
            >
              <Icon size={15} /> {String(label)}
            </button>
          ))}
        </nav>

        {activeTab === "dashboard" && dashboard ? (
          <DashboardTab dashboard={dashboard} />
        ) : null}

        {activeTab === "metrics" ? (
          <MetricsTab
            dashboard={dashboard}
            metaToken={metaToken}
            setMetaToken={setMetaToken}
            testToken={testToken}
            saveToken={saveToken}
            refreshMetrics={refreshMetrics}
            refreshStories={refreshStories}
            isBusy={isBusy}
          />
        ) : null}

        {activeTab === "users" ? (
          <UsersTab
            users={users}
            name={newUserName}
            email={newUserEmail}
            password={newUserPassword}
            setName={setNewUserName}
            setEmail={setNewUserEmail}
            setPassword={setNewUserPassword}
            createUser={createUser}
            isBusy={isBusy}
          />
        ) : null}

        <StateMessage state={requestState} />
      </div>
    </main>
  );
}

function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#efede8] px-5 text-[#1f1e1a]">
      <section className="w-full max-w-md border border-[#1f1e1a]/10 bg-white/70 p-6 shadow-sm backdrop-blur-xl">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#ef2346]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#ef2346]">
          <ShieldCheck size={15} /> Admin
        </p>
        <h1 className="font-serif text-5xl leading-none">{title}</h1>
        <p className="mt-3 text-sm text-[#6d675f]">{subtitle}</p>
        <div className="mt-6 grid gap-4">{children}</div>
      </section>
    </main>
  );
}

function StateMessage({ state }: { state: RequestState }) {
  if (state.type === "idle") {
    return null;
  }

  return (
    <p
      className={`mt-5 border px-4 py-3 text-sm ${
        state.type === "success"
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
          : "border-[#ef2346]/20 bg-[#ef2346]/10 text-[#ef2346]"
      }`}
    >
      {state.message}
    </p>
  );
}

function DashboardTab({ dashboard }: { dashboard: DashboardPayload }) {
  const cards = [
    ["Visitas totais", dashboard.cards.totalViews],
    ["Visitas em 7 dias", dashboard.cards.recentViews],
    ["Solicitações totais", dashboard.cards.totalLeads],
    ["Solicitações em 7 dias", dashboard.cards.recentLeads],
  ];

  return (
    <section className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <article key={String(label)} className="border border-[#1f1e1a]/10 bg-white/65 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6d675f]">
              {label}
            </p>
            <p className="mt-3 text-3xl font-semibold">{formatNumber(Number(value))}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <section className="border border-[#1f1e1a]/10 bg-white/65 p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em]">
            Evolução diária
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboard.daily}>
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip />
                <Area dataKey="views" name="Visitas" stroke="#ef2346" fill="#ef2346" fillOpacity={0.12} />
                <Area dataKey="leads" name="Solicitações" stroke="#1f1e1a" fill="#1f1e1a" fillOpacity={0.08} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="border border-[#1f1e1a]/10 bg-white/65 p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em]">
            Status
          </h2>
          <div className="space-y-4 text-sm text-[#5f5a52]">
            <p>
              <strong className="text-[#1f1e1a]">Token Meta:</strong>{" "}
              {dashboard.metaToken.source === "admin"
                ? dashboard.metaToken.maskedToken
                : "usando variável de ambiente"}
            </p>
            <p>
              <strong className="text-[#1f1e1a]">Último teste:</strong>{" "}
              {formatDate(dashboard.metaToken.testedAt)}
            </p>
            <p>
              <strong className="text-[#1f1e1a]">Último snapshot:</strong>{" "}
              {formatDate(dashboard.latestSnapshot?.collected_at)}
            </p>
          </div>
        </section>
      </div>

      <LeadsTable leads={dashboard.latestLeads} />
    </section>
  );
}

function LeadsTable({ leads }: { leads: DashboardPayload["latestLeads"] }) {
  return (
    <section className="overflow-hidden border border-[#1f1e1a]/10 bg-white/65">
      <div className="border-b border-[#1f1e1a]/10 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em]">
          Últimas solicitações
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.18em] text-[#6d675f]">
            <tr>
              <th className="px-5 py-3">Nome/empresa</th>
              <th className="px-5 py-3">E-mail</th>
              <th className="px-5 py-3">Telefone</th>
              <th className="px-5 py-3">Data</th>
              <th className="px-5 py-3">Contato</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t border-[#1f1e1a]/10">
                <td className="px-5 py-4 font-medium">{lead.company_or_name}</td>
                <td className="px-5 py-4">{lead.email}</td>
                <td className="px-5 py-4">{lead.phone}</td>
                <td className="px-5 py-4">{formatDate(lead.created_at)}</td>
                <td className="px-5 py-4">
                  <a
                    href={`mailto:${lead.email}`}
                    className="inline-flex items-center gap-2 text-[#ef2346]"
                  >
                    <Mail size={15} /> E-mail
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MetricsTab(props: {
  dashboard: DashboardPayload | null;
  metaToken: string;
  setMetaToken: (value: string) => void;
  testToken: () => void;
  saveToken: () => void;
  refreshMetrics: () => void;
  refreshStories: () => void;
  isBusy: boolean;
}) {
  return (
    <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <article className="border border-[#1f1e1a]/10 bg-white/65 p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em]">
          Token da Meta
        </h2>
        <p className="mb-4 text-sm text-[#6d675f]">
          Token atual: {props.dashboard?.metaToken.maskedToken ?? "fallback do ambiente"}.
        </p>
        <textarea
          value={props.metaToken}
          onChange={(event) => props.setMetaToken(event.target.value)}
          className="min-h-32 w-full resize-y border border-[#1f1e1a]/10 bg-white px-4 py-3 font-mono text-xs outline-none transition focus:border-[#ef2346]"
          placeholder="Cole aqui o Page Access Token da Meta"
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <PrimaryButton onClick={props.testToken} disabled={props.isBusy}>
            <CheckCircle2 size={16} /> Testar
          </PrimaryButton>
          <PrimaryButton onClick={props.saveToken} disabled={props.isBusy}>
            <Save size={16} /> Salvar
          </PrimaryButton>
        </div>
      </article>
      <article className="border border-[#1f1e1a]/10 bg-white/65 p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em]">
          Coletas manuais
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <PrimaryButton onClick={props.refreshMetrics} disabled={props.isBusy}>
            <RefreshCw size={16} /> Atualizar métricas
          </PrimaryButton>
          <PrimaryButton onClick={props.refreshStories} disabled={props.isBusy}>
            <Sparkles size={16} /> Coletar stories
          </PrimaryButton>
        </div>
      </article>
    </section>
  );
}

function UsersTab(props: {
  users: AdminUserRow[];
  name: string;
  email: string;
  password: string;
  setName: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  createUser: () => void;
  isBusy: boolean;
}) {
  return (
    <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <article className="border border-[#1f1e1a]/10 bg-white/65 p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em]">
          Novo usuário
        </h2>
        <div className="grid gap-4">
          <Field label="Nome" value={props.name} onChange={props.setName} />
          <Field label="E-mail" value={props.email} onChange={props.setEmail} type="email" />
          <Field label="Senha" value={props.password} onChange={props.setPassword} type="password" />
          <PrimaryButton onClick={props.createUser} disabled={props.isBusy}>
            <UserPlus size={16} /> Cadastrar
          </PrimaryButton>
        </div>
      </article>
      <article className="border border-[#1f1e1a]/10 bg-white/65 p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em]">
          Usuários cadastrados
        </h2>
        <div className="space-y-3">
          {props.users.map((user) => (
            <div key={user.id} className="flex items-center justify-between border border-[#1f1e1a]/10 bg-white/60 p-4 text-sm">
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-[#6d675f]">{user.email}</p>
              </div>
              <span className="text-xs uppercase tracking-[0.18em] text-[#6d675f]">
                {user.role}
              </span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
