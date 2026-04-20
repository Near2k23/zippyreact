import React from 'react';

const Card = ({ title, description, icon, iconColor, index, isVisible }) => {
  const resolveCssVariable = (variable) => {
    if (typeof window !== 'undefined') {
      return getComputedStyle(document.documentElement).getPropertyValue(variable.replace('var(', '').replace(')', ''));
    }
    return '#F97316';
  };

  const resolvedColor = iconColor.startsWith('var(') ? resolveCssVariable(iconColor) : iconColor;

  return (
    <div
      className={`transition-all duration-1000 ease-out delay-${(index + 1) * 200} transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      }`}
    >
      <div 
        className="rounded-2xl p-8 shadow-lg border hover:shadow-xl transition-all duration-300 h-full"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          boxShadow: 'var(--card-shadow)'
        }}
      >
        <div className="text-center mb-6">
          <div 
            className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4"
            style={{
              background: `linear-gradient(to right, ${resolvedColor}, ${resolvedColor}dd)`
            }}
          >
            <div style={{ color: 'white' }}>
              {React.cloneElement(icon, { sx: { fontSize: 32, color: 'white' } })}
            </div>
          </div>
          <h3 
            className="text-xl font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div 
              className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
              style={{ backgroundColor: resolvedColor }}
            ></div>
            <p 
              className="text-sm leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card; 
