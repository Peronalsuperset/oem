-- Users table for OEMs and vendors
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('oem', 'vendor')),
  gstin VARCHAR(15),
  pan VARCHAR(10),
  address TEXT,
  phone VARCHAR(15),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invoice templates
CREATE TABLE invoice_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oem_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  template_data JSONB NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Commission rules
CREATE TABLE commission_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oem_id UUID REFERENCES users(id),
  vendor_id UUID REFERENCES users(id),
  rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('percentage', 'fixed', 'tiered')),
  rule_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  oem_id UUID REFERENCES users(id),
  vendor_id UUID REFERENCES users(id),
  template_id UUID REFERENCES invoice_templates(id),
  order_value DECIMAL(12,2) NOT NULL,
  commission_amount DECIMAL(12,2) NOT NULL,
  gst_amount DECIMAL(12,2) NOT NULL,
  tds_amount DECIMAL(12,2) NOT NULL,
  final_payout DECIMAL(12,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  due_date DATE,
  invoice_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- HSN/SAC codes for GST calculation
CREATE TABLE hsn_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) NOT NULL,
  description TEXT,
  gst_rate DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample HSN codes
INSERT INTO hsn_codes (code, description, gst_rate) VALUES
('9983', 'Commission Services', 18.00),
('9984', 'Agent Services', 18.00),
('9985', 'Brokerage Services', 18.00);
