import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useRangeStore } from '../../store/range';
import { useInventoryStore } from '../../store/inventory';
import { useAuthStore } from '../../store/auth';
import { RangeDay, RangeDayFirearm } from '../../types/range';
import { Firearm } from '../../types/inventory';

interface RangeDayFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: RangeDay;
}

export function RangeDayFormModal({ isOpen, onClose, initialData }: RangeDayFormModalProps) {
  const { addRangeDay, updateRangeDay } = useRangeStore();
  const { firearms, fetchInventory } = useInventoryStore();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    firearms: [] as RangeDayFirearm[],
    notes: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchInventory(user.id, 'firearms');
    }
  }, [user?.id, fetchInventory]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        date: new Date(initialData.date).toISOString().split('T')[0],
        firearms: initialData.firearms,
        notes: initialData.notes || ''
      });
    } else {
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        firearms: [],
        notes: ''
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    const rangeDayData = {
      ...formData,
      userId: user.id,
      date: new Date(formData.date)
    };

    try {
      if (initialData) {
        await updateRangeDay(initialData.id, rangeDayData);
      } else {
        await addRangeDay(rangeDayData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving range day:', error);
    }
  };

  const addFirearm = () => {
    setFormData(prev => ({
      ...prev,
      firearms: [
        ...prev.firearms,
        {
          firearmId: '',
          firearm: {} as Firearm,
          notes: ''
        }
      ]
    }));
  };

  const removeFirearm = (index: number) => {
    setFormData(prev => ({
      ...prev,
      firearms: prev.firearms.filter((_, i) => i !== index)
    }));
  };

  const updateFirearm = (index: number, firearmId: string) => {
    const selectedFirearm = firearms.find(f => f.id === firearmId);
    if (!selectedFirearm) return;

    setFormData(prev => ({
      ...prev,
      firearms: prev.firearms.map((item, i) => 
        i === index ? {
          ...item,
          firearmId,
          firearm: selectedFirearm
        } : item
      )
    }));
  };

  const updateFirearmNotes = (index: number, notes: string) => {
    setFormData(prev => ({
      ...prev,
      firearms: prev.firearms.map((item, i) => 
        i === index ? { ...item, notes } : item
      )
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Edit Range Day' : 'New Range Day'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="e.g., Weekend Practice, Competition Prep"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">Firearms</label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addFirearm}
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
                      onChange={(e) => updateFirearm(index, e.target.value)}
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
                    onClick={() => removeFirearm(index)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes for this firearm</label>
                  <textarea
                    value={item.notes}
                    onChange={(e) => updateFirearmNotes(index, e.target.value)}
                    rows={2}
                    placeholder="Rounds fired, performance notes, etc."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
            ))}
          </div>

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

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? 'Update' : 'Create'} Range Day
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}