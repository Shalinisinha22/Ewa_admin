import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axios';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, Plus, X, Loader } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  productType: string;
}

interface ProductType {
  _id: string;
  value: string;
  label: string;
}

interface ProductFormData {
  name: string;
  price: string;
  discountPrice: string;
  brand: string;
  category: string;
  countInStock: string;
  description: string;
  images: string[];
  productType: string;
  featured: boolean;
  attributes: Record<string, string>;
}

const initialFormData: ProductFormData = {
  name: '',
  price: '',
  discountPrice: '',
  brand: '',
  category: '',
  countInStock: '',
  description: '',
  images: [],
  productType: 'dress',
  featured: false,
  attributes: {},
};

interface AttributeInput {
  key: string;
  value: string;
}

const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [currentAttribute, setCurrentAttribute] = useState<AttributeInput>({ key: '', value: '' });
  const [selectedProductType, setSelectedProductType] = useState<string>('');
  const isEditing = !!id;

  // Get filtered categories based on selected product type
  const filteredCategories = categories?.filter(cat => 
    cat.productType === selectedProductType?._id
  ) || [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, productTypesResponse] = await Promise.all([
          axiosInstance.get('/categories'),
          axiosInstance.get('/producttypes')
        ]);
        
        setCategories(categoriesResponse.data || []);
        setProductTypes(productTypesResponse.data || []);
        console.log(categoriesResponse.data);
      } catch (err: any) {
        toast.error('Failed to fetch required data');
      }
    };

    const fetchProduct = async () => {
      if (id) {
        try {
          setLoading(true);
          const { data } = await axiosInstance.get(`/products/${id}`);
          setFormData({
            name: data.name || '',
            price: data.price?.toString() || '',
            discountPrice: data.discountPrice?.toString() || '',
            brand: data.brand || '',
            category: data.category?._id || '',
            countInStock: data.countInStock?.toString() || '',
            description: data.description || '',
            images: data.images || [],
            productType: data.productType || 'dress',
            featured: data.featured || false,
            attributes: data.attributes || {},
          });
        } catch (err: any) {
          toast.error('Failed to fetch product');
          navigate('/products');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
    if (id) {
      fetchProduct();
    }
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (name === 'productType') {
      const selected = productTypes.find(type => type.value === value);
      setSelectedProductType(selected?._id || '');
    }
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAttributeAdd = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission
    
    if (currentAttribute.key.trim() && currentAttribute.value.trim()) {
      setFormData((prev) => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          [currentAttribute.key.trim()]: currentAttribute.value.trim(),
        },
      }));
      // Reset the input fields
      setCurrentAttribute({ key: '', value: '' });
    } else {
      toast.error('Both attribute name and value are required');
    }
  };

  const handleAttributeRemove = (key: string) => {
    const newAttributes = { ...formData.attributes };
    delete newAttributes[key];
    setFormData((prev) => ({ ...prev, attributes: newAttributes }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const formData = new FormData();
    formData.append('image', files[0]);
    
    try {
      setImageUploading(true);
      const { data } = await axiosInstance.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, data.path],
      }));
      
      toast.success('Image uploaded successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleImageRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
            const selectedProductType = productTypes.find(type => type.value === formData.productType);

      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : 0,
        brand: formData.brand,
        category: formData.category,
        countInStock: parseInt(formData.countInStock),
        description: formData.description,
        images: formData.images,
        productType: selectedProductType?._id, 
        featured: formData.featured,
        attributes: formData.attributes,
      };
      
      if (isEditing) {
        await axiosInstance.put(`/products/${id}`, productData);
        toast.success('Product updated successfully');
      } else {
        await axiosInstance.post('/products', productData);
        toast.success('Product created successfully');
      }
      
      navigate('/products');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/products')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold">
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium">Basic Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Type*
              </label>
              <select
                name="productType"
                value={formData.productType}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Select Product Type</option>
                {productTypes.map((type) => (
                  <option key={type._id} value={type.value}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price*
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="input"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Price
              </label>
              <input
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
                className="input"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand*
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                className="input"
                placeholder="Enter brand name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category*
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Select Category</option>
                {filteredCategories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity*
              </label>
              <input
                type="number"
                name="countInStock"
                value={formData.countInStock}
                onChange={handleChange}
                required
                className="input"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Featured Product
              </label>
              <div className="mt-2">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">
                  Display this product on the featured section
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-b border-gray-200">
            <h2 className="text-lg font-medium mb-4">Product Description</h2>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="input h-32"
              placeholder="Enter product description"
            ></textarea>
          </div>

          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium mb-4">Product Attributes</h2>
            
            <div className="mb-4 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={currentAttribute.key}
                onChange={(e) => setCurrentAttribute({...currentAttribute, key: e.target.value})}
                className="input"
                placeholder="Attribute (e.g., Color, Size)"
              />
              <input
                type="text"
                value={currentAttribute.value}
                onChange={(e) => setCurrentAttribute({...currentAttribute, value: e.target.value})}
                className="input"
                placeholder="Value (e.g., Red, XL)"
              />
              <button
                type="button"
                onClick={handleAttributeAdd}
                className="btn btn-secondary"
              >
                <Plus className="h-5 w-5 mr-1" /> Add
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(formData.attributes).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                  <div>
                    <span className="font-medium">{key}:</span> {value}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAttributeRemove(key)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium mb-4">Product Images</h2>
            
            <div className="mb-4">
              <label className="btn btn-secondary">
                <Plus className="h-5 w-5 mr-1" /> Upload Image
                <input
                  type="file"
                  onChange={handleImageUpload}
                  className="hidden"
                  accept="image/*"
                  disabled={imageUploading}
                />
              </label>
              {imageUploading && (
                <span className="ml-3 text-sm text-gray-500 inline-flex items-center">
                  <Loader className="animate-spin h-4 w-4 mr-1" /> Uploading...
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative border rounded-md overflow-hidden h-40">
                  <img 
                    src={`http://localhost:5000${image}`}
                    alt={`Product ${index + 1}`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.jpg'; // Add a placeholder image
                      console.error('Failed to load image:', image);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleImageRemove(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {formData.images.length === 0 && (
                <div className="border rounded-md overflow-hidden h-40 flex items-center justify-center bg-gray-50">
                  <p className="text-gray-400 text-sm">No images uploaded</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="btn btn-outline mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  {isEditing ? 'Update Product' : 'Create Product'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormPage;