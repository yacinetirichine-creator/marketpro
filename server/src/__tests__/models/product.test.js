// ============================================
// MARKET PRO API - Product Model Tests
// ============================================

const Product = require('../../models/Product');

describe('Product Model', () => {
  describe('Validation', () => {
    it('should create a valid product', async () => {
      const productData = {
        sku: 'VALID-001',
        barcode: '1234567890123',
        name: 'Valid Product',
        category: 'EPICERIE',
        pricing: {
          purchasePrice: 10,
          sellingPrice: 15,
          taxRate: 20
        },
        stock: {
          quantity: 100,
          minQuantity: 10
        }
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct._id).toBeDefined();
      expect(savedProduct.sku).toBe('VALID-001');
      expect(savedProduct.name).toBe('Valid Product');
    });

    it('should require SKU', async () => {
      const product = new Product({
        name: 'No SKU Product',
        category: 'EPICERIE',
        pricing: { purchasePrice: 10, sellingPrice: 15, taxRate: 20 }
      });

      await expect(product.save()).rejects.toThrow();
    });

    it('should require name', async () => {
      const product = new Product({
        sku: 'NO-NAME-001',
        category: 'EPICERIE',
        pricing: { purchasePrice: 10, sellingPrice: 15, taxRate: 20 }
      });

      await expect(product.save()).rejects.toThrow();
    });

    it('should enforce unique SKU', async () => {
      await global.testHelpers.createTestProduct({ sku: 'UNIQUE-SKU' });

      const duplicateProduct = new Product({
        sku: 'UNIQUE-SKU',
        name: 'Duplicate SKU',
        category: 'EPICERIE',
        pricing: { purchasePrice: 10, sellingPrice: 15, taxRate: 20 }
      });

      await expect(duplicateProduct.save()).rejects.toThrow();
    });

    it('should validate category enum', async () => {
      const product = new Product({
        sku: 'INVALID-CAT',
        name: 'Invalid Category',
        category: 'INVALID_CATEGORY',
        pricing: { purchasePrice: 10, sellingPrice: 15, taxRate: 20 }
      });

      await expect(product.save()).rejects.toThrow();
    });

    it('should require positive prices', async () => {
      const product = new Product({
        sku: 'NEG-PRICE',
        name: 'Negative Price',
        category: 'EPICERIE',
        pricing: { purchasePrice: -10, sellingPrice: 15, taxRate: 20 }
      });

      await expect(product.save()).rejects.toThrow();
    });
  });

  describe('Virtual Fields', () => {
    it('should calculate margin', async () => {
      const product = await global.testHelpers.createTestProduct({
        sku: 'MARGIN-001',
        pricing: {
          purchasePrice: 10,
          sellingPrice: 15,
          taxRate: 20
        }
      });

      expect(product.margin).toBe(5);
    });

    it('should calculate marginPercent', async () => {
      const product = await global.testHelpers.createTestProduct({
        sku: 'MARGIN-PCT',
        pricing: {
          purchasePrice: 10,
          sellingPrice: 15,
          taxRate: 20
        }
      });

      expect(product.marginPercent).toBe(50);
    });

    it('should calculate priceWithTax', async () => {
      const product = await global.testHelpers.createTestProduct({
        sku: 'TAX-001',
        pricing: {
          purchasePrice: 10,
          sellingPrice: 100,
          taxRate: 20
        }
      });

      expect(product.priceWithTax).toBe(120);
    });

    it('should determine stockStatus as OK', async () => {
      const product = await global.testHelpers.createTestProduct({
        sku: 'STOCK-OK',
        stock: {
          quantity: 100,
          minQuantity: 10
        }
      });

      expect(product.stockStatus).toBe('OK');
    });

    it('should determine stockStatus as LOW', async () => {
      const product = await global.testHelpers.createTestProduct({
        sku: 'STOCK-LOW',
        stock: {
          quantity: 5,
          minQuantity: 10
        }
      });

      expect(product.stockStatus).toBe('LOW');
    });

    it('should determine stockStatus as OUT', async () => {
      const product = await global.testHelpers.createTestProduct({
        sku: 'STOCK-OUT',
        stock: {
          quantity: 0,
          minQuantity: 10
        }
      });

      expect(product.stockStatus).toBe('OUT');
    });
  });

  describe('Stock Management', () => {
    it('should default stock quantity to 0', async () => {
      const product = new Product({
        sku: 'DEFAULT-STOCK',
        name: 'Default Stock',
        category: 'EPICERIE',
        pricing: { purchasePrice: 10, sellingPrice: 15, taxRate: 20 }
      });

      await product.save();

      expect(product.stock.quantity).toBe(0);
    });

    it('should track reserved stock', async () => {
      const product = await global.testHelpers.createTestProduct({
        sku: 'RESERVED-001',
        stock: {
          quantity: 100,
          minQuantity: 10,
          reserved: 20
        }
      });

      expect(product.stock.reserved).toBe(20);
    });
  });

  describe('Location (WMS)', () => {
    it('should store warehouse location', async () => {
      const product = await global.testHelpers.createTestProduct({
        sku: 'WMS-001',
        location: {
          warehouse: 'PRINCIPAL',
          zone: 'A',
          aisle: '01',
          shelf: '03',
          position: '05'
        }
      });

      expect(product.location.warehouse).toBe('PRINCIPAL');
      expect(product.location.zone).toBe('A');
      expect(product.location.shelf).toBe('03');
    });
  });

  describe('Categories', () => {
    const validCategories = [
      'FRUITS_LEGUMES',
      'VIANDES',
      'POISSONS',
      'PRODUITS_LAITIERS',
      'EPICERIE',
      'BOISSONS',
      'SURGELES',
      'BOULANGERIE',
      'HYGIENE',
      'ENTRETIEN',
      'CONSERVES',
      'CONDIMENTS',
      'AUTRES'
    ];

    validCategories.forEach(category => {
      it(`should accept category: ${category}`, async () => {
        const product = new Product({
          sku: `CAT-${category}`,
          name: `${category} Product`,
          category: category,
          pricing: { purchasePrice: 10, sellingPrice: 15, taxRate: 20 }
        });

        await product.save();
        expect(product.category).toBe(category);
      });
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt and updatedAt', async () => {
      const product = await global.testHelpers.createTestProduct({
        sku: 'TIMESTAMPS-001'
      });

      expect(product.createdAt).toBeDefined();
      expect(product.updatedAt).toBeDefined();
    });
  });

  describe('Active Status', () => {
    it('should default to active', async () => {
      const product = await global.testHelpers.createTestProduct({
        sku: 'ACTIVE-DEFAULT'
      });

      expect(product.isActive).toBe(true);
    });

    it('should allow deactivating product', async () => {
      const product = await global.testHelpers.createTestProduct({
        sku: 'INACTIVE-001',
        isActive: false
      });

      expect(product.isActive).toBe(false);
    });
  });
});
