import { read, utils } from 'xlsx';
import { Ammunition, Bullet, Powder, Primer, Brass, Firearm } from '../types/inventory';

interface ImportedInventory {
  firearms: Partial<Firearm>[];
  ammunition: Partial<Ammunition>[];
  bullets: Partial<Bullet>[];
  powder: Partial<Powder>[];
  primers: Partial<Primer>[];
  brass: Partial<Brass>[];
}

export async function importInventoryFromExcel(file: File): Promise<ImportedInventory> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = read(data, { type: 'binary' });
        const inventory: ImportedInventory = {
          firearms: [],
          ammunition: [],
          bullets: [],
          powder: [],
          primers: [],
          brass: []
        };

        // Process each worksheet
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = utils.sheet_to_json(worksheet);

          switch (sheetName) {
            case 'Firearms':
              inventory.firearms = jsonData.map(row => ({
                manufacturer: row['Manufacturer'],
                model: row['Model'],
                serialNumber: row['Serial Number'],
                type: row['Type'],
                caliber: row['Caliber'],
                barrelLength: row['Barrel Length (in)'] ? Number(row['Barrel Length (in)']) : undefined,
                purchasePrice: row['Purchase Price'] ? Number(row['Purchase Price'].replace(/[^0-9.-]+/g, '')) : undefined,
                condition: row['Condition'],
                notes: row['Notes']
              }));
              break;

            case 'Ammunition':
              inventory.ammunition = jsonData.map(row => ({
                cartridge: row['Cartridge'],
                sku: row['SKU'],
                quantity: Number(row['Quantity']),
                lotNumber: row['Lot Number'],
                notes: row['Notes']
              }));
              break;

            case 'Bullets':
              inventory.bullets = jsonData.map(row => ({
                manufacturer: row['Manufacturer'],
                sku: row['SKU'],
                weight: Number(row['Weight (gr)']),
                type: row['Type'],
                quantity: Number(row['Quantity']),
                notes: row['Notes']
              }));
              break;

            case 'Powder':
              inventory.powder = jsonData.map(row => ({
                manufacturer: row['Manufacturer'],
                sku: row['SKU'],
                weight: Number(row['Weight (lbs)']),
                lotNumber: row['Lot Number'],
                notes: row['Notes']
              }));
              break;

            case 'Primers':
              inventory.primers = jsonData.map(row => ({
                manufacturer: row['Manufacturer'],
                sku: row['SKU'],
                type: row['Type'],
                quantity: Number(row['Quantity']),
                lotNumber: row['Lot Number'],
                notes: row['Notes']
              }));
              break;

            case 'Brass':
              inventory.brass = jsonData.map(row => ({
                cartridge: row['Cartridge'],
                manufacturer: row['Manufacturer'],
                quantity: Number(row['Quantity']),
                condition: row['Condition'],
                notes: row['Notes']
              }));
              break;
          }
        });

        resolve(inventory);
      } catch (error) {
        reject(new Error('Failed to parse Excel file. Please make sure it matches the export format.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsBinaryString(file);
  });
}