import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const AboutHeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0">
        <img 
          src={require("../../../assets/img/background.jpg")} 
          alt="Ciudad vibrante" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center">
          <div className={`transition-all duration-1000 ease-out transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
          }`}>
            <div className="mb-8">
              <span className="inline-block text-lg sm:text-xl md:text-2xl font-medium text-white/60 tracking-wider uppercase">
                {t('about_hero_title')}
              </span>
            </div>
            <div className="mb-8">
              <img 
                src={require("../../../assets/img/logo-white.png")} 
                alt="Waygo" 
                className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto mx-auto drop-shadow-2xl"
              />
            </div>
          </div>

          <div className={`transition-all duration-1000 ease-out delay-200 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
          }`}>
            <div className="mb-12">
              <div className="inline-block px-6 py-2 bg-gradient-to-r from-[var(--primary-color)]/20 to-[var(--primary-light)]/20 backdrop-blur-sm border border-[var(--primary-color)]/30 rounded-full">
                <span className="text-base sm:text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary-color)] via-[var(--primary-light)] to-[var(--secondary-color)]">
                  {t('about_hero_subtitle')}
                </span>
              </div>
            </div>
          </div>

          <div className={`transition-all duration-1000 ease-out delay-400 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
          }`}>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg sm:text-xl md:text-2xl text-white/90 leading-relaxed font-light">
                {t('about_hero_description')}
                <span className="block mt-2 text-white font-medium">
                    {t('about_hero_description_2')}
                </span>
              </p>
            </div>
          </div>

          <div className={`transition-all duration-1000 ease-out delay-600 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
          }`}>
            <div className="mt-16 flex justify-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-white/70 text-sm font-medium">{t('about_hero_feature_1')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-white/70 text-sm font-medium">{t('about_hero_feature_2')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-white/70 text-sm font-medium">{t('about_hero_feature_3')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      

      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/50 to-transparent"></div>
    </section>
  );
};

export default AboutHeroSection; 