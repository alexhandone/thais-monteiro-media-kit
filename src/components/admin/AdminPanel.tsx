"use client";

import {
  CheckCircle2,
  EyeOff,
  KeyRound,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

type TokenStatus = {
  source: "admin" | "env";
  saved: boolean;
  maskedToken: string | null;
  updatedAt: string | null;
  testedAt: string | null;
  lastTestError: string | null;
};

type RequestState = {
  type: "idle" | "success" | "error";
  message: string;
};

const initialState: RequestState = {
  type: "idle",
  message: "",
};

function formatDate(value: string | null) {
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

export function AdminPanel() {
  const [adminSecret, setAdminSecret] = useState("");
  const [metaToken, setMetaToken] = useState("");
  const [status, setStatus] = useState<TokenStatus | null>(null);
  const [requestState, setRequestState] = useState<RequestState>(initialState);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  async function adminFetch(path: string, init: RequestInit = {}) {
    return fetch(path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminSecret}`,
        ...init.headers,
      },
    });
  }

  async function runAction<T>(
    action: string,
    callback: () => Promise<T>,
    successMessage: string,
  ) {
    if (!adminSecret.trim()) {
      setRequestState({
        type: "error",
        message: "Informe a senha administrativa antes de continuar.",
      });
      return null;
    }

    setLoadingAction(action);
    setRequestState(initialState);

    try {
      const result = await callback();
      setRequestState({ type: "success", message: successMessage });
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

  async function loadStatus() {
    const result = await runAction(
      "status",
      async () => parseJsonResponse(await adminFetch("/api/admin/meta-token")),
      "Status carregado.",
    );

    if (result) {
      setStatus(result as TokenStatus);
    }
  }

  async function testToken() {
    const result = await runAction(
      "test",
      async () =>
        parseJsonResponse(
          await adminFetch("/api/admin/meta-token/test", {
            method: "POST",
            body: JSON.stringify(metaToken.trim() ? { token: metaToken } : {}),
          }),
        ),
      "Conexão com a Meta validada.",
    );

    if (result) {
      await loadStatus();
    }
  }

  async function saveToken() {
    if (!metaToken.trim()) {
      setRequestState({
        type: "error",
        message: "Cole o novo token da Meta antes de salvar.",
      });
      return;
    }

    const result = await runAction(
      "save",
      async () =>
        parseJsonResponse(
          await adminFetch("/api/admin/meta-token", {
            method: "POST",
            body: JSON.stringify({ token: metaToken }),
          }),
        ),
      "Token salvo com segurança.",
    );

    if (result) {
      setMetaToken("");
      await loadStatus();
    }
  }

  async function refreshMetrics() {
    await runAction(
      "metrics",
      async () =>
        parseJsonResponse(
          await adminFetch("/api/metrics/refresh", { method: "POST" }),
        ),
      "Snapshot geral atualizado.",
    );
  }

  async function refreshStories() {
    await runAction(
      "stories",
      async () =>
        parseJsonResponse(
          await adminFetch("/api/metrics/stories/refresh", { method: "POST" }),
        ),
      "Coleta de stories executada.",
    );
  }

  const isBusy = Boolean(loadingAction);

  return (
    <main className="min-h-screen bg-[#efede8] text-[#1f1e1a]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-5 py-12 sm:px-8">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#1f1e1a]/10 bg-white/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#ef2346]">
              <ShieldCheck size={15} />
              Área administrativa
            </p>
            <h1 className="font-serif text-5xl leading-none md:text-7xl">
              Controle de métricas
            </h1>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#5f5a52]">
            Atualize o token da Meta, valide a conexão e dispare snapshots sem
            editar código ou variáveis da Vercel.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="border border-[#1f1e1a]/10 bg-white/65 p-5 shadow-sm backdrop-blur-xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-[#ef2346]/10 text-[#ef2346]">
                <KeyRound size={18} />
              </span>
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.22em]">
                  Acesso
                </h2>
                <p className="text-sm text-[#6d675f]">
                  Use o mesmo segredo de atualização das métricas.
                </p>
              </div>
            </div>

            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#6d675f]">
              Senha administrativa
            </label>
            <input
              value={adminSecret}
              onChange={(event) => setAdminSecret(event.target.value)}
              type="password"
              className="mb-4 w-full border border-[#1f1e1a]/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ef2346]"
              placeholder="Cole o METRICS_REFRESH_SECRET"
            />

            <button
              type="button"
              onClick={loadStatus}
              disabled={isBusy}
              className="inline-flex w-full items-center justify-center gap-2 bg-[#1f1e1a] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#ef2346] disabled:cursor-wait disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={loadingAction === "status" ? "animate-spin" : ""}
              />
              Carregar status
            </button>

            {status ? (
              <div className="mt-5 space-y-3 border-t border-[#1f1e1a]/10 pt-5 text-sm text-[#5f5a52]">
                <p>
                  <strong className="text-[#1f1e1a]">Origem:</strong>{" "}
                  {status.source === "admin"
                    ? "Token salvo no painel"
                    : "Variável de ambiente"}
                </p>
                <p>
                  <strong className="text-[#1f1e1a]">Token:</strong>{" "}
                  {status.maskedToken ?? "Usando fallback do ambiente"}
                </p>
                <p>
                  <strong className="text-[#1f1e1a]">Atualizado:</strong>{" "}
                  {formatDate(status.updatedAt)}
                </p>
                <p>
                  <strong className="text-[#1f1e1a]">Último teste:</strong>{" "}
                  {formatDate(status.testedAt)}
                </p>
                {status.lastTestError ? (
                  <p className="text-[#ef2346]">{status.lastTestError}</p>
                ) : null}
              </div>
            ) : null}
          </section>

          <section className="border border-[#1f1e1a]/10 bg-white/70 p-5 shadow-sm backdrop-blur-xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-[#ef2346]/10 text-[#ef2346]">
                <EyeOff size={18} />
              </span>
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.22em]">
                  Token da Meta
                </h2>
                <p className="text-sm text-[#6d675f]">
                  O valor salvo fica criptografado no Supabase.
                </p>
              </div>
            </div>

            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#6d675f]">
              Novo token
            </label>
            <textarea
              value={metaToken}
              onChange={(event) => setMetaToken(event.target.value)}
              className="min-h-32 w-full resize-y border border-[#1f1e1a]/10 bg-white px-4 py-3 font-mono text-xs outline-none transition focus:border-[#ef2346]"
              placeholder="Cole aqui o Page Access Token da Meta"
            />

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={testToken}
                disabled={isBusy}
                className="inline-flex items-center justify-center gap-2 border border-[#ef2346]/30 bg-[#ef2346]/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#ef2346] transition hover:bg-[#ef2346] hover:text-white disabled:cursor-wait disabled:opacity-60"
              >
                <CheckCircle2 size={16} />
                Testar
              </button>
              <button
                type="button"
                onClick={saveToken}
                disabled={isBusy}
                className="inline-flex items-center justify-center gap-2 bg-[#ef2346] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#1f1e1a] disabled:cursor-wait disabled:opacity-60"
              >
                <Save size={16} />
                Salvar token
              </button>
            </div>

            <div className="mt-6 grid gap-3 border-t border-[#1f1e1a]/10 pt-5 sm:grid-cols-2">
              <button
                type="button"
                onClick={refreshMetrics}
                disabled={isBusy}
                className="inline-flex items-center justify-center gap-2 bg-[#1f1e1a] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#ef2346] disabled:cursor-wait disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={loadingAction === "metrics" ? "animate-spin" : ""}
                />
                Atualizar métricas
              </button>
              <button
                type="button"
                onClick={refreshStories}
                disabled={isBusy}
                className="inline-flex items-center justify-center gap-2 bg-[#1f1e1a] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#ef2346] disabled:cursor-wait disabled:opacity-60"
              >
                <Sparkles size={16} />
                Coletar stories
              </button>
            </div>

            {requestState.type !== "idle" ? (
              <p
                className={`mt-5 border px-4 py-3 text-sm ${
                  requestState.type === "success"
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
                    : "border-[#ef2346]/20 bg-[#ef2346]/10 text-[#ef2346]"
                }`}
              >
                {requestState.message}
              </p>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}
