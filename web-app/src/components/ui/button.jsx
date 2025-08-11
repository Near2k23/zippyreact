import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'hover:translate-y-[-1px] hover:shadow-lg focus:ring-blue-500',
    secondary: 'hover:translate-y-[-1px] hover:shadow-lg focus:ring-gray-500',
    outline: 'hover:translate-y-[-1px] hover:shadow-lg focus:ring-gray-500',
    ghost: 'hover:translate-y-[-1px] hover:shadow-lg focus:ring-gray-500'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const getButtonStyles = (variant) => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--button-primary-bg)',
          color: 'var(--button-primary-text)',
          boxShadow: '0 3px 12px var(--shadow-medium)'
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--button-secondary-bg)',
          color: 'var(--button-secondary-text)',
          border: '1px solid var(--button-secondary-border)'
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-medium)'
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-primary)'
        };
      default:
        return {
          backgroundColor: 'var(--button-primary-bg)',
          color: 'var(--button-primary-text)'
        };
    }
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button 
      className={classes} 
      style={getButtonStyles(variant)}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 