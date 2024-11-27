import { utils, writeFile } from 'xlsx';
import { Load } from '../types';
import { Ammunition, Bullet, Powder, Primer, Brass, Firearm } from '../types/inventory';

export function exportLoadsToExcel(loads: Load[]) {
  const worksheet = utils.json_to_sheet(
    loads.map(load => ({
      'Cartridge': load.cartridge,
      'Bullet Brand': load.bullet.brand,
      'Bullet Weight (gr)': load.bullet.weight,
      'Powder Brand': load.powder.brand,
      'Charge Weight (gr)': load.powder.weight,
      'Primer': load.primer,
      'Brass Brand': load.brass.brand,
      'Brass Length (in)': load.brass.length,
      'COAL (in)': load.cartridgeOverallLength,
      'CBTO (in)': load.cartridgeBaseToOgive || '',
      'Cost Per Round': load.costPerRound || '',
      'Favorite': load.favorite ? 'Yes' : 'No',
      'Notes': load.notes || '',
      'Created': load.createdAt?.toLocaleDateString(),
      'Updated': load.updatedAt?.toLocaleDateString()
    }))
  );

  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Loads');

  writeFile(workbook, 'reloaddb_loads.xlsx');
}

export function exportInventoryToExcel(
  ammunition: Ammunition[],
  bullets: Bullet[],
  powder: Powder[],
  primers: Primer[],
  brass: Brass[],
  firearms: Firearm[]
) {
  const workbook = utils.book_new();

  // Firearms worksheet
  const firearmsWorksheet = utils.json_to_sheet(
    firearms.map(item => ({
      'Manufacturer': item.manufacturer,
      'Model': item.model,
      'Serial Number': item.serialNumber,
      'Type': item.type,
      'Caliber': item.caliber,
      'Barrel Length (in)': item.barrelLength || '',
      'Purchase Date': item.purchaseDate?.toLocaleDateString() || '',
      'Purchase Price': item.purchasePrice ? `$${item.purchasePrice.toFixed(2)}` : '',
      'Condition': item.condition,
      'Notes': item.notes || '',
      'Created': item.createdAt?.toLocaleDateString(),
      'Updated': item.updatedAt?.toLocaleDateString()
    }))
  );
  utils.book_append_sheet(workbook, firearmsWorksheet, 'Firearms');

  // Ammunition worksheet
  const ammoWorksheet = utils.json_to_sheet(
    ammunition.map(item => ({
      'Caliber': item.caliber,
      'SKU': item.sku,
      'Quantity': item.quantity,
      'Lot Number': item.lotNumber || '',
      'Notes': item.notes || '',
      'Created': item.createdAt?.toLocaleDateString(),
      'Updated': item.updatedAt?.toLocaleDateString()
    }))
  );
  utils.book_append_sheet(workbook, ammoWorksheet, 'Ammunition');

  // Bullets worksheet
  const bulletsWorksheet = utils.json_to_sheet(
    bullets.map(item => ({
      'Manufacturer': item.manufacturer,
      'SKU': item.sku,
      'Weight (gr)': item.weight,
      'Type': item.type,
      'Quantity': item.quantity,
      'Notes': item.notes || '',
      'Created': item.createdAt?.toLocaleDateString(),
      'Updated': item.updatedAt?.toLocaleDateString()
    }))
  );
  utils.book_append_sheet(workbook, bulletsWorksheet, 'Bullets');

  // Powder worksheet
  const powderWorksheet = utils.json_to_sheet(
    powder.map(item => ({
      'Manufacturer': item.manufacturer,
      'SKU': item.sku,
      'Weight (lbs)': item.weight,
      'Lot Number': item.lotNumber || '',
      'Notes': item.notes || '',
      'Created': item.createdAt?.toLocaleDateString(),
      'Updated': item.updatedAt?.toLocaleDateString()
    }))
  );
  utils.book_append_sheet(workbook, powderWorksheet, 'Powder');

  // Primers worksheet
  const primersWorksheet = utils.json_to_sheet(
    primers.map(item => ({
      'Manufacturer': item.manufacturer,
      'SKU': item.sku,
      'Type': item.type,
      'Quantity': item.quantity,
      'Lot Number': item.lotNumber || '',
      'Notes': item.notes || '',
      'Created': item.createdAt?.toLocaleDateString(),
      'Updated': item.updatedAt?.toLocaleDateString()
    }))
  );
  utils.book_append_sheet(workbook, primersWorksheet, 'Primers');

  // Brass worksheet
  const brassWorksheet = utils.json_to_sheet(
    brass.map(item => ({
      'Caliber': item.caliber,
      'Manufacturer': item.manufacturer,
      'Quantity': item.quantity,
      'Condition': item.condition,
      'Notes': item.notes || '',
      'Created': item.createdAt?.toLocaleDateString(),
      'Updated': item.updatedAt?.toLocaleDateString()
    }))
  );
  utils.book_append_sheet(workbook, brassWorksheet, 'Brass');

  writeFile(workbook, 'reloaddb_inventory.xlsx');
}