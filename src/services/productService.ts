// lib/productService.ts
import API  from '../api/api';  // Assuming you have a generic API utility (e.g., Axios)

interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  status: 'available' | 'out-of-stock' | 'discontinued';
}

class ProductService {
  // Fetch products with pagination
  static async getProducts(page: number = 1, limit: number = 10) {
    try {
      const response = await API.get(`/api/products?page=${page}&limit=${limit}`);
      console.log('Products API Response (raw):', response);
      
      // Handle different API response structures
      if (!response.data) {
        console.error('No data in response:', response);
        return { data: [], total: 0, totalCount: 0 };
      }
      
      // If response.data is an array, it's likely the direct products array
      if (Array.isArray(response.data)) {
        return {
          data: response.data,
          total: response.data.length,
          totalCount: response.data.length
        };
      }
      
      // If response.data.products is an array
      if (Array.isArray(response.data.products)) {
        return {
          data: response.data.products,
          total: response.data.total || 0,
          totalCount: response.data.totalCount || 0
        };
      }
      
      // If response.data has a data property (common in paginated responses)
      if (response.data.data && Array.isArray(response.data.data)) {
        return {
          data: response.data.data,
          products: response.data.data,
          total: response.data.total || response.data.data.length,
          totalCount: response.data.totalCount || response.data.data.length
        };
      }
      
      // If response.data is an object with products array
      if (response.data.products && Array.isArray(response.data.products)) {
        return {
          products: response.data.products,
          total: response.data.total || response.data.products.length,
          totalCount: response.data.totalCount || response.data.products.length
        };
      }
      
      // Default return if structure doesn't match expected formats
      console.warn('Unexpected API response structure:', response.data);
      return { products: [], total: 0, totalCount: 0 };
      
    } catch (error: any) {
      console.error('Error in getProducts:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error:', error.message);
      }
      throw new Error(error.response?.data?.message || 'Error fetching products');
    }
  }

  // Fetch a single product by ID
  static async getProductById(productId: string) {
    try {
      const response = await API.get(`/api/products/${productId}`);
      return response.data; // Assuming response contains the product data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error fetching product');
    }
  }

  // Add a new product
  static async addProduct(product: Product) {
    try {
      const response = await API.post('/api/products', product);
      return response.data; // Assuming response contains the created product
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error adding product');
    }
  }

  // Update an existing product
  static async updateProduct(productId: string, product: Product) {
    try {
      const response = await API.put(`/api/products/${productId}`, product);
      return response.data; // Assuming response contains the updated product
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error updating product');
    }
  }

  // Delete a product by ID
  static async deleteProduct(productId: string) {
    try {
      await API.delete(`/api/products/${productId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error deleting product');
    }
  }
}

export default ProductService;
