import { useState } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { parseGarminCsv, convertToShots } from '../../utils/garminImport';
import { RangeDayAmmunition } from '../../types/range';

interface ImportGarminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (shots: any[]) => void;
  rangeAmmunition: RangeDayAmmunition[];
}

export function ImportGarminModal({ isOpen, onClose, onImport, rangeAmmunition }: ImportGarminModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAmmoId, setSelectedAmmoId] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !selectedAmmoId) return;

    try {
      const text = await selectedFile.text();
      const garminShots = parseGarminCsv(text);
      
      if (garminShots.length === 0) {
        throw new Error('No valid shots found in the CSV file');
      }

      const selectedAmmo = rangeAmmunition.find(a => a.ammunitionId === selectedAmmoId)?.ammunition;
      if (!selectedAmmo) {
        throw new Error('Selected ammunition not found');
      }

      const shots = convertToShots(garminShots, selectedAmmoId, selectedAmmo);
      onImport(shots);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to import shots');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Import Garmin Shot String</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Select Ammunition
            </label>
            <select
              value={selectedAmmoId}
              onChange={(e) => setSelectedAmmoId(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Select ammunition</option>
              {rangeAmmunition.map((ammo) => (
                <option key={ammo.ammunitionId} value={ammo.ammunitionId}>
                  {ammo.ammunition.cartridge} ({ammo.roundsUsed} rounds used)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Garmin CSV File
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept=".csv"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  CSV file exported from Garmin
                </p>
              </div>
            </div>
            {selectedFile && (
              <p className="text-sm text-gray-500">
                Selected file: {selectedFile.name}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedFile || !selectedAmmoId}
          >
            Import Shots
          </Button>
        </div>
      </div>
    </div>
  );
}