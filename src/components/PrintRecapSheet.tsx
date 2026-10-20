import React from 'react';
import { ClothingItem, StoreSettings } from '../types/inventory';
import { formatCurrency, formatDateOnly } from '../utils/formatters';

interface PrintRecapSheetProps {
  items: ClothingItem[];
  settings: StoreSettings;
}

export const PrintRecapSheet: React.FC<PrintRecapSheetProps> = ({ items, settings }) => {
  const totalPhysicalUnits = items.reduce((sum, item) => sum + item.currentStock, 0);

  return (
    <div className="print-only hidden p-8 text-black bg-white max-w-4xl mx-auto font-sans">
      {/* Print Sheet Header */}
      <div className="border-b-2 border-black pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wider">
              {settings.storeName || 'STZ FASHION'}
            </h1>
            <p className="text-xs text-gray-600 mt-0.5">
              {settings.storeTagline || 'Sistem Rekap Mutasi & Inventaris Pakaian'}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {settings.address || 'Sentra Mode Fashion & Lifestyle'} · Telp: {settings.phone || '-'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-gray-100 border border-gray-300 rounded inline-block">
              LEMBAR AUDIT INVENTARIS
            </div>
            <div className="text-xs font-mono mt-1 text-gray-600">
              Tanggal Cetak: {formatDateOnly(new Date().toISOString())}
            </div>
            <div className="text-[10px] text-gray-500">
              Pengelola: {settings.ownerEmail || 'kesanramadhan07@gmail.com'}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Box */}
      <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 border border-gray-300 rounded mb-6 text-xs">
        <div>
          <div className="text-gray-500 text-[10px] uppercase font-semibold">Total Model / SKU</div>
          <div className="font-bold font-mono text-sm">{items.length} Model</div>
        </div>
        <div>
          <div className="text-gray-500 text-[10px] uppercase font-semibold">Total Barang (Pcs / Lusin)</div>
          <div className="font-bold font-mono text-sm">
            {totalPhysicalUnits} Pcs (≈ {(totalPhysicalUnits / 12).toFixed(1).replace('.', ',')} Lusin)
          </div>
        </div>
        <div>
          <div className="text-gray-500 text-[10px] uppercase font-semibold">Status Audit Fisik</div>
          <div className="font-bold font-mono text-sm">Pemeriksaan Berkala</div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-left text-[11px] border border-gray-300 mb-8">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-300 font-bold uppercase text-[9px]">
            <th className="p-2 border-r border-gray-300 w-8 text-center">No</th>
            <th className="p-2 border-r border-gray-300">Nama Pakaian</th>
            <th className="p-2 border-r border-gray-300">Varian (Warna / Size)</th>
            <th className="p-2 border-r border-gray-300 text-center">Stok (Pcs / Lusin)</th>
            <th className="p-2 border-r border-gray-300 text-center w-28">Fisik Nyata</th>
            <th className="p-2 text-center w-28">Paraf / Cek</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-6 text-center text-gray-400">
                Belum ada data stok pakaian terdaftar untuk dicetak.
              </td>
            </tr>
          ) : (
            items.map((item, idx) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="p-2 border-r border-gray-300 text-center font-mono">{idx + 1}</td>
                <td className="p-2 border-r border-gray-300 font-medium">{item.name}</td>
                <td className="p-2 border-r border-gray-300">
                  {item.color} - <span className="font-mono font-bold">{item.size}</span>
                </td>
                <td className="p-2 border-r border-gray-300 text-center font-mono font-bold">
                  {item.currentStock} Pcs
                  <div className="text-[9px] text-gray-500 font-normal">
                    ≈ {(item.currentStock / 12).toFixed(1).replace('.', ',')} Lsn
                  </div>
                </td>
                <td className="p-2 border-r border-gray-300 text-center bg-gray-50/50">
                  <span className="text-gray-300">______</span>
                </td>
                <td className="p-2 text-center">
                  <span className="text-gray-300">[ &nbsp; &nbsp; ]</span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Signatures */}
      <div className="grid grid-cols-3 gap-8 text-center text-xs pt-4 border-t border-gray-200">
        <div>
          <div className="text-gray-500 mb-14">Petugas Gudang / Stock Keeper</div>
          <div className="border-b border-black w-32 mx-auto" />
          <div className="text-[10px] text-gray-500 mt-1">( ................................ )</div>
        </div>
        <div>
          <div className="text-gray-500 mb-14">Pemeriksa / Auditor</div>
          <div className="border-b border-black w-32 mx-auto" />
          <div className="text-[10px] text-gray-500 mt-1">( ................................ )</div>
        </div>
        <div>
          <div className="text-gray-500 mb-14">Pemilik Toko (STZ Fashion)</div>
          <div className="border-b border-black w-32 mx-auto" />
          <div className="text-[10px] text-gray-500 mt-1">
            ( {settings.ownerEmail ? settings.ownerEmail.split('@')[0].toUpperCase() : 'OWNER'} )
          </div>
        </div>
      </div>
    </div>
  );
};
