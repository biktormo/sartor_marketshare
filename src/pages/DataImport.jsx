import React, { useState } from 'react';
import { CloudUpload, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { processReport } from '../services/parserService';

export default function DataImport() {
  const [cargando, setCargando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [estado, setEstado] = useState(null);

  const alCambiarArchivo = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    setCargando(true);
    setEstado(null);
    setProgreso(0);

    try {
      await processReport(archivo, (p) => setProgreso(p));
      setEstado('exito');
    } catch (error) {
      console.error("Error:", error);
      setEstado('error');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 text-left">
      <div>
        <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">Inicio / Importar Datos</p>
        <h2 className="text-4xl font-black tracking-tight text-slate-800">Cargar Informes Mensuales</h2>
        <p className="text-slate-500 mt-2">Suba los archivos PDF para extraer automáticamente los datos de Market Share.</p>
      </div>

      <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center hover:border-primary transition-all cursor-pointer relative shadow-sm">
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={alCambiarArchivo}
          accept="application/pdf"
        />
        <div className="flex flex-col items-center">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <CloudUpload className="w-10 h-10 text-primary" />
          </div>
          <p className="text-lg font-bold">Haga clic aquí o arrastre su PDF</p>
          <p className="text-sm text-slate-400">Solo archivos PDF de análisis de mercado</p>
        </div>
      </div>

      {cargando && (
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-bold italic text-primary">Procesando y analizando datos...</span>
            <span className="text-sm font-black text-primary">{progreso}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300" 
              style={{ width: `${progreso}%` }}
            ></div>
          </div>
        </div>
      )}

      {estado === 'exito' && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3 shadow-sm">
          <CheckCircle2 className="text-green-500" />
          <span className="font-medium">¡El informe se ha procesado y sincronizado con el Dashboard con éxito!</span>
        </div>
      )}
      
      {estado === 'error' && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 shadow-sm">
          <AlertTriangle className="text-red-500" />
          <span className="font-medium">Hubo un error al leer el PDF. Asegúrese de que sea un informe válido.</span>
        </div>
      )}
    </div>
  );
}