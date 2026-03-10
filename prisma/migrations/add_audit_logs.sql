-- Add audit_logs table for security and compliance tracking
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  metadata_json JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX idx_audit_logs_org_id ON audit_logs(org_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Add security_incidents table
CREATE TABLE IF NOT EXISTS security_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE SET NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  incident_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED')),
  metadata_json JSONB,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for security incidents
CREATE INDEX idx_security_incidents_org_id ON security_incidents(org_id);
CREATE INDEX idx_security_incidents_severity ON security_incidents(severity);
CREATE INDEX idx_security_incidents_status ON security_incidents(status);
CREATE INDEX idx_security_incidents_detected_at ON security_incidents(detected_at DESC);

-- Add anonymization tracking to marketplace_orders
ALTER TABLE marketplace_orders 
ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS data_retention_date TIMESTAMPTZ;

-- Create index for data retention queries
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_retention 
ON marketplace_orders(data_retention_date) 
WHERE anonymized_at IS NULL;

COMMENT ON TABLE audit_logs IS 'Security audit trail for all sensitive operations';
COMMENT ON TABLE security_incidents IS 'Security incident tracking and management';
COMMENT ON COLUMN marketplace_orders.anonymized_at IS 'Timestamp when PII was anonymized for data retention compliance';
COMMENT ON COLUMN marketplace_orders.data_retention_date IS 'Date when order data should be anonymized (90 days from creation)';
