import React, { useState } from 'react';
import { CloudUpload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function DataImport() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[#678961] text-xs font-bold uppercase tracking-widest mb-1">Home / Data Import</p>
          <h2 className="text-4xl font-black tracking-tight text-[#121811]">Upload Monthly Reports</h2>
          <p className="text-slate-500 mt-2">Importa los informes de Tractores y Cosechadoras para procesar el Market Share.</p>
        </div>
        <button className="bg-[#30ec13] text-[#132210] px-6 py-3 rounded-lg font-bold text-sm shadow-lg shadow-[#30ec13]/20 hover:scale-105 transition-all">
          Process Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dropzone */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm">
            <div className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-xl py-16 flex flex-col items-center justify-center">
              <div className="bg-[#30ec13]/10 p-4 rounded-full mb-4">
                <CloudUpload className="w-10 h-10 text-[#367C2B]" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Drag and drop your reports here</h3>
              <p className="text-slate-400 text-sm mb-6">PDF o Excel hasta 25MB</p>
              <button className="bg-white border border-slate-200 px-6 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50">
                Select Files
              </button>
            </div>
          </div>

          {/* Upload Progress (Simulado) */}
          {uploading && (
            <div className="bg-[#30ec13]/5 border border-[#30ec13]/20 rounded-xl p-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#367C2B]" /> December_2025_Tractors.pdf
                </span>
                <span className="text-sm font-black">{progress}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-[#30ec13] h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold flex items-center gap-2 mb-4 italic">
              <CheckCircle2 className="w-5 h-5 text-[#30ec13]" /> Data Mapping Preview
            </h3>
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Detected Headers</p>
              <div className="flex flex-wrap gap-2">
                {['Dealer', 'Pauny', 'Industry', 'MarketShare'].map(h => (
                  <span key={h} className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold border border-slate-200">{h}</span>
                ))}
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-[10px]">
                  <thead className="bg-slate-50 border-b">
                    <tr><th className="p-2 text-left">Segment</th><th className="p-2 text-right">Share</th></tr>
                  </thead>
                  <tbody className="text-slate-500">
                    <tr><td className="p-2 border-b">80-100 HP</td><td className="p-2 text-right border-b">29.6%</td></tr>
                    <tr><td className="p-2">140-180 HP</td><td className="p-2 text-right">30.0%</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}