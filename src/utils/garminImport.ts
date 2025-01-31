import { Shot } from '../types/range';

interface GarminShot {
  speed: number;
  time: string;
  notes: string;
}

export function parseGarminCsv(csvContent: string): GarminShot[] {
  const lines = csvContent.split('\n');
  const shots: GarminShot[] = [];
  let isReadingShots = false;

  for (const line of lines) {
    // Skip empty lines
    if (!line.trim()) continue;

    // Start reading shots after the header
    if (line.startsWith('#,SPEED')) {
      isReadingShots = true;
      continue;
    }

    // Stop reading when we hit the summary section
    if (line.startsWith('-,')) {
      break;
    }

    if (isReadingShots) {
      const parts = line.split(',').map(part => part.trim());
      if (parts.length >= 5) {
        const speed = parseFloat(parts[1]);
        if (!isNaN(speed)) {
          shots.push({
            speed,
            time: parts[4].replace(/"/g, '').trim(),
            notes: parts[8]?.replace(/"/g, '').trim() || ''
          });
        }
      }
    }
  }

  return shots;
}

export function convertToShots(
  garminShots: GarminShot[],
  ammunitionId: string,
  ammunition: any
): Omit<Shot, 'timestamp'>[] {
  return garminShots.map(shot => ({
    ammunitionId,
    ammunition,
    muzzleVelocity: shot.speed,
    notes: shot.notes || undefined
  }));
}