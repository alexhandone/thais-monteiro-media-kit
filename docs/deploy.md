# Deploy

## Variaveis obrigatorias

Configure as variaveis abaixo no ambiente de deploy:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `META_GRAPH_API_VERSION`
- `META_INSTAGRAM_ACCOUNT_ID`
- `META_PAGE_ID`
- `META_ACCESS_TOKEN`
- `METRICS_REFRESH_SECRET`
- `TOKEN_HASH_SECRET`
- `NEXT_PUBLIC_WHATSAPP_URL`
- `NEXT_PUBLIC_INSTAGRAM_URL`
- `NEXT_PUBLIC_CONTACT_EMAIL`

Use valores fortes para `METRICS_REFRESH_SECRET` e `TOKEN_HASH_SECRET`. O
primeiro deve ter pelo menos 24 caracteres e o segundo pelo menos 32 caracteres.

## Banco de dados

1. Crie ou selecione o projeto Supabase de producao.
2. Aplique a migration em `supabase/migrations/0001_initial_schema.sql` com a
   Supabase CLI ou pelo SQL Editor.
3. Confirme que as tabelas `leads`, `metric_access_tokens` e
   `instagram_metric_snapshots` existem.
4. Confirme que RLS esta habilitado nas tres tabelas. O MVP usa apenas rotas
   server-side com `SUPABASE_SERVICE_ROLE_KEY`, entao a migration nao cria
   policies publicas de leitura ou escrita.

## Anti-abuso do formulario

O endpoint publico de leads inclui honeypot e rate limit em memoria por IP para
reduzir abuso basico. Em producao com serverless ou multiplas instancias,
configure tambem protecao compartilhada ou de borda, como Vercel WAF, Upstash
Rate Limit, Cloudflare Turnstile ou outra solucao com TTL distribuido.

## Refresh inicial de metricas

Depois do deploy e das variaveis configuradas, faca a primeira chamada manual:

```bash
curl -X POST "https://seu-dominio.com/api/metrics/refresh" \
  -H "Authorization: Bearer $METRICS_REFRESH_SECRET"
```

A resposta deve retornar `periodStart`, `periodEnd`, `collectedAt` e
`topContentCount`. Se retornar `401`, revise `METRICS_REFRESH_SECRET`. Se
retornar `500`, revise as credenciais Meta e Supabase.

## Cron semanal

Configure uma execucao semanal do endpoint `POST /api/metrics/refresh`. Agenda
recomendada: segunda-feira as 09:00 em `America/Sao_Paulo`.

Exemplo de cron:

```cron
0 9 * * 1 curl -fsS -X POST "https://seu-dominio.com/api/metrics/refresh" -H "Authorization: Bearer $METRICS_REFRESH_SECRET"
```

## Validacao pos-deploy

1. Acesse a landing publica e confirme que o formulario de metricas aparece.
2. Envie um lead de teste com nome ou empresa, email e WhatsApp validos.
3. Confirme que o redirecionamento abre a pagina privada de metricas.
4. Confirme no Supabase que o lead e o token foram gravados.
5. Teste um token expirado ou invalido acessando `/metricas/token-expirado` e
   confirme que a pagina bloqueia o acesso sem expor metricas.
