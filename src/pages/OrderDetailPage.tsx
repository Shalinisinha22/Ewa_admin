import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Package, User, MapPin, CreditCard, Truck, Clock, Printer, RefreshCw } from 'lucide-react';

interface OrderItem {
  _id: string;
  name: string;
  qty: number;
  image: string;
  price: number;
  product: string;
}

interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  orderItems: OrderItem[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt: string | null;
  isDelivered: boolean;
  deliveredAt: string | null;
  status: string;
  createdAt: string;
}

const OrderStatuses = {
  Pending: 'Pending',
  Processing: 'Processing',
  Shipped: 'Shipped',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
} as const;

type OrderStatus = keyof typeof OrderStatuses;

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('Pending');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/orders/${id}`);
      setOrder(data);
      setNewStatus(data.status as OrderStatus);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Error fetching order details';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!order || updatingStatus) return;

    try {
      setUpdatingStatus(true);
      await axiosInstance.put(`/orders/${id}/status`, { status: newStatus });
      await fetchOrderDetails(); // Refresh order data
      toast.success('Order status updated successfully');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update order status';
      toast.error(message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!order || order.isPaid || updatingStatus) return;

    try {
      setUpdatingStatus(true);
      await axiosInstance.put(`/orders/${id}/pay`, {
        id: Date.now().toString(),
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        payer: { email_address: order.user.email },
      });
      await fetchOrderDetails(); // Refresh order data
      toast.success('Order marked as paid');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to mark order as paid';
      toast.error(message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePrintInvoice = () => {
    // Generate GST Invoice
    const invoiceWindow = window.open('', '_blank');
    if (invoiceWindow) {
      invoiceWindow.document.write(`
        <html>
          <head>
            <title>GST Invoice - ${order._id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .invoice-details { margin-bottom: 20px; }
              .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .items-table th { background-color: #f2f2f2; }
              .total-section { text-align: right; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>GST INVOICE</h1>
              <h2>EWA Fashion</h2>
            </div>
            <div class="invoice-details">
              <p><strong>Invoice No:</strong> INV-${order._id.substring(order._id.length - 6)}</p>
              <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Customer:</strong> ${order.user.name}</p>
              <p><strong>Email:</strong> ${order.user.email}</p>
            </div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.orderItems.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.qty}</td>
                    <td>₹${item.price.toFixed(2)}</td>
                    <td>₹${(item.qty * item.price).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="total-section">
              <p>Subtotal: ₹${(order.totalPrice - order.taxPrice - order.shippingPrice).toFixed(2)}</p>
              <p>Shipping: ₹${order.shippingPrice.toFixed(2)}</p>
              <p>GST (18%): ₹${order.taxPrice.toFixed(2)}</p>
              <p><strong>Total: ₹${order.totalPrice.toFixed(2)}</strong></p>
            </div>
          </body>
        </html>
      `);
      invoiceWindow.document.close();
      invoiceWindow.print();
    }
  };

  const handleInitiateRefund = async () => {
    if (!refundAmount || !refundReason) {
      toast.error('Please fill in all refund details');
      return;
    }

    try {
      setUpdatingStatus(true);
      await axiosInstance.post(`/orders/${id}/refund`, {
        amount: parseFloat(refundAmount),
        reason: refundReason,
      });
      toast.success('Refund initiated successfully');
      setShowRefundModal(false);
      setRefundAmount('');
      setRefundReason('');
      await fetchOrderDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to initiate refund');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'Delivered':
        return 'badge-success';
      case 'Shipped':
        return 'badge-info';
      case 'Processing':
        return 'badge-warning';
      case 'Cancelled':
        return 'badge-danger';
      default:
        return 'badge bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-500 mb-4">{error || 'Order not found'}</div>
        <button 
          onClick={() => navigate('/orders')}
          className="btn btn-primary"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/orders')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold">Order Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium flex items-center">
                <Package className="h-5 w-5 mr-2 text-primary-500" />
                Order #{order._id.substring(order._id.length - 6)}
              </h2>
              <span className={`badge ${getStatusBadgeClass(order.status)}`}>{order.status}</span>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm mb-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-gray-400" />
                <span>Ordered: {formatDate(order.createdAt)}</span>
              </div>
              {order.isPaid && (
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-1 text-gray-400" />
                  <span>Paid: {formatDate(order.paidAt)}</span>
                </div>
              )}
              {order.isDelivered && (
                <div className="flex items-center">
                  <Truck className="h-4 w-4 mr-1 text-gray-400" />
                  <span>Delivered: {formatDate(order.deliveredAt)}</span>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-medium mb-3">Items</h3>
              <div className="space-y-3">
                {order.orderItems.map((item) => (
                  <div key={item._id} className="flex items-center py-3 border-b border-gray-100">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="mt-1 text-sm text-gray-500">
                        {item.qty} x ${item.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="font-medium">${(item.qty * item.price).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="card p-6">
              <h3 className="font-medium mb-3 flex items-center">
                <User className="h-5 w-5 mr-2 text-primary-500" />
                Customer
              </h3>
              <p className="text-sm">{order.user.name}</p>
              <p className="text-sm">{order.user.email}</p>
            </div>
            
            {/* Shipping Information */}
            <div className="card p-6">
              <h3 className="font-medium mb-3 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary-500" />
                Shipping Address
              </h3>
              <p className="text-sm">{order.shippingAddress.address}</p>
              <p className="text-sm">
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              </p>
              <p className="text-sm">{order.shippingAddress.country}</p>
            </div>
          </div>
        </div>
        
        {/* Order Actions */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-medium mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  ${(order.totalPrice - order.taxPrice - order.shippingPrice).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${order.shippingPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${order.taxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>${order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <h3 className="font-medium mb-4">Update Order Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="input"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              
              <button
                onClick={handleUpdateStatus}
                disabled={updatingStatus || order.status === newStatus}
                className={`w-full btn ${
                  updatingStatus || order.status === newStatus
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                {updatingStatus ? 'Updating...' : 'Update Status'}
              </button>
              
              {!order.isPaid && (
                <button
                  onClick={handleMarkAsPaid}
                  disabled={updatingStatus}
                  className={`w-full btn ${
                    updatingStatus ? 'bg-gray-300 cursor-not-allowed' : 'btn-secondary'
                  }`}
                >
                  Mark as Paid
                </button>
              )}
              
              <button
                onClick={handlePrintInvoice}
                className="w-full btn btn-outline"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print GST Invoice
              </button>
              
              <button
                onClick={() => setShowRefundModal(true)}
                className="w-full btn bg-orange-500 hover:bg-orange-600 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Initiate Refund
              </button>
            </div>
          </div>
          
          <div className="card p-6">
            <h3 className="font-medium mb-4">Payment Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Method:</span>
                <span>{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span>
                  <span className={`badge ${order.isPaid ? 'badge-success' : 'badge-warning'}`}>
                    {order.isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                </span>
              </div>
              {order.isPaid && (
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{formatDate(order.paidAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Initiate Refund</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Refund Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="input"
                    placeholder="0.00"
                    max={order.totalPrice}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Refund Reason
                  </label>
                  <textarea
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="input h-20"
                    placeholder="Enter reason for refund"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowRefundModal(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInitiateRefund}
                    disabled={updatingStatus}
                    className="btn btn-primary"
                  >
                    {updatingStatus ? 'Processing...' : 'Initiate Refund'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;