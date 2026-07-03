import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { MetricsDashboard } from "@/components/metrics/MetricsDashboard";
import { SiteHeader } from "@/components/public/SiteHeader";
import { Footer } from "@/components/shared/Footer";
import { WhatsAppFloatingButton } from "@/components/shared/WhatsAppFloatingButton";
import { getAdminUserFromRequest } from "@/lib/admin-session";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Métricas Admin | Thais Monteiro",
  robots: {
    index: false,
    follow: false,
  },
};

async function requireAdminUser() {
  const headerList = await headers();
  const request = new Request("http://localhost/admin/metricas", {
    headers: {
      cookie: headerList.get("cookie") ?? "",
    },
  });
  const user = await getAdminUserFromRequest(request);

  if (!user) {
    redirect("/admin");
  }

  return user;
}

export default async function AdminMetricsPage() {
  await requireAdminUser();

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <SiteHeader linkPrefix="/" />
      <MetricsDashboard
        supabase={createServiceRoleSupabaseClient()}
        footerNote="Acesso administrativo: esta visualização não cria lead, não expira em 7 dias e usa apenas a sessão do painel admin."
      />
      <Footer />
      <WhatsAppFloatingButton />
    </div>
  );
}
