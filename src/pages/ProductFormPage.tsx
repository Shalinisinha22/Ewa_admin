import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axios';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, Plus, X, Loader } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  sku?: string;
  price: number;
  discountPrice?: number;
  oldPrice?: number;
  cost?: number;
  category: string;
  subcategory?: string;
  brand: string;
  images: string[];
  videos: string[];
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
}

const initialFormData: ProductFormData = {
  name: '',
  slug: '',
  description: '',
  shortDescription: '',
  sku: '',
  price: 0,
  discountPrice: 0,
  oldPrice: 0,
  cost: 0,
  category: '',
  subcategory: '',
  brand: '',
  images: [],
  videos: [],
  stock: {
    quantity: 0,
    lowStockThreshold: 10,
    trackQuantity: true
  },
  variants: [],
  attributes: {},
  seo: {
    metaTitle: '',
    metaDescription: '',
    keywords: []
  },
  status: 'draft',
  featured: false,
  tags: [],
  shipping: {
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0
    },
    freeShipping: false,
    shippingClass: 'standard'
  },
  visibility: 'public'
};

interface AttributeInput {
  key: string;
  value: string;
}

interface VariantInput {
  name: string;
  value: string;
  price: number;
  stock: number;
  sku: string;
  image?: string;
}

const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [currentAttribute, setCurrentAttribute] = useState<AttributeInput>({ key: '', value: '' });
  const [currentVariant, setCurrentVariant] = useState<VariantInput>({
    name: '',
    value: '',
    price: 0,
    stock: 0,
    sku: ''
  });
  const [seoKeywords, setSeoKeywords] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');
  const isEditing = !!id;

  // Get subcategories based on selected category
  const filteredSubcategories = React.useMemo(() => {
    if (!formData.category) return [];
    return categories.filter(cat => cat._id !== formData.category);
  }, [categories, formData.category]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesResponse = await axiosInstance.get('/categories');
        setCategories(categoriesResponse.data.categories || categoriesResponse.data || []);
      } catch (err: any) {
        toast.error('Failed to fetch categories');
        console.error('Fetch error:', err);
      }
    };

    const fetchProduct = async () => {
      if (id) {
        try {
          setLoading(true);
          const { data } = await axiosInstance.get(`/products/${id}`);
          
          // Debug: Log the image URLs to see what we're getting
          console.log('Product data received:', data);
          console.log('Image URLs from backend:', data.images);
          
          setFormData({
            ...initialFormData,
            ...data,
            category: data.category?._id || '',
            subcategory: data.subcategory?._id || '',
            stock: data.stock || initialFormData.stock,
            variants: data.variants || [],
            attributes: data.attributes || {},
            seo: data.seo || initialFormData.seo,
            shipping: data.shipping || initialFormData.shipping,
            tags: data.tags || [],
            videos: data.videos || []
          });
          setSeoKeywords(data.seo?.keywords?.join(', ') || '');
          setTagsInput(data.tags?.join(', ') || '');
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

  // Debug: Log images whenever they change
  useEffect(() => {
    console.log('Current formData.images:', formData.images);
  }, [formData.images]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Auto-generate slug for new products
      if (name === 'name' && !isEditing) {
        const slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        setFormData(prev => ({ ...prev, slug }));
      }
    }
  };

  const handleStockChange = (field: string, value: number | boolean) => {
    setFormData(prev => ({
      ...prev,
      stock: {
        ...prev.stock,
        [field]: value
      }
    }));
  };

  const handleSeoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: value
      }
    }));
  };

  const handleKeywordsChange = (value: string) => {
    setSeoKeywords(value);
    const keywords = value.split(',').map(k => k.trim()).filter(k => k);
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords
      }
    }));
  };

  const handleTagsChange = (value: string) => {
    setTagsInput(value);
    const tags = value.split(',').map(t => t.trim()).filter(t => t);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const handleShippingChange = (field: string, value: number | boolean | string) => {
    setFormData(prev => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        [field]: value
      } as ProductFormData['shipping']
    }));
  };

  const handleAttributeAdd = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentAttribute.key.trim() && currentAttribute.value.trim()) {
      setFormData((prev) => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          [currentAttribute.key.trim()]: currentAttribute.value.trim(),
        },
      }));
      setCurrentAttribute({ key: '', value: '' });
    } else {
      toast.error('Both attribute name and value are required');
    }
  };

  const handleAttributeRemove = (key: string) => {
    const newAttributes = { ...formData.attributes } as Record<string, string>;
    delete newAttributes[key];
    setFormData((prev) => ({ ...prev, attributes: newAttributes }));
  };

  const handleVariantAdd = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentVariant.name.trim() && currentVariant.value.trim() && currentVariant.sku.trim()) {
      setFormData((prev) => ({
        ...prev,
        variants: [...(prev.variants || []), { ...currentVariant }],
      }));
      setCurrentVariant({
        name: '',
        value: '',
        price: 0,
        stock: 0,
        sku: ''
      });
    } else {
      toast.error('Variant name, value, and SKU are required');
    }
  };

  const handleVariantRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants?.filter((_, i) => i !== index) || []
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setImageUploading(true);
      const formData = new FormData();
      
      // Use the correct endpoint and field name for multiple files
      if (files.length === 1) {
        // Single file upload
        formData.append('image', files[0]);
        const { data } = await axiosInstance.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, data.url],
        }));
        toast.success('Image uploaded successfully');
      } else {
        // Multiple files upload
        for (let i = 0; i < files.length; i++) {
          formData.append('images', files[i]);
        }
        
        const { data } = await axiosInstance.post('/upload/images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        const imageUrls = data.map((item: any) => item.url);
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...imageUrls],
        }));
        toast.success(`Uploaded ${imageUrls.length} images successfully`);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.response?.data?.message || 'Failed to upload images');
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

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setVideoUploading(true);
      const formData = new FormData();
      
      // Use the correct endpoint and field name for multiple files
      if (files.length === 1) {
        // Single file upload
        formData.append('video', files[0]);
        const { data } = await axiosInstance.post('/upload/video', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        setFormData((prev) => ({
          ...prev,
          videos: [...prev.videos, data.url],
        }));
        toast.success('Video uploaded successfully');
      } else {
        // Multiple files upload
        for (let i = 0; i < files.length; i++) {
          formData.append('videos', files[i]);
        }
        
        const { data } = await axiosInstance.post('/upload/videos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        const videoUrls = data.map((item: any) => item.url);
        setFormData((prev) => ({
          ...prev,
          videos: [...prev.videos, ...videoUrls],
        }));
        toast.success(`Uploaded ${videoUrls.length} videos successfully`);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.response?.data?.message || 'Failed to upload videos');
    } finally {
      setVideoUploading(false);
    }
  };

  const handleVideoRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Clean up the data before sending
      const cleanedData = {
        ...formData,
        discountPrice: formData.discountPrice || undefined,
        oldPrice: formData.oldPrice || undefined,
        cost: formData.cost || undefined,
        subcategory: formData.subcategory || undefined,
        variants: formData.variants?.length ? formData.variants : undefined,
        attributes: Object.keys(formData.attributes || {}).length ? formData.attributes : undefined,
        seo: {
          metaTitle: formData.seo?.metaTitle || undefined,
          metaDescription: formData.seo?.metaDescription || undefined,
          keywords: formData.seo?.keywords?.length ? formData.seo.keywords : undefined
        },
        tags: formData.tags?.length ? formData.tags : undefined,
        shipping: {
          weight: formData.shipping?.weight || undefined,
          dimensions: formData.shipping?.dimensions || undefined,
          freeShipping: formData.shipping?.freeShipping || false,
          shippingClass: formData.shipping?.shippingClass || undefined
        }
      };
      
      if (isEditing) {
        await axiosInstance.put(`/products/${id}`, cleanedData);
        toast.success('Product updated successfully');
      } else {
        await axiosInstance.post('/products', cleanedData);
        toast.success('Product created successfully');
      }
      
      navigate('/products');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setLoading(true);
      
      // Clean up the data before sending, but keep status as draft
      const cleanedData = {
        ...formData,
        status: 'draft', // Force status to draft
        discountPrice: formData.discountPrice || undefined,
        oldPrice: formData.oldPrice || undefined,
        cost: formData.cost || undefined,
        subcategory: formData.subcategory || undefined,
        variants: formData.variants?.length ? formData.variants : undefined,
        attributes: Object.keys(formData.attributes || {}).length ? formData.attributes : undefined,
        seo: {
          metaTitle: formData.seo?.metaTitle || undefined,
          metaDescription: formData.seo?.metaDescription || undefined,
          keywords: formData.seo?.keywords?.length ? formData.seo.keywords : undefined
        },
        tags: formData.tags?.length ? formData.tags : undefined,
        shipping: {
          weight: formData.shipping?.weight || undefined,
          dimensions: formData.shipping?.dimensions || undefined,
          freeShipping: formData.shipping?.freeShipping || false,
          shippingClass: formData.shipping?.shippingClass || undefined
        }
      };
      
      if (isEditing) {
        await axiosInstance.put(`/products/${id}`, cleanedData);
        toast.success('Draft saved successfully');
      } else {
        const response = await axiosInstance.post('/products', cleanedData);
        toast.success('Draft saved successfully');
        // Navigate to edit page for the newly created draft
        navigate(`/products/${response.data._id}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving draft');
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/products')}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h1>
            {isEditing && formData.status === 'draft' && (
              <div className="flex items-center mt-1">
                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  Draft
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  This product is saved as a draft
                </span>
              </div>
            )}
          </div>
        </div>
        
        {isEditing && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Status:</span>
            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
              formData.status === 'draft' 
                ? 'bg-yellow-100 text-yellow-800'
                : formData.status === 'active'
                ? 'bg-green-100 text-green-800'
                : formData.status === 'inactive'
                ? 'bg-red-100 text-red-800'
                : 'bg-orange-100 text-orange-800'
            }`}>
              {formData.status.charAt(0).toUpperCase() + formData.status.slice(1).replace('_', ' ')}
            </span>
          </div>
        )}
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium">Basic Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                Slug*
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className="input"
                placeholder="product-slug"
                disabled={isEditing}
              />
              {isEditing && (
                <p className="mt-1 text-xs text-gray-500">
                  Slug cannot be changed after creation
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="input"
                placeholder="Product SKU"
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
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory
              </label>
              <select
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select Subcategory</option>
                {filteredSubcategories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status*
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visibility*
              </label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="password_protected">Password Protected</option>
              </select>
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

          {/* Pricing */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium mb-4">Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Regular Price*
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
                  Old Price
                </label>
                <input
                  type="number"
                  name="oldPrice"
                  value={formData.oldPrice}
                  onChange={handleChange}
                  className="input"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost Price
                </label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  className="input"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Stock Management */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium mb-4">Stock Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity*
                </label>
                <input
                  type="number"
                  value={formData.stock.quantity}
                  onChange={(e) => handleStockChange('quantity', parseInt(e.target.value) || 0)}
                  required
                  className="input"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  value={formData.stock.lowStockThreshold}
                  onChange={(e) => handleStockChange('lowStockThreshold', parseInt(e.target.value) || 0)}
                  className="input"
                  placeholder="10"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Track Quantity
                </label>
                <div className="mt-2">
                  <input
                    type="checkbox"
                    checked={formData.stock.trackQuantity}
                    onChange={(e) => handleStockChange('trackQuantity', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Track stock levels
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium mb-4">Product Description</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description
                </label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  className="input h-20"
                  placeholder="Brief product description (max 500 characters)"
                  maxLength={500}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Description*
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="input h-32"
                  placeholder="Detailed product description"
                  maxLength={2000}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Product Attributes */}
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
              {Object.entries(formData.attributes || {}).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                  <div>
                    <span className="font-medium">{key}:</span> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
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

          {/* Product Variants */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium mb-4">Product Variants</h2>
            
            <div className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-2">
              <input
                type="text"
                value={currentVariant.name}
                onChange={(e) => setCurrentVariant({...currentVariant, name: e.target.value})}
                className="input"
                placeholder="Variant Name (e.g., Size)"
              />
              <input
                type="text"
                value={currentVariant.value}
                onChange={(e) => setCurrentVariant({...currentVariant, value: e.target.value})}
                className="input"
                placeholder="Variant Value (e.g., XL)"
              />
              <input
                type="number"
                value={currentVariant.price}
                onChange={(e) => setCurrentVariant({...currentVariant, price: parseFloat(e.target.value) || 0})}
                className="input"
                placeholder="Price"
                step="0.01"
              />
              <input
                type="number"
                value={currentVariant.stock}
                onChange={(e) => setCurrentVariant({...currentVariant, stock: parseInt(e.target.value) || 0})}
                className="input"
                placeholder="Stock"
              />
              <input
                type="text"
                value={currentVariant.sku}
                onChange={(e) => setCurrentVariant({...currentVariant, sku: e.target.value})}
                className="input"
                placeholder="SKU"
              />
            </div>
            
            <button
              type="button"
              onClick={handleVariantAdd}
              className="btn btn-secondary mb-4"
            >
              <Plus className="h-5 w-5 mr-1" /> Add Variant
            </button>
            
            <div className="space-y-2">
              {formData.variants?.map((variant, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <div className="flex space-x-4">
                    <span><strong>{variant.name}:</strong> {variant.value}</span>
                    <span>Price: ₹{variant.price}</span>
                    <span>Stock: {variant.stock}</span>
                    <span>SKU: {variant.sku}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleVariantRemove(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SEO Settings */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium mb-4">SEO Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.seo?.metaTitle || ''}
                  onChange={(e) => handleSeoChange('metaTitle', e.target.value)}
                  className="input"
                  placeholder="SEO meta title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <input
                  type="text"
                  value={formData.seo?.metaDescription || ''}
                  onChange={(e) => handleSeoChange('metaDescription', e.target.value)}
                  className="input"
                  placeholder="SEO meta description"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={seoKeywords}
                  onChange={(e) => handleKeywordsChange(e.target.value)}
                  className="input"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium mb-4">Tags</h2>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => handleTagsChange(e.target.value)}
              className="input"
              placeholder="tag1, tag2, tag3"
            />
          </div>

          {/* Shipping */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium mb-4">Shipping Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={formData.shipping?.weight || 0}
                  onChange={(e) => handleShippingChange('weight', parseFloat(e.target.value) || 0)}
                  className="input"
                  placeholder="0.0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Class
                </label>
                <select
                  value={formData.shipping?.shippingClass || 'standard'}
                  onChange={(e) => handleShippingChange('shippingClass', e.target.value)}
                  className="input"
                >
                  <option value="standard">Standard</option>
                  <option value="express">Express</option>
                  <option value="overnight">Overnight</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Free Shipping
                </label>
                <div className="mt-2">
                  <input
                    type="checkbox"
                    checked={formData.shipping?.freeShipping || false}
                    onChange={(e) => handleShippingChange('freeShipping', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Offer free shipping for this product
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium mb-4">Product Images</h2>

           
            
        
            
            <div className="mb-4">
              <label className="btn btn-secondary">
                <Plus className="h-5 w-5 mr-1" /> Upload Images
                <input
                  type="file"
                  onChange={handleImageUpload}
                  className="hidden"
                  accept="image/*"
                  multiple
                  disabled={imageUploading}
                />
              </label>
              {imageUploading && (
                <span className="ml-3 text-sm text-gray-500 inline-flex items-center">
                  <Loader className="animate-spin h-4 w-4 mr-1" /> Uploading...
                </span>
              )}
              <p className="mt-2 text-sm text-gray-500">
                You can select multiple images. Supported formats: JPG, PNG, GIF, WebP
              </p>
 
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {formData.images.map((image, index) => {
             
                // Ensure the URL starts with http://localhost:5000 for relative paths
                const fullImageUrl = `http://localhost:5000${image}`;
                
                console.log(`Image ${index + 1}:`, {
                  original: image,
                  cleaned:fullImageUrl,
                  full: fullImageUrl
                });
                
                return (
                  <div key={index} className="relative border rounded-md overflow-hidden h-40 bg-gray-50">
                    <img 
                      src={fullImageUrl}
                      alt={`Product ${index + 1}`} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.error('Image failed to load:', {
                          original: image,
                          cleaned: fullImageUrl,
                          full: fullImageUrl,
                          error: e
                        });
                        // Use a data URL for placeholder instead of file path
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', fullImageUrl);
                      }}
                    />
                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Image {index + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleImageRemove(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
              {formData.images.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p>No images uploaded yet</p>
                  <p className="text-sm">Upload product images to showcase your product</p>
                </div>
              )}
            </div>
          </div>

          {/* Product Videos */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium mb-4">Product Videos</h2>
            
            <div className="mb-4">
              <label className="btn btn-secondary">
                <Plus className="h-5 w-5 mr-1" /> Upload Videos
                <input
                  type="file"
                  onChange={handleVideoUpload}
                  className="hidden"
                  accept="video/*"
                  multiple
                  disabled={videoUploading}
                />
              </label>
              {videoUploading && (
                <span className="ml-3 text-sm text-gray-500 inline-flex items-center">
                  <Loader className="animate-spin h-4 w-4 mr-1" /> Uploading...
                </span>
              )}
              <p className="mt-2 text-sm text-gray-500">
                You can select multiple videos. Supported formats: MP4, WebM, MOV, AVI
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {formData.videos.map((video, index) => {
                // Clean up malformed URLs (remove trailing quotes, fix backslashes, and fix paths)
                let cleanVideoUrl = video.replace(/['"]$/, ''); // Remove trailing quotes
                cleanVideoUrl = cleanVideoUrl.replace(/\\/g, '/'); // Replace backslashes with forward slashes
                
                const fullVideoUrl = cleanVideoUrl.startsWith('http') 
                  ? cleanVideoUrl 
                  : `http://localhost:5000${cleanVideoUrl.startsWith('/') ? cleanVideoUrl : `/${cleanVideoUrl}`}`; // Add backend URL if relative
                
                return (
                  <div key={index} className="relative border rounded-md overflow-hidden h-48 bg-gray-50">
                    <video 
                      src={fullVideoUrl}
                      controls
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLVideoElement;
                        console.error('Failed to load video:', fullVideoUrl, 'Original:', video);
                      }}
                      onLoadStart={() => {
                        console.log('Video loading started:', fullVideoUrl);
                      }}
                    />
                    <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded">
                      Video {index + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleVideoRemove(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
              {formData.videos.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p>No videos uploaded yet</p>
                  <p className="text-sm">Upload product videos to showcase your product in action</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <p>💡 <strong>Tip:</strong> Use "Save Draft" to save your work without publishing. Drafts won't be visible to customers.</p>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => navigate('/products')}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                  ) : (
                    <Save className="h-5 w-5 mr-2" />
                  )}
                  Save Draft
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
                {/* <button
                  type="button"
                  onClick={async () => {
                    try {
                      const response = await fetch('http://localhost:5000/api/test-image');
                      const data = await response.json();
                      console.log('Backend test result:', data);
                      toast.success(`Backend test: ${data.message}`);
                    } catch (error) {
                      console.error('Backend test failed:', error);
                      toast.error('Backend test failed');
                    }
                  }}
                  className="mt-2 ml-2 btn btn-outline text-xs"
                >
                  Test Backend
                </button> */}
                {/* <button
                  type="button"
                  onClick={async () => {
                    try {
                      const response = await fetch('http://localhost:5000/api/test-cors');
                      const data = await response.json();
                      console.log('CORS test result:', data);
                      toast.success(`CORS test: ${data.message}`);
                    } catch (error) {
                      console.error('CORS test failed:', error);
                      toast.error('CORS test failed');
                    }
                  }}
                  className="mt-2 ml-2 btn btn-outline text-xs"
                >
                  Test CORS
                </button> */}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormPage;