import React, { useState, useEffect } from 'react';
import { ClothingItem, StockTransaction } from '../types/inventory';
import { 
  X, 
  ArrowLeftRight, 
  ArrowDownLeft, 
  ArrowUpRight, 
  SlidersHorizontal, 
  AlertCircle, 
  CheckCircle2,
  Package
} from 'lucide-react';

interface StockMutationModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ClothingItem[];
  preselectedItem: ClothingItem | null;
  onSaveMutation: (transaction: StockTransaction, updatedItem: ClothingItem) => void;
}

export const StockMutationModal: React.FC<StockMutationModalProps> = ({
  isOpen,
  onClose,
  items,
  preselectedItem,
  onSaveMutation,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [type, setType] = useState<'IN' | 'OUT' | 'ADJUSTMENT'>('OUT');
  const [quantity, setQuantity] = useState<string>('1');
  const [note, setNote] = useState('');
  const [party, setParty] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (preselectedItem) {
      setSelectedItemId(preselectedItem.id);
    } else if (items.length > 0 && !selectedItemId) {
      setSelectedItemId(items[0].id);
    }
    setQuantity('1');
    setNote('');
    setParty('');
    setError('');
  }, [preselectedItem, isOpen, items]);

  if (!isOpen) return null;

  const currentItem = items.find((it) => it.id === selectedItemId);
  const currentStock = currentItem ? currentItem.currentStock : 0;

  // Compute preview of new stock
  const numericQty = quantity === '' ? 0 : parseInt(quantity, 10) || 0;
  let computedNewStock = currentStock;
  if (type === 'IN') {
    computedNewStock = currentStock + numericQty;
  } else if (type === 'OUT') {
    computedNewStock = Math.max(0, currentStock - numericQty);
  } else if (type === 'ADJUSTMENT') {
    computedNewStock = numericQty;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem) {
      setError('Pilih pakaian yang ingin dimutasi terlebih dahulu!');
      return;
    }

    const qty = Number(quantity);
    if (qty <= 0 && type !== 'ADJUSTMENT') {
      setError('Jumlah mutasi harus lebih dari 0!');
      return;
    }

    if (type === 'OUT' && qty > currentStock) {
      setError(`Jumlah barang keluar (${qty} Pcs) melebihi stok yang tersedia (${currentStock} Pcs)!`);
      return;
    }

    let diffQty = qty;
    if (type === 'ADJUSTMENT') {
      diffQty = Math.abs(qty - currentStock);
    }

    const transaction: StockTransaction = {
      id: 'mut-' + Date.now(),
      itemId: currentItem.id,
      itemName: currentItem.name,
      color: currentItem.color,
      size: currentItem.size,
      type,
      quantity: diffQty,
      previousStock: currentStock,
      newStock: computedNewStock,
      note: note.trim() || (type === 'IN' ? 'Barang Masuk Restock' : type === 'OUT' ? 'Penjualan / Barang Keluar' : 'Audit Opname Fisik'),
      recipientOrSupplier: party.trim() || (type === 'IN' ? 'Supplier' : 'Pelanggan'),
      timestamp: new Date().toISOString(),
    };

    const updatedItem: ClothingItem = {
      ...currentItem,
      currentStock: computedNewStock,
      updatedAt: new Date().toISOString(),
    };

    onSaveMutation(transaction, updatedItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Catat Mutasi Stok Pakaian
              </h3>
              <p className="text-xs text-slate-500">
                Pencatatan barang masuk, keluar, atau koreksi opname
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Mutation Type Segment */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Jenis Mutasi
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('OUT')}
                className={`py-2 px-3 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  type === 'OUT'
                    ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-300 font-bold shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Barang Keluar (OUT)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('IN')}
                className={`py-2 px-3 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  type === 'IN'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300 font-bold shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Barang Masuk (IN)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('ADJUSTMENT')}
                className={`py-2 px-3 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  type === 'ADJUSTMENT'
                    ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-300 font-bold shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Koreksi Fisik</span>
              </button>
            </div>
          </div>

          {/* Select Item */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Pilih Model Pakaian
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
            >
              {items.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.name} ({it.color} - Size {it.size}) · Sisa: {it.currentStock} Pcs
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock Preview & Impact */}
          {currentItem && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-500">Stok Saat Ini</div>
                <div className="text-base font-bold font-mono text-slate-800 dark:text-slate-200">
                  {currentStock} Pcs
                </div>
              </div>
              <div className="text-slate-400 font-mono text-sm">&rarr;</div>
              <div className="text-right">
                <div className="text-[11px] text-slate-500">Hasil Stok Akhir</div>
                <div
                  className={`text-base font-bold font-mono ${
                    computedNewStock <= 0
                      ? 'text-rose-600'
                      : computedNewStock <= currentItem.minStock
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {computedNewStock} Pcs
                </div>
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {type === 'ADJUSTMENT' ? 'Jumlah Stok Fisik Sebenarnya (Hasil Opname)' : 'Jumlah Mutasi (Pcs)'}
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Ketik jumlah..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400 placeholder:font-normal"
            />
            {numericQty > 0 && (
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                ≈ {(numericQty / 12).toFixed(1).replace('.', ',')} Lusin ({Math.floor(numericQty / 12)} Lsn {numericQty % 12 > 0 ? `${numericQty % 12} Pcs` : ''})
              </div>
            )}
          </div>

          {/* Recipient or Supplier */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {type === 'IN' ? 'Nama Supplier / Asal Barang' : 'Nama Pelanggan / Tujuan Barang'}
            </label>
            <input
              type="text"
              value={party}
              onChange={(e) => setParty(e.target.value)}
              placeholder={type === 'IN' ? 'Contoh: Supplier Konveksi Bandung...' : 'Contoh: Pelanggan Butik, Bazar Mall...'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Note / Reason */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Keterangan / Catatan Transaksi
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Pesanan offline, barang rusak, promo paket hemat..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
            >
              Simpan Mutasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
