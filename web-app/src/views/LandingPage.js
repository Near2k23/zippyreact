import React, { useEffect } from 'react';
import Navbar from "components/ui/navbar.jsx";
import Footer from "components/ui/footer.jsx";
import {colors} from '../components/Theme/WebTheme';
import HeroSection from "../components/ui/home/heroSection.jsx";
import BenefitsSection from "../components/ui/home/benefitsSection.jsx";
import HowItWorksSection from "../components/ui/home/howItWorksSection.jsx";
import FeaturesSection from "../components/ui/home/featuresSection.jsx";
import DriverRecruitmentSection from "../components/ui/home/driverRecruitmentSection.jsx";
import FAQSection from "../components/ui/home/faqSection.jsx";

import { useSelector } from "react-redux";

export default function LandingPage() {

  const auth = useSelector(state => state.auth);

  useEffect(() => {
    if (auth && auth.profile) {
      if(auth.profile.uid){
      }
    }
  }, [auth]);

  return (
    <div style={{backgroundColor:colors.LandingPage_Background}}>
      <Navbar 
        logoSrc={require("../assets/img/logo.png")}
        logoSrcDark={require("../assets/img/logo.png")}
        darkText={true}
      />
      <HeroSection />
      <BenefitsSection />
      <HowItWorksSection />
      <FeaturesSection />
      <DriverRecruitmentSection />
      <FAQSection />
      <Footer />
    </div>
  );
}
