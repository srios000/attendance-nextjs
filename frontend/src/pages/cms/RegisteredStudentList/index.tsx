import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';

interface Student {
    _id: string;
    name: string;
    group: string;
}

interface Group {
    _id: string;
    name: string;
}

const RegisteredStudentList = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [groupList, setGroupList] = useState<Group[]>([]);
    const { data: session } = useSession();
    // const currentUser = session?.user;
    // const userRoles = currentUser?.role || [];
    const [filteredData, setFilteredData] = useState<Student[]>([]);
    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });
    const [searchName, setSearchName] = useState('');
    const [searchGroup, setSearchGroup] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    const totalRecords = filteredData.length;
    const totalPages = Math.ceil(totalRecords / recordsPerPage);

    const userHasAccess = session?.user?.role?.some(role => 
        ['superadmin', 'admin', 'homeroom'].includes(role)
    );

    const truncateString = (str: string, length: number) => {
        if (str.length > length) {
            return str.substring(0, length) + '...';
        }
        return str;
    };

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch('/api/cms/students/data');
            const data = await res.json();
            setStudents(data);
            setFilteredData(data);
        };
        const fetchGroupData = async () => {
            const res = await fetch('/api/cms/group/data');
            const data = await res.json();
            setGroupList(data);
        };
        fetchData();
        fetchGroupData();
    }, []);

    useEffect(() => {
        filterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchName, searchGroup]);

    const filterData = () => {
        let filtered = [...students];

        if (searchName) {
            filtered = filtered.filter(student =>
                student.name.toLowerCase().includes(searchName.toLowerCase())
            );
        }

        if (searchGroup) {
            filtered = filtered.filter(student =>
                student.group.toLowerCase().includes(searchGroup.toLowerCase())
            );
        }

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }

        setFilteredData(filtered);
    };

    const requestSort = (key: string) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
        filterData(); 
    };

    const paginatedData = filteredData.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
    );

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleDelete = async (id: string) => {
        const confirmResult = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            reverseButtons: true,
        });

        if (confirmResult.isConfirmed) {
            try {
                const res = await fetch(`/api/cms/students/data?id=${id}`, {
                    method: 'DELETE',
                });

                if (res.ok) {
                    setStudents((prevData) => prevData.filter((log) => log._id !== id));
                    setFilteredData((prevData) => prevData.filter((log) => log._id !== id));
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'The record has been deleted.',
                        icon: 'success',
                        timer: 2000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                } else {
                    Swal.fire('Error', 'Failed to delete the record.', 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'An unexpected error occurred.', 'error');
            }
        }
    };
    
    return (
        <>
            {userHasAccess ? (
                <div className='flex max-w-full h-[80vh] overflow-y-scroll text-slate-800 dark:text-slate-200 dark:bg-gray-900 flex-col bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800'>
                    <div className="max-w-7xl mx-auto p-4">
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Registered Students</h2>
                        <div className="overflow-x-auto">
                            <div className="flex gap-4 mb-6 overflow-x-visible">
                            <input
                                type="text"
                                placeholder="Search Name"
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />

                                <select
                                value={searchGroup}
                                onChange={(e) => setSearchGroup(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md border-gray-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                <option value="">Select Group</option>
                                    {groupList.map((group) => (
                                        <option className='dark:bg-slate-800' key={group._id} value={group.name}>
                                        {group.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <table className="min-w-full bg-white dark:bg-gray-800">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="py-2 px-6 cursor-pointer" onClick={() => requestSort('name')}>Student</th>
                                        <th className="py-2 px-6 cursor-pointer" onClick={() => requestSort('group')}>Group</th>
                                        <th className="py-2 px-6">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={2}>No records found.</td>
                                    </tr>
                                ) : (
                                    paginatedData.map((student, index) => (
                                        <tr key={index} className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200">
                                            <td className="py-2 px-6 text-center">{truncateString(student.name, 15)}</td>
                                            <td className="py-2 px-6 text-center">{student.group}</td>
                                            <td className="py-2 px-6 flex justify-center">
                                                <button
                                                    onClick={() => handleDelete(student._id)}
                                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                                >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination Controls */}
                        <div className="flex justify-between items-center mt-4">
                            <select
                                value={recordsPerPage}
                                onChange={(e) => setRecordsPerPage(Number(e.target.value))}
                                className="border border-gray-300 rounded-md p-2 bg-transparent"
                            >
                                {[10, 20, 30, 50].map((count) => (
                                    <option className='dark:bg-gray-800 dark:text-white' key={count} value={count}>{count} per page</option>
                                ))}
                            </select>
                            <div>
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => handlePageChange(1)}
                                    className='dark:bg-blue-500 pr-3 pl-3 pt-2 pb-2 rounded-md mr-2 disabled:opacity-50 disabled:cursor-not-allowed dark:disabled:bg-gray-600 disabled:bg-gray-300'
                                >
                                    First
                                </button>
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    className='dark:bg-blue-500 pr-3 pl-3 pt-2 pb-2 rounded-md mr-2 disabled:opacity-50 disabled:cursor-not-allowed dark:disabled:bg-gray-600 disabled:bg-gray-300'
                                >
                                    Prev
                                </button>
                                {currentPage > 3 && <span>...</span>}
                                {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                                    const page = index + Math.max(1, currentPage - 2);
                                    if (page > totalPages) return null;
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`pr-3 pl-3 pt-2 pb-2 rounded-md mr-2 ${page === currentPage ? 'font-bold bg-blue-500' : ''}`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                                {currentPage < totalPages - 2 && <span>...</span>}
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    className='dark:bg-blue-500 pr-3 pl-3 pt-2 pb-2 rounded-md mr-2 ml-2 disabled:opacity-50 disabled:cursor-not-allowed dark:disabled:bg-gray-600 disabled:bg-gray-300'
                                >
                                    Next
                                </button>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => handlePageChange(totalPages)}
                                    className='dark:bg-blue-500 pr-3 pl-3 pt-2 pb-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed dark:disabled:bg-gray-600 disabled:bg-gray-300'
                                >
                                    Last
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex h-[80vh] items-center justify-center">
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white text-center">
                            You are not authorized to view this page.
                        </h2>
                    </div>
                </>
            )}
        </>
        
    );
};

export default RegisteredStudentList;
