import { useState } from 'react';

interface SingleSelectDropdownProps {
    currentRole: string;
    allRoles: string[];
    onChange: (newRole: string) => void;
    disabled?: boolean;
}

const SingleSelectDropdown = ({ currentRole, allRoles, onChange, disabled }: SingleSelectDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(currentRole);

    const handleRoleChange = (role: string) => {
        setSelectedRole(role);
        onChange(role);
        setIsOpen(false);
    };

    return (
        <div className="relative z-40 inline-block text-left">
            <div>
                <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-md border-2 disabled:border-red-500 border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-slate-800 dark:text-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-500 disabled:cursor-not-allowed focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={disabled}
                >
                    {selectedRole || "Select Role"}
                    <svg
                        className="-mr-1 ml-2 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
            </div>

            {isOpen && (
                <div className="origin-top-right z-50 absolute right-0 mt-2 max-w-28 rounded-md shadow-lg bg-white dark:text-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1 divide-y divide-slate-700 ">
                        {allRoles.map((role) => (
                            <button
                                key={role}
                                onClick={() => handleRoleChange(role)}
                                className="w-full px-4 py-2 text-sm text-gray-700 dark:text-white hover:dark:text-slate-600 bg-slate-800 z-50 hover:bg-gray-100 hover:text-gray-900"
                            >
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SingleSelectDropdown;
