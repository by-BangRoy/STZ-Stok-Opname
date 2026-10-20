/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ClothingItem, StockTransaction, StoreSettings } from './types/inventory';
import { 
  getStoredItems, 
  saveStoredItems, 
  getStoredTransactions, 
  saveStoredTransactions, 
  getStoredSettings, 
  saveStoredSettings,
  getSessionUnlocked,
  setSessionUnlocked
} from './utils/storage';
import { exportInventoryToCsv, exportRecapToCsv } from './utils/formatters';

import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { RecapTransactionsView } from './components/RecapTransactionsView';
import { ItemFormModal } from './components/ItemFormModal';
import { StockMutationModal } from './components/StockMutationModal';
import { StoreSettingsModal } from './components/StoreSettingsModal';
import { PrintRecapSheet } from './components/PrintRecapSheet';
import { PrivateAccessLock } from './components/PrivateAccessLock';
import { CheckCircle2, ArrowLeftRight, X, Radio, CloudCheck } from 'lucide-react';

import { auth, testConnection, OWNER_BOOTSTRAP_EMAIL } from './firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  subscribeOnlineItems,
  subscribeOnlineTransactions,
  subscribeOnlineSettings,
  saveItemOnline,
  deleteItemOnline,
  saveTransactionOnline,
  saveSettingsOnline,
  clearAllStockOnline
} from './services/firestoreService';

export default function App() {
  const [items, setItems] = useState<ClothingItem[]>(() => getStoredItems());
  const [transactions, setTransactions] = useState<StockTransaction[]>(() => getStoredTransactions());
  const [settings, setSettings] = useState<StoreSettings>(() => getStoredSettings());

  // Private Access State (Keamanan Login Wajib PIN / Google Pemilik)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [currentOwnerEmail, setCurrentOwnerEmail] = useState<string>(OWNER_BOOTSTRAP_EMAIL);
  const [isOnlineSyncActive, setIsOnlineSyncActive] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'recap'>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Modal states
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClothingItem | null>(null);

  const [isMutationModalOpen, setIsMutationModalOpen] = useState(false);
  const [mutationTargetItem, setMutationTargetItem] = useState<ClothingItem | null>(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsModalTab, setSettingsModalTab] = useState<'profile' | 'security' | 'data'>('profile');

  // Toast alert state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Test connection to Firestore on boot as mandated
  useEffect(() => {
    testConnection();
  }, []);

  // Track Firebase Auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        setCurrentOwnerEmail(user.email);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Online Real-time Sync listeners when unlocked
  useEffect(() => {
    if (!isUnlocked) return;

    let unsubItems: (() => void) | undefined;
    let unsubTransactions: (() => void) | undefined;
    let unsubSettings: (() => void) | undefined;

    try {
      unsubItems = subscribeOnlineItems(
        (remoteItems) => {
          if (remoteItems.length > 0) {
            setItems(remoteItems);
            saveStoredItems(remoteItems);
          } else {
            // Remote is empty, push existing local items to cloud if any
            const local = getStoredItems();
            if (local.length > 0) {
              local.forEach((item) => saveItemOnline(item, currentOwnerEmail));
            }
          }
          setIsOnlineSyncActive(true);
        },
        () => {
          setIsOnlineSyncActive(false);
        }
      );

      unsubTransactions = subscribeOnlineTransactions(
        (remoteTxs) => {
          if (remoteTxs.length > 0) {
            setTransactions(remoteTxs);
            saveStoredTransactions(remoteTxs);
          } else {
            const localTxs = getStoredTransactions();
            if (localTxs.length > 0) {
              localTxs.forEach((tx) => saveTransactionOnline(tx, currentOwnerEmail));
            }
          }
        },
        () => {
          setIsOnlineSyncActive(false);
        }
      );

      unsubSettings = subscribeOnlineSettings(
        (remoteSettings) => {
          setSettings(remoteSettings);
          saveStoredSettings(remoteSettings);
        },
        () => {
          setIsOnlineSyncActive(false);
        }
      );
    } catch (err) {
      console.warn('Realtime sync listener initialization:', err);
    }

    return () => {
      if (unsubItems) unsubItems();
      if (unsubTransactions) unsubTransactions();
      if (unsubSettings) unsubSettings();
    };
  }, [isUnlocked, currentOwnerEmail]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handlers for Items
  const handleSaveItem = async (itemData: ClothingItem) => {
    const isNew = !items.some((it) => it.id === itemData.id);

    let updatedItems: ClothingItem[];
    if (isNew) {
      updatedItems = [itemData, ...items];
      // Create initial stock IN transaction if stock > 0
      if (itemData.currentStock > 0) {
        const initialTx: StockTransaction = {
          id: 'mut-init-' + Date.now(),
          itemId: itemData.id,
          itemName: itemData.name,
          color: itemData.color,
          size: itemData.size,
          type: 'IN',
          quantity: itemData.currentStock,
          previousStock: 0,
          newStock: itemData.currentStock,
          note: 'Barang Masuk (Stok Awal Pakaian Baru)',
          recipientOrSupplier: 'Stok Awal Baru',
          timestamp: new Date().toISOString(),
        };
        const updatedTxs = [initialTx, ...transactions];
        setTransactions(updatedTxs);
        saveStoredTransactions(updatedTxs);
        // Sync online transaction
        saveTransactionOnline(initialTx, currentOwnerEmail).catch(console.error);
      }
      setToastMessage(`Pakaian baru "${itemData.name}" berhasil didaftarkan (Stok: ${itemData.currentStock} Pcs). Tersimpan online.`);
    } else {
      // Existing item edited: check if stock was manually altered
      const existing = items.find((it) => it.id === itemData.id);
      if (existing && existing.currentStock !== itemData.currentStock) {
        const diff = itemData.currentStock - existing.currentStock;
        const autoTx: StockTransaction = {
          id: 'mut-edit-' + Date.now(),
          itemId: itemData.id,
          itemName: itemData.name,
          color: itemData.color,
          size: itemData.size,
          type: diff > 0 ? 'IN' : 'OUT',
          quantity: Math.abs(diff),
          previousStock: existing.currentStock,
          newStock: itemData.currentStock,
          note: diff > 0 ? 'Penambahan Stok (Edit Manual Pakaian)' : 'Pengurangan Stok (Edit Manual Pakaian)',
          recipientOrSupplier: 'Koreksi Data',
          timestamp: new Date().toISOString(),
        };
        const updatedTxs = [autoTx, ...transactions];
        setTransactions(updatedTxs);
        saveStoredTransactions(updatedTxs);
        // Sync online transaction
        saveTransactionOnline(autoTx, currentOwnerEmail).catch(console.error);
        setToastMessage(`Stok "${itemData.name}" otomatis diperbarui (${diff > 0 ? `+${diff}` : diff} Pcs) & tersinkronisasi online.`);
      } else {
        setToastMessage(`Data pakaian "${itemData.name}" berhasil disimpan online.`);
      }
      updatedItems = items.map((it) => (it.id === itemData.id ? itemData : it));
    }

    setItems(updatedItems);
    saveStoredItems(updatedItems);

    // Save online to Firestore
    saveItemOnline(itemData, currentOwnerEmail).catch(console.error);
  };

  const handleDeleteItem = async (itemId: string) => {
    const target = items.find((it) => it.id === itemId);
    const updated = items.filter((it) => it.id !== itemId);
    setItems(updated);
    saveStoredItems(updated);

    // Delete online from Firestore
    deleteItemOnline(itemId).catch(console.error);

    if (target) {
      setToastMessage(`Pakaian "${target.name}" (${target.color} - ${target.size}) telah dihapus dari cloud online.`);
    }
  };

  // Handlers for Stock Mutation (Modal)
  const handleSaveMutation = async (transaction: StockTransaction, updatedItem: ClothingItem) => {
    const updatedTxs = [transaction, ...transactions];
    setTransactions(updatedTxs);
    saveStoredTransactions(updatedTxs);

    const updatedItems = items.map((it) => (it.id === updatedItem.id ? updatedItem : it));
    setItems(updatedItems);
    saveStoredItems(updatedItems);

    // Sync both transaction and updated item online to Firestore in real-time
    saveTransactionOnline(transaction, currentOwnerEmail).catch(console.error);
    saveItemOnline(updatedItem, currentOwnerEmail).catch(console.error);

    const typeLabel = transaction.type === 'IN' ? 'Barang Masuk' : transaction.type === 'OUT' ? 'Barang Keluar' : 'Koreksi Stok';
    setToastMessage(`Mutasi ${typeLabel} online berhasil: ${transaction.itemName} (${transaction.type === 'OUT' ? '-' : '+'}${transaction.quantity} Pcs). Total stok kini: ${updatedItem.currentStock} Pcs.`);
  };

  // Quick Inline Adjust Stock (e.g. +1, -1, +12, -12 from Inventory list/cards)
  const handleQuickAdjustStock = async (itemId: string, delta: number, note?: string) => {
    const target = items.find((it) => it.id === itemId);
    if (!target) return;

    const previousStock = target.currentStock;
    const newStock = Math.max(0, previousStock + delta);
    const actualDiff = newStock - previousStock;
    if (actualDiff === 0) return;

    const isAdding = actualDiff > 0;
    const autoTx: StockTransaction = {
      id: 'mut-quick-' + Date.now(),
      itemId: target.id,
      itemName: target.name,
      color: target.color,
      size: target.size,
      type: isAdding ? 'IN' : 'OUT',
      quantity: Math.abs(actualDiff),
      previousStock,
      newStock,
      note: note || (isAdding ? `Penambahan Cepat (+${actualDiff} Pcs)` : `Pengurangan Cepat (${actualDiff} Pcs)`),
      recipientOrSupplier: isAdding ? 'Restock Cepat' : 'Penjualan Cepat',
      timestamp: new Date().toISOString(),
    };

    const updatedItem: ClothingItem = {
      ...target,
      currentStock: newStock,
      updatedAt: new Date().toISOString(),
    };

    const updatedItems = items.map((it) => (it.id === target.id ? updatedItem : it));
    const updatedTxs = [autoTx, ...transactions];

    setItems(updatedItems);
    setTransactions(updatedTxs);
    saveStoredItems(updatedItems);
    saveStoredTransactions(updatedTxs);

    // Sync online to Firestore
    saveItemOnline(updatedItem, currentOwnerEmail).catch(console.error);
    saveTransactionOnline(autoTx, currentOwnerEmail).catch(console.error);

    setToastMessage(
      `Otomatis update stok online: ${target.name} (${target.color} - ${target.size}) ${actualDiff > 0 ? `+${actualDiff}` : actualDiff} Pcs. Total stok: ${newStock} Pcs.`
    );
  };

  // Handlers for Settings & Backup
  const handleUpdateSettings = async (newSettings: StoreSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
    saveSettingsOnline(newSettings).catch(console.error);
    setToastMessage('Profil dan pengaturan berhasil disimpan online ke cloud.');
  };

  const handleClearAllStock = async () => {
    setItems([]);
    saveStoredItems([]);
    clearAllStockOnline().catch(console.error);
    setToastMessage('Semua stok pakaian telah berhasil dihapus dari cloud online (0 data).');
  };

  const handleClearAllTransactions = async () => {
    setTransactions([]);
    saveStoredTransactions([]);
    clearAllStockOnline().catch(console.error);
    setToastMessage('Seluruh riwayat mutasi barang telah berhasil dihapus dari cloud (0 data).');
  };

  const handleClearAllData = async () => {
    setItems([]);
    setTransactions([]);
    saveStoredItems([]);
    saveStoredTransactions([]);
    clearAllStockOnline().catch(console.error);
    setToastMessage('Seluruh data stok pakaian dan riwayat mutasi telah dikosongkan total secara online.');
  };

  const handleOpenEditProfileModal = () => {
    setSettingsModalTab('profile');
    setIsSettingsModalOpen(true);
  };

  const handleOpenSettingsModal = (tab: 'profile' | 'security' | 'data' = 'data') => {
    setSettingsModalTab(tab);
    setIsSettingsModalOpen(true);
  };

  const handleDataRestored = (
    newItems: ClothingItem[],
    newTransactions: StockTransaction[],
    newSettings: StoreSettings
  ) => {
    setItems(newItems);
    setTransactions(newTransactions);
    setSettings(newSettings);
    saveStoredItems(newItems);
    saveStoredTransactions(newTransactions);
    saveStoredSettings(newSettings);

    // Sync all restored items to cloud online
    newItems.forEach((it) => saveItemOnline(it, currentOwnerEmail));
    newTransactions.forEach((tx) => saveTransactionOnline(tx, currentOwnerEmail));
    saveSettingsOnline(newSettings).catch(console.error);

    setToastMessage('Data toko berhasil dipulihkan dan disinkronkan ke cloud online.');
  };

  // Quick Action Triggers
  const handleOpenMutationWithItem = (item: ClothingItem) => {
    setMutationTargetItem(item);
    setIsMutationModalOpen(true);
  };

  const handleExportCsv = () => {
    if (activeTab === 'recap') {
      exportRecapToCsv(transactions, settings.storeName);
    } else {
      exportInventoryToCsv(items, settings.storeName);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleLockSession = () => {
    setIsUnlocked(false);
    setSessionUnlocked(false);
    signOut(auth).catch(() => {});
  };

  const handleUnlockSession = (ownerEmail?: string) => {
    if (ownerEmail) {
      setCurrentOwnerEmail(ownerEmail);
    }
    setIsUnlocked(true);
    setSessionUnlocked(true);
  };

  // If private lock is active and user hasn't unlocked yet, show private lock screen
  if (!isUnlocked) {
    return <PrivateAccessLock settings={settings} onUnlock={handleUnlockSession} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors relative">
      {/* Toast Notification for Real-Time Stock Updates */}
      {toastMessage && (
        <div className="no-print fixed bottom-6 right-4 sm:right-6 z-50 max-w-md bg-slate-900 text-white dark:bg-emerald-950 dark:text-emerald-100 border border-slate-700 dark:border-emerald-800 rounded-2xl p-3.5 shadow-2xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs leading-relaxed">
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-0.5 shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Navigation Bar with Online Status & Owner Access Badge */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMutationModal={() => {
          setMutationTargetItem(null);
          setIsMutationModalOpen(true);
        }}
        onOpenSettingsModal={() => handleOpenSettingsModal('data')}
        onOpenEditProfileModal={handleOpenEditProfileModal}
        onLockAccess={handleLockSession}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        settings={settings}
        isOnlineSyncActive={isOnlineSyncActive}
        ownerEmail={currentOwnerEmail}
      />

      {/* Main Content Area */}
      <main className="no-print flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            items={items}
            transactions={transactions}
            settings={settings}
            onNavigateToInventory={() => setActiveTab('inventory')}
            onNavigateToRecap={() => setActiveTab('recap')}
            onOpenAddItemModal={() => {
              setEditingItem(null);
              setIsItemModalOpen(true);
            }}
            onOpenMutationWithItem={handleOpenMutationWithItem}
            onQuickAdjustStock={handleQuickAdjustStock}
            onExportCsv={handleExportCsv}
            onPrintReport={handlePrintReport}
            onOpenEditProfile={handleOpenEditProfileModal}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            items={items}
            onOpenAddItemModal={() => {
              setEditingItem(null);
              setIsItemModalOpen(true);
            }}
            onEditItem={(item) => {
              setEditingItem(item);
              setIsItemModalOpen(true);
            }}
            onDeleteItem={handleDeleteItem}
            onOpenMutationWithItem={handleOpenMutationWithItem}
            onQuickAdjustStock={handleQuickAdjustStock}
            onExportCsv={handleExportCsv}
            onPrintReport={handlePrintReport}
          />
        )}

        {activeTab === 'recap' && (
          <RecapTransactionsView
            transactions={transactions}
            items={items}
            onOpenMutationModal={() => {
              setMutationTargetItem(null);
              setIsMutationModalOpen(true);
            }}
            onSaveMutation={handleSaveMutation}
            onExportCsv={handleExportCsv}
            onPrintReport={handlePrintReport}
          />
        )}
      </main>

      {/* Printable Sheet for Physical Records */}
      <div className="hidden print:block">
        <PrintRecapSheet
          items={items}
          settings={settings}
        />
      </div>

      {/* Item Form Modal (Add / Edit) */}
      <ItemFormModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        editingItem={editingItem}
      />

      {/* Stock Mutation Modal (Barang Masuk / Keluar / Penyesuaian) */}
      <StockMutationModal
        isOpen={isMutationModalOpen}
        onClose={() => {
          setIsMutationModalOpen(false);
          setMutationTargetItem(null);
        }}
        onSaveMutation={handleSaveMutation}
        items={items}
        preselectedItem={mutationTargetItem}
      />

      {/* Store Settings & Data Management Modal */}
      <StoreSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        items={items}
        transactions={transactions}
        onDataRestored={handleDataRestored}
        onClearAllStock={handleClearAllStock}
        onClearAllTransactions={handleClearAllTransactions}
        onClearAllData={handleClearAllData}
        initialTab={settingsModalTab}
      />
    </div>
  );
}
