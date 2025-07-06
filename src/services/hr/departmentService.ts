import { API as api } from '../../lib/api';

export interface Department {
  _id: string;
  name: string;
  description?: string;
}

const departmentService = {
  getDepartments: async (): Promise<Department[]> => {
    const response = await api.get('/api/hr/departments');
    return response.data;
  },
};

export default departmentService;
