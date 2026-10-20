import React, { useState, useMemo } from 'react';
import { ClothingItem, StockTransaction } from '../types/inventory';
import { formatDateTime } from '../utils/formatters';
import { 
  ArrowLeftRight, 
  ArrowDownLeft, 
  ArrowUpRight, 
  SlidersHorizontal, 
  Search, 
  FileSpreadsheet, 
  Printer, 
  PlusCircle, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Zap
} from 'lucide-react';

interface RecapTransactionsViewProps {
  transactions: StockTransaction[];
  items?: ClothingItem[];
  onOpenMutationModal: () => void;
  onSaveMutation?: (transaction: StockTransaction, updatedItem: ClothingItem) => void;
  onExportCsv: () => void;
  onPrintReport: () => void;
}

export const RecapTransactionsView: React.FC<RecapTransactionsViewProps> = ({
  transactions,
  items = [],
  onOpenMutationModal,
  onSaveMutation,
  onExportCsv,
  onPrintReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'IN' | 'OUT' | 'ADJUSTMENT'>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Quick Inline Lusin Mutation Bar state
  const [quickItemId, setQuickItemId] = useState<string>(items[0]?.id || '');
  const [quickType, setQuickType] = useState<'IN' | 'OUT'>('OUT');
  const [quickLusin, setQuickLusin] = useState<string>(''); // Kolom satuan lusin kosongan
  const [quickPcs, setQuickPcs] = useState<string>('');
  const [quickParty, setQuickParty] = useState('');
  const [quickError, setQuickError] = useState('');
  const [quickSuccess, setQuickSuccess] = useState('');

  // Synchronize when items change
  React.useEffect(() => {
    if (items.length > 0 && !quickItemId) {
      setQuickItemId(items[0].id);
    }
  }, [items, quickItemId]);

  const selectedQuickItem = items.find((it) => it.id === quickItemId);

  // Handle manual input in quick lusin column -> auto update pcs
  const handleQuickLusinChange = (valStr: string) => {
    const cleaned = valStr.replace(/[^0-9.,]/g, '').replace(',', '.');
    setQuickLusin(cleaned);
    setQuickError('');
    setQuickSuccess('');

    if (cleaned === '' || cleaned === '.') {
      setQuickPcs('');
      return;
    }

    const numericLusin = parseFloat(cleaned);
    if (!isNaN(numericLusin)) {
      setQuickPcs(String(Math.round(numericLusin * 12)));
    }
  };

  // Handle manual input in quick pcs column -> auto update lusin
  const handleQuickPcsChange = (valStr: string) => {
    const cleaned = valStr.replace(/[^0-9]/g, '');
    setQuickPcs(cleaned);
    setQuickError('');
    setQuickSuccess('');

    if (cleaned === '') {
      setQuickLusin('');
      return;
    }

    const numericPcs = parseInt(cleaned, 10);
    if (!isNaN(numericPcs)) {
      const lusinVal = numericPcs / 12;
      const formatted = Number.isInteger(lusinVal)
        ? String(lusinVal)
        : String(lusinVal.toFixed(2)).replace(/\.?0+$/, '');
      setQuickLusin(formatted);
    }
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuickItem || !onSaveMutation) return;

    const qty = Number(quickPcs);
    if (qty <= 0) {
      setQuickError('Isi kolom Lusin atau Pcs lebih dari 0!');
      return;
    }

    if (quickType === 'OUT' && qty > selectedQuickItem.currentStock) {
      setQuickError(
        `Jumlah keluar (${qty} Pcs / ${(qty / 12).toFixed(1).replace('.', ',')} Lsn) melebihi stok yang ada (${selectedQuickItem.currentStock} Pcs)!`
      );
      return;
    }

    const currentStock = selectedQuickItem.currentStock;
    const computedNewStock = quickType === 'IN' ? currentStock + qty : Math.max(0, currentStock - qty);

    const transaction: StockTransaction = {
      id: 'mut-quick-' + Date.now(),
      itemId: selectedQuickItem.id,
      itemName: selectedQuickItem.name,
      color: selectedQuickItem.color,
      size: selectedQuickItem.size,
      type: quickType,
      quantity: qty,
      quantityLusin: Number((qty / 12).toFixed(2)),
      previousStock: currentStock,
      newStock: computedNewStock,
      note: quickType === 'IN' ? 'Barang Masuk Satuan Lusin' : 'Barang Keluar Satuan Lusin',
      recipientOrSupplier: quickParty.trim() || (quickType === 'IN' ? 'Supplier' : 'Pelanggan'),
      timestamp: new Date().toISOString(),
    };

    const updatedItem: ClothingItem = {
      ...selectedQuickItem,
      currentStock: computedNewStock,
      updatedAt: new Date().toISOString(),
    };

    onSaveMutation(transaction, updatedItem);

    // Reset kolom kosongan
    setQuickLusin('');
    setQuickPcs('');
    setQuickParty('');
    setQuickSuccess(
      `Berhasil update otomatis: ${selectedQuickItem.name} ${quickType === 'OUT' ? '-' : '+'}${qty} Pcs (${(qty / 12).toFixed(1).replace('.', ',')} Lusin). Sisa stok: ${computedNewStock} Pcs.`
    );
    setTimeout(() => setQuickSuccess(''), 4000);
  };

  // Calculations for summary stats
  const totalInUnits = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'IN')
      .reduce((sum, tx) => sum + tx.quantity, 0);
  }, [transactions]);

  const totalOutUnits = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'OUT')
      .reduce((sum, tx) => sum + tx.quantity, 0);
  }, [transactions]);

  // Filtered list
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Type filter
        if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false;

        // Search query
        const query = searchTerm.toLowerCase();
        return (
          tx.itemName.toLowerCase().includes(query) ||
          tx.color.toLowerCase().includes(query) ||
          tx.size.toLowerCase().includes(query) ||
          (tx.recipientOrSupplier || '').toLowerCase().includes(query) ||
          (tx.note || '').toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [transactions, typeFilter, searchTerm, sortOrder]);

  return (
    <div className="space-y-5">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Rekap Riwayat Mutasi Stok</span>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {filteredTransactions.length} Catatan
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log audit pergerakan keluar, masuk, dan koreksi stok pakaian dengan kolom satuan Lusin &amp; Pcs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenMutationModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Catat Mutasi Baru</span>
          </button>
          <button
            type="button"
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-medium transition-all cursor-pointer"
            title="Ekspor riwayat mutasi ke format CSV/Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor CSV</span>
          </button>
          <button
            type="button"
            onClick={onPrintReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-medium transition-all cursor-pointer"
            title="Cetak rekap audit mutasi"
          >
            <Printer className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Cetak Rekap</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Mini Cards (Masuk & Keluar) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Total Barang Masuk (IN)</div>
            <div className="text-xl font-bold font-mono text-amber-700 dark:text-amber-300 mt-0.5">
              +{totalInUnits.toLocaleString('id-ID')} Pcs
            </div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono mt-0.5 font-semibold">
              ≈ {(totalInUnits / 12).toFixed(1).replace('.', ',')} Lusin ({Math.floor(totalInUnits / 12)} Lsn {totalInUnits % 12 > 0 ? `${totalInUnits % 12} Pcs` : ''})
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Total Barang Keluar (OUT)</div>
            <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5">
              -{totalOutUnits.toLocaleString('id-ID')} Pcs
            </div>
            <div className="text-[10px] text-rose-500 dark:text-rose-400 font-mono mt-0.5 font-semibold">
              ≈ {(totalOutUnits / 12).toFixed(1).replace('.', ',')} Lusin ({Math.floor(totalOutUnits / 12)} Lsn {totalOutUnits % 12 > 0 ? `${totalOutUnits % 12} Pcs` : ''})
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* QUICK LUSIN MUTATION BAR (Kolom Satuan Lusin Kosongan - Input Manual & Update Otomatis) */}
      {items.length > 0 && onSaveMutation && (
        <div className="bg-gradient-to-r from-amber-50/90 via-amber-100/50 to-emerald-50/70 dark:from-slate-900 dark:via-amber-950/30 dark:to-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-amber-950 dark:text-amber-100 flex items-center gap-1.5">
                  <span>Input Cepat Mutasi Satuan Lusin</span>
                  <span className="text-[10px] font-normal px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800">
                    Otomatis Update Stok
                  </span>
                </h3>
                <p className="text-[11px] text-amber-800/80 dark:text-slate-400">
                  Ketik manual pada kolom Lusin atau Pcs, keduanya saling sinkron dan otomatis memperbarui stok online.
                </p>
              </div>
            </div>
          </div>

          {quickSuccess && (
            <div className="mb-3 p-2.5 rounded-xl bg-emerald-100/90 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{quickSuccess}</span>
            </div>
          )}

          {quickError && (
            <div className="mb-3 p-2.5 rounded-xl bg-rose-100/90 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{quickError}</span>
            </div>
          )}

          <form onSubmit={handleQuickSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-xs">
            {/* Pakaian Dropdown */}
            <div className="sm:col-span-3">
              <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pilih Model Pakaian
              </label>
              <select
                value={quickItemId}
                onChange={(e) => setQuickItemId(e.target.value)}
                className="w-full px-2.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                {items.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.name} ({it.color} - {it.size}) · {it.currentStock} Pcs
                  </option>
                ))}
              </select>
            </div>

            {/* Tipe Mutasi */}
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Jenis
              </label>
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setQuickType('OUT')}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    quickType === 'OUT'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <ArrowUpRight className="w-3 h-3" />
                  <span>OUT</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuickType('IN')}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    quickType === 'IN'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <ArrowDownLeft className="w-3 h-3" />
                  <span>IN</span>
                </button>
              </div>
            </div>

            {/* Kolom Satuan Lusin (Kosongan - Manual) */}
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-amber-900 dark:text-amber-200 mb-1 flex items-center justify-between">
                <span>Kolom Lusin</span>
                <span className="text-[9px] font-mono text-amber-700 dark:text-amber-400">Manual</span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={quickLusin}
                onChange={(e) => handleQuickLusinChange(e.target.value)}
                placeholder="Kosong (Lusin)..."
                className="w-full px-2.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border-2 border-amber-300 dark:border-amber-700 font-mono font-bold text-amber-900 dark:text-amber-100 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Kolom Satuan Pcs (Otomatis Update) */}
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>Kolom Pcs</span>
                <span className="text-[9px] font-mono text-slate-400">Otomatis</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={quickPcs}
                onChange={(e) => handleQuickPcsChange(e.target.value)}
                placeholder="Pcs (Biji)..."
                className="w-full px-2.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Pihak Terkait */}
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pihak / Rekanan
              </label>
              <input
                type="text"
                value={quickParty}
                onChange={(e) => setQuickParty(e.target.value)}
                placeholder={quickType === 'IN' ? 'Supplier...' : 'Pelanggan...'}
                className="w-full px-2.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Submit Button */}
            <div className="sm:col-span-1 flex items-end">
              <button
                type="submit"
                className="w-full py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1"
                title="Simpan mutasi dan update stok otomatis"
              >
                <span>Simpan</span>
              </button>
            </div>
          </form>

          {/* Quick Presets for Lusin in the Bar */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-amber-200/60 dark:border-amber-900/40 text-[10px]">
            <span className="text-slate-500 dark:text-slate-400">Pilih Cepat Lusin:</span>
            {[1, 2, 3, 5, 10].map((lsn) => (
              <button
                key={lsn}
                type="button"
                onClick={() => {
                  setQuickLusin(String(lsn));
                  setQuickPcs(String(lsn * 12));
                }}
                className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800/80 hover:bg-amber-100 text-amber-900 dark:text-amber-200 font-mono font-bold cursor-pointer"
              >
                +{lsn} Lsn ({lsn * 12} Pcs)
              </button>
            ))}
            {(quickLusin || quickPcs) && (
              <button
                type="button"
                onClick={() => {
                  setQuickLusin('');
                  setQuickPcs('');
                }}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer ml-auto"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Kosongkan</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari pakaian, pihak, catatan..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="ALL">Semua Jenis Mutasi</option>
              <option value="IN">Hanya Barang Masuk (IN)</option>
              <option value="OUT">Hanya Barang Keluar (OUT)</option>
              <option value="ADJUSTMENT">Hanya Koreksi Stok (ADJUST)</option>
            </select>
          </div>

          {/* Sort order */}
          <div>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="desc">Urutan: Terbaru ke Terlama</option>
              <option value="asc">Urutan: Terlama ke Terbaru</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table with Kolom Satuan Lusin */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center">
          <ArrowLeftRight className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Tidak ada riwayat mutasi yang cocok
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Gunakan tombol catat mutasi atau input cepat di atas untuk mencatat barang keluar, masuk, atau audit fisik.
          </p>
          <button
            type="button"
            onClick={onOpenMutationModal}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Catat Mutasi Baru</span>
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Waktu &amp; Tanggal</th>
                  <th className="py-3 px-4">Tipe Mutasi</th>
                  <th className="py-3 px-4">Pakaian Terkait</th>
                  <th className="py-3 px-3 text-center">Jumlah (Pcs)</th>
                  <th className="py-3 px-3 text-center bg-amber-50/60 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 font-bold border-x border-amber-200/50 dark:border-amber-900/40">
                    Satuan Lusin
                  </th>
                  <th className="py-3 px-4 text-center">Perubahan Stok</th>
                  <th className="py-3 px-4">Pihak / Rekanan</th>
                  <th className="py-3 px-4">Catatan / Alasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTransactions.map((tx) => {
                  const isOut = tx.type === 'OUT';
                  const isAdjustment = tx.type === 'ADJUSTMENT';

                  const lusinVal = (tx.quantity / 12);
                  const lusinFormatted = (lusinVal).toFixed(1).replace('.', ',');
                  const fullLusin = Math.floor(tx.quantity / 12);
                  const remainderPcs = tx.quantity % 12;

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Timestamp */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono text-slate-800 dark:text-slate-200">
                          {formatDateTime(tx.timestamp)}
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                            <ArrowUpRight className="w-3 h-3" />
                            Barang Keluar
                          </span>
                        ) : isAdjustment ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                            <SlidersHorizontal className="w-3 h-3" />
                            Penyesuaian
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <ArrowDownLeft className="w-3 h-3" />
                            Barang Masuk
                          </span>
                        )}
                      </td>

                      {/* Item */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {tx.itemName}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>Warna: {tx.color}</span>
                          <span>•</span>
                          <span className="font-mono font-semibold">Size: {tx.size}</span>
                        </div>
                      </td>

                      {/* Quantity in Pcs */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`font-mono font-extrabold text-sm ${
                            isOut
                              ? 'text-rose-600 dark:text-rose-400'
                              : isAdjustment
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {isOut ? `-${tx.quantity}` : `+${tx.quantity}`} Pcs
                        </span>
                      </td>

                      {/* KOLOM SATUAN LUSIN */}
                      <td className="py-3 px-3 text-center whitespace-nowrap bg-amber-50/40 dark:bg-amber-950/10 border-x border-amber-200/40 dark:border-amber-900/30">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100/70 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-300/70 dark:border-amber-800 font-mono font-bold text-xs">
                          <span>{isOut ? '-' : '+'}{lusinFormatted}</span>
                          <span className="text-[9px] font-normal text-amber-700 dark:text-amber-300">Lusin</span>
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                          {fullLusin} Lsn {remainderPcs > 0 ? `+${remainderPcs} Pcs` : ''}
                        </div>
                      </td>

                      {/* Stock Change (Previous -> New) */}
                      <td className="py-3 px-4 text-center whitespace-nowrap font-mono text-[11px]">
                        <span className="text-slate-400">{tx.previousStock}</span>
                        <span className="text-slate-300 dark:text-slate-600 mx-1.5">&rarr;</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-bold">
                          {tx.newStock} Pcs
                        </strong>
                        <div className="text-[9px] text-slate-400 font-normal">
                          ≈ {(tx.newStock / 12).toFixed(1).replace('.', ',')} Lsn
                        </div>
                      </td>

                      {/* Party */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {tx.recipientOrSupplier || '-'}
                        </span>
                      </td>

                      {/* Note */}
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-xs">
                        <span className="line-clamp-2">{tx.note || '-'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
