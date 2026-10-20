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
  Package,
  Sparkles,
  RotateCcw
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
  
  // Kolom Lusin (kosongan saat mulai agar bisa diinput manual) dan Kolom Pcs
  const [quantityLusin, setQuantityLusin] = useState<string>('');
  const [quantityPcs, setQuantityPcs] = useState<string>('');
  
  const [note, setNote] = useState('');
  const [party, setParty] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (preselectedItem) {
      setSelectedItemId(preselectedItem.id);
    } else if (items.length > 0 && !selectedItemId) {
      setSelectedItemId(items[0].id);
    }
    // Kolom satuan lusin dan pcs kosongan saat buka modal
    setQuantityLusin('');
    setQuantityPcs('');
    setNote('');
    setParty('');
    setError('');
  }, [preselectedItem, isOpen, items]);

  if (!isOpen) return null;

  const currentItem = items.find((it) => it.id === selectedItemId);
  const currentStock = currentItem ? currentItem.currentStock : 0;

  // Handle manual input in Kolom Satuan Lusin -> Otomatis update Kolom Pcs
  const handleLusinChange = (valStr: string) => {
    // izinkan angka dan titik/koma desimal
    const cleaned = valStr.replace(/[^0-9.,]/g, '').replace(',', '.');
    setQuantityLusin(cleaned);

    if (cleaned === '' || cleaned === '.') {
      setQuantityPcs('');
      return;
    }

    const numericLusin = parseFloat(cleaned);
    if (!isNaN(numericLusin)) {
      // 1 Lusin = 12 Pcs
      const calculatedPcs = Math.round(numericLusin * 12);
      setQuantityPcs(String(calculatedPcs));
    }
  };

  // Handle manual input in Kolom Satuan Pcs -> Otomatis update Kolom Lusin
  const handlePcsChange = (valStr: string) => {
    const cleaned = valStr.replace(/[^0-9]/g, '');
    setQuantityPcs(cleaned);

    if (cleaned === '') {
      setQuantityLusin('');
      return;
    }

    const numericPcs = parseInt(cleaned, 10);
    if (!isNaN(numericPcs)) {
      const calculatedLusin = numericPcs / 12;
      const formatted = Number.isInteger(calculatedLusin)
        ? String(calculatedLusin)
        : String(calculatedLusin.toFixed(2)).replace(/\.?0+$/, '');
      setQuantityLusin(formatted);
    }
  };

  // Preset button shortcuts
  const handleSetLusinPreset = (lusinAmount: number) => {
    setQuantityLusin(String(lusinAmount));
    setQuantityPcs(String(lusinAmount * 12));
  };

  const handleClear = () => {
    setQuantityLusin('');
    setQuantityPcs('');
  };

  // Compute preview of new stock
  const numericQty = quantityPcs === '' ? 0 : parseInt(quantityPcs, 10) || 0;
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

    const qty = Number(quantityPcs);
    if (qty <= 0 && type !== 'ADJUSTMENT') {
      setError('Masukkan jumlah mutasi (Lusin atau Pcs) lebih dari 0!');
      return;
    }

    if (type === 'OUT' && qty > currentStock) {
      const lusinStr = (qty / 12).toFixed(1).replace('.', ',');
      const stockLusinStr = (currentStock / 12).toFixed(1).replace('.', ',');
      setError(`Jumlah barang keluar (${qty} Pcs / ${lusinStr} Lusin) melebihi stok yang tersedia (${currentStock} Pcs / ${stockLusinStr} Lusin)!`);
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
      quantityLusin: Number((diffQty / 12).toFixed(2)),
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
                Input manual satuan Lusin atau Pcs dengan update otomatis real-time
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
                  {it.name} ({it.color} - Size {it.size}) · Sisa: {it.currentStock} Pcs (≈ {(it.currentStock / 12).toFixed(1).replace('.', ',')} Lsn)
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
                  <span className="text-xs font-normal text-slate-400 ml-1">
                    (≈ {(currentStock / 12).toFixed(1).replace('.', ',')} Lusin)
                  </span>
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
                  <span className="text-xs font-normal opacity-80 ml-1">
                    (≈ {(computedNewStock / 12).toFixed(1).replace('.', ',')} Lsn)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Dual Inputs: Kolom Satuan Lusin (Kosongan & Manual) & Kolom Pcs (Sinkron Otomatis) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-800 dark:text-slate-200">
                {type === 'ADJUSTMENT' ? 'Jumlah Stok Fisik (Opname)' : 'Jumlah Mutasi Stok'}
              </label>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Otomatis Sinkron: 1 Lusin = 12 Pcs</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Kolom Satuan Lusin Kosongan - Bisa Input Manual */}
              <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/80 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                    <span>Kolom Satuan Lusin</span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-200/90 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100">
                      Input Manual
                    </span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-800 dark:text-amber-300">
                    Lusin
                  </span>
                </div>
                <input
                  type="text"
                  inputMode="decimal"
                  value={quantityLusin}
                  onChange={(e) => handleLusinChange(e.target.value)}
                  placeholder="Ketik Lusin (misal 1, 2, 0.5)..."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 font-mono font-bold text-base text-amber-900 dark:text-amber-100 focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-400 placeholder:font-normal placeholder:text-xs"
                />
                <div className="text-[10px] text-amber-800/80 dark:text-amber-400 mt-1 flex items-center justify-between">
                  <span>
                    {quantityLusin !== '' && !isNaN(parseFloat(quantityLusin))
                      ? `≈ ${Math.round(parseFloat(quantityLusin) * 12)} Pcs`
                      : 'Bisa angka bulat / desimal'}
                  </span>
                  <span className="font-mono text-[9px]">1 Lsn = 12 Pcs</span>
                </div>
              </div>

              {/* Kolom Jumlah Pcs - Otomatis Terupdate & Bisa Input Manual */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span>Jumlah Satuan (Pcs)</span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      Biji / Pcs
                    </span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-500">
                    Pcs
                  </span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={quantityPcs}
                  onChange={(e) => handlePcsChange(e.target.value)}
                  placeholder="Ketik Pcs (misal 12, 24)..."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-base text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all placeholder:text-slate-400 placeholder:font-normal placeholder:text-xs"
                />
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                  <span>
                    {numericQty > 0
                      ? `≈ ${(numericQty / 12).toFixed(1).replace('.', ',')} Lusin (${Math.floor(numericQty / 12)} Lsn ${numericQty % 12 > 0 ? `${numericQty % 12} Pcs` : ''})`
                      : 'Otomatis update dari lusin'}
                  </span>
                  <span className="font-mono text-[9px]">Pcs</span>
                </div>
              </div>
            </div>

            {/* Quick Lusin Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-medium mr-1">Tombol Cepat:</span>
              {[1, 2, 5, 10].map((lsn) => (
                <button
                  key={lsn}
                  type="button"
                  onClick={() => handleSetLusinPreset(lsn)}
                  className="px-2.5 py-1 rounded-lg bg-amber-100/80 hover:bg-amber-200 text-amber-950 dark:bg-amber-950/70 dark:hover:bg-amber-900 dark:text-amber-200 text-[10px] font-mono font-bold transition-colors cursor-pointer border border-amber-300/60 dark:border-amber-800"
                >
                  +{lsn} Lsn ({lsn * 12} Pcs)
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 text-[10px] font-semibold transition-colors cursor-pointer ml-auto"
                title="Kosongkan kolom lusin dan pcs"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Kosongkan</span>
              </button>
            </div>
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
              placeholder="Contoh: Pesanan offline, barang masuk lusinan, promo paket hemat..."
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
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan &amp; Update Stok</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
