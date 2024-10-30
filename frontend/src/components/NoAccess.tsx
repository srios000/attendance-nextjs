import { useSession } from 'next-auth/react';

const NoAccess = () => {
    const { data: session } = useSession();
    const currentUser = session?.user;
    const userRoles = currentUser?.role || [];

    return (
        <>
            <div className='flex max-w-full h-[90vh] dark:bg-gray-900 flex-col bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800'>
                <div className="max-w-7xl mx-auto p-4">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">No Access</h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300">
                        {userRoles.length === 0 ? (<p>You are not logged in. Please log in to view this page.</p>)
                        : (<p>You do not have sufficient authority to view this page. Please log in as an administrator to access it.</p>)}
                    </p>
                </div>
            </div>
        </>
    );
}

export default NoAccess;