import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Truck, MapPin, DollarSign } from 'lucide-react';
import axiosInstance from '../config/axios';
import toast from 'react-hot-toast';

interface ShippingZone {
  _id?: string;
  name: string;
  minWeight: number;
  maxWeight: number;
  rate: number;
  estimatedDays: string;
  codAvailable: boolean;
  codCharges?: number;
}

interface ShippingSettings {
  _id?: string;
  storeId: string;
  freeShippingThreshold: number;
  defaultShippingCost: number;
  zones: ShippingZone[];
  isActive: boolean;
}

interface TaxSetting {
  _id: string;
  storeId: string;
  name: string;
  rate: number;
  isActive: boolean;
  description?: string;
}

const ShippingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shipping' | 'tax'>('shipping');
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings | null>(null);
  const [taxSettings, setTaxSettings] = useState<TaxSetting[]>([]);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [showTaxForm, setShowTaxForm] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [editingTax, setEditingTax] = useState<TaxSetting | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [shippingFormData, setShippingFormData] = useState({
    name: '',
    minWeight: '',
    maxWeight: '',
    rate: '',
    estimatedDays: '',
    codAvailable: false,
    codCharges: '',
  });

  const [taxFormData, setTaxFormData] = useState({
    name: '',
    rate: '',
    isActive: true,
    description: '',
  });

  // Load shipping and tax settings
  useEffect(() => {
    loadShippingSettings();
    loadTaxSettings();
  }, []);

  const loadShippingSettings = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/settings/shipping');
      setShippingSettings(response.data);
    } catch (error: any) {
      console.error('Error loading shipping settings:', error);
      toast.error('Failed to load shipping settings');
    } finally {
      setLoading(false);
    }
  };

  const loadTaxSettings = async () => {
    try {
      const response = await axiosInstance.get('/settings/tax');
      setTaxSettings(response.data);
    } catch (error: any) {
      console.error('Error loading tax settings:', error);
      toast.error('Failed to load tax settings');
    }
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shippingSettings) return;

    try {
      setSaving(true);
      
      const newZone: ShippingZone = {
        name: shippingFormData.name,
        minWeight: parseFloat(shippingFormData.minWeight),
        maxWeight: parseFloat(shippingFormData.maxWeight),
        rate: parseFloat(shippingFormData.rate),
        estimatedDays: shippingFormData.estimatedDays,
        codAvailable: shippingFormData.codAvailable,
        codCharges: shippingFormData.codCharges ? parseFloat(shippingFormData.codCharges) : undefined,
      };

      let updatedZones: ShippingZone[];
      
      if (editingZone) {
        // Update existing zone
        updatedZones = shippingSettings.zones.map(zone => 
          zone._id === editingZone._id ? { ...newZone, _id: zone._id } : zone
        );
      } else {
        // Add new zone
        updatedZones = [...shippingSettings.zones, { ...newZone, _id: Date.now().toString() }];
      }

      const updatedSettings = {
        ...shippingSettings,
        zones: updatedZones
      };

      const response = await axiosInstance.put('/settings/shipping', updatedSettings);
      setShippingSettings(response.data);
      
      toast.success(editingZone ? 'Shipping zone updated successfully' : 'Shipping zone created successfully');
      resetShippingForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save shipping zone');
    } finally {
      setSaving(false);
    }
  };

  const handleTaxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const taxData = {
        name: taxFormData.name,
        rate: parseFloat(taxFormData.rate),
        isActive: taxFormData.isActive,
        description: taxFormData.description,
      };

      if (editingTax) {
        // Update existing tax
        await axiosInstance.put('/settings/tax', {
          taxId: editingTax._id,
          ...taxData
        });
        toast.success('Tax setting updated successfully');
      } else {
        // Create new tax
        await axiosInstance.put('/settings/tax', taxData);
        toast.success('Tax setting created successfully');
      }

      await loadTaxSettings();
      resetTaxForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save tax setting');
    } finally {
      setSaving(false);
    }
  };

  const resetShippingForm = () => {
    setShippingFormData({
      name: '',
      minWeight: '',
      maxWeight: '',
      rate: '',
      estimatedDays: '',
      codAvailable: false,
      codCharges: '',
    });
    setEditingZone(null);
    setShowShippingForm(false);
  };

  const resetTaxForm = () => {
    setTaxFormData({
      name: '',
      rate: '',
      isActive: true,
      description: '',
    });
    setEditingTax(null);
    setShowTaxForm(false);
  };

  const handleEditZone = (zone: ShippingZone) => {
    setShippingFormData({
      name: zone.name,
      minWeight: zone.minWeight.toString(),
      maxWeight: zone.maxWeight.toString(),
      rate: zone.rate.toString(),
      estimatedDays: zone.estimatedDays,
      codAvailable: zone.codAvailable,
      codCharges: zone.codCharges?.toString() || '',
    });
    setEditingZone(zone);
    setShowShippingForm(true);
  };

  const handleEditTax = (tax: TaxSetting) => {
    setTaxFormData({
      name: tax.name,
      rate: tax.rate.toString(),
      isActive: tax.isActive,
      description: tax.description || '',
    });
    setEditingTax(tax);
    setShowTaxForm(true);
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (!shippingSettings) return;
    
    if (window.confirm('Are you sure you want to delete this shipping zone?')) {
      try {
        const updatedZones = shippingSettings.zones.filter(zone => zone._id !== zoneId);
        const updatedSettings = {
          ...shippingSettings,
          zones: updatedZones
        };

        const response = await axiosInstance.put('/settings/shipping', updatedSettings);
        setShippingSettings(response.data);
        toast.success('Shipping zone deleted successfully');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete shipping zone');
      }
    }
  };

  const handleDeleteTax = async (taxId: string) => {
    if (window.confirm('Are you sure you want to delete this tax setting?')) {
      try {
        await axiosInstance.delete(`/settings/tax/${taxId}`);
        await loadTaxSettings();
        toast.success('Tax setting deleted successfully');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete tax setting');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Shipping & Tax Settings</h1>
        <p className="text-gray-600">Configure shipping rates and tax settings</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('shipping')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'shipping'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Truck className="h-5 w-5 inline mr-2" />
            Shipping Rates
          </button>
          <button
            onClick={() => setActiveTab('tax')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tax'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <DollarSign className="h-5 w-5 inline mr-2" />
            Tax Settings
          </button>
        </nav>
      </div>

      {/* Shipping Tab */}
      {activeTab === 'shipping' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">Shipping Rates</h2>
            <button
              onClick={() => setShowShippingForm(true)}
              className="btn btn-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Shipping Zone
            </button>
          </div>

          {showShippingForm && (
            <div className="card mb-6">
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">
                  {editingZone ? 'Edit Shipping Zone' : 'Add New Shipping Zone'}
                </h3>
                <form onSubmit={handleShippingSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zone Name*
                    </label>
                    <input
                      type="text"
                      value={shippingFormData.name}
                      onChange={(e) => setShippingFormData({ ...shippingFormData, name: e.target.value })}
                      className="input"
                      placeholder="Mumbai, Delhi, Rest of India"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Delivery*
                    </label>
                    <input
                      type="text"
                      value={shippingFormData.estimatedDays}
                      onChange={(e) => setShippingFormData({ ...shippingFormData, estimatedDays: e.target.value })}
                      className="input"
                      placeholder="1-2 days, 3-5 days"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Weight (kg)*
                    </label>
                    <input
                      type="number"
                      value={shippingFormData.minWeight}
                      onChange={(e) => setShippingFormData({ ...shippingFormData, minWeight: e.target.value })}
                      className="input"
                      placeholder="0"
                      step="0.1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Weight (kg)*
                    </label>
                    <input
                      type="number"
                      value={shippingFormData.maxWeight}
                      onChange={(e) => setShippingFormData({ ...shippingFormData, maxWeight: e.target.value })}
                      className="input"
                      placeholder="1"
                      step="0.1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shipping Rate (₹)*
                    </label>
                    <input
                      type="number"
                      value={shippingFormData.rate}
                      onChange={(e) => setShippingFormData({ ...shippingFormData, rate: e.target.value })}
                      className="input"
                      placeholder="50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      COD Charges (₹)
                    </label>
                    <input
                      type="number"
                      value={shippingFormData.codCharges}
                      onChange={(e) => setShippingFormData({ ...shippingFormData, codCharges: e.target.value })}
                      className="input"
                      placeholder="25"
                      disabled={!shippingFormData.codAvailable}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={shippingFormData.codAvailable}
                        onChange={(e) => setShippingFormData({ ...shippingFormData, codAvailable: e.target.checked })}
                        className="mr-2"
                      />
                      Cash on Delivery Available
                    </label>
                  </div>

                  <div className="md:col-span-2 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={resetShippingForm}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Saving...' : (editingZone ? 'Update' : 'Create')} Zone
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="card">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Zone Name</th>
                    <th>Weight Range</th>
                    <th>Rate</th>
                    <th>Delivery Time</th>
                    <th>COD</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shippingSettings?.zones.map((zone) => (
                    <tr key={zone._id}>
                      <td>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-primary-500" />
                          {zone.name}
                        </div>
                      </td>
                      <td>{zone.minWeight}kg - {zone.maxWeight}kg</td>
                      <td>₹{zone.rate}</td>
                      <td>{zone.estimatedDays}</td>
                      <td>
                        <span className={`badge ${zone.codAvailable ? 'badge-success' : 'badge-danger'}`}>
                          {zone.codAvailable ? `Available (₹${zone.codCharges || 0})` : 'Not Available'}
                        </span>
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditZone(zone)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteZone(zone._id!)}
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
      )}

      {/* Tax Tab */}
      {activeTab === 'tax' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">Tax Settings</h2>
            <button
              onClick={() => setShowTaxForm(true)}
              className="btn btn-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Tax Setting
            </button>
          </div>

          {showTaxForm && (
            <div className="card mb-6">
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">
                  {editingTax ? 'Edit Tax Setting' : 'Add New Tax Setting'}
                </h3>
                <form onSubmit={handleTaxSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax Name*
                    </label>
                    <input
                      type="text"
                      value={taxFormData.name}
                      onChange={(e) => setTaxFormData({ ...taxFormData, name: e.target.value })}
                      className="input"
                      placeholder="GST, CGST, SGST"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax Rate (%)*
                    </label>
                    <input
                      type="number"
                      value={taxFormData.rate}
                      onChange={(e) => setTaxFormData({ ...taxFormData, rate: e.target.value })}
                      className="input"
                      placeholder="18"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={taxFormData.description}
                      onChange={(e) => setTaxFormData({ ...taxFormData, description: e.target.value })}
                      className="input"
                      placeholder="Goods and Services Tax"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={taxFormData.isActive}
                        onChange={(e) => setTaxFormData({ ...taxFormData, isActive: e.target.checked })}
                        className="mr-2"
                      />
                      Active
                    </label>
                  </div>

                  <div className="md:col-span-2 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={resetTaxForm}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Saving...' : (editingTax ? 'Update' : 'Create')} Tax Setting
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="card">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tax Name</th>
                    <th>Rate</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {taxSettings.map((tax) => (
                    <tr key={tax._id}>
                      <td>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-primary-500" />
                          {tax.name}
                        </div>
                      </td>
                      <td>{tax.rate}%</td>
                      <td>{tax.description || '-'}</td>
                      <td>
                        <span className={`badge ${tax.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {tax.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditTax(tax)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTax(tax._id)}
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
      )}
    </div>
  );
};

export default ShippingPage;