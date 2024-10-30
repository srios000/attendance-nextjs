import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import bcrypt from 'bcryptjs';

export interface User {
    _id: string;
    name: string;
    username?: string;
    password: string;
    role: string[];
    createdAt: Date;
}

const ResetPassword = () => {
    const router = useRouter();
    const { userId } = router.query;

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [secretAnswer, setSecretAnswer] = useState('');
    const [error, setError] = useState('');
    const [user, setUser] = useState({} as User);
    const [success, setSuccess] = useState('');

    const validatePassword = (password: string) => {
        const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        return password.length >= 8 && (hasSymbol || hasUppercase);
    };

    const fetchUser = async () => {
        if (!userId) return;

        try {
            const response = await fetch(`/api/contents/admins/byId/${userId}`, {
                headers: {
                    'x-internal-request': 'true',
                },
            });
            if (!response.ok) {
                // throw new Error('Failed to fetch user');
                router.push(`/auth/request-reset-password`);
            }
            const data = await response.json();
            setUser(data.data);
        } catch (error) {
            console.error('Failed to fetch user:', error);
        }
    };

    useEffect(() => {
        fetchUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validatePassword(newPassword)) {
            setError('Password must be at least 8 characters long and contain at least one symbol or one uppercase letter.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: user.username,
                newPassword: hashedPassword,
                resetPasswordSecretAnswer: secretAnswer,
                isHashed: true,
            }),
        });

        const result = await response.json();

        if (!result.success) {
            setError(result.error || 'Failed to reset password');
            return;
        }

        setSuccess('Password updated successfully');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Head>
                <title>Reset Password</title>
            </Head>
            <div className="bg-white p-8 rounded-lg shadow-lg dark:bg-gray-800">
                <h2 className="text-2xl font-bold mb-6 dark:text-white">Reset Password</h2>
                {error && <div className="mb-4 text-red-500">{error}</div>}
                {success && <div className="mb-4 text-green-500">{success}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="new-password" className="block text-gray-700 dark:text-gray-300">New Password</label>
                        <input
                            type="password"
                            id="new-password"
                            className="w-full p-2 border border-gray-300 rounded mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="confirm-password" className="block text-gray-700 dark:text-gray-300">Confirm New Password</label>
                        <input
                            type="password"
                            id="confirm-password"
                            className="w-full p-2 border border-gray-300 rounded mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="secret-answer" className="block text-gray-700 dark:text-gray-300">Secret Answer</label>
                        <input
                            type="text"
                            id="secret-answer"
                            className="w-full p-2 border border-gray-300 rounded mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={secretAnswer}
                            onChange={(e) => setSecretAnswer(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-700"
                    >
                        Reset Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
