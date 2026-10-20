import React, { useState, useRef, useEffect } from 'react';
import { StoreSettings } from '../types/inventory';
import { 
  Lock, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  LogIn, 
  Delete,
  CheckCircle2
} from 'lucide-react';
import { OWNER_BOOTSTRAP_EMAIL } from '../firebase/config';

interface PrivateAccessLockProps {
  settings: StoreSettings;
  onUnlock: (ownerUserEmail?: string) => void;
}

export const PrivateAccessLock: React.FC<PrivateAccessLockProps> = ({ settings, onUnlock }) => {
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const targetPin = settings.pinCode || '1234';
  const authorizedOwnerEmail = (settings.ownerEmail || OWNER_BOOTSTRAP_EMAIL).toLowerCase();

  useEffect(() => {
    // Focus input on load
    inputRef.current?.focus();
  }, []);

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + num);
      setErrorMessage(null);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setErrorMessage(null);
  };

  const handleClear = () => {
    setPin('');
    setErrorMessage(null);
  };

  // Login via Owner PIN
  const handleLoginWithPin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!pin || pin.trim() === '') {
      setErrorMessage('Silakan masukan PIN terlebih dahulu.');
      inputRef.current?.focus();
      return;
    }

    if (pin === targetPin) {
      setErrorMessage(null);
      setIsSuccess(true);
      setInfoMessage('PIN Terverifikasi! Membuka akses...');
      setTimeout(() => {
        onUnlock(authorizedOwnerEmail);
      }, 300);
    } else {
      setErrorMessage('PIN salah! Silakan coba lagi.');
      setPin('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950 text-white flex flex-col items-center justify-center p-4 selection:bg-amber-500 selection:text-white">
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-yellow-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-3.5 ring-4 ring-amber-400/20 text-slate-950">
            <Lock className="w-8 h-8 text-slate-950" />
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white">
            {settings.storeName || 'STZ Fashion'}
          </h1>
        </div>

        {/* Success Alert */}
        {infoMessage && (
          <div className="mb-4 flex items-center gap-2 text-xs text-emerald-300 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-700/50">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 flex items-start gap-2 text-xs text-rose-300 p-3 rounded-2xl bg-rose-950/60 border border-rose-800/60">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Form PIN & Input */}
        <form onSubmit={handleLoginWithPin} className="mb-4 flex flex-col items-center">
          {/* PIN Dots Indicator */}
          <div className="flex items-center justify-center gap-3 mb-2">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                    isFilled
                      ? isSuccess
                        ? 'bg-emerald-400 scale-125 shadow-md shadow-emerald-400/50'
                        : 'bg-amber-400 scale-110 shadow-md shadow-amber-400/50'
                      : 'border-2 border-slate-700 bg-slate-800/50'
                  }`}
                />
              );
            })}
          </div>

          {/* Direct Keyboard Input */}
          <div className="relative w-full mt-2">
            <input
              ref={inputRef}
              type={showPin ? 'text' : 'password'}
              maxLength={6}
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setPin(val);
                setErrorMessage(null);
              }}
              placeholder="Masukan PIN"
              className="w-full text-center bg-slate-800/80 border border-slate-700 focus:border-amber-400 focus:ring-amber-400/20 focus:ring-2 rounded-xl px-4 py-3 text-lg font-mono tracking-widest text-amber-300 placeholder:text-slate-500 placeholder:text-sm placeholder:tracking-normal outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              tabIndex={-1}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-1"
              title={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </form>

        {/* Numpad Keypad */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="h-11 rounded-2xl bg-slate-800/60 hover:bg-slate-700/80 active:scale-95 border border-slate-700/50 text-xl font-semibold text-white transition-all flex items-center justify-center shadow-sm cursor-pointer"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-11 rounded-2xl bg-slate-800/40 hover:bg-slate-700/60 active:scale-95 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center cursor-pointer"
          >
            C
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-11 rounded-2xl bg-slate-800/60 hover:bg-slate-700/80 active:scale-95 border border-slate-700/50 text-xl font-semibold text-white transition-all flex items-center justify-center shadow-sm cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-11 rounded-2xl bg-slate-800/40 hover:bg-slate-700/60 active:scale-95 text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center cursor-pointer"
            title="Hapus Digit Terakhir"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Tombol Login */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleLoginWithPin}
            disabled={isSuccess}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-[0.99] text-slate-950 font-black rounded-2xl text-base flex items-center justify-center gap-2.5 shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            <LogIn className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            <span>{isSuccess ? 'Berhasil Membuka Akses...' : 'Login'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
