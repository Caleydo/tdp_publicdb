/* KILL ALL EXISTING CONNECTION FROM ORIGINAL DB (sourcedb)*/
SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'postgres' AND pid <> pg_backend_pid();

/* CLONE DATABASE TO NEW ONE(TARGET_DB) */
CREATE DATABASE postgres-tiny WITH TEMPLATE postgres OWNER postgres;
