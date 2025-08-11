import React, { useState, useEffect } from 'react';
import Card from '../card.jsx';
import Title from '../Title.jsx';
import Description from '../Description.jsx';
import { Bolt, CheckCircle, Group } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const MissionSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation();
  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('mission-section');
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

  const missionCards = [
    {
      id: 1,
      title: t('about_mission_title_1'),
      description: t('about_mission_description_1'),
      icon: <Bolt sx={{ fontSize: 48 }} />,
      iconColor: "var(--primary-dark)"
    },
    {
      id: 2,
      title: t('about_mission_title_2'),
      description: t('about_mission_description_2'),
      icon: <CheckCircle sx={{ fontSize: 48 }} />,
      iconColor: "var(--accent-dark)"
    },
    {
      id: 3,
      title: t('about_mission_title_3'),
      description: t('about_mission_description_3'),
      icon: <Group sx={{ fontSize: 48 }} />,
      iconColor: "var(--secondary-dark)"
    }
  ];

  return (
    <section id="mission-section" className="relative py-20 bg-gradient-to-br from-white via-gray-50 to-blue-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-40 h-40 bg-[var(--primary-color)]/10 rounded-full opacity-30"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-[var(--primary-light)]/15 rounded-full opacity-25"></div>
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-[var(--secondary-color)]/10 rounded-full opacity-20"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Title variant="section" isVisible={isVisible}>
            {t('about_mission_title')}
          </Title>
          <Description variant="section" isVisible={isVisible}>
            {t('about_mission_description')}
          </Description>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {missionCards.map((card, index) => (
            <Card
              key={card.id}
              title={card.title}
              description={card.description}
              icon={card.icon}
              iconColor={card.iconColor}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>

        <div className={`mt-20 transition-all duration-1000 ease-out delay-1000 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}>
        </div>
      </div>
    </section>
  );
};

export default MissionSection; 