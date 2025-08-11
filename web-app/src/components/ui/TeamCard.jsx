import React from 'react';

const TeamCard = ({ 
  name, 
  position, 
  photo, 
  quote, 
  linkedin, 
  twitter, 
  index, 
  isVisible 
}) => {
  return (
    <div
      className={`transition-all duration-1000 ease-out delay-${(index + 1) * 200} transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      }`}
    >
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 h-full group">
        <div className="relative mb-6">
          <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-[var(--primary-color)]/20 group-hover:border-[var(--primary-color)]/40 transition-all duration-300">
            <img
              src={photo}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-light)] rounded-full opacity-80"></div>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {name}
          </h3>
          <p className="text-[var(--primary-color)] font-semibold mb-4">
            {position}
          </p>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            "{quote}"
          </p>

          <div className="flex justify-center space-x-3">
            <a
              href={linkedin}
              className="w-8 h-8 bg-[var(--primary-color)]/10 rounded-full flex items-center justify-center hover:bg-[var(--primary-color)] hover:text-white transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a
              href={twitter}
              className="w-8 h-8 bg-[var(--primary-color)]/10 rounded-full flex items-center justify-center hover:bg-[var(--primary-color)] hover:text-white transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCard; 