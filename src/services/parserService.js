import * as pdfjsLib from 'pdfjs-dist';
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// Usamos una versión fija y verificada del worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

export const processReport = async (file, onProgress) => {
  const storageRef = ref(storage, `reports/${Date.now()}_${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);
  
  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed', 
      (snap) => onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 50)),
      (err) => reject(err),
      async () => {
        try {
          const fileUrl = await getDownloadURL(storageRef);
          onProgress(60);

          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          
          let fullText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            fullText += content.items.map(item => item.str).join(" ");
          }
          
          onProgress(90);

          // Lógica de detección y extracción básica
          const esTractor = fullText.includes("Tractor");
          const esCosechadora = fullText.includes("Combine");

          // Aquí prepararemos el objeto para Firestore
          const datosProcesados = {
            nombreArchivo: file.name,
            archivoUrl: fileUrl,
            tipo: esTractor ? "Tractores" : (esCosechadora ? "Cosechadoras" : "Otros"),
            fechaProcesado: serverTimestamp(),
            // Agregamos datos iniciales de Market Share total (extraídos por posición o regex)
            marketShareGeneral: extraerShareGeneral(fullText),
            segmentosHP: {
              menor_100: 0, // Aquí sumaremos los datos de <50 a 100 HP
              entre_100_180: 0, // Aquí sumaremos de 100 a 180 HP
              mayor_180: 0 // Aquí sumaremos de 180 en adelante
            }
          };

          const docRef = await addDoc(collection(db, "reports"), datosProcesados);
          onProgress(100);
          resolve({ id: docRef.id, ...datosProcesados });
        } catch (err) {
          console.error("Error detallado:", err);
          reject(err);
        }
      }
    );
  });
};

// Función auxiliar para intentar pescar el número de Market Share
function extraerShareGeneral(texto) {
  const match = texto.match(/MarketShare\s+(\d+\.?\d*)%/i);
  return match ? parseFloat(match[1]) : 0;
}