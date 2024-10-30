import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect, useState } from 'react';

const NoAccessPage = () => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  

  useEffect(() => {
    // Update the countdown every second
    const timer = setInterval(() => {
      setCountdown(prevCountdown => {
        if (prevCountdown <= 1) {
          clearInterval(timer);
          router.back();
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);

    // Clear the interval if the component is unmounted
    return () => clearInterval(timer);
  }, [router]);

  return (
    <>
      <Head>
        <title>権利無し｜No Access｜歌詞の神</title>
      </Head>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
        <div className="text-center p-8 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg shadow-lg">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">
            Access Denied
          </h1>
          <p className="mt-6 text-lg">
            You do not have permission to view this page.
          </p>
          <p className="mt-4 text-lg">
            You will be redirected to the previous page in {countdown} seconds.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-6 inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-transform"
          >
            Go Back
          </button>
        </div>
      </div>
    </>
  );
};

export default NoAccessPage;
