import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const RequestResetPassword = () => {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const response = await fetch(`/api/contents/admins/byUsername/${username}`, {
            headers: {
                'x-internal-request': 'true',
            },
        });
        const result = await response.json();

        if (!result.success) {
        setError(result.error || 'User not found');
        return;
        }

        router.push(`/auth/reset-password?userId=${result.data._id}`);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Head>
                <title>Request Password Reset</title>
            </Head>
            <div className="bg-white p-8 rounded-lg shadow-lg dark:bg-gray-800">
                <h2 className="text-2xl font-bold mb-6 dark:text-white">Request Password Reset</h2>
                {error && <div className="mb-4 text-red-500">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-gray-700 dark:text-gray-300">Username</label>
                        <input
                            type="username"
                            id="username"
                            className="w-full p-2 border border-gray-300 rounded mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-700"
                    >
                        Request Reset Link
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RequestResetPassword;
