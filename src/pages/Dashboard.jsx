import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [tipoActivo, setTipoActivo] = useState('Tractores');
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    // Buscamos el último reporte PERO filtrado por el tipo activo
    const q = query(
      collection(db, "reports"), 
      where("tipo", "==", tipoActivo),
      orderBy("fechaCarga", "desc"), 
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setReporte(snap.docs[0].data());
      } else {
        setReporte(null);
      }
      setCargando(false);
    });
    return () => unsubscribe();
  }, [tipoActivo]);

  const chartData = {
    labels: tipoActivo === 'Tractores' ? ['< 100 HP', '100 - 180 HP', '> 180 HP'] : ['Clase 5-6', 'Clase 7', 'Clase 8+'],
    datasets: [{
      label: `Sartor (${tipoActivo})`,
      data: reporte?.analisisPotencia ? [
        reporte.analisisPotencia.menor_100hp || 0, 
        reporte.analisisPotencia.rango_100_180hp || 0, 
        reporte.analisisPotencia.mayor_180hp || 0
      ] : [0,0,0],
      backgroundColor: '#367C2B',
      borderRadius: 8,
    }],
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6 text-left animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-800">Dashboard de Análisis</h2>
          <p className="text-slate-500">Visualización de Market Share y evolución de ventas.</p>
        </div>
        
        {/* SELECTOR DE TIPO */}
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setTipoActivo('Tractores')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${tipoActivo === 'Tractores' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Tractores
          </button>
          <button 
            onClick={() => setTipoActivo('Cosechadoras')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${tipoActivo === 'Cosechadoras' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Cosechadoras
          </button>
        </div>
      </div>

      {cargando ? (
        <div className="py-20 text-center text-slate-400 animate-pulse font-bold italic">Consultando datos en Firebase...</div>
      ) : reporte ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardKpi label="Market Share" value={`${reporte.marketShareGeneral}%`} sub="Total AOR" color="border-primary" />
            <CardKpi label="Unidades Vendidas" value={reporte.unidadesAOR || 0} sub="Sartor" color="border-secondary" />
            <CardKpi label="Potencial" value={reporte.potencialMercado || 0} sub="Industria" color="border-slate-300" />
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-lg mb-6">Unidades por Segmento ({tipoActivo === 'Tractores' ? 'Potencia HP' : 'Clase'})</h3>
            <div className="h-80">
              <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white border-2 border-dashed rounded-2xl py-20 text-center space-y-4">
          <p className="text-slate-400 font-medium">No se encontraron informes de <span className="font-black text-slate-600">{tipoActivo}</span> cargados.</p>
          <p className="text-xs text-slate-400 italic">Vaya a "Importar Datos" para subir el archivo correspondiente.</p>
        </div>
      )}
    </div>
  );
}

const CardKpi = ({ label, value, sub, color }) => (
  <div className={`bg-white p-6 rounded-2xl border-l-4 ${color} shadow-sm`}>
    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
    <div className="flex items-baseline gap-2">
      <p className="text-3xl font-black text-slate-800">{value}</p>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{sub}</span>
    </div>
  </div>
);