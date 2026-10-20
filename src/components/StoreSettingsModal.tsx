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
  MapPin,
  Trash2,
  AlertTriangle,
  UserCheck,
  FileText
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
  onClearAllStock: () => void;
  onClearAllTransactions: () => void;
  onClearAllData: () => void;
  initialTab?: 'profile' | 'security' | 'data';
}

export const StoreSettingsModal: React.FC<StoreSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  items,
  transactions,
  onDataRestored,
  onClearAllStock,
  onClearAllTransactions,
  onClearAllData,
  initialTab = 'profile',
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'data'>(initialTab);

  // Form states
  const [storeName, setStoreName] = useState(settings.storeName);
  const [storeTagline, setStoreTagline] = useState(settings.storeTagline || '');
  const [description, setDescription] = useState(settings.description || '');
  const [ownerEmail, setOwnerEmail] = useState(settings.ownerEmail);
  const [phone, setPhone] = useState(settings.phone || '');
  const [address, setAddress] = useState(settings.address || '');
  const [pinCode, setPinCode] = useState(settings.pinCode || '1234');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Confirmation modal states for deletion
  const [confirmDeleteType, setConfirmDeleteType] = useState<'stock' | 'mutations' | 'all' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStoreName(settings.storeName);
      setStoreTagline(settings.storeTagline || '');
      setDescription(settings.description || '');
      setOwnerEmail(settings.ownerEmail);
      setPhone(settings.phone || '');
      setAddress(settings.address || '');
      setPinCode(settings.pinCode || '1234');
      setSaveSuccess(false);
      setErrorMsg('');
      setActiveTab(initialTab);
      setConfirmDeleteType(null);
    }
  }, [settings, isOpen, initialTab]);

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
      description: description.trim(),
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
    }, 1000);
  };

  // Export full JSON Backup
  const handleExportBackup = () => {
    const backupData = {
      app: 'STZ Fashion Inventory',
      version: '3.0',
      exportedAt: new Date().toISOString(),
      settings: {
        ...settings,
        storeName,
        storeTagline,
        description,
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
    if (window.confirm('Apakah Anda yakin ingin mereset seluruh data kembali ke setelan bawaan?')) {
      onDataRestored(INITIAL_ITEMS, INITIAL_TRANSACTIONS, DEFAULT_SETTINGS);
      onClose();
    }
  };

  // Execute deletion confirmed
  const executeConfirmedDeletion = () => {
    if (confirmDeleteType === 'stock') {
      onClearAllStock();
    } else if (confirmDeleteType === 'mutations') {
      onClearAllTransactions();
    } else if (confirmDeleteType === 'all') {
      onClearAllData();
    }
    setConfirmDeleteType(null);
  };

  const totalPhysicalUnits = items.reduce((sum, item) => sum + item.currentStock, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 bg-amber-500/10 dark:bg-amber-950/30 border-b border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
              <Store className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Pengaturan &amp; Profil Toko
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ubah profil, deskripsi, keamanan PIN, dan kelola hapus data inventaris
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Menu */}
        <div className="px-6 pt-3 border-b border-slate-200 dark:border-slate-800 flex gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-amber-500 text-amber-800 dark:text-amber-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Edit Profil &amp; Deskripsi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-amber-500 text-amber-800 dark:text-amber-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Keamanan PIN</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'data'
                ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>Hapus Data &amp; Cadangan</span>
          </button>
        </div>

        {/* Alerts */}
        <div className="px-6 pt-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center gap-2 text-xs">
              <Check className="w-4 h-4 shrink-0" />
              <span>Profil &amp; Pengaturan berhasil diperbarui!</span>
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6 text-xs max-h-[60vh] overflow-y-auto">
          {/* TAB 1: EDIT PROFIL & DESKRIPSI */}
          {activeTab === 'profile' && (
            <form id="settings-profile-form" onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Toko / Brand <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Contoh: STZ Fashion"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Slogan / Tagline Singkat
                </label>
                <input
                  type="text"
                  value={storeTagline}
                  onChange={(e) => setStoreTagline(e.target.value)}
                  placeholder="Contoh: Sistem Rekap Mutasi & Inventaris Pakaian"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi Lengkap Toko
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tuliskan deskripsi toko, informasi katalog busana, visi usaha, atau catatan operasional lainnya..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Deskripsi ini akan tersimpan pada profil toko dan dapat diubah sewaktu-waktu.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Pemilik Toko (Akses Akun)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor WhatsApp / Kontak
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0812-3456-7890"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat / Lokasi Toko
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Sentra Mode Fashion & Lifestyle, Jakarta"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Simpan Perubahan Profil</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: KEAMANAN & PIN */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500 text-slate-950 mt-0.5">
                    <KeyRound className="w-5 h-5 text-slate-950" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      PIN Akses Aplikasi
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
                      Kunci aplikasi dengan PIN agar data stok pakaian dan mutasi Anda tetap aman dan privat.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  PIN Akses Baru (4 - 6 Digit Angka)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="1234"
                  className="w-full max-w-xs px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono tracking-widest text-lg font-extrabold text-amber-800 dark:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  PIN ini akan diminta setiap kali aplikasi pertama kali dibuka atau saat tombol Kunci di Navbar ditekan.
                </p>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Simpan PIN Baru</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: HAPUS DATA & CADANGAN */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              {/* Card 1: Hapus Stok dan Mutasi */}
              <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-4">
                <div className="flex items-center gap-2.5 text-rose-700 dark:text-rose-400">
                  <Trash2 className="w-5 h-5 shrink-0" />
                  <h4 className="font-bold text-sm">
                    Manajemen Hapus Data Inventaris
                  </h4>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Gunakan tombol di bawah ini jika Anda ingin mengosongkan stok pakaian atau menghapus riwayat pergerakan mutasi barang secara selektif maupun keseluruhan.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {/* Button 1: Hapus Semua Stok */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 dark:text-white">Semua Stok Pakaian</span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold">
                          {items.length} Model ({totalPhysicalUnits} Pcs)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Menghapus seluruh item pakaian. Riwayat mutasi tidak terpengaruh.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteType('stock')}
                      disabled={items.length === 0}
                      className="mt-3 w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Semua Stok</span>
                    </button>
                  </div>

                  {/* Button 2: Hapus Semua Riwayat Mutasi */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 dark:text-white">Riwayat Mutasi</span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold">
                          {transactions.length} Transaksi
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Menghapus seluruh catatan mutasi barang masuk, keluar, dan koreksi.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteType('mutations')}
                      disabled={transactions.length === 0}
                      className="mt-3 w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Riwayat Mutasi</span>
                    </button>
                  </div>
                </div>

                {/* Button 3: Hapus Sekaligus Keduanya */}
                <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Ingin membersihkan semua data stok dan transaksi sekaligus?
                  </span>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteType('all')}
                    disabled={items.length === 0 && transactions.length === 0}
                    className="py-1.5 px-3 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Stok &amp; Riwayat Sekaligus</span>
                  </button>
                </div>
              </div>

              {/* Card 2: Cadangan & Pemulihan Data */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Cadangan &amp; Pemulihan Data (File JSON)</span>
                </h4>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-600" />
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 font-semibold transition-all cursor-pointer ml-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset ke Bawaan</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="text-slate-500 dark:text-slate-400 text-[11px]">
            {items.length} jenis pakaian tersimpan · {transactions.length} riwayat mutasi
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>

      {/* POPUP MODAL KONFIRMASI PENGHAPUSAN (Aman dari ketidaksengajaan) */}
      {confirmDeleteType && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-rose-300 dark:border-rose-900 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Konfirmasi Hapus Data
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {confirmDeleteType === 'stock' && (
                  <>Apakah Anda yakin ingin <strong>menghapus semua {items.length} stok pakaian</strong>? Data pakaian akan dikosongkan (0 barang).</>
                )}
                {confirmDeleteType === 'mutations' && (
                  <>Apakah Anda yakin ingin <strong>menghapus seluruh {transactions.length} riwayat mutasi</strong>? Riwayat barang masuk &amp; keluar akan dikosongkan.</>
                )}
                {confirmDeleteType === 'all' && (
                  <>Apakah Anda yakin ingin <strong>menghapus seluruh stok pakaian DAN seluruh riwayat mutasi</strong>? Aplikasi akan kembali bersih seperti baru.</>
                )}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteType(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeConfirmedDeletion}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-md shadow-rose-600/30 cursor-pointer"
              >
                Ya, Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
