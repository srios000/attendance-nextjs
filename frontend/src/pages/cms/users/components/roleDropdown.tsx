import { useState, useEffect, useRef } from 'react';

interface SingleSelectDropdownProps {
    currentRole: string;
    allRoles: string[];
    onChange: (newRole: string) => void;
    disabled?: boolean;
}

const SingleSelectDropdown = ({ currentRole, allRoles, onChange, disabled }: SingleSelectDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(currentRole);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    const filteredRoles = allRoles.filter(role =>
        role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRoleChange = (role: string) => {
        setSelectedRole(role);
        onChange(role);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleKeyDown = (e: React.KeyboardEvent, role?: string) => {
        if (e.key === 'Enter' && role) {
            handleRoleChange(role);
        }
        if (e.key === 'Escape') {
            setIsOpen(false);
            setSearchTerm('');
        }
    };

    return (
        <div ref={dropdownRef} className="relative inline-block text-left w-64">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
                    w-full px-4 py-2.5 text-left inline-flex items-center justify-between
                    rounded-lg border transition-all duration-200
                    ${disabled 
                        ? 'bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400'
                        : 'bg-white border-gray-200 hover:border-blue-500 text-gray-700 hover:bg-gray-50'
                    }
                    ${isOpen ? 'border-blue-500 ring-2 ring-blue-100' : ''}
                    dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200
                    dark:hover:bg-gray-700 focus:outline-none
                `}
            >
                <span className="truncate">
                    {selectedRole || "Select Role"}
                </span>
                <svg
                    className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-2">
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e)}
                            placeholder="Search roles..."
                            className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 
                                     focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                                     dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200
                                     dark:placeholder-gray-400"
                        />
                    </div>

                    <div className="max-h-60 overflow-y-auto">
                        {filteredRoles.length > 0 ? (
                            <div className="py-1">
                                {filteredRoles.map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => handleRoleChange(role)}
                                        onKeyDown={(e) => handleKeyDown(e, role)}
                                        className={`
                                            w-full px-4 py-2 text-sm text-left transition-colors
                                            hover:bg-blue-50 hover:text-blue-700
                                            dark:hover:bg-gray-700
                                            ${selectedRole === role 
                                                ? 'bg-blue-50 text-blue-700 dark:bg-gray-700 dark:text-blue-400'
                                                : 'text-gray-700 dark:text-gray-200'
                                            }
                                        `}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                                No roles found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SingleSelectDropdown;