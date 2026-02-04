import React, { useState, useEffect } from 'react';
import { CloudUpload, FileText, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { processReport } from '../services/parserService';

export default function DataImport() {
  const [cargando, setCargando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [estado, setEstado] = useState(null);
  const [historial, setHistorial] = useState([]);

  // Cargar historial de archivos
  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("fechaCarga", "desc"));
    return onSnapshot(q, (snapshot) => {
      setHistorial(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const alCambiarArchivo = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    setCargando(true);
    setEstado(null);
    try {
      await processReport(archivo, (p) => setProgreso(p));
      setEstado('exito');
    } catch (error) {
      setEstado('error');
    } finally { setCargando(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-6 text-left">
      <section className="space-y-6">
        <h2 className="text-3xl font-black text-slate-800">Cargar Informes Mensuales</h2>
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center hover:border-primary transition-all relative shadow-sm">
          <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={alCambiarArchivo} accept="application/pdf" />
          <CloudUpload className="w-12 h-12 text-primary mx-auto mb-4" />
          <p className="text-lg font-bold">Arrastre su PDF aquí</p>
        </div>

        {cargando && (
          <div className="bg-white border rounded-xl p-4 shadow-sm animate-pulse">
            <div className="flex justify-between mb-2 text-primary font-bold">
              <span>Procesando...</span><span>{progreso}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full transition-all" style={{ width: `${progreso}%` }}></div>
            </div>
          </div>
        )}
      </section>

      {/* TABLA DE HISTORIAL */}
      <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <h3 className="font-bold text-slate-700 uppercase text-xs tracking-widest">Archivos en el Dashboard</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-tighter">
              <tr>
                <th className="px-6 py-3 text-left">Nombre del Archivo</th>
                <th className="px-6 py-3 text-center">Tipo</th>
                <th className="px-6 py-3 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historial.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700">{doc.nombreArchivo}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${doc.tipo === 'Tractores' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {doc.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-green-600 font-bold text-[10px] uppercase">Procesado</span>
                  </td>
                </tr>
              ))}
              {historial.length === 0 && (
                <tr><td colSpan="3" className="px-6 py-10 text-center text-slate-400 italic">No hay archivos cargados aún.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}