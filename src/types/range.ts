import { Firearm, Ammunition } from './inventory';

export interface RangeDay {
  id: string;
  userId: string;
  title: string;
  date: Date;
  firearms: RangeDayFirearm[];
  ammunition: RangeDayAmmunition[];
  shots: Shot[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  stats?: RangeDayStats;
}

export interface RangeDayStats {
  avgMuzzleVelocity: number | null;
  totalShots: number;
}

export interface RangeDayFirearm {
  firearmId: string;
  firearm: Firearm;
  notes?: string;
}

export interface RangeDayAmmunition {
  ammunitionId: string;
  ammunition: Ammunition;
  roundsUsed: number;
  notes?: string;
}

export interface Shot {
  ammunitionId: string;
  ammunition: Ammunition;
  muzzleVelocity: number;
  notes?: string;
  timestamp: Date;
}