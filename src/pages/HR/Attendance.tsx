import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { attendanceService, departmentService } from '../../services/hrService';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, AlertCircle, Loader2, Clock4, CalendarClock, Download, Clock } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600 mt-2`}>{value}</p>
        </div>
        <div className={`p-3 bg-${color}-50 rounded-full`}>
          {icon}
        </div>
      </div>
    </div>
  );
};



interface Department {
  id?: string;
  name: string;
  [key: string]: any;
}

// Define our own Employee type that matches the backend structure
interface Attendance {
  id: string;
  employeeId: string;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'on-leave';
  checkIn?: string;
  checkOut?: string;
  workingHours?: string;
  date: string;
}

interface Employee {
  id?: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string | Department;
  position: string;
  status?: 'present' | 'absent' | 'late' | 'half-day' | 'on-leave' | 'active' | 'inactive' | 'terminated';
  checkIn?: string;
  checkOut?: string;
  workingHours?: string;
  attendanceId?: string;
  name?: string;
}

interface AttendanceStats {
  present: number;
  late: number;
  absent: number;
  'half-day': number;
  'on-leave': number;
  total: number;
  [key: string]: number;
}

const Attendance: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refetch, setRefetch] = useState(false);
  const [stats, setStats] = useState<AttendanceStats>({
    present: 0,
    late: 0,
    absent: 0,
    'half-day': 0,
    'on-leave': 0,
    total: 0
  });
  
  // Type guard to check if department is a string or Department object
  const getDepartmentName = useCallback((dept: string | Department): string => {
    return typeof dept === 'string' ? dept : dept?.name || 'N/A';
  }, []);

  const calculateStats = useCallback((employees: Employee[]) => {
    const newStats: AttendanceStats = {
      present: 0,
      late: 0,
      absent: 0,
      'half-day': 0,
      'on-leave': 0,
      total: employees.length
    };

    employees.forEach(emp => {
      if (emp.status === 'present') newStats.present++;
      else if (emp.status === 'late') newStats.late++;
      else if (emp.status === 'absent') newStats.absent++;
      else if (emp.status === 'half-day') newStats['half-day']++;
      else if (emp.status === 'on-leave') newStats['on-leave']++;
    });

    return newStats;
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const depts = await departmentService.getAll();
        setDepartments(depts);
      } catch (err) {
        console.error('Error fetching departments:', err);
        toast.error('Failed to load departments');
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const summaryData = await attendanceService.getSummary(selectedDate);
        setEmployees(summaryData);
      } catch (err) {
        console.error('Error fetching attendance summary:', err);
        setError('Failed to load attendance data. Please try again.');
        toast.error('Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate, refetch]);

  useEffect(() => {
    const currentEmployees = selectedDepartment ? employees.filter(emp => getDepartmentName(emp.department) === selectedDepartment) : employees;
    const newStats = calculateStats(currentEmployees);
    setStats(newStats);
  }, [employees, selectedDepartment, calculateStats, getDepartmentName]);

  // Filter employees by selected department and search query
  const handleClockIn = async () => {
    try {
      const response = await attendanceService.clockIn();
      toast.success(response.message || 'Clocked in successfully!');
      setRefetch(prev => !prev);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Clock in failed.');
    }
  };

  const handleClockOut = async () => {
    try {
      const response = await attendanceService.clockOut();
      toast.success(response.message || 'Clocked out successfully!');
      setRefetch(prev => !prev);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Clock out failed.');
    }
  };

  const filteredEmployees = useMemo(() => {
    let result = [...employees];
    
    // Filter by department if selected
    if (selectedDepartment) {
      result = result.filter(emp => 
        getDepartmentName(emp.department) === selectedDepartment
      );
    }
    
    // Filter by search query if provided
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(emp => 
        emp.firstName.toLowerCase().includes(query) ||
        emp.lastName.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query) ||
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [employees, selectedDepartment, searchQuery, getDepartmentName]);

  // Alias for consistency
  const displayEmployees = filteredEmployees;

  // Update stats when employees or filtered employees change
  useEffect(() => {
    const currentEmployees = selectedDepartment ? filteredEmployees : employees;
    const newStats = calculateStats(currentEmployees);
    setStats(newStats);
  }, [employees, filteredEmployees, selectedDepartment, calculateStats]);

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  }, []);

  const handleDepartmentChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartment(e.target.value);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleExport = useCallback(async () => {
    console.log('Exporting data...');
    try {
      const headers = ['Name', 'Email', 'Department', 'Position', 'Status', 'Check In', 'Check Out', 'Working Hours'];
      const data = [
        headers.join(','),
        ...displayEmployees.map(emp => [
          `"${emp.firstName} ${emp.lastName}"`,
          `"${emp.email}"`,
          `"${getDepartmentName(emp.department)}"`,
          `"${emp.position || ''}"`,
          `"${emp.status || ''}"`,
          `"${emp.checkIn || ''}"`,
          `"${emp.checkOut || ''}"`,
          `"${emp.workingHours || ''}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `attendance_${selectedDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export attendance data');
    }
  }, [displayEmployees, selectedDate]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'half-day': return 'bg-blue-100 text-blue-800';
      case 'on-leave': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);



  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="mt-1 text-sm text-gray-500">Manage and track employee attendance</p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pl-10 py-2"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div className="relative">
            <select
              value={selectedDepartment}
              onChange={handleDepartmentChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleExport}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          icon={<CheckCircle className="h-6 w-6 text-green-500" />}
          title="Present"
          value={stats.present}
          color="green"
        />
        <StatCard
          icon={<AlertCircle className="h-6 w-6 text-yellow-500" />}
          title="Late"
          value={stats.late}
          color="yellow"
        />
        <StatCard
          icon={<XCircle className="h-6 w-6 text-red-500" />}
          title="Absent"
          value={stats.absent}
          color="red"
        />
        <StatCard
          icon={<Clock4 className="h-6 w-6 text-blue-500" />}
          title="Half Day"
          value={stats['half-day']}
          color="blue"
        />
        <StatCard
          icon={<CalendarClock className="h-6 w-6 text-purple-500" />}
          title="On Leave"
          value={stats['on-leave']}
          color="purple"
        />
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Hours</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayEmployees.length > 0 ? (
                displayEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {`${employee.firstName?.[0] || ''}${employee.lastName?.[0] || ''}`.toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {`${employee.firstName || ''} ${employee.lastName || ''}`.trim()}
                          </div>
                          <div className="text-sm text-gray-500">{employee.email || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="text-sm text-gray-900">{getDepartmentName(employee.department)}</div>
                      {employee.position && (
                        <div className="text-sm text-gray-500">{employee.position}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(employee.status || '')}`}>
                        {employee.status ? employee.status.charAt(0).toUpperCase() + employee.status.slice(1) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <span>{employee.checkIn || '--:--'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.checkOut || '--:--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.workingHours || '0h 00m'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    {loading ? 'Loading...' : 'No attendance records found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {employees.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-gray-600">No employees found. Please add employees to the system.</p>
        </div>
      )}

      {/* Clock In/Out Widget */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Clock In/Out</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <Clock className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Clock In</h4>
            <p className="text-sm text-gray-600 mb-4">Start your work day</p>
            <button onClick={handleClockIn} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors">
              Clock In Now
            </button>
          </div>
          <div className="text-center p-6 bg-red-50 rounded-lg">
            <Clock className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Clock Out</h4>
            <p className="text-sm text-gray-600 mb-4">End your work day</p>
            <button onClick={handleClockOut} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors">
              Clock Out Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;