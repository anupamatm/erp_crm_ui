import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SalesOrderService } from '../../services/SalesOrderService';
import { SalesOrder } from '../../types/SalesOrder';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<SalesOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        if (!id) return;
        const response = await SalesOrderService.getSalesOrderById(id);
        if (response && response.data) {
          setOrder(response.data);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        navigate('/sales/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, navigate]);

  if (loading) {
    return <div className="p-6">Loading order details...</div>;
  }

  if (!order) {
    return <div className="p-6">Order not found</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Order Details</h1>
          <button
            onClick={() => navigate('/sales/orders')}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Back to Orders
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Order Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Order Number:</span> {order.orderNumber}</p>
              <p><span className="font-medium">Status:</span> {order.status}</p>
              <p><span className="font-medium">Created:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Customer Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {order.customer?.name}</p>
              <p><span className="font-medium">Email:</span> {order.customer?.email}</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Order Items</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Product</th>
                <th className="text-right py-2">Quantity</th>
                <th className="text-right py-2">Unit Price</th>
                <th className="text-right py-2">Discount</th>
                <th className="text-right py-2">Tax</th>
                <th className="text-right py-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{item.product.name}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">${item.unitPrice?.toFixed(2)}</td>
                  <td className="text-right">{item.discount}%</td>
                  <td className="text-right">{item.tax}%</td>
                  <td className="text-right">${item.subTotal?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="font-medium">
              <tr>
                <td colSpan={5} className="text-right py-2">Subtotal:</td>
                <td className="text-right">${order.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={5} className="text-right py-2">Discount:</td>
                <td className="text-right">${order.discountAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={5} className="text-right py-2">Tax:</td>
                <td className="text-right">${order.taxAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={5} className="text-right py-2">Shipping:</td>
                <td className="text-right">${order.shippingCost.toFixed(2)}</td>
              </tr>
              <tr className="text-lg">
                <td colSpan={5} className="text-right py-2">Total:</td>
                <td className="text-right">${order.totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;