import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Image as ImageIcon, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../config/axios';

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  link?: {
    url: string;
  };
  position: 'hero' | 'sidebar' | 'popup' | 'header' | 'footer';
  status: 'active' | 'inactive';
  display?: {
    startDate?: string;
    endDate?: string;
  };
  createdAt: string;
}

const BannersPage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    link: '',
    position: 'hero' as 'hero' | 'sidebar' | 'popup' | 'header' | 'footer',
    status: 'active' as 'active' | 'inactive',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data } = await axiosInstance.get('/banners');
      setBanners(data.banners || []);
    } catch (error: any) {
      toast.error('Failed to fetch banners');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const bannerData = {
      title: formData.title,
      subtitle: formData.subtitle || undefined,
      description: formData.description || undefined,
      image: formData.image,
      link: formData.link ? { url: formData.link } : undefined,
      position: formData.position,
      status: formData.status,
      display: {
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
      }
    };

    const apiCall = editingBanner 
      ? axiosInstance.put(`/banners/${editingBanner._id}`, bannerData)
      : axiosInstance.post('/banners', bannerData);

    apiCall.then(() => {
      toast.success(editingBanner ? 'Banner updated successfully' : 'Banner created successfully');
      fetchBanners();
      resetForm();
    }).catch((error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save banner');
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      image: '',
      link: '',
      position: 'hero',
      status: 'active',
      startDate: '',
      endDate: '',
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
      link: banner.link?.url || '',
      position: banner.position,
      status: banner.status,
      startDate: banner.display?.startDate || '',
      endDate: banner.display?.endDate || '',
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
      } catch (error: any) {
        toast.error('Failed to delete banner');
      }
    }
  };

  const filteredBanners = banners.filter(banner =>
    banner.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="UP To 20% Discount on"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input h-20"
                  placeholder="Enter banner description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position*
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value as any })}
                  className="input"
                >
                  <option value="hero">Hero Banner</option>
                  <option value="sidebar">Sidebar Banner</option>
                  <option value="popup">Popup Banner</option>
                  <option value="header">Header Banner</option>
                  <option value="footer">Footer Banner</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banner Image*
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="input flex-1"
                    placeholder="https://example.com/banner.jpg or upload image"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = async (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          try {
                            const formData = new FormData();
                            formData.append('image', file);
                            const { data } = await axiosInstance.post('/upload/image', formData, {
                              headers: { 'Content-Type': 'multipart/form-data' },
                            });
                            setFormData(prev => ({ ...prev, image: data.url }));
                            toast.success('Image uploaded successfully');
                          } catch (error: any) {
                            toast.error('Failed to upload image');
                          }
                        }
                      };
                      input.click();
                    }}
                    className="btn btn-secondary"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </button>
                </div>
                {formData.image && (
                  <div className="mt-2">
                    <img 
                      src={formData.image} 
                      alt="Banner preview" 
                      className="w-32 h-20 object-cover rounded border"
                    />
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="input"
                  placeholder="https://example.com/products"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date (Optional)
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
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="input"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.status === 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'active' : 'inactive' })}
                    className="mr-2"
                  />
                  Active
                </label>
              </div>

              <div className="md:col-span-2 flex justify-end space-x-2">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {filteredBanners.map((banner) => (
            <div key={banner._id} className="border rounded-lg overflow-hidden">
              <div className="aspect-video bg-gray-100">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{banner.title}</h3>
                  <span className={`badge ${banner.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                    {banner.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {banner.subtitle && (
                  <div className="text-sm text-gray-600 mb-1">
                    {banner.subtitle}
                  </div>
                )}
                <div className="text-sm text-gray-500 mb-2">
                  Position: <span className="capitalize">{banner.position}</span>
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
        </div>
      </div>
    </div>
  );
};

export default BannersPage;