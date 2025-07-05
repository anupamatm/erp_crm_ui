export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  [key: string]: any; // For any additional properties
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: Address;
  status?: 'active' | 'inactive' | 'lead' | 'customer';
  company?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
