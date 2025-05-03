import API from '../api/api';
import { Opportunity } from '../types/Opportunity';

export class OpportunityService {
  static async createOpportunity(opportunity: Partial<Opportunity>) {
    try {
      const response = await API.post<Opportunity>('/api/sales/opportunities', opportunity);
      return response;
    } catch (err: any) {
      console.error('Error creating opportunity:', err);
      throw err;
    }
  }

  static async getOpportunities(page: number = 1, limit: number = 10, filters?: any) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });
      
      const response = await API.get(`/api/sales/opportunities?${queryParams}`);
      return response;
    } catch (err: any) {
      console.error('Error fetching opportunities:', err);
      throw err;
    }
  }

  static async getOpportunityById(id: string) {
    try {
      const response = await API.get<Opportunity>(`/api/sales/opportunities/${id}`);
      return response;
    } catch (err: any) {
      console.error('Error fetching opportunity:', err);
      throw err;
    }
  }

  static async updateOpportunity(id: string, opportunity: Partial<Opportunity>) {
    try {
      const response = await API.put<Opportunity>(`/api/sales/opportunities/${id}`, opportunity);
      return response;
    } catch (err: any) {
      console.error('Error updating opportunity:', err);
      throw err;
    }
  }

  static async deleteOpportunity(id: string) {
    try {
      const response = await API.delete(`/api/sales/opportunities/${id}`);
      return response;
    } catch (err: any) {
      console.error('Error deleting opportunity:', err);
      throw err;
    }
  }

  static async addActivity(opportunityId: string, activity: any) {
    try {
      const response = await API.post(`/api/sales/opportunities/${opportunityId}/activities`, activity);
      return response;
    } catch (err: any) {
      console.error('Error adding activity:', err);
      throw err;
    }
  }
}