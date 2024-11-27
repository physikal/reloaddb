export interface BaseInventoryItem {
  id: string;
  userId: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ammunition extends BaseInventoryItem {
  caliber: string;
  sku: string;
  quantity: number;
  lotNumber: string;
}

export interface Bullet extends BaseInventoryItem {
  manufacturer: string;
  sku: string;
  weight: number;
  type: string;
  quantity: number;
}

export interface Powder extends BaseInventoryItem {
  manufacturer: string;
  sku: string;
  weight: number; // in pounds
  lotNumber: string;
}

export interface Primer extends BaseInventoryItem {
  manufacturer: string;
  sku: string;
  type: 'Small Rifle' | 'Large Rifle' | 'Large Rifle Magnum' | 
        'Small Pistol' | 'Small Pistol Magnum' | 
        'Large Pistol' | 'Large Pistol Magnum';
  quantity: number;
  lotNumber: string;
}

export interface Brass extends BaseInventoryItem {
  caliber: string;
  manufacturer: string;
  quantity: number;
  condition: 'new' | 'once-fired' | 'reloaded';
}

export type InventoryType = 'ammunition' | 'bullets' | 'powder' | 'primers' | 'brass';