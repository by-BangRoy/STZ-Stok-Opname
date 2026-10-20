import React, { useState, useMemo } from 'react';
import { ClothingItem } from '../types/inventory';
import { formatDateTime } from '../utils/formatters';
import { 
  PlusCircle, 
  Search, 
  FileSpreadsheet, 
  Printer, 
  Edit3, 
  Trash2, 
  ArrowLeftRight, 
  AlertTriangle, 
  Tag, 
  LayoutGrid, 
  ListFilter,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface InventoryViewProps {
  items: ClothingItem[];
  onOpenAddItemModal: () => void;
  onEditItem: (item: ClothingItem) => void;
  onDeleteItem: (itemId: string) => void;
  onOpenMutationWithItem: (item: ClothingItem) => void;
  onQuickAdjustStock?: (itemId: string, delta: number, note?: string) => void;
  onExportCsv: () => void;
  onPrintReport: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  items,
  onOpenAddItemModal,
  onEditItem,
  onDeleteItem,
  onOpenMutationWithItem,
  onQuickAdjustStock,
  onExportCsv,
  onPrintReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState<'ALL' | 'SAFE' | 'LOW' | 'EMPTY'>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'stock_asc' | 'stock_desc' | 'date'>('name');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Delete confirmation modal state
  const [itemToDelete, setItemToDelete] = useState<ClothingItem | null>(null);

  // Filtering & Sorting
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Search term check
        const query = searchTerm.toLowerCase();
        const matchesSearch =
          item.name.toLowerCase().includes(query) ||
          item.color.toLowerCase().includes(query) ||
          item.size.toLowerCase().includes(query);

        if (!matchesSearch) return false;

        // Status check
        if (stockStatusFilter === 'EMPTY' && item.currentStock > 0) return false;
        if (stockStatusFilter === 'LOW' && (item.currentStock > item.minStock || item.currentStock <= 0)) return false;
        if (stockStatusFilter === 'SAFE' && item.currentStock <= item.minStock) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'stock_asc') return a.currentStock - b.currentStock;
        if (sortBy === 'stock_desc') return b.currentStock - a.currentStock;
        if (sortBy === 'date') {
          return (b.updatedAt || '').localeCompare(a.updatedAt || '');
        }
        return 0;
      });
  }, [items, searchTerm, stockStatusFilter, sortBy]);

  const totalFilteredPcs = filteredItems.reduce((acc, it) => acc + it.currentStock, 0);

  return (
    <div className="space-y-5">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
            <span>Daftar Stok Pakaian</span>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {filteredItems.length} Model · {totalFilteredPcs} Pcs (≈ {(totalFilteredPcs / 12).toFixed(1).replace('.', ',')} Lusin)
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola katalog busana, varian ukuran, warna, dan status ketersediaan unit.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenAddItemModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Pakaian Baru</span>
          </button>
          <button
            type="button"
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-medium transition-all cursor-pointer"
            title="Ekspor data inventaris ke format CSV/Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>CSV</span>
          </button>
          <button
            type="button"
            onClick={onPrintReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-medium transition-all cursor-pointer"
            title="Cetak lembar rekap stok untuk audit"
          >
            <Printer className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama pakaian, warna, ukuran..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Stock Condition Filter */}
          <div className="relative">
            <select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="ALL">Semua Kondisi Stok</option>
              <option value="SAFE">Stok Aman (Di Atas Batas Min)</option>
              <option value="LOW">Stok Menipis (Di Bawah Batas Min)</option>
              <option value="EMPTY">Stok Habis (0 Pcs)</option>
            </select>
          </div>

          {/* Sort By & View Toggle */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="name">Urut: Nama (A-Z)</option>
              <option value="stock_desc">Urut: Stok Terbanyak</option>
              <option value="stock_asc">Urut: Stok Tersedikit</option>
              <option value="date">Urut: Terakhir Diperbarui</option>
            </select>

            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 bg-slate-50 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Tampilan Tabel"
              >
                <ListFilter className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Tampilan Grid Kartu"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Item List Display */}
      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center">
          <Tag className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Tidak ada pakaian yang cocok dengan filter
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian, atau klik tombol di bawah untuk menambahkan item pakaian baru.
          </p>
          <button
            type="button"
            onClick={onOpenAddItemModal}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Pakaian Baru</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW (Categories and Prices Removed) */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Nama Pakaian</th>
                  <th className="py-3 px-4">Warna &amp; Size</th>
                  <th className="py-3 px-4 text-center">Stok (Pcs / Lusin)</th>
                  <th className="py-3 px-4 text-center">Batas Min</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.map((item, idx) => {
                  const isOutOfStock = item.currentStock <= 0;
                  const isLowStock = !isOutOfStock && item.currentStock <= item.minStock;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Index */}
                      <td className="py-3 px-4 text-center font-mono text-slate-400 text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {item.name}
                        </div>
                        {item.note && (
                          <div className="text-[10px] text-slate-500 italic mt-0.5 line-clamp-1">
                            {item.note}
                          </div>
                        )}
                      </td>

                      {/* Color & Size */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {item.color}
                        </div>
                        <div className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          Size: {item.size}
                        </div>
                      </td>

                      {/* Stock Quantity (Pcs & Lusin) + Quick Adjuster */}
                      <td className="py-3 px-4 text-center">
                        <div
                          className={`font-mono font-extrabold text-sm ${
                            isOutOfStock
                              ? 'text-rose-600 dark:text-rose-400'
                              : isLowStock
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {item.currentStock} Pcs
                        </div>
                        <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          ≈ {(item.currentStock / 12).toFixed(1).replace('.', ',')} Lusin
                        </div>

                        {/* Quick Stepper Buttons */}
                        {onQuickAdjustStock && (
                          <div className="flex items-center justify-center gap-1 mt-2">
                            <button
                              type="button"
                              disabled={item.currentStock <= 0}
                              onClick={() => onQuickAdjustStock(item.id, -1, 'Pengurangan Cepat (-1 Pcs)')}
                              className="h-5 px-1.5 rounded bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-[10px] disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
                              title="Kurangi 1 Pcs (Barang Keluar)"
                            >
                              -1
                            </button>
                            <button
                              type="button"
                              disabled={item.currentStock < 12}
                              onClick={() => onQuickAdjustStock(item.id, -12, 'Pengurangan Cepat (-1 Lusin)')}
                              className="h-5 px-1.5 rounded bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-[9px] font-mono disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
                              title="Kurangi 1 Lusin (-12 Pcs)"
                            >
                              -1L
                            </button>
                            <button
                              type="button"
                              onClick={() => onQuickAdjustStock(item.id, 1, 'Penambahan Cepat (+1 Pcs)')}
                              className="h-5 px-1.5 rounded bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] cursor-pointer transition-colors"
                              title="Tambah 1 Pcs (Barang Masuk)"
                            >
                              +1
                            </button>
                            <button
                              type="button"
                              onClick={() => onQuickAdjustStock(item.id, 12, 'Penambahan Cepat (+1 Lusin)')}
                              className="h-5 px-1.5 rounded bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-[9px] font-mono cursor-pointer transition-colors"
                              title="Tambah 1 Lusin (+12 Pcs)"
                            >
                              +1L
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Min Stock */}
                      <td className="py-3 px-4 text-center font-mono text-slate-500 text-[11px]">
                        {item.minStock} Pcs
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4 text-center">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                            <XCircle className="w-3 h-3" />
                            Habis
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                            <AlertTriangle className="w-3 h-3" />
                            Menipis
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            Aman
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenMutationWithItem(item)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                            title="Mutasi Keluar/Masuk Barang Ini"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditItem(item)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                            title="Edit Data Pakaian"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setItemToDelete(item)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/50 transition-colors cursor-pointer"
                            title="Hapus Dari Inventaris"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW (Categories and Prices Removed) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const isOutOfStock = item.currentStock <= 0;
            const isLowStock = !isOutOfStock && item.currentStock <= item.minStock;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-emerald-500/50 transition-all"
              >
                <div>
                  <div className="flex items-center justify-end">
                    {isOutOfStock ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                        Habis
                      </span>
                    ) : isLowStock ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                        Menipis
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        Aman
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-2 line-clamp-1">
                    {item.name}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                      Size: {item.size}
                    </span>
                    <span className="text-slate-500 font-medium">{item.color}</span>
                  </div>

                  {/* Stock counter box + Quick Buttons */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400">Stok Tersedia</div>
                        <div
                          className={`text-xl font-mono font-extrabold ${
                            isOutOfStock
                              ? 'text-rose-600 dark:text-rose-400'
                              : isLowStock
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {item.currentStock} Pcs
                        </div>
                        <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                          ≈ {(item.currentStock / 12).toFixed(1).replace('.', ',')} Lusin
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">Batas Min</div>
                        <div className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                          {item.minStock} Pcs
                        </div>
                      </div>
                    </div>

                    {/* Quick Stepper Buttons on Card */}
                    {onQuickAdjustStock && (
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-1 text-[11px]">
                        <span className="text-[10px] text-slate-400 font-medium">Ubah Cepat:</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={item.currentStock <= 0}
                            onClick={() => onQuickAdjustStock(item.id, -1, 'Pengurangan Cepat (-1 Pcs)')}
                            className="px-2 py-0.5 rounded bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-[10px] disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            title="Kurangi 1 Pcs"
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            disabled={item.currentStock < 12}
                            onClick={() => onQuickAdjustStock(item.id, -12, 'Pengurangan Cepat (-1 Lusin)')}
                            className="px-2 py-0.5 rounded bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-[9px] font-mono disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            title="Kurangi 1 Lusin (-12 Pcs)"
                          >
                            -1L
                          </button>
                          <button
                            type="button"
                            onClick={() => onQuickAdjustStock(item.id, 1, 'Penambahan Cepat (+1 Pcs)')}
                            className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] cursor-pointer transition-colors"
                            title="Tambah 1 Pcs"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            onClick={() => onQuickAdjustStock(item.id, 12, 'Penambahan Cepat (+1 Lusin)')}
                            className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-[9px] font-mono cursor-pointer transition-colors"
                            title="Tambah 1 Lusin (+12 Pcs)"
                          >
                            +1L
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenMutationWithItem(item)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span>Mutasi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditItem(item)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Edit Item"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemToDelete(item)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/50 transition-colors cursor-pointer"
                    title="Hapus Item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Hapus Pakaian Ini?
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus <strong className="text-slate-800 dark:text-slate-200">{itemToDelete.name}</strong> ({itemToDelete.color} - Size {itemToDelete.size}) dari daftar stok?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteItem(itemToDelete.id);
                  setItemToDelete(null);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
