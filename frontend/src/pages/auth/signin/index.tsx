import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useSession } from 'next-auth/react';

const Signin = () => {
  const { data: session } = useSession();
  const currentUser = session?.user;
  //eslint-disable-next-line
  const userRole = currentUser?.role || [];
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (router.query.email) {
      setIdentifier(router.query.email as string);
    } else if (router.query.username) {
      setIdentifier(router.query.username as string);
    } else {
      setIdentifier('');
    }
  }, [router.query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await signIn('credentials', {
      redirect: false,
      identifier,
      password,
    });

    if (result?.error) {
      switch (result.error) {
        case 'User not found':
          setError('No user found with this username.');
          break;
        case 'Invalid password':
          setError('Incorrect password. Please try again.');
          break;
        case 'Invalid credentials':
          setError('Invalid username or password');
          break;
        default:
          setError('Sign-in failed. Please check your username and password.');
      }
      return;
    }
    router.push('/');
  };

  const isSignedIn = !!currentUser;

  return (
    <>
      { !isSignedIn ? (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
          <Head>
            <title>Sign In</title>
          </Head>
          <div className="bg-white p-8 rounded-lg shadow-lg dark:bg-gray-800">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Sign In</h2>
            {error && <div className="mb-4 text-red-500" dangerouslySetInnerHTML={{ __html: error }}></div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="identifier" className="block text-gray-700 dark:text-gray-300">Username</label>
                <input
                  type="text"
                  id="identifier"
                  className="w-full p-2 border border-gray-300 rounded mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-gray-700 dark:text-gray-300">Password</label>
                <input
                  type="password"
                  id="password"
                  className="w-full p-2 border border-gray-300 rounded mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-700"
              >
                Sign In
              </button>
            </form>
            <div className="mt-4">
              <Link href="/auth/request-reset-password">
                <span className="text-blue-500 hover:underline">Forgot your password?</span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
          <div className="bg-white p-8 rounded-lg shadow-lg dark:bg-gray-800">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">You are already signed in.</h2>
            <p className="text-red-500">Please sign out first to sign in again.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Signin;
