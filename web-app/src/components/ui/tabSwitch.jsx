import React from 'react';

const TabSwitch = ({ activeTab, onTabChange, tabs }) => {
  return (
    <div className="flex justify-center mb-12">
      <div className="rounded-full p-1 inline-flex relative" style={{backgroundColor: 'var(--tab-bg)'}}>
        <div 
          className={`absolute top-1 bottom-1 rounded-full shadow-md transition-all duration-500 ease-out ${
            activeTab === tabs[0].id 
              ? 'left-1 w-[calc(50%-0.25rem)]' 
              : 'left-[calc(50%+0.25rem)] w-[calc(50%-0.25rem)]'
          }`}
          style={{backgroundColor: 'var(--tab-active-bg)'}}
        />
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative px-8 py-3 rounded-full font-semibold transition-all duration-300 z-10 ${
              activeTab === tab.id
                ? 'text-[var(--tab-text-active)]'
                : 'text-[var(--tab-text)] hover:text-[var(--primary-light)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabSwitch; 