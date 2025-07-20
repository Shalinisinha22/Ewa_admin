import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Truck, MapPin, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShippingRate {
  _id: string;
  region: string;
  minWeight: number;
  maxWeight: number;
  rate: number;
  estimatedDays: string;
  codAvailable: boolean;
  codCharges?: number;
}

interface TaxSetting {
  _id: string;
  name: string;
  rate: number;
  isActive: boolean;
}

const ShippingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shipping' | 'tax'>('shipping');
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [taxSettings, setTaxSettings] = useState<TaxSetting[]>([]);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [showTaxForm, setShowTaxForm] = useState(false);
  const [editingShipping, setEditingShipping] = useState<ShippingRate | null>(null);
  const [editingTax, setEditingTax] = useState<TaxSetting | null>(null);

  const [shippingFormData, setShippingFormData] = useState({
    region: '',
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
  });

  // Mock data
  useEffect(() => {
    const mockShippingRates: ShippingRate[] = [
      {
        _id: '1',
        region: 'Mumbai',
        minWeight: 0,
        maxWeight: 1,
        rate: 50,
        estimatedDays: '1-2 days',
        codAvailable: true,
        codCharges: 25,
      },
      {
        _id: '2',
        region: 'Delhi NCR',
        minWeight: 0,
        maxWeight: 1,
        rate: 60,
        estimatedDays: '2-3 days',
        codAvailable: true,
        codCharges: 30,
      },
      {
        _id: '3',
        region: 'Rest of India',
        minWeight: 0,
        maxWeight: 1,
        rate: 80,
        estimatedDays: '3-5 days',
        codAvailable: false,
      },
    ];

    const mockTaxSettings: TaxSetting[] = [
      {
        _id: '1',
        name: 'GST',
        rate: 18,
        isActive: true,
      },
      {
        _id: '2',
        name: 'CGST',
        rate: 9,
        isActive: false,
      },
      {
        _id: '3',
        name: 'SGST',
        rate: 9,
        isActive: false,
      },
    ];

    setShippingRates(mockShippingRates);
    setTaxSettings(mockTaxSettings);
  }, []);

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newRate: ShippingRate = {
      _id: editingShipping?._id || Date.now().toString(),
      region: shippingFormData.region,
      minWeight: parseFloat(shippingFormData.minWeight),
      maxWeight: parseFloat(shippingFormData.maxWeight),
      rate: parseFloat(shippingFormData.rate),
      estimatedDays: shippingFormData.estimatedDays,
      codAvailable: shippingFormData.codAvailable,
      codCharges: shippingFormData.codCharges ? parseFloat(shippingFormData.codCharges) : undefined,
    };

    if (editingShipping) {
      setShippingRates(prev => prev.map(r => r._id === editingShipping._id ? newRate : r));
      toast.success('Shipping rate updated successfully');
    } else {
      setShippingRates(prev => [...prev, newRate]);
      toast.success('Shipping rate created successfully');
    }

    resetShippingForm();
  };

  const handleTaxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTax: TaxSetting = {
      _id: editingTax?._id || Date.now().toString(),
      name: taxFormData.name,
      rate: parseFloat(taxFormData.rate),
      isActive: taxFormData.isActive,
    };

    if (editingTax) {
      setTaxSettings(prev => prev.map(t => t._id === editingTax._id ? newTax : t));
      toast.success('Tax setting updated successfully');
    } else {
      setTaxSettings(prev => [...prev, newTax]);
      toast.success('Tax setting created successfully');
    }

    resetTaxForm();
  };

  const resetShippingForm = () => {
    setShippingFormData({
      region: '',
      minWeight: '',
      maxWeight: '',
      rate: '',
      estimatedDays: '',
      codAvailable: false,
      codCharges: '',
    });
    setEditingShipping(null);
    setShowShippingForm(false);
  };

  const resetTaxForm = () => {
    setTaxFormData({
      name: '',
      rate: '',
      isActive: true,
    });
    setEditingTax(null);
    setShowTaxForm(false);
  };

  const handleEditShipping = (rate: ShippingRate) => {
    setShippingFormData({
      region: rate.region,
      minWeight: rate.minWeight.toString(),
      maxWeight: rate.maxWeight.toString(),
      rate: rate.rate.toString(),
      estimatedDays: rate.estimatedDays,
      codAvailable: rate.codAvailable,
      codCharges: rate.codCharges?.toString() || '',
    });
    setEditingShipping(rate);
    setShowShippingForm(true);
  };

  const handleEditTax = (tax: TaxSetting) => {
    setTaxFormData({
      name: tax.name,
      rate: tax.rate.toString(),
      isActive: tax.isActive,
    });
    setEditingTax(tax);
    setShowTaxForm(true);
  };

  const handleDeleteShipping = (id: string) => {
    if (window.confirm('Are you sure you want to delete this shipping rate?')) {
      setShippingRates(prev => prev.filter(r => r._id !== id));
      toast.success('Shipping rate deleted successfully');
    }
  };

  const handleDeleteTax = (id: string) => {
    if (window.confirm('Are you sure you want to delete this tax setting?')) {
      setTaxSettings(prev => prev.filter(t => t._id !== id));
      toast.success('Tax setting deleted successfully');
    }
  };

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
              Add Shipping Rate
            </button>
          </div>

          {showShippingForm && (
            <div className="card mb-6">
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">
                  {editingShipping ? 'Edit Shipping Rate' : 'Add New Shipping Rate'}
                </h3>
                <form onSubmit={handleShippingSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Region*
                    </label>
                    <input
                      type="text"
                      value={shippingFormData.region}
                      onChange={(e) => setShippingFormData({ ...shippingFormData, region: e.target.value })}
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
                    <button type="submit" className="btn btn-primary">
                      {editingShipping ? 'Update' : 'Create'} Rate
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
                    <th>Region</th>
                    <th>Weight Range</th>
                    <th>Rate</th>
                    <th>Delivery Time</th>
                    <th>COD</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shippingRates.map((rate) => (
                    <tr key={rate._id}>
                      <td>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-primary-500" />
                          {rate.region}
                        </div>
                      </td>
                      <td>{rate.minWeight}kg - {rate.maxWeight}kg</td>
                      <td>₹{rate.rate}</td>
                      <td>{rate.estimatedDays}</td>
                      <td>
                        <span className={`badge ${rate.codAvailable ? 'badge-success' : 'badge-danger'}`}>
                          {rate.codAvailable ? `Available (₹${rate.codCharges})` : 'Not Available'}
                        </span>
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditShipping(rate)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteShipping(rate._id)}
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
                    <button type="submit" className="btn btn-primary">
                      {editingTax ? 'Update' : 'Create'} Tax Setting
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