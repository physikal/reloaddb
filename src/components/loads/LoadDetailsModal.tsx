import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Load } from '../../types';
import { formatCurrency } from '../../utils/format';
import { useInventoryStore } from '../../store/inventory';
import { useEffect } from 'react';
import { useAuthStore } from '../../store/auth';

interface LoadDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  load: Load;
}

export function LoadDetailsModal({ isOpen, onClose, load }: LoadDetailsModalProps) {
  const { ammunition, fetchInventory } = useInventoryStore();
  const { user } = useAuthStore();

  // Fetch ammunition data when modal opens
  useEffect(() => {
    if (isOpen && user?.id) {
      fetchInventory(user.id, 'ammunition');
    }
  }, [isOpen, user?.id, fetchInventory]);

  if (!isOpen) return null;

  // Find matching ammunition in inventory
  const matchingAmmo = ammunition.find(
    ammo => ammo.cartridge === load.cartridge && 
           ammo.sku === `${load.bullet.brand} ${load.bullet.weight}gr`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{load.cartridge}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Bullet Details */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Bullet</h3>
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Brand</p>
                <p className="font-medium">{load.bullet.brand}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Weight</p>
                <p className="font-medium">{load.bullet.weightRaw || load.bullet.weight}gr</p>
              </div>
            </div>
          </div>

          {/* Powder Details */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Powder</h3>
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Brand</p>
                <p className="font-medium">{load.powder.brand}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Charge Weight</p>
                <p className="font-medium">{load.powder.weightRaw || load.powder.weight}gr</p>
              </div>
            </div>
          </div>

          {/* Primer Details */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Primer</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium">{load.primer}</p>
            </div>
          </div>

          {/* Brass Details */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Brass</h3>
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Brand</p>
                <p className="font-medium">{load.brass.brand}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Length</p>
                <p className="font-medium">{load.brass.lengthRaw || load.brass.length}"</p>
              </div>
            </div>
          </div>

          {/* Measurements */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Measurements</h3>
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">COAL</p>
                <p className="font-medium">{load.cartridgeOverallLengthRaw || load.cartridgeOverallLength}"</p>
              </div>
              {load.cartridgeBaseToOgive && (
                <div>
                  <p className="text-sm text-gray-500">CBTO</p>
                  <p className="font-medium">{load.cartridgeBaseToOgiveRaw || load.cartridgeBaseToOgive}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Inventory Status */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Inventory Status</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">Available Rounds</p>
                <p className="font-medium">
                  {matchingAmmo ? (
                    <span className={matchingAmmo.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                      {matchingAmmo.quantity} rounds
                    </span>
                  ) : (
                    <span className="text-gray-500">Not in inventory</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Cost Information */}
          {typeof load.costPerRound === 'number' && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Cost Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Cost Per Round:</span>
                  <span className="text-primary-600">{formatCurrency(load.costPerRound)}</span>
                </div>
                {load.costBreakdown && (
                  <div className="border-t pt-2 mt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Bullet:</span>
                      <span>{formatCurrency(load.costBreakdown.bulletCost)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Powder:</span>
                      <span>{formatCurrency(load.costBreakdown.powderCost)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Primer:</span>
                      <span>{formatCurrency(load.costBreakdown.primerCost)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Brass:</span>
                      <span>{formatCurrency(load.costBreakdown.brassCost)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {load.notes && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Notes</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="whitespace-pre-wrap">{load.notes}</p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t pt-4 text-sm text-gray-500">
            <div className="flex justify-between">
              <span>Created:</span>
              <span>{load.createdAt.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Last Updated:</span>
              <span>{load.updatedAt.toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}