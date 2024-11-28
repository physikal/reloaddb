import React from 'react';
import { Edit2, Trash2, Copy, Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { Load } from '../../types';
import { formatCurrency } from '../../utils/format';

interface LoadsTableProps {
  loads: Load[];
  onEdit: (load: Load) => void;
  onDelete: (id: string) => void;
  onDuplicate: (load: Load) => void;
  onToggleFavorite: (load: Load) => void;
}

export function LoadsTable({ loads, onEdit, onDelete, onDuplicate, onToggleFavorite }: LoadsTableProps) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cartridge
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bullet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Powder
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Primer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Brass
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Measurements
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cost
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loads.map((load) => (
              <tr key={load.id} className={load.favorite ? 'bg-primary-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">{load.cartridge}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleFavorite(load)}
                      className={`ml-2 p-0 hover:bg-transparent ${load.favorite ? 'text-yellow-400' : 'text-gray-400'}`}
                    >
                      <Star className="w-4 h-4" fill={load.favorite ? 'currentColor' : 'none'} />
                    </Button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {load.bullet.brand} {load.bullet.weight}gr
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{load.powder.brand}</div>
                  <div className="text-sm">
                    <span>Charge: {load.powder.weight}gr</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {load.primer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {load.brass.brand}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span>COAL: {load.cartridgeOverallLength}"</span>
                    </div>
                    {load.cartridgeBaseToOgive && (
                      <div className="text-sm">
                        <span>CBTO: {load.cartridgeBaseToOgive}"</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {load.costPerRound ? formatCurrency(load.costPerRound) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(load)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDuplicate(load)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(load.id)}
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
  );
}