import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const Navbar: React.FC = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated' && session && session.user;


  return (
    <nav className="bg-gray-900 select-none text-white p-4 flex justify-between">
      <div>
        <Link href="/cms">
          <span className="text-2xl font-bold">Smart Attendance CMS</span>
        </Link>
      </div>
      <div className="space-x-4">
        {isAuthenticated && session && (session.user?.role[0] == "superadmin" || session?.user?.role[0] == "admin" || session?.user?.role[0] == "homeroom" ) ? (
          <>
            <Link href="/cms/AttendanceLog">
              <span className="hover:text-gray-400">Attendance Log</span>
            </Link>
            <Link href="/cms/RegisteredStudentList">
              <span className="hover:text-gray-400">Registered Students</span>
            </Link>
            <Link href={`/cms/Registration/uploadPDF`} passHref>
              <span className="hover:text-gray-400">Register Students</span>
            </Link>
          </>
        ) : (
          <></>
        )}
        <Link href="/cms/ClassAttendance/dashboard">
          <span className="hover:text-gray-400">Class Dashboard</span>
        </Link>
        {isAuthenticated && session && (session.user?.role[0] == "superadmin" || session?.user?.role[0] == "admin") ? (
          <>
            <Link href={`/cms/users`} passHref>
              <span className="hover:text-gray-400">Users Management</span>
            </Link>
          </>
        ) : (
          <></>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
