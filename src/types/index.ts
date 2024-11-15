export interface Load {
  id: string;
  userId: string;
  cartridge: string;
  bullet: {
    brand: string;
    weight: number;
  };
  powder: {
    brand: string;
    weight: number;
  };
  primer: string;
  brass: {
    brand: string;
    length: number;
  };
  cartridgeOverallLength: number;
  notes?: string;
  favorite?: boolean;
  costPerRound?: number;
  costBreakdown?: {
    bulletCost: number;
    powderCost: number;
    primerCost: number;
    brassCost: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  createdAt: Date;
}