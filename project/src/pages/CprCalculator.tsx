import { useState, useEffect } from 'react';
import { Calculator, DollarSign, Package, Scale, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { AddToLoadModal } from '../components/loads/AddToLoadModal';
import { useLoadsStore } from '../store/loads';
import { Load } from '../types';

interface CostInputs {
  bulletTotalCost: string;
  bulletQuantity: string;
  powderCostPerPound: string;
  powderGrainsPerLoad: string;
  primerTotalCost: string;
  primerQuantity: string;
  brassTotalCost: string;
  brassQuantity: string;
  brassReuseCount: string;
  numberOfRounds: string;
}

interface CostBreakdown {
  bulletCost: number;
  powderCost: number;
  primerCost: number;
  brassCost: number;
  totalCost: number;
}

export function CprCalculatorPage() {
  const { updateLoad } = useLoadsStore();
  const [isAddToLoadModalOpen, setIsAddToLoadModalOpen] = useState(false);
  const [inputs, setInputs] = useState<CostInputs>({
    bulletTotalCost: '',
    bulletQuantity: '',
    powderCostPerPound: '',
    powderGrainsPerLoad: '',
    primerTotalCost: '',
    primerQuantity: '',
    brassTotalCost: '',
    brassQuantity: '',
    brassReuseCount: '5',
    numberOfRounds: ''
  });

  const [costs, setCosts] = useState<CostBreakdown>({
    bulletCost: 0,
    powderCost: 0,
    primerCost: 0,
    brassCost: 0,
    totalCost: 0
  });

  // Remove the useEffect hook that was causing constant recalculations

  const handleInputChange = (field: keyof CostInputs) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
      setInputs(prev => {
        const newInputs = { ...prev, [field]: value };
        // Calculate costs after updating inputs
        calculateCostsFromInputs(newInputs);
        return newInputs;
      });
    }
  };

  const calculateCostsFromInputs = (currentInputs: CostInputs) => {
    const bulletCost = currentInputs.bulletTotalCost && currentInputs.bulletQuantity
      ? Number(currentInputs.bulletTotalCost) / Number(currentInputs.bulletQuantity)
      : 0;

    const powderCostPerGrain = currentInputs.powderCostPerPound
      ? Number(currentInputs.powderCostPerPound) / 7000
      : 0;
    const powderCost = currentInputs.powderGrainsPerLoad
      ? powderCostPerGrain * Number(currentInputs.powderGrainsPerLoad)
      : 0;

    const primerCost = currentInputs.primerTotalCost && currentInputs.primerQuantity
      ? Number(currentInputs.primerTotalCost) / Number(currentInputs.primerQuantity)
      : 0;

    const brassUseCost = currentInputs.brassTotalCost && currentInputs.brassQuantity
      ? Number(currentInputs.brassTotalCost) / Number(currentInputs.brassQuantity)
      : 0;
    const brassCost = currentInputs.brassReuseCount
      ? brassUseCost / Number(currentInputs.brassReuseCount)
      : 0;

    const totalCost = bulletCost + powderCost + primerCost + brassCost;

    setCosts({
      bulletCost,
      powderCost,
      primerCost,
      brassCost,
      totalCost
    });
  };

  const handleAddToLoad = async (load: Load) => {
    try {
      await updateLoad(load.id, {
        costPerRound: costs.totalCost,
        costBreakdown: {
          bulletCost: costs.bulletCost,
          powderCost: costs.powderCost,
          primerCost: costs.primerCost,
          brassCost: costs.brassCost
        }
      });
      setIsAddToLoadModalOpen(false);
    } catch (error) {
      console.error('Failed to update load with cost:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4
    }).format(value);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center space-x-3">
        <Calculator className="w-8 h-8 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Cost Per Round Calculator</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Package className="w-5 h-5 mr-2 text-primary-600" />
              Components
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="bulletTotalCost">Bullet Total Cost ($)</label>
                <input
                  type="number"
                  id="bulletTotalCost"
                  min="0"
                  step="0.01"
                  value={inputs.bulletTotalCost}
                  onChange={handleInputChange('bulletTotalCost')}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="bulletQuantity">Bullet Quantity</label>
                <input
                  type="number"
                  id="bulletQuantity"
                  min="1"
                  value={inputs.bulletQuantity}
                  onChange={handleInputChange('bulletQuantity')}
                  placeholder="100"
                />
              </div>

              <div>
                <label htmlFor="powderCostPerPound">Powder Cost Per Pound ($)</label>
                <input
                  type="number"
                  id="powderCostPerPound"
                  min="0"
                  step="0.01"
                  value={inputs.powderCostPerPound}
                  onChange={handleInputChange('powderCostPerPound')}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="powderGrainsPerLoad">Powder Grains Per Load</label>
                <input
                  type="number"
                  id="powderGrainsPerLoad"
                  min="0"
                  step="0.1"
                  value={inputs.powderGrainsPerLoad}
                  onChange={handleInputChange('powderGrainsPerLoad')}
                  placeholder="0.0"
                />
              </div>

              <div>
                <label htmlFor="primerTotalCost">Primer Total Cost ($)</label>
                <input
                  type="number"
                  id="primerTotalCost"
                  min="0"
                  step="0.01"
                  value={inputs.primerTotalCost}
                  onChange={handleInputChange('primerTotalCost')}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="primerQuantity">Primer Quantity</label>
                <input
                  type="number"
                  id="primerQuantity"
                  min="1"
                  value={inputs.primerQuantity}
                  onChange={handleInputChange('primerQuantity')}
                  placeholder="100"
                />
              </div>

              <div>
                <label htmlFor="brassTotalCost">Brass Total Cost ($)</label>
                <input
                  type="number"
                  id="brassTotalCost"
                  min="0"
                  step="0.01"
                  value={inputs.brassTotalCost}
                  onChange={handleInputChange('brassTotalCost')}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="brassQuantity">Brass Quantity</label>
                <input
                  type="number"
                  id="brassQuantity"
                  min="1"
                  value={inputs.brassQuantity}
                  onChange={handleInputChange('brassQuantity')}
                  placeholder="50"
                />
              </div>

              <div>
                <label htmlFor="brassReuseCount">Average Brass Reuse Count</label>
                <input
                  type="number"
                  id="brassReuseCount"
                  min="1"
                  value={inputs.brassReuseCount}
                  onChange={handleInputChange('brassReuseCount')}
                  placeholder="5"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
              <DollarSign className="w-5 h-5 mr-2 text-primary-600" />
              Cost Breakdown
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Bullet Cost:</span>
                <span className="font-medium">{formatCurrency(costs.bulletCost)}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Powder Cost:</span>
                <span className="font-medium">{formatCurrency(costs.powderCost)}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Primer Cost:</span>
                <span className="font-medium">{formatCurrency(costs.primerCost)}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Brass Cost (per use):</span>
                <span className="font-medium">{formatCurrency(costs.brassCost)}</span>
              </div>

              <div className="flex justify-between items-center py-3 mt-2 bg-gray-50 rounded-lg px-3">
                <span className="text-gray-900 font-semibold">Total Cost Per Round:</span>
                <span className="text-lg font-bold text-primary-600">
                  {formatCurrency(costs.totalCost)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
              <Scale className="w-5 h-5 mr-2 text-primary-600" />
              Batch Cost Calculator
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="numberOfRounds">Number of Rounds</label>
                <input
                  type="number"
                  id="numberOfRounds"
                  min="1"
                  value={inputs.numberOfRounds}
                  onChange={handleInputChange('numberOfRounds')}
                  placeholder="50"
                />
              </div>

              <div className="flex justify-between items-center py-3 bg-gray-50 rounded-lg px-3">
                <span className="text-gray-900 font-semibold">Total Batch Cost:</span>
                <span className="text-lg font-bold text-primary-600">
                  {formatCurrency(costs.totalCost * Number(inputs.numberOfRounds || 0))}
                </span>
              </div>
            </div>
          </div>
          
          <Button
            onClick={() => setIsAddToLoadModalOpen(true)}
            className="w-full mt-4"
            disabled={costs.totalCost === 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add to Load
          </Button>
        </div>
      </div>
      
      <AddToLoadModal
        isOpen={isAddToLoadModalOpen}
        onClose={() => setIsAddToLoadModalOpen(false)}
        onSelect={handleAddToLoad}
        costBreakdown={costs}
      />
    </div>
  );
}