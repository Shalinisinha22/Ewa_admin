import React, { useState, useEffect } from 'react';
import { Save, Lock, User, Mail, AlertCircle, Upload, Globe, Facebook, Instagram, Twitter, Youtube, Linkedin } from 'lucide-react';
import axiosInstance from '../config/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface ProfileFormData {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface StoreSettingsData {
  storeName: string;
  storeDescription: string;
  logo: string;
  favicon: string;
  domain: string;
  address: string;
  phone: string;
  email: string;
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  linkedin: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
}

const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'store' | 'seo'>('profile');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [storeData, setStoreData] = useState<StoreSettingsData>({
    storeName: 'EWA Fashion',
    storeDescription: 'Your premier destination for fashion and style',
    logo: '',
    favicon: '',
    domain: '',
    address: '123 Fashion Street, Style City, SC 12345',
    phone: '+1 (555) 123-4567',
    email: 'info@ewafashion.com',
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    linkedin: '',
    metaTitle: 'EWA Fashion - Premium Fashion Store',
    metaDescription: 'Discover the latest trends in fashion at EWA Fashion. Shop premium clothing, accessories, and more.',
    keywords: 'fashion, clothing, accessories, style, premium',
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStoreChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStoreData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const { data } = await axiosInstance.put('/users/profile', {
        name: profileData.name,
        email: profileData.email,
      });
      
      updateUser(data);
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (profileData.newPassword !== profileData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.put('/users/profile/password', {
        currentPassword: profileData.currentPassword,
        newPassword: profileData.newPassword,
      });
      
      // Reset password fields
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      
      toast.success('Password updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleStoreUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      // In real app, this would save to backend
      toast.success('Store settings updated successfully');
    } catch (err: any) {
      toast.error('Failed to update store settings');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate file upload
    const fakeUrl = URL.createObjectURL(file);
    setStoreData(prev => ({
      ...prev,
      [field]: fakeUrl
    }));
    toast.success(`${field} uploaded successfully`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Settings</h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <User className="h-5 w-5 inline mr-2" />
              Profile Settings
            </button>
            <button
              onClick={() => setActiveTab('store')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'store'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Globe className="h-5 w-5 inline mr-2" />
              Store Settings
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'seo'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              SEO Settings
            </button>
          </nav>
        </div>

        {/* Profile Settings Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="card">
              <div className="p-6">
                <h2 className="text-xl font-medium mb-4">Profile Settings</h2>
                <form onSubmit={handleProfileUpdate}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          className="input pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          className="input pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Save className="h-5 w-5 mr-2" />
                            Save Changes
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className="card">
              <div className="p-6">
                <h2 className="text-xl font-medium mb-4">Change Password</h2>
                <form onSubmit={handlePasswordChange}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="password"
                          name="currentPassword"
                          value={profileData.currentPassword}
                          onChange={handleProfileChange}
                          className="input pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="password"
                          name="newPassword"
                          value={profileData.newPassword}
                          onChange={handleProfileChange}
                          className="input pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={profileData.confirmPassword}
                          onChange={handleProfileChange}
                          className="input pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Save className="h-5 w-5 mr-2" />
                            Update Password
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Store Settings Tab */}
        {activeTab === 'store' && (
          <div className="card">
            <div className="p-6">
              <h2 className="text-xl font-medium mb-4">Store Settings</h2>
              <form onSubmit={handleStoreUpdate}>
                <div className="space-y-6">
                  {/* Basic Store Info */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Store Name
                        </label>
                        <input
                          type="text"
                          name="storeName"
                          value={storeData.storeName}
                          onChange={handleStoreChange}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Domain
                        </label>
                        <input
                          type="text"
                          name="domain"
                          value={storeData.domain}
                          onChange={handleStoreChange}
                          className="input"
                          placeholder="www.yourstore.com"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Store Description
                        </label>
                        <textarea
                          name="storeDescription"
                          value={storeData.storeDescription}
                          onChange={handleStoreChange}
                          className="input h-20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Logo & Favicon */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Branding</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Logo
                        </label>
                        <div className="flex items-center space-x-4">
                          {storeData.logo && (
                            <img src={storeData.logo} alt="Logo" className="h-12 w-12 object-cover rounded" />
                          )}
                          <label className="btn btn-outline">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Logo
                            <input
                              type="file"
                              onChange={(e) => handleFileUpload(e, 'logo')}
                              className="hidden"
                              accept="image/*"
                            />
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Favicon
                        </label>
                        <div className="flex items-center space-x-4">
                          {storeData.favicon && (
                            <img src={storeData.favicon} alt="Favicon" className="h-8 w-8 object-cover rounded" />
                          )}
                          <label className="btn btn-outline">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Favicon
                            <input
                              type="file"
                              onChange={(e) => handleFileUpload(e, 'favicon')}
                              className="hidden"
                              accept="image/*"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="text"
                          name="phone"
                          value={storeData.phone}
                          onChange={handleStoreChange}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={storeData.email}
                          onChange={handleStoreChange}
                          className="input"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <textarea
                          name="address"
                          value={storeData.address}
                          onChange={handleStoreChange}
                          className="input h-20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Media */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Social Media Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Facebook className="h-4 w-4 inline mr-1" />
                          Facebook
                        </label>
                        <input
                          type="url"
                          name="facebook"
                          value={storeData.facebook}
                          onChange={handleStoreChange}
                          className="input"
                          placeholder="https://facebook.com/yourstore"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Instagram className="h-4 w-4 inline mr-1" />
                          Instagram
                        </label>
                        <input
                          type="url"
                          name="instagram"
                          value={storeData.instagram}
                          onChange={handleStoreChange}
                          className="input"
                          placeholder="https://instagram.com/yourstore"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Twitter className="h-4 w-4 inline mr-1" />
                          Twitter
                        </label>
                        <input
                          type="url"
                          name="twitter"
                          value={storeData.twitter}
                          onChange={handleStoreChange}
                          className="input"
                          placeholder="https://twitter.com/yourstore"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Youtube className="h-4 w-4 inline mr-1" />
                          YouTube
                        </label>
                        <input
                          type="url"
                          name="youtube"
                          value={storeData.youtube}
                          onChange={handleStoreChange}
                          className="input"
                          placeholder="https://youtube.com/yourstore"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Linkedin className="h-4 w-4 inline mr-1" />
                          LinkedIn
                        </label>
                        <input
                          type="url"
                          name="linkedin"
                          value={storeData.linkedin}
                          onChange={handleStoreChange}
                          className="input"
                          placeholder="https://linkedin.com/company/yourstore"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Save className="h-5 w-5 mr-2" />
                          Save Store Settings
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SEO Settings Tab */}
        {activeTab === 'seo' && (
          <div className="card">
            <div className="p-6">
              <h2 className="text-xl font-medium mb-4">SEO Settings</h2>
              <form onSubmit={handleStoreUpdate}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      name="metaTitle"
                      value={storeData.metaTitle}
                      onChange={handleStoreChange}
                      className="input"
                      placeholder="Your store's meta title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Description
                    </label>
                    <textarea
                      name="metaDescription"
                      value={storeData.metaDescription}
                      onChange={handleStoreChange}
                      className="input h-20"
                      placeholder="Your store's meta description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Keywords
                    </label>
                    <input
                      type="text"
                      name="keywords"
                      value={storeData.keywords}
                      onChange={handleStoreChange}
                      className="input"
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 718-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Save className="h-5 w-5 mr-2" />
                          Save SEO Settings
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;