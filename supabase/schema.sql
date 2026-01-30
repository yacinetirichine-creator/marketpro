-- ============================================
-- MARKET PRO - Schema Supabase (PostgreSQL)
-- ============================================

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: profiles (extension de auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'COMMERCIAL' CHECK (role IN ('ADMIN', 'MANAGER', 'COMMERCIAL', 'CAISSIER', 'MAGASINIER', 'COMPTABLE', 'CLIENT')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  permissions TEXT[] DEFAULT '{}',
  preferences JSONB DEFAULT '{"theme": "dark", "language": "fr", "notifications": {"email": true, "push": true}}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger pour créer automatiquement un profil
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- TABLE: suppliers (fournisseurs) - AVANT products pour la FK
-- ============================================
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  
  -- Entreprise
  company_name TEXT NOT NULL,
  siret TEXT,
  website TEXT,
  
  -- Contact
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  
  -- Adresse
  address_street TEXT,
  address_city TEXT,
  address_postal_code TEXT,
  address_country TEXT DEFAULT 'France',
  
  -- Conditions
  payment_terms INTEGER DEFAULT 30,
  delivery_time INTEGER DEFAULT 3,
  minimum_order DECIMAL(10,2) DEFAULT 0,
  
  -- Catégories fournies
  categories TEXT[],
  
  -- Autres
  rating DECIMAL(3,2) DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'BLOCKED')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: products (après suppliers pour la FK)
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  barcode TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('FRUITS_LEGUMES', 'VIANDES', 'POISSONS', 'PRODUITS_LAITIERS', 'EPICERIE', 'BOISSONS', 'SURGELES', 'BOULANGERIE', 'HYGIENE', 'ENTRETIEN', 'CONSERVES', 'CONDIMENTS', 'AUTRES')),
  sub_category TEXT,
  brand TEXT,
  
  -- Prix
  purchase_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  selling_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 20,
  
  -- Stock
  stock_quantity INTEGER DEFAULT 0,
  min_stock_quantity INTEGER DEFAULT 10,
  max_stock_quantity INTEGER,
  reserved_quantity INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'PIECE' CHECK (unit IN ('PIECE', 'KG', 'LITRE', 'CARTON', 'PALETTE')),
  
  -- WMS Location
  warehouse TEXT DEFAULT 'PRINCIPAL',
  zone TEXT,
  aisle TEXT,
  shelf TEXT,
  position TEXT,
  
  -- Autres
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  supplier_id UUID REFERENCES suppliers(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(to_tsvector('french', name));

-- ============================================
-- TABLE: clients
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'PROFESSIONNEL' CHECK (type IN ('PARTICULIER', 'PROFESSIONNEL', 'GROSSISTE', 'REVENDEUR')),
  
  -- Entreprise
  company_name TEXT NOT NULL,
  legal_form TEXT,
  siret TEXT,
  tva_number TEXT,
  
  -- Contact
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  
  -- Adresse
  address_street TEXT,
  address_city TEXT,
  address_postal_code TEXT,
  address_country TEXT DEFAULT 'France',
  
  -- Commercial
  category TEXT DEFAULT 'STANDARD' CHECK (category IN ('STANDARD', 'SILVER', 'GOLD', 'PLATINUM')),
  payment_terms INTEGER DEFAULT 30,
  discount_rate DECIMAL(5,2) DEFAULT 0,
  credit_limit DECIMAL(10,2) DEFAULT 0,
  
  -- Stats
  total_orders INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  balance DECIMAL(10,2) DEFAULT 0,
  
  -- Autres
  notes TEXT,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'BLOCKED', 'PROSPECT')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_code ON clients(code);
CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company_name);

-- ============================================
-- TABLE: orders (commandes)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  
  client_id UUID REFERENCES clients(id) NOT NULL,
  user_id UUID REFERENCES profiles(id),
  
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'COMPLETED', 'CANCELLED')),
  
  -- Montants
  subtotal DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Paiement
  payment_status TEXT DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PARTIAL', 'PAID', 'REFUNDED')),
  payment_method TEXT,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Livraison
  shipping_address JSONB,
  delivery_date DATE,
  delivered_at TIMESTAMPTZ,
  
  -- Notes
  notes TEXT,
  internal_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_client ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(created_at);

-- ============================================
-- TABLE: order_items (lignes de commande)
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  discount_rate DECIMAL(5,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 20,
  
  subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price * (1 - discount_rate / 100)) STORED,
  total DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price * (1 - discount_rate / 100) * (1 + tax_rate / 100)) STORED,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: invoices (factures)
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  
  client_id UUID REFERENCES clients(id) NOT NULL,
  order_id UUID REFERENCES orders(id),
  
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED')),
  
  -- Dates
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_date DATE,
  
  -- Montants
  subtotal DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  balance DECIMAL(10,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
  
  -- PDF
  pdf_url TEXT,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- ============================================
-- TABLE: invoice_items
-- ============================================
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id),
  
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 20,
  
  subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  total DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price * (1 + tax_rate / 100)) STORED,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: payments (paiements)
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  
  client_id UUID REFERENCES clients(id) NOT NULL,
  invoice_id UUID REFERENCES invoices(id),
  
  amount DECIMAL(10,2) NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('CASH', 'CHECK', 'BANK_TRANSFER', 'CARD', 'OTHER')),
  status TEXT DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
  
  -- Pour les chèques
  check_number TEXT,
  check_bank TEXT,
  check_date DATE,
  
  -- Pour les virements
  bank_reference TEXT,
  
  notes TEXT,
  
  payment_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_client ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);

-- ============================================
-- TABLE: stock_movements
-- ============================================
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  product_id UUID REFERENCES products(id) NOT NULL,
  user_id UUID REFERENCES profiles(id),
  
  type TEXT NOT NULL CHECK (type IN ('IN_PURCHASE', 'IN_RETURN', 'IN_ADJUSTMENT', 'IN_TRANSFER', 'OUT_SALE', 'OUT_RETURN', 'OUT_ADJUSTMENT', 'OUT_TRANSFER', 'OUT_LOSS')),
  
  quantity INTEGER NOT NULL,
  unit_cost DECIMAL(10,2),
  
  -- Stock avant/après
  stock_before INTEGER,
  stock_after INTEGER,
  
  -- Références
  reference_type TEXT,
  reference_id UUID,
  
  -- Lot / Traçabilité
  lot_number TEXT,
  expiry_date DATE,
  
  reason TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(created_at);

-- ============================================
-- TABLE: audit_logs
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource TEXT,
  resource_id UUID,
  
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  
  severity TEXT DEFAULT 'INFO' CHECK (severity IN ('INFO', 'WARNING', 'ERROR', 'CRITICAL')),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_date ON audit_logs(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies pour profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Policies pour products (lecture pour tous les utilisateurs authentifiés)
CREATE POLICY "Authenticated users can view products" ON products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and managers can manage products" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER', 'MAGASINIER'))
  );

-- Policies pour suppliers
CREATE POLICY "Authenticated users can view suppliers" ON suppliers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and managers can manage suppliers" ON suppliers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER'))
  );

-- Policies pour clients
CREATE POLICY "Authenticated users can view clients" ON clients
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and commercials can manage clients" ON clients
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER', 'COMMERCIAL'))
  );

-- Policies pour orders
CREATE POLICY "Authenticated users can view orders" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage orders" ON orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER', 'COMMERCIAL', 'CAISSIER'))
  );

-- Policies pour order_items
CREATE POLICY "Authenticated users can view order items" ON order_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage order items" ON order_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER', 'COMMERCIAL', 'CAISSIER'))
  );

-- Policies pour invoices
CREATE POLICY "Authenticated users can view invoices" ON invoices
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and comptables can manage invoices" ON invoices
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER', 'COMPTABLE'))
  );

-- Policies pour invoice_items
CREATE POLICY "Authenticated users can view invoice items" ON invoice_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and comptables can manage invoice items" ON invoice_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER', 'COMPTABLE'))
  );

-- Policies pour payments
CREATE POLICY "Authenticated users can view payments" ON payments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and comptables can manage payments" ON payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER', 'COMPTABLE', 'CAISSIER'))
  );

-- Policies pour stock_movements
CREATE POLICY "Authenticated users can view stock movements" ON stock_movements
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Warehouse staff can manage stock" ON stock_movements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER', 'MAGASINIER'))
  );

-- Policies pour audit_logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "All users can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- FONCTIONS UTILITAIRES
-- ============================================

-- Fonction pour générer un numéro de commande
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  year_prefix TEXT;
  sequence_num INTEGER;
BEGIN
  year_prefix := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 9) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM orders
  WHERE order_number LIKE 'CMD-' || year_prefix || '-%';
  
  new_number := 'CMD-' || year_prefix || '-' || LPAD(sequence_num::TEXT, 5, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer un numéro de facture
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  year_prefix TEXT;
  sequence_num INTEGER;
BEGIN
  year_prefix := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 9) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM invoices
  WHERE invoice_number LIKE 'FAC-' || year_prefix || '-%';
  
  new_number := 'FAC-' || year_prefix || '-' || LPAD(sequence_num::TEXT, 5, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer un code client
CREATE OR REPLACE FUNCTION generate_client_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  sequence_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 4) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM clients;
  
  new_code := 'CLI' || LPAD(sequence_num::TEXT, 6, '0');
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur toutes les tables avec updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- DONNÉES INITIALES (SEEDS)
-- ============================================

-- Insérer des fournisseurs
INSERT INTO suppliers (code, company_name, contact_name, contact_email, contact_phone, categories, status) VALUES
('FRN001', 'FruitExpress France', 'Marc Legrand', 'contact@fruitexpress.fr', '0145678901', ARRAY['FRUITS_LEGUMES'], 'ACTIVE'),
('FRN002', 'Viandes Premium SAS', 'Sophie Martin', 'commandes@viandespremium.fr', '0156789012', ARRAY['VIANDES'], 'ACTIVE'),
('FRN003', 'Lactalis Distribution', 'Pierre Blanc', 'pro@lactalis.fr', '0167890123', ARRAY['PRODUITS_LAITIERS'], 'ACTIVE'),
('FRN004', 'Épicerie Fine Import', 'Claire Dubois', 'contact@epicerie-import.fr', '0178901234', ARRAY['EPICERIE', 'CONSERVES'], 'ACTIVE')
ON CONFLICT (code) DO NOTHING;

-- Insérer des produits
INSERT INTO products (sku, barcode, name, category, purchase_price, selling_price, tax_rate, stock_quantity, min_stock_quantity, warehouse, zone, aisle, shelf) VALUES
('FL001', '3760123456789', 'Pommes Golden 1kg', 'FRUITS_LEGUMES', 1.50, 2.49, 5.5, 500, 50, 'PRINCIPAL', 'A', '01', '01'),
('FL002', '3760123456790', 'Bananes 1kg', 'FRUITS_LEGUMES', 1.20, 1.99, 5.5, 300, 30, 'PRINCIPAL', 'A', '01', '02'),
('FL003', '3760123456791', 'Tomates grappe 500g', 'FRUITS_LEGUMES', 1.80, 2.99, 5.5, 200, 40, 'PRINCIPAL', 'A', '02', '01'),
('VI001', '3760123456800', 'Poulet entier Label Rouge', 'VIANDES', 6.50, 9.99, 5.5, 100, 20, 'PRINCIPAL', 'B', '01', '01'),
('VI002', '3760123456801', 'Steak haché 15% MG x4', 'VIANDES', 4.00, 6.49, 5.5, 150, 30, 'PRINCIPAL', 'B', '01', '02'),
('PL001', '3760123456810', 'Lait demi-écrémé 1L', 'PRODUITS_LAITIERS', 0.70, 1.09, 5.5, 600, 100, 'PRINCIPAL', 'C', '01', '01'),
('PL002', '3760123456811', 'Beurre doux 250g', 'PRODUITS_LAITIERS', 1.50, 2.49, 5.5, 200, 40, 'PRINCIPAL', 'C', '01', '02'),
('EP001', '3760123456820', 'Pâtes Penne 500g', 'EPICERIE', 0.60, 1.29, 5.5, 400, 50, 'PRINCIPAL', 'D', '01', '01'),
('EP002', '3760123456821', 'Riz Basmati 1kg', 'EPICERIE', 1.50, 2.99, 5.5, 300, 40, 'PRINCIPAL', 'D', '01', '02'),
('BO001', '3760123456830', 'Eau minérale 1.5L x6', 'BOISSONS', 1.50, 2.49, 5.5, 200, 50, 'PRINCIPAL', 'E', '01', '01')
ON CONFLICT (sku) DO NOTHING;

-- Insérer des clients
INSERT INTO clients (code, type, company_name, contact_name, contact_email, contact_phone, address_city, category, payment_terms, discount_rate, credit_limit, status) VALUES
('CLI000001', 'PROFESSIONNEL', 'Restaurant Le Gourmet', 'Jean Durand', 'contact@legourmet.fr', '0123456789', 'Paris', 'GOLD', 30, 10, 10000, 'ACTIVE'),
('CLI000002', 'PROFESSIONNEL', 'Hôtel Bellevue', 'Marie Lambert', 'achats@hotelbellevue.fr', '0234567890', 'Nice', 'PLATINUM', 45, 15, 50000, 'ACTIVE'),
('CLI000003', 'PROFESSIONNEL', 'Cantine Scolaire Jules Ferry', 'Paul Robert', 'cantine@julesferry.edu', '0345678901', 'Marseille', 'SILVER', 60, 5, 5000, 'ACTIVE'),
('CLI000004', 'GROSSISTE', 'Super Marché Plus', 'Isabelle Michel', 'achats@superplus.fr', '0456789012', 'Lille', 'PLATINUM', 30, 20, 100000, 'ACTIVE'),
('CLI000005', 'PROFESSIONNEL', 'Traiteur Événements', 'Thomas Garcia', 'commande@traiteur-event.fr', '0567890123', 'Toulouse', 'GOLD', 30, 10, 15000, 'ACTIVE')
ON CONFLICT (code) DO NOTHING;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Schema Market Pro créé avec succès!';
END $$;
