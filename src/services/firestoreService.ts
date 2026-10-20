import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  getDocs,
  Unsubscribe
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { ClothingItem, StockTransaction, StoreSettings } from '../types/inventory';

// Clean object helper: strips undefined and unallowed properties
function sanitizeItem(item: ClothingItem, ownerEmail?: string): Record<string, any> {
  const clean: Record<string, any> = {
    id: String(item.id),
    name: String(item.name || '').trim(),
    color: String(item.color || '').trim(),
    size: String(item.size || '').trim(),
    currentStock: Number(item.currentStock) || 0,
  };

  if (item.sku !== undefined && item.sku !== '') clean.sku = String(item.sku);
  if (item.category !== undefined && item.category !== '') clean.category = String(item.category);
  if (item.minStock !== undefined) clean.minStock = Number(item.minStock) || 0;
  if (item.buyPrice !== undefined) clean.buyPrice = Number(item.buyPrice) || 0;
  if (item.sellPrice !== undefined) clean.sellPrice = Number(item.sellPrice) || 0;
  if (item.note !== undefined && item.note !== '') clean.note = String(item.note);
  if (item.updatedAt !== undefined) clean.updatedAt = String(item.updatedAt);
  if (ownerEmail) clean.ownerEmail = ownerEmail;

  return clean;
}

function sanitizeTransaction(tx: StockTransaction, ownerEmail?: string): Record<string, any> {
  const clean: Record<string, any> = {
    id: String(tx.id),
    itemId: String(tx.itemId),
    itemName: String(tx.itemName || ''),
    type: tx.type,
    quantity: Number(tx.quantity) || 0,
    previousStock: Number(tx.previousStock) || 0,
    newStock: Number(tx.newStock) || 0,
    timestamp: String(tx.timestamp || new Date().toISOString()),
  };

  if (tx.quantityLusin !== undefined) clean.quantityLusin = Number(tx.quantityLusin) || 0;
  if (tx.color !== undefined) clean.color = String(tx.color);
  if (tx.size !== undefined) clean.size = String(tx.size);
  if (tx.note !== undefined && tx.note !== '') clean.note = String(tx.note);
  if (tx.recipientOrSupplier !== undefined && tx.recipientOrSupplier !== '') {
    clean.recipientOrSupplier = String(tx.recipientOrSupplier);
  }
  if (ownerEmail) clean.ownerEmail = ownerEmail;

  return clean;
}

function sanitizeSettings(settings: StoreSettings): Record<string, any> {
  const clean: Record<string, any> = {
    storeName: String(settings.storeName || 'STZ Fashion'),
    ownerEmail: String(settings.ownerEmail || 'halifinakungcr24@gmail.com'),
    pinCode: String(settings.pinCode || '1234'),
  };

  if (settings.storeTagline !== undefined) clean.storeTagline = String(settings.storeTagline);
  if (settings.description !== undefined) clean.description = String(settings.description);
  if (settings.phone !== undefined) clean.phone = String(settings.phone);
  if (settings.address !== undefined) clean.address = String(settings.address);
  if (settings.isPinRequired !== undefined) clean.isPinRequired = Boolean(settings.isPinRequired);
  if (settings.currency !== undefined) clean.currency = String(settings.currency);

  return clean;
}

export function subscribeOnlineItems(
  onSuccess: (items: ClothingItem[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const colRef = collection(db, 'items');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: ClothingItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          name: data.name || '',
          sku: data.sku,
          category: data.category,
          color: data.color || '',
          size: data.size || '',
          currentStock: Number(data.currentStock) || 0,
          minStock: Number(data.minStock) || 0,
          buyPrice: data.buyPrice ? Number(data.buyPrice) : undefined,
          sellPrice: data.sellPrice ? Number(data.sellPrice) : undefined,
          note: data.note,
          updatedAt: data.updatedAt,
        });
      });
      onSuccess(items);
    },
    (err) => {
      console.warn('Items listener error:', err);
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, 'items');
    }
  );
}

export function subscribeOnlineTransactions(
  onSuccess: (transactions: StockTransaction[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const colRef = collection(db, 'transactions');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const transactions: StockTransaction[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        transactions.push({
          id: docSnap.id,
          itemId: data.itemId || '',
          itemName: data.itemName || '',
          color: data.color || '',
          size: data.size || '',
          type: data.type || 'IN',
          quantity: Number(data.quantity) || 0,
          quantityLusin: data.quantityLusin !== undefined ? Number(data.quantityLusin) : Number(((Number(data.quantity) || 0) / 12).toFixed(2)),
          previousStock: Number(data.previousStock) || 0,
          newStock: Number(data.newStock) || 0,
          note: data.note || '',
          recipientOrSupplier: data.recipientOrSupplier || '',
          timestamp: data.timestamp || new Date().toISOString(),
        });
      });
      // Sort newest first
      transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onSuccess(transactions);
    },
    (err) => {
      console.warn('Transactions listener error:', err);
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, 'transactions');
    }
  );
}

export function subscribeOnlineSettings(
  onSuccess: (settings: StoreSettings) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const docRef = doc(db, 'settings', 'store');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        onSuccess({
          storeName: data.storeName || 'STZ Fashion',
          storeTagline: data.storeTagline,
          description: data.description,
          ownerEmail: data.ownerEmail || 'halifinakungcr24@gmail.com',
          phone: data.phone,
          address: data.address,
          pinCode: data.pinCode || '1234',
          isPinRequired: data.isPinRequired ?? true,
          currency: data.currency || 'IDR',
        });
      }
    },
    (err) => {
      console.warn('Settings listener error:', err);
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, 'settings/store');
    }
  );
}

export async function saveItemOnline(item: ClothingItem, ownerEmail?: string): Promise<void> {
  const path = `items/${item.id}`;
  try {
    const itemRef = doc(db, 'items', item.id);
    await setDoc(itemRef, sanitizeItem(item, ownerEmail));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteItemOnline(itemId: string): Promise<void> {
  const path = `items/${itemId}`;
  try {
    const itemRef = doc(db, 'items', itemId);
    await deleteDoc(itemRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function saveTransactionOnline(tx: StockTransaction, ownerEmail?: string): Promise<void> {
  const path = `transactions/${tx.id}`;
  try {
    const txRef = doc(db, 'transactions', tx.id);
    await setDoc(txRef, sanitizeTransaction(tx, ownerEmail));
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function saveSettingsOnline(settings: StoreSettings): Promise<void> {
  const path = 'settings/store';
  try {
    const settingsRef = doc(db, 'settings', 'store');
    await setDoc(settingsRef, sanitizeSettings(settings), { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function clearAllStockOnline(): Promise<void> {
  try {
    const itemsSnapshot = await getDocs(collection(db, 'items'));
    const txSnapshot = await getDocs(collection(db, 'transactions'));
    const batch = writeBatch(db);

    itemsSnapshot.forEach((d) => batch.delete(d.ref));
    txSnapshot.forEach((d) => batch.delete(d.ref));

    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, 'items_and_transactions_batch');
  }
}
