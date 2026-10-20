import React from 'react';
import { StoreSettings } from '../types/inventory';
import { 
  Shirt, 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  PlusCircle, 
  Settings, 
  Lock, 
  Sun, 
  Moon,
  Sparkles,
  UserCheck
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'inventory' | 'recap';
  setActiveTab: (tab: 'dashboard' | 'inventory' | 'recap') => void;
  onOpenMutationModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenEditProfileModal?: () => void;
  onLockAccess: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  settings: StoreSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenMutationModal,
  onOpenSettingsModal,
  onOpenEditProfileModal,
  onLockAccess,
  darkMode,
  setDarkMode,
  settings,
}) => {
  return (
    <header className="no-print sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 ring-2 ring-amber-400/20">
              <Shirt className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  {settings.storeName || 'STZ Fashion'}
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                  <Sparkles className="w-3 h-3 mr-0.5 text-amber-600 dark:text-amber-400" />
                  Stok Pribadi
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate max-w-xs">
                {settings.storeTagline || 'Sistem Rekap Mutasi & Inventaris'}
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-slate-700 text-amber-800 dark:text-amber-200 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-white dark:bg-slate-700 text-amber-800 dark:text-amber-200 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Stok Pakaian</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('recap')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'recap'
                  ? 'bg-white dark:bg-slate-700 text-amber-800 dark:text-amber-200 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Rekap Mutasi</span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Edit Profil Button */}
            <button
              type="button"
              onClick={onOpenEditProfileModal || onOpenSettingsModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-xs font-bold border border-amber-300/70 dark:border-amber-800/60 transition-all cursor-pointer shadow-2xs"
              title="Edit Profil Toko, Nama, Deskripsi & Kontak"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span className="hidden sm:inline">Edit Profil</span>
            </button>

            {/* Quick Mutation Button */}
            <button
              type="button"
              onClick={onOpenMutationModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-xs font-bold shadow-sm shadow-amber-500/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span className="hidden sm:inline">Catat Mutasi</span>
              <span className="sm:hidden">Mutasi</span>
            </button>

            {/* Dark Mode Switcher */}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={darkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Settings */}
            <button
              type="button"
              onClick={onOpenSettingsModal}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Pengaturan Toko, Keamanan & Hapus Data"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Lock Access */}
            <button
              type="button"
              onClick={onLockAccess}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              title="Kunci Akses Pribadi (Keluar)"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-0.5 py-1 text-[11px] font-medium transition-colors ${
              activeTab === 'dashboard' ? 'text-amber-700 dark:text-amber-400 font-semibold' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`flex flex-col items-center gap-0.5 py-1 text-[11px] font-medium transition-colors ${
              activeTab === 'inventory' ? 'text-amber-700 dark:text-amber-400 font-semibold' : 'text-slate-500'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Stok</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('recap')}
            className={`flex flex-col items-center gap-0.5 py-1 text-[11px] font-medium transition-colors ${
              activeTab === 'recap' ? 'text-amber-700 dark:text-amber-400 font-semibold' : 'text-slate-500'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Rekap</span>
          </button>
          <button
            type="button"
            onClick={onOpenEditProfileModal || onOpenSettingsModal}
            className="flex flex-col items-center gap-0.5 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-400"
          >
            <UserCheck className="w-4 h-4" />
            <span>Profil</span>
          </button>
        </div>
      </div>
    </header>
  );
};
