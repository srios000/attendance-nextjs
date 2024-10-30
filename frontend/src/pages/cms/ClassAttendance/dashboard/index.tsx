import { useState, useEffect } from 'react';
import NoAccess from '@/components/NoAccess';
import { useSession } from 'next-auth/react';
import { Line, Bar } from 'react-chartjs-2';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { StaticDateRangePicker } from '@mui/x-date-pickers-pro/StaticDateRangePicker';
import { DateRange } from '@mui/x-date-pickers-pro/models';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);


interface Student {
    _id: string;
    name: string;
    group: string;
}

interface AttendanceRecord {
    studentId: string;
    group: string;
    timestamp: string;
    attended: boolean;
    name: string;
}

interface Group {
    _id: string;
    name: string;
}

const RegisteredStudentList = () => {
    const { data: session } = useSession();
    const currentUser = session?.user;
    const userRoles = currentUser?.role || [];
    const userHasAccess = userRoles.some(role =>
        ['superadmin', 'admin', 'homeroom', 'user'].includes(role)
    );
    const [students, setStudents] = useState<Student[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [filteredAttendance, setFilteredAttendance] = useState<AttendanceRecord[]>([]);
    const [selectedDateRange, setSelectedDateRange] = useState<DateRange<Dayjs>>([null, null]);
    const [isLoading, setIsLoading] = useState(true);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const shortcutsItems = [
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

    const DatePickerWrapper = () => (
        <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-800 shadow-xl">
            <div className="absolute inset-0 bg-black bg-opacity-5 dark:bg-opacity-20"></div>
            <div className="relative">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                <StaticDateRangePicker
                        className="w-full max-w-4xl mx-auto my-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg [&_.MuiPickersCalendarHeader-label]:text-gray-900 [&_.MuiPickersCalendarHeader-label]:dark:text-white [&_.MuiDayCalendar-weekDayLabel]:text-gray-600 [&_.MuiDayCalendar-weekDayLabel]:dark:text-gray-300 [&_.MuiPickersDay-root]:text-gray-900 [&_.MuiPickersDay-root]:dark:text-white [&_.MuiDateRangePickerDay-day]:text-gray-900 [&_.MuiDateRangePickerDay-day]:dark:text-white [&_.MuiPickersDay-today]:border-blue-500 [&_.MuiDateRangePickerDay-rangeIntervalDayHighlight]:dark:bg-blue-900/50 [&_.MuiDateRangePickerDay-rangeIntervalPreview]:dark:bg-blue-900/30 [&_.Mui-selected]:bg-blue-600 [&_.Mui-selected]:text-white [&_.MuiChip-label]:text-gray-900 [&_.MuiChip-label]:dark:text-white [&_.MuiTypography-root]:text-gray-900 [&_.MuiTypography-root]:dark:text-white [&_.MuiPickersArrowSwitcher-button]:text-gray-900 [&_.MuiPickersArrowSwitcher-button]:dark:text-white"
                        disableFuture
                        value={selectedDateRange}
                        onChange={(newValue) => setSelectedDateRange(newValue)}
                        slotProps={{
                            shortcuts: {
                                items: shortcutsItems,
                                className: "backdrop-blur-sm bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 [&_button]:text-gray-700 [&_button]:dark:text-gray-200 [&_button:hover]:bg-blue-50 [&_button]:dark:hover:bg-blue-900/30",
                            },
                            actionBar: { actions: [] },
                            toolbar: {
                                className: "bg-transparent",
                            },
                            day: {
                                className: "transition-colors duration-200",
                            }
                        }}
                    />
                </LocalizationProvider>
            </div>
        </div>
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [groupRes, attendanceRes, studentRes] = await Promise.all([
                    fetch('/api/cms/group/data'),
                    fetch('/api/cms/attendance/data'),
                    fetch('/api/cms/students/data'),
                ]);
            
                const groupData: Group[] = await groupRes.json();
                const attendanceData: AttendanceRecord[] = await attendanceRes.json();
                const studentData: Student[] = await studentRes.json();
            
                setStudents(studentData);

                if (currentUser?.role.includes('homeroom')) {
                    const managedGroups = groupData.filter(group =>
                        currentUser.manage.some(managedGroup => 
                            managedGroup.toUpperCase() === group.name.toUpperCase()
                        )
                    );
                    setGroups(managedGroups);
                }else if (currentUser?.role.includes('user')) {
                    const managedGroups = groupData.filter(group =>
                        currentUser.manage.some(managedGroup => 
                            managedGroup.toUpperCase() === group.name.toUpperCase()
                        )
                    );
                    setGroups(managedGroups);
                } else if (currentUser?.role.includes('admin') || currentUser?.role.includes('superadmin')) {
                    setGroups(groupData);
                } else {
                    setGroups([]);
                }
                setAttendanceData(attendanceData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        if (session) { 
            fetchData();
        }
    }, [currentUser, session]);

    useEffect(() => {
        const groupAttendance = attendanceData.filter(
            (record: AttendanceRecord) => record.group === selectedGroup
        );
        setFilteredAttendance(groupAttendance);
    }, [selectedGroup, attendanceData]);

    if (!userHasAccess) return <NoAccess />;

    const calculateAttendanceRate = () => {
        if (!selectedGroup) return 0;
        
        const studentsInGroup = students.filter(student => student.group === selectedGroup);
        const totalStudents = studentsInGroup.length;
        
        if (totalStudents === 0) return 0;

        const attendedStudents = new Set(
            filteredAttendance
                .filter(record => record.attended)
                .map(record => record.name)
        );

        return Math.round((attendedStudents.size / totalStudents) * 100);
    };

    const attendanceTrends = (() => {
        if (!selectedGroup) return {
            labels: [],
            datasets: [{
                label: 'Attendance Trend (%)',
                data: [],
                fill: false,
                borderColor: 'rgba(75,192,192,1)',
                tension: 0.1,
            }]
        };

        const studentsInGroup = students.filter(student => student.group === selectedGroup);
        const totalStudents = studentsInGroup.length;

        if (totalStudents === 0) return {
            labels: [],
            datasets: [{
                label: 'Attendance Trend (%)',
                data: [],
                fill: false,
                borderColor: 'rgba(75,192,192,1)',
                tension: 0.1,
            }]
        };

        // Group attendance records by date
        const attendanceByDate = filteredAttendance.reduce((acc: Record<string, Set<string>>, record) => {
            const date = dayjs(record.timestamp).format('YYYY-MM-DD'); 
            if (!acc[date]) {
                acc[date] = new Set();
            }
            if (record.attended) {
                acc[date].add(record.name);
            }
            return acc;
        }, {});

        const dates = Object.keys(attendanceByDate).sort((a, b) => 
            dayjs(a).unix() - dayjs(b).unix()
        );
        

        const attendanceRates = dates.map(date => {
            const uniqueAttendees = attendanceByDate[date].size;
            return ((uniqueAttendees / totalStudents) * 100).toFixed(2);
        });

        return {
            labels: dates,
            datasets: [{
                label: 'Attendance Trend (%)',
                data: attendanceRates,
                fill: false,
                borderColor: 'rgba(75,192,192,1)',
                tension: 0.1,
            }]
        };
    })();

    const groupComparison = {
        labels: groups.map(group => group.name),
        datasets: [
            {
                label: 'Attendance Rate (%)',
                data: groups.map(group => {
                    const studentsInGroup = students.filter(student => student.group === group.name);
                    const totalStudents = studentsInGroup.length;
                    if (totalStudents === 0) return 0;    
                    let groupAttendance = attendanceData.filter(a => a.group === group.name);
                    const startDate = selectedDateRange[0];
                    const endDate = selectedDateRange[1];

                    if (startDate && endDate) {
                        groupAttendance = groupAttendance.filter(record => {
                            const recordDate = dayjs(record.timestamp).format('YYYY-MM-DD');
                            return recordDate >= startDate.format('YYYY-MM-DD') && 
                                recordDate <= endDate.format('YYYY-MM-DD');
                        });
                    }
    
                    if (groupAttendance.length === 0) return 0;
    
                    const uniqueAttendees = new Set(
                        groupAttendance
                            .filter(record => record.attended)
                            .map(record => record.name)
                    ).size;
    
                    return ((uniqueAttendees / totalStudents) * 100).toFixed(2);
                }),
                backgroundColor: 'rgba(153, 102, 255, 0.6)'
            }
        ]
    };
    
    const chartOptions = {
        scales: {
            y: {
                min: 0,
                max: 100,
                ticks: {
                    stepSize: 20
                }
            }
        }
    };
    
    return (
        <div className='flex max-w-full h-[80vh] overflow-y-scroll dark:bg-gray-900 flex-col bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800'>
            <div className="max-w-7xl mx-auto p-4">
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Class Attendance Dashboard</h2>

                <div className="mb-4">
                    {isLoading ? (
                        <div className="animate-pulse flex space-x-4">
                            <div className="h-10 w-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
                        </div>
                    ) : groups.length === 0 ? (
                        <p className="text-gray-700 dark:text-gray-300">No groups available for your account.</p>
                    ) : (
                        <select
                            className="border p-2 rounded bg-transparent text-gray-700 dark:text-gray-200"
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            value={selectedGroup}
                        >
                            <option className='dark:bg-slate-800' value="">Select Group</option>
                            {groups.map(group => (
                                <option 
                                    className='dark:bg-slate-800' 
                                    key={group._id} 
                                    value={group.name}
                                >
                                    {group.name.toUpperCase()}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {selectedGroup && !isLoading && (
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold dark:text-white text-slate-800">
                            Attendance Rate: {calculateAttendanceRate()}%
                        </h3>
                    </div>
                )}

                {!isLoading && (
                    <>
                        <div className="mb-6">
                            <Line data={attendanceTrends} options={chartOptions} />
                        </div>

                        <div className="mb-6">
                            <button 
                                onClick={() => setShowDatePicker(prev => !prev)} 
                                className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
                            >
                                {showDatePicker ? 'Hide Date Range' : 'Show Date Range'}
                            </button>
                            {showDatePicker && (
                                <div className="mb-8">
                                    <DatePickerWrapper />
                                </div>
                            )}
                            <Bar data={groupComparison} options={chartOptions} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default RegisteredStudentList;