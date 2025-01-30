import { Calendar, Edit2, Trash2, Plus } from 'lucide-react';
import { RangeDay } from '../../types/range';
import { Button } from '../ui/Button';
import { useRangeStore } from '../../store/range';
import { ShotLog } from './ShotLog';
import { ShotForm } from './ShotForm';
import { useState } from 'react';

interface RangeDayCardProps {
  rangeDay: RangeDay;
  onEdit: () => void;
}

export function RangeDayCard({ rangeDay, onEdit }: RangeDayCardProps) {
  const { deleteRangeDay, updateRangeDay } = useRangeStore();
  const [showShotForm, setShowShotForm] = useState(false);

  const handleAddShot = async (shot: Omit<Shot, 'timestamp'>) => {
    try {
      const newShot = {
        ...shot,
        timestamp: new Date()
      };

      await updateRangeDay(rangeDay.id, {
        shots: [...(rangeDay.shots || []), newShot]
      });
    } catch (error) {
      console.error('Error adding shot:', error);
    }
  };

  // Only show Add Shot button if ammunition is available
  const canAddShots = rangeDay.ammunition && rangeDay.ammunition.length > 0;

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{rangeDay.title}</h3>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Calendar className="w-4 h-4 mr-2" />
            {rangeDay.date.toLocaleDateString()}
          </div>
        </div>
        <div className="flex space-x-2">
          {canAddShots && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShotForm(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Shot
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="text-gray-500 hover:text-gray-700"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteRangeDay(rangeDay.id)}
            className="text-gray-500 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-700">Firearms Used:</h4>
        <ul className="space-y-2">
          {rangeDay.firearms.map((item, index) => (
            <li key={index} className="text-sm">
              <div className="font-medium">{item.firearm.manufacturer} {item.firearm.model}</div>
              {item.notes && (
                <div className="text-gray-500 mt-1">{item.notes}</div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {rangeDay.ammunition && rangeDay.ammunition.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Ammunition Used:</h4>
          <ul className="space-y-2">
            {rangeDay.ammunition.map((item, index) => (
              <li key={index} className="text-sm">
                <div className="font-medium">
                  {item.ammunition.cartridge} - {item.roundsUsed} rounds
                </div>
                {item.notes && (
                  <div className="text-gray-500 mt-1">{item.notes}</div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t pt-4">
        <ShotLog 
          shots={rangeDay.shots || []} 
          avgMuzzleVelocity={rangeDay.stats?.avgMuzzleVelocity || null}
        />
      </div>

      {rangeDay.notes && (
        <div className="pt-3 border-t">
          <h4 className="font-medium text-gray-700 mb-2">Notes:</h4>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{rangeDay.notes}</p>
        </div>
      )}

      <ShotForm
        isOpen={showShotForm}
        onClose={() => setShowShotForm(false)}
        onSubmit={handleAddShot}
        rangeAmmunition={rangeDay.ammunition || []}
      />
    </div>
  );
}