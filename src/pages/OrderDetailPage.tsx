import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Package, User, MapPin, CreditCard, Truck, Clock } from 'lucide-react';

interface OrderItem {
  _id: string;
  name: string;
  quantity: number;
  image: string;
  price: number;
  product: string;
}

interface Order {
  _id: string;
  customer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  orderNumber: string;
  items: OrderItem[];
  shipping: {
    firstName: string;
    lastName: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      country: string;
      zipCode: string;
    };
  };
  payment: {
    method: string;
    status: string;
    paidAt?: string;
  };
  pricing: {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  };
  fulfillment: {
    status: string;
    deliveredAt?: string;
  };
  status: string;
  createdAt: string;
}

const OrderStatuses = {
  Pending: 'pending',
  Processing: 'processing',
  Shipped: 'shipped',
  Delivered: 'delivered',
  Cancelled: 'cancelled',
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

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/orders/${id}`);
      setOrder(data);
      // Map the backend status to frontend status
      const statusMap: { [key: string]: OrderStatus } = {
        'pending': 'Pending',
        'processing': 'Processing',
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled',
      };
      setNewStatus(statusMap[data.status] || 'Pending');
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
      // Send lowercase status to backend
      await axiosInstance.put(`/orders/${id}/status`, { status: OrderStatuses[newStatus] });
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
    if (!order || order.payment.status === 'completed' || updatingStatus) return;

    try {
      setUpdatingStatus(true);
      await axiosInstance.put(`/orders/${id}/pay`, {
        id: Date.now().toString(),
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        payer: { email_address: order.customer.email },
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
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'badge-success';
      case 'shipped':
        return 'badge-info';
      case 'processing':
        return 'badge-warning';
      case 'cancelled':
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
                Order #{order.orderNumber || order._id.substring(order._id.length - 6)}
              </h2>
              <span className={`badge ${getStatusBadgeClass(order.status)}`}>{order.status}</span>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm mb-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-gray-400" />
                <span>Ordered: {formatDate(order.createdAt)}</span>
              </div>
              {order.payment.status === 'completed' && (
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-1 text-gray-400" />
                  <span>Paid: {formatDate(order.payment.paidAt)}</span>
                </div>
              )}
              {order.fulfillment.deliveredAt && (
                <div className="flex items-center">
                  <Truck className="h-4 w-4 mr-1 text-gray-400" />
                  <span>Delivered: {formatDate(order.fulfillment.deliveredAt)}</span>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-medium mb-3">Items</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item._id} className="flex items-center py-3 border-b border-gray-100">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img
                        src={item.image.startsWith('http') 
                          ? item.image 
                          : `http://localhost:5000${item.image.startsWith('/') ? item.image : `/${item.image}`}`}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="mt-1 text-sm text-gray-500">
                        {item.quantity || 0} x ₹{(item.price || 0).toFixed(2)}
                      </div>
                    </div>
                    <div className="font-medium">₹{((item.quantity || 0) * (item.price || 0)).toFixed(2)}</div>
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
              <p className="text-sm">{order.customer.firstName} {order.customer.lastName}</p>
              <p className="text-sm">{order.customer.email}</p>
              {order.customer.phone && <p className="text-sm">{order.customer.phone}</p>}
            </div>
            
            {/* Shipping Information */}
            <div className="card p-6">
              <h3 className="font-medium mb-3 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary-500" />
                Shipping Address
              </h3>
              <p className="text-sm">{order.shipping.firstName} {order.shipping.lastName}</p>
              <p className="text-sm">{order.shipping.address.line1}</p>
              {order.shipping.address.line2 && <p className="text-sm">{order.shipping.address.line2}</p>}
              <p className="text-sm">
                {order.shipping.address.city}, {order.shipping.address.state} {order.shipping.address.zipCode}
              </p>
              <p className="text-sm">{order.shipping.address.country}</p>
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
                  ₹{order.pricing.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{order.pricing.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>₹{order.pricing.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>₹{order.pricing.total.toFixed(2)}</span>
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
                disabled={updatingStatus || order.status === OrderStatuses[newStatus]}
                className={`w-full btn ${
                  updatingStatus || order.status === OrderStatuses[newStatus]
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                {updatingStatus ? 'Updating...' : 'Update Status'}
              </button>
              
              {order.payment.status !== 'completed' && (
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
            </div>
          </div>
          
          <div className="card p-6">
            <h3 className="font-medium mb-4">Payment Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Method:</span>
                <span>{order.payment.method}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span>
                  <span className={`badge ${order.payment.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                    {order.payment.status === 'completed' ? 'Paid' : 'Unpaid'}
                  </span>
                </span>
              </div>
              {order.payment.status === 'completed' && (
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{formatDate(order.payment.paidAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;