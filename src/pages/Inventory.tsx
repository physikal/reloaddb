import React, { useEffect, useState } from 'react';
import { Package, Plus } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useInventoryStore } from '../store/inventory';
import { Button } from '../components/ui/Button';
import { ExportButton } from '../components/ui/ExportButton';
import { InventoryType } from '../types/inventory';
import { InventoryTable } from '../components/inventory/InventoryTable';
import { InventoryFormModal } from '../components/inventory/InventoryFormModal';
import { exportInventoryToExcel } from '../utils/excelExport';
import { clsx } from 'clsx';

const INVENTORY_TYPES: { value: InventoryType; label: string }[] = [
  { value: 'firearms', label: 'Firearms' },
  { value: 'ammunition', label: 'Ammunition' },
  { value: 'bullets', label: 'Bullets' },
  { value: 'powder', label: 'Powder' },
  { value: 'primers', label: 'Primers' },
  { value: 'brass', label: 'Brass' }
];

export function InventoryPage() {
  const { user } = useAuthStore();
  const { ammunition, bullets, powder, primers, brass, firearms, loading, error, fetchInventory } = useInventoryStore();
  const [activeType, setActiveType] = useState<InventoryType>('firearms');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchInventory(user.id, activeType);
    }
  }, [user?.id, activeType, fetchInventory]);

  const handleExport = () => {
    exportInventoryToExcel(ammunition, bullets, powder, primers, brass, firearms);
  };

  const inventoryData = {
    ammunition,
    bullets,
    powder,
    primers,
    brass,
    firearms
  }[activeType];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Package className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        </div>
        <div className="flex space-x-4">
          <ExportButton onExport={handleExport} />
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {INVENTORY_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setActiveType(type.value)}
              className={clsx(
                'py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
                activeType === type.value
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {type.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : (
        <InventoryTable
          type={activeType}
          data={inventoryData}
          searchTerm={searchTerm}
        />
      )}

      <InventoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={activeType}
      />
    </div>
  );
}