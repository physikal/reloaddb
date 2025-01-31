import React, { useState } from 'react';
import { Plus, X, Target } from 'lucide-react';
import { Button } from '../ui/Button';
import { RangeDayAmmunition, Shot } from '../../types/range';

interface ShotStringFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (shots: Omit<Shot, 'timestamp'>[]) => void;
  rangeAmmunition: RangeDayAmmunition[];
}

interface ShotInput {
  muzzleVelocity: string;
  notes?: string;
}

export function ShotStringForm({ isOpen, onClose, onSubmit, rangeAmmunition }: ShotStringFormProps) {
  const [selectedAmmoId, setSelectedAmmoId] = useState('');
  const [shots, setShots] = useState<ShotInput[]>([{ muzzleVelocity: '', notes: '' }]);
  const [stringNotes, setStringNotes] = useState('');

  if (!isOpen) return null;

  const addShot = () => {
    setShots([...shots, { muzzleVelocity: '', notes: '' }]);
  };

  const removeShot = (index: number) => {
    setShots(shots.filter((_, i) => i !== index));
  };

  const updateShot = (index: number, field: keyof ShotInput, value: string) => {
    const newShots = [...shots];
    newShots[index] = { ...newShots[index], [field]: value };
    setShots(newShots);
  };

  const calculateStats = () => {
    const velocities = shots
      .map(s => parseFloat(s.muzzleVelocity))
      .filter(v => !isNaN(v));

    if (velocities.length === 0) return null;

    const sum = velocities.reduce((a, b) => a + b, 0);
    const avg = sum / velocities.length;
    const max = Math.max(...velocities);
    const min = Math.min(...velocities);
    const es = max - min;

    // Calculate Standard Deviation
    const squareDiffs = velocities.map(value => {
      const diff = value - avg;
      return diff * diff;
    });
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / velocities.length;
    const sd = Math.sqrt(avgSquareDiff);

    return {
      average: Math.round(avg),
      sd: Math.round(sd),
      es: Math.round(es),
      min: Math.round(min),
      max: Math.round(max)
    };
  };

  const stats = calculateStats();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmmoId) return;

    const selectedAmmo = rangeAmmunition.find(a => a.ammunitionId === selectedAmmoId)?.ammunition;
    if (!selectedAmmo) return;

    const processedShots = shots
      .filter(shot => shot.muzzleVelocity.trim() !== '')
      .map(shot => ({
        ammunitionId: selectedAmmoId,
        ammunition: selectedAmmo,
        muzzleVelocity: parseFloat(shot.muzzleVelocity),
        notes: shot.notes || stringNotes || undefined
      }));

    onSubmit(processedShots);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Record Shot String
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ammunition
              </label>
              <select
                value={selectedAmmoId}
                onChange={(e) => setSelectedAmmoId(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">Select ammunition</option>
                {rangeAmmunition.map((ammo) => (
                  <option key={`ammo-${ammo.ammunitionId}`} value={ammo.ammunitionId}>
                    {ammo.ammunition.cartridge} ({ammo.roundsUsed} rounds used)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Shots</h3>
                <Button type="button" onClick={addShot} variant="secondary" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Shot
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {shots.map((shot, index) => (
                  <div key={`shot-${index}`} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary-100 text-primary-600 font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700">
                            Muzzle Velocity (fps)
                          </label>
                          <input
                            type="number"
                            value={shot.muzzleVelocity}
                            onChange={(e) => updateShot(index, 'muzzleVelocity', e.target.value)}
                            required
                            min="0"
                            step="1"
                            className="mt-1 block w-full"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700">
                            Notes (optional)
                          </label>
                          <input
                            type="text"
                            value={shot.notes || ''}
                            onChange={(e) => updateShot(index, 'notes', e.target.value)}
                            className="mt-1 block w-full"
                          />
                        </div>
                      </div>
                    </div>
                    {shots.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeShot(index)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {stats && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h3 className="font-medium text-gray-900">String Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Average</p>
                    <p className="text-lg font-medium text-gray-900">{stats.average} fps</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">SD</p>
                    <p className="text-lg font-medium text-gray-900">{stats.sd} fps</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ES</p>
                    <p className="text-lg font-medium text-gray-900">{stats.es} fps</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Min</p>
                    <p className="text-lg font-medium text-gray-900">{stats.min} fps</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Max</p>
                    <p className="text-lg font-medium text-gray-900">{stats.max} fps</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                String Notes (optional)
              </label>
              <textarea
                value={stringNotes}
                onChange={(e) => setStringNotes(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Add any notes about this string of shots..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 p-4 border-t bg-gray-50">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedAmmoId || shots.length === 0}>
              Record String
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}