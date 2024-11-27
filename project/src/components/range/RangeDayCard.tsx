import { Calendar, Edit2, Trash2 } from 'lucide-react';
import { RangeDay } from '../../types/range';
import { Button } from '../ui/Button';
import { useRangeStore } from '../../store/range';

interface RangeDayCardProps {
  rangeDay: RangeDay;
  onEdit: () => void;
}

export function RangeDayCard({ rangeDay, onEdit }: RangeDayCardProps) {
  const { deleteRangeDay } = useRangeStore();

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
            className="text-gray-500 hover:text-gray-700"
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

      {rangeDay.notes && (
        <div className="pt-3 border-t">
          <h4 className="font-medium text-gray-700 mb-2">Notes:</h4>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{rangeDay.notes}</p>
        </div>
      )}
    </div>
  );
}