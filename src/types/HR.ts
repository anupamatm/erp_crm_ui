export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface Document {
  name: string;
  url: string;
  type: string;
  uploadDate: string;
}

export interface Department {
  _id: string;
  id?: string;
  name: string;
  head?: string;
  employeeCount?: number;
  budget?: number;
  description?: string;
}

export interface Employee {
  id?: string;
  _id?: string;
  employeeId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: Department | string;
  salary: number;
  hireDate?: string;
  dateOfJoining?: string | Date;
  status: 'active' | 'inactive' | 'terminated' | 'on-leave';
  avatar?: string;
  manager?: string;
  location: string;
  address: Address;
  emergencyContact: EmergencyContact;
  documents?: Document[];
  user?: {
    _id: string;
    email: string;
    defaultPassword?: string;
  };
}

export interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  totalHours?: number;
  status: 'present' | 'absent' | 'late' | 'half-day';
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
}

export interface PayrollRecord {
  _id: string;
  employeeName: string;
  department: string;
  netSalary: number;
  status: 'paid' | 'pending' | 'failed';
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  reviewPeriod: string;
  overallRating: number;
  goals: string[];
  achievements: string[];
  areasForImprovement: string[];
  reviewerName: string;
  status: 'draft' | 'completed' | 'approved';
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: number;
  stage: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  appliedDate: string;
  resumeUrl?: string;
}

export interface PayItem {
  name: string;
  amount: number;
}

export interface Overtime {
  hours: number;
  rate: number;
  amount: number;
}

export interface PaySlip {
  _id: string;
  employee: Employee;
  month: number;
  year: number;
  basicSalary: number;
  allowances: PayItem[];
  deductions: PayItem[];
  overtime?: Overtime;
  bonuses: PayItem[];
  netSalary: number;
  grossSalary: number;
  status: 'paid' | 'pending' | 'failed';
  paymentDate?: string;
  paymentMethod?: string;
}