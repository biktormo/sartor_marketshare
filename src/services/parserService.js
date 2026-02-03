import * as pdfjsLib from 'pdfjs-dist';
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// Configurar el worker de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const processReport = async (file, onProgress) => {
  try {
    // 1. Subir archivo original a Storage
    const storageRef = ref(storage, `reports/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    uploadTask.on('state_changed', (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 50; // Primer 50% es subida
      onProgress(Math.round(progress));
    });

    await uploadTask;
    const fileUrl = await getDownloadURL(storageRef);

    // 2. Extraer Texto del PDF
    onProgress(60);
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map(item => item.str).join(" ");
    }

    // 3. Lógica de Parseo (Detección de Tablas)
    onProgress(80);
    const isTractorReport = fullText.includes("Tractor Dealer Analysis");
    const isCombineReport = fullText.includes("Combine Dealer Analysis");
    
    const reportData = {
      name: file.name,
      url: fileUrl,
      type: isTractorReport ? 'tractors' : (isCombineReport ? 'combines' : 'unknown'),
      date: serverTimestamp(),
      content: {}
    };

    // Ejemplo de extracción para Tractores FYTD (basado en tus OCR)
    if (isTractorReport) {
      // Buscamos el Market Share total de la tabla FYTD
      const fytdMatch = fullText.match(/Tractor Dealer Analysis FYTD.*?MarketShare\s+(\d+\.?\d*)%/i);
      if (fytdMatch) reportData.content.fytd_share = parseFloat(fytdMatch[1]);
      
      // Aquí agregaremos más Regex para extraer cada segmento de HP (<100, 100-180, etc.)
    }

    // 4. Guardar en Firestore
    const docRef = await addDoc(collection(db, "reports"), reportData);
    onProgress(100);
    
    return { id: docRef.id, ...reportData };

  } catch (error) {
    console.error("Error procesando reporte:", error);
    throw error;
  }
};