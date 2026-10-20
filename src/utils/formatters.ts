import { ClothingItem, StockTransaction } from '../types/inventory';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDateOnly(isoString: string): string {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function triggerDownload(csvContent: string, filename: string) {
  // Add UTF-8 BOM so Excel opens Indonesian characters and numbers seamlessly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportInventoryToCsv(items: ClothingItem[], storeName = 'STZ-Fashion') {
  const headers = [
    'No',
    'Nama Pakaian',
    'Warna',
    'Ukuran / Size',
    'Stok (Pcs)',
    'Stok (Lusin)',
    'Batas Min Stok (Pcs)',
    'Status Stok',
    'Catatan Khusus',
  ];

  const rows = items.map((item, index) => {
    const stockStatus =
      item.currentStock <= 0
        ? 'HABIS'
        : item.currentStock <= item.minStock
        ? 'MENIPIS'
        : 'AMAN';

    const dozenStr = (item.currentStock / 12).toFixed(1).replace('.', ',');

    return [
      index + 1,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.color.replace(/"/g, '""')}"`,
      `"${item.size.replace(/"/g, '""')}"`,
      item.currentStock,
      `"${dozenStr} Lsn"`,
      item.minStock,
      stockStatus,
      `"${(item.note || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvString = [headers.join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  const safeStore = storeName.replace(/[^a-zA-Z0-9]/g, '_');
  triggerDownload(csvString, `Stok_Inventaris_${safeStore}_${dateStr}.csv`);
}

export function exportRecapToCsv(transactions: StockTransaction[], storeName = 'STZ-Fashion') {
  const headers = [
    'No',
    'Waktu Transaksi',
    'Tipe Mutasi',
    'Nama Pakaian',
    'Warna',
    'Ukuran',
    'Jumlah (Pcs)',
    'Lusin',
    'Stok Sebelumnya',
    'Stok Akhir',
    'Pihak Terkait / Customer / Supplier',
    'Keterangan / Alasan',
  ];

  const rows = transactions.map((tx, index) => {
    const typeLabel =
      tx.type === 'IN' ? 'Barang Masuk (IN)' : tx.type === 'OUT' ? 'Barang Keluar (OUT)' : 'Koreksi Stok (ADJUST)';

    const dozenStr = (tx.quantity / 12).toFixed(1).replace('.', ',');

    return [
      index + 1,
      `"${formatDateTime(tx.timestamp)}"`,
      typeLabel,
      `"${tx.itemName.replace(/"/g, '""')}"`,
      `"${tx.color.replace(/"/g, '""')}"`,
      `"${tx.size.replace(/"/g, '""')}"`,
      tx.quantity,
      `"${dozenStr} Lsn"`,
      tx.previousStock,
      tx.newStock,
      `"${(tx.recipientOrSupplier || '').replace(/"/g, '""')}"`,
      `"${(tx.note || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvString = [headers.join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  const safeStore = storeName.replace(/[^a-zA-Z0-9]/g, '_');
  triggerDownload(csvString, `Rekap_Mutasi_${safeStore}_${dateStr}.csv`);
}
