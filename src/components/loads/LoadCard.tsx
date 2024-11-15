import React from 'react';
import { PencilIcon, TrashIcon, CopyIcon, Star, DollarSign } from 'lucide-react';
import { Load } from '../../types';
import { Button } from '../ui/Button';

interface LoadCardProps {
  load: Load;
  onEdit: (load: Load) => void;
  onDelete: (id: string) => void;
  onDuplicate: (load: Load) => void;
  onToggleFavorite: (load: Load) => void;
}

export function LoadCard({ load, onEdit, onDelete, onDuplicate, onToggleFavorite }: LoadCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">{load.cartridge}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleFavorite(load)}
            className={`p-0 hover:bg-transparent ${load.favorite ? 'text-yellow-400' : 'text-gray-400'}`}
          >
            <Star className="w-5 h-5" fill={load.favorite ? 'currentColor' : 'none'} />
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(load)}
            className="text-gray-500 hover:text-gray-700"
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDuplicate(load)}
            className="text-gray-500 hover:text-gray-700"
          >
            <CopyIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(load.id)}
            className="text-gray-500 hover:text-gray-700"
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div>
        <p className="text-sm text-gray-500">
          {load.bullet.brand} {load.bullet.weight}gr
        </p>
      </div>

      {load.costPerRound !== undefined && (
        <div className="mt-2 flex items-center space-x-2 text-sm">
          <DollarSign className="w-4 h-4 text-primary-600" />
          <span className="font-medium text-primary-700">
            CPR: ${load.costPerRound.toFixed(4)}
          </span>
          {load.costBreakdown && (
            <span className="text-gray-500">
              (B: ${load.costBreakdown.bulletCost.toFixed(3)} | 
               P: ${load.costBreakdown.powderCost.toFixed(3)} | 
               Pr: ${load.costBreakdown.primerCost.toFixed(3)} | 
               Br: ${load.costBreakdown.brassCost.toFixed(3)})
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Powder</p>
          <p className="font-medium">{load.powder.brand} {load.powder.weight}gr</p>
        </div>
        <div>
          <p className="text-gray-500">Primer</p>
          <p className="font-medium">{load.primer}</p>
        </div>
        <div>
          <p className="text-gray-500">Brass</p>
          <p className="font-medium">{load.brass.brand}</p>
        </div>
        <div>
          <p className="text-gray-500">COAL</p>
          <p className="font-medium">{load.cartridgeOverallLength}"</p>
        </div>
      </div>

      {load.notes && (
        <div className="pt-2 border-t">
          <p className="text-gray-500 text-sm">Notes</p>
          <p className="text-sm whitespace-pre-wrap">{load.notes}</p>
        </div>
      )}
    </div>
  );
}