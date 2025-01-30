import React, { useState } from 'react';
import { Gauge, ChevronDown, ChevronUp } from 'lucide-react';
import { Shot } from '../../types/range';

interface ShotLogProps {
  shots: Shot[];
  avgMuzzleVelocity: number | null;
}

interface ShotGroup {
  ammunition: Shot['ammunition'];
  shots: Shot[];
  avgMuzzleVelocity: number;
  standardDeviation: number;
  extremeSpread: number;
}

function calculateStats(velocities: number[]): { sd: number; es: number } {
  // Calculate Standard Deviation
  const mean = velocities.reduce((sum, v) => sum + v, 0) / velocities.length;
  const squareDiffs = velocities.map(v => Math.pow(v - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((sum, sq) => sum + sq, 0) / velocities.length;
  const sd = Math.sqrt(avgSquareDiff);

  // Calculate Extreme Spread
  const max = Math.max(...velocities);
  const min = Math.min(...velocities);
  const es = max - min;

  return { sd, es };
}

export function ShotLog({ shots }: ShotLogProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  // Group shots by ammunition
  const shotGroups = shots.reduce<ShotGroup[]>((groups, shot) => {
    const existingGroup = groups.find(g => g.ammunition.id === shot.ammunition.id);
    
    if (existingGroup) {
      existingGroup.shots.push(shot);
      // Recalculate stats for the group
      const velocities = existingGroup.shots.map(s => s.muzzleVelocity);
      const { sd, es } = calculateStats(velocities);
      existingGroup.avgMuzzleVelocity = velocities.reduce((sum, v) => sum + v, 0) / velocities.length;
      existingGroup.standardDeviation = sd;
      existingGroup.extremeSpread = es;
      return groups;
    }
    
    const { sd, es } = calculateStats([shot.muzzleVelocity]);
    return [...groups, {
      ammunition: shot.ammunition,
      shots: [shot],
      avgMuzzleVelocity: shot.muzzleVelocity,
      standardDeviation: sd,
      extremeSpread: es
    }];
  }, []);

  const toggleGroup = (ammunitionId: string) => {
    setExpandedGroups(prev => 
      prev.includes(ammunitionId)
        ? prev.filter(id => id !== ammunitionId)
        : [...prev, ammunitionId]
    );
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-700 flex items-center">
        <Gauge className="w-5 h-5 mr-2" />
        Shot Log
      </h4>

      {shotGroups.length > 0 ? (
        <div className="space-y-4">
          {shotGroups.map((group) => {
            const isExpanded = expandedGroups.includes(group.ammunition.id);
            return (
              <div key={group.ammunition.id} className="bg-gray-50 rounded-lg">
                <button
                  onClick={() => toggleGroup(group.ammunition.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors rounded-lg"
                >
                  <div className="space-y-1">
                    <h5 className="font-medium text-gray-900 text-left">{group.ammunition.cartridge}</h5>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Avg MV:</span>
                        <span className="ml-2 font-medium">{Math.round(group.avgMuzzleVelocity)} fps</span>
                      </div>
                      <div>
                        <span className="text-gray-600">SD:</span>
                        <span className="ml-2 font-medium">{Math.round(group.standardDeviation)} fps</span>
                      </div>
                      <div>
                        <span className="text-gray-600">ES:</span>
                        <span className="ml-2 font-medium">{Math.round(group.extremeSpread)} fps</span>
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="px-4 pb-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              MV (fps)
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {group.shots.map((shot, shotIndex) => (
                            <tr key={shotIndex}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {shot.muzzleVelocity}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No shots recorded</p>
      )}
    </div>
  );
}