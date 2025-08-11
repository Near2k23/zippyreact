import React, { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import moment from 'moment/min/moment-with-locales';

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const languagedata = useSelector(state => state.languagedata);
  const [langSelection, setLangSelection] = useState();
  const [multiLanguage, setMultiLanguage] = useState();
  const [isActive, setIsActive] = useState(false);

  const handleLanguageSelect = (event) => {
    i18n.addResourceBundle(multiLanguage[event].langLocale, 'translations', multiLanguage[event].keyValuePairs);
    i18n.changeLanguage(multiLanguage[event].langLocale);
    setLangSelection(event);
    moment.locale(multiLanguage[event].dateLocale);
    setIsActive(false);
  };

  const toggleDropdown = () => {
    setIsActive(!isActive);
  };

  useEffect(() => {
    if (languagedata.langlist) {
      for (const key of Object.keys(languagedata.langlist)) {
        if (languagedata.langlist[key].langLocale === i18n.language) {
          setLangSelection(key);
        }
      }
      setMultiLanguage(languagedata.langlist);
    }
  }, [languagedata.langlist, i18n.language]);

  if (!multiLanguage || multiLanguage.length <= 1) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="text-[0.95rem] font-medium transition-all duration-300 relative py-2 text-[#374151] hover:text-[var(--primary-color)]"
      >
        <span className="flex items-center gap-1">
          {multiLanguage[langSelection]?.langName || 'English'}
          <ArrowDropDownIcon 
            className="text-sm transition-transform duration-300"
            style={{ 
              transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
              fontSize: '16px'
            }}
          />
        </span>
      </button>

      {isActive && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px]">
          {Object.keys(multiLanguage).map((key, index) => (
            <button
              key={key}
              onClick={() => handleLanguageSelect(index)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 hover:bg-gray-50 ${
                index === langSelection ? 'text-gray-900 font-semibold' : 'text-gray-600'
              }`}
            >
              {multiLanguage[key].langName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector; 