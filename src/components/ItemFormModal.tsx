import React, { useState, useEffect } from 'react';
import { ClothingItem } from '../types/inventory';
import { X, Shirt, AlertCircle } from 'lucide-react';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ClothingItem) => void;
  editingItem: ClothingItem | null;
}

const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'All Size', '28', '29', '30', '31', '32', '34'];

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState(''); // Initialized empty so it can be typed freely
  const [currentStock, setCurrentStock] = useState(''); // Initialized empty so it can be typed manually
  const [minStock, setMinStock] = useState('5');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setColor(editingItem.color || '');
      setSize(editingItem.size || '');
      setCurrentStock(editingItem.currentStock !== undefined ? String(editingItem.currentStock) : '');
      setMinStock(editingItem.minStock !== undefined ? String(editingItem.minStock) : '5');
      setNote(editingItem.note || '');
    } else {
      // Empty values for new item so user can fill in manually
      setName('');
      setColor('');
      setSize('');
      setCurrentStock('');
      setMinStock('5');
      setNote('');
    }
    setError('');
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama pakaian wajib diisi!');
      return;
    }
    if (!color.trim()) {
      setError('Varian warna pakaian wajib diisi!');
      return;
    }

    const finalStock = currentStock === '' ? 0 : parseInt(currentStock, 10) || 0;
    const finalMinStock = minStock === '' ? 0 : parseInt(minStock, 10) || 0;

    const itemToSave: ClothingItem = {
      id: editingItem ? editingItem.id : 'item-' + Date.now(),
      name: name.trim(),
      sku: '',
      category: '',
      color: color.trim(),
      size: size.trim() || 'All Size',
      currentStock: finalStock,
      minStock: finalMinStock,
      buyPrice: 0,
      sellPrice: 0,
      note: note.trim(),
      updatedAt: new Date().toISOString(),
    };

    onSave(itemToSave);
    onClose();
  };

  const parsedCurrentStock = currentStock === '' ? 0 : parseInt(currentStock, 10) || 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingItem ? 'Edit Data Pakaian' : 'Tambah Model Pakaian Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                {editingItem ? 'Perbarui informasi pakaian dan varian' : 'Daftarkan model pakaian baru ke stok'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Model Pakaian <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Kemeja Linen Oversized Casual..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Color & Size (Manual input) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Varian Warna <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Contoh: Sage Green, Hitam, Krem..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ukuran / Size <span className="text-slate-400 font-normal">(Bebas diisi manual)</span>
              </label>
              <input
                type="text"
                list="size-suggestions"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="Ketik ukuran: M, L, XL, 32, All Size..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <datalist id="size-suggestions">
                {COMMON_SIZES.map((sz) => (
                  <option key={sz} value={sz} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Current Stock & Min Stock Alert (Blank manual inputs) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {editingItem ? 'Jumlah Stok Saat Ini' : 'Jumlah Stok Awal'} (Pcs)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Ketik jumlah stok (misal: 24)..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:font-normal placeholder:text-slate-400"
              />
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                {currentStock !== '' ? (
                  <span>
                    ≈ {(parsedCurrentStock / 12).toFixed(1).replace('.', ',')} Lusin ({Math.floor(parsedCurrentStock / 12)} Lsn {parsedCurrentStock % 12 > 0 ? `${parsedCurrentStock % 12} Pcs` : ''})
                  </span>
                ) : (
                  <span>Kosongkan jika stok awal 0 Pcs</span>
                )}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Batas Minimum Peringatan (Pcs)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="5"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                Peringatan jika stok &le; {minStock || 0} Pcs
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan Pakaian / Penempatan Rak
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Bahan katun jepang, rak etalase A2..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
            />
          </div>

          {/* Buttons */}
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
              {editingItem ? 'Simpan Perubahan' : 'Tambahkan Pakaian'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
