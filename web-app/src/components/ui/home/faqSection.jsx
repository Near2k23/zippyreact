import React from 'react';
import TabSwitch from '../tabSwitch.jsx';
import Title from '../Title.jsx';
import Description from '../Description.jsx';
import { Help, ExpandMore } from '@mui/icons-material'; 
import { useTranslation } from 'react-i18next';

export default function FAQSection() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState('general');
  const [openIndex, setOpenIndex] = React.useState(-1);

  const tabs = [
    { id: 'passengers', label: t("faq_tab_passengers") },
    { id: 'drivers', label: t("faq_tab_drivers") }
  ];

  const passengerFaqs = [ 
    {
      question: t("faq_question_1"),
      answer: t("faq_answer_1")
    },
    {
      question: t("faq_question_2"),
      answer: t("faq_answer_2")
    },
    {
      question: t("faq_question_3"),
      answer: t("faq_answer_3")
    },
    {
      question: t("faq_question_4"),
      answer: t("faq_answer_4")
    }
  ];

  const driverFaqs = [
    {
      question: t("faq_question_5"),
      answer: t("faq_answer_5")
    },
    {
      question: t("faq_question_6"),
      answer: t("faq_answer_6")
    },
    {
      question: t("faq_question_7"),
      answer: t("faq_answer_7")
    },
    { 
      question: t("faq_question_8"),
      answer: t("faq_answer_8")
    }
  ];

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setOpenIndex(-1);
  };

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  const currentFaqs = activeTab === 'passengers' ? passengerFaqs : driverFaqs;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          <div className="space-y-8">
            <div className="flex items-center gap-4 text-[var(--faq-accent)] font-medium">
              <Help sx={{ fontSize: 24 }} />
              <span className="text-base uppercase tracking-wide">{t("faq_tag_title")}</span>
            </div>
            
            <Title 
              variant="xl" 
              className="text-[var(--faq-text)]"
            >
              {t("faq_title")} <span className="text-[var(--faq-accent)]">{t("faq_title_2")}</span>
            </Title>
            
            <Description variant="large" className="text-[var(--faq-text-secondary)]">
              {t("faq_description")}
            </Description>
          </div>

          <div className="space-y-6">
            <TabSwitch 
              activeTab={activeTab}
              onTabChange={handleTabChange}
              tabs={tabs}
            />
            
            <div className="space-y-4">
              {currentFaqs.map((faq, index) => (
                <div 
                  key={index}
                  className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between transition-colors duration-200 hover:bg-gray-50"
                    style={{color: 'var(--faq-text)'}}
                  >
                    <span className="font-semibold text-lg pr-4">
                      {faq.question}
                    </span>
                    <ExpandMore 
                      sx={{ 
                        fontSize: 20, 
                        color: 'var(--faq-accent)',
                        transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                      }} 
                    />
                  </button>
                  
                  <div className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="px-6 pb-5 leading-relaxed text-gray-600">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
