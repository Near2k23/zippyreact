import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const CTASection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const settings = useSelector(state => state.settingsdata.settings);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('cta-section');
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

  const handleAppDownload = (url) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  // Función para obtener el icono correcto según el idioma
  const getDownloadIcon = (type) => {
    const currentLanguage = i18n.language;
    const isSpanish = currentLanguage === 'es' || currentLanguage.startsWith('es');
    
    if (type === 'google') {
      return isSpanish 
        ? require("../../../assets/img/download_google_ESP.png")
        : require("../../../assets/img/download_google.png");
    } else if (type === 'apple') {
      return isSpanish 
        ? require("../../../assets/img/download_apple_ESP.png")
        : require("../../../assets/img/download_apple.png");
    }
  };

  return (
    <section id="cta-section" className="relative py-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-dark)] via-[var(--primary-color)] to-[var(--secondary-dark)]"></div>
      
      <div className="absolute inset-0 bg-gradient-radial from-[var(--primary-light)]/40 via-[var(--primary-color)]/20 to-transparent"></div>
      
      <div className="absolute inset-0 bg-gradient-to-tr from-[var(--primary-light)]/30 via-transparent to-[var(--secondary-color)]/20"></div>
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-gradient-to-br from-[var(--primary-color)]/25 to-[var(--secondary-color)]/20 rounded-full blur-3xl"></div>
        
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-gradient-to-tr from-[var(--primary-light)]/30 to-[var(--primary-color)]/25 rounded-full blur-3xl"></div>
        
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-gradient-to-r from-[var(--secondary-color)]/25 to-[var(--primary-color)]/20 rounded-full blur-2xl"></div>
        
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-gradient-to-l from-[var(--primary-light)]/30 to-[var(--secondary-color)]/25 rounded-full blur-2xl"></div>
        
        <div className="absolute top-1/4 right-1/3 w-[100px] h-[100px] bg-gradient-to-r from-[var(--primary-color)]/35 to-[var(--primary-light)]/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-1/3 left-1/3 w-[80px] h-[80px] bg-gradient-to-l from-[var(--secondary-color)]/40 to-[var(--primary-color)]/35 rounded-full blur-xl"></div>
        
        <div className="absolute top-1/2 left-1/2 w-[60px] h-[60px] bg-gradient-to-r from-[var(--primary-light)]/50 to-[var(--primary-color)]/45 rounded-full blur-lg"></div>
        <div className="absolute top-1/3 right-1/2 w-[70px] h-[70px] bg-gradient-to-l from-[var(--secondary-color)]/40 to-[var(--primary-light)]/35 rounded-full blur-lg"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className={`transition-all duration-1000 ease-out transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                {t('about_cta_title')}
              </h2>
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                {t('about_cta_subtitle')}
              </p>
            </div>

            <div className={`transition-all duration-1000 ease-out delay-200 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}>
              <p className="text-lg text-white/80 mb-8 leading-relaxed">
                {t('about_cta_description')}
              </p>
            </div>

            <div className={`transition-all duration-1000 ease-out delay-400 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}>
              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
                {settings?.PlayStoreLink && (
                  <button
                    onClick={() => handleAppDownload(settings.PlayStoreLink)}
                    className="transform hover:scale-105 transition-all duration-300 bg-transparent border-none p-0 cursor-pointer"
                  >
                    <img
                      src={getDownloadIcon('google')}
                      alt="Get it on Google Play"
                      className="h-14 w-auto object-contain"
                    />
                  </button>
                )}
                {settings?.AppleStoreLink && (
                  <button
                    onClick={() => handleAppDownload(settings.AppleStoreLink)}
                    className="transform hover:scale-105 transition-all duration-300 bg-transparent border-none p-0 cursor-pointer"
                  >
                    <img
                      src={getDownloadIcon('apple')}
                      alt="Download on the App Store"
                      className="h-14 w-auto object-contain"
                    />
                  </button>
                )}
              </div>
            </div>

            <div className={`transition-all duration-1000 ease-out delay-600 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                <div className="text-center">
                  <div className="w-8 h-8 bg-white/20 rounded-full mx-auto flex items-center justify-center mb-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="text-white/70 text-xs">{t('about_cta_feature_1')}</p>
                </div>

                <div className="text-center">
                  <div className="w-8 h-8 bg-white/20 rounded-full mx-auto flex items-center justify-center mb-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-white/70 text-xs">{t('about_cta_feature_2')}</p>
                </div>

                <div className="text-center">
                  <div className="w-8 h-8 bg-white/20 rounded-full mx-auto flex items-center justify-center mb-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-white/70 text-xs">{t('about_cta_feature_3')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`transition-all duration-1000 ease-out delay-300 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
          }`}>
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                <img
                  src={require("../../../assets/img/app1.png")}
                  alt="Waygo App iPhone"
                  className="w-48 sm:w-56 lg:w-64 h-auto drop-shadow-2xl transform rotate-6 hover:rotate-0 transition-transform duration-500"
                />
                
                <img
                  src={require("../../../assets/img/app2.png")}
                  alt="Waygo App Android"
                  className="absolute -bottom-8 -right-8 w-40 sm:w-48 lg:w-56 h-auto drop-shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className={`transition-all duration-1000 ease-out delay-800 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}>
          <div className="mt-12 pt-6 border-t border-white/20 text-center">
            <p className="text-white/60 text-sm">
              {t('about_cta_footer')}
            </p>
          </div>
        </div>
      </div>

      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black/20 to-transparent"></div>
      
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/20 to-transparent"></div>
    </section>
  );
};

export default CTASection; 