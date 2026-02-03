import React, { useState } from 'react';
import { CloudUpload, FileText, CheckCircle2 } from 'lucide-react';
import { processReport } from '../services/parserService';

export default function DataImport() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null);

  const onFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("Archivo seleccionado:", file.name);
    setUploading(true);
    setStatus(null);
    setProgress(0);

    try {
      console.log("Iniciando proceso de carga y parseo...");
      const result = await processReport(file, (p) => {
        console.log(`Progreso: ${p}%`);
        setProgress(p);
      });
      
      console.log("¡Éxito!", result);
      setStatus('success');
    } catch (error) {
      console.error("Error en el componente:", error);
      setStatus('error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6 text-left">
      <div>
        <h2 className="text-3xl font-black text-slate-800">Upload Monthly Reports</h2>
        <p className="text-slate-500">Sube el PDF para extraer los datos automáticamente.</p>
      </div>

      <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center hover:border-[#30ec13] transition-colors cursor-pointer relative">
        <input 
          type="file" 
          id="fileInput" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={onFileChange}
          accept="application/pdf"
        />
        <div className="flex flex-col items-center">
          <div className="bg-[#30ec13]/10 p-4 rounded-full mb-4">
            <CloudUpload className="w-10 h-10 text-[#367C2B]" />
          </div>
          <p className="text-lg font-bold">Click aquí o arrastra tu PDF</p>
          <p className="text-sm text-slate-400">Solo archivos PDF de análisis de mercado</p>
        </div>
      </div>

      {uploading && (
        <div className="bg-slate-50 border rounded-xl p-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-bold italic">Procesando archivo...</span>
            <span className="text-sm font-black">{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#30ec13] h-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="p-4 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
          <CheckCircle2 /> ¡Reporte procesado y guardado en Firebase con éxito!
        </div>
      )}
      
      {status === 'error' && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          Hubo un error al procesar el PDF. Revisa la consola (F12).
        </div>
      )}
    </div>
  );
}