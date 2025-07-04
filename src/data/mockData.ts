import { Employee, Department, Attendance, LeaveRequest, PayrollRecord, PerformanceReview, Candidate } from '../types';

export const employees: Employee[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    position: 'Senior Developer',
    department: 'Engineering',
    salary: 85000,
    hireDate: '2022-03-15',
    status: 'active',
    manager: 'Sarah Wilson',
    location: 'New York'
  },
  {
    id: '2',
    employeeId: 'EMP002',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@company.com',
    phone: '+1 (555) 234-5678',
    position: 'Marketing Manager',
    department: 'Marketing',
    salary: 75000,
    hireDate: '2021-11-08',
    status: 'active',
    manager: 'Michael Brown',
    location: 'California'
  },
  {
    id: '3',
    employeeId: 'EMP003',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@company.com',
    phone: '+1 (555) 345-6789',
    position: 'UX Designer',
    department: 'Design',
    salary: 70000,
    hireDate: '2023-01-20',
    status: 'active',
    manager: 'Lisa Chen',
    location: 'Remote'
  },
  {
    id: '4',
    employeeId: 'EMP004',
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'sarah.wilson@company.com',
    phone: '+1 (555) 456-7890',
    position: 'Engineering Director',
    department: 'Engineering',
    salary: 120000,
    hireDate: '2020-06-10',
    status: 'active',
    location: 'New York'
  }
];

export const departments: Department[] = [
  {
    id: '1',
    name: 'Engineering',
    head: 'Sarah Wilson',
    employeeCount: 25,
    budget: 2500000,
    description: 'Software development and technical operations'
  },
  {
    id: '2',
    name: 'Marketing',
    head: 'Michael Brown',
    employeeCount: 12,
    budget: 800000,
    description: 'Brand marketing and customer acquisition'
  },
  {
    id: '3',
    name: 'Design',
    head: 'Lisa Chen',
    employeeCount: 8,
    budget: 600000,
    description: 'Product design and user experience'
  },
  {
    id: '4',
    name: 'Sales',
    head: 'Robert Davis',
    employeeCount: 18,
    budget: 1200000,
    description: 'Sales operations and business development'
  }
];

export const attendanceRecords: Attendance[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'John Doe',
    date: '2024-01-15',
    clockIn: '09:00',
    clockOut: '17:30',
    totalHours: 8.5,
    status: 'present'
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'Jane Smith',
    date: '2024-01-15',
    clockIn: '09:15',
    clockOut: '17:45',
    totalHours: 8.5,
    status: 'late'
  },
  {
    id: '3',
    employeeId: '3',
    employeeName: 'Mike Johnson',
    date: '2024-01-15',
    clockIn: '08:45',
    clockOut: '17:15',
    totalHours: 8.5,
    status: 'present'
  }
];

export const leaveRequests: LeaveRequest[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'John Doe',
    type: 'vacation',
    startDate: '2024-02-15',
    endDate: '2024-02-20',
    days: 5,
    reason: 'Family vacation',
    status: 'pending',
    appliedDate: '2024-01-10'
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'Jane Smith',
    type: 'sick',
    startDate: '2024-01-20',
    endDate: '2024-01-22',
    days: 2,
    reason: 'Medical appointment',
    status: 'approved',
    appliedDate: '2024-01-18'
  }
];

export const payrollRecords: PayrollRecord[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'John Doe',
    basicSalary: 85000,
    allowances: 5000,
    deductions: 12000,
    netSalary: 78000,
    payPeriod: 'January 2024',
    status: 'paid'
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'Jane Smith',
    basicSalary: 75000,
    allowances: 3000,
    deductions: 10000,
    netSalary: 68000,
    payPeriod: 'January 2024',
    status: 'paid'
  }
];

export const performanceReviews: PerformanceReview[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'John Doe',
    reviewPeriod: 'Q4 2023',
    overallRating: 4.2,
    goals: ['Improve code quality', 'Lead junior developers', 'Complete React migration'],
    achievements: ['Led successful project delivery', 'Mentored 3 junior developers'],
    areasForImprovement: ['Communication skills', 'Time management'],
    reviewerName: 'Sarah Wilson',
    status: 'completed'
  }
];

export const candidates: Candidate[] = [
  {
    id: '1',
    name: 'Alex Thompson',
    email: 'alex.thompson@email.com',
    phone: '+1 (555) 999-8888',
    position: 'Frontend Developer',
    experience: 3,
    stage: 'interview',
    appliedDate: '2024-01-10'
  },
  {
    id: '2',
    name: 'Maria Garcia',
    email: 'maria.garcia@email.com',
    phone: '+1 (555) 777-6666',
    position: 'Product Manager',
    experience: 5,
    stage: 'screening',
    appliedDate: '2024-01-12'
  }
];