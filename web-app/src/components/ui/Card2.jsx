import React from 'react';

const Card2 = ({ number, icon, title, description, index, isVisible, iconColor = "from-blue-600 to-indigo-600" }) => {
  return (
    <div
      className={`text-center transition-all duration-700 ease-out transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
      style={{ transitionDelay: `${index * 300}ms` }}
    >
      <div className="relative mb-8">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${iconColor} shadow-lg mb-4`}>
          {icon}
        </div>
        <div 
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full border-2 flex items-center justify-center"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--primary-color)'
          }}
        >
          <span 
            className="text-sm font-bold"
            style={{ color: 'var(--primary-color)' }}
          >
            {number}
          </span>
        </div>
      </div>
      
      <h3 
        className="text-xl font-bold mb-4"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
      </h3>
      
      <p 
        className="leading-relaxed max-w-sm mx-auto"
        style={{ color: 'var(--text-secondary)' }}
      >
        {description}
      </p>
    </div>
  );
};

export default Card2; 