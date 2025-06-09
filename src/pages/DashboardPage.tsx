import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Users, 
  Package, 
  TrendingUp, 
  CreditCard, 
  ArrowUpRight,
  Clock,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

interface StatisticsData {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  last7DaysOrders: number;
}

const formatRevenue = (value: number | undefined): string => {
  if (typeof value === 'number') {
    return `$${value.toFixed(2)}`;
  }
  return '$0.00';
};

const DashboardPage: React.FC = () => {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const { data } = await axios.get('/api/orders/statistics');
        setStatistics(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const statsCards = [
    {
      title: 'Total Revenue',
      value: formatRevenue(statistics?.totalRevenue),
      icon: <CreditCard className="h-6 w-6 text-purple-500" />,
      change: '+12.5%',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total Orders',
      value: statistics?.totalOrders || 0,
      icon: <ShoppingBag className="h-6 w-6 text-blue-500" />,
      change: '+8.2%',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Products',
      value: '254',
      icon: <Package className="h-6 w-6 text-green-500" />,
      change: '+3.1%',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Customers',
      value: '1,235',
      icon: <Users className="h-6 w-6 text-orange-500" />,
      change: '+5.7%',
      bgColor: 'bg-orange-50',
    },
  ];

  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Sales',
        data: [3500, 4200, 3800, 5100, 4800, 6200, 5700],
        borderColor: '#c30001',
        backgroundColor: 'rgba(195, 0, 1, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const orderStatusData = {
    labels: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    datasets: [
      {
        label: 'Order Status',
        data: statistics ? [
          statistics.pendingOrders, 
          statistics.processingOrders,
          statistics.shippedOrders,
          statistics.deliveredOrders,
          statistics.cancelledOrders
        ] : [0, 0, 0, 0, 0],
        backgroundColor: [
          '#FFA500',  // Orange for Pending
          '#3B82F6',  // Blue for Processing
          '#8B5CF6',  // Purple for Shipped
          '#10B981',  // Green for Delivered
          '#EF4444',  // Red for Cancelled
        ],
        borderWidth: 1,
      },
    ],
  };

  const categoryData = {
    labels: ['Dresses', 'Cosmetics', 'Accessories', 'Jewelry'],
    datasets: [
      {
        label: 'Sales by Category',
        data: [4200, 3100, 2800, 3700],
        backgroundColor: [
          '#c30001',  // Primary red
          '#9c0001',  // Darker red
          '#750001',  // Even darker red
          '#4e0000',  // Darkest red
        ],
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-full`}>{stat.icon}</div>
            </div>
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <span className="flex items-center text-green-600 font-medium">
                {stat.change} <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </span>
              <span className="ml-2">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-semibold mb-4">Sales Overview</h3>
          <Line
            data={salesData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.05)',
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                },
              },
            }}
          />
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Order Status</h3>
          <Doughnut
            data={orderStatusData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    boxWidth: 12,
                    padding: 15,
                  },
                },
              },
              cutout: '70%',
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Category Sales</h3>
          <Bar
            data={categoryData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.05)',
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                },
              },
            }}
          />
        </div>
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Orders</h3>
            <a href="/orders" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="text-sm font-medium">#ORD-1234</td>
                  <td>Sarah Johnson</td>
                  <td>$158.50</td>
                  <td>
                    <span className="badge badge-success">Delivered</span>
                  </td>
                  <td className="flex items-center text-gray-500">
                    <Clock className="h-3 w-3 mr-1" /> 2h ago
                  </td>
                </tr>
                <tr>
                  <td className="text-sm font-medium">#ORD-1233</td>
                  <td>Michael Chen</td>
                  <td>$89.99</td>
                  <td>
                    <span className="badge badge-warning">Processing</span>
                  </td>
                  <td className="flex items-center text-gray-500">
                    <Clock className="h-3 w-3 mr-1" /> 3h ago
                  </td>
                </tr>
                <tr>
                  <td className="text-sm font-medium">#ORD-1232</td>
                  <td>Emily Rodriguez</td>
                  <td>$225.00</td>
                  <td>
                    <span className="badge badge-info">Shipped</span>
                  </td>
                  <td className="flex items-center text-gray-500">
                    <Clock className="h-3 w-3 mr-1" /> 5h ago
                  </td>
                </tr>
                <tr>
                  <td className="text-sm font-medium">#ORD-1231</td>
                  <td>David Kim</td>
                  <td>$78.25</td>
                  <td>
                    <span className="badge badge-danger">Cancelled</span>
                  </td>
                  <td className="flex items-center text-gray-500">
                    <Clock className="h-3 w-3 mr-1" /> 8h ago
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;