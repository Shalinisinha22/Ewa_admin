import React, { useState, useEffect } from 'react';
import { CreditCard, Eye, EyeOff, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentGateway {
  _id: string;
  name: string;
  isActive: boolean;
  credentials: Record<string, string>;
}

const PaymentsPage: React.FC = () => {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});

  // Mock data
  useEffect(() => {
    const mockGateways: PaymentGateway[] = [
      {
        _id: '1',
        name: 'Razorpay',
        isActive: true,
        credentials: {
          keyId: 'rzp_test_1234567890',
          keySecret: 'abcdef1234567890',
          webhookSecret: 'webhook_secret_123',
        },
      },
      {
        _id: '2',
        name: 'Stripe',
        isActive: false,
        credentials: {
          publishableKey: 'pk_test_1234567890',
          secretKey: 'sk_test_1234567890',
          webhookSecret: 'whsec_1234567890',
        },
      },
      {
        _id: '3',
        name: 'PayU',
        isActive: false,
        credentials: {
          merchantId: 'merchant_123',
          merchantKey: 'key_123',
          salt: 'salt_123',
        },
      },
      {
        _id: '4',
        name: 'Cash on Delivery',
        isActive: true,
        credentials: {
          maxAmount: '5000',
          charges: '25',
        },
      },
    ];
    setGateways(mockGateways);
  }, []);

  const handleCredentialChange = (gatewayId: string, field: string, value: string) => {
    setGateways(prev => prev.map(gateway => 
      gateway._id === gatewayId 
        ? { ...gateway, credentials: { ...gateway.credentials, [field]: value } }
        : gateway
    ));
  };

  const handleToggleActive = (gatewayId: string) => {
    setGateways(prev => prev.map(gateway => 
      gateway._id === gatewayId 
        ? { ...gateway, isActive: !gateway.isActive }
        : gateway
    ));
  };

  const handleSave = (gatewayId: string) => {
    // In real app, this would save to backend
    toast.success('Payment gateway settings saved successfully');
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
      default:
        return [];
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Payment Settings</h1>
        <p className="text-gray-600">Configure payment gateways and methods</p>
      </div>

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
                      {gateway.name === 'Cash on Delivery' 
                        ? 'Accept cash payments on delivery'
                        : `Accept payments through ${gateway.name}`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`badge ${gateway.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {gateway.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gateway.isActive}
                      onChange={() => handleToggleActive(gateway._id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>

              {gateway.isActive && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Configuration</h4>
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

                  {gateway.name !== 'Cash on Delivery' && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                      <div className="flex">
                        <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                        <div className="text-sm text-yellow-700">
                          <p className="font-medium">Security Note:</p>
                          <p>Keep your API keys secure. Never share them publicly or commit them to version control.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleSave(gateway._id)}
                      className="btn btn-primary"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
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