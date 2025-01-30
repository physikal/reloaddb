import React, { useState, useEffect } from 'react';
import { X, Package } from 'lucide-react';
import { Button } from '../ui/Button';
import { Load } from '../../types';
import { useInventoryStore } from '../../store/inventory';
import { useAuthStore } from '../../store/auth';
import { Ammunition } from '../../types/inventory';

interface AddToInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  load: Load;
}

export function AddToInventoryModal({ isOpen, onClose, load }: AddToInventoryModalProps) {
  const { addItem, updateItem, ammunition, fetchInventory } = useInventoryStore();
  const { user } = useAuthStore();
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch ammunition when modal opens
  useEffect(() => {
    if (isOpen && user?.id) {
      fetchInventory(user.id, 'ammunition');
    }
  }, [isOpen, user?.id, fetchInventory]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setError('');
      setLoading(true);

      const sku = `${load.bullet.brand} ${load.bullet.weight}gr`;
      const notes = `Handload: ${load.bullet.brand} ${load.bullet.weight}gr, ${load.powder.brand} ${load.powder.weight}gr, ${load.primer}`;

      // Check for existing ammunition entry
      const existingAmmo = ammunition.find(
        ammo => ammo.cartridge === load.cartridge && ammo.sku === sku
      );

      if (existingAmmo) {
        // Update existing entry
        await updateItem('ammunition', existingAmmo.id, {
          quantity: existingAmmo.quantity + parseInt(quantity),
          notes: notes // Update notes to ensure they're current
        });
      } else {
        // Create new entry
        await addItem('ammunition', {
          userId: user.id,
          cartridge: load.cartridge,
          sku: sku,
          quantity: parseInt(quantity),
          notes: notes
        });
      }

      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to add to inventory');
    } finally {
      setLoading(false);
    }
  };

  // Find existing ammunition entry for display
  const existingAmmo = ammunition.find(
    ammo => ammo.cartridge === load.cartridge && 
           ammo.sku === `${load.bullet.brand} ${load.bullet.weight}gr`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Add to Ammunition Inventory</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {existingAmmo && (
            <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm">
              This ammunition already exists in inventory with {existingAmmo.quantity} rounds.
              The quantity you enter will be added to the existing amount.
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cartridge
            </label>
            <input
              type="text"
              value={load.cartridge}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              SKU/Description
            </label>
            <input
              type="text"
              value={`${load.bullet.brand} ${load.bullet.weight}gr`}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quantity to Add
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
            {existingAmmo && (
              <p className="mt-1 text-sm text-gray-500">
                New total will be: {existingAmmo.quantity + (parseInt(quantity) || 0)} rounds
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              value={`Handload: ${load.bullet.brand} ${load.bullet.weight}gr, ${load.powder.brand} ${load.powder.weight}gr, ${load.primer}`}
              disabled
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : existingAmmo ? 'Update Inventory' : 'Add to Inventory'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}