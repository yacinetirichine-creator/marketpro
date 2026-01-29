// ============================================
// MARKET PRO - Service de génération PDF
// ============================================

import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Configuration de l'entreprise (à personnaliser)
const companyInfo = {
  name: 'Market Pro',
  address: '123 Avenue du Commerce',
  city: '75001 Paris, France',
  phone: '+33 1 23 45 67 89',
  email: 'contact@marketpro.fr',
  siret: '123 456 789 00012',
  tva: 'FR 12 345678901',
  website: 'www.marketpro.fr',
  bankName: 'Banque Nationale',
  iban: 'FR76 1234 5678 9012 3456 7890 123',
  bic: 'BNPAFRPP'
};

// Couleurs du thème
const colors = {
  primary: [0, 212, 170],     // #00D4AA
  secondary: [45, 45, 45],     // #2D2D2D
  text: [30, 30, 30],          // #1E1E1E
  lightGray: [245, 245, 245],  // #F5F5F5
  gray: [128, 128, 128],       // #808080
  success: [76, 175, 80],      // #4CAF50
  warning: [255, 152, 0],      // #FF9800
  danger: [244, 67, 54]        // #F44336
};

/**
 * Service de génération de documents PDF
 */
class PDFService {
  constructor() {
    this.doc = null;
    this.pageWidth = 210;
    this.pageHeight = 297;
    this.margin = 20;
    this.contentWidth = this.pageWidth - (this.margin * 2);
  }

  /**
   * Initialiser un nouveau document PDF
   */
  initDocument(orientation = 'portrait') {
    this.doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4'
    });
    
    // Police par défaut
    this.doc.setFont('helvetica');
    
    return this;
  }

  /**
   * Ajouter l'en-tête de l'entreprise
   */
  addHeader() {
    const doc = this.doc;
    
    // Logo placeholder (rectangle avec texte)
    doc.setFillColor(...colors.primary);
    doc.rect(this.margin, 15, 40, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('MARKET PRO', this.margin + 4, 25);
    
    // Informations entreprise
    doc.setTextColor(...colors.text);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const startX = this.pageWidth - this.margin;
    doc.text(companyInfo.name, startX, 18, { align: 'right' });
    doc.text(companyInfo.address, startX, 23, { align: 'right' });
    doc.text(companyInfo.city, startX, 28, { align: 'right' });
    doc.text(`Tél: ${companyInfo.phone}`, startX, 33, { align: 'right' });
    doc.text(`Email: ${companyInfo.email}`, startX, 38, { align: 'right' });
    
    // Ligne de séparation
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(0.5);
    doc.line(this.margin, 45, this.pageWidth - this.margin, 45);

    return 50;
  }

  /**
   * Ajouter le pied de page
   */
  addFooter(pageNumber, totalPages) {
    const doc = this.doc;
    const y = this.pageHeight - 15;
    
    // Ligne de séparation
    doc.setDrawColor(...colors.gray);
    doc.setLineWidth(0.3);
    doc.line(this.margin, y - 5, this.pageWidth - this.margin, y - 5);
    
    // Informations légales
    doc.setFontSize(8);
    doc.setTextColor(...colors.gray);
    doc.text(`SIRET: ${companyInfo.siret} | TVA: ${companyInfo.tva}`, this.margin, y);
    
    // Numéro de page
    doc.text(
      `Page ${pageNumber}/${totalPages}`,
      this.pageWidth - this.margin,
      y,
      { align: 'right' }
    );
  }

  /**
   * Formater un montant en euros
   */
  formatMoney(amount) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  }

  /**
   * Formater une date
   */
  formatDate(date) {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  }

  // ============================================
  // FACTURE
  // ============================================

  /**
   * Générer une facture PDF
   */
  generateInvoice(invoice) {
    this.initDocument();
    const doc = this.doc;
    let y = this.addHeader();

    // Titre FACTURE
    doc.setFillColor(...colors.primary);
    doc.rect(this.margin, y, this.contentWidth, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURE', this.pageWidth / 2, y + 8, { align: 'center' });
    y += 20;

    // Informations facture et client (2 colonnes)
    const colWidth = this.contentWidth / 2 - 5;

    // Colonne gauche - Infos facture
    doc.setTextColor(...colors.text);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Informations facture', this.margin, y);
    y += 6;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`N° Facture: ${invoice.invoice_number || invoice.invoiceNumber}`, this.margin, y);
    y += 5;
    doc.text(`Date d'émission: ${this.formatDate(invoice.issue_date || invoice.issueDate)}`, this.margin, y);
    y += 5;
    doc.text(`Date d'échéance: ${this.formatDate(invoice.due_date || invoice.dueDate)}`, this.margin, y);
    y += 5;
    
    // Statut avec couleur
    const status = invoice.status || 'DRAFT';
    const statusColors = {
      DRAFT: colors.gray,
      SENT: colors.warning,
      PAID: colors.success,
      PARTIAL: colors.warning,
      OVERDUE: colors.danger,
      CANCELLED: colors.danger
    };
    const statusLabels = {
      DRAFT: 'Brouillon',
      SENT: 'Envoyée',
      PAID: 'Payée',
      PARTIAL: 'Partiellement payée',
      OVERDUE: 'En retard',
      CANCELLED: 'Annulée'
    };
    
    doc.setTextColor(...(statusColors[status] || colors.gray));
    doc.setFont('helvetica', 'bold');
    doc.text(`Statut: ${statusLabels[status] || status}`, this.margin, y);
    y -= 16; // Remonter pour la colonne droite

    // Colonne droite - Infos client
    const clientX = this.margin + colWidth + 10;
    doc.setTextColor(...colors.text);
    doc.setFont('helvetica', 'bold');
    doc.text('Facturer à:', clientX, y);
    y += 6;
    
    const client = invoice.client || {};
    doc.setFont('helvetica', 'normal');
    doc.text(client.company_name || client.companyName || 'Client', clientX, y);
    y += 5;
    if (client.address_street || client.addressStreet) {
      doc.text(client.address_street || client.addressStreet, clientX, y);
      y += 5;
    }
    if (client.address_city || client.addressCity) {
      doc.text(`${client.address_postal_code || client.addressPostalCode || ''} ${client.address_city || client.addressCity}`, clientX, y);
      y += 5;
    }
    if (client.tva_number || client.tvaNumber) {
      doc.text(`TVA: ${client.tva_number || client.tvaNumber}`, clientX, y);
    }
    
    y += 15;

    // Tableau des articles
    const items = invoice.items || [];
    const tableData = items.map(item => [
      item.description || item.product?.name || 'Article',
      item.quantity?.toString() || '1',
      this.formatMoney(item.unit_price || item.unitPrice),
      `${item.tax_rate || item.taxRate || 20}%`,
      this.formatMoney((item.quantity || 1) * (item.unit_price || item.unitPrice || 0))
    ]);

    doc.autoTable({
      startY: y,
      head: [['Description', 'Qté', 'Prix unitaire', 'TVA', 'Total HT']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: colors.primary,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 35, halign: 'right' }
      },
      margin: { left: this.margin, right: this.margin },
      styles: {
        fontSize: 9,
        cellPadding: 4
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    // Totaux
    const totalsX = this.pageWidth - this.margin - 60;
    const totalsValueX = this.pageWidth - this.margin;

    doc.setFont('helvetica', 'normal');
    doc.text('Sous-total HT:', totalsX, y);
    doc.text(this.formatMoney(invoice.subtotal || invoice.subTotal), totalsValueX, y, { align: 'right' });
    y += 6;

    if (invoice.discount_amount || invoice.discountAmount) {
      doc.text('Remise:', totalsX, y);
      doc.text(`-${this.formatMoney(invoice.discount_amount || invoice.discountAmount)}`, totalsValueX, y, { align: 'right' });
      y += 6;
    }

    doc.text('TVA:', totalsX, y);
    doc.text(this.formatMoney(invoice.tax_amount || invoice.taxAmount), totalsValueX, y, { align: 'right' });
    y += 8;

    // Total TTC
    doc.setFillColor(...colors.primary);
    doc.rect(totalsX - 5, y - 5, 70, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL TTC:', totalsX, y);
    doc.text(this.formatMoney(invoice.total_amount || invoice.totalAmount), totalsValueX, y, { align: 'right' });
    y += 15;

    // Montant payé et reste à payer
    doc.setTextColor(...colors.text);
    doc.setFont('helvetica', 'normal');
    if (invoice.paid_amount || invoice.paidAmount) {
      doc.text('Montant payé:', totalsX, y);
      doc.text(this.formatMoney(invoice.paid_amount || invoice.paidAmount), totalsValueX, y, { align: 'right' });
      y += 6;

      const balance = (invoice.total_amount || invoice.totalAmount) - (invoice.paid_amount || invoice.paidAmount);
      if (balance > 0) {
        doc.setTextColor(...colors.danger);
        doc.setFont('helvetica', 'bold');
        doc.text('Reste à payer:', totalsX, y);
        doc.text(this.formatMoney(balance), totalsValueX, y, { align: 'right' });
      }
    }

    y += 15;

    // Conditions de paiement
    doc.setTextColor(...colors.text);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Conditions de paiement:', this.margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Paiement à ${invoice.payment_terms || 30} jours à réception de facture`, this.margin, y);
    y += 10;

    // Coordonnées bancaires
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Coordonnées bancaires:', this.margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Banque: ${companyInfo.bankName}`, this.margin, y);
    y += 4;
    doc.text(`IBAN: ${companyInfo.iban}`, this.margin, y);
    y += 4;
    doc.text(`BIC: ${companyInfo.bic}`, this.margin, y);

    // Pied de page
    this.addFooter(1, 1);

    return this.doc;
  }

  // ============================================
  // BON DE COMMANDE
  // ============================================

  /**
   * Générer un bon de commande PDF
   */
  generateOrder(order) {
    this.initDocument();
    const doc = this.doc;
    let y = this.addHeader();

    // Titre
    doc.setFillColor(...colors.secondary);
    doc.rect(this.margin, y, this.contentWidth, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('BON DE COMMANDE', this.pageWidth / 2, y + 8, { align: 'center' });
    y += 20;

    // Informations commande
    doc.setTextColor(...colors.text);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`N° Commande: ${order.order_number || order.orderNumber}`, this.margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${this.formatDate(order.created_at || order.createdAt)}`, this.margin, y);
    y += 10;

    // Client
    const client = order.client || {};
    doc.setFont('helvetica', 'bold');
    doc.text('Client:', this.margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(client.company_name || client.companyName || 'Client', this.margin, y);
    y += 15;

    // Tableau des articles
    const items = order.items || [];
    const tableData = items.map(item => [
      item.product?.name || item.description || 'Article',
      item.product?.sku || '-',
      item.quantity?.toString() || '1',
      this.formatMoney(item.unit_price || item.unitPrice),
      this.formatMoney((item.quantity || 1) * (item.unit_price || item.unitPrice || 0))
    ]);

    doc.autoTable({
      startY: y,
      head: [['Produit', 'SKU', 'Qté', 'Prix unitaire', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: colors.secondary,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      margin: { left: this.margin, right: this.margin }
    });

    y = doc.lastAutoTable.finalY + 15;

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Total TTC: ${this.formatMoney(order.total_amount || order.totalAmount)}`, 
      this.pageWidth - this.margin, y, { align: 'right' });

    // Notes
    if (order.notes) {
      y += 15;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes:', this.margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(order.notes, this.margin, y);
    }

    this.addFooter(1, 1);

    return this.doc;
  }

  // ============================================
  // BON DE LIVRAISON
  // ============================================

  /**
   * Générer un bon de livraison PDF
   */
  generateDeliveryNote(order) {
    this.initDocument();
    const doc = this.doc;
    let y = this.addHeader();

    // Titre
    doc.setFillColor(...colors.success);
    doc.rect(this.margin, y, this.contentWidth, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('BON DE LIVRAISON', this.pageWidth / 2, y + 8, { align: 'center' });
    y += 20;

    // Informations
    doc.setTextColor(...colors.text);
    doc.setFontSize(10);
    doc.text(`Commande N°: ${order.order_number || order.orderNumber}`, this.margin, y);
    y += 6;
    doc.text(`Date de livraison: ${this.formatDate(order.delivery_date || order.deliveryDate || new Date())}`, this.margin, y);
    y += 10;

    // Client et adresse de livraison
    const client = order.client || {};
    doc.setFont('helvetica', 'bold');
    doc.text('Livrer à:', this.margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(client.company_name || client.companyName || 'Client', this.margin, y);
    y += 5;
    
    const shippingAddress = order.shipping_address || order.shippingAddress || {};
    if (shippingAddress.street) {
      doc.text(shippingAddress.street, this.margin, y);
      y += 5;
    }
    if (shippingAddress.city) {
      doc.text(`${shippingAddress.postalCode || ''} ${shippingAddress.city}`, this.margin, y);
    }
    y += 15;

    // Tableau des articles (sans prix)
    const items = order.items || [];
    const tableData = items.map(item => [
      item.product?.name || item.description || 'Article',
      item.product?.sku || '-',
      item.quantity?.toString() || '1',
      item.product?.unit || 'Pièce',
      '☐' // Case à cocher pour validation
    ]);

    doc.autoTable({
      startY: y,
      head: [['Produit', 'SKU', 'Quantité', 'Unité', 'Validé']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: colors.success,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        4: { halign: 'center' }
      },
      margin: { left: this.margin, right: this.margin }
    });

    y = doc.lastAutoTable.finalY + 20;

    // Zone de signature
    doc.setDrawColor(...colors.gray);
    doc.rect(this.margin, y, this.contentWidth / 2 - 5, 35);
    doc.rect(this.pageWidth / 2 + 2.5, y, this.contentWidth / 2 - 5, 35);

    doc.setFontSize(9);
    doc.setTextColor(...colors.gray);
    doc.text('Signature du livreur:', this.margin + 5, y + 8);
    doc.text('Signature du client:', this.pageWidth / 2 + 7.5, y + 8);

    doc.text('Date:', this.margin + 5, y + 30);
    doc.text('Date:', this.pageWidth / 2 + 7.5, y + 30);

    this.addFooter(1, 1);

    return this.doc;
  }

  // ============================================
  // RAPPORT DE STOCK
  // ============================================

  /**
   * Générer un rapport de stock PDF
   */
  generateStockReport(products, title = 'Rapport de Stock') {
    this.initDocument('landscape');
    const doc = this.doc;
    
    // Ajuster les dimensions pour le mode paysage
    const tempWidth = this.pageWidth;
    this.pageWidth = this.pageHeight;
    this.pageHeight = tempWidth;
    this.contentWidth = this.pageWidth - (this.margin * 2);

    let y = this.addHeader();

    // Titre
    doc.setTextColor(...colors.text);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, this.pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Généré le ${this.formatDate(new Date())}`, this.pageWidth / 2, y, { align: 'center' });
    y += 10;

    // Tableau des produits
    const tableData = products.map(p => {
      const stockStatus = p.stock_quantity < p.min_stock_quantity ? '⚠️ Bas' : '✓ OK';
      return [
        p.sku,
        p.name,
        p.category,
        p.stock_quantity?.toString() || '0',
        p.min_stock_quantity?.toString() || '10',
        stockStatus,
        this.formatMoney(p.purchase_price || p.purchasePrice),
        this.formatMoney((p.stock_quantity || 0) * (p.purchase_price || p.purchasePrice || 0))
      ];
    });

    doc.autoTable({
      startY: y,
      head: [['SKU', 'Produit', 'Catégorie', 'Stock', 'Min', 'Statut', 'Prix unitaire', 'Valeur stock']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: colors.primary,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: { fontSize: 8 },
      margin: { left: this.margin, right: this.margin }
    });

    y = doc.lastAutoTable.finalY + 10;

    // Résumé
    const totalProducts = products.length;
    const lowStockCount = products.filter(p => p.stock_quantity < p.min_stock_quantity).length;
    const totalValue = products.reduce((sum, p) => 
      sum + ((p.stock_quantity || 0) * (p.purchase_price || p.purchasePrice || 0)), 0);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Résumé:', this.margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre de produits: ${totalProducts}`, this.margin, y);
    y += 5;
    doc.text(`Produits en alerte stock: ${lowStockCount}`, this.margin, y);
    y += 5;
    doc.text(`Valeur totale du stock: ${this.formatMoney(totalValue)}`, this.margin, y);

    this.addFooter(1, 1);

    return this.doc;
  }

  // ============================================
  // UTILITAIRES
  // ============================================

  /**
   * Sauvegarder le PDF
   */
  save(filename) {
    if (this.doc) {
      this.doc.save(filename);
    }
  }

  /**
   * Obtenir le PDF en Blob
   */
  getBlob() {
    if (this.doc) {
      return this.doc.output('blob');
    }
    return null;
  }

  /**
   * Obtenir le PDF en base64
   */
  getBase64() {
    if (this.doc) {
      return this.doc.output('datauristring');
    }
    return null;
  }

  /**
   * Ouvrir le PDF dans un nouvel onglet
   */
  openInNewTab() {
    if (this.doc) {
      const blob = this.doc.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  }
}

// Export du service
export const pdfService = new PDFService();

// Export des fonctions utilitaires
export const generateInvoicePDF = (invoice, options = {}) => {
  const pdf = pdfService.generateInvoice(invoice);
  if (options.download) {
    pdfService.save(`facture_${invoice.invoice_number || invoice.invoiceNumber}.pdf`);
  }
  if (options.open) {
    pdfService.openInNewTab();
  }
  return pdf;
};

export const generateOrderPDF = (order, options = {}) => {
  const pdf = pdfService.generateOrder(order);
  if (options.download) {
    pdfService.save(`commande_${order.order_number || order.orderNumber}.pdf`);
  }
  if (options.open) {
    pdfService.openInNewTab();
  }
  return pdf;
};

export const generateDeliveryNotePDF = (order, options = {}) => {
  const pdf = pdfService.generateDeliveryNote(order);
  if (options.download) {
    pdfService.save(`bl_${order.order_number || order.orderNumber}.pdf`);
  }
  if (options.open) {
    pdfService.openInNewTab();
  }
  return pdf;
};

export const generateStockReportPDF = (products, title, options = {}) => {
  const pdf = pdfService.generateStockReport(products, title);
  if (options.download) {
    const date = new Date().toISOString().split('T')[0];
    pdfService.save(`rapport_stock_${date}.pdf`);
  }
  if (options.open) {
    pdfService.openInNewTab();
  }
  return pdf;
};

export default pdfService;
