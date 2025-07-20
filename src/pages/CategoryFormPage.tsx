import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axios';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, Loader, Plus, X } from 'lucide-react';

// Update interfaces
interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent: string;
}


interface Category {
  _id: string;
  name: string;
}



// Update the initialFormData to use undefined for optional fields
const initialFormData: CategoryFormData = {
  name: '',
  slug: '',
  description: undefined, // Change from empty string to undefined
  image: undefined,      // Change from empty string to undefined
  parent: '',
};

const CategoryFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const isEditing = !!id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch categories
        const categoriesResponse = await axiosInstance.get('/categories');
        
        setParentCategories(categoriesResponse.data);

        // If editing, fetch category details
        if (id) {
          const { data: category } = await axiosInstance.get(`/categories/${id}`);
          setFormData({
            name: category.name || '',
            slug: category.slug || '',
            description: category.description || undefined,
            image: category.image || undefined,
            parent: category.parent || '',
          });
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to fetch data');
        if (isEditing) navigate('/categories');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, isEditing]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      
      // Auto-generate slug for new categories
      if (name === 'name' && !isEditing) {
        newData.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      
      return newData;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setImageUploading(true);
      const { data } = await axiosInstance.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((prev) => ({ ...prev, image: data }));
      toast.success('Image uploaded successfully');
    } catch (err: any) {
      toast.error('Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  // Update the handleSubmit function to clean the data before sending
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Create a cleaned version of the form data
    const cleanedData = {
      ...formData,
      description: formData.description || undefined,
      image: formData.image || undefined,
    };
    
    try {
      setLoading(true);
      if (isEditing) {
        await axiosInstance.put(`/categories/${id}`, cleanedData);
        toast.success('Category updated successfully');
      } else {
        await axiosInstance.post('/categories', cleanedData);
        toast.success('Category created successfully');
      }
      navigate('/categories');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving category');
    } finally {
      setLoading(false);
    }
  };

  // Filter parent categories
  const filteredParentCategories = parentCategories.filter(
    (cat) => (!isEditing || cat._id !== id)
  );

  if (loading && isEditing) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/categories')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold">
          {isEditing ? 'Edit Category' : 'Add New Category'}
        </h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input"
                placeholder="Enter category name"
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
                placeholder="enter-slug-here"
                disabled={isEditing}
              />
              {isEditing && (
                <p className="mt-1 text-xs text-gray-500">
                  Slug cannot be changed after creation to maintain URL consistency.
                </p>
              )}
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Category
              </label>
              <select
                name="parent"
                value={formData.parent}
                onChange={handleChange}
                className="input"
              >
                <option value="">None (Top Level)</option>
                {filteredParentCategories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ''} // Add fallback for undefined
                onChange={handleChange}
                className="input h-32"
                placeholder="Enter category description (optional)"
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Image (optional)
              </label>
              <div className="mt-1 flex items-center">
                {formData.image && (
                  <div className="relative mr-4">
                    <div className="h-20 w-20 rounded-md overflow-hidden bg-gray-100">
                      <img
                        src={formData.image}
                        alt={formData.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <label className="btn btn-secondary">
                  <Plus className="h-5 w-5 mr-1" />
                  {formData.image ? 'Change Image' : 'Upload Image (optional)'}
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
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/categories')}
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
                  {isEditing ? 'Update Category' : 'Create Category'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormPage;