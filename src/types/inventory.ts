export interface ClothingItem {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  color: string;
  size: string;
  currentStock: number;
  minStock: number;
  buyPrice?: number;
  sellPrice?: number;
  note?: string;
  updatedAt?: string;
}

export interface StockTransaction {
  id: string;
  itemId: string;
  itemName: string;
  color: string;
  size: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  previousStock: number;
  newStock: number;
  note: string;
  recipientOrSupplier: string;
  timestamp: string;
}

export interface StoreSettings {
  storeName: string;
  storeTagline?: string;
  ownerEmail: string;
  phone?: string;
  address?: string;
  pinCode: string;
  isPinRequired?: boolean;
  currency?: string;
}
