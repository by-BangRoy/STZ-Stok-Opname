import React from 'react';
import { ClothingItem, StockTransaction, StoreSettings } from '../types/inventory';
import { formatDateTime } from '../utils/formatters';
import { 
  Layers, 
  ArrowLeftRight, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertTriangle, 
  PlusCircle, 
  FileSpreadsheet, 
  Printer, 
  ChevronRight, 
  Sparkles, 
  ShoppingBag, 
  Clock, 
  BarChart3, 
  TrendingDown, 
  TrendingUp, 
  PackageX,
  Package,
  UserCheck,
  CheckCircle2
} from 'lucide-react';

interface DashboardViewProps {
  items: ClothingItem[];
  transactions: StockTransaction[];
  settings: StoreSettings;
  onNavigateToInventory: () => void;
  onNavigateToRecap: () => void;
  onOpenAddItemModal: () => void;
  onOpenMutationWithItem: (item: ClothingItem) => void;
  onQuickAdjustStock?: (itemId: string, delta: number, note?: string) => void;
  onExportCsv: () => void;
  onPrintReport: () => void;
  onOpenEditProfile?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  items,
  transactions,
  settings,
  onNavigateToInventory,
  onNavigateToRecap,
  onOpenAddItemModal,
  onOpenMutationWithItem,
  onQuickAdjustStock,
  onExportCsv,
  onPrintReport,
  onOpenEditProfile,
}) => {
  // Calculations
  const totalSkuCount = items.length;
  const totalPhysicalUnits = items.reduce((sum, item) => sum + item.currentStock, 0);

  // Auto-updating Total Barang Keluar & Masuk from transactions
  const totalUnitsIn = transactions
    .filter((tx) => tx.type === 'IN')
    .reduce((sum, tx) => sum + tx.quantity, 0);

  const totalUnitsOut = transactions
    .filter((tx) => tx.type === 'OUT')
    .reduce((sum, tx) => sum + tx.quantity, 0);

  const netMovement = totalUnitsIn - totalUnitsOut;

  // Low stock and out of stock items
  const lowStockItems = items.filter(
    (item) => item.currentStock <= item.minStock && item.currentStock > 0
  );
  const outOfStockItems = items.filter((item) => item.currentStock <= 0);
  const safeStockItems = items.filter((item) => item.currentStock > item.minStock);

  // Graphical stock percentage ratios
  const safePercent = totalSkuCount > 0 ? Math.round((safeStockItems.length / totalSkuCount) * 100) : 0;
  const lowPercent = totalSkuCount > 0 ? Math.round((lowStockItems.length / totalSkuCount) * 100) : 0;
  const outPercent = totalSkuCount > 0 ? Math.round((outOfStockItems.length / totalSkuCount) * 100) : 0;

  // Dozen (Lusin) calculations: 1 Lusin = 12 Pcs
  const totalDozens = (totalPhysicalUnits / 12).toFixed(1).replace('.', ',');
  const fullDozens = Math.floor(totalPhysicalUnits / 12);
  const remainderPcs = totalPhysicalUnits % 12;
  const dozenDetailText = totalPhysicalUnits >= 12
    ? `${fullDozens} Lusin${remainderPcs > 0 ? ` ${remainderPcs} Pcs` : ''}`
    : `${totalDozens} Lusin`;

  // Recent transactions (top 6)
  const recentTransactions = transactions.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Bar (Soft Yellow) */}
      <div className="bg-gradient-to-r from-amber-50 via-yellow-100/70 to-amber-100/60 dark:from-amber-950/40 dark:via-yellow-950/30 dark:to-slate-900 border border-amber-200/80 dark:border-amber-900/50 rounded-2xl p-6 sm:p-8 text-amber-950 dark:text-amber-100 shadow-xs relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-400 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-xs font-semibold backdrop-blur-md border border-amber-300/40">
                <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-amber-300" />
                <span>Sistem Rekap Mutasi &amp; Stok Pakaian</span>
              </div>
              {settings.storeTagline && (
                <span className="text-xs text-amber-900/70 dark:text-amber-200/70 font-medium">
                  • {settings.storeTagline}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-950 dark:text-amber-100">
                {settings.storeName || 'STZ Fashion'}
              </h1>
              {onOpenEditProfile && (
                <button
                  type="button"
                  onClick={onOpenEditProfile}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-200/80 hover:bg-amber-300 dark:bg-amber-900/60 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold border border-amber-300/60 dark:border-amber-800 transition-all cursor-pointer"
                  title="Edit Profil Toko, Nama & Deskripsi"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Edit Profil</span>
                </button>
              )}
            </div>

            <p className="text-amber-900/80 dark:text-amber-200/80 text-sm mt-1.5 max-w-xl leading-relaxed">
              {settings.description || 'Pantau pergerakan keluar masuk pakaian secara otomatis, amati grafik kondisi stok, dan antisipasi barang menipis secara tepat waktu.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenAddItemModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 active:scale-95 text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>Tambah Pakaian</span>
            </button>
            <button
              type="button"
              onClick={onExportCsv}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-amber-950 dark:text-amber-200 border border-amber-300/80 dark:border-amber-800/60 text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Unduh CSV</span>
            </button>
            <button
              type="button"
              onClick={onPrintReport}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>Cetak Rekap</span>
            </button>
          </div>
        </div>
      </div>

      {/* Low Stock Warning Alert if any item is critical */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Peringatan: {lowStockItems.length + outOfStockItems.length} Model Pakaian Perlu Perhatian!
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300/80">
                {outOfStockItems.length} model habis (0 Pcs) dan {lowStockItems.length} model sudah berada di bawah batas minimum stok.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateToInventory}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all whitespace-nowrap cursor-pointer"
          >
            Tinjau &amp; Restock
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Total Barang */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Barang</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono">
                {totalPhysicalUnits.toLocaleString('id-ID')}
              </span>
              <span className="text-xs text-slate-500 font-medium">Pcs</span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 font-mono ml-auto">
                {dozenDetailText}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Setara dengan <strong className="text-slate-700 dark:text-slate-300 font-mono">{totalDozens} Lusin</strong>
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-slate-400" />
              <span>Total Variasi Model:</span>
            </span>
            <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
              {totalSkuCount} Model
            </span>
          </div>
        </div>

        {/* Card 2: Total Barang Keluar Masuk (Update Otomatis) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Barang Keluar &amp; Masuk</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  Update Otomatis
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              {/* Masuk (IN) */}
              <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>Total Masuk</span>
                </div>
                <div className="mt-1 text-xl font-bold font-mono text-amber-900 dark:text-amber-200">
                  +{totalUnitsIn.toLocaleString('id-ID')}
                  <span className="text-[10px] font-sans font-normal ml-1">Pcs</span>
                </div>
                <div className="text-[10px] text-amber-700/80 dark:text-amber-400/80 font-mono mt-0.5">
                  ≈ {(totalUnitsIn / 12).toFixed(1).replace('.', ',')} Lusin
                </div>
              </div>

              {/* Keluar (OUT) */}
              <div className="p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Total Keluar</span>
                </div>
                <div className="mt-1 text-xl font-bold font-mono text-rose-700 dark:text-rose-300">
                  -{totalUnitsOut.toLocaleString('id-ID')}
                  <span className="text-[10px] font-sans font-normal ml-1">Pcs</span>
                </div>
                <div className="text-[10px] text-rose-600/80 dark:text-rose-400/80 font-mono mt-0.5">
                  ≈ {(totalUnitsOut / 12).toFixed(1).replace('.', ',')} Lusin
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Perputaran Mutasi:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {transactions.length} Transaksi Tercatat
            </span>
          </div>
        </div>

        {/* Card 3: Grafik & Info Stok Menipis */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-amber-500" />
                <span>Grafik &amp; Info Stok Menipis</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                {lowStockItems.length + outOfStockItems.length} Kritis
              </span>
            </div>

            {/* Visual Bar Ratio Chart */}
            <div className="mt-3">
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${safePercent}%` }}
                  className="bg-emerald-500 h-full transition-all duration-500"
                  title={`Aman: ${safeStockItems.length} model (${safePercent}%)`}
                />
                <div
                  style={{ width: `${lowPercent}%` }}
                  className="bg-amber-500 h-full transition-all duration-500"
                  title={`Menipis: ${lowStockItems.length} model (${lowPercent}%)`}
                />
                <div
                  style={{ width: `${outPercent}%` }}
                  className="bg-rose-500 h-full transition-all duration-500"
                  title={`Habis: ${outOfStockItems.length} model (${outPercent}%)`}
                />
              </div>

              {/* Legend */}
              <div className="mt-2.5 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Aman ({safeStockItems.length})</span>
                </div>
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Menipis ({lowStockItems.length})</span>
                </div>
                <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Habis ({outOfStockItems.length})</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Status Keseluruhan:</span>
            <span
              className={`font-semibold ${
                outOfStockItems.length > 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : lowStockItems.length > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {outOfStockItems.length > 0
                ? 'Ada Stok Habis'
                : lowStockItems.length > 0
                ? 'Perlu Restock'
                : 'Stok Terkendali Aman'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Transactions & Urgent Low Stock Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Transactions */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Mutasi Keluar &amp; Masuk Terakhir
              </h3>
            </div>
            <button
              type="button"
              onClick={onNavigateToRecap}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Semua ({transactions.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs flex flex-col items-center">
              <ArrowLeftRight className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="font-medium">Belum ada riwayat mutasi pakaian.</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Mulai catat transaksi masuk atau keluar melalui tombol di atas.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentTransactions.map((tx) => {
                const isOut = tx.type === 'OUT';
                const isAdjustment = tx.type === 'ADJUSTMENT';

                return (
                  <div key={tx.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isOut
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                            : isAdjustment
                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                            : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                        }`}
                      >
                        {isOut ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : isAdjustment ? (
                          <Package className="w-4 h-4" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {tx.itemName}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>Warna: {tx.color}</span>
                          <span>•</span>
                          <span>Size: {tx.size}</span>
                          <span>•</span>
                          <span>{tx.recipientOrSupplier || 'Pihak Terkait'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`font-bold font-mono text-sm ${
                          isOut
                            ? 'text-rose-600 dark:text-rose-400'
                            : isAdjustment
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {isOut ? `-${tx.quantity}` : `+${tx.quantity}`} Pcs
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {formatDateTime(tx.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Urgent Attention Items */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Daftar Pakaian Menipis
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-mono">
                {lowStockItems.length + outOfStockItems.length} Model
              </span>
            </div>

            {lowStockItems.length === 0 && outOfStockItems.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs flex flex-col items-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                <p className="font-medium text-slate-700 dark:text-slate-300">Semua Stok Aman</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tidak ada pakaian yang berada di bawah batas minimum stok.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...outOfStockItems, ...lowStockItems].slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 rounded font-mono">
                          {item.size}
                        </span>
                        <span>{item.color}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="text-right">
                        <span
                          className={`font-mono font-bold text-xs ${
                            item.currentStock === 0
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {item.currentStock} Pcs
                        </span>
                        <div className="text-[9px] text-slate-400">Min: {item.minStock}</div>
                      </div>
                      {onQuickAdjustStock && (
                        <button
                          type="button"
                          onClick={() => onQuickAdjustStock(item.id, 12, 'Restock Cepat (+1 Lusin)')}
                          className="px-2 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 text-[10px] font-mono font-bold transition-all cursor-pointer"
                          title="Restock Cepat +1 Lusin (12 Pcs)"
                        >
                          +1L
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onOpenMutationWithItem(item)}
                        className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold transition-all cursor-pointer"
                        title="Buka form mutasi restock"
                      >
                        +Restock
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onNavigateToInventory}
            className="w-full mt-4 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold text-center transition-colors cursor-pointer"
          >
            Buka Katalog Stok Lengkap &rarr;
          </button>
        </div>
      </div>

    </div>
  );
};
