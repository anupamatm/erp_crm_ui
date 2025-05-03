// erp-crm-frontend/src/services/leadService.ts
import API from '../api/api';
import { Lead } from '../types/Lead';

class LeadService {
  // Get all leads
  static async getAllLeads() {
    try {
      const response = await API.get('/api/leads');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error fetching leads');
    }
  }

  // Get single lead by ID
  static async getLeadById(id: string) {
    try {
      const response = await API.get(`/api/leads/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error fetching lead');
    }
  }

  // Create new lead
  static async createLead(lead: Omit<Lead, '_id'>) {
    try {
      const response = await API.post('/api/leads', lead);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error creating lead');
    }
  }

  // Update existing lead
  static async updateLead(id: string, lead: Partial<Lead>) {
    try {
      const response = await API.put(`/api/leads/${id}`, lead);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error updating lead');
    }
  }

  // Convert lead to customer
  static async convertToCustomer(id: string) {
    try {
      const leadData = await LeadService.getLeadById(id);
      const response = await API.put(`/api/leads/${id}/convert`, {
        name: `${leadData.firstName} ${leadData.lastName}`,
        email: leadData.email,
        phone: leadData.phone,
        company: leadData.company,
        notes: leadData.notes
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error converting lead to customer');
    }
  }

  // Delete lead
  static async deleteLead(id: string) {
    try {
      await API.delete(`/api/leads/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error deleting lead');
    }
  }

  // Get leads by status
  static async getLeadsByStatus(status: Lead['status']) {
    try {
      const response = await API.get(`/api/leads/status/${status}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error fetching leads by status');
    }
  }

  // Get leads by source
  static async getLeadsBySource(source: Lead['source']) {
    try {
      const response = await API.get(`/api/leads/source/${source}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error fetching leads by source');
    }
  }

  // Get leads statistics
  static async getLeadsStats() {
    try {
      const response = await API.get('/api/leads/stats');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error fetching leads statistics');
    }
  }
}

export default LeadService;