import React from 'react';
import { X, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import { useLoadsStore } from '../../store/loads';
import { LoadCardConfig } from '../../types';

interface LoadCardConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  loadId: string;
  config: LoadCardConfig;
}

export function LoadCardConfigModal({ isOpen, onClose, loadId, config }: LoadCardConfigModalProps) {
  const { updateLoad } = useLoadsStore();
  const [localConfig, setLocalConfig] = React.useState(config);

  if (!isOpen) return null;

  const handleToggle = (path: string, value: boolean) => {
    const newConfig = { ...localConfig };
    const parts = path.split('.');
    
    if (parts.length === 1) {
      (newConfig as any)[parts[0]] = value;
    } else {
      let current: any = newConfig;
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
    }
    
    setLocalConfig(newConfig);
  };

  const handleSave = async () => {
    try {
      await updateLoad(loadId, {
        displayConfig: localConfig
      });
      onClose();
    } catch (error) {
      console.error('Failed to save load card configuration:', error);
    }
  };

  const ConfigCheckbox = ({ 
    label, 
    path, 
    checked 
  }: { 
    label: string; 
    path: string; 
    checked: boolean 
  }) => (
    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => handleToggle(path, e.target.checked)}
        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Load Card Display Settings</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Bullet Details</h3>
            <div className="space-y-2">
              <ConfigCheckbox 
                label="Brand" 
                path="bullet.brand" 
                checked={localConfig.bullet.brand} 
              />
              <ConfigCheckbox 
                label="Weight" 
                path="bullet.weight" 
                checked={localConfig.bullet.weight} 
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Powder Details</h3>
            <div className="space-y-2">
              <ConfigCheckbox 
                label="Brand" 
                path="powder.brand" 
                checked={localConfig.powder.brand} 
              />
              <ConfigCheckbox 
                label="Charge Weight" 
                path="powder.weight" 
                checked={localConfig.powder.weight} 
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Components</h3>
            <div className="space-y-2">
              <ConfigCheckbox 
                label="Primer" 
                path="primer" 
                checked={localConfig.primer} 
              />
              <ConfigCheckbox 
                label="Brass Brand" 
                path="brass.brand" 
                checked={localConfig.brass.brand} 
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Measurements</h3>
            <div className="space-y-2">
              <ConfigCheckbox 
                label="Cartridge Overall Length (COAL)" 
                path="cartridgeOverallLength" 
                checked={localConfig.cartridgeOverallLength} 
              />
              <ConfigCheckbox 
                label="Cartridge Base to Ogive (CBTO)" 
                path="cartridgeBaseToOgive" 
                checked={localConfig.cartridgeBaseToOgive} 
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Additional Information</h3>
            <div className="space-y-2">
              <ConfigCheckbox 
                label="Notes" 
                path="notes" 
                checked={localConfig.notes} 
              />
              <ConfigCheckbox 
                label="Cost Information" 
                path="cost" 
                checked={localConfig.cost} 
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}