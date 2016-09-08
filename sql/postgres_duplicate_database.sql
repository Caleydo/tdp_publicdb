/* KILL ALL EXISTING CONNECTION FROM ORIGINAL DB (sourcedb)*/
SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'postgres' AND pid <> pg_backend_pid();

/* CLONE DATABASE TO NEW ONE(TARGET_DB) */
CREATE DATABASE postgres-tiny WITH TEMPLATE postgres OWNER postgres;

DELETE FROM cellline.targid_cellline
WHERE celllinename NOT IN (SELECT celllinename FROM cellline.targid_cellline ORDER BY celllinename LIMIT 100);

DELETE FROM cellline.targid_copynumber
WHERE ensg NOT IN (SELECT ensg FROM cellline.targid_copynumber ORDER BY ensg LIMIT 100);

DELETE FROM cellline.targid_expression
WHERE ensg NOT IN (SELECT ensg FROM cellline.targid_expression ORDER BY ensg LIMIT 100);

DELETE FROM cellline.targid_mutation
WHERE ensg NOT IN (SELECT ensg FROM cellline.targid_mutation ORDER BY ensg LIMIT 100);

DELETE FROM tissue.targid_tissue
WHERE tissuename NOT IN (SELECT tissuename FROM tissue.targid_tissue ORDER BY tissuename LIMIT 100);

DELETE FROM tissue.targid_copynumber
WHERE ensg NOT IN (SELECT ensg FROM tissue.targid_tissue ORDER BY ensg LIMIT 100);

DELETE FROM tissue.targid_expression
WHERE ensg NOT IN (SELECT ensg FROM tissue.targid_tissue ORDER BY ensg LIMIT 100);

DELETE FROM tissue.targid_mutation
WHERE ensg NOT IN (SELECT ensg FROM tissue.targid_tissue ORDER BY ensg LIMIT 100);

DELETE FROM public.targid_gene
WHERE ensg NOT IN (SELECT ensg FROM public.targid_gene ORDER BY ensg LIMIT 100);
