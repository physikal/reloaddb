import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { RangeDayAmmunition } from '../../types/range';
import { Shot } from '../../types/range';

interface ShotFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (shot: Omit<Shot, 'timestamp'>) => void;
  rangeAmmunition: RangeDayAmmunition[];
}

export function ShotForm({ isOpen, onClose, onSubmit, rangeAmmunition }: ShotFormProps) {
  const [formData, setFormData] = useState({
    ammunitionId: '',
    muzzleVelocity: '',
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedAmmo = rangeAmmunition.find(a => a.ammunitionId === formData.ammunitionId)?.ammunition;
    if (!selectedAmmo) return;

    onSubmit({
      ammunitionId: formData.ammunitionId,
      ammunition: selectedAmmo,
      muzzleVelocity: Number(formData.muzzleVelocity),
      notes: formData.notes || undefined
    });

    setFormData({
      ammunitionId: '',
      muzzleVelocity: '',
      notes: ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Record Shot</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ammunition
            </label>
            <select
              value={formData.ammunitionId}
              onChange={(e) => setFormData({ ...formData, ammunitionId: e.target.value })}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Select ammunition</option>
              {rangeAmmunition.map((ammo) => (
                <option key={ammo.ammunitionId} value={ammo.ammunitionId}>
                  {ammo.ammunition.cartridge} ({ammo.roundsUsed} rounds used)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Muzzle Velocity (fps)
            </label>
            <input
              type="number"
              value={formData.muzzleVelocity}
              onChange={(e) => setFormData({ ...formData, muzzleVelocity: e.target.value })}
              required
              min="0"
              step="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Optional notes about the shot..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Record Shot
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}