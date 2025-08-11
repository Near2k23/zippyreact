import React, { useState, useEffect } from 'react';
import TabSwitch from '../tabSwitch.jsx';
import Card from '../card.jsx';
import Title from '../Title.jsx';
import { useTranslation } from "react-i18next";
import { 
  LocationOn, 
  Star, 
  AccountBalanceWallet, 
  DirectionsCar, 
  Security, 
  Payment, 
  Support, 
  Speed,
  LocalTaxi,
  Person,
  Schedule,
  CheckCircle
} from '@mui/icons-material';

const FeaturesSection = () => {
  const [activeTab, setActiveTab] = useState('passengers');
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation();
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const passengerFeatures = [
    {
      icon: <LocationOn sx={{ fontSize: 48 }} />,
      title: t("features_title_home_1"),  
      description: t("features_description_home_1"),
      iconColor: "var(--primary-dark)"
    },
    {
      icon: <Star sx={{ fontSize: 48 }} />, 
      title: t("features_title_home_2"),
      description: t("features_description_home_2"),
      iconColor: "var(--secondary-dark)"
    },
    {
      icon: <AccountBalanceWallet sx={{ fontSize: 48 }} />,
      title: t("features_title_home_3"),
      description: t("features_description_home_3"),
      iconColor: "var(--accent-dark)"
    },
    {
      icon: <DirectionsCar sx={{ fontSize: 48 }} />,
      title: t("features_title_home_4"),
      description: t("features_description_home_4"),
      iconColor: "var(--primary-light)"
    },
    {
      icon: <Security sx={{ fontSize: 48 }} />,
      title: t("features_title_home_5"),
      description: t("features_description_home_5"),
      iconColor: "var(--secondary-light)"
    },
    {
      icon: <Support sx={{ fontSize: 48 }} />,
      title: t("features_title_home_6"),
      description: t("features_description_home_6"),
      iconColor: "var(--accent-light)"
    }
  ];

  const driverFeatures = [
    {
      icon: <Speed sx={{ fontSize: 48 }} />,        
      title: t("features_title_home_7"),
      description: t("features_description_home_7"),
      iconColor: "var(--primary-dark)"
    },
    {
      icon: <LocalTaxi sx={{ fontSize: 48 }} />,  
      title: t("features_title_home_8"),
      description: t("features_description_home_8"),
      iconColor: "var(--secondary-dark)"
    },
    {
      icon: <Person sx={{ fontSize: 48 }} />, 
      title: t("features_title_home_9"),
      description: t("features_description_home_9"),
      iconColor: "var(--accent-dark)"
    },
    {
      icon: <Schedule sx={{ fontSize: 48 }} />, 
      title: t("features_title_home_10"),
      description: t("features_description_home_10"), 
      iconColor: "var(--primary-light)"
    },
    {
      icon: <CheckCircle sx={{ fontSize: 48 }} />,
      title: t("features_title_home_11"),
      description: t("features_description_home_11"),
      iconColor: "var(--secondary-light)"
    },
    {
      icon: <Payment sx={{ fontSize: 48 }} />,  
      title: t("features_title_home_12"),
      description: t("features_description_home_12"),
      iconColor: "var(--accent-light)"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Title variant="section" isVisible={isVisible}>
            {t("features_title_home")}
          </Title>
        </div>

        <TabSwitch 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          tabs={[
            { id: 'passengers', label: t("features_title_home_tabswitch_1") },
            { id: 'drivers', label: t("features_title_home_tabswitch_2") }
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mt-12">
          {(activeTab === 'passengers' ? passengerFeatures : driverFeatures).map((feature, index) => (
            <Card
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              iconColor={feature.iconColor}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection; 