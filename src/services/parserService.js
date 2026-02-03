import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// Forzamos el uso del worker desde un CDN confiable que coincida con la librería
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export const processReport = async (file, onProgress) => {
  // 1. Subida a Firebase Storage
  const storageRef = ref(storage, `reports/${Date.now()}_${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);
  
  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed', 
      (snap) => onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 40)),
      (err) => reject(err),
      async () => {
        try {
          const fileUrl = await getDownloadURL(storageRef);
          onProgress(50);

          // 2. Lectura del PDF
          const arrayBuffer = await file.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          
          let textoCompleto = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            textoCompleto += content.items.map(item => item.str).join(" ");
          }
          
          onProgress(80);

          // 3. Lógica de Negocio: Identificación y Agrupación
          const esTractor = textoCompleto.toLowerCase().includes("tractor");
          
          // Extraemos el Market Share total de Sartor (ejemplo de búsqueda)
          const shareMatch = textoCompleto.match(/MarketShare\s+(\d+\.?\d*)%/i);
          const shareTotal = shareMatch ? parseFloat(shareMatch[1]) : 0;

          // Estructura de datos según tus requisitos de potencia
          const dataFinal = {
            nombreArchivo: file.name,
            archivoUrl: fileUrl,
            tipo: esTractor ? "Tractores" : "Cosechadoras",
            fechaCarga: serverTimestamp(),
            marketShareGeneral: shareTotal,
            // Aquí sumaremos los datos según los 3 grupos solicitados
            analisisPotencia: {
              menor_100hp: 0,   // Suma de <50 hasta 100 HP
              rango_100_180hp: 0, // Suma de 100 hasta 180 HP
              mayor_180hp: 0    // Suma de 180 HP en adelante
            },
            rawText: textoCompleto.substring(0, 1000) // Para auditoría
          };

          // 4. Guardar en Firestore
          const docRef = await addDoc(collection(db, "reports"), dataFinal);
          onProgress(100);
          resolve({ id: docRef.id, ...dataFinal });
        } catch (err) {
          console.error("Error en procesamiento:", err);
          reject(err);
        }
      }
    );
  });
};