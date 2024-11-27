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
  cartridgeBaseToOgive?: number;
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