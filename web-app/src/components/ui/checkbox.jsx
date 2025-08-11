import React from 'react';

// Checkbox simple estilo shadcn-like, compatible con Tailwind si está presente.
const Checkbox = React.forwardRef(({ className = '', checked, onCheckedChange, disabled = false, ...props }, ref) => {
  const handleChange = (e) => {
    onCheckedChange?.(e.target.checked);
  };
  return (
    <input
      type="checkbox"
      ref={ref}
      className={`h-4 w-4 rounded border border-gray-300 text-blue-600 focus:ring-blue-500 ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      checked={!!checked}
      onChange={handleChange}
      disabled={disabled}
      {...props}
    />
  );
});

export default Checkbox;


