import React, { useState } from 'react';
import { Download, TrendingUp, Users, Package, ShoppingBag, Calendar, Filter } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const ReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('sales');

  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales (₹)',
        data: [65000, 78000, 85000, 92000, 88000, 95000],
        borderColor: '#c30001',
        backgroundColor: 'rgba(195, 0, 1, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const productData = {
    labels: ['Dresses', 'Accessories', 'Cosmetics', 'Jewelry', 'Shoes'],
    datasets: [
      {
        label: 'Units Sold',
        data: [120, 95, 80, 65, 45],
        backgroundColor: [
          '#c30001',
          '#9c0001',
          '#750001',
          '#4e0000',
          '#270000',
        ],
      },
    ],
  };

  const handleExport = (type: string) => {
    // Simulate export
    toast.success(`${type} report exported successfully`);
  };

  const stats = [
    {
      title: 'Total Revenue',
      value: '₹4,85,000',
      change: '+12.5%',
      icon: <TrendingUp className="h-6 w-6 text-green-500" />,
      color: 'green',
    },
    {
      title: 'Total Orders',
      value: '1,234',
      change: '+8.2%',
      icon: <ShoppingBag className="h-6 w-6 text-blue-500" />,
      color: 'blue',
    },
    {
      title: 'New Customers',
      value: '156',
      change: '+15.3%',
      icon: <Users className="h-6 w-6 text-purple-500" />,
      color: 'purple',
    },
    {
      title: 'Products Sold',
      value: '2,456',
      change: '+5.7%',
      icon: <Package className="h-6 w-6 text-orange-500" />,
      color: 'orange',
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Analytics & Reports</h1>
          <p className="text-gray-600">Track your business performance and export data</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p className={`text-sm mt-1 text-${stat.color}-600`}>
                  {stat.change} from last period
                </p>
              </div>
              <div className={`bg-${stat.color}-50 p-3 rounded-full`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Sales Trend</h3>
            <button
              onClick={() => handleExport('Sales Trend')}
              className="btn btn-outline btn-sm"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
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
                },
              },
            }}
          />
        </div>

        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Top Products</h3>
            <button
              onClick={() => handleExport('Top Products')}
              className="btn btn-outline btn-sm"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
          <Bar
            data={productData}
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
                },
              },
            }}
          />
        </div>
      </div>

      {/* Export Section */}
      <div className="card">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Export Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Orders Report</h4>
              <p className="text-sm text-gray-600 mb-3">
                Export all orders with customer details, payment status, and shipping information.
              </p>
              <button
                onClick={() => handleExport('Orders')}
                className="btn btn-primary w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Orders
              </button>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Customers Report</h4>
              <p className="text-sm text-gray-600 mb-3">
                Export customer data including registration dates, order history, and spending.
              </p>
              <button
                onClick={() => handleExport('Customers')}
                className="btn btn-primary w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Customers
              </button>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Products Report</h4>
              <p className="text-sm text-gray-600 mb-3">
                Export product catalog with inventory levels, pricing, and performance metrics.
              </p>
              <button
                onClick={() => handleExport('Products')}
                className="btn btn-primary w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Products
              </button>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Sales Report</h4>
              <p className="text-sm text-gray-600 mb-3">
                Export detailed sales data with revenue breakdown by products and categories.
              </p>
              <button
                onClick={() => handleExport('Sales')}
                className="btn btn-primary w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Sales
              </button>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Inventory Report</h4>
              <p className="text-sm text-gray-600 mb-3">
                Export current stock levels, low stock alerts, and inventory movements.
              </p>
              <button
                onClick={() => handleExport('Inventory')}
                className="btn btn-primary w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Inventory
              </button>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Financial Report</h4>
              <p className="text-sm text-gray-600 mb-3">
                Export financial summary including revenue, taxes, shipping, and profit margins.
              </p>
              <button
                onClick={() => handleExport('Financial')}
                className="btn btn-primary w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Financial
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;