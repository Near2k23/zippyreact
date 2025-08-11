import React from 'react';

const Description = ({ 
  children, 
  variant = "default", 
  isVisible = true, 
  className = "",
  style = {}
}) => {
  const baseClasses = "leading-relaxed";
  
  const variants = {

    hero: "text-base sm:text-lg md:text-xl",

    section: "text-lg sm:text-xl",

    card: "leading-relaxed",

    default: "text-base leading-relaxed",

    large: "text-xl sm:text-2xl leading-relaxed",
    
    small: "text-sm leading-relaxed",
    
    light: "text-xl mb-8 leading-relaxed"
  };

  const animationClasses = isVisible 
    ? "transition-all duration-1000 ease-out transform translate-y-0 opacity-100" 
    : "transition-all duration-1000 ease-out transform translate-y-8 opacity-0";

  const classes = `${variants[variant] || variants.default} ${baseClasses} ${animationClasses} ${className}`;

  return (
    <p 
      className={classes} 
      style={{
        color: 'var(--text-secondary)',
        ...style
      }}
    >
      {children}
    </p>
  );
};

export default Description; 