import Link from "next/link";
import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col h-[85vh] bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <main className="flex-grow container mx-auto px-4 py-10">
        <section className="text-center mb-10">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Attendance App for Smart Classes
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            Seamlessly manage your attendance and class operations with smart integration.
          </p>
          <div className="flex justify-center space-x-4 mb-10">
            <Link href="/contents/Registration/main">
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-indigo-500 transition duration-200">Register</button>
            </Link>
            <Link href="/contents/Mark/main">
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-500 transition duration-200">Mark Attendance</button>
            </Link>
          </div>

          <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Features
          </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800 hover:shadow-xl transition duration-200">
                <h3 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mb-4">Real-Time Attendance</h3>
                <p className="text-gray-700 dark:text-gray-300">Track attendance in real-time with face recognition.</p>
              </div>
              <div className="p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800 hover:shadow-xl transition duration-200">
                <h3 className="text-2xl font-bold text-green-600 dark:text-green-300 mb-4">Smart Reporting</h3>
                <p className="text-gray-700 dark:text-gray-300">Get instant reports and insights about student attendance and performance.</p>
              </div>
            </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
