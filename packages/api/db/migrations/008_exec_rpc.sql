-- RPC helper for running migrations via Supabase.
CREATE OR REPLACE FUNCTION exec(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

REVOKE ALL ON FUNCTION exec(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION exec(text) FROM anon;
REVOKE ALL ON FUNCTION exec(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION exec(text) TO service_role;
