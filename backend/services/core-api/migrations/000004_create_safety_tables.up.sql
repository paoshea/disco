-- Create enum types
CREATE TYPE incident_type AS ENUM (
    'harassment',
    'inappropriate',
    'impersonation',
    'scam',
    'emergency',
    'other'
);

CREATE TYPE incident_status AS ENUM (
    'pending',
    'reviewing',
    'resolved',
    'dismissed'
);

-- Create safety_reports table
CREATE TABLE safety_reports (
    id UUID PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES users(id),
    reported_id UUID NOT NULL REFERENCES users(id),
    type incident_type NOT NULL,
    description TEXT,
    status incident_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT different_users CHECK (reporter_id != reported_id)
);

-- Create evidence table
CREATE TABLE evidence (
    id UUID PRIMARY KEY,
    report_id UUID NOT NULL REFERENCES safety_reports(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create emergency_contacts table
CREATE TABLE emergency_contacts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    relation VARCHAR(100),
    notify_on TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create user_blocks table
CREATE TABLE user_blocks (
    id UUID PRIMARY KEY,
    blocker_id UUID NOT NULL REFERENCES users(id),
    blocked_id UUID NOT NULL REFERENCES users(id),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT different_users CHECK (blocker_id != blocked_id),
    UNIQUE(blocker_id, blocked_id)
);

-- Create emergency_alerts table
CREATE TABLE emergency_alerts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    accuracy REAL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_safety_reports_reporter ON safety_reports(reporter_id);
CREATE INDEX idx_safety_reports_reported ON safety_reports(reported_id);
CREATE INDEX idx_safety_reports_status ON safety_reports(status);
CREATE INDEX idx_evidence_report ON evidence(report_id);
CREATE INDEX idx_emergency_contacts_user ON emergency_contacts(user_id);
CREATE INDEX idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX idx_user_blocks_blocked ON user_blocks(blocked_id);
CREATE INDEX idx_emergency_alerts_user ON emergency_alerts(user_id);
CREATE INDEX idx_emergency_alerts_status ON emergency_alerts(status);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_safety_reports_updated_at
    BEFORE UPDATE ON safety_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at
    BEFORE UPDATE ON emergency_contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
