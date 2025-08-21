import React, { useState } from 'react';
import ProductTypeList from '../components/ProductTypes/ProductTypeList';
import ProductTypeForm from '../components/ProductTypes/ProductTypeForm';
import { ProductType } from '../types';
import { Plus } from 'lucide-react';

const ProductTypesPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedProductType, setSelectedProductType] = useState<ProductType | undefined>();

  const handleEdit = (productType: ProductType) => {
    setSelectedProductType(productType);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setSelectedProductType(undefined);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Product Types</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Product Type
        </button>
      </div>

      <div className="card">
        {showForm ? (
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">
              {selectedProductType ? 'Edit Product Type' : 'Add New Product Type'}
            </h2>
            <ProductTypeForm
              productType={selectedProductType}
              onSuccess={handleSuccess}
              onCancel={() => {
                setShowForm(false);
                setSelectedProductType(undefined);
              }}
            />
          </div>
        ) : (
          <ProductTypeList onEdit={handleEdit} />
        )}
      </div>
    </div>
  );
};

export default ProductTypesPage;