import React, { useState } from 'react';
import { LayoutDashboard, FileUp, Bell, Settings, BarChart3 } from 'lucide-react';
import DataImport from './pages/DataImport';
// Importaremos otros componentes luego

export default function App() {
  const [activeTab, setActiveTab] = useState('import'); // 'dashboard', 'import', 'alerts'

  return (
    <div className="min-h-screen bg-[#f6f8f6] text-slate-900 font-sans">
      {/* Top NavBar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-10 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div className="bg-[#367C2B] p-2 rounded text-white font-bold italic text-sm">
            JD
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Sartor Analysis</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Market Share Dashboard</p>
          </div>
        </div>

        <nav className="flex items-center gap-8">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`text-sm font-medium ${activeTab === 'dashboard' ? 'text-[#367C2B] border-b-2 border-[#367C2B]' : 'text-slate-500'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('import')}
            className={`text-sm font-medium ${activeTab === 'import' ? 'text-[#367C2B] border-b-2 border-[#367C2B]' : 'text-slate-500'}`}
          >
            Data Import
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <Bell className="w-5 h-5 text-slate-400 cursor-pointer" />
          <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-[#367C2B]/20 flex items-center justify-center font-bold text-[#367C2B]">
            DS
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto p-10">
        {activeTab === 'import' && <DataImport />}
        {activeTab === 'dashboard' && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-slate-400">Selecciona un archivo en Import para ver datos aquí.</h2>
          </div>
        )}
      </main>
    </div>
  );
}
