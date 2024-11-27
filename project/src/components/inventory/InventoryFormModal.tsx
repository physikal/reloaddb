import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useInventoryStore } from '../../store/inventory';
import { InventoryType } from '../../types/inventory';
import { useAuthStore } from '../../store/auth';

interface InventoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: InventoryType;
  initialData?: any;
}

const PRIMER_TYPES = [
  'Small Rifle',
  'Large Rifle',
  'Large Rifle Magnum',
  'Small Pistol',
  'Small Pistol Magnum',
  'Large Pistol',
  'Large Pistol Magnum'
];

const BRASS_CONDITIONS = [
  'new',
  'once-fired',
  'reloaded'
];

const FIREARM_TYPES = [
  'Rifle',
  'Pistol',
  'Shotgun',
  'Other'
];

const FIREARM_CONDITIONS = [
  'New',
  'Excellent',
  'Good',
  'Fair',
  'Poor'
];

export function InventoryFormModal({ isOpen, onClose, type, initialData }: InventoryFormModalProps) {
  const { addItem, updateItem } = useInventoryStore();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState<any>(initialData || {});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({});
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    const itemData = {
      ...formData,
      userId: user.id
    };

    try {
      if (initialData) {
        await updateItem(type, initialData.id, itemData);
      } else {
        await addItem(type, itemData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const renderFormFields = () => {
    switch (type) {
      case 'firearms':
        return (
          <>
            <div>
              <label>Manufacturer</label>
              <input
                type="text"
                value={formData.manufacturer || ''}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
              />
            </div>
            <div>
              <label>Model</label>
              <input
                type="text"
                value={formData.model || ''}
                onChange={(e) => handleInputChange('model', e.target.value)}
              />
            </div>
            <div>
              <label>Serial Number (optional)</label>
              <input
                type="text"
                value={formData.serialNumber || ''}
                onChange={(e) => handleInputChange('serialNumber', e.target.value)}
              />
            </div>
            <div>
              <label>Type</label>
              <select
                value={formData.type || ''}
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                <option value="">Select type</option>
                {FIREARM_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Caliber</label>
              <input
                type="text"
                value={formData.caliber || ''}
                onChange={(e) => handleInputChange('caliber', e.target.value)}
              />
            </div>
            <div>
              <label>Barrel Length (inches)</label>
              <input
                type="number"
                step="0.125"
                value={formData.barrelLength || ''}
                onChange={(e) => handleInputChange('barrelLength', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label>Purchase Date (optional)</label>
              <input
                type="date"
                value={formData.purchaseDate ? new Date(formData.purchaseDate).toISOString().split('T')[0] : ''}
                onChange={(e) => handleInputChange('purchaseDate', new Date(e.target.value))}
              />
            </div>
            <div>
              <label>Purchase Price ($) (optional)</label>
              <input
                type="number"
                step="0.01"
                value={formData.purchasePrice || ''}
                onChange={(e) => handleInputChange('purchasePrice', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label>Condition</label>
              <select
                value={formData.condition || ''}
                onChange={(e) => handleInputChange('condition', e.target.value)}
              >
                <option value="">Select condition</option>
                {FIREARM_CONDITIONS.map(condition => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>
          </>
        );

      case 'ammunition':
        return (
          <>
            <div>
              <label>Caliber</label>
              <input
                type="text"
                value={formData.caliber || ''}
                onChange={(e) => handleInputChange('caliber', e.target.value)}
                required
              />
            </div>
            <div>
              <label>SKU</label>
              <input
                type="text"
                value={formData.sku || ''}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                required
              />
            </div>
            <div>
              <label>Quantity</label>
              <input
                type="number"
                value={formData.quantity || ''}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                required
                min="0"
              />
            </div>
            <div>
              <label>Lot Number (optional)</label>
              <input
                type="text"
                value={formData.lotNumber || ''}
                onChange={(e) => handleInputChange('lotNumber', e.target.value)}
              />
            </div>
          </>
        );

      case 'bullets':
        return (
          <>
            <div>
              <label>Manufacturer</label>
              <input
                type="text"
                value={formData.manufacturer || ''}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                required
              />
            </div>
            <div>
              <label>SKU</label>
              <input
                type="text"
                value={formData.sku || ''}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                required
              />
            </div>
            <div>
              <label>Weight (gr)</label>
              <input
                type="number"
                value={formData.weight || ''}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value))}
                required
                step="0.1"
                min="0"
              />
            </div>
            <div>
              <label>Type</label>
              <input
                type="text"
                value={formData.type || ''}
                onChange={(e) => handleInputChange('type', e.target.value)}
                required
              />
            </div>
            <div>
              <label>Quantity</label>
              <input
                type="number"
                value={formData.quantity || ''}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                required
                min="0"
              />
            </div>
          </>
        );

      case 'powder':
        return (
          <>
            <div>
              <label>Manufacturer</label>
              <input
                type="text"
                value={formData.manufacturer || ''}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                required
              />
            </div>
            <div>
              <label>SKU</label>
              <input
                type="text"
                value={formData.sku || ''}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                required
              />
            </div>
            <div>
              <label>Weight (lbs)</label>
              <input
                type="number"
                value={formData.weight || ''}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value))}
                required
                step="0.1"
                min="0"
              />
            </div>
            <div>
              <label>Lot Number (optional)</label>
              <input
                type="text"
                value={formData.lotNumber || ''}
                onChange={(e) => handleInputChange('lotNumber', e.target.value)}
              />
            </div>
          </>
        );

      case 'primers':
        return (
          <>
            <div>
              <label>Manufacturer</label>
              <input
                type="text"
                value={formData.manufacturer || ''}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                required
              />
            </div>
            <div>
              <label>SKU</label>
              <input
                type="text"
                value={formData.sku || ''}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                required
              />
            </div>
            <div>
              <label>Type</label>
              <select
                value={formData.type || ''}
                onChange={(e) => handleInputChange('type', e.target.value)}
                required
              >
                <option value="">Select type</option>
                {PRIMER_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Quantity</label>
              <input
                type="number"
                value={formData.quantity || ''}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                required
                min="0"
              />
            </div>
            <div>
              <label>Lot Number (optional)</label>
              <input
                type="text"
                value={formData.lotNumber || ''}
                onChange={(e) => handleInputChange('lotNumber', e.target.value)}
              />
            </div>
          </>
        );

      case 'brass':
        return (
          <>
            <div>
              <label>Caliber</label>
              <input
                type="text"
                value={formData.caliber || ''}
                onChange={(e) => handleInputChange('caliber', e.target.value)}
                required
              />
            </div>
            <div>
              <label>Manufacturer</label>
              <input
                type="text"
                value={formData.manufacturer || ''}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                required
              />
            </div>
            <div>
              <label>Quantity</label>
              <input
                type="number"
                value={formData.quantity || ''}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                required
                min="0"
              />
            </div>
            <div>
              <label>Condition</label>
              <select
                value={formData.condition || ''}
                onChange={(e) => handleInputChange('condition', e.target.value)}
                required
              >
                <option value="">Select condition</option>
                {BRASS_CONDITIONS.map(condition => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Edit' : 'Add'} {type.charAt(0).toUpperCase() + type.slice(1)}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {renderFormFields()}
          
          <div>
            <label>Notes (optional)</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? 'Update' : 'Add'} Item
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}