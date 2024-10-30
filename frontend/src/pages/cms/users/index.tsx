import { useState, useEffect, ChangeEvent } from 'react';
import AddUserModal from './components/addUser';
import EditUserModal from './components/editUser';
import Swal from 'sweetalert2';
// import Link from 'next/link';
// import dayjs from 'dayjs';
// import DOMPurify from 'dompurify';
// import Maintenance from '@/components/Maintenance';
// import RoleDropdown from './components/roleDropdown';
import { useSession } from 'next-auth/react';

import NoAccessPage from '@/pages/auth/403';

interface User {
    _id: string;
    name: string;
    username: string;
    role: string[];
}

const UsersTable = () => {
    const { data: session } = useSession();
    const [users, setUsers] = useState<User[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(9);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState<string[]>(['superadmin', 'admin', 'homeroom', 'verifiedartist', 'user']);
    const availableRoles = ['superadmin', 'admin', 'homeroom', 'user'];
    // const isMaintenance = false;
    const currentUser = session?.user;
    
    const userHasAccess = session?.user?.role?.some(role => 
        ['superadmin', 'admin'].includes(role)
    );

    useEffect(() => {
        if (!session || !userHasAccess) return;
        fetchUsers();
    }, [session, userHasAccess]);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/contents/admins', {
                headers: {
                    'x-internal-request': process.env.NEXT_PUBLIC_ADMIN_ACCESS_HEADER || ''
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.success) {
                setUsers(data.data);
                setFilteredUsers(data.data);
            } else {
                console.error('Failed to fetch users:', data.error);
            }
        } catch (error) {
            console.error('An error occurred while fetching users:', error);
        }
    };

    useEffect(() => {
        if (!Array.isArray(users)) {
            setFilteredUsers([]);
            return;
        }
    
        const results = users.filter((user) => {
            const matchesName = user.name ? user.name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
            const matchesUsername = user.username ? user.username.toLowerCase().includes(searchTerm.toLowerCase()) : false;
            const matchesRoles = selectedRoles.length > 0 ? selectedRoles.some(role => user.role.includes(role)) : true;
            return (matchesName || matchesUsername) && matchesRoles;
        });
    
        setFilteredUsers(results);
        setCurrentPage(1);
    }, [searchTerm, selectedRoles, users]);    

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedRoles(availableRoles);
    };

    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentItems = Array.isArray(filteredUsers) ? filteredUsers.slice(firstItemIndex, lastItemIndex) : [];

    const totalPages = Array.isArray(filteredUsers) ? Math.ceil(filteredUsers.length / itemsPerPage) : 0;

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const handleItemsPerPageChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const value = parseInt(e.target.value, 10);
        setItemsPerPage(value);
    };

    const handleRoleChange = (role: string) => {
        setSelectedRoles((prevSelectedRoles) =>
            prevSelectedRoles.includes(role)
                ? prevSelectedRoles.filter((r) => r !== role)
                : [...prevSelectedRoles, role]
        );
    };

    const handleDelete = async (id: string, name: string) => {
        Swal.fire({
            title: 'Are you sure?',
            html: `Are you sure you want to delete the user "<b>${name}</b>" from the database? <br><br> <span style="color: red; animation: blinker 1.5s linear infinite; font-weight: bold;">This action cannot be undone.</span>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`/api/contents/admins/delete/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'x-internal-request': process.env.NEXT_PUBLIC_ADMIN_ACCESS_HEADER || ''
                        }
                    });

                    if (response.ok) {
                        setUsers(users.filter((user) => user._id !== id));
                        setFilteredUsers(filteredUsers.filter((user) => user._id !== id));
                        Swal.fire(
                            'Deleted!',
                            'The user has been deleted.',
                            'success'
                        );
                    } else {
                        Swal.fire('Error!', 'Failed to delete user.', 'error');
                    }
                } catch (error) {
                    Swal.fire('Error!', 'An error occurred.', 'error');
                }
            }
        });
    };

    const handleEditClick = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const refreshUsers = async () => {
        resetFilters();
        try {
            const response = await fetch('/api/contents/admins', {
                headers: {
                    'x-internal-request': process.env.NEXT_PUBLIC_ADMIN_ACCESS_HEADER || ''
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.success) {
                setUsers(data.data);
                setFilteredUsers(data.data);
            } else {
                console.error('Failed to fetch users');
            }
        } catch (error) {
            console.error('An error occurred while fetching users:', error);
        }
    };    

    const getPageNumbers = () => {
        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            // @ts-expect-error - no error
            pageNumbers.push(i);
        }
        return pageNumbers;
    };

    return (
        <>
            {userHasAccess && (
                <>
                    <div className="h-[80vh] max-w-full bg-gradient-to-b dark:from-gray-900 dark:to-gray-800 text-white p-6">
                        <div className="container mx-auto">
                            <div className="dark:bg-gray-800 bg-gray-100 dark:shadow-shadow-slate-300 shadow-slate-300 dark:hover:shadow-white hover:shadow-slate-500 p-6 rounded-xl shadow-lg">
                            <h1 className="text-2xl font-bold">User Management</h1>
                                <button
                                    className="btn bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-transform transform hover:scale-105 my-4 px-6 py-3"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    <i className="fa-solid fa-user-plus"></i> Add User
                                </button>
                                <AddUserModal isOpen={isModalOpen && selectedUser === null} onClose={() => setIsModalOpen(false)} onRefresh={refreshUsers} />
                                {selectedUser && 
                                    <EditUserModal
                                        isOpen={isModalOpen}
                                        onClose={() => { setIsModalOpen(false); setSelectedUser(null); }}
                                        user={selectedUser}
                                        onUserUpdated={refreshUsers}
                                    />
                                }

                                <div className="mt-8">
                                    <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                                        <input
                                            type="text"
                                            placeholder="Search users..."
                                            aria-placeholder="Search users..."
                                            className="px-4 py-2 mb-4 md:mb-0 shadow-sm hover:dark:shadow-sky-400 hover:shadow-sky-500 bg-gray-300 dark:bg-gray-700 dark:text-white text-slate-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <div className="flex space-x-2 mb-4 md:mb-0">
                                            {availableRoles.map((role) => (
                                                <label key={role} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRoles.includes(role)}
                                                        onChange={() => handleRoleChange(role)}
                                                        className="form-checkbox h-5 w-5 text-blue-500 shadow-sm hover:shadow-sky-300 dark:hover:shadow-sky-200 bg-gray-700 border-gray-600 rounded"
                                                    />
                                                    <span className="dark:text-white shadow-sm text-slate-800 ">{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <select
                                            className="px-4 py-2 dark:bg-gray-700 bg-gray-200 dark:text-white shadow-sm hover:shadow-slate-300 dark:hover:shadow-slate-100 text-slate-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={itemsPerPage}
                                            onChange={handleItemsPerPageChange}
                                        >
                                            {[9, 18, 27].map((number) => (
                                                <option key={number} value={number}>
                                                    Show {number}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        {filteredUsers.length === 0 ? (
                                            <p className="text-center text-gray-500">No users found matching the filter criteria.</p>
                                        ) : (
                                            <>
                                                {currentItems.map((user) => (
                                                    <div key={user._id} className="dark:bg-gray-900 bg-gray-200 dark:text-white text-slate-800 p-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform">
                                                        <h3 className="text-xl font-bold mb-2">{user.name}</h3>
                                                        <p className="text-sm dark:text-gray-400 text-gray-600 mb-4">{user.username}</p>
                                                        <p className='text-sm dark:text-gray-400 text-gray-600 mb-4'>{user.role.join(', ')}</p>
                                                        {/* <RoleDropdown
                                                            currentRole={user.role[0]}
                                                            allRoles={
                                                                currentUser?.role.includes('superadmin')
                                                                    ? availableRoles
                                                                    : currentUser?.role.includes('admin')
                                                                    ? availableRoles.filter(role => role !== 'superadmin' && role !== 'admin')
                                                                    : []
                                                            }
                                                            onChange={(newRole) => handleEditRoleChange(user._id, [newRole])}
                                                            disabled={
                                                                !currentUser?.role.includes('superadmin') &&
                                                                !currentUser?.role.includes('admin')
                                                            }
                                                        /> */}
                                                        <div className="flex justify-between items-center mt-4 space-x-1">
                                                            {/* <Link href={`../../contents/user/${user.username}`} target='_blank' passHref>
                                                                <span className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-transform transform hover:scale-105">
                                                                    <i className="fa-solid fa-arrow-up-right-from-square"></i>
                                                                </span>
                                                            </Link> */}
                                                            <div className="flex space-x-0.5">
                                                                <button 
                                                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:bg-opacity-10 text-white rounded-lg transition-transform transform hover:scale-105" 
                                                                    onClick={() => handleEditClick(user)}
                                                                    disabled={user.role.includes('superadmin') && !currentUser?.role.includes('superadmin') || currentUser?.role.includes('admin') && user?.role.includes('admin')}
                                                                >
                                                                    <i className="fa-solid fa-user-pen"></i>
                                                                </button>
                                                                <button 
                                                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:bg-opacity-10 text-white rounded-lg transition-transform transform hover:scale-105" 
                                                                    onClick={() => handleDelete(user._id, user.name)}
                                                                    disabled={user.role.includes('superadmin') && !currentUser?.role.includes('superadmin') || currentUser?.role.includes('admin') && user?.role.includes('admin')}
                                                                >
                                                                    <i className='fa-solid fa-user-xmark'></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>

                                    <div className="mt-6 flex justify-center space-x-2">
                                        <button 
                                            className="px-3 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" 
                                            onClick={() => paginate(1)} 
                                            disabled={currentPage === 1}
                                        >
                                            First
                                        </button>
                                        <button 
                                            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" 
                                            onClick={() => paginate(currentPage - 1)} 
                                            disabled={currentPage === 1}
                                        >
                                            Prev
                                        </button>
                                        {getPageNumbers().map(number => (
                                            <button
                                                key={number}
                                                className={`px-3 py-2 rounded-lg transition-transform transform hover:scale-105 ${
                                                    number === currentPage
                                                        ? 'bg-yellow-400 text-black'
                                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                                }`}
                                                onClick={() => paginate(number)}
                                            >
                                                {number}
                                            </button>
                                        ))}
                                        <button 
                                            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" 
                                            onClick={() => paginate(currentPage + 1)} 
                                            disabled={currentPage >= totalPages}
                                        >
                                            Next
                                        </button>
                                        <button 
                                            className="px-3 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" 
                                            onClick={() => paginate(totalPages)} 
                                            disabled={currentPage >= totalPages}
                                        >
                                            Last
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <section className='mt-56'></section>
                    </div>
                </>
            )}
            {!userHasAccess && (
                <NoAccessPage />
            )}
        </>
    );
};

export default UsersTable;
