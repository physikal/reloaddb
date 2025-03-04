import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { useLoadsStore } from '../../store/loads';
import { useCartridgesStore } from '../../store/cartridges';
import { useAuthStore } from '../../store/auth';
import { CartridgeManager } from './CartridgeManager';
import { Load } from '../../types';

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
        notes: initialData.notes || '',
        favorite: initialData.favorite || false
      });
    } else {
      // Reset form when opening for new item
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
      bullet: {
        ...formData.bullet,
        weight: formData.bullet.weight === '' ? 0 : Number(formData.bullet.weight),
      },
      powder: {
        ...formData.powder,
        weight: formData.powder.weight === '' ? 0 : Number(formData.powder.weight),
      },
      brass: {
        ...formData.brass,
        length: formData.brass.length === '' ? 0 : Number(formData.brass.length),
      },
      cartridgeOverallLength: formData.cartridgeOverallLength === '' ? 0 : Number(formData.cartridgeOverallLength),
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

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Bullet Details</h3>
              <div className="space-y-3">
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
                    required
                    step="0.1"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Powder Details</h3>
              <div className="space-y-3">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">Weight (gr)</label>
                  <input
                    type="number"
                    value={formData.powder.weight}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        powder: { ...formData.powder, weight: e.target.value },
                      })
                    }
                    required
                    step="0.1"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Primer</label>
              <input
                type="text"
                value={formData.primer}
                onChange={(e) => setFormData({ ...formData, primer: e.target.value })}
                required
              />
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Brass Details</h3>
              <div className="space-y-3">
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
                    required
                    step="0.001"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cartridge Overall Length (in)
              </label>
              <input
                type="number"
                value={formData.cartridgeOverallLength}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cartridgeOverallLength: e.target.value,
                  })
                }
                required
                step="0.001"
                min="0"
              />
            </div>

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