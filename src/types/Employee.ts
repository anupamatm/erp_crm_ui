export interface IEmployee {
    _id?: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    department: string;
    position: string;
    dateOfJoining: Date | string;
    salary: number;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    };
    emergencyContact?: {
      name?: string;
      relation?: string;
      phone?: string;
    };
    status: 'active' | 'inactive' | 'on-leave' | 'terminated';
    documents?: Array<{
      name: string;
      url: string;
      uploadDate: Date | string;
    }>;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  }
  
  export interface EmployeeStats {
    _id: string;
    count: number;
    totalSalary: number;
  }