import React, { useState, useEffect } from 'react';
import { CreditCard, Eye, EyeOff, Save, AlertCircle, Plus, Edit, Trash2 } from 'lucide-react';
import axiosInstance from '../config/axios';
import toast from 'react-hot-toast';

interface PaymentGateway {
  _id: string;
  storeId: string;
  name: string;
  isActive: boolean;
  testMode: boolean;
  description?: string;
  credentials: {
    // Razorpay
    keyId?: string;
    keySecret?: string;
    webhookSecret?: string;
    
    // Stripe
    publishableKey?: string;
    secretKey?: string;
    
    // PayU
    merchantId?: string;
    merchantKey?: string;
    salt?: string;
    
    // Cash on Delivery
    maxAmount?: number;
    charges?: number;
    
    // PayPal
    clientId?: string;
    clientSecret?: string;
    mode?: string;
    
    [key: string]: string | number | undefined;
  };
}

const PaymentsPage: React.FC = () => {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    isActive: false,
    testMode: true,
    description: '',
    credentials: {} as any
  });

  // Load payment gateways
  useEffect(() => {
    loadPaymentGateways();
  }, []);

  const loadPaymentGateways = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/settings/payment');
      setGateways(response.data);
    } catch (error: any) {
      console.error('Error loading payment gateways:', error);
      toast.error('Failed to load payment gateways');
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialChange = (gatewayId: string, field: string, value: string) => {
    setGateways(prev => prev.map(gateway => 
      gateway._id === gatewayId 
        ? { 
            ...gateway, 
            credentials: { 
              ...gateway.credentials, 
              [field]: gateway.name === 'Cash on Delivery' ? parseFloat(value) || 0 : value 
            } 
          }
        : gateway
    ));
  };

  const handleToggleActive = async (gatewayId: string) => {
    const gateway = gateways.find(g => g._id === gatewayId);
    if (!gateway) return;

    try {
      setSaving(true);
      const response = await axiosInstance.put('/settings/payment', {
        gatewayId,
        isActive: !gateway.isActive
      });
      
      setGateways(prev => prev.map(g => 
        g._id === gatewayId ? response.data : g
      ));
      
      toast.success(`Payment gateway ${!gateway.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update payment gateway');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (gatewayId: string) => {
    const gateway = gateways.find(g => g._id === gatewayId);
    if (!gateway) return;

    try {
      setSaving(true);
      const response = await axiosInstance.put('/settings/payment', {
        gatewayId,
        credentials: gateway.credentials
      });
      
      setGateways(prev => prev.map(g => 
        g._id === gatewayId ? response.data : g
      ));
      
      toast.success('Payment gateway settings saved successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save payment gateway settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleCredentialVisibility = (gatewayId: string) => {
    setShowCredentials(prev => ({
      ...prev,
      [gatewayId]: !prev[gatewayId]
    }));
  };

  const getCredentialFields = (gatewayName: string) => {
    switch (gatewayName) {
      case 'Razorpay':
        return [
          { key: 'keyId', label: 'Key ID', type: 'text' },
          { key: 'keySecret', label: 'Key Secret', type: 'password' },
          { key: 'webhookSecret', label: 'Webhook Secret', type: 'password' },
        ];
      case 'Stripe':
        return [
          { key: 'publishableKey', label: 'Publishable Key', type: 'text' },
          { key: 'secretKey', label: 'Secret Key', type: 'password' },
          { key: 'webhookSecret', label: 'Webhook Secret', type: 'password' },
        ];
      case 'PayU':
        return [
          { key: 'merchantId', label: 'Merchant ID', type: 'text' },
          { key: 'merchantKey', label: 'Merchant Key', type: 'password' },
          { key: 'salt', label: 'Salt', type: 'password' },
        ];
      case 'Cash on Delivery':
        return [
          { key: 'maxAmount', label: 'Maximum Order Amount (₹)', type: 'number' },
          { key: 'charges', label: 'COD Charges (₹)', type: 'number' },
        ];
      case 'PayPal':
        return [
          { key: 'clientId', label: 'Client ID', type: 'text' },
          { key: 'clientSecret', label: 'Client Secret', type: 'password' },
        ];
      default:
        return [];
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      if (editingGateway) {
        // Update existing gateway
        const response = await axiosInstance.put('/settings/payment', {
          gatewayId: editingGateway._id,
          ...formData
        });
        toast.success('Payment gateway updated successfully');
      } else {
        // Create new gateway
        await axiosInstance.put('/settings/payment', formData);
        toast.success('Payment gateway created successfully');
      }
      
      await loadPaymentGateways();
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save payment gateway');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      isActive: false,
      testMode: true,
      description: '',
      credentials: {}
    });
    setEditingGateway(null);
    setShowForm(false);
  };

  const handleEditGateway = (gateway: PaymentGateway) => {
    setFormData({
      name: gateway.name,
      isActive: gateway.isActive,
      testMode: gateway.testMode,
      description: gateway.description || '',
      credentials: { ...gateway.credentials }
    });
    setEditingGateway(gateway);
    setShowForm(true);
  };

  const handleDeleteGateway = async (gatewayId: string) => {
    if (window.confirm('Are you sure you want to delete this payment gateway?')) {
      try {
        await axiosInstance.delete(`/settings/payment/${gatewayId}`);
        await loadPaymentGateways();
        toast.success('Payment gateway deleted successfully');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete payment gateway');
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
        <h1 className="text-2xl font-semibold">Payment Settings</h1>
        <p className="text-gray-600">Configure payment gateways and methods</p>
      </div>

      {/* Add New Gateway Form */}
      {showForm && (
        <div className="card mb-6">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">
              {editingGateway ? 'Edit Payment Gateway' : 'Add New Payment Gateway'}
            </h3>
            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gateway Name*
                </label>
                <select
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select Gateway</option>
                  <option value="Razorpay">Razorpay</option>
                  <option value="Stripe">Stripe</option>
                  <option value="PayU">PayU</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  placeholder="Gateway description"
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

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.testMode}
                    onChange={(e) => setFormData({ ...formData, testMode: e.target.checked })}
                    className="mr-2"
                  />
                  Test Mode
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
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : (editingGateway ? 'Update' : 'Create')} Gateway
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {gateways.map((gateway) => (
          <div key={gateway._id} className="card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <CreditCard className="h-6 w-6 mr-3 text-primary-500" />
                  <div>
                    <h3 className="text-lg font-medium">{gateway.name}</h3>
                    <p className="text-sm text-gray-500">
                      {gateway.description || 
                        (gateway.name === 'Cash on Delivery' 
                          ? 'Accept cash payments on delivery'
                          : `Accept payments through ${gateway.name}`
                        )
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`badge ${gateway.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {gateway.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className={`badge ${gateway.testMode ? 'badge-warning' : 'badge-success'}`}>
                    {gateway.testMode ? 'Test Mode' : 'Live Mode'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gateway.isActive}
                      onChange={() => handleToggleActive(gateway._id)}
                      className="sr-only peer"
                      disabled={saving}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>

              {gateway.isActive && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Configuration</h4>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleCredentialVisibility(gateway._id)}
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                      >
                        {showCredentials[gateway._id] ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-1" />
                            Hide
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            Show
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleEditGateway(gateway)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGateway(gateway._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getCredentialFields(gateway.name).map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label}
                        </label>
                        <input
                          type={showCredentials[gateway._id] ? 'text' : field.type}
                          value={gateway.credentials[field.key] || ''}
                          onChange={(e) => handleCredentialChange(gateway._id, field.key, e.target.value)}
                          className="input"
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                      </div>
                    ))}
                  </div>

                 

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleSave(gateway._id)}
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Test Mode Notice */}
      <div className="card mt-6">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-2">Test Mode</h3>
          <p className="text-gray-600 mb-4">
            Currently in test mode. Use test credentials and test card numbers for transactions.
            Switch to live mode when ready for production.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Test Card Numbers:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>Visa: 4111 1111 1111 1111</div>
              <div>Mastercard: 5555 5555 5555 4444</div>
              <div>American Express: 3782 822463 10005</div>
              <div>Any future expiry date and CVV</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;