import API from '../../api/api';

interface LeaveRequest {
  id?: string;
  employee: string;
  type: 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity';
  startDate: string | Date;
  endDate: string | Date;
  days: number;
  reason: string;
  status?: 'pending' | 'approved' | 'rejected';
  appliedDate?: string | Date;
  approvedBy?: string;
  approvedDate?: string | Date;
  comments?: string;
}

interface LeaveStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
  byType: {
    vacation: number;
    sick: number;
    personal: number;
    maternity: number;
    paternity: number;
  };
  totalDaysOff: number;
}

export const leaveService = {
  // Get all leave requests with optional filters
  getAll: async (filters: {
    status?: 'pending' | 'approved' | 'rejected';
    employeeId?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<LeaveRequest[]> => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.employeeId) params.append('employeeId', filters.employeeId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const url = `/api/hr/leaves?${params.toString()}`;
      console.log('Fetching leave requests from:', url);
      
      const response = await API.get(url);
      console.log('Leave requests response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching leave requests:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Status code:', error.response.status);
      }
      throw error;
    }
  },

  // Get a single leave request by ID
  getById: async (id: string): Promise<LeaveRequest> => {
    const response = await API.get(`/api/hr/leaves/${id}`);
    return response.data;
  },

  // Create a new leave request
  create: async (leaveData: Omit<LeaveRequest, 'id'>): Promise<LeaveRequest> => {
    const response = await API.post('/api/hr/leaves', leaveData);
    return response.data;
  },

  // Update a leave request (approve/reject)
  update: async (id: string, updateData: {
    status?: 'pending' | 'approved' | 'rejected';
    approvedBy?: string;
    comments?: string;
  }) => {
    const response = await API.put(`/api/hr/leaves/${id}`, updateData);
    return response.data;
  },

  // Delete a leave request
  delete: async (id: string) => {
    await API.delete(`/api/hr/leaves/${id}`);
  },

  // Get leave statistics - Currently not implemented in the backend
  // We'll calculate stats from the list of all leaves for now
  getStats: async (): Promise<LeaveStats> => {
    try {
      // First, get all leave requests
      const leaves = await leaveService.getAll();
      
      // Calculate stats
      const stats: LeaveStats = {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: leaves.length,
        byType: {
          vacation: 0,
          sick: 0,
          personal: 0,
          maternity: 0,
          paternity: 0,
        },
        totalDaysOff: 0,
      };
      
      leaves.forEach(leave => {
        // Count by status
        if (leave.status === 'pending') stats.pending++;
        else if (leave.status === 'approved') stats.approved++;
        else if (leave.status === 'rejected') stats.rejected++;
        
        // Count by type
        if (leave.type in stats.byType) {
          stats.byType[leave.type as keyof typeof stats.byType]++;
        }
        
        // Sum total days off for approved leaves
        if (leave.status === 'approved') {
          stats.totalDaysOff += leave.days || 0;
        }
      });
      
      return stats;
    } catch (error: any) {
      console.error('Error calculating leave stats:', error);
      // Return default stats in case of error
      return {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0,
        byType: {
          vacation: 0,
          sick: 0,
          personal: 0,
          maternity: 0,
          paternity: 0,
        },
        totalDaysOff: 0,
      };
    }
  },

  // Get leave balance for an employee
  getLeaveBalance: async (_employeeId: string) => {
    // This endpoint might not exist in the backend yet
    // For now, we'll return a default balance
    return {
      vacation: 15, // Default values
      sick: 10,
      personal: 5,
      maternity: 0,
      paternity: 0,
      total: 30,
      used: 0,
      remaining: 30
    };
    
    // Uncomment this when the backend endpoint is available
    // const response = await API.get(`/api/hr/leaves/balance/${employeeId}`);
    // return response.data;
  },
};
