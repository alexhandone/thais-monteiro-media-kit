import { AlertCircle, RefreshCw } from "lucide-react";

type MetricsStatusProps = {
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  variant?: "expired" | "preparing";
};

export function MetricsStatus({
  title,
  body,
  ctaLabel,
  ctaHref,
  variant = "expired",
}: MetricsStatusProps) {
  const Icon = variant === "preparing" ? RefreshCw : AlertCircle;

  return (
    <main className="px-5 py-20 sm:px-8 lg:px-10">
      <section className="mx-auto grid min-h-[58vh] max-w-3xl place-items-center text-center">
        <div className="rounded-lg border border-border-soft bg-paper p-7 sm:p-10">
          <Icon className="mx-auto text-accent" size={36} aria-hidden="true" />
          <h1 className="mt-6 font-display text-4xl font-normal sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-base leading-8 text-muted">{body}</p>
          {ctaHref && ctaLabel ? (
            <a
              href={ctaHref}
              className="mt-7 inline-flex rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent hover:text-white"
              style={{ color: "#ffffff" }}
            >
              {ctaLabel}
            </a>
          ) : null}
        </div>
      </section>
    </main>
  );
}
