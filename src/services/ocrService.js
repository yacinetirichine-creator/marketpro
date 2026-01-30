// ============================================
// MARKET PRO - Service OCR (Tesseract.js)
// ============================================

import Tesseract from 'tesseract.js';

// Configuration du worker Tesseract
let worker = null;

/**
 * Initialise le worker Tesseract
 */
export const initializeOCR = async (lang = 'fra') => {
  if (worker) return worker;

  worker = await Tesseract.createWorker(lang, 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
      }
    }
  });

  return worker;
};

/**
 * Termine le worker Tesseract
 */
export const terminateOCR = async () => {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
};

/**
 * Reconnaissance OCR sur une image
 * @param {File|Blob|string} image - Image à analyser (File, Blob ou URL)
 * @param {Object} options - Options de reconnaissance
 * @returns {Promise<Object>} Résultat OCR avec texte et données parsées
 */
export const recognizeImage = async (image, options = {}) => {
  const { lang = 'fra', parseDeliveryNote = true } = options;

  try {
    // Initialiser le worker si nécessaire
    await initializeOCR(lang);

    // Reconnaissance
    const result = await worker.recognize(image);

    const ocrResult = {
      rawText: result.data.text,
      confidence: result.data.confidence,
      words: result.data.words,
      lines: result.data.lines,
      blocks: result.data.blocks
    };

    // Parser automatiquement si c'est un bon de livraison
    if (parseDeliveryNote) {
      ocrResult.parsed = parseDeliveryNoteText(result.data.text);
    }

    return ocrResult;
  } catch (error) {
    console.error('Erreur OCR:', error);
    throw new Error(`Erreur lors de la reconnaissance OCR: ${error.message}`);
  }
};

/**
 * Parse le texte d'un bon de livraison
 * @param {string} text - Texte brut de l'OCR
 * @returns {Object} Données structurées du BL
 */
export const parseDeliveryNoteText = (text) => {
  const result = {
    deliveryNoteNumber: null,
    blNumber: null,
    date: null,
    supplierName: null,
    supplierAddress: null,
    items: [],
    totalAmount: null,
    rawText: text
  };

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Patterns de reconnaissance
  const patterns = {
    // Numéro de BL
    blNumber: [
      /(?:BL|Bon de livraison|N[°o]?\s*BL)[:\s]*([A-Z0-9\-\/]+)/i,
      /(?:Livraison|Bordereau)[:\s]*([A-Z0-9\-\/]+)/i,
      /N[°o]\s*([A-Z]{2,3}[\-\/]?\d{4,})/i
    ],
    // Date
    date: [
      /(?:Date|Le)[:\s]*(\d{1,2}[\/.]\d{1,2}[\/.]\d{2,4})/i,
      /(\d{1,2}[\/.]\d{1,2}[\/.]\d{2,4})/
    ],
    // Montant total
    total: [
      /(?:Total|Montant|TTC)[:\s]*([0-9\s.,]+)\s*[€E]/i,
      /([0-9\s.,]+)\s*[€E]\s*(?:TTC|Total)/i
    ],
    // Ligne d'article
    itemLine: [
      // Ref | Description | Qté | Prix unitaire | Prix total
      /^([A-Z0-9\-]+)\s+(.+?)\s+(\d+(?:[.,]\d+)?)\s*(?:x|×)?\s*([0-9.,]+)\s*[€]?\s*(?:=|->)?\s*([0-9.,]+)/i,
      // Description | Qté | Prix
      /^(.+?)\s+(\d+(?:[.,]\d+)?)\s+(?:kg|pce|pièce|colis|carton)?\s*([0-9.,]+)\s*[€]?/i
    ]
  };

  // Rechercher le numéro de BL
  for (const pattern of patterns.blNumber) {
    const match = text.match(pattern);
    if (match) {
      result.blNumber = match[1];
      result.deliveryNoteNumber = match[1];
      break;
    }
  }

  // Rechercher la date
  for (const pattern of patterns.date) {
    const match = text.match(pattern);
    if (match) {
      result.date = parseDate(match[1]);
      break;
    }
  }

  // Rechercher le total
  for (const pattern of patterns.total) {
    const match = text.match(pattern);
    if (match) {
      result.totalAmount = parseFloat(match[1].replace(/\s/g, '').replace(',', '.'));
      break;
    }
  }

  // Parser les lignes d'articles
  for (const line of lines) {
    const item = parseItemLine(line);
    if (item) {
      result.items.push(item);
    }
  }

  // Calculer le score de confiance du parsing
  result.parseConfidence = calculateParseConfidence(result);

  return result;
};

/**
 * Parse une ligne d'article
 */
const parseItemLine = (line) => {
  // Pattern: référence optionnelle, description, quantité, unité optionnelle, prix
  const patterns = [
    // Avec référence: "REF123 Tomates bio 5 kg 2.50"
    /^([A-Z0-9\-]{3,15})\s+(.+?)\s+(\d+(?:[.,]\d+)?)\s*(kg|g|l|ml|pce|pièce|colis|carton|palette)?\s*(?:x|@|à)?\s*(\d+[.,]\d{2})\s*[€]?\s*(?:=)?\s*(\d+[.,]\d{2})?/i,
    // Sans référence: "Tomates bio 5 kg 2.50"
    /^(.+?)\s+(\d+(?:[.,]\d+)?)\s*(kg|g|l|ml|pce|pièce|colis|carton|palette)?\s*(?:x|@|à)?\s*(\d+[.,]\d{2})\s*[€]?/i
  ];

  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match) {
      // Déterminer si on a une référence ou pas
      const hasRef = match.length > 5;

      return {
        reference: hasRef ? match[1] : null,
        description: hasRef ? match[2] : match[1],
        name: hasRef ? match[2] : match[1],
        quantity: parseFloat((hasRef ? match[3] : match[2]).replace(',', '.')),
        unit: (hasRef ? match[4] : match[3])?.toUpperCase() || 'PIECE',
        unitPrice: parseFloat((hasRef ? match[5] : match[4]).replace(',', '.')),
        totalPrice: hasRef && match[6] ? parseFloat(match[6].replace(',', '.')) : null
      };
    }
  }

  return null;
};

/**
 * Parse une date française
 */
const parseDate = (dateStr) => {
  const parts = dateStr.split(/[\/.]/);
  if (parts.length === 3) {
    let [day, month, year] = parts;
    if (year.length === 2) {
      year = '20' + year;
    }
    return new Date(year, month - 1, day).toISOString();
  }
  return null;
};

/**
 * Calcule un score de confiance pour le parsing
 */
const calculateParseConfidence = (result) => {
  let score = 0;
  let maxScore = 100;

  if (result.blNumber) score += 25;
  if (result.date) score += 20;
  if (result.items.length > 0) score += 35;
  if (result.totalAmount) score += 20;

  return Math.round((score / maxScore) * 100);
};

/**
 * Prétraitement d'image pour améliorer l'OCR
 */
export const preprocessImage = async (imageFile) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Redimensionner si trop grand
      const maxSize = 2000;
      let { width, height } = img;

      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Dessiner l'image
      ctx.drawImage(img, 0, 0, width, height);

      // Améliorer le contraste
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        // Convertir en niveaux de gris
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;

        // Augmenter le contraste
        const contrast = 1.5;
        const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
        const newValue = Math.min(255, Math.max(0, factor * (avg - 128) + 128));

        // Binarisation
        const threshold = 140;
        const finalValue = newValue > threshold ? 255 : 0;

        data[i] = finalValue;
        data[i + 1] = finalValue;
        data[i + 2] = finalValue;
      }

      ctx.putImageData(imageData, 0, 0);

      // Retourner le canvas comme blob
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    };

    img.onerror = reject;

    if (imageFile instanceof File || imageFile instanceof Blob) {
      img.src = URL.createObjectURL(imageFile);
    } else {
      img.src = imageFile;
    }
  });
};

/**
 * Reconnaissance OCR avec prétraitement
 */
export const recognizeWithPreprocessing = async (image, options = {}) => {
  try {
    // Prétraiter l'image
    const processedImage = await preprocessImage(image);

    // Reconnaissance
    return await recognizeImage(processedImage, options);
  } catch (error) {
    console.error('Erreur lors du prétraitement:', error);
    // Fallback sur l'image originale
    return await recognizeImage(image, options);
  }
};

/**
 * Extraire les données d'un code QR/code-barres via OCR
 */
export const extractBarcodeFromImage = async (image) => {
  const result = await recognizeImage(image, { parseDeliveryNote: false });

  // Chercher des patterns de codes-barres dans le texte
  const barcodePatterns = [
    /\b(\d{13})\b/, // EAN-13
    /\b(\d{8})\b/,  // EAN-8
    /\b([A-Z0-9]{10,20})\b/ // Codes alphanumériques
  ];

  const barcodes = [];

  for (const pattern of barcodePatterns) {
    const matches = result.rawText.match(new RegExp(pattern, 'g'));
    if (matches) {
      barcodes.push(...matches);
    }
  }

  return {
    barcodes: [...new Set(barcodes)],
    rawText: result.rawText,
    confidence: result.confidence
  };
};

// Export par défaut
const ocrService = {
  initializeOCR,
  terminateOCR,
  recognizeImage,
  recognizeWithPreprocessing,
  parseDeliveryNoteText,
  preprocessImage,
  extractBarcodeFromImage
};

export default ocrService;
