import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [reporte, setReporte] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("fechaCarga", "desc"), limit(1));
    return onSnapshot(q, (snap) => {
      if (!snap.empty) setReporte(snap.docs[0].data());
    });
  }, []);

  if (!reporte) return <div className="p-20 text-center font-bold text-slate-400 italic">Cargando datos de Firebase...</div>;

  const chartData = {
    labels: ['< 100 HP', '100 - 180 HP', '> 180 HP'],
    datasets: [
      {
        label: 'Sartor (Unidades)',
        data: reporte.analisisPotencia ? [
          reporte.analisisPotencia.menor_100hp, 
          reporte.analisisPotencia.rango_100_180hp, 
          reporte.analisisPotencia.mayor_180hp
        ] : [0,0,0],
        backgroundColor: '#367C2B',
        borderRadius: 8,
      }
    ],
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800">Dashboard de {reporte.tipo}</h2>
          <p className="text-slate-500">Último informe: {reporte.nombreArchivo}</p>
        </div>
        <div className="bg-primary/10 px-4 py-2 rounded-lg text-primary font-bold">
          Market Share: {reporte.marketShareGeneral}%
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardKpi label="Unidades AOR" value={reporte.unidadesAOR} color="border-primary" />
        <CardKpi label="Potencial" value={reporte.potencialMercado} color="border-secondary" />
        <CardKpi label="Brecha" value={reporte.potencialMercado - reporte.unidadesAOR} color="border-slate-300" />
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-lg mb-6">Unidades por Segmento de Potencia</h3>
        <div className="h-80">
          <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
}

const CardKpi = ({ label, value, color }) => (
  <div className={`bg-white p-6 rounded-2xl border-l-4 ${color} shadow-sm`}>
    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{label}</p>
    <p className="text-3xl font-black text-slate-800">{value}</p>
  </div>
);