import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Title from '../Title.jsx';
import Description from '../Description.jsx';
import { ArrowForward, Person, AccountBalanceWallet } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';   

const DriverRecruitmentSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleDownloadNow = () => {
    navigate('/');
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  };

  return (
    <section className="relative py-20 overflow-hidden" style={{background: 'var(--gradient-secondary)'}}>
      <div className="absolute inset-0" style={{backgroundColor: 'rgba(0, 0, 0, 0.2)'}}></div>
      
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full" style={{background: 'linear-gradient(to right, rgba(99, 102, 241, 0.1), rgba(147, 51, 234, 0.1))'}}></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl" style={{backgroundColor: 'var(--secondary-light)', opacity: 0.2}}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl" style={{backgroundColor: 'var(--secondary-color)', opacity: 0.2}}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className={`text-center lg:text-left transition-all duration-1000 ease-out transform ${
            isVisible ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'
          }`}>
            <Title 
              variant="large" 
              isVisible={isVisible} 
              style={{color: 'var(--text-light)'}}
            >
              {t("driver_recruitment_title")}
            </Title>
            
            <Description 
              variant="light" 
              style={{color: 'var(--text-light)', opacity: 0.9}}  
            >
              {t("driver_recruitment_description")}
            </Description>
            
            <button
              onClick={handleDownloadNow}
              className="inline-flex items-center px-8 py-4 font-semibold text-lg rounded-full transition-all duration-300 ease-out transform hover:-translate-y-1 hover:shadow-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                color: '#1F2937',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 1)';
                e.target.style.transform = 'translateY(-4px)';
                e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <ArrowForward sx={{ fontSize: 20, marginRight: 1 }} />
              {t("driver_recruitment_button")}
            </button>
          </div>
          
          <div className={`hidden lg:flex items-center justify-center transition-all duration-1000 ease-out delay-300 transform ${
            isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-12 opacity-0 scale-95'
          }`}>
            <div className="relative">
              <div className="relative transform rotate-3 hover:rotate-0 transition-all duration-500 ease-out hover:scale-105">
                <div className="absolute inset-0 rounded-3xl blur-xl scale-110" style={{background: 'var(--gradient-secondary)', opacity: 0.3}}></div>
                <div className="relative w-80 h-80 rounded-3xl flex items-center justify-center shadow-2xl" style={{background: 'var(--gradient-secondary)'}}>
                  <div className="text-center" style={{color: 'var(--text-light)'}}>
                    <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{backgroundColor: 'rgba(255, 255, 255, 0.2)'}}>
                      <Person sx={{ fontSize: 48, color: 'var(--text-light)' }} />
                    </div>
                    <Title variant="small" style={{color: 'var(--text-light)'}}>
                      {t("driver_recruitment_title_2")}
                    </Title>
                    <Description variant="small" style={{color: 'var(--text-light)', opacity: 0.9}}>
                      {t("driver_recruitment_description_2")}
                    </Description>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-8 -right-8 transform -rotate-6 hover:rotate-0 transition-all duration-500 ease-out delay-200 hover:scale-105">
                <div className="absolute inset-0 rounded-2xl blur-xl scale-110" style={{background: 'var(--gradient-accent)', opacity: 0.3}}></div>
                <div className="relative w-32 h-32 rounded-2xl flex items-center justify-center shadow-xl" style={{background: 'var(--gradient-accent)'}}>
                  <AccountBalanceWallet sx={{ fontSize: 32, color: 'var(--text-light)' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-32" style={{background: 'linear-gradient(to top, var(--secondary-dark), transparent)'}}></div>
    </section>
  );
};

export default DriverRecruitmentSection; 