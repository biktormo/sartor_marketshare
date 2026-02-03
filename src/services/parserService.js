import * as pdfjsLib from 'pdfjs-dist';
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// Versión CDN más estable para el worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export const processReport = async (file, onProgress) => {
  console.log("processReport iniciado para:", file.name);
  
  // 1. Subida a Storage
  const storageRef = ref(storage, `reports/${Date.now()}_${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);
  
  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed', 
      (snapshot) => {
        const p = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 50);
        onProgress(p);
      },
      (error) => { console.error("Error subiendo:", error); reject(error); },
      async () => {
        try {
          const fileUrl = await getDownloadURL(storageRef);
          console.log("Archivo en Storage:", fileUrl);
          onProgress(60);

          // 2. Lectura del PDF
          const arrayBuffer = await file.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          console.log(`PDF cargado: ${pdf.numPages} páginas`);

          let text = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(" ");
          }
          
          onProgress(85);
          console.log("Texto extraído (primeros 100 caracteres):", text.substring(0, 100));

          // 3. Guardar en Firestore
          const reportData = {
            fileName: file.name,
            fileUrl,
            type: text.includes("Tractor") ? "tractors" : (text.includes("Combine") ? "combines" : "other"),
            timestamp: serverTimestamp(),
            rawText: text.substring(0, 500) // Guardamos un resumen
          };

          const docRef = await addDoc(collection(db, "reports"), reportData);
          onProgress(100);
          resolve({ id: docRef.id, ...reportData });
        } catch (err) {
          console.error("Error en procesamiento interno:", err);
          reject(err);
        }
      }
    );
  });
};