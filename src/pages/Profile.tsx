import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Save, LogOut, Plus, Edit2, Trash2, Check } from 'lucide-react';
import { useStore } from '../store';
import { UserAddress } from '../types';
import { statesAndCities } from '../data/locations';

export function Profile() {
  const { user, updateUser, logout, addUserAddress, updateUserAddress, deleteUserAddress, setDefaultAddress } = useStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [saved, setSaved] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [isManualCity, setIsManualCity] = useState(false);
  const [addressForm, setAddressForm] = useState<Partial<UserAddress>>({
    label: '',
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: false,
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSave = () => {
    updateUser({
      ...user,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAddAddress = () => {
    if (!addressForm.label || !addressForm.name || !addressForm.phone || !addressForm.street || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      alert('Please fill all address fields');
      return;
    }

    const newAddress: UserAddress = {
      id: editingAddress?.id || `addr-${Date.now()}`,
      label: addressForm.label,
      name: addressForm.name,
      phone: addressForm.phone,
      street: addressForm.street,
      city: addressForm.city,
      state: addressForm.state,
      pincode: addressForm.pincode,
      country: addressForm.country || 'India',
      isDefault: addressForm.isDefault || false,
    };

    if (editingAddress) {
      updateUserAddress(newAddress);
    } else {
      addUserAddress(newAddress);
    }

    cancelAddressForm();
  };

  const handleEditAddress = (address: UserAddress) => {
    const hasCities = statesAndCities[address.state];
    const isManual = !hasCities || !hasCities.includes(address.city);

    setEditingAddress(address);
    setAddressForm(address);
    setIsManualCity(isManual);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = (addressId: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      deleteUserAddress(addressId);
    }
  };

  const handleSetDefault = (addressId: string) => {
    setDefaultAddress(addressId);
  };

  const cancelAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    setIsManualCity(false);
    setAddressForm({
      label: '',
      name: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      isDefault: false,
    });
  };

  const userAddresses = user.addresses || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>

      <div className="space-y-6">
        {/* Profile Info Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <User className="text-green-600" size={40} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>
              <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm capitalize">
                {user.role}
              </span>
            </div>
          </div>

          {/* Personal Info Form */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User size={20} /> Personal Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-4 mt-6 pt-6 border-t">
              <button
                onClick={handleSave}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${saved
                    ? 'bg-green-600 text-white'
                    : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
              >
                <Save size={18} />
                {saved ? 'Saved!' : 'Save Changes'}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-red-500 text-red-500 rounded-lg font-semibold hover:bg-red-50 transition"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Saved Addresses Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <MapPin size={20} /> Saved Addresses
            </h3>
            <button
              onClick={() => setShowAddressForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              <Plus size={18} />
              Add New Address
            </button>
          </div>

          {/* Address Form */}
          {showAddressForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-green-200">
              <h4 className="font-semibold text-gray-800 mb-4">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Address Label (e.g., Home, Office)</label>
                  <input
                    type="text"
                    placeholder="Home"
                    value={addressForm.label}
                    onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Recipient Name</label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={addressForm.name}
                      onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Street Address</label>
                  <input
                    type="text"
                    placeholder="House No., Building Name, Street"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">State</label>
                    <div className="relative">
                      <select
                        value={addressForm.state}
                        onChange={(e) => {
                          setAddressForm({ ...addressForm, state: e.target.value, city: '' });
                          setIsManualCity(false);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 appearance-none bg-white"
                      >
                        <option value="">Select State</option>
                        {Object.keys(statesAndCities).sort().map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">City</label>
                    {isManualCity ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter City Name"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                        <button
                          onClick={() => {
                            setIsManualCity(false);
                            setAddressForm({ ...addressForm, city: '' });
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 underline whitespace-nowrap px-2"
                        >
                          Select from list
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <select
                          value={addressForm.city}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'Other') {
                              setIsManualCity(true);
                              setAddressForm({ ...addressForm, city: '' });
                            } else {
                              setIsManualCity(false);
                              setAddressForm({ ...addressForm, city: val });
                            }
                          }}
                          disabled={!addressForm.state}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 appearance-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
                        >
                          <option value="">Select City</option>
                          {addressForm.state && statesAndCities[addressForm.state]?.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                          <option value="Other">Other (Enter Manually)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Pincode</label>
                    <input
                      type="text"
                      placeholder="6-digit pincode"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Country</label>
                    <input
                      type="text"
                      placeholder="Country"
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <label htmlFor="isDefault" className="text-sm text-gray-700">
                    Set as default address
                  </label>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleAddAddress}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    {editingAddress ? 'Update Address' : 'Save Address'}
                  </button>
                  <button
                    onClick={cancelAddressForm}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Saved Addresses List */}
          {userAddresses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="mx-auto mb-3 text-gray-400" size={48} />
              <p>No saved addresses yet</p>
              <p className="text-sm">Add an address to make checkout faster</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userAddresses.map((address) => (
                <div
                  key={address.id}
                  className={`p-4 rounded-lg border-2 transition ${address.isDefault
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-800">{address.label}</span>
                        {address.isDefault && (
                          <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full flex items-center gap-1">
                            <Check size={12} />
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 font-medium">{address.name}</p>
                      <p className="text-gray-600 text-sm">{address.phone}</p>
                      <p className="text-gray-600 text-sm mt-1">
                        {address.street}, {address.city}, {address.state} - {address.pincode}
                      </p>
                      <p className="text-gray-500 text-sm">{address.country}</p>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleEditAddress(address)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                      {!address.isDefault && (
                        <button
                          onClick={() => handleSetDefault(address.id)}
                          className="px-3 py-1 text-xs text-green-600 border border-green-600 hover:bg-green-50 rounded transition"
                          title="Set as default"
                        >
                          Set Default
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
