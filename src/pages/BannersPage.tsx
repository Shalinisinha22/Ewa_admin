import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Image as ImageIcon, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface Banner {
  _id: string;
  title: string;
  image: string;
  link?: string;
  position: 'hero' | 'sidebar' | 'popup';
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

const BannersPage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    link: '',
    position: 'hero' as 'hero' | 'sidebar' | 'popup',
    isActive: true,
    startDate: '',
    endDate: '',
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockBanners: Banner[] = [
      {
        _id: '1',
        title: 'Summer Sale 2024',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
        link: '/products?category=summer',
        position: 'hero',
        isActive: true,
        startDate: '2024-06-01',
        endDate: '2024-08-31',
        createdAt: '2024-05-15',
      },
      {
        _id: '2',
        title: 'New Arrivals',
        image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400',
        position: 'sidebar',
        isActive: true,
        createdAt: '2024-05-20',
      },
    ];
    setBanners(mockBanners);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newBanner: Banner = {
      _id: editingBanner?._id || Date.now().toString(),
      title: formData.title,
      image: formData.image,
      link: formData.link || undefined,
      position: formData.position,
      isActive: formData.isActive,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      createdAt: editingBanner?.createdAt || new Date().toISOString(),
    };

    if (editingBanner) {
      setBanners(prev => prev.map(b => b._id === editingBanner._id ? newBanner : b));
      toast.success('Banner updated successfully');
    } else {
      setBanners(prev => [...prev, newBanner]);
      toast.success('Banner created successfully');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      image: '',
      link: '',
      position: 'hero',
      isActive: true,
      startDate: '',
      endDate: '',
    });
    setEditingBanner(null);
    setShowForm(false);
  };

  const handleEdit = (banner: Banner) => {
    setFormData({
      title: banner.title,
      image: banner.image,
      link: banner.link || '',
      position: banner.position,
      isActive: banner.isActive,
      startDate: banner.startDate || '',
      endDate: banner.endDate || '',
    });
    setEditingBanner(banner);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      setBanners(prev => prev.filter(b => b._id !== id));
      toast.success('Banner deleted successfully');
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
                  Position*
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value as 'hero' | 'sidebar' | 'popup' })}
                  className="input"
                >
                  <option value="hero">Hero Banner</option>
                  <option value="sidebar">Sidebar Banner</option>
                  <option value="popup">Popup Banner</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL*
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="input"
                  placeholder="https://example.com/banner.jpg"
                  required
                />
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
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
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
                  <span className={`badge ${banner.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  Position: <span className="capitalize">{banner.position}</span>
                </div>
                {banner.link && (
                  <div className="flex items-center text-sm text-blue-600 mb-3">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    <span className="truncate">{banner.link}</span>
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