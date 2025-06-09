import React, { useState, useEffect } from 'react';
import axiosInstance from '../config/axios';
import { Plus,Edit , Trash } from 'lucide-react';
import { Search,Filter,Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Product {
  _id: string;
  name: string;
  price: number;
  discountPrice: number;
  category: {
    _id: string;
    name: string;
  };
  brand: string;
  countInStock: number;
  productType: string;
  images: string[];
  featured: boolean;
}

const ProductsPage: React.FC = () => {

  const navigate=useNavigate();
  // Initialize products as empty array
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [productType, setProductType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = async (page = 1, type = '', search = '') => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/products', {
        params: { 
          pageNumber: page,
          productType: type || undefined,
          keyword: search || undefined
        },
      });
      // Ensure products is always an array
      setProducts(data.products || []);
      setTotalPages(data.pages || 1);
      setCurrentPage(data.page || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching products');
      // Set empty array on error
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, productType, searchTerm);
  }, [currentPage, productType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts(1, productType, searchTerm);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/products/${id}`);
        fetchProducts(currentPage, productType, searchTerm);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error deleting product');
      }
    }
  };

  const getProductTypeIcon = (type: string) => {
    switch (type) {
      case 'dress':
        return '👗';
      case 'cosmetic':
        return '💄';
      case 'accessory':
        return '📦';
      case 'jewelry':
        return '💍';
      default:
        return '🛍️';
    }
  };

  const productTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'dress', label: 'Dresses' },
    { value: 'cosmetic', label: 'Cosmetics' },
    { value: 'accessory', label: 'Accessories' },
    { value: 'jewelry', label: 'Jewelry' },
  ];

  // Add early return for loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Add early return for error state
  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-xl font-semibold">Products</h1>
          <p className="text-sm text-gray-500">
            Manage your product inventory
          </p>
        </div>
        <button
          onClick={() => navigate('/products/new')}
          className="btn btn-primary"
        >
          <Plus className="h-5 w-5 mr-1" /> Add New Product
        </button>
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
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
              <button type="submit" className="ml-2 btn btn-secondary">
                Search
              </button>
            </form>
            
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <select
                value={productType}
                onChange={(e) => {
                  setProductType(e.target.value);
                  setCurrentPage(1);
                }}
                className="input"
              >
                {productTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-red-500">{error}</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="h-16 w-16 mx-auto text-gray-300" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new product.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/products/new')}
                className="btn btn-primary"
              >
                <Plus className="h-5 w-5 mr-1" /> New Product
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100">
                        {product.images && product.images[0] ? (
                          <img 
                            src={`${product.images[0]}`}
                            alt={product.name} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.brand}</div>
                    </td>
                    <td>
                      <div className="flex items-center">
                        <span className="flex items-center bg-gray-100 px-2 py-1 rounded text-xs">
                          {getProductTypeIcon(product.productType)}
                          <span className="ml-1 capitalize">{product.productType}</span>
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="font-medium">${product.price.toFixed(2)}</div>
                      {product.discountPrice > 0 && (
                        <div className="text-xs text-red-500 line-through">
                          ${product.discountPrice.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={product.countInStock > 0 ? 'text-green-600' : 'text-red-600'}>
                        {product.countInStock > 0 ? product.countInStock : 'Out of stock'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${product.featured ? 'badge-success' : 'badge-warning'}`}>
                        {product.featured ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/products/${product._id}`)}
                          className="p-1 text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
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
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`btn ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'btn-outline'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`btn ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'btn-outline'
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    &larr;
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'bg-primary-50 border-primary-500 text-primary-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === totalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    &rarr;
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;