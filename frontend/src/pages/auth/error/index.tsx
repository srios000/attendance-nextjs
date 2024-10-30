import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';

const AuthErrorPage: NextPage = () => {
  const router = useRouter();
  const { error } = router.query;

  const errorMessage = (errorType: string | string[] | undefined) => {
    switch (errorType) {
      case 'CredentialsSignin':
        return 'Sign in failed. Please check your credentials and try again.';
      case 'OAuthSignin':
        return 'Sign in with OAuth failed. Please try again.';
      case 'OAuthCallback':
        return 'OAuth callback error. Please try again.';
      case 'OAuthCreateAccount':
        return 'Error creating account with OAuth. Please try again.';
      case 'EmailCreateAccount':
        return 'Error creating account with email. Please try again.';
      case 'Callback':
        return 'Callback error. Please try again.';
      case 'OAuthAccountNotLinked':
        return 'To confirm your identity, sign in with the same provider you used originally.';
      case 'EmailSignin':
        return 'Sign in with email failed. Please try again.';
      case 'SessionRequired':
        return 'You need to be authenticated to access this page.';
      case 'Default':
        return 'An unknown error occurred. Please try again.';
      default:
        return 'An unknown error occurred. Please try again.';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
      <h1>Authentication Error</h1>
      <p>{errorMessage(error)}</p>
      <Link href="/auth/signin">
        <a>Back to Sign In</a>
      </Link>
    </div>
  );
};

export default AuthErrorPage;
