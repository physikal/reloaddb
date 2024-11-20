import React from 'react';
import { Settings } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/auth';
import { LoadFormConfig as LoadFormConfigType } from '../../types';
import { Button } from '../ui/Button';

const DEFAULT_CONFIG: LoadFormConfigType = {
  bullet: {
    brand: true,
    weight: true,
  },
  powder: {
    brand: true,
    weight: true,
  },
  primer: true,
  brass: {
    brand: true,
    length: true,
  },
  cartridgeOverallLength: true,
  cartridgeBaseToOgive: true,
  notes: true,
  cost: true,
};

export function LoadFormConfig() {
  const { user, updateUserConfig } = useAuthStore();
  const [config, setConfig] = React.useState<LoadFormConfigType>(
    user?.loadFormConfig || DEFAULT_CONFIG
  );
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setConfig(user?.loadFormConfig || DEFAULT_CONFIG);
  }, [user?.loadFormConfig]);

  const handleToggle = (path: string, value: boolean) => {
    const newConfig = { ...config };
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
    
    setConfig(newConfig);
  };

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, 'users', user!.id), {
        loadFormConfig: config
      });
      // Update local state
      updateUserConfig(config);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save configuration');
      setTimeout(() => setError(''), 3000);
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
    <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
      <div className="p-6">
        <h2 className="text-lg font-medium flex items-center text-gray-900">
          <Settings className="w-5 h-5 mr-2" />
          Load Form Configuration
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Customize which fields are shown when creating or editing loads.
        </p>

        {success && (
          <div className="mt-4 bg-green-50 text-green-500 p-3 rounded-md">
            Configuration saved successfully
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 text-red-500 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Bullet Details</h3>
            <div className="space-y-2">
              <ConfigCheckbox 
                label="Brand" 
                path="bullet.brand" 
                checked={config.bullet.brand} 
              />
              <ConfigCheckbox 
                label="Weight" 
                path="bullet.weight" 
                checked={config.bullet.weight} 
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Powder Details</h3>
            <div className="space-y-2">
              <ConfigCheckbox 
                label="Brand" 
                path="powder.brand" 
                checked={config.powder.brand} 
              />
              <ConfigCheckbox 
                label="Charge Weight" 
                path="powder.weight" 
                checked={config.powder.weight} 
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Primer</h3>
            <ConfigCheckbox 
              label="Primer Type" 
              path="primer" 
              checked={config.primer} 
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Brass Details</h3>
            <div className="space-y-2">
              <ConfigCheckbox 
                label="Brand" 
                path="brass.brand" 
                checked={config.brass.brand} 
              />
              <ConfigCheckbox 
                label="Length" 
                path="brass.length" 
                checked={config.brass.length} 
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Cartridge Measurements</h3>
            <div className="space-y-2">
              <ConfigCheckbox 
                label="Cartridge Overall Length (COAL)" 
                path="cartridgeOverallLength" 
                checked={config.cartridgeOverallLength} 
              />
              <ConfigCheckbox 
                label="Cartridge Base to Ogive (CBTO)" 
                path="cartridgeBaseToOgive" 
                checked={config.cartridgeBaseToOgive} 
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Additional Information</h3>
            <div className="space-y-2">
              <ConfigCheckbox 
                label="Notes" 
                path="notes" 
                checked={config.notes} 
              />
              <ConfigCheckbox 
                label="Cost Tracking" 
                path="cost" 
                checked={config.cost} 
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={handleSave}>
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}