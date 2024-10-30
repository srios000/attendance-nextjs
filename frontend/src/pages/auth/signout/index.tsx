import React from 'react';
import { signOut } from 'next-auth/react';

const LogoutButton = () => {
  const handleLogout = () => {
    signOut({ redirect: true, callbackUrl: '/auth/signin' });
  };

  return (
    <button
      onClick={handleLogout}
      className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:bg-red-700"
    >
      <i className="fa-solid fa-sign-out-alt"></i>
    </button>
  );
};

export default LogoutButton;
