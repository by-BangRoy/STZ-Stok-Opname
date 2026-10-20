import React, { useState } from 'react';
import { StoreSettings } from '../types/inventory';
import { Lock, ShieldCheck, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface PrivateAccessLockProps {
  settings: StoreSettings;
  onUnlock: () => void;
}

export const PrivateAccessLock: React.FC<PrivateAccessLockProps> = ({ settings, onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const targetPin = settings.pinCode || '1234';

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(false);
      if (nextPin === targetPin) {
        setTimeout(() => {
          onUnlock();
        }, 150);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin === targetPin) {
      onUnlock();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-yellow-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badge */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4 ring-4 ring-amber-400/20 text-slate-950">
            <Lock className="w-8 h-8 text-slate-950" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SISTEM REKAP STOK PRIBADI</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {settings.storeName || 'STZ Fashion'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Khusus Pemilik &amp; Pengelola ({settings.ownerEmail || 'kesanramadhan07@gmail.com'})
          </p>
        </div>

        {/* PIN Dots */}
        <form onSubmit={handleSubmit} className="mb-6 flex flex-col items-center">
          <div className="flex items-center justify-center gap-3 my-3">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    isFilled
                      ? 'bg-amber-400 scale-110 shadow-md shadow-amber-400/50'
                      : 'border-2 border-slate-700 bg-slate-800/50'
                  }`}
                />
              );
            })}
          </div>

          {/* Hidden or direct keyboard input */}
          <div className="relative w-full mt-2">
            <input
              type={showPin ? 'text' : 'password'}
              maxLength={6}
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setPin(val);
                setError(false);
                if (val === targetPin) {
                  setTimeout(() => onUnlock(), 150);
                }
              }}
              placeholder="Masukkan PIN Angka..."
              className="w-full text-center bg-slate-800/80 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl px-4 py-2.5 text-lg font-mono tracking-widest text-amber-300 placeholder:text-slate-500 placeholder:text-sm placeholder:tracking-normal outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-rose-400 mt-2 animate-bounce">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>PIN salah! Coba lagi atau gunakan PIN bawaan (1234).</span>
            </div>
          )}
        </form>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="h-13 rounded-2xl bg-slate-800/60 hover:bg-slate-700/80 active:scale-95 border border-slate-700/50 text-xl font-semibold text-white transition-all flex items-center justify-center shadow-sm cursor-pointer"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-13 rounded-2xl bg-slate-800/40 hover:bg-slate-700/60 active:scale-95 text-xs font-medium text-slate-400 transition-all flex items-center justify-center cursor-pointer"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-13 rounded-2xl bg-slate-800/60 hover:bg-slate-700/80 active:scale-95 border border-slate-700/50 text-xl font-semibold text-white transition-all flex items-center justify-center shadow-sm cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-13 rounded-2xl bg-slate-800/40 hover:bg-slate-700/60 active:scale-95 text-xs font-medium text-slate-400 transition-all flex items-center justify-center cursor-pointer"
          >
            Hapus
          </button>
        </div>

        {/* Quick Demo Unlock Button */}
        <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onUnlock()}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 transition-all active:scale-98 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Buka Langsung (Akses Cepat PIN: {targetPin})</span>
          </button>
          <p className="text-center text-[11px] text-slate-500">
            PIN bawaan tersimpan di sistem: <strong className="text-amber-400 font-mono">{targetPin}</strong> (dapat diubah di menu Pengaturan).
          </p>
        </div>
      </div>
    </div>
  );
};
