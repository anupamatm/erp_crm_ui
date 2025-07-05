import API from '../api/api';

const CategoryService = {
  async getCategories() {
    try {
      const response = await API.get('/api/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
};

export default CategoryService;