import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { StaticDateRangePicker } from '@mui/x-date-pickers-pro/StaticDateRangePicker';
import { PickersShortcutsItem } from '@mui/x-date-pickers/PickersShortcuts';
import { DateRange } from '@mui/x-date-pickers-pro/models';
import { useSession } from 'next-auth/react';

dayjs.extend(isBetween);

interface Student {
    _id: string;
    name: string;
    group: string;
    timestamp: string;
    attended: boolean;
}

const TableHeader = ({ title, sortKey, sortConfig, onSort }) => {
    return (
        <th 
            className="py-2 px-6 cursor-pointer group" 
            onClick={() => onSort(sortKey)}
        >
            <div className="flex items-center justify-center gap-2">
                <span>{title}</span>
                <div className="flex flex-col">
                {sortConfig.key === sortKey ? (
                    sortConfig.direction === 'ascending' ? (
                        <i className="fa-solid fa-caret-up text-blue-500"></i>
                    ) : (
                        <i className="fa-solid fa-caret-down text-blue-500"></i>
                    )
                ) : (
                    <div className="opacity-0 group-hover:opacity-50">
                        <i className="fa-solid fa-caret-up"></i>
                    </div>
                )}
                </div>
            </div>
        </th>
    );
};

const AttendanceTable = ({ userHasAccess }: { userHasAccess: boolean }) => {
    const [attendanceData, setAttendanceData] = useState<Student[]>([]);
    const [filteredData, setFilteredData] = useState<Student[]>([]);
    const [showDatePicker, setShowDatePicker] = useState(false); 
    const [searchName, setSearchName] = useState('');
    const [searchGroup, setSearchGroup] = useState('');
    const [selectedDate, setSelectedDate] = useState<DateRange<Dayjs>>([null, null]);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });

    const totalRecords = filteredData.length;
    const totalPages = Math.ceil(totalRecords / recordsPerPage);

    const paginatedData = filteredData.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
    );

    const truncateString = (str: string, length: number) => {
        if (str.length > length) {
            return str.substring(0, length) + '...';
        }
        return str;
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const datePickerStyles = {
        width: '100%',
        maxWidth: '800px',
        mx: 'auto',
        my: 4,
        '& .MuiPickersLayout-root': {
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1f2937' : '#fff',
            color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#1f2937',
            borderRadius: '0.5rem',
        },
        // Calendar header styling
        '& .MuiPickersCalendarHeader-root': {
            bgcolor: 'transparent',
            color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#1f2937',
            pl: 2,
            pr: 2,
        },
        '& .MuiPickersCalendarHeader-label': {
            color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#1f2937',
            fontSize: '1.1rem',
            fontWeight: 'bold',
        },
        // Calendar weekday header
        '& .MuiDayCalendar-header': {
            bgcolor: 'transparent',
            color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#1f2937',
        },
        '& .MuiDayCalendar-weekDayLabel': {
            color: (theme) => theme.palette.mode === 'dark' ? '#cbd5e1' : '#4b5563',
            fontSize: '0.9rem',
        },
        // Calendar days
        '& .MuiPickersDay-root': {
            color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#1f2937',
            fontSize: '0.9rem',
            backgroundColor: 'transparent',
            '&:hover': {
                bgcolor: (theme) => theme.palette.mode === 'dark' 
                    ? 'rgba(59, 130, 246, 0.2)' 
                    : 'rgba(59, 130, 246, 0.1)',
            },
            '&.Mui-selected': {
                bgcolor: (theme) => theme.palette.mode === 'dark' 
                    ? 'rgb(59, 130, 246)' 
                    : 'rgb(37, 99, 235)',
                color: '#fff',
                '&:hover': {
                    bgcolor: (theme) => theme.palette.mode === 'dark' 
                        ? 'rgb(29, 78, 216)' 
                        : 'rgb(30, 64, 175)',
                },
            },
            '&.MuiPickersDay-today': {
                border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? '#60a5fa' : '#3b82f6'}`,
                color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#1f2937',
            },
        },
        // Navigation arrows
        '& .MuiPickersArrowSwitcher-button': {
            color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#1f2937',
            '&:hover': {
                bgcolor: (theme) => theme.palette.mode === 'dark' 
                    ? 'rgba(59, 130, 246, 0.2)' 
                    : 'rgba(59, 130, 246, 0.1)',
            },
        },
        // Shortcuts panel
        '& .MuiPickersShortcuts-root': {
            mr: 0,
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#111827' : '#f3f4f6',
            borderRight: (theme) => `1px solid ${
                theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(0, 0, 0, 0.1)'
            }`,
            '& .MuiButtonBase-root': {
                color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#1f2937',
                justifyContent: 'flex-start',
                pl: 2,
                '&:hover': {
                    bgcolor: (theme) => theme.palette.mode === 'dark' 
                        ? 'rgba(59, 130, 246, 0.2)' 
                        : 'rgba(59, 130, 246, 0.1)',
                },
            },
        },
        // Main calendar
        '& .MuiDateRangeCalendar-root': {
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1f2937' : '#fff',
        },
        // Range selection styling
        '& .MuiDateRangePickerDay-rangeIntervalDayHighlight': {
            bgcolor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(59, 130, 246, 0.2)' 
                : 'rgba(59, 130, 246, 0.1)',
        },
        '& .MuiDateRangePickerDay-rangeIntervalPreview': {
            bgcolor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(59, 130, 246, 0.2)' 
                : 'rgba(59, 130, 246, 0.1)',
        },
        '& .MuiDateRangePickerDay-day.Mui-selected': {
            bgcolor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgb(59, 130, 246)' 
                : 'rgb(37, 99, 235)',
            color: '#fff',
        },
        // Day in range styling
        '& .MuiDateRangePickerDay-dayInsideRangeInterval': {
            bgcolor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(59, 130, 246, 0.2)' 
                : 'rgba(59, 130, 246, 0.1)',
            color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#1f2937',
        },
    };
        
    const shortcutsItems: PickersShortcutsItem<DateRange<Dayjs>>[] = [
        {
            label: 'This Week',
            getValue: () => {
                const today = dayjs();
                return [today.startOf('week'), today.endOf('week')];
            },
        },
        {
            label: 'Last Week',
            getValue: () => {
                const today = dayjs();
                const prevWeek = today.subtract(7, 'day');
                return [prevWeek.startOf('week'), prevWeek.endOf('week')];
            },
        },
        {
            label: 'Last 7 Days',
            getValue: () => {
                const today = dayjs();
                return [today.subtract(7, 'day'), today];
            },
        },
        {
            label: 'Current Month',
            getValue: () => {
                const today = dayjs();
                return [today.startOf('month'), today.endOf('month')];
            },
        },
        {
            label: 'Next Month',
            getValue: () => {
                const today = dayjs();
                const startOfNextMonth = today.endOf('month').add(1, 'day');
                return [startOfNextMonth, startOfNextMonth.endOf('month')];
            },
        },
        { label: 'Reset', getValue: () => [null, null] },
    ];

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch('/api/cms/attendance/data');
            const data = await res.json();
            setAttendanceData(data);
            setFilteredData(data);
        };
        fetchData();
    }, []);

    useEffect(() => {
        filterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchName, searchGroup, selectedDate]);

    const filterData = () => {
        let filtered = [...attendanceData];

        if (searchName) {
            filtered = filtered.filter((log) =>
                log.name.toLowerCase().includes(searchName.toLowerCase())
            );
        }

        if (searchGroup) {
            filtered = filtered.filter((log) =>
                log.group.toLowerCase().includes(searchGroup.toLowerCase())
            );
        }

        if (selectedDate && Array.isArray(selectedDate)) {
            const [startDate, endDate] = selectedDate;
            if (startDate && endDate) {
                filtered = filtered.filter((log) =>
                    dayjs(log.timestamp).isBetween(startDate, endDate, 'day', '[]')
                );
            }
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
                const res = await fetch(`/api/cms/attendance/data?id=${id}`, {
                    method: 'DELETE',
                });

                if (res.ok) {
                    setAttendanceData((prevData) => prevData.filter((log) => log._id !== id));
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

    const DatePickerWrapper = () => (
        <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-800 shadow-xl">
            <div className="absolute inset-0 bg-black/5 dark:bg-black/20"></div>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <StaticDateRangePicker
                    sx={datePickerStyles}
                    disableFuture
                    slotProps={{
                        shortcuts: {
                            items: shortcutsItems,
                            className: "backdrop-blur-sm",
                        },
                        actionBar: { actions: [] },
                    }}
                    calendars={1}
                    value={selectedDate}
                    onChange={(newValue) => setSelectedDate(newValue)}
                />
            </LocalizationProvider>
        </div>
    );

    return (
        <>
            {userHasAccess ? (
                <>
                    <div className="flex max-w-full h-[80vh] overflow-y-scroll dark:bg-gray-900 text-gray-800 dark:text-slate-200 flex-col bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
                        <div className="max-w-7xl mx-auto p-4">
                            <h2 className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-6">
                                Attendance Log
                            </h2>

                            {/* Filters Section */}
                            <div className="flex gap-4 mb-6 overflow-x-visible">
                                <input
                                    type="text"
                                    placeholder="Search Name"
                                    className="border border-gray-300 bg-transparent rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300 p-2 w-full"
                                    value={searchName}
                                    onChange={(e) => setSearchName(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Search Group"
                                    className="border border-gray-300 bg-transparent rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300 p-2 w-full"
                                    value={searchGroup}
                                    onChange={(e) => setSearchGroup(e.target.value)}
                                />
                            </div>
                            <button 
                                onClick={() => setShowDatePicker(prev => !prev)} 
                                className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
                            >
                                {showDatePicker ? (
                                    <>
                                        <i className="fa-regular fa-eye-slash"></i> Hide Date Filter
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-regular fa-eye"></i> Show Date Filter
                                    </>
                                )}
                            </button>
                            {showDatePicker && <DatePickerWrapper />}
                            {/* {showDatePicker && (
                                <div className='text-white'>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <StaticDateRangePicker
                                            sx={{ height: 300, overflowY: 'scroll', justifyContent: 'center' }}
                                            disableFuture
                                            slotProps={{
                                                shortcuts: {
                                                    items: shortcutsItems,
                                                },
                                                actionBar: { actions: [] },
                                            }}
                                            calendars={1}
                                            value={selectedDate}
                                            onChange={(newValue) => setSelectedDate(newValue)}
                                            className="shadow-md dark:bg-sky-800 bg-sky-500 mb-4"
                                        />
                                    </LocalizationProvider>
                                </div>
                            )} */}

                            {/* Table Section */}
                            <div className="overflow-x-auto mt-1">
                                <table className="min-w-full bg-white dark:bg-gray-800">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <TableHeader 
                                                title="Student" 
                                                sortKey="name" 
                                                sortConfig={sortConfig} 
                                                onSort={requestSort} 
                                            />
                                            <TableHeader 
                                                title="Group" 
                                                sortKey="group" 
                                                sortConfig={sortConfig} 
                                                onSort={requestSort} 
                                            />
                                            <TableHeader 
                                                title="Date" 
                                                sortKey="timestamp" 
                                                sortConfig={sortConfig} 
                                                onSort={requestSort} 
                                            />
                                            <th className="py-2 px-6">Attendance</th>
                                            <th className="py-2 px-6">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedData.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-4 text-center text-gray-500">
                                                    No records found for the applied filters.
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedData.map((log) => (
                                                <tr
                                                    key={log._id}
                                                    className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200"
                                                >
                                                    <td className="py-2 px-6 text-center">{truncateString(log.name, 15)}</td>
                                                    <td className="py-2 px-6 text-center">{log.group}</td>
                                                    <td className="py-2 px-6 text-center">
                                                        {dayjs(log.timestamp).format('YYYY-MM-DD')}
                                                    </td>
                                                    <td className="py-2 px-6 text-center">
                                                        {log.attended ? 'Present' : 'Absent'}
                                                    </td>
                                                    <td className="py-2 px-6 text-center">
                                                        <button
                                                            onClick={() => handleDelete(log._id)}
                                                            className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-700"
                                                        >
                                                            <i className="fa fa-trash"></i>
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
                </>
            ) : (
                <div className="flex h-[80vh] items-center justify-center">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white text-center">
                        You are not authorized to view this page.
                    </h2>
                </div>
            )}
        </>
    );
};

const AttendanceLog = () => {
    const { data: session } = useSession();
    const userRoles = session?.user?.role || [];
    const userHasAccess = userRoles.some(role =>
        ['superadmin', 'admin', 'homeroom'].includes(role)
    );

    return <AttendanceTable userHasAccess={userHasAccess} />;
};

export default AttendanceLog;
