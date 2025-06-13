export interface Employee {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    salary: number;
    hireDate: string;
    status: 'active' | 'inactive' | 'terminated';
    avatar?: string;
    manager?: string;
    location: string;
  }
  
  export interface Department {
    id: string;
    name: string;
    head: string;
    employeeCount: number;
    budget: number;
    description: string;
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
    id: string;
    employeeId: string;
    employeeName: string;
    basicSalary: number;
    allowances: number;
    deductions: number;
    netSalary: number;
    payPeriod: string;
    status: 'paid' | 'pending' | 'processing';
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