import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Percent, Calendar, Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface Coupon {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  expiryDate: string;
  isActive: boolean;
  createdAt: string;
}

const CouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    minOrderAmount: '',
    maxDiscount: '',
    usageLimit: '',
    expiryDate: '',
    isActive: true,
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockCoupons: Coupon[] = [
      {
        _id: '1',
        code: 'WELCOME10',
        type: 'percentage',
        value: 10,
        minOrderAmount: 500,
        usageLimit: 100,
        usedCount: 25,
        expiryDate: '2024-12-31',
        isActive: true,
        createdAt: '2024-01-01',
      },
      {
        _id: '2',
        code: 'FLAT50',
        type: 'fixed',
        value: 50,
        minOrderAmount: 200,
        usageLimit: 50,
        usedCount: 12,
        expiryDate: '2024-06-30',
        isActive: true,
        createdAt: '2024-01-15',
      },
    ];
    setCoupons(mockCoupons);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newCoupon: Coupon = {
      _id: editingCoupon?._id || Date.now().toString(),
      code: formData.code.toUpperCase(),
      type: formData.type,
      value: parseFloat(formData.value),
      minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : undefined,
      maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
      usedCount: editingCoupon?.usedCount || 0,
      expiryDate: formData.expiryDate,
      isActive: formData.isActive,
      createdAt: editingCoupon?.createdAt || new Date().toISOString(),
    };

    if (editingCoupon) {
      setCoupons(prev => prev.map(c => c._id === editingCoupon._id ? newCoupon : c));
      toast.success('Coupon updated successfully');
    } else {
      setCoupons(prev => [...prev, newCoupon]);
      toast.success('Coupon created successfully');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      minOrderAmount: '',
      maxDiscount: '',
      usageLimit: '',
      expiryDate: '',
      isActive: true,
    });
    setEditingCoupon(null);
    setShowForm(false);
  };

  const handleEdit = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toString(),
      minOrderAmount: coupon.minOrderAmount?.toString() || '',
      maxDiscount: coupon.maxDiscount?.toString() || '',
      usageLimit: coupon.usageLimit?.toString() || '',
      expiryDate: coupon.expiryDate,
      isActive: coupon.isActive,
    });
    setEditingCoupon(coupon);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      setCoupons(prev => prev.filter(c => c._id !== id));
      toast.success('Coupon deleted successfully');
    }
  };

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Coupon Management</h1>
          <p className="text-gray-600">Create and manage discount codes</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Coupon
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coupon Code*
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="input"
                  placeholder="WELCOME10"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Type*
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })}
                  className="input"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Value*
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="input"
                  placeholder={formData.type === 'percentage' ? '10' : '50'}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Order Amount
                </label>
                <input
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                  className="input"
                  placeholder="500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usage Limit
                </label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  className="input"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date*
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="input"
                  required
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
                  {editingCoupon ? 'Update' : 'Create'} Coupon
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
              placeholder="Search coupons..."
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
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Usage</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.map((coupon) => (
                <tr key={coupon._id}>
                  <td>
                    <div className="flex items-center">
                      <Percent className="h-4 w-4 mr-2 text-primary-500" />
                      <span className="font-mono font-medium">{coupon.code}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${coupon.type === 'percentage' ? 'badge-info' : 'badge-warning'}`}>
                      {coupon.type === 'percentage' ? 'Percentage' : 'Fixed'}
                    </span>
                  </td>
                  <td>
                    {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                  </td>
                  <td>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-gray-400" />
                      {coupon.usedCount}/{coupon.usageLimit || '∞'}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {new Date(coupon.expiryDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${coupon.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(coupon)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon._id)}
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

export default CouponsPage;