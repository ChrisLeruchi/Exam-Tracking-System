-- ============================================
-- APPEND-ONLY TRIGGERS
-- These prevent UPDATE and DELETE on audit tables
-- Even someone with direct DB access can't tamper
-- ============================================

-- Block UPDATE on result_versions
CREATE OR REPLACE FUNCTION block_update_result_versions()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'result_versions is append-only. UPDATE is not allowed.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS no_update_result_versions ON result_versions;
CREATE TRIGGER no_update_result_versions
  BEFORE UPDATE ON result_versions
  FOR EACH ROW
  EXECUTE FUNCTION block_update_result_versions();

-- Block DELETE on result_versions
CREATE OR REPLACE FUNCTION block_delete_result_versions()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'result_versions is append-only. DELETE is not allowed.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS no_delete_result_versions ON result_versions;
CREATE TRIGGER no_delete_result_versions
  BEFORE DELETE ON result_versions
  FOR EACH ROW
  EXECUTE FUNCTION block_delete_result_versions();

-- Block UPDATE on audit_log
CREATE OR REPLACE FUNCTION block_update_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only. UPDATE is not allowed.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS no_update_audit_log ON audit_log;
CREATE TRIGGER no_update_audit_log
  BEFORE UPDATE ON audit_log
  FOR EACH ROW
  EXECUTE FUNCTION block_update_audit_log();

-- Block DELETE on audit_log
CREATE OR REPLACE FUNCTION block_delete_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only. DELETE is not allowed.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS no_delete_audit_log ON audit_log;
CREATE TRIGGER no_delete_audit_log
  BEFORE DELETE ON audit_log
  FOR EACH ROW
  EXECUTE FUNCTION block_delete_audit_log();

-- ============================================
-- FLAG RESOLUTIONS TRIGGERS
-- flag_resolutions is also append-only
-- ============================================

-- Block UPDATE on flag_resolutions
CREATE OR REPLACE FUNCTION block_update_flag_resolutions()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'flag_resolutions is append-only. UPDATE is not allowed.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS no_update_flag_resolutions ON flag_resolutions;
CREATE TRIGGER no_update_flag_resolutions
  BEFORE UPDATE ON flag_resolutions
  FOR EACH ROW
  EXECUTE FUNCTION block_update_flag_resolutions();

-- Block DELETE on flag_resolutions
CREATE OR REPLACE FUNCTION block_delete_flag_resolutions()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'flag_resolutions is append-only. DELETE is not allowed.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS no_delete_flag_resolutions ON flag_resolutions;
CREATE TRIGGER no_delete_flag_resolutions
  BEFORE DELETE ON flag_resolutions
  FOR EACH ROW
  EXECUTE FUNCTION block_delete_flag_resolutions();
