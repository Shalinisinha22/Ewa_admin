import React, { useState } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../config/axios';

interface UploadedProduct {
  _id: string;
  name: string;
  price: number;
  category: {
    _id: string;
    name: string;
  };
  brand: string;
  stock: {
    quantity: number;
  };
  sku?: string;
  status: string;
  createdAt: string;
}

const BulkUploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    successCount: number;
    errorCount: number;
    errors: string[];
    products?: UploadedProduct[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setUploadResults(null);
    } else {
      toast.error('Please select a valid CSV file');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('csv', file);

      const { data } = await axiosInstance.post('/products/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadResults({
        successCount: data.successCount,
        errorCount: data.errorCount,
        errors: data.errors || [],
        products: data.products || [],
      });
      
      if (data.successCount > 0) {
        toast.success(`Successfully uploaded ${data.successCount} products`);
      }
      
      if (data.errorCount > 0) {
        toast.error(`${data.errorCount} products failed to upload`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload failed');
      setUploading(false);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `name,description,price,discountPrice,brand,category,countInStock,sku,color,material,size,tags
"Sample Product","Product description",99.99,79.99,"Brand Name","Women",10,"SKU001","black","leather","S|M|L","summer|casual"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Bulk Product Upload</h1>
        <p className="text-gray-600">Upload multiple products using CSV file</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="card">
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Upload CSV File</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <div className="mb-4">
                <label className="cursor-pointer">
                  <span className="btn btn-primary">
                    Choose CSV File
                  </span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              {file && (
                <div className="text-sm text-gray-600">
                  Selected: {file.name}
                </div>
              )}
            </div>

            {file && (
              <div className="mt-4">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn btn-primary w-full"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    'Upload Products'
                  )}
                </button>
              </div>
            )}

            {uploadResults && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Upload Results</h3>
                <div className="flex items-center text-green-600 mb-2">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {uploadResults.successCount} products uploaded successfully
                </div>
                {uploadResults.errors.length > 0 && (
                  <div>
                    <div className="flex items-center text-red-600 mb-2">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {uploadResults.errors.length} errors found:
                    </div>
                    <ul className="text-sm text-red-600 ml-6">
                      {uploadResults.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Instructions Section */}
        <div className="card">
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Instructions</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">1. Download Template</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Start by downloading our CSV template with the correct format.
                </p>
                <button
                  onClick={downloadTemplate}
                  className="btn btn-outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </button>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">2. Fill Product Data</h3>
                <p className="text-sm text-gray-600">
                  Fill in your product information following the template format. Required fields are marked with *.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">3. Upload CSV</h3>
                <p className="text-sm text-gray-600">
                  Upload your completed CSV file. The system will validate and import your products.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">Important Notes:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Maximum file size: 10MB</li>
                <li>• Maximum 1000 products per upload</li>
                <li>• Use pipe (|) to separate multiple values</li>
                <li>• Ensure categories exist before uploading</li>
                <li>• Image URLs should be publicly accessible</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded Products Preview */}
      {uploadResults && uploadResults.products && uploadResults.products.length > 0 && (
        <div className="card mt-6">
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Recently Uploaded Products
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left">Product Name</th>
                    <th className="px-3 py-2 text-left">Price</th>
                    <th className="px-3 py-2 text-left">Category</th>
                    <th className="px-3 py-2 text-left">Brand</th>
                    <th className="px-3 py-2 text-left">Stock</th>
                    <th className="px-3 py-2 text-left">SKU</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadResults.products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 border-t font-medium">{product.name}</td>
                      <td className="px-3 py-2 border-t">₹{product.price.toFixed(2)}</td>
                      <td className="px-3 py-2 border-t">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {product.category.name}
                        </span>
                      </td>
                      <td className="px-3 py-2 border-t">{product.brand}</td>
                      <td className="px-3 py-2 border-t">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.stock.quantity > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stock.quantity}
                        </span>
                      </td>
                      <td className="px-3 py-2 border-t text-gray-500">{product.sku || '-'}</td>
                      <td className="px-3 py-2 border-t">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : product.status === 'draft'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 border-t text-gray-500">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Showing {uploadResults.products.length} of {uploadResults.successCount} uploaded products
            </div>
          </div>
        </div>
      )}

      {/* Sample Data Format (shown when no products uploaded) */}
      {(!uploadResults || !uploadResults.products || uploadResults.products.length === 0) && (
        <div className="card mt-6">
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Sample Data Format</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left">name*</th>
                    <th className="px-3 py-2 text-left">price*</th>
                    <th className="px-3 py-2 text-left">category*</th>
                    <th className="px-3 py-2 text-left">brand*</th>
                    <th className="px-3 py-2 text-left">stock*</th>
                    <th className="px-3 py-2 text-left">sku</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-2 border-t">Leather Handbag</td>
                    <td className="px-3 py-2 border-t">79.99</td>
                    <td className="px-3 py-2 border-t">accessories</td>
                    <td className="px-3 py-2 border-t">UrbanStyle</td>
                    <td className="px-3 py-2 border-t">50</td>
                    <td className="px-3 py-2 border-t">US-HB-001</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border-t">Evening Gown</td>
                    <td className="px-3 py-2 border-t">149.99</td>
                    <td className="px-3 py-2 border-t">dress</td>
                    <td className="px-3 py-2 border-t">GlamourWear</td>
                    <td className="px-3 py-2 border-t">25</td>
                    <td className="px-3 py-2 border-t">GW-EG-2024</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkUploadPage;