import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axios';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, Plus, X, Loader } from 'lucide-react';
import { uploadImageToCloudinary } from '../config/cloudinary';
interface Category {
  _id: string;
  name: string;
}

interface ProductFormData {
  name: string;
  price: string;
  discountPrice: string;
  oldPrice: string;
  brand: string;
  category: string;
  countInStock: string;
  description: string;
  images: string[];
  featured: boolean;
  attributes: Record<string, string>;
  color: string;
  material: string;
  size: string[];
  careInstructions: string;
  availability: string;
  sku: string;
  countryOfOrigin: string;
  warranty: string;
  deliveryInfo: string;
  offers: string[];
  features: string[];
  status: 'draft' | 'live';
  stock: string;
}

const initialFormData: ProductFormData = {
  name: '',
  price: '',
  discountPrice: '',
  oldPrice: '',
  brand: '',
  category: '',
  countInStock: '',
  description: '',
  images: [],
  featured: false,
  attributes: {},
  color: '',
  material: '',
  size: [],
  careInstructions: '',
  availability: 'In Stock',
  sku: '',
  countryOfOrigin: 'India',
  warranty: '',
  deliveryInfo: '',
  offers: [],
  features: [],
  status: 'draft',
  stock: '',
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
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [currentAttribute, setCurrentAttribute] = useState<AttributeInput>({ key: '', value: '' });
  const [currentOffer, setCurrentOffer] = useState('');
  const [currentFeature, setCurrentFeature] = useState('');
  const [currentSize, setCurrentSize] = useState('');
  const isEditing = !!id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesResponse = await axiosInstance.get('/categories');
        
        setCategories(categoriesResponse.data);
      } catch (err: any) {
        toast.error('Failed to fetch required data');
        console.error('Fetch error:', err);
      }
    };

    const fetchProduct = async () => {
      if (id) {
        try {
          setLoading(true);
          const { data } = await axiosInstance.get(`/products/${id}`);
          setFormData({
            ...initialFormData,
            ...data,
            price: data.price?.toString() || '',
            discountPrice: data.discountPrice?.toString() || '',
            oldPrice: data.oldPrice?.toString() || '',
            category: data.category?._id || '',
            countInStock: data.countInStock?.toString() || '',
            stock: data.stock?.toString() || '',
            images: data.images || [], // Store complete image URLs
            size: data.size || [],
            offers: data.offers || [],
            features: data.features || [],
            status: data.status || 'draft',
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
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleOfferAdd = () => {
    if (currentOffer.trim()) {
      setFormData((prev) => ({
        ...prev,
        offers: [...prev.offers, currentOffer.trim()],
      }));
      setCurrentOffer('');
    }
  };

  const handleOfferRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      offers: prev.offers.filter((_, i) => i !== index),
    }));
  };

  const handleFeatureAdd = () => {
    if (currentFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, currentFeature.trim()],
      }));
      setCurrentFeature('');
    }
  };

  const handleFeatureRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSizeAdd = () => {
    if (currentSize.trim()) {
      setFormData((prev) => ({
        ...prev,
        size: [...prev.size, currentSize.trim()],
      }));
      setCurrentSize('');
    }
  };

  const handleSizeRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      size: prev.size.filter((_, i) => i !== index),
    }));
  };

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  try {
    setImageUploading(true);
    const imageUrl = await uploadImageToCloudinary(files[0]);
    
    // Store the complete URL in the form data
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, imageUrl],
    }));
    toast.success('Image uploaded successfully');
  } catch (err: any) {
    toast.error('Failed to upload image');
    console.error('Upload error:', err);
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

      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : 0,
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : 0,
        brand: formData.brand,
        category: formData.category,
        countInStock: parseInt(formData.countInStock),
        stock: parseInt(formData.stock),
        description: formData.description,
        images: formData.images, // Send complete image URLs
        featured: formData.featured,
        attributes: formData.attributes,
        color: formData.color,
        material: formData.material,
        size: formData.size,
        careInstructions: formData.careInstructions,
        availability: formData.availability,
        sku: formData.sku,
        countryOfOrigin: formData.countryOfOrigin,
        warranty: formData.warranty,
        deliveryInfo: formData.deliveryInfo,
        offers: formData.offers,
        features: formData.features,
        status: formData.status,
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
                Stock*
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                className="input"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Black, Red"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material
              </label>
              <input
                type="text"
                name="material"
                value={formData.material}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Cotton, Leather"
              />
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
                placeholder="e.g., US-HB-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country of Origin
              </label>
              <input
                type="text"
                name="countryOfOrigin"
                value={formData.countryOfOrigin}
                onChange={handleChange}
                className="input"
                placeholder="India"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warranty
              </label>
              <input
                type="text"
                name="warranty"
                value={formData.warranty}
                onChange={handleChange}
                className="input"
                placeholder="e.g., 6 months, 1 year"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Availability
              </label>
              <select
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                className="input"
              >
                <option value="In Stock">In Stock</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="Pre-order">Pre-order</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Status*
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="draft">Draft</option>
                <option value="live">Live</option>
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
            <h2 className="text-lg font-medium mb-4">Care Instructions & Delivery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Care Instructions
                </label>
                <textarea
                  name="careInstructions"
                  value={formData.careInstructions}
                  onChange={handleChange}
                  className="input h-20"
                  placeholder="e.g., Machine wash cold, Dry clean only"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Info
                </label>
                <textarea
                  name="deliveryInfo"
                  value={formData.deliveryInfo}
                  onChange={handleChange}
                  className="input h-20"
                  placeholder="e.g., Delivered in 3-5 business days"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium mb-4">Product Sizes</h2>
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={currentSize}
                onChange={(e) => setCurrentSize(e.target.value)}
                className="input"
                placeholder="Size (e.g., S, M, L, XL)"
              />
              <button
                type="button"
                onClick={handleSizeAdd}
                className="btn btn-secondary"
              >
                <Plus className="h-5 w-5 mr-1" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.size.map((size, index) => (
                <div key={index} className="flex items-center bg-gray-100 px-3 py-1 rounded-md">
                  <span>{size}</span>
                  <button
                    type="button"
                    onClick={() => handleSizeRemove(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
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
            <h2 className="text-lg font-medium mb-4">Product Offers</h2>
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={currentOffer}
                onChange={(e) => setCurrentOffer(e.target.value)}
                className="input"
                placeholder="Offer (e.g., 10% off on first purchase)"
              />
              <button
                type="button"
                onClick={handleOfferAdd}
                className="btn btn-secondary"
              >
                <Plus className="h-5 w-5 mr-1" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.offers.map((offer, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                  <span>{offer}</span>
                  <button
                    type="button"
                    onClick={() => handleOfferRemove(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium mb-4">Product Features</h2>
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={currentFeature}
                onChange={(e) => setCurrentFeature(e.target.value)}
                className="input"
                placeholder="Feature (e.g., Adjustable strap)"
              />
              <button
                type="button"
                onClick={handleFeatureAdd}
                className="btn btn-secondary"
              >
                <Plus className="h-5 w-5 mr-1" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                  <span>{feature}</span>
                  <button
                    type="button"
                    onClick={() => handleFeatureRemove(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
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
                    src={image}
                    alt={`Product ${index + 1}`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.jpg';
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