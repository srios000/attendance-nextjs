import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import '../app/globals.css';
import { useRouter, NextRouter } from 'next/router';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {ThemeProvider} from 'next-themes'
import { LicenseInfo } from '@mui/x-license';
import { SpeedInsights } from '@vercel/speed-insights/next';
// import SearchBar from '@/components/SearchBar';
// import CMSSidebar from './cms/components/CMSSidebar';
import CMSNavbar from './cms/components/Navbar';
import CMSFooter from './cms/components/Footer';
// import Script from 'next/script';

import MuiXLicense from './MuiXLicense';

// import Maintenance from '@/components/Maintenance';
import '../app/css/fontawesome-free-6.5.2-web/css/all.min.css';


function useLayoutType() {
  const router = useRouter();
  const isCMSLayout = router.pathname.startsWith('/cms');
  const isAsWebpageLayout = router.pathname.startsWith('/as-webpage');
  const isAuthLayout = router.pathname.startsWith('/auth');
  return { isCMSLayout, isAuthLayout, isAsWebpageLayout };
}

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  useEffect(() => {
    const licenseKey = process.env.NEXT_PUBLIC_MUI_X_LICENSE_KEY;
    if (licenseKey) {
      LicenseInfo.setLicenseKey(licenseKey);
    } else {
      console.warn('MUI X License key is not set.');
    }
  }, []);
  const router = useRouter();
  const { isCMSLayout, isAsWebpageLayout, isAuthLayout } = useLayoutType();
  const [loading, setLoading] = useState(true);
  // const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);

  useEffect(() => {
    const handleRouteChange = () => {
      setLoading(false);
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
  
    handleRouteChange();

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh] dark:bg-slate-900">
        <i className="fa-solid fa-spinner fa-spin-pulse text-6xl text-white"></i>
      </div>
    );
  }

  // const toggleSearchBarVisibility = () => {
  //   setIsSearchBarVisible(!isSearchBarVisible);
  // };

  return (
    <>
      <Head>
        <title>Smart Class - Attendance System Integration</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID}`}
        strategy="lazyOnload"
        crossOrigin="anonymous"
      ></Script> */}
      <SessionProvider session={session}>
          <ThemeProvider attribute="class">
            <AppContent
              isCMSLayout={isCMSLayout}
              isAsWebpageLayout={isAsWebpageLayout}
              isAuthLayout={isAuthLayout}
              router={router}
              Component={Component}
              pageProps={pageProps}
            />
          </ThemeProvider>
      </SessionProvider>
      <MuiXLicense />
      <SpeedInsights />
    </>
  );
}

interface AppContentProps {
  isCMSLayout: boolean;
  isAsWebpageLayout: boolean;
  isAuthLayout: boolean;
  router: NextRouter;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: React.ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pageProps: any;
}

const AppContent: React.FC<AppContentProps> = ({ isCMSLayout, isAsWebpageLayout, router, Component, pageProps }) => {
  return (
    <div className="dark:bg-slate-900 bg-gray-50 h-screen">
      {!isCMSLayout && <Navbar />}
      {isCMSLayout && <><Navbar /><CMSNavbar /></>}
      <main className="flex flex-row">
        {isAsWebpageLayout && <div className=""></div>}

        {/* {isCMSLayout && <CMSSidebar />} */}
        <AnimatePresence onExitComplete={() => console.log('')} mode='wait' initial>
          <motion.div
            key={router.asPath}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`flex-grow ${!isCMSLayout ? '' : 'w-full'}`}
          >
            <Component {...pageProps} key={router.asPath} />
          </motion.div>
        </AnimatePresence>
      </main>
      {!isCMSLayout && <Footer />}
      {isCMSLayout && <CMSFooter />}
    </div>
  );
};

export default MyApp;
