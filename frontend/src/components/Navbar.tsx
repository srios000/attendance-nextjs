import Link from 'next/link';
import { useState } from 'react';
import useDarkMode from '@/hooks/useDarkMode';
import LogoutButton from '@/pages/auth/signout';
import { useSession } from 'next-auth/react';
import router from 'next/router';

type NavbarProps = {
  toggleTheme: () => void;
  theme?: string;
};

const Navbar = () => {
  // const { data: session, status } = useSession();
  // const isAuthenticated = status === 'authenticated';

  const { theme, toggleTheme } = useDarkMode();
  // console.log('Session:', session); 
  return (
    <>
      {/* Desktop Navbar - Shown on larger screens */}
      {/* <div className="hidden lg:block select-none"> */}
      <DesktopNavbar toggleTheme={toggleTheme} theme={theme} />
      {/* </div> */}

      {/* Mobile Navbar - Shown on smaller screens */}
      {/* <div className="block lg:hidden select-none">
        <MobileNavbar toggleTheme={toggleTheme} theme={theme} />
      </div> */}
    </>
  );
};

const DesktopNavbar: React.FC<NavbarProps> = ({ toggleTheme, theme }) => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated' && session && session.user;
  // console.log(session)
  const [isOpen, setIsOpen] = useState(false);

  const isCMSRoute = router.pathname.startsWith('/cms');

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <nav className="desktop-navbar select-none bg-gray-800 text-white shadow-lg hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Brand Name */}
            <div className="text-center bg-gray-700 py-2">
              <Link href="/" passHref>
                <span className="brand-name text-xl font-bold">
                  <i className="fa-solid fa-list-check mr-2"></i>Attendance System
                </span>
              </Link>
            </div>

            { !isCMSRoute ? (
              <div className="flex items-center space-x-4">
                <Link href="/" passHref>
                  <span className="nav-link hover:bg-gray-700 px-2 py-2 rounded-md text-sm font-medium">
                    <i className="fa-solid fa-house"></i>
                  </span>
                </Link>
                <Link href="/as-webpage/about" passHref>
                  <span className="nav-link hover:bg-gray-700 px-2 py-2 rounded-md text-sm font-medium">
                    <i className="fa-solid fa-info-circle"></i>
                  </span>
                </Link>
                {/* <Link href="/services" className="pointer-events-none text-slate-500" aria-disabled passHref>
                  <span className="nav-link hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                    <i className="fa-solid fa-concierge-bell"></i>
                  </span>
                </Link> */}
                <Link href="/as-webpage/support" passHref>
                  <span className="nav-link hover:bg-gray-700 px-2 py-2 rounded-md text-sm font-medium">
                    <i className="fa-solid fa-ticket"></i>
                  </span>
                </Link>
                {/* <Link href="/as-webpage/contact" passHref>
                  <span className="nav-link hover:bg-gray-700 px-2 py-2 rounded-md text-sm font-medium">
                    <i className="fa-solid fa-envelope"></i>
                  </span>
                </Link> */}
                {isAuthenticated && session && session.user?.role[0] == "superadmin" ? (
                  <>
                    <Link href={`/cms/users`} passHref>
                      <span className="py-2 px-4 bg-violet-500 text-white rounded-lg hover:bg-violet-600 focus:outline-none focus:bg-violet-700">
                        <i className="fa-solid fa-user-pen"></i>
                      </span>
                    </Link>
                  </>
                ) : (
                  <></>
                )}
                {isAuthenticated && !isCMSRoute && session && (session.user?.role[0] == "superadmin" || session?.user?.role[0] == "admin" || session?.user?.role[0] == "homeroom" || session?.user?.role[0] == "user") ? (
                  <>
                    <Link href={`/cms`} passHref>
                      <span className="py-2 px-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 focus:outline-none focus:bg-emerald-700">
                        CMS
                      </span>
                    </Link>
                  </>
                ) : (
                  <></>
                )}
                {isAuthenticated && session && session.user?.name ? (
                  <>
                    <span className="text-white mr-4">Welcome, [{session.user.role}]&nbsp;{session.user.name}</span>
                    <LogoutButton />
                  </>
                ) : (
                  <Link href="/auth/signin">
                    <span className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-700">
                      <i className="fa-solid fa-sign-in-alt"></i>
                    </span>
                  </Link>
                )}

              </div>

            ) : (
              <>
                {isAuthenticated && session && session.user?.name ? (
                  <>
                    <span className="text-white mr-4">Welcome, [{session.user.role}]&nbsp;{session.user.name}</span>
                    <LogoutButton />
                  </>
                ) : (
                  <Link href="/auth/signin">
                    <span className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-700">
                      <i className="fa-solid fa-sign-in-alt"></i>
                    </span>
                  </Link>
                )}
              </>
            )}

            {/* Theme Toggle */}
            <div className="flex items-center">
              <button onClick={toggleTheme} className="bg-gray-700 hover:bg-gray-600 text-white px-4 text-center py-2 rounded-md">
                {theme === 'dark' ? (
                  <><i className="fa-solid fa-sun text-center"></i></>
                ) : (
                  <><i className="fa-solid fa-moon text-center"></i></>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <nav className="mobile-navbar md:hidden bg-gray-800 text-white shadow-lg">
        {/* Hamburger Icon */}
        <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center bg-gray-700 py-2">
            <Link href="/" passHref>
              <span className="brand-name text-xl font-bold">
                <i className="fa-solid fa-list-check mr-2"></i>Attendance App
              </span>
            </Link>
          </div>
          <div className="flex hamburger-icon" onClick={toggleMenu}>
            <svg className="w-6 h-6 fill-current text-gray-400 hover:text-gray-300" viewBox="0 0 24 24">
              {isOpen ? (
                <path fillRule="evenodd" clipRule="evenodd" d="M3 5H21V7H3V5ZM3 11H21V13H3V11ZM3 17H21V19H3V17Z" />
              ) : (
                <path fillRule="evenodd" clipRule="evenodd" d="M4 6H20V8H4V6ZM4 12H20V14H4V12ZM4 18H20V20H4V18Z" />
              )}
            </svg>
          </div>
        </div>

        {/* Nav Links */}
        <div className={`nav-links ${isOpen ? 'block' : 'hidden'} bg-gray-800 px-4 pt-2 pb-4`}>
          <Link href="/" onClick={toggleMenu}>
            <span className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium block">
              <i className="fa-solid fa-house mr-2"></i>ホームページ
            </span>
          </Link>
          <Link href="/as-webpage/about" onClick={toggleMenu}>
            <span className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium block">
              <i className="fa-solid fa-info-circle mr-2"></i>Attendance Appについて
            </span>
          </Link>
          <Link href="/as-webpage/support" className="" passHref onClick={toggleMenu}>
            <span className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium block">
              <i className="fa-solid fa-envelope mr-2"></i>Contact
            </span>
          </Link>
          {isAuthenticated ? (
            <LogoutButton />
          ) : (
            <Link href="/signin">
              <span className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-700 block mt-2">
                <i className="fa-solid fa-sign-in-alt mr-2"></i>signin
              </span>
            </Link>
          )}
          <button onClick={toggleTheme} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md mt-4 block">
            {theme === 'dark' ? (
              <><i className="fa-solid fa-sun mr-2"></i>Light Mode</>
            ) : (
              <><i className="fa-solid fa-moon mr-2"></i>Dark Mode</>
            )}
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
