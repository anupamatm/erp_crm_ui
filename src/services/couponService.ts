// src/services/sales/couponService.ts
import API from '../api/api';


export interface Coupon {
  _id?: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
}

export interface SendCouponPayload {
    couponId: string;
    customerEmails: string[];
  }

export const createCoupon = async (couponData: Omit<Coupon, '_id'>) => {
  const response = await API.post('/api/sales/coupons', couponData);
  return response.data;
};

export const getCoupons = async () => {
  const response = await API.get('/api/sales/coupons');
  return response.data;
};

export const deleteCoupon = async (id: string) => {
  await API.delete(`/api/sales/coupons/${id}`);
};

export const updateCoupon = async (id: string, couponData: Partial<Coupon>) => {
    const response = await API.put(`/api/sales/coupons/${id}`, couponData);
    return response.data;
  };
  
// Send coupon to customers
export const sendCouponToCustomers = async (payload: SendCouponPayload) => {
    const response = await API.post('/api/sales/coupons/send', payload);
    return response.data;
  };