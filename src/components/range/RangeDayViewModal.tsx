import React, { useState } from 'react';
import { X, Calendar, Target, Package, Gauge, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { RangeDay, Shot } from '../../types/range';
import { formatDate } from '../../utils/format';
import { ShotStringForm } from './ShotStringForm';

interface RangeDayViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  rangeDay: RangeDay;
  onAddShots?: (shots: Omit<Shot, 'timestamp'>[]) => Promise<void>;
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
  // Sort shots by timestamp
  const sortedShots = [...shots].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Group shots by ammunition and time proximity (within 5 minutes)
  const strings: Shot[][] = [];
  let currentString: Shot[] = [];
  let lastShot: Shot | null = null;

  sortedShots.forEach(shot => {
    const shotTime = new Date(shot.timestamp).getTime();
    
    if (lastShot) {
      const timeDiff = shotTime - new Date(lastShot.timestamp).getTime();
      const sameAmmo = shot.ammunitionId === lastShot.ammunitionId;
      
      // Start a new string if more than 5 minutes have passed or different ammo
      if (timeDiff > 5 * 60 * 1000 || !sameAmmo) {
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

export function RangeDayViewModal({ isOpen, onClose, rangeDay, onAddShots }: RangeDayViewModalProps) {
  const [showShotForm, setShowShotForm] = useState(false);
  
  if (!isOpen) return null;

  const shotStrings = rangeDay.shots ? groupShotsIntoStrings(rangeDay.shots) : [];

  const handleAddShots = async (shots: Omit<Shot, 'timestamp'>[]) => {
    if (onAddShots) {
      await onAddShots(shots);
    }
    setShowShotForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl my-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              {rangeDay.title}
            </h2>
            <div className="flex items-center mt-1 text-gray-500">
              <Calendar className="w-4 h-4 mr-2" />
              {rangeDay.date.toLocaleDateString()}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {onAddShots && (
              <Button onClick={() => setShowShotForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Shot String
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Statistics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-gray-500 mb-2">
                <Target className="w-4 h-4 mr-2" />
                <h3 className="font-medium">Total Shots</h3>
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {rangeDay.stats?.totalShots || 0}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-gray-500 mb-2">
                <Gauge className="w-4 h-4 mr-2" />
                <h3 className="font-medium">Average MV</h3>
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {rangeDay.stats?.avgMuzzleVelocity ? 
                  `${Math.round(rangeDay.stats.avgMuzzleVelocity)} fps` : 
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
                {rangeDay.ammunition?.reduce((total, ammo) => total + ammo.roundsUsed, 0) || 0}
              </p>
            </div>
          </div>

          {/* Firearms Used */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Firearms Used</h3>
            <div className="bg-white border rounded-lg divide-y">
              {rangeDay.firearms.map((item, index) => (
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
          {rangeDay.ammunition && rangeDay.ammunition.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Ammunition Used</h3>
              <div className="bg-white border rounded-lg divide-y">
                {rangeDay.ammunition.map((item, index) => (
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

          {/* Notes */}
          {rangeDay.notes && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Notes</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{rangeDay.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {onAddShots && (
        <ShotStringForm
          isOpen={showShotForm}
          onClose={() => setShowShotForm(false)}
          onSubmit={handleAddShots}
          rangeAmmunition={rangeDay.ammunition || []}
        />
      )}
    </div>
  );
}