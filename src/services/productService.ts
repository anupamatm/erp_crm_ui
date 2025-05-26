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
  // Fetch total number of products
  static async getTotalProducts() {
    try {
      const response = await API.get('/api/products');
      // Use pagination.totalItems if present
      if (response.data.pagination && typeof response.data.pagination.totalItems === 'number') {
        return response.data.pagination.totalItems;
      }
      if (Array.isArray(response.data.data)) {
        return response.data.data.length;
      }
      return 0;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error fetching product count');
    }
  }
  // Fetch products with pagination
  static async getProducts(page: number = 1) {
    try {
      const response = await API.get(`/api/products?page=${page}`);
      return response.data; // Assuming response contains the products and pagination info
    } catch (error: any) {
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
