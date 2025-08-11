import React, { useState, useEffect } from 'react';
import Card from '../card.jsx';
import Title from '../Title.jsx';
import Description from '../Description.jsx';
import { Security, Visibility, Group } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const ValuesSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation();
  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('values-section');
      if (element) {
        const rect = element.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
        setIsVisible(isInView);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const values = [
    {
      id: 1,
      title: t('about_values_title_1'),
      description: t('about_values_description_1'),
      icon: <Security sx={{ fontSize: 48 }} />,
      iconColor: "var(--primary-dark)"
    },
    {
      id: 2,
      title: t('about_values_title_2'),
      description: t('about_values_description_2'),
      icon: <Visibility sx={{ fontSize: 48 }} />,
      iconColor: "var(--secondary-dark)"
    },
    {
      id: 3,
      title: t('about_values_title_3'),
      description: t('about_values_description_3'),
      icon: <Group sx={{ fontSize: 48 }} />,
      iconColor: "var(--accent-dark)"
    }
  ];

  return (
    <section id="values-section" className="relative py-20 bg-gradient-to-br from-white via-gray-50 to-blue-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-40 h-40 bg-[var(--primary-color)]/10 rounded-full opacity-30"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-[var(--primary-light)]/15 rounded-full opacity-25"></div>
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-[var(--secondary-color)]/10 rounded-full opacity-20"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Title variant="section" isVisible={isVisible}>
            {t('about_values_title')}
          </Title>
          <Description variant="section" isVisible={isVisible}>
            {t('about_values_description')}
          </Description>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {values.map((value, index) => (
            <Card
              key={value.id}
              title={value.title}
              description={value.description}
              icon={value.icon}
              iconColor={value.iconColor}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuesSection; 