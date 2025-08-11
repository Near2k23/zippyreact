import React from 'react';

const Title = ({ 
  children, 
  variant = "default", 
  isVisible = true, 
  className = "",
  style = {}
}) => {
  const baseClasses = "font-bold mb-6";
  
  const variants = {
    hero: "text-4xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight",
    
    section: "text-3xl md:text-4xl lg:text-5xl",
    
    card: "text-xl font-bold mb-4",
    
    default: "text-3xl md:text-4xl lg:text-5xl font-bold",
    
    dark: "text-4xl md:text-5xl lg:text-6xl font-bold leading-tight",
    
    small: "text-2xl font-bold mb-2",
    
    xl: "text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight",
    
    large: "text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
  };

  const animationClasses = isVisible 
    ? "transition-all duration-1000 ease-out transform translate-y-0 opacity-100" 
    : "transition-all duration-1000 ease-out transform translate-y-8 opacity-0";

  const classes = `${variants[variant] || variants.default} ${baseClasses} ${animationClasses} ${className}`;

  return (
    <h2 
      className={classes} 
      style={{
        color: 'var(--text-primary)',
        ...style
      }}
    >
      {children}
    </h2>
  );
};

export default Title; 