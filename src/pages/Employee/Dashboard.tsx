import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, User, Calendar, Clock4 } from 'lucide-react';
import { format } from 'date-fns';
import { attendanceService } from '../../services/hrService';
import { toast } from 'react-toastify';

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
}

const EmployeeDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const navigate = useNavigate();
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    // In a real app, you would fetch the current user from your auth context or API
    const fetchUser = async () => {
      try {
        // Replace with actual user fetch
        const userData = await fetchCurrentUser();
        setUser(userData);
        await fetchTodayAttendance(userData.id);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const fetchCurrentUser = async () => {
    // Mock user - replace with actual API call
    return {
      id: 'emp123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      position: 'Software Developer',
      department: 'Engineering',
      joinDate: '2023-01-15',
    };
  };

  const fetchTodayAttendance = async (employeeId: string) => {
    try {
      const attendance = await attendanceService.getEmployeeAttendance(employeeId, today);
      setTodayAttendance(attendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setTodayAttendance(null);
    }
  };

  const handleCheckIn = async () => {
    if (!user) return;
    
    try {
      setIsCheckingIn(true);
      const currentTime = new Date().toISOString();
      await attendanceService.markAttendance({
        employeeId: user.id,
        date: today,
        checkIn: currentTime,
        status: 'present'
      });
      
      await fetchTodayAttendance(user.id);
      toast.success('Checked in successfully!');
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error('Failed to check in');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user || !todayAttendance) return;
    
    try {
      setIsCheckingIn(true);
      const currentTime = new Date().toISOString();
      await attendanceService.updateAttendance(todayAttendance.id, {
        checkOut: currentTime
      });
      
      await fetchTodayAttendance(user.id);
      toast.success('Checked out successfully!');
    } catch (error) {
      console.error('Error checking out:', error);
      toast.error('Failed to check out');
    } finally {
      setIsCheckingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user?.firstName} {user?.lastName}</h2>
              <p className="text-gray-600">{user?.position}</p>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Employee ID</span>
              <span className="font-medium">{user?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Department</span>
              <span className="font-medium">{user?.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Join Date</span>
              <span className="font-medium">
                {user?.joinDate ? format(new Date(user.joinDate), 'MMM d, yyyy') : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Attendance Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Today's Attendance</h2>
            <div className="flex items-center text-gray-500">
              <Calendar className="h-5 w-5 mr-2" />
              <span>{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <div className="flex justify-between items-center mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">Check In</p>
                <p className="text-2xl font-semibold">
                  {todayAttendance?.checkIn ? format(new Date(todayAttendance.checkIn), 'hh:mm a') : '--:--'}
                </p>
              </div>
              <div className="h-1 w-16 bg-gray-200 mx-4"></div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Check Out</p>
                <p className="text-2xl font-semibold">
                  {todayAttendance?.checkOut ? format(new Date(todayAttendance.checkOut), 'hh:mm a') : '--:--'}
                </p>
              </div>
            </div>

            {!todayAttendance?.checkIn ? (
              <button
                onClick={handleCheckIn}
                disabled={isCheckingIn}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg w-full flex items-center justify-center space-x-2"
              >
                {isCheckingIn ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <Clock4 className="h-5 w-5" />
                    <span>Check In</span>
                  </>
                )}
              </button>
            ) : !todayAttendance.checkOut ? (
              <button
                onClick={handleCheckOut}
                disabled={isCheckingIn}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg w-full flex items-center justify-center space-x-2"
              >
                {isCheckingIn ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <Clock className="h-5 w-5" />
                    <span>Check Out</span>
                  </>
                )}
              </button>
            ) : (
              <div className="bg-green-50 text-green-700 p-3 rounded-lg">
                <p className="font-medium">You've completed your attendance for today.</p>
                <p className="text-sm">Thank you!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Attendance</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Hours</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((item) => (
                <tr key={item} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(Date.now() - item * 24 * 60 * 60 * 1000), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Present
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    09:00 AM
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    06:00 PM
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    9h 0m
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
