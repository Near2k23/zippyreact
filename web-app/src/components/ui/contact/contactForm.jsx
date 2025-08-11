import React, { useState } from 'react';
import { 
  ArrowForward as ArrowRightIcon, 
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });
  const { t } = useTranslation();

  const [focusedField, setFocusedField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      setFormData({ name: '', lastName: '', email: '', phone: '', message: '' });
    }, 3000);
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/30 hover:shadow-3xl hover:scale-105 transition-all duration-300">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative z-10">
          <h3 className="text-2xl font-bold text-white text-center">
            {t('contact_form_title')}
          </h3>
          <p className="text-blue-100 text-center mt-2">
            {t('contact_form_subtitle')}
          </p>
        </div>
      </div>

      <div className="p-8 lg:p-12">
        {showSuccess ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-500 mb-6 animate-bounce">
              <CheckCircleIcon className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t('contact_form_success_title')}
            </h3>
            <p className="text-gray-600">
              {t('contact_form_success_subtitle')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-3 group-hover:text-blue-500 transition-colors duration-300">
                  {t('contact_form_name_label')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus('name')}
                    onBlur={handleBlur}
                    placeholder="Jane"
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 placeholder-gray-400 bg-white/80 backdrop-blur-sm hover:bg-white group-hover:shadow-lg focus:shadow-xl"
                    required
                  />
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/10 to-blue-500/10 opacity-0 transition-opacity duration-300 pointer-events-none ${
                    focusedField === 'name' ? 'opacity-100' : 'group-hover:opacity-100'
                  }`}></div>
                  {focusedField === 'name' && (
                    <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse"></div>
                  )}
                </div>
              </div>
              
              <div className="group">
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-900 mb-3 group-hover:text-blue-500 transition-colors duration-300">
                  {t('contact_form_last_name_label')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus('lastName')}
                    onBlur={handleBlur}
                    placeholder="García López"
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 placeholder-gray-400 bg-white/80 backdrop-blur-sm hover:bg-white group-hover:shadow-lg focus:shadow-xl"
                    required
                  />
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/10 to-blue-500/10 opacity-0 transition-opacity duration-300 pointer-events-none ${
                    focusedField === 'lastName' ? 'opacity-100' : 'group-hover:opacity-100'
                  }`}></div>
                  {focusedField === 'lastName' && (
                    <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-3 group-hover:text-blue-500 transition-colors duration-300">
                  {t('contact_form_email_label')}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus('email')}
                    onBlur={handleBlur}
                    placeholder="email@example.com"
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 placeholder-gray-400 bg-white/80 backdrop-blur-sm hover:bg-white group-hover:shadow-lg focus:shadow-xl"
                    required
                  />
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/10 to-blue-500/10 opacity-0 transition-opacity duration-300 pointer-events-none ${
                    focusedField === 'email' ? 'opacity-100' : 'group-hover:opacity-100'
                  }`}></div>
                  {focusedField === 'email' && (
                    <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse"></div>
                  )}
                </div>
              </div>
              
              <div className="group">
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-3 group-hover:text-blue-500 transition-colors duration-300">
                  {t('contact_form_phone_label')}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus('phone')}
                    onBlur={handleBlur}
                    placeholder="+123-456-7890"
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 placeholder-gray-400 bg-white/80 backdrop-blur-sm hover:bg-white group-hover:shadow-lg focus:shadow-xl"
                  />
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/10 to-blue-500/10 opacity-0 transition-opacity duration-300 pointer-events-none ${
                    focusedField === 'phone' ? 'opacity-100' : 'group-hover:opacity-100'
                  }`}></div>
                  {focusedField === 'phone' && (
                    <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="group">
              <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-3 group-hover:text-blue-500 transition-colors duration-300">
                {t('contact_form_message_label')}
              </label>
              <div className="relative">
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus('message')}
                  onBlur={handleBlur}
                  rows={5}
                  placeholder={t('contact_form_message_placeholder')}
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 placeholder-gray-400 bg-white/80 backdrop-blur-sm hover:bg-white group-hover:shadow-lg focus:shadow-xl resize-none"
                  required
                />
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/10 to-blue-500/10 opacity-0 transition-opacity duration-300 pointer-events-none ${
                  focusedField === 'message' ? 'opacity-100' : 'group-hover:opacity-100'
                }`}></div>
                {focusedField === 'message' && (
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse"></div>
                )}
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-8 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-500 flex items-center justify-center space-x-3 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <div className="flex items-center space-x-3">
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <div className="bg-white/20 rounded-full p-2 group-hover:bg-white/30 transition-all duration-300 group-hover:rotate-12">
                    <ArrowRightIcon className="h-5 w-5 text-white group-hover:transform group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                )}
                <span className="text-lg">
                  {isSubmitting ? t('contact_form_button_text_loading') : t('contact_form_button_text')}
                </span>
              </div>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactForm;
