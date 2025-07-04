import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Search, Filter, Download } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { attendanceService } from '../../services/hrService';

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'on-leave';
  workingHours?: string;
}

const AttendanceHistory: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'thisMonth',
  });

  // Generate mock attendance data for the selected month
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        
        // In a real app, you would fetch this from your API
        // const data = await attendanceService.getEmployeeAttendance('emp123', {
        //   startDate: format(startOfMonth(selectedMonth), 'yyyy-MM-dd'),
        //   endDate: format(endOfMonth(selectedMonth), 'yyyy-MM-dd')
        // });
        
        // Mock data for demonstration
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const daysInMonth = eachDayOfInterval({
          start: startOfMonth(selectedMonth),
          end: endOfMonth(selectedMonth)
        });
        
        const mockAttendance = daysInMonth.map((date, index) => {
          // Skip weekends (0 = Sunday, 6 = Saturday)
          if (date.getDay() === 0 || date.getDay() === 6) {
            return {
              id: `att-${date.getTime()}`,
              date: date.toISOString(),
              status: 'absent' as const,
              checkIn: undefined,
              checkOut: undefined,
              workingHours: '0h 0m'
            };
          }
          
          // Randomly generate attendance data for weekdays
          const statuses: Array<'present' | 'late' | 'half-day' | 'on-leave'> = 
            ['present', 'present', 'present', 'present', 'late', 'half-day', 'on-leave'];
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          
          let checkIn, checkOut, workingHours;
          
          if (status === 'present' || status === 'late') {
            // Normal working hours (between 9 AM and 6 PM)
            const checkInHour = status === 'late' ? 10 + Math.floor(Math.random() * 3) : 9;
            const checkInMinute = Math.floor(Math.random() * 60);
            const checkOutHour = checkInHour + 8 + Math.floor(Math.random() * 2);
            const checkOutMinute = Math.floor(Math.random() * 60);
            
            checkIn = new Date(date);
            checkIn.setHours(checkInHour, checkInMinute, 0);
            
            checkOut = new Date(date);
            checkOut.setHours(checkOutHour, checkOutMinute, 0);
            
            const diffMs = checkOut.getTime() - checkIn.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const hours = Math.floor(diffMins / 60);
            const mins = diffMins % 60;
            workingHours = `${hours}h ${mins}m`;
          } else if (status === 'half-day') {
            // Half day (4-5 hours)
            const checkInHour = 9;
            const checkInMinute = Math.floor(Math.random() * 60);
            const checkOutHour = checkInHour + 4 + Math.floor(Math.random() * 2);
            const checkOutMinute = Math.floor(Math.random() * 60);
            
            checkIn = new Date(date);
            checkIn.setHours(checkInHour, checkInMinute, 0);
            
            checkOut = new Date(date);
            checkOut.setHours(checkOutHour, checkOutMinute, 0);
            
            workingHours = '4h 30m'; // Approximate for half day
          }
          
          return {
            id: `att-${date.getTime()}`,
            date: date.toISOString(),
            status,
            checkIn: checkIn?.toISOString(),
            checkOut: checkOut?.toISOString(),
            workingHours: workingHours || '0h 0m'
          };
        });
        
        setAttendance(mockAttendance);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttendance();
  }, [selectedMonth]);

  const handleMonthChange = (increment: number) => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + increment);
    setSelectedMonth(newDate);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredAttendance = attendance.filter(record => {
    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const formattedDate = format(new Date(record.date), 'MMMM d, yyyy');
      if (!formattedDate.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    // Apply status filter
    if (filters.status !== 'all' && record.status !== filters.status) {
      return false;
    }
    
    return true;
  });

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      present: 'bg-green-100 text-green-800',
      late: 'bg-yellow-100 text-yellow-800',
      absent: 'bg-red-100 text-red-800',
      'half-day': 'bg-blue-100 text-blue-800',
      'on-leave': 'bg-purple-100 text-purple-800'
    };
    
    const statusText = status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'}`}>
        {statusText}
      </span>
    );
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Day', 'Status', 'Check In', 'Check Out', 'Working Hours'];
    const csvContent = [
      headers.join(','),
      ...filteredAttendance.map(record => {
        const date = new Date(record.date);
        return [
          `"${format(date, 'MMM d, yyyy')}"`,
          `"${format(date, 'EEEE')}"`,
          `"${record.status}"`,
          `"${record.checkIn ? format(new Date(record.checkIn), 'hh:mm a') : '--'}"`,
          `"${record.checkOut ? format(new Date(record.checkOut), 'hh:mm a') : '--'}"`,
          `"${record.workingHours || '--'}"`
        ].join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_${format(selectedMonth, 'MMMM_yyyy')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance History</h1>
          <p className="text-gray-600">View and track your attendance records</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="half-day">Half Day</option>
              <option value="on-leave">On Leave</option>
              <option value="absent">Absent</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleMonthChange(-1)}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium">
              {format(selectedMonth, 'MMMM yyyy')}
            </div>
            <button
              onClick={() => handleMonthChange(1)}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div>
            <select
              name="dateRange"
              value={filters.dateRange}
              onChange={handleFilterChange}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
            >
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="last3Months">Last 3 Months</option>
              <option value="thisYear">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Calendar View */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Calendar View</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay() }).map((_, index) => (
              <div key={`empty-${index}`} className="h-16"></div>
            ))}
            
            {eachDayOfInterval({
              start: startOfMonth(selectedMonth),
              end: endOfMonth(selectedMonth)
            }).map((date, index) => {
              const dayAttendance = attendance.find(a => 
                isSameDay(new Date(a.date), date)
              );
              
              const isToday = isSameDay(date, new Date());
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              
              return (
                <div 
                  key={date.toISOString()}
                  className={`h-16 p-1 border rounded ${isToday ? 'border-blue-500' : 'border-gray-200'} ${isWeekend ? 'bg-gray-50' : 'bg-white'}`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-xs font-medium ${isToday ? 'bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center' : 'text-gray-700'}`}>
                      {date.getDate()}
                    </span>
                    {dayAttendance && (
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        dayAttendance.status === 'present' ? 'bg-green-500' :
                        dayAttendance.status === 'late' ? 'bg-yellow-500' :
                        dayAttendance.status === 'absent' ? 'bg-red-500' :
                        dayAttendance.status === 'half-day' ? 'bg-blue-500' : 'bg-purple-500'
                      }`}></span>
                    )}
                  </div>
                  {dayAttendance && (
                    <div className="text-xs mt-1 truncate">
                      {dayAttendance.status === 'present' && 'Present'}
                      {dayAttendance.status === 'late' && 'Late'}
                      {dayAttendance.status === 'absent' && 'Absent'}
                      {dayAttendance.status === 'half-day' && 'Half Day'}
                      {dayAttendance.status === 'on-leave' && 'On Leave'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Attendance Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Day
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Out
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Working Hours
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendance.length > 0 ? (
                filteredAttendance.map((record) => {
                  const date = new Date(record.date);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  
                  return (
                    <tr key={record.id} className={isWeekend ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {format(date, 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(date, 'EEEE')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(record.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.checkIn ? format(new Date(record.checkIn), 'hh:mm a') : '--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.checkOut ? format(new Date(record.checkOut), 'hh:mm a') : '--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.workingHours || '--'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No attendance records found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                <span className="font-medium">{filteredAttendance.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  1
                </button>
                <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  2
                </button>
                <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  3
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistory;
