import React, { useState, useEffect } from 'react';
import Card from '../card.jsx';
import Title from '../Title.jsx';
import { Security, Payment, DirectionsCar } from '@mui/icons-material';
import { useTranslation } from "react-i18next";

const BenefitsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation();
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const benefits = [
    {
      icon: <Security sx={{ fontSize: 48 }} />,
      title: t("benefits_title_home_1"),
      description: t("benefits_description_home_1"),
      iconColor: "var(--primary-dark)"
    },
    {
      icon: <Payment sx={{ fontSize: 48 }} />,
      title: t("benefits_title_home_2"),
      description: t("benefits_description_home_2"),
      iconColor: "var(--accent-dark)"
    },
    {
      icon: <DirectionsCar sx={{ fontSize: 48 }} />,
      title: t("benefits_title_home_3"),
      description: t("benefits_description_home_3"),
      iconColor: "var(--secondary-dark)"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Title variant="section" isVisible={isVisible}>
            {t("benefits_title_home")}
          </Title>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              title={benefit.title}
              description={benefit.description}
              icon={benefit.icon}
              iconColor={benefit.iconColor}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection; 