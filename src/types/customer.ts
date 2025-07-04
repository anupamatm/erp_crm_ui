export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  status?: 'active' | 'inactive' | 'lead' | 'customer';
  company?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
