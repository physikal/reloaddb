import React from 'react';
import { PencilIcon, TrashIcon, CopyIcon, Star, DollarSign, ChevronDown, ChevronUp, Settings, Eye } from 'lucide-react';
import { Load } from '../../types';
import { Button } from '../ui/Button';
import { useState } from 'react';
import { LoadCardConfigModal } from './LoadCardConfigModal';
import { LoadDetailsModal } from './LoadDetailsModal';

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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Action Buttons */}
      <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleFavorite(load)}
          className={`${load.favorite ? 'text-yellow-400' : 'text-gray-400'}`}
        >
          <Star className="w-5 h-5" fill={load.favorite ? 'currentColor' : 'none'} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetailsModal(true)}
          className="text-gray-500 hover:text-gray-700"
        >
          <Eye className="w-4 h-4" />
        </Button>
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

      {/* Cartridge Title */}
      <div className="bg-gray-50 px-4 pb-4">
        <h3 className="text-xl font-bold text-gray-900">{load.cartridge}</h3>
        {(config.bullet.brand || config.bullet.weight) && (
          <p className="text-sm text-gray-600 mt-1">
            {config.bullet.brand && load.bullet.brand}
            {config.bullet.brand && config.bullet.weight && ' '}
            {config.bullet.weight && `${load.bullet.weight}gr`}
          </p>
        )}
      </div>
      
      <div className="p-4 space-y-4">
        {config.cost && load.costPerRound !== undefined && (
          <div className="space-y-2">
            <button
              onClick={() => setShowCostBreakdown(!showCostBreakdown)}
              className="w-full flex items-center justify-between bg-primary-50 rounded-md px-3 py-2 hover:bg-primary-100 transition-colors"
            >
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 text-primary-600 mr-2" />
                <span className="font-medium text-primary-900">
                  {load.costPerRound.toFixed(4)} per round
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
                  <span className="font-medium">{load.costBreakdown.bulletCost.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Powder:</span>
                  <span className="font-medium">{load.costBreakdown.powderCost.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Primer:</span>
                  <span className="font-medium">{load.costBreakdown.primerCost.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Brass:</span>
                  <span className="font-medium">{load.costBreakdown.brassCost.toFixed(4)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          {(config.powder.brand || config.powder.weight) && (
            <div>
              <p className="text-gray-500">Powder</p>
              <p className="font-medium">
                {config.powder.brand && load.powder.brand}
                {config.powder.brand && config.powder.weight && ' '}
                {config.powder.weight && `${load.powder.weight}gr`}
              </p>
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
          
          {config.cartridgeOverallLength && (
            <div>
              <p className="text-gray-500">COAL</p>
              <p className="font-medium">{load.cartridgeOverallLength}"</p>
            </div>
          )}

          {config.cartridgeBaseToOgive && load.cartridgeBaseToOgive && (
            <div>
              <p className="text-gray-500">CBTO</p>
              <p className="font-medium">{load.cartridgeBaseToOgive}"</p>
            </div>
          )}
        </div>

        {config.notes && load.notes && (
          <div className="pt-2 border-t">
            <p className="text-gray-500 text-sm">Notes</p>
            <p className="text-sm whitespace-pre-wrap">{load.notes}</p>
          </div>
        )}
      </div>

      <LoadCardConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        loadId={load.id}
        config={config}
      />

      <LoadDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        load={load}
      />
    </div>
  );
}