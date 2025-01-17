-- Drop triggers
DROP TRIGGER IF EXISTS update_safety_reports_updated_at ON safety_reports;
DROP TRIGGER IF EXISTS update_emergency_contacts_updated_at ON emergency_contacts;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables
DROP TABLE IF EXISTS emergency_alerts;
DROP TABLE IF EXISTS user_blocks;
DROP TABLE IF EXISTS emergency_contacts;
DROP TABLE IF EXISTS evidence;
DROP TABLE IF EXISTS safety_reports;

-- Drop enum types
DROP TYPE IF EXISTS incident_type;
DROP TYPE IF EXISTS incident_status;
