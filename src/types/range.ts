import { Firearm } from './inventory';

export interface RangeDay {
  id: string;
  userId: string;
  title: string;
  date: Date;
  firearms: RangeDayFirearm[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RangeDayFirearm {
  firearmId: string;
  firearm: Firearm;
  notes?: string;
}