import React, { useState, useEffect, useRef } from 'react';
import { ClothingItem, StockTransaction, StoreSettings } from '../types/inventory';
import { DEFAULT_SETTINGS, INITIAL_ITEMS, INITIAL_TRANSACTIONS } from '../utils/storage';
import { 
  X, 
  Settings, 
  ShieldCheck, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  AlertCircle,
  KeyRound,
  Store,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

interface StoreSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
  onUpdateSettings: (newSettings: StoreSettings) => void;
  items: ClothingItem[];
  transactions: StockTransaction[];
  onDataRestored: (
    newItems: ClothingItem[],
    newTransactions: StockTransaction[],
    newSettings: StoreSettings
  ) => void;
}

export const StoreSettingsModal: React.FC<StoreSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  items,
  transactions,
  onDataRestored,
}) => {
  const [storeName, setStoreName] = useState(settings.storeName);
  const [storeTagline, setStoreTagline] = useState(settings.storeTagline || '');
  const [ownerEmail, setOwnerEmail] = useState(settings.ownerEmail);
  const [phone, setPhone] = useState(settings.phone || '');
  const [address, setAddress] = useState(settings.address || '');
  const [pinCode, setPinCode] = useState(settings.pinCode || '1234');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStoreName(settings.storeName);
    setStoreTagline(settings.storeTagline || '');
    setOwnerEmail(settings.ownerEmail);
    setPhone(settings.phone || '');
    setAddress(settings.address || '');
    setPinCode(settings.pinCode || '1234');
    setSaveSuccess(false);
    setErrorMsg('');
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      setErrorMsg('Nama toko tidak boleh kosong!');
      return;
    }
    if (!pinCode || pinCode.length < 4) {
      setErrorMsg('PIN keamanan minimal 4 digit angka!');
      return;
    }

    const updated: StoreSettings = {
      ...settings,
      storeName: storeName.trim(),
      storeTagline: storeTagline.trim(),
      ownerEmail: ownerEmail.trim(),
      phone: phone.trim(),
      address: address.trim(),
      pinCode: pinCode.trim(),
    };

    onUpdateSettings(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  // Export full JSON Backup
  const handleExportBackup = () => {
    const backupData = {
      app: 'STZ Fashion Inventory',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      settings: {
        ...settings,
        storeName,
        storeTagline,
        ownerEmail,
        phone,
        address,
        pinCode,
      },
      items,
      transactions,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Cadangan_STZ_Fashion_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Restore from JSON Backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.items && Array.isArray(parsed.items) && parsed.transactions && Array.isArray(parsed.transactions)) {
          const restoredSettings = parsed.settings || settings;
          onDataRestored(parsed.items, parsed.transactions, restoredSettings);
          alert('Cadangan data berhasil dipulihkan secara utuh!');
          onClose();
        } else {
          setErrorMsg('Format file cadangan tidak valid!');
        }
      } catch (err) {
        setErrorMsg('Gagal membaca file JSON cadangan.');
      }
    };
    reader.readAsText(file);
  };

  // Reset to initial demo data
  const handleResetToDefault = () => {
    if (window.confirm('Apakah Anda yakin ingin mereset seluruh data kembali ke data contoh bawaan?')) {
      onDataRestored(INITIAL_ITEMS, INITIAL_TRANSACTIONS, DEFAULT_SETTINGS);
      alert('Data telah dikembalikan ke kondisi awal bawaan STZ Fashion.');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Pengaturan Toko &amp; Keamanan
              </h3>
              <p className="text-xs text-slate-500">
                Konfigurasi profil toko STZ Fashion, PIN, serta backup data
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

        {/* Body Form */}
        <form onSubmit={handleSaveSettings} className="p-6 space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Pengaturan berhasil disimpan!</span>
            </div>
          )}

          {/* Section: Profil Toko */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-600" />
              <span>Profil Toko Fashion</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Toko / Brand
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Slogan / Tagline
                </label>
                <input
                  type="text"
                  value={storeTagline}
                  onChange={(e) => setStoreTagline(e.target.value)}
                  placeholder="Contoh: Premium Fashion & Daily Wear"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Pemilik (Privat)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kontak Telepon / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812-3456-7890"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alamat / Lokasi Toko
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Sentra Mode Fashion & Lifestyle, Jakarta"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Section: Keamanan PIN */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-600" />
              <span>Keamanan PIN Akses Pribadi</span>
            </h4>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                PIN Akses Aplikasi (4 - 6 Digit)
              </label>
              <input
                type="text"
                maxLength={6}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="1234"
                className="w-full max-w-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono tracking-widest text-base font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                PIN ini digunakan setiap kali aplikasi dibuka atau saat tombol kunci ditekan.
              </p>
            </div>
          </div>

          {/* Section: Cadangan & Pemulihan Data */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Cadangan &amp; Pemulihan Data (Backup JSON)</span>
            </h4>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleExportBackup}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Unduh File Cadangan (.json)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Pulihkan Cadangan</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />

              <button
                type="button"
                onClick={handleResetToDefault}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 font-semibold transition-all cursor-pointer ml-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ke Bawaan</span>
              </button>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
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
              Simpan Pengaturan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
