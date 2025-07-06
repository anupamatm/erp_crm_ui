import { API } from '../../lib/api';

export interface Rating {
  qualityOfWork: number;
  communication: number;
  teamwork: number;
  productivity: number;
}

export interface Goal {
  description: string;
  deadline: string;
  completed: boolean;
}

export interface PopulatedUser {
  _id: string;
  name: string;
}

export interface PerformanceReview {
  _id?: string;
  employee: string | PopulatedUser;
  reviewer: string | PopulatedUser;
  reviewDate?: string;
  ratings: Rating;
  comments: string;
  goals: Goal[];
}

const performanceService = {
  getPerformanceReviews: async (): Promise<PerformanceReview[]> => {
    const response = await API.get('/api/hr/performance');
    return response.data;
  },

  getPerformanceReviewById: async (id: string): Promise<PerformanceReview> => {
    const response = await API.get(`/api/hr/performance/${id}`);
    return response.data;
  },

  createPerformanceReview: async (reviewData: PerformanceReview): Promise<PerformanceReview> => {
    const response = await API.post('/api/hr/performance', reviewData);
    return response.data;
  },

  updatePerformanceReview: async (id: string, reviewData: Partial<PerformanceReview>): Promise<PerformanceReview> => {
    const response = await API.put(`/api/hr/performance/${id}`, reviewData);
    return response.data;
  },

  deletePerformanceReview: async (id: string): Promise<void> => {
    await API.delete(`/api/hr/performance/${id}`);
  },
};

export default performanceService;
