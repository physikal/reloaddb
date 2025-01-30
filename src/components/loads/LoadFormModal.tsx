import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { useLoadsStore } from '../../store/loads';
import { useCartridgesStore } from '../../store/cartridges';
import { useAuthStore } from '../../store/auth';
import { Load } from '../../types';
import { CartridgeManager } from './CartridgeManager';

interface LoadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Load, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Load;
}

export function LoadFormModal({ isOpen, onClose, onSubmit, initialData }: LoadFormModalProps) {
  const { cartridges, fetchCartridges } = useCartridgesStore();
  const { user } = useAuthStore();
  const [showCartridgeManager, setShowCartridgeManager] = useState(false);
  const userCartridges = cartridges.filter(c => c.userId === user?.id);

  // Get form configuration from user metadata with fallback defaults
  const formConfig = user?.user_metadata?.load_form_config || {
    bullet: { brand: true, weight: true },
    powder: { brand: true, weight: true },
    primer: true,
    brass: { brand: true, length: true },
    cartridgeOverallLength: true,
    cartridgeBaseToOgive: true,
    notes: true,
    cost: true
  };

  const [formData, setFormData] = useState({
    cartridge: '',
    bullet: {
      brand: '',
      weight: '',
      weightRaw: ''
    },
    powder: {
      brand: '',
      weight: '',
      weightRaw: ''
    },
    primer: '',
    brass: {
      brand: '',
      length: '',
      lengthRaw: ''
    },
    cartridgeOverallLength: '',
    cartridgeOverallLengthRaw: '',
    cartridgeBaseToOgive: '',
    cartridgeBaseToOgiveRaw: '',
    notes: '',
    favorite: false
  });

  useEffect(() => {
    if (user?.id) {
      fetchCartridges(user.id);
    }
  }, [user?.id, fetchCartridges]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        cartridge: initialData.cartridge || '',
        bullet: {
          brand: initialData.bullet.brand || '',
          weight: initialData.bullet.weightRaw || initialData.bullet.weight?.toString() || '',
          weightRaw: initialData.bullet.weightRaw || initialData.bullet.weight?.toString() || ''
        },
        powder: {
          brand: initialData.powder.brand || '',
          weight: initialData.powder.weightRaw || initialData.powder.weight?.toString() || '',
          weightRaw: initialData.powder.weightRaw || initialData.powder.weight?.toString() || ''
        },
        primer: initialData.primer || '',
        brass: {
          brand: initialData.brass.brand || '',
          length: initialData.brass.lengthRaw || initialData.brass.length?.toString() || '',
          lengthRaw: initialData.brass.lengthRaw || initialData.brass.length?.toString() || ''
        },
        cartridgeOverallLength: initialData.cartridgeOverallLengthRaw || initialData.cartridgeOverallLength?.toString() || '',
        cartridgeOverallLengthRaw: initialData.cartridgeOverallLengthRaw || initialData.cartridgeOverallLength?.toString() || '',
        cartridgeBaseToOgive: initialData.cartridgeBaseToOgiveRaw || initialData.cartridgeBaseToOgive?.toString() || '',
        cartridgeBaseToOgiveRaw: initialData.cartridgeBaseToOgiveRaw || initialData.cartridgeBaseToOgive?.toString() || '',
        notes: initialData.notes || '',
        favorite: initialData.favorite || false
      });
    } else {
      setFormData({
        cartridge: '',
        bullet: {
          brand: '',
          weight: '',
          weightRaw: ''
        },
        powder: {
          brand: '',
          weight: '',
          weightRaw: ''
        },
        primer: '',
        brass: {
          brand: '',
          length: '',
          lengthRaw: ''
        },
        cartridgeOverallLength: '',
        cartridgeOverallLengthRaw: '',
        cartridgeBaseToOgive: '',
        cartridgeBaseToOgiveRaw: '',
        notes: '',
        favorite: false
      });
    }
  }, [initialData, isOpen]);

  const handleCartridgeManagerClose = () => {
    setShowCartridgeManager(false);
    if (user?.id) {
      fetchCartridges(user.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert string values to numbers while preserving raw values
    const processedData = {
      ...formData,
      bullet: {
        brand: formData.bullet.brand,
        weight: Number(formData.bullet.weight),
        weightRaw: formData.bullet.weightRaw || formData.bullet.weight
      },
      powder: {
        brand: formData.powder.brand,
        weight: Number(formData.powder.weight),
        weightRaw: formData.powder.weightRaw || formData.powder.weight
      },
      brass: {
        brand: formData.brass.brand,
        length: Number(formData.brass.length),
        lengthRaw: formData.brass.lengthRaw || formData.brass.length
      },
      cartridgeOverallLength: Number(formData.cartridgeOverallLength),
      cartridgeOverallLengthRaw: formData.cartridgeOverallLengthRaw || formData.cartridgeOverallLength,
      cartridgeBaseToOgive: formData.cartridgeBaseToOgive ? Number(formData.cartridgeBaseToOgive) : undefined,
      cartridgeBaseToOgiveRaw: formData.cartridgeBaseToOgive ? (formData.cartridgeBaseToOgiveRaw || formData.cartridgeBaseToOgive) : undefined
    };

    onSubmit(processedData);
    onClose();
  };

  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>, field: string, subfield?: string) => {
    const value = e.target.value;
    // Allow empty string or valid decimal numbers
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      if (subfield) {
        setFormData(prev => ({
          ...prev,
          [field]: {
            ...prev[field],
            [subfield]: value,
            [`${subfield}Raw`]: value // Store raw value
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [field]: value,
          [`${field}Raw`]: value // Store raw value
        }));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-4">
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 border-b bg-white rounded-t-lg">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Edit Load' : 'New Load'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Cartridge</label>
              <select
                value={formData.cartridge}
                onChange={(e) => setFormData({ ...formData, cartridge: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              >
                <option value="">Select cartridge</option>
                {userCartridges.map((cartridge) => (
                  <option key={cartridge.id} value={cartridge.name}>
                    {cartridge.name}
                  </option>
                ))}
              </select>
              <div className="mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCartridgeManager(true)}
                >
                  <Plus className="w-4 h-4 mr-1" /> Manage Cartridges
                </Button>
              </div>
            </div>

            {(formConfig.bullet.brand || formConfig.bullet.weight) && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Bullet Details</h3>
                <div className="space-y-3">
                  {formConfig.bullet.brand && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bullet</label>
                      <input
                        type="text"
                        value={formData.bullet.brand}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bullet: { ...formData.bullet, brand: e.target.value },
                          })
                        }
                        required
                      />
                    </div>
                  )}
                  {formConfig.bullet.weight && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Weight (gr)</label>
                      <input
                        type="text"
                        value={formData.bullet.weight}
                        onChange={(e) => handleNumericInput(e, 'bullet', 'weight')}
                        required
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {(formConfig.powder.brand || formConfig.powder.weight) && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Powder Details</h3>
                <div className="space-y-3">
                  {formConfig.powder.brand && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Brand</label>
                      <input
                        type="text"
                        value={formData.powder.brand}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            powder: { ...formData.powder, brand: e.target.value },
                          })
                        }
                        required
                      />
                    </div>
                  )}
                  {formConfig.powder.weight && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Charge Weight (gr)</label>
                      <input
                        type="text"
                        value={formData.powder.weight}
                        onChange={(e) => handleNumericInput(e, 'powder', 'weight')}
                        required
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {formConfig.primer && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Primer</label>
                <input
                  type="text"
                  value={formData.primer}
                  onChange={(e) => setFormData({ ...formData, primer: e.target.value })}
                  required
                />
              </div>
            )}

            {(formConfig.brass.brand || formConfig.brass.length) && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Brass Details</h3>
                <div className="space-y-3">
                  {formConfig.brass.brand && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Brand</label>
                      <input
                        type="text"
                        value={formData.brass.brand}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            brass: { ...formData.brass, brand: e.target.value },
                          })
                        }
                        required
                      />
                    </div>
                  )}
                  {formConfig.brass.length && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Length (in)</label>
                      <input
                        type="text"
                        value={formData.brass.length}
                        onChange={(e) => handleNumericInput(e, 'brass', 'length')}
                        required
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {(formConfig.cartridgeOverallLength || formConfig.cartridgeBaseToOgive) && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Cartridge Measurements</h3>
                <div className="space-y-3">
                  {formConfig.cartridgeOverallLength && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Cartridge Overall Length (COAL) (in)
                      </label>
                      <input
                        type="text"
                        value={formData.cartridgeOverallLength}
                        onChange={(e) => handleNumericInput(e, 'cartridgeOverallLength')}
                        required
                      />
                    </div>
                  )}
                  {formConfig.cartridgeBaseToOgive && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Cartridge Base to Ogive (CBTO) (in)
                      </label>
                      <input
                        type="text"
                        value={formData.cartridgeBaseToOgive}
                        onChange={(e) => handleNumericInput(e, 'cartridgeBaseToOgive')}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {formConfig.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Add any additional notes about this load..."
                />
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="favorite"
                checked={formData.favorite}
                onChange={(e) => setFormData({ ...formData, favorite: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="favorite" className="ml-2 block text-sm text-gray-900">
                Add to favorites
              </label>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t mt-6">
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {initialData ? 'Update Load' : 'Create Load'}
              </Button>
            </div>
          </div>
        </form>
      </div>
      
      {showCartridgeManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Manage Cartridges</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCartridgeManagerClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <CartridgeManager />
          </div>
        </div>
      )}
    </div>
  );
}