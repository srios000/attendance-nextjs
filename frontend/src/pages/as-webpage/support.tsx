import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';

interface AccordionItemProps {
  title: string;
  children: ReactNode;
}

const AccordionItem = ({ title, children }: AccordionItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-300">
      <button
        className="w-full text-left flex dark:hover:bg-gray-700 items-center justify-between px-5 dark:text-slate-100 py-3 text-gray-700 font-medium text-lg hover:bg-gray-100 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        <span
          className={`transform transition-transform duration-200 ${
            isOpen ? 'rotate-90' : ''
          }`}
        >
          ▶︎
        </span>
      </button>
      {isOpen && (
        <div className="px-5 py-3 text-gray-600 dark:text-slate-100 text-base">
          {children}
        </div>
      )}
    </div>
  );
};

const Support: NextPage = () => {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  return (
    <div className={`container dark:bg-slate-900 h-[85vh] overflow-y-scroll mx-auto p-6 bg-white ${fadeIn ? 'animate-fadeIn' : ''}`}>
      <Head>
        <title>Support - Attendance App Integration</title>
        <meta name="description" content="Get help and support for Attendance App Integration" />
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

      <main className="text-justify select-none">
      <h1 className="text-3xl font-extrabold mb-6 text-slate-700 dark:text-slate-100 transition duration-300 ease-in-out hover:text-slate-800">Support</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 dark:text-slate-100 text-gray-700">Frequently Asked Questions (FAQs)</h2>
          <div>
            <AccordionItem title="Yes?">
              yes
            </AccordionItem>
            {/* Add more AccordionItems as needed */}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-slate-100">Contact Support</h2>
          <p className="text-base text-gray-600 dark:text-slate-100">
            For further assistance, please contact us <Link href="https://github.com/srios000/attendanceapp/issues" target='_blank' passHref><span className="hover:underline hover:text-violet-700">here</span></Link>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-slate-100">Feedback</h2>
          <p className="text-base text-gray-600 dark:text-slate-100">
            We value your feedback. Let us know how we can improve our app 
            <span className="mx-1">&mdash;</span>
            <Link href="https://github.com/srios000/attendanceapp/issues" target='_blank' passHref><span className="hover:underline hover:text-violet-700">here</span></Link>.
          </p>
        </section>

        <Link href="/" passHref>
          <span className="inline-block bg-gray-400 dark:text-slate-100 dark:bg-gray-700 dark:hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-500 transition duration-300">
            Go Back to Home
          </span>
        </Link>

        <section className="mt-32 mb-8">
          &nbsp;
        </section>

      </main>
    </div>
  );
};

export default Support;
