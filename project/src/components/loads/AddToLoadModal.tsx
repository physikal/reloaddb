import React, { useState } from 'react';
import { X, Search, Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { Load } from '../../types';
import { useLoadsStore } from '../../store/loads';

interface AddToLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (load: Load) => void;
  costBreakdown: {
    bulletCost: number;
    powderCost: number;
    primerCost: number;
    brassCost: number;
    totalCost: number;
  };
}

export function AddToLoadModal({ isOpen, onClose, onSelect, costBreakdown }: AddToLoadModalProps) {
  const { loads } = useLoadsStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Sort loads: favorites first, then alphabetically by cartridge
  const sortedLoads = [...loads].sort((a, b) => {
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;
    return a.cartridge.localeCompare(b.cartridge);
  });

  if (!isOpen) return null;

  const filteredLoads = sortedLoads.filter(load => 
    load.cartridge.toLowerCase().includes(searchTerm.toLowerCase()) ||
    load.bullet.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add Cost to Load</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search loads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredLoads.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No loads found</p>
            ) : (
              <div className="space-y-2">
                {filteredLoads.map((load) => (
                  <button
                    key={load.id}
                    onClick={() => onSelect(load)}
                    className={`w-full text-left p-4 rounded-lg border hover:bg-gray-50 transition-colors ${
                      load.favorite ? 'bg-primary-50 border-primary-200' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900 flex items-center">
                          {load.cartridge}
                          {load.favorite && (
                            <Star className="w-4 h-4 ml-2 text-yellow-400 fill-current" />
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {load.bullet.brand} {load.bullet.weight}gr
                        </p>
                      </div>
                      {load.costPerRound && (
                        <span className="text-sm text-gray-500">
                          Current CPR: ${load.costPerRound.toFixed(4)}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}