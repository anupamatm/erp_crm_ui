import LeadService from './leadService';
import CustomerService from './customerService';
import ProductService from './productService';

export interface DashboardStats {
  totalCustomers?: number;
  totalLeads?: number;
  totalProducts?: number; // Example, adjust based on actual data
  totalRevenue?: number;  // Example, adjust based on actual data
  // Add other stats properties as needed
}

class DashboardService {
  static async getAggregatedDashboardStats(): Promise<DashboardStats> {
    try {
      // Fetch lead statistics
      const leadStats = await LeadService.getLeadsStats(); // Assuming this returns { totalLeads: number, ... }

      // Fetch customer statistics
      // Option 1: If customerService.getCustomers() returns total count in response
      const customerData = await CustomerService.getCustomers(1, 1); // Fetch 1 page, 1 limit just to get total
      const totalCustomers = customerData.totalCount || customerData.total; // Adjust based on actual API response key for total

      // Option 2: If there's a dedicated customer stats endpoint (preferred)
      // const customerStats = await CustomerService.getCustomerStats(); 
      // const totalCustomers = customerStats.total;

      // Fetch product statistics
      const { total: totalProducts } = await ProductService.getProducts(1);
      console.log('Total products:', totalProducts);
      
      // Placeholder for revenue - to be implemented
      const totalRevenue = 0;  // Replace with actual call to financeService.getRevenueStats() or similar

      return {
        totalLeads: leadStats.totalLeads || (leadStats.data ? leadStats.data.totalLeads : 0), // Adjust based on actual structure of leadStats
        totalCustomers: totalCustomers,
        totalProducts: totalProducts,
        totalRevenue: totalRevenue,
      };
    } catch (error) {
      console.error('Error fetching aggregated dashboard stats:', error);
      throw new Error('Failed to load dashboard data.');
    }
  }
}

export default DashboardService;
