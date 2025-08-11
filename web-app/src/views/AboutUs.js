import React from "react";
import Navbar from "components/ui/navbar.jsx";
import Footer from "components/ui/footer.jsx";
import { AboutHeroSection, MissionSection, VisionSection, ValuesSection, TestimonialsSection, CTASection } from "components/ui/about";

export default function AboutUs() {
  return (
    <div>
      <Navbar
        logoSrc={require("assets/img/logo-white.png")}
        logoSrcDark={require("assets/img/logo.png")}
      />

      <AboutHeroSection />
      <MissionSection />
      <VisionSection />
      <ValuesSection />
      <TestimonialsSection />
      <CTASection />

      <Footer />
    </div>
  );
}
