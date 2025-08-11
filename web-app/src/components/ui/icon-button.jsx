import React from 'react';

const IconButton = ({ children, variant = 'ghost', size = 'sm', className = '', ...props }) => {
  const sizes = {
    sm: 'h-8 w-8 p-0',
    md: 'h-10 w-10 p-1',
    lg: 'h-12 w-12 p-2',
  };
  const variants = {
    ghost: 'bg-transparent hover:bg-gray-100',
    outline: 'border border-gray-300 hover:bg-gray-100',
  };
  return (
    <button
      className={`inline-flex items-center justify-center rounded ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      <span className="sr-only">icon button</span>
      {children}
    </button>
  );
};

export default IconButton;


