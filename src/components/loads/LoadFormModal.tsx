import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { useLoadsStore } from '../../store/loads';
import { useCartridgesStore } from '../../store/cartridges';
import { useAuthStore } from '../../store/auth';
import { Load, LoadFormConfig } from '../../types';
import { CartridgeManager } from './CartridgeManager';

const DEFAULT_CONFIG: LoadFormConfig = {
  bullet: {
    brand: true,
    weight: true,
  },
  powder: {
    brand: true,
    weight: true,
  },
  primer: true,
  brass: {
    brand: true,
    length: true,
  },
  cartridgeOverallLength: true,
  cartridgeBaseToOgive: true,
  notes: true,
  cost: true,
};

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
  const config = user?.loadFormConfig || DEFAULT_CONFIG;
  const userCartridges = cartridges.filter(c => c.userId === user?.id);

  const [formData, setFormData] = useState({
    cartridge: '',
    bullet: {
      brand: '',
      weight: '',
    },
    powder: {
      brand: '',
      weight: '',
    },
    primer: '',
    brass: {
      brand: '',
      length: '',
    },
    cartridgeOverallLength: '',
    cartridgeBaseToOgive: '',
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
          weight: initialData.bullet.weight?.toString() || '',
        },
        powder: {
          brand: initialData.powder.brand || '',
          weight: initialData.powder.weight?.toString() || '',
        },
        primer: initialData.primer || '',
        brass: {
          brand: initialData.brass.brand || '',
          length: initialData.brass.length?.toString() || '',
        },
        cartridgeOverallLength: initialData.cartridgeOverallLength?.toString() || '',
        cartridgeBaseToOgive: initialData.cartridgeBaseToOgive?.toString() || '',
        notes: initialData.notes || '',
        favorite: initialData.favorite || false
      });
    } else {
      setFormData({
        cartridge: '',
        bullet: {
          brand: '',
          weight: '',
        },
        powder: {
          brand: '',
          weight: '',
        },
        primer: '',
        brass: {
          brand: '',
          length: '',
        },
        cartridgeOverallLength: '',
        cartridgeBaseToOgive: '',
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
    const processedData = {
      ...formData,
      cartridgeBaseToOgive: formData.cartridgeBaseToOgive || undefined
    };
    onSubmit(processedData);
    onClose();
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

            {(config.bullet.brand || config.bullet.weight) && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Bullet Details</h3>
                <div className="space-y-3">
                  {config.bullet.brand && (
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
                      />
                    </div>
                  )}
                  {config.bullet.weight && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Weight (gr)</label>
                      <input
                        type="number"
                        value={formData.bullet.weight}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bullet: { ...formData.bullet, weight: e.target.value },
                          })
                        }
                        step="0.1"
                        min="0"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {(config.powder.brand || config.powder.weight) && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Powder Details</h3>
                <div className="space-y-3">
                  {config.powder.brand && (
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
                      />
                    </div>
                  )}
                  {config.powder.weight && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Charge Weight (gr)</label>
                      <input
                        type="number"
                        value={formData.powder.weight}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            powder: { ...formData.powder, weight: e.target.value },
                          })
                        }
                        step="0.1"
                        min="0"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {config.primer && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Primer</label>
                <input
                  type="text"
                  value={formData.primer}
                  onChange={(e) => setFormData({ ...formData, primer: e.target.value })}
                />
              </div>
            )}

            {(config.brass.brand || config.brass.length) && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Brass Details</h3>
                <div className="space-y-3">
                  {config.brass.brand && (
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
                      />
                    </div>
                  )}
                  {config.brass.length && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Length (in)</label>
                      <input
                        type="number"
                        value={formData.brass.length}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            brass: { ...formData.brass, length: e.target.value },
                          })
                        }
                        step="0.001"
                        min="0"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {(config.cartridgeOverallLength || config.cartridgeBaseToOgive) && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Cartridge Measurements</h3>
                <div className="space-y-3">
                  {config.cartridgeOverallLength && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Cartridge Overall Length (COAL) (in)
                      </label>
                      <input
                        type="number"
                        value={formData.cartridgeOverallLength}
                        onChange={(e) => setFormData({ ...formData, cartridgeOverallLength: e.target.value })}
                      />
                    </div>
                  )}
                  {config.cartridgeBaseToOgive && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Cartridge Base to Ogive (CBTO) (in)
                      </label>
                      <input
                        type="number"
                        value={formData.cartridgeBaseToOgive}
                        onChange={(e) => setFormData({ ...formData, cartridgeBaseToOgive: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {config.notes && (
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