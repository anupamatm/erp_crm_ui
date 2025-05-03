// erp-crm-frontend/src/types/Lead.ts
export interface Lead {
    _id?: string;
    user: {
      _id: string;
      name: string;
      email: string;
    };
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    source: 'website' | 'referral' | 'trade_show' | 'cold_call' | 'other';
    status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'lost';
    priority: 'low' | 'medium' | 'high';
    notes: string;
    assignedTo: {
      _id: string;
      name: string;
      email: string;
    };
    expectedRevenue: number;
    closeDate: string;
    createdAt?: string;
    updatedAt?: string;
  }