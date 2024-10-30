import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const TermsOfService: NextPage = () => {
  const [lastUpdated, setLastUpdated] = useState('');
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
    fetch('/api/contents/lastUpdated/terms')
      .then(response => response.json())
      .then(data => setLastUpdated(data.lastUpdated));
  }, []);

  return (
    <div className={`container dark:bg-slate-900 h-[85vh] overflow-y-scroll mx-auto p-6 bg-white ${fadeIn ? 'animate-fadeIn' : ''}`}>
      <Head>
        <title>Terms of Service - Attendance App</title>
        <meta name="description" content="Read the Terms of Service for Attendance App" />
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
        <h1 className="text-3xl font-extrabold mb-6 dark:text-slate-100 text-slate-700 transition duration-300 ease-in-out hover:text-slate-800">Terms of Service</h1>
        
        <p className="text-sm italic mb-4 dark:text-slate-100 text-slate-900">Last Updated: {lastUpdated || '[Loading...]'}</p>

        {/* <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Acceptance of Terms</h2>
          <p className="text-lg leading-relaxed">
            By accessing or using Attendance App, you agree to be bound by these terms of service.
          </p>
        </section> */}

        <section className="dark:text-slate-100 mb-12">
          <h2 className="dark:text-slate-100 text-2xl font-semibold mb-4 text-gray-700">Usage Guidelines</h2>
          <ul className="list-disc list-inside pl-4 text-slate-900 dark:text-slate-100">
            <li className="mb-2">Respect copyright and intellectual property rights when uploading, sharing, or using lyrics.</li>
            <li className="mb-2">Refrain from posting or sharing any content that is offensive, harmful, defamatory, or otherwise inappropriate. Any content that has potential to cause harm to others needs to have a trigger warning.</li>
            <li className="mb-2">Utilize the website and its features responsibly and without attempting to harm the service or other users.</li>
          </ul>
        </section>

        <section className="dark:text-slate-100 mb-12">
          <h2 className="text-2xl font-semibold dark:text-slate-100 mb-4 text-gray-700">Content Responsibility</h2>
          <ul className="list-disc list-inside pl-4 text-slate-900 dark:text-slate-100">
            <li className="mb-2">Users are responsible for the content they upload or share. Attendance App does not claim ownership of the content users provide but requires the right to use it for the operation of the service.</li>
            <li className="mb-2">Attendance App reserves the right to remove or edit content that violates these terms or applicable laws.</li>
          </ul>
        </section>

        <section className="dark:text-slate-100 mb-12">
          <h2 className="dark:text-slate-100 text-2xl font-semibold mb-4 text-gray-700">Limitation of Liability</h2>
          <p className="text-lg leading-relaxed text-slate-900 dark:text-slate-100">
            Attendance App shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or the inability to use the service, including but not limited to reliance on any information obtained from Attendance App.
          </p>
        </section>

        <section className="dark:text-slate-100 mb-12">
          <h2 className="dark:text-slate-100 text-2xl font-semibold mb-4 text-gray-700">Modification of Terms</h2>
          <p className="text-lg leading-relaxed text-slate-900 dark:text-slate-100">
            Attendance App reserves the right to modify these terms at any time. Continued use of the service after such changes will constitute acceptance of the new terms.
          </p>
        </section>

        <section className="dark:text-slate-100 mb-12 animate-fadeIn">
					<p className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">By using Attendance App, you acknowledge that you have read, understood, and agreed to be bound by these terms of service. Please review them periodically for changes.</p>
				</section>

        <Link href="/" passHref>
          <span className="inline-block bg-gray-400 dark:text-slate-100 dark:bg-gray-700 dark:hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-500 transition duration-300">
						Go Back to Home
					</span>
        </Link>
      </main>
      {/* <FwPlaceholder /> */}
    </div>
  );
};

export default TermsOfService;
