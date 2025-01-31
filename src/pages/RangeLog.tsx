import RangeDayModal from '../components/range/RangeDayModal';
import { useEffect, useState } from 'react';
import { Target, Plus, Search, Eye, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useRangeStore } from '../store/range';
import { Button } from '../components/ui/Button';
import { RangeDay } from '../types/range';

export function RangeLogPage() {
  const { user } = useAuthStore();
  const { rangeDays, loading, error, fetchRangeDays, deleteRangeDay } = useRangeStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRangeDay, setSelectedRangeDay] = useState<RangeDay | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchRangeDays(user.id);
    }
  }, [user?.id, fetchRangeDays]);

  const handleView = (rangeDay: RangeDay) => {
    setSelectedRangeDay(rangeDay);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this range day?')) {
      await deleteRangeDay(id);
    }
  };

  // Add a refresh handler
  const handleRefresh = async () => {
    if (user?.id) {
      await fetchRangeDays(user.id);
      // Update selected range day with fresh data
      if (selectedRangeDay) {
        const updatedRangeDay = rangeDays.find(day => day.id === selectedRangeDay.id);
        setSelectedRangeDay(updatedRangeDay);
      }
    }
  };

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
        <Button onClick={() => {
          setSelectedRangeDay(undefined);
          setIsModalOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Range Day
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search range days..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Firearms Used
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rounds Fired
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRangeDays.map((day) => (
                <tr key={day.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {day.date.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {day.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="max-w-xs truncate">
                      {day.firearms.map(f => f.firearm.manufacturer + ' ' + f.firearm.model).join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {day.stats?.totalShots || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(day)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(day.id)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <RangeDayModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRangeDay(undefined);
          handleRefresh(); // Refresh data when modal closes
        }}
        rangeDay={selectedRangeDay}
        isNew={!selectedRangeDay}
        onUpdate={handleRefresh} // Pass refresh handler to modal
      />
    </div>
  );
}