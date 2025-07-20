import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, FileText, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface Page {
  _id: string;
  title: string;
  slug: string;
  content: string;
  metaDescription?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

const PagesPage: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    metaDescription: '',
    isPublished: true,
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockPages: Page[] = [
      {
        _id: '1',
        title: 'About Us',
        slug: 'about-us',
        content: '<h1>About EWA Fashion</h1><p>We are a leading fashion retailer...</p>',
        metaDescription: 'Learn about EWA Fashion, our story, and our commitment to quality.',
        isPublished: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15',
      },
      {
        _id: '2',
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        content: '<h1>Privacy Policy</h1><p>Your privacy is important to us...</p>',
        metaDescription: 'EWA Fashion privacy policy and data protection information.',
        isPublished: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      {
        _id: '3',
        title: 'Terms of Service',
        slug: 'terms-of-service',
        content: '<h1>Terms of Service</h1><p>By using our website...</p>',
        isPublished: false,
        createdAt: '2024-01-10',
        updatedAt: '2024-01-10',
      },
    ];
    setPages(mockPages);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPage: Page = {
      _id: editingPage?._id || Date.now().toString(),
      title: formData.title,
      slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
      content: formData.content,
      metaDescription: formData.metaDescription,
      isPublished: formData.isPublished,
      createdAt: editingPage?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingPage) {
      setPages(prev => prev.map(p => p._id === editingPage._id ? newPage : p));
      toast.success('Page updated successfully');
    } else {
      setPages(prev => [...prev, newPage]);
      toast.success('Page created successfully');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      metaDescription: '',
      isPublished: true,
    });
    setEditingPage(null);
    setShowForm(false);
  };

  const handleEdit = (page: Page) => {
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      metaDescription: page.metaDescription || '',
      isPublished: page.isPublished,
    });
    setEditingPage(page);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      setPages(prev => prev.filter(p => p._id !== id));
      toast.success('Page deleted successfully');
    }
  };

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Page Management</h1>
          <p className="text-gray-600">Manage static pages like About, Contact, Privacy Policy</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Page
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">
              {editingPage ? 'Edit Page' : 'Create New Page'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Page Title*
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input"
                    placeholder="About Us"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL Slug*
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="input"
                    placeholder="about-us"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <input
                  type="text"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  className="input"
                  placeholder="SEO meta description for this page"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Page Content*
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="input h-64"
                  placeholder="Enter page content (HTML supported)"
                  required
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="mr-2"
                  />
                  Published
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPage ? 'Update' : 'Create'} Page
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
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPages.map((page) => (
                <tr key={page._id}>
                  <td>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-primary-500" />
                      <span className="font-medium">{page.title}</span>
                    </div>
                  </td>
                  <td>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      /{page.slug}
                    </code>
                  </td>
                  <td>
                    <span className={`badge ${page.isPublished ? 'badge-success' : 'badge-warning'}`}>
                      {page.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    {new Date(page.updatedAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(`/pages/${page.slug}`, '_blank')}
                        className="text-green-600 hover:text-green-800"
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(page)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(page._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PagesPage;