import React from 'react';
import Link from 'next/link';
import { NextPageContext } from 'next';

interface ErrorProps {
  statusCode?: number;
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div className="flex items-center justify-center h-screen select-none bg-gray-100">
      <div className="text-center">
        {statusCode
          ? <h1 className="text-6xl font-bold text-gray-800">Error {statusCode}</h1>
          : <h1 className="text-6xl font-bold text-gray-800">Client-side Error</h1>}
        <p className="mt-4 text-xl text-gray-600">Sorry, something went wrong.</p>
        <Link href="/" passHref>
          <span className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white font-medium text-sm leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out">Go Home</span>
        </Link>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
