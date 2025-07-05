export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  category: string; // This will be the category ID
  categoryDetails?: { // Optional populated category data
    _id: string;
    name: string;
    // Add other category fields you need
  };
  stock: number;
  status: 'in_stock' | 'out_of_stock' | 'discontinued' | 'not_set';
  imageUrl?: string;
  sku?: string;
  brand?: string;
  createdAt?: string;
  updatedAt?: string;
}