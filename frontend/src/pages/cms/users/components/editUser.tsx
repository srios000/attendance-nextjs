import { useState, useEffect, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';
import SingleSelectDropdown from './roleDropdown';
// import Link from 'next/link';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserUpdated: () => void;
    user: {
        _id: string;
        name: string;
        username: string;
        role: string[];
    };
}

const EditUserModal = ({ isOpen, onClose, onUserUpdated, user }: EditUserModalProps) => {
    const { data: session } = useSession();
    const currentUser = session?.user;
    
    const [name, setName] = useState<string>(user.name);
    const [username, setUsername] = useState<string>(user.username);
    const [password, setPassword] = useState<string>('');
    const [selectedRole, setSelectedRole] = useState<string>(user.role[0]);

    const [errors, setErrors] = useState({
        name: '',
        username: '',
        selectedRole: '',
    });

    const availableRoles = ['superadmin', 'admin', 'homeroom', 'user'];
    const userRoles = currentUser?.role || [];

    useEffect(() => {
        setName(user.name);
        setUsername(user.username);
        setSelectedRole(user.role[0]);
    }, [user]);

    const handleRoleChange = (role: string) => {
        setSelectedRole(role);
    };

    const validateInputs = () => {
        const newErrors = {
            name: name.trim() ? '' : 'Name is required.',
            username: username.trim() ? '' : 'Username is required.',
            selectedRole: selectedRole ? '' : 'Role is required.',
        };
        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error !== '');
    };

    const handleResetPassword = async () => {
        const resetPasswordBody = {
            ...user,
            password: 'Password@123'
        };

        try {
            const response = await fetch(`/api/contents/admins/update/${user._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-internal-request': 'true', 'x-internal-request-reset-password': process.env.NEXT_PUBLIC_ADMIN_ACCESS_HEADER || '' },
                body: JSON.stringify(resetPasswordBody),
            });

            if (response.ok) {
                Swal.fire('Success!', 'Password reset to default successfully.', 'success');
                onUserUpdated();
            } else {
                Swal.fire('Error!', 'Failed to reset password.', 'error');
            }
        } catch (error) {
            Swal.fire('Error!', 'An error occurred.', 'error');
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
    
        if (!validateInputs()) {
            Swal.fire('Error!', 'Please fill all the fields.', 'error');
            return;
        }
    
        let updatedUser;  // Declare updatedUser here
    
        if (password !== '') {
            updatedUser = {
                name,
                username,
                password,
                role: [selectedRole],
            };
        } else {
            // Remove the 'const' keyword here to properly assign to updatedUser
            updatedUser = {
                name,
                username,
                role: [selectedRole],
            };
        }
    
        try {
            const response = await fetch(`/api/contents/admins/update/${user._id}`, {
                method: 'PUT',
                //@ts-expect-error add user needs two headers, x-internal-request and x-internal-request-add-user
                headers: { 'Content-Type': 'application/json', 'x-internal-request': true, 'x-internal-request-edit-user': process.env.NEXT_PUBLIC_ADMIN_ACCESS_HEADER || '' },
                body: JSON.stringify(updatedUser),
            });
    
            if (response.ok) {
                Swal.fire('Success!', 'User has been updated successfully.', 'success');
                onUserUpdated();
                onClose();
            } else {
                Swal.fire('Error!', 'Failed to update user.', 'error');
            }
        } catch (error) {
            Swal.fire('Error!', 'An error occurred.', 'error');
        }
    };
    

    if (!isOpen) return null;

    // Determine if the user is allowed to select certain role
    const isEditingSuperAdmin = user.role.includes('superadmin');
    const isSuperAdmin = userRoles.includes('superadmin');
    const isAdmin = userRoles.includes('admin');
    const isEditingSelf = user.name === currentUser?.name;
    const roleOptions = availableRoles.filter(role => {
        if (isSuperAdmin) return true;
        if (isAdmin) return role !== 'superadmin' && role !== 'admin';
        return false;
    });

    const isRoleDisabled = !isSuperAdmin && !isAdmin;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg w-full max-w-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">Edit User</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium dark:text-gray-200 text-gray-700">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            className="mt-1 block w-full text-black dark:text-white dark:bg-slate-800 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={isEditingSuperAdmin && !isSuperAdmin}
                        />
                        {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Username
                        </label>
                        <input
                            type="username"
                            id="username"
                            className="mt-1 block w-full border-gray-300 text-black dark:bg-slate-800 dark:text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={isEditingSuperAdmin && !isSuperAdmin}
                        />
                        {errors.username && <p className="text-red-600 text-sm">{errors.username}</p>}
                    </div>
                    { isSuperAdmin && (
                        <div className="mb-4">
                        <label htmlFor='password' className="block text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="mt-1 block w-full text-black dark:text-white dark:bg-slate-800 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            value="Password@123"
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isEditingSuperAdmin && !isSuperAdmin}
                        />
                    </div>
                    )}
                    {!isEditingSuperAdmin && (
                        <div className="mb-4">
                            <button
                                type="button"
                                className="text-sm text-blue-600 hover:underline disabled:hover:no-underline disabled:text-slate-200 disabled:hover:text-slate-200"
                                onClick={handleResetPassword}
                                disabled={isEditingSuperAdmin && !isSuperAdmin}
                            >
                                Reset Password
                            </button>
                        </div>
                    )}
                    { !isEditingSelf && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Role</label>
                            <SingleSelectDropdown
                                currentRole={selectedRole}
                                allRoles={roleOptions}
                                onChange={handleRoleChange}
                                disabled={isRoleDisabled || (isEditingSuperAdmin && !isSuperAdmin) || user.name === currentUser?.name}
                            />
                            {errors.selectedRole && <p className="text-red-600 text-sm">{errors.selectedRole}</p>}
                        </div>
                    )}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            className="mr-4 px-4 py-2 bg-gray-500 text-white rounded-md shadow-sm hover:bg-gray-600"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 dark:disabled:hover:bg-indigo-300 disabled:cursor-not-allowed dark:disabled:bg-slate-500 disabled:hover:bg-gray-500 disabled:bg-slate-400"
                            disabled={isEditingSuperAdmin && !isSuperAdmin || !isSuperAdmin && user.name === currentUser?.name}
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;
