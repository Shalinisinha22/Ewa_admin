import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Image as ImageIcon, ExternalLink, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../config/axios';

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  mobileImage?: string;
  link?: {
    url: string;
    text: string;
    target: '_self' | '_blank';
  };
  position: 'hero' | 'sidebar' | 'popup' | 'header' | 'footer' | 'category' | 'product';
  placement: {
    page: 'home' | 'category' | 'product' | 'cart' | 'checkout' | 'all';
    categories?: string[];
    products?: string[];
  };
  display?: {
    startDate?: string;
    endDate?: string;
    schedule?: {
      days: string[];
      startTime: string;
      endTime: string;
    };
  };
  targeting?: {
    devices: string[];
    userTypes: string[];
    countries: string[];
    minOrderValue?: number;
  };
  style?: {
    backgroundColor?: string;
    textColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    borderRadius?: number;
    padding?: string;
    margin?: string;
    customCSS?: string;
  };
  animation?: {
    type: 'none' | 'fade' | 'slide' | 'zoom' | 'bounce';
    duration: number;
    delay: number;
  };
  status: 'active' | 'inactive' | 'scheduled';
  priority: number;
  analytics: {
    impressions: number;
    clicks: number;
    conversions: number;
  };
  createdAt: string;
  updatedAt: string;
}

const BannersPage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    mobileImage: '',
    linkUrl: '',
    linkText: '',
    linkTarget: '_self' as '_self' | '_blank',
    position: 'hero' as 'hero' | 'sidebar' | 'popup' | 'header' | 'footer' | 'category' | 'product',
    placementPage: 'home' as 'home' | 'category' | 'product' | 'cart' | 'checkout' | 'all',
    startDate: '',
    endDate: '',
    status: 'active' as 'active' | 'inactive' | 'scheduled',
    priority: '0',
    backgroundColor: '',
    textColor: '',
    buttonColor: '',
    buttonTextColor: '',
    borderRadius: '',
    customCSS: '',
    animationType: 'none' as 'none' | 'fade' | 'slide' | 'zoom' | 'bounce',
    animationDuration: '500',
    animationDelay: '0',
  });

  // Fetch banners from API
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/banners', {
        params: { search: searchTerm || undefined }
      });
      setBanners(data.banners || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch banners');
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [searchTerm]);

  // Handle image upload
  const handleImageUpload = async (file: File, type: 'image' | 'mobileImage') => {
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file);

      const { data } = await axiosInstance.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormData(prev => ({
        ...prev,
        [type]: data.url
      }));

      toast.success('Image uploaded successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const bannerData = {
        title: formData.title,
        subtitle: formData.subtitle,
        description: formData.description,
        image: formData.image,
        mobileImage: formData.mobileImage || undefined,
        link: formData.linkUrl ? {
          url: formData.linkUrl,
          text: formData.linkText,
          target: formData.linkTarget,
        } : undefined,
        position: formData.position,
        placement: {
          page: formData.placementPage,
        },
        display: {
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        },
        status: formData.status,
        priority: parseInt(formData.priority),
        style: {
          backgroundColor: formData.backgroundColor || undefined,
          textColor: formData.textColor || undefined,
          buttonColor: formData.buttonColor || undefined,
          buttonTextColor: formData.buttonTextColor || undefined,
          borderRadius: formData.borderRadius ? parseInt(formData.borderRadius) : undefined,
          customCSS: formData.customCSS || undefined,
        },
        animation: {
          type: formData.animationType,
          duration: parseInt(formData.animationDuration),
          delay: parseInt(formData.animationDelay),
        },
      };

      if (editingBanner) {
        await axiosInstance.put(`/banners/${editingBanner._id}`, bannerData);
        toast.success('Banner updated successfully');
      } else {
        await axiosInstance.post('/banners', bannerData);
        toast.success('Banner created successfully');
      }

      resetForm();
      fetchBanners();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save banner');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      image: '',
      mobileImage: '',
      linkUrl: '',
      linkText: '',
      linkTarget: '_self',
      position: 'hero',
      placementPage: 'home',
      startDate: '',
      endDate: '',
      status: 'active',
      priority: '0',
      backgroundColor: '',
      textColor: '',
      buttonColor: '',
      buttonTextColor: '',
      borderRadius: '',
      customCSS: '',
      animationType: 'none',
      animationDuration: '500',
      animationDelay: '0',
    });
    setEditingBanner(null);
    setShowForm(false);
  };

  const handleEdit = (banner: Banner) => {
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      image: banner.image,
      mobileImage: banner.mobileImage || '',
      linkUrl: banner.link?.url || '',
      linkText: banner.link?.text || '',
      linkTarget: banner.link?.target || '_self',
      position: banner.position,
      placementPage: banner.placement.page,
      startDate: banner.display?.startDate ? new Date(banner.display.startDate).toISOString().split('T')[0] : '',
      endDate: banner.display?.endDate ? new Date(banner.display.endDate).toISOString().split('T')[0] : '',
      status: banner.status,
      priority: banner.priority.toString(),
      backgroundColor: banner.style?.backgroundColor || '',
      textColor: banner.style?.textColor || '',
      buttonColor: banner.style?.buttonColor || '',
      buttonTextColor: banner.style?.buttonTextColor || '',
      borderRadius: banner.style?.borderRadius?.toString() || '',
      customCSS: banner.style?.customCSS || '',
      animationType: banner.animation?.type || 'none',
      animationDuration: banner.animation?.duration.toString() || '500',
      animationDelay: banner.animation?.delay.toString() || '0',
    });
    setEditingBanner(banner);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await axiosInstance.delete(`/banners/${id}`);
        toast.success('Banner deleted successfully');
        fetchBanners();
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to delete banner');
      }
    }
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'active':
        return 'badge-success';
      case 'inactive':
        return 'badge-warning';
      case 'scheduled':
        return 'badge-info';
      default:
        return 'badge bg-gray-100 text-gray-800';
    }
  };

  const getPositionBadgeClass = (position: string): string => {
    switch (position) {
      case 'hero':
        return 'badge-primary';
      case 'sidebar':
        return 'badge-info';
      case 'popup':
        return 'badge-warning';
      case 'header':
        return 'badge-success';
      case 'footer':
        return 'badge-secondary';
      default:
        return 'badge bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredBanners = banners;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Banner Management</h1>
          <p className="text-gray-600">Manage homepage banners and promotional content</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Banner
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">
              {editingBanner ? 'Edit Banner' : 'Create New Banner'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Banner Title*
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input"
                    placeholder="Summer Sale 2024"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="input"
                    placeholder="Limited time offer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  placeholder="Banner description"
                  rows={3}
                />
              </div>

              {/* Image Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Desktop Image*
                  </label>
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="input"
                      placeholder="https://example.com/banner.jpg"
                      required
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, 'image');
                        }}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="btn btn-outline cursor-pointer"
                        style={{ pointerEvents: uploadingImage ? 'none' : 'auto' }}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Image
                  </label>
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={formData.mobileImage}
                      onChange={(e) => setFormData({ ...formData, mobileImage: e.target.value })}
                      className="input"
                      placeholder="https://example.com/banner-mobile.jpg"
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, 'mobileImage');
                        }}
                        className="hidden"
                        id="mobile-image-upload"
                      />
                      <label
                        htmlFor="mobile-image-upload"
                        className="btn btn-outline cursor-pointer"
                        style={{ pointerEvents: uploadingImage ? 'none' : 'auto' }}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingImage ? 'Uploading...' : 'Upload Mobile Image'}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Link Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    className="input"
                    placeholder="https://example.com/products"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link Text
                  </label>
                  <input
                    type="text"
                    value={formData.linkText}
                    onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                    className="input"
                    placeholder="Shop Now"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link Target
                  </label>
                  <select
                    value={formData.linkTarget}
                    onChange={(e) => setFormData({ ...formData, linkTarget: e.target.value as '_self' | '_blank' })}
                    className="input"
                  >
                    <option value="_self">Same Window</option>
                    <option value="_blank">New Window</option>
                  </select>
                </div>
              </div>

              {/* Position and Placement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position*
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value as any })}
                    className="input"
                    required
                  >
                    <option value="hero">Hero Banner</option>
                    <option value="sidebar">Sidebar Banner</option>
                    <option value="popup">Popup Banner</option>
                    <option value="header">Header Banner</option>
                    <option value="footer">Footer Banner</option>
                    <option value="category">Category Banner</option>
                    <option value="product">Product Banner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Placement Page
                  </label>
                  <select
                    value={formData.placementPage}
                    onChange={(e) => setFormData({ ...formData, placementPage: e.target.value as any })}
                    className="input"
                  >
                    <option value="home">Home Page</option>
                    <option value="category">Category Pages</option>
                    <option value="product">Product Pages</option>
                    <option value="cart">Cart Page</option>
                    <option value="checkout">Checkout Page</option>
                    <option value="all">All Pages</option>
                  </select>
                </div>
              </div>

              {/* Display Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="input"
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="input"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              {/* Style Settings */}
              <div className="border-t pt-4">
                <h3 className="text-md font-medium mb-3">Style Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Background Color
                    </label>
                    <input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="input h-10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Text Color
                    </label>
                    <input
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      className="input h-10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Button Color
                    </label>
                    <input
                      type="color"
                      value={formData.buttonColor}
                      onChange={(e) => setFormData({ ...formData, buttonColor: e.target.value })}
                      className="input h-10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Button Text Color
                    </label>
                    <input
                      type="color"
                      value={formData.buttonTextColor}
                      onChange={(e) => setFormData({ ...formData, buttonTextColor: e.target.value })}
                      className="input h-10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Border Radius (px)
                    </label>
                    <input
                      type="number"
                      value={formData.borderRadius}
                      onChange={(e) => setFormData({ ...formData, borderRadius: e.target.value })}
                      className="input"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom CSS
                  </label>
                  <textarea
                    value={formData.customCSS}
                    onChange={(e) => setFormData({ ...formData, customCSS: e.target.value })}
                    className="input"
                    placeholder="Custom CSS styles"
                    rows={3}
                  />
                </div>
              </div>

              {/* Animation Settings */}
              <div className="border-t pt-4">
                <h3 className="text-md font-medium mb-3">Animation Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Animation Type
                    </label>
                    <select
                      value={formData.animationType}
                      onChange={(e) => setFormData({ ...formData, animationType: e.target.value as any })}
                      className="input"
                    >
                      <option value="none">None</option>
                      <option value="fade">Fade</option>
                      <option value="slide">Slide</option>
                      <option value="zoom">Zoom</option>
                      <option value="bounce">Bounce</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (ms)
                    </label>
                    <input
                      type="number"
                      value={formData.animationDuration}
                      onChange={(e) => setFormData({ ...formData, animationDuration: e.target.value })}
                      className="input"
                      placeholder="500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delay (ms)
                    </label>
                    <input
                      type="number"
                      value={formData.animationDelay}
                      onChange={(e) => setFormData({ ...formData, animationDelay: e.target.value })}
                      className="input"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingBanner ? 'Update' : 'Create'} Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search banners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filteredBanners.map((banner) => (
              <div key={banner._id} className="border rounded-lg overflow-hidden">
                <div className="aspect-video bg-gray-100 relative">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <span className={`badge ${getStatusBadgeClass(banner.status)}`}>
                      {banner.status.charAt(0).toUpperCase() + banner.status.slice(1)}
                    </span>
                    <span className={`badge ${getPositionBadgeClass(banner.position)}`}>
                      {banner.position.charAt(0).toUpperCase() + banner.position.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-2">
                    <h3 className="font-medium">{banner.title}</h3>
                    {banner.subtitle && (
                      <p className="text-sm text-gray-500">{banner.subtitle}</p>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-2">
                    <div>Priority: {banner.priority}</div>
                    <div>Impressions: {banner.analytics.impressions}</div>
                    <div>Clicks: {banner.analytics.clicks}</div>
                    {banner.analytics.impressions > 0 && (
                      <div>CTR: {((banner.analytics.clicks / banner.analytics.impressions) * 100).toFixed(2)}%</div>
                    )}
                  </div>

                  {banner.link?.url && (
                    <div className="flex items-center text-sm text-blue-600 mb-3">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      <span className="truncate">{banner.link.url}</span>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredBanners.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                No banners found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BannersPage;