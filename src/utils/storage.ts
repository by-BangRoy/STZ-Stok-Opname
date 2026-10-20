import { ClothingItem, StockTransaction, StoreSettings } from '../types/inventory';

const STORAGE_KEYS = {
  ITEMS: 'stz_fashion_items_v3_clean',
  TRANSACTIONS: 'stz_fashion_transactions_v3_clean',
  SETTINGS: 'stz_fashion_settings_v3_clean',
  SESSION_UNLOCKED: 'stz_fashion_session_unlocked_v3_clean',
};

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'STZ Fashion',
  storeTagline: 'Sistem Rekap Mutasi & Inventaris Pakaian',
  ownerEmail: 'kesanramadhan07@gmail.com',
  phone: '0812-3456-7890',
  address: 'Sentra Mode Fashion & Lifestyle, Jakarta',
  pinCode: '1234',
  isPinRequired: true,
  currency: 'IDR',
};

// Initial data is completely empty as requested: clean fresh state
export const INITIAL_ITEMS: ClothingItem[] = [];
export const INITIAL_TRANSACTIONS: StockTransaction[] = [];

export function getStoredItems(): ClothingItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ITEMS);
    if (!raw) {
      saveStoredItems(INITIAL_ITEMS);
      return INITIAL_ITEMS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to get items from localStorage:', err);
    return INITIAL_ITEMS;
  }
}

export function saveStoredItems(items: ClothingItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save items to localStorage:', err);
  }
}

export function getStoredTransactions(): StockTransaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      saveStoredTransactions(INITIAL_TRANSACTIONS);
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to get transactions from localStorage:', err);
    return INITIAL_TRANSACTIONS;
  }
}

export function saveStoredTransactions(transactions: StockTransaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (err) {
    console.error('Failed to save transactions to localStorage:', err);
  }
}

export function getStoredSettings(): StoreSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      saveStoredSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Failed to get settings from localStorage:', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: StoreSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to localStorage:', err);
  }
}

export function getSessionUnlocked(): boolean {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.SESSION_UNLOCKED);
    if (raw === null) {
      return false;
    }
    return raw === 'true';
  } catch {
    return false;
  }
}

export function setSessionUnlocked(unlocked: boolean): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.SESSION_UNLOCKED, unlocked ? 'true' : 'false');
  } catch (err) {
    console.error('Failed to set session unlock state:', err);
  }
}
