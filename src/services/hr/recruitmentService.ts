import { API as api } from '../../lib/api';

export interface JobOpening {
  _id?: string;
  title: string;
  department: string;
  description: string;
  requirements?: string;
  status?: 'Open' | 'Closed' | 'On Hold';
  closingDate?: string;
  createdBy?: {
    _id: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface GetJobOpeningsParams {
  status?: string;
  department?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

const recruitmentService = {
  getJobOpenings: async (params: GetJobOpeningsParams = {}): Promise<JobOpening[]> => {
    const response = await api.get('/api/hr/recruitment/openings', { params });
    return response.data;
  },

  createJobOpening: async (jobData: Omit<JobOpening, '_id'>): Promise<JobOpening> => {
    const response = await api.post('/api/hr/recruitment/openings', jobData);
    return response.data;
  },

  updateJobOpening: async (id: string, jobData: Partial<JobOpening>): Promise<JobOpening> => {
    const response = await api.put(`/api/hr/recruitment/openings/${id}`, jobData);
    return response.data;
  },

  deleteJobOpening: async (id: string): Promise<void> => {
    await api.delete(`/api/hr/recruitment/openings/${id}`);
  },
};

export default recruitmentService;
