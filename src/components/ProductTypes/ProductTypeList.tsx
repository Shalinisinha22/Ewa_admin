import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axios';
import { ProductType } from '../../types';
import { Edit, Trash2, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  onEdit: (productType: ProductType) => void;
}

const ProductTypeList: React.FC<Props> = ({ onEdit }) => {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProductTypes = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/producttypes');
      setProductTypes(data);
    } catch (error: any) {
      toast.error('Failed to fetch product types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductTypes();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product type?')) {
      try {
        await axiosInstance.delete(`/producttypes/${id}`);
        toast.success('Product type deleted successfully');
        fetchProductTypes();
      } catch (error: any) {
        toast.error('Failed to delete product type');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Value
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {productTypes.map((type) => (
            <tr key={type._id}>
              <td className="px-6 py-4 whitespace-nowrap">{type.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{type.value}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(type)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(type._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTypeList;