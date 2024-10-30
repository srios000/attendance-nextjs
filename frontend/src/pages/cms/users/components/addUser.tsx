import { useState, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';
import SingleSelectDropdown from './roleDropdown';
import bcrypt from 'bcryptjs';

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRefresh: () => void;
}

const AddUserModal = ({ isOpen, onClose, onRefresh }: AddUserModalProps) => {
    const { data: session } = useSession();
    const currentUser = session?.user;    
    const [name, setName] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [resetPasswordSecretAnswer, setResetPasswordSecretAnswer] = useState<string>('');

    const [errors, setErrors] = useState({
        name: '',
        username: '',
        password: '',
        resetPasswordSecretAnswer: '',
        selectedRole: ''
    });

    const availableRoles = ['superadmin', 'admin', 'homeroom', 'user'];
    const userRoles = currentUser?.role || [];

    const handleRoleChange = (role: string) => {
        setSelectedRole(role);
    };

    const validateInputs = () => {
        const newErrors = {
            name: name.trim() ? '' : 'Name is required.',
            username: username.trim() ? '' : 'Username is required.',
            password: password.trim() ? '' : 'Password is required.',
            resetPasswordSecretAnswer: resetPasswordSecretAnswer.trim() ? '' : 'Secret answer is required.',
            selectedRole: selectedRole ? '' : 'Role is required.'
        };
        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error !== '');
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validateInputs()) {
            Swal.fire('Error!', 'Please fill all the fields.', 'error');
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedResetPasswordSecretAnswer = await bcrypt.hash(resetPasswordSecretAnswer, 10);
    
        const newUser = {
            name,
            username,
            password: hashedPassword,
            resetPasswordSecretAnswer: hashedResetPasswordSecretAnswer,
            role: [selectedRole],
        };
    
        try {
            const response = await fetch('/api/contents/admins/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-internal-request': process.env.NEXT_PUBLIC_ADMIN_ACCESS_HEADER || '' },
                body: JSON.stringify(newUser),
            });
    
            if (response.ok) {
                Swal.fire('Success!', 'User has been added successfully.', 'success');
                onRefresh();
                onClose();
            } else {
                Swal.fire('Error!', 'Failed to add user.', 'error');
            }
        } catch (error) {
            Swal.fire('Error!', 'An error occurred.', 'error');
        }
    };
    

    if (!isOpen) return null;

    // Determine if the user is allowed to select certain role
    const isSuperAdmin = userRoles.includes('superadmin');
    const isAdmin = userRoles.includes('admin');
    const roleOptions = availableRoles.filter(role => {
        if (isSuperAdmin) return true;
        if (isAdmin) return role !== 'superadmin' && role !== 'admin';
        return false;
    });

    const isRoleDisabled = !isSuperAdmin && !isAdmin;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-slate-700 rounded-lg shadow-lg w-full max-w-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">Add New User</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            className="mt-1 block w-full text-black dark:text-slate-100 dark:bg-slate-700 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-sm font-medium dark:text-slate-200 text-gray-700">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            className="mt-1 block w-full border-gray-300 dark:text-slate-100 dark:bg-slate-700 text-black rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        {errors.username && <p className="text-red-600 text-sm">{errors.username}</p>}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium dark:text-slate-200 text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="mt-1 block w-full border-gray-300 dark:text-slate-100 dark:bg-slate-700 text-black rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="resetPasswordSecretAnswer" className="block text-sm font-medium dark:text-slate-200 text-gray-700">
                            Reset Password Secret Answer
                        </label>
                        <input
                            type="text"
                            id="resetPasswordSecretAnswer"
                            className="mt-1 block w-full border-gray-300 dark:text-slate-100 dark:bg-slate-700 text-black rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            value={resetPasswordSecretAnswer}
                            onChange={(e) => setResetPasswordSecretAnswer(e.target.value)}
                            required
                        />
                        {errors.resetPasswordSecretAnswer && <p className="text-red-600 text-sm">{errors.resetPasswordSecretAnswer}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">Role</label>
                        <SingleSelectDropdown
                            currentRole={selectedRole}
                            allRoles={roleOptions}
                            onChange={handleRoleChange}
                            disabled={isRoleDisabled}
                        />
                        {errors.selectedRole && <p className="text-red-600 text-sm">{errors.selectedRole}</p>}
                    </div>
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
                            className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700"
                        >
                            Add User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUserModal;
