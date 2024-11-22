import React, { useState } from 'react';
import { Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { useInventoryStore } from '../../store/inventory';
import { InventoryType } from '../../types/inventory';
import { InventoryFormModal } from './InventoryFormModal';

interface InventoryTableProps {
  type: InventoryType;
  data: any[];
  searchTerm: string;
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

export function InventoryTable({ type, data, searchTerm }: InventoryTableProps) {
  const { deleteItem } = useInventoryStore();
  const [editItem, setEditItem] = useState<any | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortedData = (data: any[]) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = String(aValue).localeCompare(String(bValue));
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  };

  const filteredData = data.filter(item => {
    const searchStr = searchTerm.toLowerCase();
    switch (type) {
      case 'firearms':
        return item.manufacturer?.toLowerCase().includes(searchStr) ||
               item.model?.toLowerCase().includes(searchStr) ||
               item.caliber?.toLowerCase().includes(searchStr) ||
               item.type?.toLowerCase().includes(searchStr);
      case 'ammunition':
        return item.caliber?.toLowerCase().includes(searchStr) ||
               item.sku?.toLowerCase().includes(searchStr) ||
               item.lotNumber?.toLowerCase().includes(searchStr);
      case 'bullets':
        return item.manufacturer?.toLowerCase().includes(searchStr) ||
               item.sku?.toLowerCase().includes(searchStr) ||
               item.type?.toLowerCase().includes(searchStr);
      case 'powder':
        return item.manufacturer?.toLowerCase().includes(searchStr) ||
               item.sku?.toLowerCase().includes(searchStr) ||
               item.lotNumber?.toLowerCase().includes(searchStr);
      case 'primers':
        return item.manufacturer?.toLowerCase().includes(searchStr) ||
               item.sku?.toLowerCase().includes(searchStr) ||
               item.type?.toLowerCase().includes(searchStr);
      case 'brass':
        return item.caliber?.toLowerCase().includes(searchStr) ||
               item.manufacturer?.toLowerCase().includes(searchStr);
      default:
        return false;
    }
  });

  const sortedData = getSortedData(filteredData);

  const SortableHeader = ({ field, label }: { field: string; label: string }) => {
    const isActive = sortConfig.key === field;
    return (
      <th
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center space-x-1">
          <span>{label}</span>
          <div className="flex flex-col">
            <ChevronUp className={`w-3 h-3 ${isActive && sortConfig.direction === 'asc' ? 'text-primary-600' : 'text-gray-400'}`} />
            <ChevronDown className={`w-3 h-3 -mt-1 ${isActive && sortConfig.direction === 'desc' ? 'text-primary-600' : 'text-gray-400'}`} />
          </div>
        </div>
      </th>
    );
  };

  const renderTableHeaders = () => {
    switch (type) {
      case 'firearms':
        return (
          <tr>
            <SortableHeader field="manufacturer" label="Manufacturer" />
            <SortableHeader field="model" label="Model" />
            <SortableHeader field="type" label="Type" />
            <SortableHeader field="caliber" label="Caliber" />
            <SortableHeader field="barrelLength" label="Barrel Length" />
            <SortableHeader field="condition" label="Condition" />
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        );
      case 'ammunition':
        return (
          <tr>
            <SortableHeader field="caliber" label="Caliber" />
            <SortableHeader field="sku" label="SKU" />
            <SortableHeader field="quantity" label="Quantity" />
            <SortableHeader field="lotNumber" label="Lot Number" />
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        );
      case 'bullets':
        return (
          <tr>
            <SortableHeader field="manufacturer" label="Manufacturer" />
            <SortableHeader field="sku" label="SKU" />
            <SortableHeader field="weight" label="Weight (gr)" />
            <SortableHeader field="type" label="Type" />
            <SortableHeader field="quantity" label="Quantity" />
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        );
      case 'powder':
        return (
          <tr>
            <SortableHeader field="manufacturer" label="Manufacturer" />
            <SortableHeader field="sku" label="SKU" />
            <SortableHeader field="weight" label="Weight (lbs)" />
            <SortableHeader field="lotNumber" label="Lot Number" />
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        );
      case 'primers':
        return (
          <tr>
            <SortableHeader field="manufacturer" label="Manufacturer" />
            <SortableHeader field="sku" label="SKU" />
            <SortableHeader field="type" label="Type" />
            <SortableHeader field="quantity" label="Quantity" />
            <SortableHeader field="lotNumber" label="Lot Number" />
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        );
      case 'brass':
        return (
          <tr>
            <SortableHeader field="caliber" label="Caliber" />
            <SortableHeader field="manufacturer" label="Manufacturer" />
            <SortableHeader field="quantity" label="Quantity" />
            <SortableHeader field="condition" label="Condition" />
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        );
      default:
        return null;
    }
  };

  const renderTableRow = (item: any) => {
    const baseClasses = "px-6 py-4 whitespace-nowrap text-sm text-gray-900";
    
    switch (type) {
      case 'firearms':
        return (
          <tr key={item.id}>
            <td className={baseClasses}>{item.manufacturer || '-'}</td>
            <td className={baseClasses}>{item.model || '-'}</td>
            <td className={baseClasses}>{item.type || '-'}</td>
            <td className={baseClasses}>{item.caliber || '-'}</td>
            <td className={baseClasses}>{item.barrelLength ? `${item.barrelLength}"` : '-'}</td>
            <td className={baseClasses}>{item.condition || '-'}</td>
            <td className={baseClasses}>{item.notes || '-'}</td>
            <td className={baseClasses}>{renderActions(item)}</td>
          </tr>
        );
      case 'ammunition':
        return (
          <tr key={item.id}>
            <td className={baseClasses}>{item.caliber}</td>
            <td className={baseClasses}>{item.sku}</td>
            <td className={baseClasses}>{item.quantity}</td>
            <td className={baseClasses}>{item.lotNumber}</td>
            <td className={baseClasses}>{item.notes || '-'}</td>
            <td className={baseClasses}>{renderActions(item)}</td>
          </tr>
        );
      case 'bullets':
        return (
          <tr key={item.id}>
            <td className={baseClasses}>{item.manufacturer}</td>
            <td className={baseClasses}>{item.sku}</td>
            <td className={baseClasses}>{item.weight}</td>
            <td className={baseClasses}>{item.type}</td>
            <td className={baseClasses}>{item.quantity}</td>
            <td className={baseClasses}>{item.notes || '-'}</td>
            <td className={baseClasses}>{renderActions(item)}</td>
          </tr>
        );
      case 'powder':
        return (
          <tr key={item.id}>
            <td className={baseClasses}>{item.manufacturer}</td>
            <td className={baseClasses}>{item.sku}</td>
            <td className={baseClasses}>{item.weight}</td>
            <td className={baseClasses}>{item.lotNumber}</td>
            <td className={baseClasses}>{item.notes || '-'}</td>
            <td className={baseClasses}>{renderActions(item)}</td>
          </tr>
        );
      case 'primers':
        return (
          <tr key={item.id}>
            <td className={baseClasses}>{item.manufacturer}</td>
            <td className={baseClasses}>{item.sku}</td>
            <td className={baseClasses}>{item.type}</td>
            <td className={baseClasses}>{item.quantity}</td>
            <td className={baseClasses}>{item.lotNumber}</td>
            <td className={baseClasses}>{item.notes || '-'}</td>
            <td className={baseClasses}>{renderActions(item)}</td>
          </tr>
        );
      case 'brass':
        return (
          <tr key={item.id}>
            <td className={baseClasses}>{item.caliber}</td>
            <td className={baseClasses}>{item.manufacturer}</td>
            <td className={baseClasses}>{item.quantity}</td>
            <td className={baseClasses}>{item.condition}</td>
            <td className={baseClasses}>{item.notes || '-'}</td>
            <td className={baseClasses}>{renderActions(item)}</td>
          </tr>
        );
      default:
        return null;
    }
  };

  const renderActions = (item: any) => (
    <div className="flex space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setEditItem(item)}
        className="text-gray-500 hover:text-gray-700"
      >
        <Edit2 className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => deleteItem(type, item.id)}
        className="text-gray-500 hover:text-red-600"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );

  return (
    <>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {renderTableHeaders()}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.map(renderTableRow)}
            </tbody>
          </table>
        </div>
      </div>

      {editItem && (
        <InventoryFormModal
          isOpen={true}
          onClose={() => setEditItem(null)}
          type={type}
          initialData={editItem}
        />
      )}
    </>
  );
}