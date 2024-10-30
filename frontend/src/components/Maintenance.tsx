import React from 'react';

const Maintenance: React.FC = () => {
  return (
    <div className="max-w-full h-full dark:bg-gray-900 overflow-y-scroll">
      <div className="max-w-6xl flex-grow container px-4 py-12 mx-auto p-5">
        <div className="text-center p-4 dark:text-white">
          <i className='fa-solid fa-screwdriver-wrench fa-bounce text-5xl m-10'></i>
          <h1 className="text-2xl font-bold mb-4">Maintenance Mode</h1>
          <p className="text-lg">Our site is currently undergoing maintenance. Please check back later.</p>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;