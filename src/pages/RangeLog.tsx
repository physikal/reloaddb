import { useEffect, useState } from 'react';
import { Target, Plus, Calendar } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useRangeStore } from '../store/range';
import { Button } from '../components/ui/Button';
import { RangeDayCard } from '../components/range/RangeDayCard';
import { RangeDayFormModal } from '../components/range/RangeDayFormModal';
import { RangeDay } from '../types/range';

export function RangeLogPage() {
  const { user } = useAuthStore();
  const { rangeDays, loading, error, fetchRangeDays } = useRangeStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRangeDay, setSelectedRangeDay] = useState<RangeDay | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchRangeDays(user.id);
    }
  }, [user?.id, fetchRangeDays]);

  const filteredRangeDays = rangeDays.filter(day =>
    day.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    day.firearms.some(f => 
      f.firearm.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.firearm.model.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Target className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Range Log</h1>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Range Day
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search range days..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRangeDays.map(rangeDay => (
          <RangeDayCard
            key={rangeDay.id}
            rangeDay={rangeDay}
            onEdit={() => {
              setSelectedRangeDay(rangeDay);
              setIsModalOpen(true);
            }}
          />
        ))}
      </div>

      <RangeDayFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRangeDay(undefined);
        }}
        initialData={selectedRangeDay}
      />
    </div>
  );
}