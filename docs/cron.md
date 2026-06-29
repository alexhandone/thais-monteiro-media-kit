# Metrics refresh cron

Run the Instagram snapshot refresh once per week with a server-side `POST` request:

```bash
curl -X POST "https://your-domain.example/api/metrics/refresh" \
  -H "Authorization: Bearer $METRICS_REFRESH_SECRET"
```

Recommended schedule: every Monday at 09:00 America/Sao_Paulo.

Example crontab entry:

```cron
0 9 * * 1 curl -fsS -X POST "https://your-domain.example/api/metrics/refresh" -H "Authorization: Bearer $METRICS_REFRESH_SECRET"
```

The endpoint reads the Meta access token only on the server and stores a new row in `instagram_metric_snapshots` with the last 30 days of account, audience, and media metrics.
