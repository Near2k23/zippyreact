import React, { useState, useEffect } from 'react';
import TestimonialCard from '../TestimonialCard.jsx';
import Title from '../Title.jsx';
import Description from '../Description.jsx';
import { useTranslation } from 'react-i18next';

const TestimonialsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('testimonials-section');
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

  const testimonials = [
    {
      id: 1,
      name: "Ana M.",
      role: t('about_testimonials_role_1'),
      avatar: require("../../../assets/img/profilePic.png"),
      quote: t('about_testimonials_quote_1'),
      rating: 5,
      category: "usuario"
    },
    {
      id: 2,
      name: "Carlos G.",
      role: t('about_testimonials_role_2'),
      avatar: require("../../../assets/img/profilePic.png"),
      quote: t('about_testimonials_quote_2'),
      rating: 5,
      category: "conductor"
    },
    {
      id: 3,
      name: "María L.",
      role: t('about_testimonials_role_3'),
      avatar: require("../../../assets/img/profilePic.png"),
      quote: t('about_testimonials_quote_3'),
      rating: 5,
      category: "usuario"
    },
    {
      id: 4,
      name: "Roberto S.",
      role: t('about_testimonials_role_4'),
      avatar: require("../../../assets/img/profilePic.png"),
      quote: t('about_testimonials_quote_4'),
      rating: 5,
      category: "conductor"
    },
    {
      id: 5,
      name: "Laura P.",
      role: t('about_testimonials_role_5'),
      avatar: require("../../../assets/img/profilePic.png"),
      quote: t('about_testimonials_quote_5'),
      rating: 5,
      category: "usuario"
    },
    {
      id: 6,
      name: "Miguel A.",
      role: t('about_testimonials_role_6'),
      avatar: require("../../../assets/img/profilePic.png"),
      quote: t('about_testimonials_quote_6'),
      rating: 5,
      category: "conductor"
    }
  ];

  const userTestimonials = testimonials.filter(t => t.category === "usuario");
  const driverTestimonials = testimonials.filter(t => t.category === "conductor");

  return (
    <section id="testimonials-section" className="relative py-20 bg-gradient-to-br from-white via-gray-50 to-blue-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-40 h-40 bg-[var(--primary-color)]/10 rounded-full opacity-30"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-[var(--primary-light)]/15 rounded-full opacity-25"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-[var(--secondary-color)]/10 rounded-full opacity-20"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Title variant="section" isVisible={isVisible}>
            {t('about_testimonials_title')}
          </Title>
          <Description variant="section" isVisible={isVisible}>
            {t('about_testimonials_description')}
          </Description>
        </div>

        <div className={`transition-all duration-1000 ease-out delay-200 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}>
          <div className="mb-16">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-light)] rounded-full mx-auto flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t('about_testimonials_user_title')}
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {t('about_testimonials_user_description')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {userTestimonials.map((testimonial, index) => (
                <TestimonialCard
                  key={testimonial.id}
                  name={testimonial.name}
                  role={testimonial.role}
                  avatar={testimonial.avatar}
                  quote={testimonial.quote}
                  rating={testimonial.rating}
                  category={testimonial.category}
                  index={index}
                  isVisible={isVisible}
                />
              ))}
            </div>
          </div>
        </div>

        <div className={`transition-all duration-1000 ease-out delay-400 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}>
          <div className="mb-16">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-gradient-to-r from-[var(--secondary-color)] to-[var(--secondary-light)] rounded-full mx-auto flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t('about_testimonials_driver_title')}
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {t('about_testimonials_driver_description')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {driverTestimonials.map((testimonial, index) => (
                <TestimonialCard
                  key={testimonial.id}
                  name={testimonial.name}
                  role={testimonial.role}
                  avatar={testimonial.avatar}
                  quote={testimonial.quote}
                  rating={testimonial.rating}
                  category={testimonial.category}
                  index={index}
                  isVisible={isVisible}
                />
              ))}
            </div>
          </div>
        </div>

        <div className={`transition-all duration-1000 ease-out delay-600 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection; 