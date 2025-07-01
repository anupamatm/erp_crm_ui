import { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, Plus, CheckCircle, XCircle, Users, User, Search, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import LeaveRequestModal from '../../components/HR/LeaveRequestModal';
import { useAuth } from '../../lib/auth';
import { leaveService } from '../../services/hr/leaveService';
import { EmployeeLeaveRequest } from '../../types/leave';

// UI Components
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

// Custom Components
import { 
  Dialog, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter, 
  DialogContent 
} from '../../components/ui/CustomDialog';

import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '../../components/ui/CustomTable';

type LeaveType = 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity';

interface User {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  // Add any other user properties that might be used
  [key: string]: any; // Allow any other properties
}

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  position?: string;
  department?: string;
  name?: string; // For backward compatibility
  email?: string;
  role?: string;
}

// Helper function to format dates
function formatDate(dateString: string | Date) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Helper functions for styling
function getStatusColor(status: 'pending' | 'approved' | 'rejected') {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'pending':
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
}

function getStatusIcon(status: 'pending' | 'approved' | 'rejected') {
  switch (status.toLowerCase()) {
    case 'approved':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'pending':
    default:
      return <Clock className="h-4 w-4 text-yellow-500" />;
  }
};

// State is now managed with individual useState hooks

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  employeeId: string;
  department?: string;
  position?: string;
}

const LeaveManagement: FC = () => {
  const { user: authUser, loading: authLoading, error: authError } = useAuth();
  const user = authUser as User;
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<EmployeeLeaveRequest[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCreatingForOthers, setIsCreatingForOthers] = useState(false);
  
    // APIEmployee type is the same as Employee, so we can reuse the Employee interface

  // Define the leave request type from the API
  interface APILeaveRequest {
    _id: string;
    employee: Employee | string;
    status: 'pending' | 'approved' | 'rejected';
    type: LeaveType;
    days: number;
    reason: string;
    approvedBy: string;
    appliedDate: string | Date;
    startDate: string | Date;
    endDate: string | Date;
    comments?: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
  }

  // Define the frontend leave request type
  interface EmployeeLeaveRequest {
    _id: string;
    employeeId: string;
    employeeName: string;
    type: LeaveType;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    appliedDate: string;
    approvedBy: string;
    comments?: string;
    // Add any other missing properties that might be needed
    employee?: Employee | string;
  }
  
  console.log('Current user:', user); // Debug log

  // Fetch data on component mount and when user changes
  useEffect(() => {
    const fetchData = async () => {
      console.log('Fetching data for user:', user?.id);
      
      if (!user?.id) {
        console.warn('No user ID available for fetching leave data');
        setError('You must be logged in to view leave data');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Calling leaveService.getAll...');
        const response = await leaveService.getAll({ employeeId: user.id }) as APILeaveRequest[];
        console.log('API Response:', response);
        
        if (!Array.isArray(response)) {
          console.error('Unexpected response format:', response);
          setError('Invalid data format received from server');
          return;
        }

        const formattedLeaves: EmployeeLeaveRequest[] = response.map(leave => {
          const employeeId = typeof leave.employee === 'string' 
            ? leave.employee 
            : leave.employee?._id || '';
            
          const employeeName = typeof leave.employee === 'string'
            ? 'Employee'
            : leave.employee
              ? `${leave.employee.firstName || ''} ${leave.employee.lastName || ''}`.trim() || 'Employee'
              : 'Employee';
              
          return {
            _id: leave._id,
            employeeId,
            employeeName,
            startDate: new Date(leave.startDate).toISOString().split('T')[0],
            endDate: new Date(leave.endDate).toISOString().split('T')[0],
            appliedDate: new Date(leave.appliedDate).toISOString(),
            status: leave.status,
            type: leave.type,
            days: leave.days,
            reason: leave.reason,
            approvedBy: leave.approvedBy,
            comments: leave.comments,
            employee: leave.employee // Keep the original employee data
          };
        });
        
        setRequests(formattedLeaves);
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError(`Failed to load leave data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const handleNewLeave = async (leaveData: {
    type: string;
    startDate: string | Date;
    endDate: string | Date;
    reason: string;
    days: number;
    employeeId?: string; // For HR creating leave for others
  }) => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Prepare leave data for the API
      const leaveRequest = {
        ...leaveData,
        employee: leaveData.employeeId || user.id, // Use selected employee ID or current user's ID
        status: 'pending',
        appliedDate: new Date().toISOString(),
      };

      // Call the API to create the leave request
      const response = await leaveService.create(leaveRequest);
      
      // Add the new leave to the requests list
      setRequests(prev => [
        {
          ...response.data,
          employeeName: leaveData.employeeId 
            ? teamMembers.find(m => m._id === leaveData.employeeId)?.name || 'Employee'
            : user.name || 'You',
        },
        ...prev
      ]);
      
      // Close the modal and reset form
      setIsModalOpen(false);
      setIsCreatingForOthers(false);
      
    } catch (err) {
      console.error('Error creating leave request:', err);
      setError('Failed to create leave request');
    } finally {
      setIsSubmitting(false);
    }
    console.log('Submitting leave request with user:', user);
    
    if (authLoading) {
      setError('Please wait while we verify your authentication status...');
      setIsSubmitting(false);
      return;
    }
    
    if (authError) {
      setError('Authentication error: ' + authError);
      setIsSubmitting(false);
      return;
    }
    
    if (!user?.id) {
      console.error('No user ID found in user object:', user);
      setError('You must be logged in to submit a leave request. Please sign in and try again.');
      setIsSubmitting(false);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Format dates as YYYY-MM-DD for the backend
      const formatDateForBackend = (date: string | Date) => {
        const d = new Date(date);
        return d.toISOString().split('T')[0];
      };

      // Prepare the leave request data for the API
      const leaveRequestData = {
        ...leaveData,
        startDate: formatDateForBackend(leaveData.startDate),
        endDate: formatDateForBackend(leaveData.endDate),
        employee: user.id, // Send only the employee ID
        status: 'pending' as const,
        appliedDate: new Date().toISOString(),
        approvedBy: '',
        days: leaveData.days || 1,
        reason: leaveData.reason || '',
        type: leaveData.type || 'vacation' as LeaveType,
        comments: leaveData.comments || ''
      };

      console.log('Submitting leave request:', leaveRequestData);
      
      // Call the API to create the leave request
      const newLeave = await leaveService.create(leaveRequestData) as APILeaveRequest;
      console.log('Leave request created:', newLeave);

      // Get user's name from the user object or use a default
      const userName = user.name || (user as any).fullName || 'Employee';
      const [firstName, lastName] = userName.split(' ');
      const employeeId = (user as any).employeeId || '';

      // Format the new leave for the UI
      const employeeLeaveRequest: EmployeeLeaveRequest = {
        _id: newLeave._id,
        employeeId: user.id,
        employeeName: userName,
        startDate: formatDateForBackend(newLeave.startDate),
        endDate: formatDateForBackend(newLeave.endDate),
        appliedDate: new Date(newLeave.appliedDate).toISOString(),
        status: newLeave.status,
        approvedBy: newLeave.approvedBy || '',
        type: newLeave.type,
        days: newLeave.days || 1,
        reason: newLeave.reason || '',
        comments: newLeave.comments,
        employee: {
          _id: user.id,
          firstName: firstName || '',
          lastName: lastName || '',
          employeeId: employeeId,
          name: userName
        }
      };

      // Update the state with the new leave request
      setRequests(prev => [employeeLeaveRequest, ...prev]);
      setIsModalOpen(false);
      setIsSubmitting(false);

      // Show success message
      alert('Leave request submitted successfully!');
    } catch (err) {
      console.error('Error creating leave request:', err);
      setError('Failed to create leave request. ' + (err instanceof Error ? err.message : 'Please try again later.'));
      setIsSubmitting(false);
    }  
  };

  const handleCancelLeave = async (leaveId: string) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) {
      return;
    }

    try {
      setIsCanceling(true);
      setError(null);
      
      await leaveService.delete(leaveId);
      
      // Update the state to remove the canceled leave
      setRequests(prev => prev.filter(req => req._id !== leaveId));
    } catch (err) {
      console.error('Error canceling leave request:', err);
      setError('Failed to cancel leave request. ' + (err instanceof Error ? err.message : 'Please try again later.'));
    } finally {
      setIsCanceling(false);
    };
  };

  // Check if user is admin on component mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user?.role === 'admin' || user?.role === 'hr') {
        setIsAdmin(true);
        await fetchTeamMembers();
      }
    };
    checkAdminStatus();
  }, [user]);

  // Fetch team members for HR/admin
  const fetchTeamMembers = async () => {
    try {
      // Replace with actual API call to fetch team members
      // const response = await hrService.getTeamMembers();
      // setTeamMembers(response.data);
      
      // Mock data for demonstration
      setTeamMembers([
        { _id: '1', name: 'John Doe', email: 'john@example.com', employeeId: 'EMP001', department: 'Engineering' },
        { _id: '2', name: 'Jane Smith', email: 'jane@example.com', employeeId: 'EMP002', department: 'HR' },
      ]);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError('Failed to load team members');
    }
  };

  // Filter requests based on status, type, and search query
  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      const statusMatch = filterStatus === 'all' || request.status === filterStatus;
      const typeMatch = filterType === 'all' || request.type === filterType;
      const employeeMatch = selectedEmployee === 'all' || request.employeeId === selectedEmployee;
      const searchMatch = searchQuery === '' || 
        (request.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         request.reason?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return statusMatch && typeMatch && employeeMatch && searchMatch;
    });
  }, [requests, filterStatus, filterType, selectedEmployee, searchQuery]);

  const stats = useMemo(() => ({
    total: 21,
    used: requests.filter((req: EmployeeLeaveRequest) => req.status === 'approved')
      .reduce((sum: number, req: EmployeeLeaveRequest) => sum + (req.days || 0), 0),
    pending: requests.filter((req: EmployeeLeaveRequest) => req.status === 'pending').length,
    remaining: 21 - requests
      .filter((req: EmployeeLeaveRequest) => req.status === 'approved')
      .reduce((sum: number, req: EmployeeLeaveRequest) => sum + (req.days || 0), 0),
  }), [requests]);

  const getTypeColor = (type: LeaveType) => {
    switch (type) {
      case 'sick':
        return 'bg-blue-100 text-blue-800';
      case 'vacation':
        return 'bg-purple-100 text-purple-800';
      case 'personal':
        return 'bg-indigo-100 text-indigo-800';
      case 'maternity':
      case 'paternity':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-4">Loading user session...</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-4">Loading leave requests...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border-l-4 border-red-400 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <LeaveRequestModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleNewLeave}
        />
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No leave records found</h3>
            <p className="text-gray-500 mb-6">You haven't applied for any leave yet.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Leave Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 m-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Clock className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-2 text-gray-600">Loading employee data...</span>
      </div>
    );
  }

  // Toggle between creating leave for self or others
  const openCreateModal = (forOthers = false) => {
    setIsCreatingForOthers(forOthers);
    setIsModalOpen(true);
  };

  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'destructive';
      case 'pending': return 'warning';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <LeaveRequestModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsCreatingForOthers(false);
        }}
        onSubmit={handleNewLeave}
        isAdmin={isAdmin}
        isCreatingForOthers={isCreatingForOthers}
        teamMembers={teamMembers}
      />
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
            <p className="text-gray-600 mt-1">
              {isAdmin ? 'Manage team leave requests and approvals' : 'Manage your leave requests and track their status'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {isAdmin && (
              <>
                <Button 
                  onClick={() => openCreateModal(false)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Leave for Me
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => openCreateModal(true)}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Create for Team Member
                </Button>
              </>
            )}
            {!isAdmin && (
              <Button 
                onClick={() => openCreateModal(false)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Leave Request
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="search"
                type="text"
                placeholder="Search by name or reason..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Employee Filter (for HR/Admin) */}
          {isAdmin && (
            <div>
              <label htmlFor="employee-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Employee
              </label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  <SelectItem value={user.id}>Me</SelectItem>
                  {teamMembers.map(member => (
                    <SelectItem key={member._id} value={member._id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Status Filter */}
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type Filter */}
          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type
            </label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="vacation">Vacation</SelectItem>
                <SelectItem value="sick">Sick Leave</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="maternity">Maternity</SelectItem>
                <SelectItem value="paternity">Paternity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'Total Leave Days', 
            value: stats.total, 
            icon: <Calendar className="w-5 h-5 text-blue-500" />,
            description: 'Your total allocated leave days'
          },
          { 
            label: 'Used This Year', 
            value: stats.used, 
            icon: <CheckCircle className="w-5 h-5 text-green-500" />,
            description: 'Days used this year'
          },
          { 
            label: 'Pending Approval', 
            value: stats.pending, 
            icon: <Clock className="w-5 h-5 text-yellow-500" />,
            description: 'Requests awaiting approval'
          },
          { 
            label: 'Remaining', 
            value: stats.remaining, 
            icon: <Calendar className="w-5 h-5 text-gray-500" />,
            description: 'Days remaining this year'
          },
        ].map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="p-2 rounded-full bg-gray-50">
                {stat.icon}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{stat.description}</p>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Requests</p>
              <p className="text-2xl font-bold text-yellow-600">
                {requests.filter((req) => req.status === 'pending').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Awaiting approval from manager</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Approved Requests</p>
              <p className="text-2xl font-bold text-green-600">
                {requests.filter((req) => req.status === 'approved').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Approved by your manager</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Rejected Requests</p>
              <p className="text-2xl font-bold text-red-600">
                {requests.filter((req) => req.status === 'rejected').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Not approved by manager</p>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Your Leave Requests</h2>
            <p className="text-sm text-gray-500">View and manage your leave history</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Leave Request
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="type-filter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="vacation">Vacation</option>
              <option value="sick">Sick Leave</option>
              <option value="personal">Personal</option>
              <option value="maternity">Maternity</option>
              <option value="paternity">Paternity</option>
            </select>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No leave requests found. Click "New Leave Request" to create one.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(
                          request.type
                        )}`}
                      >
                        {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                      </span>
                      <p className="text-sm text-gray-600">
                        {request.reason || 'No reason provided'}
                      </p>
                    </div>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">{request.reason}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {getStatusIcon(request.status)}
                      <span className="ml-1">
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </span>
                    {request.status === 'pending' && (
                      <button
                        onClick={() => handleCancelLeave(request._id)}
                        disabled={isCanceling}
                        className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                      >
                        {isCanceling ? 'Canceling...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
                  <div>Applied on: {formatDate(request.appliedDate || new Date())}</div>
                  {request.approvedBy && (
                    <div>Approved by: {request.approvedBy}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveManagement;
