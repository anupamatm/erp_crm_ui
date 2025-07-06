import { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, CheckCircle, XCircle, Search, UserPlus, Loader2, Plus, FileText, Clock, ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LeaveRequestModal from '../../components/HR/LeaveRequestModal';
import { useAuth } from '../../lib/auth';
import { leaveService, LeaveRequest } from '../../services/hr/leaveService';

// UI Components
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { TabsList, TabsTrigger } from '../../components/ui/tabs';

// --- TYPE DEFINITIONS ---
type LeaveStatus = 'pending' | 'approved' | 'rejected';

interface TeamMember {
  _id: string;
  name: string;
}

interface MappedLeaveRequest extends LeaveRequest {
  employeeName: string;
}

// --- HELPER FUNCTIONS ---
const formatDate = (dateString: string | Date) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (error) {
    return 'Invalid Date';
  }
};

const getStatusColor = (status: LeaveStatus) => {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: LeaveStatus) => {
  switch (status) {
    case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
    case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
    default: return null;
  }
};

// --- SUB-COMPONENTS ---
const StatCard = ({ title, value, icon, colorClass }: { title: string; value: number; icon: React.ReactNode; colorClass: string }) => (
  <div className="bg-white p-5 rounded-lg shadow-sm flex items-center space-x-4">
    <div className={`p-3 rounded-full ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const LeaveRequestCard = ({ request, onUpdateStatus }: { request: MappedLeaveRequest; onUpdateStatus: (id: string, status: LeaveStatus) => void }) => (
  <div className="bg-white border rounded-lg p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-200">
    <div>
      <div className="flex justify-between items-start mb-3">
        <p className="font-semibold text-gray-900 text-lg">{request.employeeName}</p>
        {request.status && (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${getStatusColor(request.status)}`}>
            {getStatusIcon(request.status)}
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </span>
        )}
      </div>
      <div className="space-y-2 text-sm">
        <p className="text-gray-600">
          <strong className="font-medium text-gray-800">Type:</strong> {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
        </p>
        <p className="text-gray-600 flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
          {formatDate(request.startDate)} - {formatDate(request.endDate)} ({request.days}d)
        </p>
        {request.reason && <p className="text-gray-600 pt-2 border-t mt-2">{request.reason}</p>}
      </div>
    </div>
    {request.status === 'pending' && (
      <div className="mt-4 pt-4 border-t flex justify-end items-center space-x-2">
        <Button size="small" variant="outlined" color="success" onClick={() => onUpdateStatus(request._id, 'approved')}>
          <ThumbsUp className="h-4 w-4 mr-2" /> Approve
        </Button>
        <Button size="small" variant="outlined" color="error" onClick={() => onUpdateStatus(request._id, 'rejected')}>
          <ThumbsDown className="h-4 w-4 mr-2" /> Reject
        </Button>
      </div>
    )}
  </div>
);

// --- MAIN COMPONENT ---
const HRLeaveManagement: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<MappedLeaveRequest[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingForOther, setIsCreatingForOther] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | 'all'>('all');

  const isHR = useMemo(() => user?.role === 'admin' || user?.role === 'hr', [user]);

  const fetchData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const [requests, members] = await Promise.all([
        leaveService.getAll(),
        isHR ? leaveService.getTeamMembers() : Promise.resolve([])
      ]);

      const memberMap = new Map<string, string>();
      if (isHR) {
        members.forEach(m => memberMap.set(m._id, m.name));
        setTeamMembers(members);
      }
      if (user) {
        memberMap.set(user.id, user.name || 'Current User');
      }

      const mappedRequests = requests.map(req => {
        let employeeId: string | undefined;
        if (req.employee) {
          if (typeof req.employee === 'string') {
            employeeId = req.employee;
          } else if (typeof req.employee === 'object' && '_id' in req.employee && req.employee._id) {
            // Safely access _id after confirming the key exists
            employeeId = req.employee._id;
          }
        }
        return {
          ...req,
          employeeName: (employeeId ? memberMap.get(employeeId) : undefined) || 'Unknown Employee',
        };
      });

      setLeaveRequests(mappedRequests);
    } catch (err) {
      console.error('Failed to fetch leave data:', err);
      const errorMessage = 'Failed to load leave data. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, isHR]);

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, fetchData]);

  const openCreateModal = (forOther: boolean) => {
    setIsCreatingForOther(forOther);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data: Omit<LeaveRequest, '_id' | 'status' | 'employee'> & { employeeId?: string }) => {
    setIsSubmitting(true);
    try {
      const { employeeId, ...rest } = data;

      if (!employeeId) {
        toast.error('An employee must be selected to create a leave request.');
        setIsSubmitting(false);
        return;
      }

      const newRequest = {
        ...rest,
        employee: employeeId,
        status: 'pending' as const,
        appliedDate: new Date(),
      };

      await leaveService.create(newRequest);
      
      toast.success('Leave request submitted successfully!');
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to submit leave request:', err);
      toast.error('Failed to submit leave request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: LeaveStatus) => {
    try {
      const updatedRequest = await leaveService.update(id, { status });
      setLeaveRequests(prev =>
        prev.map(req => (req._id === id ? { ...req, ...updatedRequest } : req))
      );
      toast.success(`Leave request has been ${status}.`);
    } catch (err) {
      console.error(`Failed to ${status} leave request:`, err);
      toast.error(`Failed to ${status} leave request.`);
    }
  };

  const filteredRequests = useMemo(() => {
    return leaveRequests
      .filter(req => statusFilter === 'all' || req.status === statusFilter)
      .filter(req => 
        req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (req.reason && req.reason.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  }, [leaveRequests, statusFilter, searchTerm]);

  const summaryStats = useMemo(() => {
    return leaveRequests.reduce((acc, req) => {
      acc.total++;
      if (req.status) {
        acc[req.status] = (acc[req.status] || 0) + 1;
      }
      return acc;
    }, { total: 0, pending: 0, approved: 0, rejected: 0 });
  }, [leaveRequests]);

  if (authLoading || (loading && !error)) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => fetchData()} sx={{ mt: 2 }}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HR Leave Management</h1>
          <p className="text-gray-600 mt-1">Oversee and manage all employee leave requests.</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Button onClick={() => openCreateModal(false)} startIcon={<Plus className="h-4 w-4" />}>
            Apply for Self
          </Button>
          {isHR && (
            <Button variant="outlined" onClick={() => openCreateModal(true)} startIcon={<UserPlus className="h-4 w-4" />}>
              Create for Employee
            </Button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Requests" value={summaryStats.total} icon={<FileText className="h-6 w-6 text-blue-600" />} colorClass="bg-blue-100" />
        <StatCard title="Pending" value={summaryStats.pending} icon={<Clock className="h-6 w-6 text-yellow-600" />} colorClass="bg-yellow-100" />
        <StatCard title="Approved" value={summaryStats.approved} icon={<ThumbsUp className="h-6 w-6 text-green-600" />} colorClass="bg-green-100" />
        <StatCard title="Rejected" value={summaryStats.rejected} icon={<ThumbsDown className="h-6 w-6 text-red-600" />} colorClass="bg-red-100" />
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <TabsList>
            <TabsTrigger onClick={() => setStatusFilter('all')} data-state={statusFilter === 'all' ? 'active' : 'inactive'}>All</TabsTrigger>
            <TabsTrigger onClick={() => setStatusFilter('pending')} data-state={statusFilter === 'pending' ? 'active' : 'inactive'}>Pending</TabsTrigger>
            <TabsTrigger onClick={() => setStatusFilter('approved')} data-state={statusFilter === 'approved' ? 'active' : 'inactive'}>Approved</TabsTrigger>
            <TabsTrigger onClick={() => setStatusFilter('rejected')} data-state={statusFilter === 'rejected' ? 'active' : 'inactive'}>Rejected</TabsTrigger>
          </TabsList>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by name or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ '& .MuiInputBase-input': { paddingLeft: '2.5rem' } }}
            />
          </div>
        </div>
      </div>

      {filteredRequests.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredRequests.map(request => (
            <LeaveRequestCard key={request._id} request={request} onUpdateStatus={handleUpdateStatus} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">No leave requests found.</p>
        </div>
      )}

      {user && (
        <LeaveRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          userId={user.id}
          isCreatingForOther={isCreatingForOther}
          teamMembers={teamMembers}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default HRLeaveManagement;
