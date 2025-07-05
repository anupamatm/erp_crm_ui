export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  sku?: string;
  barcode?: string;
  quantity: number;
  category?: string;
  status?: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
  taxRate?: number;
  unit?: string;
  minStockLevel?: number;
  reorderPoint?: number;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
