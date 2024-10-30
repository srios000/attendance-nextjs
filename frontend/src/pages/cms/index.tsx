import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const Home = () => {
  const { data: session } = useSession();
  // const isAuthenticated = status === 'authenticated' && session && session.user;
  const currentUser = session?.user;
  const userRoles = currentUser?.role || [];

  const hasPrivilegedAccess = () => {
    return userRoles.some(role => ['admin', 'superadmin', 'homeroom'].includes(role));
  };

  const hasAdminAccess = () => {
    return userRoles.some(role => ['admin', 'superadmin'].includes(role));
  };

  const FeatureCard = ({ href, icon, title, description, requiresPrivileges = true, requiresAdmin = false }) => {
    // Check if feature requires admin access
    if (requiresAdmin && !hasAdminAccess()) {
      return (
        <div className="p-6 bg-gray-600 text-gray-400 rounded-lg shadow-md cursor-not-allowed opacity-50">
          <i className={`fa ${icon} fa-3x mb-4`}></i>
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="mt-2">{description}</p>
          <p className="mt-2 text-sm text-gray-400">(Admin access required)</p>
        </div>
      );
    }
    
    // Check for other privileged access
    if (!requiresPrivileges || hasPrivilegedAccess()) {
      return (
        <Link href={href}>
          <div className="p-6 bg-gray-800 text-white rounded-lg shadow-md hover:shadow-lg transition-shadow hover:bg-gray-700">
            <i className={`fa ${icon} fa-3x mb-4`}></i>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="mt-2">{description}</p>
          </div>
        </Link>
      );
    }

    return (
      <div className="p-6 bg-gray-600 text-gray-400 rounded-lg shadow-md cursor-not-allowed opacity-50">
        <i className={`fa ${icon} fa-3x mb-4`}></i>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="mt-2">{description}</p>
        <p className="mt-2 text-sm text-gray-400">(Requires additional privileges)</p>
      </div>
    );
  };

  return (
    <>
      <div className="flex max-w-full h-[80vh] dark:bg-gray-900 flex-col bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
        <main className="max-w-8xl flex-grow container px-4 py-10 mb-5 mx-auto p-2">
          <section className="text-center mb-10">
            <h1 className="text-6xl font-bold font-serif mt-8 text-gray-900 dark:text-white mb-4">Attendance Management Dashboard</h1>
            <p className="text-xl font-serif mb-8 text-slate-500 dark:text-slate-300 font-bold">Smart Class Integration!</p>
            <h2 className="text-4xl text-center font-bold text-gray-900 dark:text-gray-100 mb-8">Features</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                href="/cms/AttendanceLog"
                icon="fa-list"
                title="Attendance Log"
                description="Track attendance in real-time"
              />

              <FeatureCard
                href="/cms/RegisteredStudentList"
                icon="fa-users"
                title="Registered Students"
                description="View the list of registered students"
              />

              <FeatureCard
                href="/cms/Registration/uploadPDF"
                icon="fa-file-pdf"
                title="Register Students"
                description="Register students via PDF"
              />

              <FeatureCard
                href="/cms/ClassAttendance/dashboard"
                icon="fa-chart-bar"
                title="Class Dashboard"
                description="Group or class-specific attendance dashboard"
                requiresPrivileges={false}
              />

              <FeatureCard
                href="/cms/users"
                icon="fa-user-shield"
                title="User Role Management"
                description="Manage user roles and access"
                requiresAdmin={true}
              />
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default Home;