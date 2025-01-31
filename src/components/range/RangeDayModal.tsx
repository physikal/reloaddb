import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Check, Calendar, Target, Package, Upload, Trash2, Gauge } from 'lucide-react';
import { Button } from '../ui/Button';
import { useRangeStore } from '../../store/range';
import { useInventoryStore } from '../../store/inventory';
import { useAuthStore } from '../../store/auth';
import { RangeDay, RangeDayFirearm, RangeDayAmmunition, Shot } from '../../types/range';
import { ShotStringForm } from './ShotStringForm';
import { ImportGarminModal } from './ImportGarminModal';
import { formatDate } from '../../utils/format';

interface RangeDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  rangeDay?: RangeDay;
  isNew?: boolean;
  onUpdate?: () => void;
}

interface ShotString {
  shots: Shot[];
  stats: {
    average: number;
    sd: number;
    es: number;
    min: number;
    max: number;
  };
}

function groupShotsIntoStrings(shots: Shot[]): ShotString[] {
  if (!shots || shots.length === 0) return [];

  // Sort shots by timestamp
  const sortedShots = [...shots].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Group shots by ammunition and time proximity (within 2 minutes)
  const strings: Shot[][] = [];
  let currentString: Shot[] = [];
  let lastShot: Shot | null = null;

  sortedShots.forEach(shot => {
    const shotTime = new Date(shot.timestamp).getTime();
    
    if (lastShot) {
      const timeDiff = shotTime - new Date(lastShot.timestamp).getTime();
      const sameAmmo = shot.ammunitionId === lastShot.ammunitionId;
      const stringFull = currentString.length >= 10;
      
      // Start a new string if:
      // - More than 2 minutes have passed
      // - Different ammunition is used
      // - Current string has 10 shots
      if (timeDiff > 2 * 60 * 1000 || !sameAmmo || stringFull) {
        if (currentString.length > 0) {
          strings.push(currentString);
        }
        currentString = [shot];
      } else {
        currentString.push(shot);
      }
    } else {
      currentString.push(shot);
    }
    
    lastShot = shot;
  });

  // Add the last string
  if (currentString.length > 0) {
    strings.push(currentString);
  }

  // Calculate statistics for each string
  return strings.map(stringShots => {
    const velocities = stringShots.map(s => s.muzzleVelocity);
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
      shots: stringShots,
      stats: {
        average: Math.round(avg),
        sd: Math.round(sd),
        es: Math.round(es),
        min: Math.round(min),
        max: Math.round(max)
      }
    };
  });
}

export default function RangeDayModal({ isOpen, onClose, rangeDay, isNew = false, onUpdate }: RangeDayModalProps) {
  const { user } = useAuthStore();
  const { firearms, ammunition, fetchInventory } = useInventoryStore();
  const { addRangeDay, updateRangeDay, fetchRangeDays } = useRangeStore();
  const [isEditing, setIsEditing] = useState(isNew);
  const [showShotForm, setShowShotForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [currentRangeDay, setCurrentRangeDay] = useState<RangeDay | undefined>(rangeDay);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    firearms: [] as RangeDayFirearm[],
    ammunition: [] as RangeDayAmmunition[],
    notes: ''
  });

  // Fetch inventory data when modal opens
  useEffect(() => {
    if (isOpen && user?.id) {
      Promise.all([
        fetchInventory(user.id, 'firearms'),
        fetchInventory(user.id, 'ammunition')
      ]);
    }
  }, [isOpen, user?.id, fetchInventory]);

  // Update form data when range day changes
  useEffect(() => {
    if (rangeDay) {
      setFormData({
        title: rangeDay.title,
        date: new Date(rangeDay.date).toISOString().split('T')[0],
        firearms: rangeDay.firearms,
        ammunition: rangeDay.ammunition || [],
        notes: rangeDay.notes || ''
      });
      setCurrentRangeDay(rangeDay);
    } else {
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        firearms: [],
        ammunition: [],
        notes: ''
      });
      setCurrentRangeDay(undefined);
    }
    setIsEditing(isNew);
  }, [rangeDay, isNew]);

  const shotStrings = currentRangeDay?.shots ? groupShotsIntoStrings(currentRangeDay.shots) : [];

  if (!isOpen) return null;

  const refreshData = async () => {
    if (!user?.id || !currentRangeDay?.id) return;
    
    try {
      const rangeDays = await fetchRangeDays(user.id);
      const updatedRangeDay = rangeDays.find(day => day.id === currentRangeDay.id);
      if (updatedRangeDay) {
        setCurrentRangeDay(updatedRangeDay);
      }
      onUpdate?.();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) return;

    try {
      const rangeDayData = {
        ...formData,
        userId: user.id,
        date: new Date(formData.date)
      };

      if (currentRangeDay) {
        const updatedRangeDay = await updateRangeDay(currentRangeDay.id, rangeDayData);
        setCurrentRangeDay(updatedRangeDay);
      } else {
        const newRangeDay = await addRangeDay(rangeDayData);
        setCurrentRangeDay(newRangeDay);
      }
      setIsEditing(false);
      if (!currentRangeDay) {
        onClose();
      }
      await refreshData();
    } catch (error) {
      console.error('Error saving range day:', error);
    }
  };

  const handleAddShots = async (shots: Omit<Shot, 'timestamp'>[]) => {
    if (!currentRangeDay) return;

    try {
      const newShots = shots.map(shot => ({
        ...shot,
        timestamp: new Date()
      }));

      const updatedRangeDay = await updateRangeDay(currentRangeDay.id, {
        shots: [...(currentRangeDay.shots || []), ...newShots]
      });

      setCurrentRangeDay(updatedRangeDay);
      await refreshData();
      setShowShotForm(false);
      setShowImportModal(false);
    } catch (error) {
      console.error('Error adding shots:', error);
    }
  };

  const handleDeleteShotString = async (stringIndex: number) => {
    if (!currentRangeDay || !currentRangeDay.shots) return;

    try {
      const stringShots = shotStrings[stringIndex].shots;
      const newShots = currentRangeDay.shots.filter(shot => 
        !stringShots.some(stringShot => 
          new Date(stringShot.timestamp).getTime() === new Date(shot.timestamp).getTime() &&
          stringShot.ammunitionId === shot.ammunitionId
        )
      );

      const updatedRangeDay = await updateRangeDay(currentRangeDay.id, { shots: newShots });
      setCurrentRangeDay(updatedRangeDay);
      await refreshData();
    } catch (error) {
      console.error('Error deleting shot string:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl my-4 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            {isEditing ? (
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="text-2xl font-semibold text-gray-900 border-b-2 border-primary-500 focus:outline-none"
                placeholder="Range Day Title"
                required
              />
            ) : (
              <h2 className="text-2xl font-semibold text-gray-900">{rangeDay?.title || 'New Range Day'}</h2>
            )}
            <div className="flex items-center mt-1 text-gray-500">
              <Calendar className="w-4 h-4 mr-2" />
              {isEditing ? (
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="border-b border-gray-300 focus:border-primary-500 focus:outline-none"
                  required
                />
              ) : (
                rangeDay?.date.toLocaleDateString()
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {!isNew && !isEditing && (
              <div className="flex items-center space-x-4">
                <Button onClick={() => setShowShotForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Shot String
                </Button>
                <Button onClick={() => setShowImportModal(true)} variant="secondary">
                  <Upload className="w-4 h-4 mr-2" />
                  Import from Garmin
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (isEditing) {
                      handleSubmit();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                >
                  {isEditing ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </>
                  )}
                </Button>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {!isEditing && currentRangeDay && (
            <>
              {/* Statistics Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-500 mb-2">
                    <Target className="w-4 h-4 mr-2" />
                    <h3 className="font-medium">Total Shots</h3>
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">
                    {currentRangeDay.stats?.totalShots || 0}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-500 mb-2">
                    <Gauge className="w-4 h-4 mr-2" />
                    <h3 className="font-medium">Average MV</h3>
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">
                    {currentRangeDay.stats?.avgMuzzleVelocity ? 
                      `${Math.round(currentRangeDay.stats.avgMuzzleVelocity)} fps` : 
                      '-'
                    }
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-500 mb-2">
                    <Package className="w-4 h-4 mr-2" />
                    <h3 className="font-medium">Ammunition Used</h3>
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">
                    {currentRangeDay.ammunition?.reduce((total, ammo) => total + ammo.roundsUsed, 0) || 0}
                  </p>
                </div>
              </div>

              {/* Shot Strings */}
              {shotStrings.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Shot Strings</h3>
                  {shotStrings.map((string, stringIndex) => (
                    <div key={stringIndex} className="bg-white border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-4 border-b">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              String #{stringIndex + 1} - {string.shots[0].ammunition.cartridge}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {formatDate(string.shots[0].timestamp)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="grid grid-cols-5 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Avg</p>
                                <p className="font-medium">{string.stats.average} fps</p>
                              </div>
                              <div>
                                <p className="text-gray-500">SD</p>
                                <p className="font-medium">{string.stats.sd} fps</p>
                              </div>
                              <div>
                                <p className="text-gray-500">ES</p>
                                <p className="font-medium">{string.stats.es} fps</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Min</p>
                                <p className="font-medium">{string.stats.min} fps</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Max</p>
                                <p className="font-medium">{string.stats.max} fps</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteShotString(stringIndex)}
                              className="text-gray-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shot</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MV (fps)</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {string.shots.map((shot, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  #{index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatDate(shot.timestamp)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {shot.muzzleVelocity}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                  {shot.notes || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Firearms Used */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Firearms Used</h3>
                <div className="bg-white border rounded-lg divide-y">
                  {currentRangeDay.firearms.map((item, index) => (
                    <div key={index} className="p-4">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {item.firearm.manufacturer} {item.firearm.model}
                          </h4>
                          {item.firearm.caliber && (
                            <p className="text-sm text-gray-500">
                              Caliber: {item.firearm.caliber}
                            </p>
                          )}
                        </div>
                      </div>
                      {item.notes && (
                        <p className="mt-2 text-sm text-gray-600">{item.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Ammunition Used */}
              {currentRangeDay.ammunition && currentRangeDay.ammunition.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Ammunition Used</h3>
                  <div className="bg-white border rounded-lg divide-y">
                    {currentRangeDay.ammunition.map((item, index) => (
                      <div key={index} className="p-4">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {item.ammunition.cartridge}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Rounds Used: {item.roundsUsed}
                            </p>
                          </div>
                        </div>
                        {item.notes && (
                          <p className="mt-2 text-sm text-gray-600">{item.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {currentRangeDay.notes && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Notes</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{currentRangeDay.notes}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Editable Content */}
          {isEditing && (
            <div className="space-y-6">
              {/* Firearms Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Firearms</h3>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      firearms: [
                        ...prev.firearms,
                        {
                          firearmId: '',
                          firearm: {} as any,
                          notes: ''
                        }
                      ]
                    }))}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Firearm
                  </Button>
                </div>

                {formData.firearms.map((item, index) => (
                  <div key={index} className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 mr-4">
                        <label className="block text-sm font-medium text-gray-700">Select Firearm</label>
                        <select
                          value={item.firearmId}
                          onChange={(e) => {
                            const selectedFirearm = firearms.find(f => f.id === e.target.value);
                            if (!selectedFirearm) return;
                            setFormData(prev => ({
                              ...prev,
                              firearms: prev.firearms.map((f, i) => 
                                i === index ? {
                                  ...f,
                                  firearmId: e.target.value,
                                  firearm: selectedFirearm
                                } : f
                              )
                            }));
                          }}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        >
                          <option value="">Select a firearm</option>
                          {firearms.map((firearm) => (
                            <option key={firearm.id} value={firearm.id}>
                              {firearm.manufacturer} {firearm.model} {firearm.caliber ? `(${firearm.caliber})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          firearms: prev.firearms.filter((_, i) => i !== index)
                        }))}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes for this firearm</label>
                      <textarea
                        value={item.notes}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          firearms: prev.firearms.map((f, i) => 
                            i === index ? { ...f, notes: e.target.value } : f
                          )
                        }))}
                        rows={2}
                        placeholder="Performance notes, maintenance needed, etc."
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Ammunition Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Ammunition</h3>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      ammunition: [
                        ...prev.ammunition,
                        {
                          ammunitionId: '',
                          ammunition: {} as any,
                          roundsUsed: 0,
                          notes: ''
                        }
                      ]
                    }))}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Ammunition
                  </Button>
                </div>

                {formData.ammunition.map((item, index) => (
                  <div key={index} className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 mr-4">
                        <label className="block text-sm font-medium text-gray-700">Select Ammunition</label>
                        <select
                          value={item.ammunitionId}
                          onChange={(e) => {
                            const selectedAmmo = ammunition.find(a => a.id === e.target.value);
                            if (!selectedAmmo) return;
                            setFormData(prev => ({
                              ...prev,
                              ammunition: prev.ammunition.map((a, i) => 
                                i === index ? {
                                  ...a,
                                  ammunitionId: e.target.value,
                                  ammunition: selectedAmmo,
                                  roundsUsed: a.roundsUsed || 0
                                } : a
                              )
                            }));
                          }}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        >
                          <option value="">Select ammunition</option>
                          {ammunition.map((ammo) => (
                            <option key={ammo.id} value={ammo.id}>
                              {ammo.cartridge} ({ammo.quantity} rounds available)
                            </option>
                          ))}
                        </select>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          ammunition: prev.ammunition.filter((_, i) => i !== index)
                        }))}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Rounds Used</label>
                      <input
                        type="number"
                        value={item.roundsUsed || ''}
                        onChange={(e) => {
                          const rounds = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                          setFormData(prev => ({
                            ...prev,
                            ammunition: prev.ammunition.map((a, i) => 
                              i === index ? { ...a, roundsUsed: isNaN(rounds) ? 0 : rounds } : a
                            )
                          }));
                        }}
                        min="0"
                        max={item.ammunition.quantity || 0}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <textarea
                        value={item.notes}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          ammunition: prev.ammunition.map((a, i) => 
                            i === index ? { ...a, notes: e.target.value } : a
                          )
                        }))}
                        rows={2}
                        placeholder="Performance notes, accuracy, etc."
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700">General Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  placeholder="Weather conditions, overall performance, etc."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
          )}
        </div>

        {isEditing && (
          <div className="flex justify-end space-x-3 p-4 border-t bg-gray-50">
            <Button variant="secondary" onClick={() => {
              if (isNew) {
                onClose();
              } else {
                setIsEditing(false);
                setFormData({
                  title: rangeDay?.title || '',
                  date: rangeDay ? new Date(rangeDay.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                  firearms: rangeDay?.firearms || [],
                  ammunition: rangeDay?.ammunition || [],
                  notes: rangeDay?.notes || ''
                });
              }
            }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {isNew ? 'Create Range Day' : 'Save Changes'}
            </Button>
          </div>
        )}
       </div>

      {currentRangeDay && (
        <>
          <ShotStringForm
            isOpen={showShotForm}
            onClose={() => setShowShotForm(false)}
            onSubmit={handleAddShots}
            rangeAmmunition={currentRangeDay.ammunition || []}
          />
          <ImportGarminModal
            isOpen={showImportModal}
            onClose={() => setShowImportModal(false)}
            onImport={handleAddShots}
            rangeAmmunition={currentRangeDay.ammunition || []}
          />
        </>
      )}
    </div>
  );
}