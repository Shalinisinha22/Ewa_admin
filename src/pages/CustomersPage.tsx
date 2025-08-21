import React, { useState, useEffect } from 'react';
import axiosInstance from '../config/axios';
import toast from 'react-hot-toast';
import { Search, Filter, User, Mail, Trash, Edit, UserPlus } from 'lucide-react';

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: string;
  createdAt: string;
}

interface ApiResponse {
  users: Customer[];
  page: number;
  pages: number;
}

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCustomers = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get<ApiResponse>('/users', {
        params: {
          pageNumber: page,
          keyword: search || undefined,
          pageSize: 10
        }
      });
      setCustomers(data.users || []);
      setTotalPages(data.pages);
      setCurrentPage(data.page);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching customers');
      toast.error('Failed to fetch customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCustomers(currentPage, searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchTerm]);

  const handleDeleteCustomer = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/users/${id}`);
      toast.success('Customer deleted successfully');
      fetchCustomers(currentPage, searchTerm);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error deleting customer');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    fetchCustomers(1, searchTerm);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Customers</h1>
          <p className="text-sm text-gray-500">
            Manage customer accounts and information
          </p>
        </div>
      </div>

      <div className="card mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
            <form onSubmit={handleSearch} className="flex">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </form>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            <p>{error}</p>
            <button 
              onClick={() => fetchCustomers(currentPage, searchTerm)}
              className="btn btn-secondary mt-2"
            >
              Try Again
            </button>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center">
            <User className="h-16 w-16 mx-auto text-gray-300" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No customers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? `No results for "${searchTerm}"` : 'There are no customers registered yet.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer._id}>
                      <td>
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-full w-full rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                              {customer.firstName.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">
                              {customer.firstName} {customer.lastName}
                            </div>
                            <div className="text-gray-500 text-xs">
                              ID: {customer._id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center text-gray-500">
                          <Mail className="h-4 w-4 mr-2" />
                          {customer.email}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          customer.status === 'active' ? 'badge-success' : 
                          customer.status === 'blocked' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                        </span>
                      </td>
                      <td>{formatDate(customer.createdAt)}</td>
                      <td>
                        <div className="flex space-x-2">
                          <button className="p-1 text-blue-600 hover:text-blue-900">
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(customer._id)}
                            className="p-1 text-red-600 hover:text-red-900"
                          >
                            <Trash className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 p-4 border-t border-gray-200">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded ${
                      currentPage === page
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CustomersPage;