export interface Load {
  id: string;
  userId: string;
  cartridge: string;
  bullet: {
    brand: string;
    weight: number;
    weightRaw?: string;
  };
  powder: {
    brand: string;
    weight: number;
    weightRaw?: string;
  };
  primer: string;
  brass: {
    brand: string;
    length: number;
    lengthRaw?: string;
  };
  cartridgeOverallLength: number;
  cartridgeOverallLengthRaw?: string;
  cartridgeBaseToOgive?: number;
  cartridgeBaseToOgiveRaw?: string;
  notes?: string;
  favorite?: boolean;
  displayConfig?: {
    bullet: {
      brand: boolean;
      weight: boolean;
    };
    powder: {
      brand: boolean;
      weight: boolean;
    };
    primer: boolean;
    brass: {
      brand: boolean;
      length: boolean;
    };
    cartridgeOverallLength: boolean;
    cartridgeBaseToOgive: boolean;
    notes: boolean;
    cost: boolean;
  };
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
  lastLogin?: Date;
  loadFormConfig?: LoadFormConfig;
  loadCardConfig?: LoadCardConfig;
}

export interface LoadFormConfig {
  bullet: {
    brand: boolean;
    weight: boolean;
  };
  powder: {
    brand: boolean;
    weight: boolean;
  };
  primer: boolean;
  brass: {
    brand: boolean;
    length: boolean;
  };
  cartridgeOverallLength: boolean;
  cartridgeBaseToOgive: boolean;
  notes: boolean;
  cost: boolean;
}

export interface LoadCardConfig extends LoadFormConfig {}

export interface ChangelogEntry {
  id: string;
  title: string;
  content: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}