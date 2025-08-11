import React from 'react';

const TestimonialCard = ({ 
  name, 
  role, 
  avatar, 
  quote, 
  rating, 
  category, 
  index, 
  isVisible 
}) => {
  return (
    <div
      className={`transition-all duration-1000 ease-out delay-${(index + 1) * 200} transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      }`}
    >
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 h-full">
        <div className="flex justify-center mb-4">
          {[...Array(rating)].map((_, i) => (
            <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 italic">
          "{quote}"
        </blockquote>

        <div className="flex items-center justify-center">
          <img
            src={avatar}
            alt={name}
            className="w-12 h-12 rounded-full mr-4"
          />
          <div className="text-center">
            <div className="font-semibold text-gray-900">{name}</div>
            <div className={`text-sm ${category === 'usuario' ? 'text-[var(--primary-color)]' : 'text-[var(--secondary-color)]'}`}>
              {role}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard; 