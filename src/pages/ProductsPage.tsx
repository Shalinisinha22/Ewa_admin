import React, { useState, useEffect } from 'react';
import axiosInstance from '../config/axios';
import { Plus, Edit, Trash, AlertTriangle } from 'lucide-react';
import { Search, Filter, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  sku?: string;
  price: number;
  discountPrice?: number;
  oldPrice?: number;
  cost?: number;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  subcategory?: {
    _id: string;
    name: string;
    slug: string;
  };
  brand: string;
  images: string[];
  stock: {
    quantity: number;
    lowStockThreshold: number;
    trackQuantity: boolean;
  };
  variants?: Array<{
    name: string;
    value: string;
    price: number;
    stock: number;
    sku: string;
    image?: string;
  }>;
  attributes?: {
    color?: string;
    size?: string[];
    material?: string;
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  status: 'draft' | 'active' | 'inactive' | 'out_of_stock';
  featured: boolean;
  tags?: string[];
  rating: {
    average: number;
    count: number;
  };
  shipping?: {
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    freeShipping: boolean;
    shippingClass?: string;
  };
  visibility: 'public' | 'private' | 'password_protected';
  publishedAt?: string;
  salesCount: number;
  createdAt: string;
  updatedAt: string;
}

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; productId: string | null; productName: string }>({
    show: false,
    productId: null,
    productName: ''
  });

  const fetchProducts = async (page = 1, statusFilter = '', search = '', categoryFilter = '') => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/products', {
        params: { 
          page: page,
          status: statusFilter || undefined,
          search: search || undefined,
          category: categoryFilter || undefined
        },
      });
      setProducts(data.products || data || []);
      setTotalPages(data.pages || 1);
      setCurrentPage(data.page || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axiosInstance.get('/categories');
      setCategories(data.categories || data || []);
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(currentPage, status, searchTerm, category);
  }, [currentPage, status, category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts(1, status, searchTerm, category);
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await axiosInstance.delete(`/products/${id}`);
      toast.success('Product deleted successfully');
      fetchProducts(currentPage, status, searchTerm, category);
      setDeleteConfirm({ show: false, productId: null, productName: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error deleting product');
    }
  };

  const showDeleteConfirm = (id: string, name: string) => {
    setDeleteConfirm({ show: true, productId: id, productName: name });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, productId: null, productName: '' });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      inactive: { color: 'bg-red-100 text-red-800', label: 'Inactive' },
      out_of_stock: { color: 'bg-orange-100 text-orange-800', label: 'Out of Stock' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getStockStatus = (stock: Product['stock']) => {
    if (!stock.trackQuantity) return 'Tracked';
    if (stock.quantity <= 0) return 'Out of Stock';
    if (stock.quantity <= stock.lowStockThreshold) return 'Low Stock';
    return stock.quantity.toString();
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'out_of_stock', label: 'Out of Stock' }
  ];

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && products.length === 0) {
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
        {/* <button
          onClick={() => navigate('/products/new')}
          className="btn btn-primary"
        >
          <Plus className="h-5 w-5 mr-1" /> Add New Product
        </button> */}
        <div className="flex space-x-2">
          <button
            onClick={() => navigate('/products/new')}
            className="btn btn-primary"
          >
            <Plus className="h-5 w-5 mr-1" /> Add New Product
          </button>
          <button
            onClick={() => navigate('/products/bulk-upload')}
            className="btn btn-secondary"
          >
            Bulk Upload
          </button>
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
            
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="input"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="input"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
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
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
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
                            src={product.images[0].startsWith('http') 
                              ? product.images[0] 
                              : `http://localhost:5000${product.images[0].startsWith('/') ? product.images[0] : `/${product.images[0]}`}`}
                            alt={product.name} 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                            }}
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
                      {product.sku && (
                        <div className="text-xs text-gray-400">SKU: {product.sku}</div>
                      )}
                    </td>
                    <td>
                      <div className="text-sm text-gray-900">{product.category.name}</div>
                      {product.subcategory && (
                        <div className="text-xs text-gray-500">{product.subcategory.name}</div>
                      )}
                    </td>
                    <td>
                      <div className="font-medium">₹{product.price.toFixed(2)}</div>
                      {product.discountPrice && product.discountPrice > 0 && (
                        <div className="text-xs text-red-500 line-through">
                          ₹{product.discountPrice.toFixed(2)}
                        </div>
                      )}
                      {product.oldPrice && product.oldPrice > 0 && (
                        <div className="text-xs text-gray-400">
                          Was: ₹{product.oldPrice.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`text-sm ${
                        product.stock.quantity > 0 
                          ? product.stock.quantity <= product.stock.lowStockThreshold
                            ? 'text-orange-600'
                            : 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {getStockStatus(product.stock)}
                      </span>
                    </td>
                    <td>
                      {getStatusBadge(product.status)}
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
                          onClick={() => showDeleteConfirm(product._id, product.name)}
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Delete Product
                </h3>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete <strong>"{deleteConfirm.productName}"</strong>? 
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteConfirm.productId && handleDeleteProduct(deleteConfirm.productId)}
                className="btn btn-danger"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;