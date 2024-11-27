import React from 'react';
import { PencilIcon, TrashIcon, CopyIcon, Star, DollarSign, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { Load } from '../../types';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/auth';
import { formatCurrency } from '../../utils/format';
import { useState } from 'react';
import { LoadCardConfigModal } from './LoadCardConfigModal';

interface LoadCardProps {
  load: Load;
  onEdit: (load: Load) => void;
  onDelete: (id: string) => void;
  onDuplicate: (load: Load) => void;
  onToggleFavorite: (load: Load) => void;
}

export function LoadCard({ load, onEdit, onDelete, onDuplicate, onToggleFavorite }: LoadCardProps) {
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const config = load.displayConfig || {
    bullet: { brand: true, weight: true },
    powder: { brand: true, weight: true },
    primer: true,
    brass: { brand: true, length: true },
    cartridgeOverallLength: true,
    cartridgeBaseToOgive: true,
    notes: true,
    cost: true
  };

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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowConfigModal(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {(config.bullet.brand || config.bullet.weight) && (
        <div>
          <p className="text-sm text-gray-500">
            {config.bullet.brand && load.bullet.brand} {config.bullet.weight && `${load.bullet.weight}gr`}
          </p>
        </div>
      )}

      {load.costPerRound !== undefined && config.cost && (
        <div className="mt-2 space-y-2">
          <button
            onClick={() => setShowCostBreakdown(!showCostBreakdown)}
            className="w-full flex items-center justify-between bg-primary-50 rounded-md px-3 py-2 hover:bg-primary-100 transition-colors"
          >
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 text-primary-600 mr-2" />
              <span className="font-medium text-primary-900">
                {formatCurrency(load.costPerRound)} per round
              </span>
            </div>
            {showCostBreakdown ? (
              <ChevronUp className="w-4 h-4 text-primary-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-primary-600" />
            )}
          </button>
          
          {showCostBreakdown && load.costBreakdown && (
            <div className="bg-gray-50 rounded-md p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Bullet:</span>
                <span className="font-medium">{formatCurrency(load.costBreakdown.bulletCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Powder:</span>
                <span className="font-medium">{formatCurrency(load.costBreakdown.powderCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Primer:</span>
                <span className="font-medium">{formatCurrency(load.costBreakdown.primerCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Brass:</span>
                <span className="font-medium">{formatCurrency(load.costBreakdown.brassCost)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        {(config.powder.brand || config.powder.weight) && (
          <div>
            <p className="text-gray-500">Powder</p>
            {config.powder.brand && <p className="font-medium">{load.powder.brand}</p>}
            {config.powder.weight && (
              <p className="text-sm mt-1">
                <span className="text-gray-500">Charge: </span>
                <span className="font-bold">{load.powder.weight}gr</span>
              </p>
            )}
          </div>
        )}
        {config.primer && (
          <div>
            <p className="text-gray-500">Primer</p>
            <p className="font-medium">{load.primer}</p>
          </div>
        )}
        {config.brass.brand && (
          <div>
            <p className="text-gray-500">Brass</p>
            <p className="font-medium">{load.brass.brand}</p>
          </div>
        )}
        {(config.cartridgeOverallLength || config.cartridgeBaseToOgive) && (
          <div>
            <p className="text-gray-500">Measurements</p>
            {config.cartridgeOverallLength && (
              <p className="font-medium">COAL: {load.cartridgeOverallLength}"</p>
            )}
            {config.cartridgeBaseToOgive && load.cartridgeBaseToOgive && (
              <p className="font-medium mt-1">CBTO: {load.cartridgeBaseToOgive}"</p>
            )}
          </div>
        )}
      </div>

      {config.notes && load.notes && (
        <div className="pt-2 border-t">
          <p className="text-gray-500 text-sm">Notes</p>
          <p className="text-sm whitespace-pre-wrap">{load.notes}</p>
        </div>
      )}

      <LoadCardConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        loadId={load.id}
        config={config}
      />
    </div>
  );
}