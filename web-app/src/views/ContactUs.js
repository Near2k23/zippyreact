import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { 
  AutoAwesome as SparklesIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import Navbar from "components/ui/navbar.jsx";
import Footer from "components/ui/footer.jsx";
import ContactForm from "components/ui/contact/contactForm.jsx";
import Card from "components/ui/card.jsx";
import { useTranslation } from 'react-i18next';

export default function ContactUs() {
    const [isVisible, setIsVisible] = useState(false);
    const settings = useSelector(state => state.settingsdata.settings);
    const { t } = useTranslation();

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 300);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div>
            <Navbar 
              logoSrc={require("../assets/img/logo.png")}
              logoSrcDark={require("../assets/img/logo.png")}
              darkText={true} 
            />
            
            <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-32 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 sm:w-60 sm:h-60 bg-blue-100 rounded-full opacity-20"></div>
                    <div className="absolute -bottom-10 -left-10 w-48 h-48 sm:w-72 sm:h-72 bg-indigo-100 rounded-full opacity-20"></div>
                    <div className="absolute top-1/2 left-1/4 w-16 h-16 sm:w-24 sm:h-24 bg-yellow-100 rounded-full opacity-30"></div>
                </div>

                <div className="relative z-10 max-w-6xl mx-auto">
                    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 transition-all duration-1000 ease-out transform ${
                        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`}>
                        
                        <div className="flex flex-col justify-center mt-8 lg:mt-12">
                            <div className={`space-y-8 transition-all duration-1000 ease-out delay-200 transform ${
                                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'
                            }`}>
                            
                                <div className="inline-block group">
                                    <div className="relative">
                                        <p className="text-sm font-semibold text-blue-500 uppercase tracking-wider bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full border border-blue-200 shadow-sm group-hover:shadow-md transition-all duration-300">
                                            <SparklesIcon className="inline w-4 h-4 mr-2 animate-pulse" />
                                            {t('contact_us_title')}
                                        </p>
                                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
                                    </div>
                                </div>
                                
                                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-32">
                                    <span style={{color: '#000000'}}>{t('contact_us_title_1')}</span>
                                    <br />
                                    <span style={{color: '#3377FF'}}>{t('contact_us_title_2')}</span>
                                </h2>
                                
                                <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed hover:text-gray-800 transition-colors duration-300 mb-8">
                                    {t('contact_us_description')}
                                </p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                                    <Card
                                        title={t('contact_us_card_title_1')}
                                        description={settings?.CompanyPhone}
                                        icon={<PhoneIcon />}
                                        iconColor="#3B82F6"
                                        index={0}
                                        isVisible={isVisible}
                                    />
                                    
                                    <Card
                                        title={t('contact_us_card_title_2')}
                                        description={settings?.contact_email}
                                        icon={<EmailIcon />}
                                        iconColor="#10B981"
                                        index={1}
                                        isVisible={isVisible}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className={`transition-all duration-1000 ease-out delay-300 transform ${
                            isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-12 opacity-0 scale-95'
                        }`}>
                            <ContactForm />
                        </div>
                    </div>
                </div>
                
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
            </div>
            
            <Footer />
        </div>
    );
}