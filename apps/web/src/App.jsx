import { useEffect, useState } from "react";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import TickerBar from "./components/layout/TickerBar";
import AnalyticsPreview from "./components/sections/AnalyticsPreview";
import ChallengesSection from "./components/sections/ChallengesSection";
import FAQSection from "./components/sections/FAQSection";
import FinalCTA from "./components/sections/FinalCTA";
import Hero from "./components/sections/Hero";
import JournalPreview from "./components/sections/JournalPreview";
import ModulesSection from "./components/sections/ModulesSection";
import PricingSection from "./components/sections/PricingSection";
import ProblemSection from "./components/sections/ProblemSection";
import SolutionSection from "./components/sections/SolutionSection";
import StatsStrip from "./components/sections/StatsStrip";
import CryptoBackdrop from "./components/visual/CryptoBackdrop";
import SiteHealthWidget from "./components/widgets/SiteHealthWidget";
import LegalDisclaimerPage from "./pages/LegalDisclaimerPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import StatusPage from "./pages/StatusPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";

export default function App() {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const handleRouteChange = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  if (path === "/status") {
    return <StatusPage />;
  }

  if (path === "/legal-disclaimer") {
    return <LegalDisclaimerPage />;
  }

  if (path === "/privacy-policy") {
    return <PrivacyPolicyPage />;
  }

  if (path === "/terms-of-service") {
    return <TermsOfServicePage />;
  }

  return (
    <div className="relative min-h-screen bg-cockpit-bg text-cockpit-text">
      <CryptoBackdrop />
      <div className="relative z-10">
        <TickerBar />
        <Navbar />
      </div>
      <main className="relative z-10">
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <ModulesSection />
        <JournalPreview />
        <ChallengesSection />
        <StatsStrip />
        <AnalyticsPreview />
        <PricingSection />
        <FAQSection />
        <FinalCTA />
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
      <SiteHealthWidget />
    </div>
  );
}
