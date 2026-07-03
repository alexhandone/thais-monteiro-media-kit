import { BioSection } from "@/components/public/BioSection";
import { ContactSection } from "@/components/public/ContactSection";
import { DeliverablesSection } from "@/components/public/DeliverablesSection";
import { DifferentialsSection } from "@/components/public/DifferentialsSection";
import { HeroSection } from "@/components/public/HeroSection";
import { MetricsCtaSection } from "@/components/public/MetricsCtaSection";
import { PartnersSection } from "@/components/public/PartnersSection";
import { SiteHeader } from "@/components/public/SiteHeader";
import { Footer } from "@/components/shared/Footer";
import { WhatsAppFloatingButton } from "@/components/shared/WhatsAppFloatingButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <SiteHeader />
      <main>
        <HeroSection />
        <BioSection />
        <DifferentialsSection />
        <PartnersSection />
        <DeliverablesSection />
        <MetricsCtaSection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppFloatingButton />
    </div>
  );
}
