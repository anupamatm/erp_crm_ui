import API from '../api/api';
import {
  Employee,
  Department,
  Attendance,
  LeaveRequest,
  PayrollRecord,
  PerformanceReview,
  Candidate,
} from '../types/HR';

const BASE_PATH = '/api/hr';

export const employeeService = {
  getAll: async (): Promise<Employee[]> => {
    try {
      // Use the basic employee list endpoint
      const res = await API.get(`${BASE_PATH}/employees/basic`);
      return res.data;
    } catch (error: any) {
      console.error('Error fetching employees:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error; // Re-throw to be handled by the component
    }
  },
  getById: async (id: string): Promise<Employee> => {
    const res = await API.get(`${BASE_PATH}/employees/${id}`);
    return res.data;
  },
  create: async (data: Omit<Employee, 'id'>): Promise<Employee> => {
    const res = await API.post(`${BASE_PATH}/employees`, data);
    return res.data;
  },
  update: async (id: string, data: Partial<Employee>): Promise<Employee> => {
    const res = await API.put(`${BASE_PATH}/employees/${id}`, data);
    return res.data;
  },
  remove: async (id: string): Promise<{ message: string }> => {
    const res = await API.delete(`${BASE_PATH}/employees/${id}`);
    return res.data;
  },
};

export const departmentService = {
  getAll: async (): Promise<Department[]> => {
    try {
      const res = await API.get(`${BASE_PATH}/departments`);
      console.log('Fetched departments:', res.data);
      return res.data;
    } catch (error: any) {
      console.error('Error fetching departments:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },
  getById: async (id: string): Promise<Department> => {
    try {
      const res = await API.get(`${BASE_PATH}/departments/${id}`);
      return res.data;
    } catch (error: any) {
      console.error(`Error fetching department ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },
  create: async (data: Omit<Department, 'id'>): Promise<Department> => {
    try {
      console.log('Creating department with data:', data);
      const res = await API.post(`${BASE_PATH}/departments`, data);
      console.log('Department created successfully:', res.data);
      return res.data;
    } catch (error: any) {
      console.error('Error creating department:', {
        message: error.message,
        requestData: data,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },
  update: async (id: string, data: Partial<Department>): Promise<Department> => {
    try {
      const res = await API.put(`${BASE_PATH}/departments/${id}`, data);
      return res.data;
    } catch (error: any) {
      console.error(`Error updating department ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },
  remove: async (id: string): Promise<{ message: string }> => {
    try {
      const res = await API.delete(`${BASE_PATH}/departments/${id}`);
      return res.data;
    } catch (error: any) {
      console.error(`Error deleting department ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },
};

export const attendanceService = {
  getAll: async (params?: any): Promise<Attendance[]> => {
    const res = await API.get(`${BASE_PATH}/attendance`, { params });
    return res.data;
  },
  clock: async (data: Partial<Attendance>): Promise<Attendance> => {
    const res = await API.post(`${BASE_PATH}/attendance/clock`, data);
    return res.data;
  },
  create: async (data: Partial<Attendance>): Promise<Attendance> => {
    const res = await API.post(`${BASE_PATH}/attendance`, data);
    return res.data;
  },
  update: async (id: string, data: Partial<Attendance>): Promise<Attendance> => {
    const res = await API.put(`${BASE_PATH}/attendance/${id}`, data);
    return res.data;
  },
};

export const leaveService = {
  getAll: async (params?: any): Promise<LeaveRequest[]> => {
    const res = await API.get(`${BASE_PATH}/leaves`, { params });
    return res.data;
  },
  create: async (data: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>): Promise<LeaveRequest> => {
    const res = await API.post(`${BASE_PATH}/leaves`, data);
    return res.data;
  },
  update: async (id: string, data: Partial<LeaveRequest>): Promise<LeaveRequest> => {
    const res = await API.put(`${BASE_PATH}/leaves/${id}`, data);
    return res.data;
  },
  remove: async (id: string): Promise<{ message: string }> => {
    const res = await API.delete(`${BASE_PATH}/leaves/${id}`);
    return res.data;
  },
};

export const payrollService = {
  getAll: async (params?: any): Promise<PayrollRecord[]> => {
    const res = await API.get(`${BASE_PATH}/payroll`, { params });
    return res.data;
  },
  process: async (data: { employeeIds: string[]; period: string }): Promise<{ message: string }> => {
    const res = await API.post(`${BASE_PATH}/payroll/process`, data);
    return res.data;
  },
};

export const performanceService = {
  getAll: async (): Promise<PerformanceReview[]> => {
    const res = await API.get(`${BASE_PATH}/performance/reviews`);
    return res.data;
  },
};

export const recruitmentService = {
  getAll: async (params?: any): Promise<Candidate[]> => {
    const res = await API.get(`${BASE_PATH}/recruitment/candidates`, { params });
    return res.data;
  },
  create: async (data: Omit<Candidate, 'id' | 'stage' | 'appliedDate'>): Promise<Candidate> => {
    const res = await API.post(`${BASE_PATH}/recruitment/candidates`, data);
    return res.data;
  },
  update: async (id: string, data: Partial<Candidate>): Promise<Candidate> => {
    const res = await API.put(`${BASE_PATH}/recruitment/candidates/${id}`, data);
    return res.data;
  },
  remove: async (id: string): Promise<{ message: string }> => {
    const res = await API.delete(`${BASE_PATH}/recruitment/candidates/${id}`);
    return res.data;
  },
};
