import { Employee } from './HR';

export interface LeaveRequest {
  _id: string;
  employee: string | Employee;
  type: 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity';
  startDate: Date | string;
  endDate: Date | string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate?: Date | string;
  approvedBy?: string;
  approvedDate?: Date | string;
  comments?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface EmployeeLeaveRequest extends Omit<LeaveRequest, 'employee'> {
  employeeId: string;
  employeeName: string;
}

export interface LeaveStats {
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
