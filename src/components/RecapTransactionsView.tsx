import React, { useState, useMemo } from 'react';
import { StockTransaction } from '../types/inventory';
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
  Calendar,
  Building,
  User,
  PackageCheck
} from 'lucide-react';

interface RecapTransactionsViewProps {
  transactions: StockTransaction[];
  onOpenMutationModal: () => void;
  onExportCsv: () => void;
  onPrintReport: () => void;
}

export const RecapTransactionsView: React.FC<RecapTransactionsViewProps> = ({
  transactions,
  onOpenMutationModal,
  onExportCsv,
  onPrintReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'IN' | 'OUT' | 'ADJUSTMENT'>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

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
            Log audit pergerakan keluar, masuk, dan koreksi stok pakaian secara transparan.
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
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              ≈ {(totalInUnits / 12).toFixed(1).replace('.', ',')} Lusin
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
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              ≈ {(totalOutUnits / 12).toFixed(1).replace('.', ',')} Lusin
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
      </div>

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

      {/* Transactions Table */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center">
          <ArrowLeftRight className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Tidak ada riwayat mutasi yang cocok
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Gunakan tombol catat mutasi untuk mencatat barang keluar, masuk, atau audit fisik.
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
                  <th className="py-3 px-4 text-center">Jumlah (Qty)</th>
                  <th className="py-3 px-4 text-center">Perubahan Stok</th>
                  <th className="py-3 px-4">Pihak / Rekanan</th>
                  <th className="py-3 px-4">Catatan / Alasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTransactions.map((tx) => {
                  const isOut = tx.type === 'OUT';
                  const isAdjustment = tx.type === 'ADJUSTMENT';

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

                      {/* Quantity */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
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

                      {/* Stock Change (Previous -> New) */}
                      <td className="py-3 px-4 text-center whitespace-nowrap font-mono text-[11px]">
                        <span className="text-slate-400">{tx.previousStock}</span>
                        <span className="text-slate-300 dark:text-slate-600 mx-1.5">&rarr;</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-bold">
                          {tx.newStock} Pcs
                        </strong>
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
