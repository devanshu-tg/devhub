-- Drops the TigerGraph connection storage table created in 001.
-- Run this in the Supabase SQL editor after deploying the redesign that removes
-- the GSQL-AI module. No per-user data loss beyond stored connection credentials.
DROP TABLE IF EXISTS user_tigergraph_connections CASCADE;
