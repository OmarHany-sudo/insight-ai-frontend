import { Footer } from "@/components/marketing/Footer";
import { Navigation } from "@/components/marketing/Navigation";
import { Pricing } from "@/components/marketing/Pricing";

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-brand-primary">
      <Navigation />
      <main className="pt-24">
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
