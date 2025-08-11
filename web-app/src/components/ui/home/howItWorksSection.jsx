import React, { useState, useEffect } from 'react';
import Card2 from '../Card2.jsx';
import Title from '../Title.jsx';
import { Add, LocationOn, EmojiEmotions, Check } from '@mui/icons-material';
import { useTranslation } from "react-i18next"; 

const HowItWorksSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation(); 
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const steps = [
    {
      number: "01",
      icon: <Add sx={{ fontSize: 32, color: 'white' }} />,
      title: t("how_it_works_title_home_1"),
      description: t("how_it_works_description_home_1") 
    },
    {
      number: "02",
      icon: <LocationOn sx={{ fontSize: 32, color: 'white' }} />,
      title: t("how_it_works_title_home_2"),
      description: t("how_it_works_description_home_2")
    },
    {
      number: "03",
      icon: <EmojiEmotions sx={{ fontSize: 32, color: 'white' }} />,
      title: t("how_it_works_title_home_3"),
      description: t("how_it_works_description_home_3") 
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Title variant="section" isVisible={isVisible}>
            {t("how_it_works_title_home")}  
          </Title>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <Card2
              key={index}
              number={step.number}
              icon={step.icon}
              title={step.title}
              description={step.description}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>

        <div className={`text-center mt-16 transition-all duration-1000 ease-out transform delay-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 mb-4">
            <Check sx={{ fontSize: 24, color: 'white' }} />
          </div>
          <p className="text-lg font-semibold text-gray-700">
            {t("how_it_works_title_home_4")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection; 