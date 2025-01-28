import React, { useEffect, useState } from 'react';
import { Package, Plus, Upload } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useInventoryStore } from '../store/inventory';
import { Button } from '../components/ui/Button';
import { ExportButton } from '../components/ui/ExportButton';
import { InventoryType } from '../types/inventory';
import { InventoryTable } from '../components/inventory/InventoryTable';
import { InventoryFormModal } from '../components/inventory/InventoryFormModal';
import { exportInventoryToExcel } from '../utils/excelExport';
import { importInventoryFromExcel } from '../utils/excelImport';
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
  const { ammunition, bullets, powder, primers, brass, firearms, loading, error, fetchInventory, addItem } = useInventoryStore();
  const [activeType, setActiveType] = useState<InventoryType>('firearms');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importError, setImportError] = useState<string>('');

  useEffect(() => {
    if (user?.id) {
      fetchInventory(user.id, activeType);
    }
  }, [user?.id, activeType, fetchInventory]);

  const handleExport = () => {
    exportInventoryToExcel(ammunition, bullets, powder, primers, brass, firearms);
  };

  const handleImport = async (file: File) => {
    if (!user?.id) return;

    try {
      setImportError('');
      const importedInventory = await importInventoryFromExcel(file);

      // Import each type of inventory item
      for (const firearm of importedInventory.firearms) {
        await addItem('firearms', { ...firearm, userId: user.id });
      }
      for (const ammo of importedInventory.ammunition) {
        await addItem('ammunition', { ...ammo, userId: user.id });
      }
      for (const bullet of importedInventory.bullets) {
        await addItem('bullets', { ...bullet, userId: user.id });
      }
      for (const pow of importedInventory.powder) {
        await addItem('powder', { ...pow, userId: user.id });
      }
      for (const primer of importedInventory.primers) {
        await addItem('primers', { ...primer, userId: user.id });
      }
      for (const brass of importedInventory.brass) {
        await addItem('brass', { ...brass, userId: user.id });
      }

      // Refresh the current active type
      await fetchInventory(user.id, activeType);
    } catch (error) {
      setImportError(error.message);
    }
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
          <Button
            variant="secondary"
            onClick={() => document.getElementById('import-inventory')?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import from Excel
          </Button>
          <input
            id="import-inventory"
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleImport(file);
                e.target.value = ''; // Reset input
              }
            }}
          />
          <ExportButton onExport={handleExport} />
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {(error || importError) && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error || importError}
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