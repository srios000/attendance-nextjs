"use client";

import React from 'react';
import Link from 'next/link';


const NotFound = () => {
  return (
    <>
      {/* <Navbar /> */}
      <div className="dark:bg-gray-900 flex items-center justify-center h-screen bg-gray-100 select-none">
        <div className="text-center">
          <h1 className="text-9xl font-extrabold text-gray-800 dark:text-gray-200">404</h1>
          <p className="text-2xl md:text-3xl font-light mt-6 mb-8 dark:text-slate-200 text-slate-800">
            Oops! The page you&lsquo;re looking for isn&lsquo;t here.
          </p>
          <Link href="/" passHref>
            <span className="inline-block px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:text-lg">
              Go back home
            </span>
          </Link>
          <div className="mt-8">
            <p className="text-sm text-gray-500">
              If you think this is a mistake, <Link href="/as-webpage/support"><span className="text-indigo-600 hover:underline">contact us</span></Link>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
