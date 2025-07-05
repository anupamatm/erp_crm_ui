import API from '../api/api';

export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  status: 'available' | 'out-of-stock' | 'discontinued';
  imageUrl?: string;
  sku?: string;
  brand?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
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

  // Get a single product by ID
  static async getProductById(id: string): Promise<{ data: Product }> {
    try {
      const response = await API.get(`/api/products/${id}`);
      
      // Check if response has data property
      if (response.data && typeof response.data === 'object') {
        // If response has a nested data property
        if (response.data.data && typeof response.data.data === 'object') {
          return { data: response.data.data as Product };
        }
        // If response is the product directly
        return { data: response.data as Product };
      }
      
      throw new Error('Invalid product data received');
    } catch (error: any) {
      console.error('Error fetching product:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch product';
      throw new Error(typeof errorMessage === 'string' ? errorMessage : 'Failed to fetch product');
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
