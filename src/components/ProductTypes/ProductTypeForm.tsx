import React, { useState, useEffect } from 'react';
import { ProductType } from '../../types';
import axiosInstance from '../../config/axios';
import toast from 'react-hot-toast';
import { Loader } from 'lucide-react';

interface Props {
  productType?: ProductType;
  onSuccess: () => void;
  onCancel: () => void;
}

const ProductTypeForm: React.FC<Props> = ({ productType, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    value: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productType) {
      setFormData({
        name: productType.name,
        value: productType.value,
      });
    }
  }, [productType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      if (productType) {
        await axiosInstance.put(`/producttypes/${productType._id}`, formData);
        toast.success('Product type updated successfully');
      } else {
        await axiosInstance.post('/producttypes', formData);
        toast.success('Product type created successfully');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="mt-1 input"
          placeholder="Enter name (e.g. Dress)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Value</label>
        <input
          type="text"
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          required
          className="mt-1 input"
          placeholder="Enter value (e.g. dress)"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline"
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
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save'
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductTypeForm;