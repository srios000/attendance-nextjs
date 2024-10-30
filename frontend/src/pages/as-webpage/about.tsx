import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const About: NextPage = () => {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  return (
    <div className={`container dark:bg-slate-900 h-[85vh] overflow-y-scroll mx-auto p-6 bg-gray-50 ${fadeIn ? 'animate-fadeIn' : ''}`}>
      <Head>
        <title>About Attendance App Integration</title>
        <meta name="description" content="Learn more about Attendance App Integration" />
      </Head>

      <style jsx global>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        .container::-webkit-scrollbar {
          width: 0;
          height: 0;
        }
        .container {
          -ms-overflow-style: none;
          scrollbar-width: none;
          text-align: justify;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <main className="text-left select-none">
        <h1 className="text-3xl font-extrabold mb-6 text-slate-700 dark:text-slate-100 transition duration-300 ease-in-out hover:text-slate-800">About Attendance App Integration</h1>

        <section className="mb-12 animate-fadeIn delay-200ms">
          <h2 className="text-2xl font-semibold mb-4 text-green-500">Our Mission</h2>
          <p className="text-lg dark:text-slate-100">
            
          </p>
        </section>

        <section className="mb-12 animate-fadeIn dark:text-slate-100 delay-400ms">
          <h2 className="text-2xl font-semibold mb-4 text-blue-500">Features</h2>
          <ul className="list-disc list-inside dark:text-slate-100">
            <li className="mb-2"></li>
            <li className="mb-2"></li>
            <li className="mb-2"></li>
            <li className="mb-2"></li>
          </ul>
        </section>

        <section className="mb-12 dark:text-slate-100 animate-fadeIn delay-600ms">
          <h2 className="text-2xl font-semibold mb-4 text-red-500">The Team</h2>
          <p className="text-lg dark:text-slate-100">
            
          </p>
        </section>

        <Link href="/" passHref>
          <span className="inline-block bg-gray-400 dark:text-slate-100 dark:bg-gray-700 dark:hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-500 transition duration-300">
            Go Back to Home
          </span>
        </Link>
        <section className="mt-6 mb-8">
          &nbsp;
        </section>
      </main>
    </div>
  );
};

export default About;