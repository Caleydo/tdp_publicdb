-- set variables
\set GENE_LIMIT 1000
\set TISSUE_LIMIT 500
\set CELLLINE_LIMIT 500
\set ORIGINAL_DBNAME ordino
\set SNAPSHOT_DBNAME ordino_dev
\set DB_USER ordino
\set DB_PASSWORD yRxTTPXFkiOMO89T9QMj
-----------------
-- ORDINO -------
-----------------
\connect :ORIGINAL_DBNAME;
--public
DROP schema IF EXISTS _public CASCADE;
CREATE schema _public;
CREATE TABLE _public.targid_gene AS
	Select * from targid_gene LIMIT :GENE_LIMIT;
ALTER TABLE _public.targid_gene ADD CONSTRAINT pk_gene PRIMARY KEY(ensg);
CREATE TABLE _public.targid_geneassignment AS
	Select * from targid_geneassignment where ensg in (select ensg from _public.targid_gene) ;
ALTER TABLE _public.targid_geneassignment ADD CONSTRAINT pk_geneassignment PRIMARY KEY(ensg, genesetname);
CREATE TABLE _public.targid_geneset AS
	Select * from targid_geneset;
ALTER TABLE _public.targid_geneset ADD CONSTRAINT pk_geneset PRIMARY KEY(genesetname);
--tissue
DROP schema IF EXISTS _tissue CASCADE;
CREATE schema _tissue;
CREATE TABLE _tissue.targid_tissue AS
	Select * from tissue.targid_tissue LIMIT :TISSUE_LIMIT ;
ALTER TABLE _tissue.targid_tissue ADD CONSTRAINT pk_tissue PRIMARY KEY(tissuename);
CREATE TABLE _tissue.targid_panel AS
	Select * from tissue.targid_panel ;
ALTER TABLE _tissue.targid_panel ADD CONSTRAINT pk_tissuepanel PRIMARY KEY(panel);
CREATE TABLE _tissue.targid_panelassignment AS
	Select * from tissue.targid_panelassignment where tissuename in (select tissuename from _tissue.targid_tissue) ;
ALTER TABLE _tissue.targid_panelassignment ADD CONSTRAINT pk_tissueassignment PRIMARY KEY(panel, tissuename);
CREATE TABLE _tissue.targid_mutation AS
	Select * from tissue.targid_mutation where tissuename in (select tissuename from _tissue.targid_tissue) and ensg in (select ensg from _public.targid_gene) ;
CREATE TABLE _tissue.targid_expression AS
	Select * from tissue.targid_expression where tissuename in (select tissuename from _tissue.targid_tissue) and ensg in (select ensg from _public.targid_gene) ;
CREATE TABLE _tissue.targid_copynumber AS
	Select * from tissue.targid_copynumber where tissuename in (select tissuename from _tissue.targid_tissue) and ensg in (select ensg from _public.targid_gene) ;
--cellline
DROP schema IF EXISTS _cellline CASCADE;
CREATE schema _cellline;
CREATE TABLE _cellline.targid_cellline AS
	Select * from cellline.targid_cellline LIMIT :CELLLINE_LIMIT;
CREATE TABLE _cellline.targid_panel AS
	Select * from cellline.targid_panel;
CREATE TABLE _cellline.targid_panelassignment AS
	Select * from cellline.targid_panelassignment where celllinename in (select celllinename from _cellline.targid_cellline) ;
CREATE TABLE _cellline.targid_mutation AS
	Select * from cellline.targid_mutation where celllinename in (select celllinename from _cellline.targid_cellline) and ensg in (select ensg from _public.targid_gene) ;
CREATE TABLE _cellline.targid_expression AS
	Select * from cellline.targid_expression where celllinename in (select celllinename from _cellline.targid_cellline) and ensg in (select ensg from _public.targid_gene) ;
CREATE TABLE _cellline.targid_copynumber AS
	Select * from cellline.targid_copynumber where celllinename in (select celllinename from _cellline.targid_cellline) and ensg in (select ensg from _public.targid_gene) ;
-----------------
-- ORDINO_DEV ---
-----------------
-- connect to dev
\connect :SNAPSHOT_DBNAME;
-- add extension
DROP schema IF EXISTS public CASCADE;
CREATE schema public;
CREATE EXTENSION IF NOT EXISTS postgres_fdw;
-- connect to db
CREATE SERVER origServer FOREIGN DATA WRAPPER postgres_fdw OPTIONS (host 'localhost', dbname :'ORIGINAL_DBNAME', port '5432');
CREATE USER MAPPING FOR ordino SERVER origServer OPTIONS(user :'DB_USER', password :'DB_PASSWORD');

--enums

DROP TYPE IF EXISTS biotype_enum;
CREATE TYPE biotype_enum AS ENUM ('TR_J_gene', 'misc_RNA', 'TR_D_gene', 'Mt_rRNA', 'IG_D_gene',
'vaultRNA', 'scRNA', 'polymorphic_pseudogene', 'transcribed_unitary_pseudogene', 'unitary_pseudogene',
'processed_pseudogene', '3prime_overlapping_ncRNA', 'antisense', 'IG_V_pseudogene', 'IG_V_gene',
'non_coding', 'IG_LV_gene', 'ribozyme', 'transcribed_processed_pseudogene', 'miRNA',
'sRNA', 'IG_C_gene', 'scaRNA', 'snRNA', 'TR_J_pseudogene',
'TR_V_pseudogene', 'LRG_gene', 'processed_transcript', 'transcribed_unprocessed_pseudogene', 'TR_C_gene',
'Mt_tRNA', 'bidirectional_promoter_lncRNA', 'pseudogene', 'protein_coding', 'TR_V_gene',
'sense_intronic', 'IG_C_pseudogene', 'IG_J_gene', 'unprocessed_pseudogene', 'lincRNA',
'sense_overlapping', 'snoRNA', 'IG_pseudogene', 'macro_lncRNA', 'rRNA',
'TEC', 'IG_D_pseudogene', 'IG_J_pseudogene', '3prime_overlapping_ncrna');

DROP TYPE IF EXISTS species_enum;
CREATE TYPE species_enum AS ENUM('human', 'mouse', 'rat');

DROP TYPE IF EXISTS tumortype_enum;
CREATE TYPE tumortype_enum AS ENUM('placenta carcinomar', 'breast carcinoma', 'hematopoietic/leukemia',
'normal', 'ovarian carcinoma', 'NSCLC', 'mesothelioma', 'retinoblastoma', 'medulloblastoma', 'renal carcinoma',
'gastric carcinoma', 'SCLC', 'hematopoietic/myeloma', 'rhabdomyosarcoma', 'uterus carcinoma', 'bladder carcinoma',
'renal cancer other', 'skin/SCC', 'cervix carcinoma', 'prostate benign hyperplasia', 'melanoma',
'adrenal gland carcinoma', 'esophagus carcinoma', 'astrocytoma/glioblastoma', 'bone sarcoma',
'pancreas carcinoma', 'SCLC/neuroendocrine', 'neuroblastoma', 'thyroid carcinoma', 'prostate carcinoma',
'liver carcinoma', 'colon carcinoma', 'pancreatic insulinoma', 'hematopoietic/lymphoma', 'HNSCC',
'vulva carcinoma', 'gallbladder carcinoma', 'sarcoma/soft tissue');


-- import data
DROP schema IF EXISTS _public CASCADE;
DROP schema IF EXISTS _tissue CASCADE;
DROP schema IF EXISTS _cellline CASCADE;
CREATE schema _public;
CREATE schema _tissue;
CREATE schema _cellline;
IMPORT FOREIGN SCHEMA _public FROM SERVER origServer INTO _public;
IMPORT FOREIGN SCHEMA _tissue FROM SERVER origServer INTO _tissue;
IMPORT FOREIGN SCHEMA _cellline FROM SERVER origServer INTO _cellline;

-- genes
DROP TABLE IF EXISTS public.targid_gene CASCADE;
CREATE TABLE public.targid_gene AS Select * from _public.targid_gene;
ALTER TABLE public.targid_gene ADD CONSTRAINT pk_gene PRIMARY KEY(ensg);

DROP TABLE IF EXISTS public.targid_geneassignment CASCADE;
CREATE TABLE public.targid_geneassignment AS Select * from _public.targid_geneassignment;
ALTER TABLE public.targid_geneassignment ADD CONSTRAINT pk_geneassignment PRIMARY KEY(ensg, genesetname);
DROP TABLE IF EXISTS public.targid_geneset CASCADE;
CREATE TABLE public.targid_geneset AS Select * from _public.targid_geneset;
ALTER TABLE public.targid_geneset ADD CONSTRAINT pk_geneset PRIMARY KEY(genesetname);

--tissue
CREATE schema IF NOT EXISTS tissue;

DROP TABLE IF EXISTS tissue.targid_tissue CASCADE;
CREATE TABLE tissue.targid_tissue AS Select * from _tissue.targid_tissue;
ALTER TABLE tissue.targid_tissue ADD CONSTRAINT pk_tissue PRIMARY KEY(tissuename);

DROP TABLE IF EXISTS tissue.targid_tissue CASCADE;
CREATE TABLE tissue.targid_panel AS Select * from _tissue.targid_panel;
ALTER TABLE tissue.targid_panel ADD CONSTRAINT pk_tissuepanel PRIMARY KEY(panel);

DROP TABLE IF EXISTS tissue.targid_panelassignment CASCADE;
CREATE TABLE tissue.targid_panelassignment AS Select * from _tissue.targid_panelassignment;
ALTER TABLE tissue.targid_panelassignment ADD CONSTRAINT pk_tissueassignment PRIMARY KEY(panel, tissuename);

DROP TABLE IF EXISTS tissue.targid_mutation CASCADE;
CREATE TABLE tissue.targid_mutation AS Select * from _tissue.targid_mutation;
ALTER TABLE tissue.targid_mutation ADD CONSTRAINT pk_mutation PRIMARY KEY(ensg, tissuename);
CREATE INDEX ON tissue.targid_mutation(tissuename);

DROP TABLE IF EXISTS tissue.targid_expression CASCADE;
CREATE TABLE tissue.targid_expression AS Select * from _tissue.targid_expression;
ALTER TABLE tissue.targid_expression ADD CONSTRAINT pk_expression PRIMARY KEY(ensg, tissuename);
CREATE INDEX ON tissue.targid_expression(tissuename);

DROP TABLE IF EXISTS tissue.targid_copynumber CASCADE;
CREATE TABLE tissue.targid_copynumber AS Select * from _tissue.targid_copynumber;
ALTER TABLE tissue.targid_copynumber ADD CONSTRAINT pk_copynumber PRIMARY KEY(ensg, tissuename);
CREATE INDEX ON tissue.targid_copynumber(tissuename);
--
CREATE OR REPLACE VIEW tissue.targid_data AS
 SELECT omics.ensg,
    omics.tissuename,
    max(omics.copynumberclass) AS copynumberclass,
    max(omics.tpm) AS tpm,
    every(omics.dna_mutated) AS dna_mutated,
    every(omics.aa_mutated) AS aa_mutated
   FROM ( SELECT targid_copynumber.ensg,
            targid_copynumber.tissuename,
            targid_copynumber.copynumberclass,
            NULL::double precision AS tpm,
            NULL::boolean AS dna_mutated,
            NULL::boolean AS aa_mutated
           FROM tissue.targid_copynumber
        UNION ALL
         SELECT targid_expression.ensg,
            targid_expression.tissuename,
            NULL::smallint AS copynumberclass,
            targid_expression.tpm,
            NULL::boolean AS dna_mutated,
            NULL::boolean AS aa_mutated
           FROM tissue.targid_expression
        UNION ALL
         SELECT targid_mutation.ensg,
            targid_mutation.tissuename,
            NULL::smallint AS copynumberclass,
            NULL::double precision AS tpm,
            targid_mutation.dna_mutated,
            targid_mutation.aa_mutated
           FROM tissue.targid_mutation) omics
  GROUP BY omics.ensg, omics.tissuename;
  
--cellline
CREATE schema IF NOT EXISTS cellline;

DROP TABLE IF EXISTS cellline.targid_cellline CASCADE;
CREATE TABLE cellline.targid_cellline AS Select * from _cellline.targid_cellline;
ALTER TABLE cellline.targid_cellline ADD CONSTRAINT pk_cellline PRIMARY KEY(celllinename);

DROP TABLE IF EXISTS cellline.targid_panel CASCADE;
CREATE TABLE cellline.targid_panel AS Select * from _cellline.targid_panel;
ALTER TABLE cellline.targid_panel ADD CONSTRAINT pk_celllinepanel PRIMARY KEY(panel);

DROP TABLE IF EXISTS cellline.targid_panelassignment CASCADE;
CREATE TABLE cellline.targid_panelassignment AS Select * from _cellline.targid_panelassignment;
ALTER TABLE cellline.targid_panelassignment ADD CONSTRAINT pk_celllineassignment PRIMARY KEY(panel, celllinename);

DROP TABLE IF EXISTS cellline.targid_mutation CASCADE;
CREATE TABLE cellline.targid_mutation AS Select * from _cellline.targid_mutation;
ALTER TABLE cellline.targid_mutation ADD CONSTRAINT pk_mutation PRIMARY KEY(ensg, celllinename);
CREATE INDEX ON cellline.targid_mutation(celllinename);

DROP TABLE IF EXISTS cellline.targid_expression CASCADE;
CREATE TABLE cellline.targid_expression AS Select * from _cellline.targid_expression;
ALTER TABLE cellline.targid_expression ADD CONSTRAINT pk_expression PRIMARY KEY(ensg, celllinename);
CREATE INDEX ON cellline.targid_expression(celllinename);

DROP TABLE IF EXISTS cellline.targid_copynumber CASCADE;
CREATE TABLE cellline.targid_copynumber AS Select * from _cellline.targid_copynumber;
ALTER TABLE cellline.targid_copynumber ADD CONSTRAINT pk_copynumber PRIMARY KEY(ensg, celllinename);
CREATE INDEX ON cellline.targid_copynumber(celllinename);
--
CREATE OR REPLACE VIEW cellline.targid_data AS
 SELECT omics.ensg,
    omics.celllinename,
    max(omics.copynumberclass) AS copynumberclass,
    max(omics.tpm) AS tpm,
    every(omics.dna_mutated) AS dna_mutated,
    every(omics.aa_mutated) AS aa_mutated
   FROM ( SELECT targid_copynumber.ensg,
            targid_copynumber.celllinename,
            targid_copynumber.copynumberclass,
            NULL::double precision AS tpm,
            NULL::boolean AS dna_mutated,
            NULL::boolean AS aa_mutated
           FROM cellline.targid_copynumber
        UNION ALL
         SELECT targid_expression.ensg,
            targid_expression.celllinename,
            NULL::smallint AS copynumberclass,
            targid_expression.tpm,
            NULL::boolean AS dna_mutated,
            NULL::boolean AS aa_mutated
           FROM cellline.targid_expression
        UNION ALL
         SELECT targid_mutation.ensg,
            targid_mutation.celllinename,
            NULL::smallint AS copynumberclass,
            NULL::double precision AS tpm,
            targid_mutation.dna_mutated,
            targid_mutation.aa_mutated
           FROM cellline.targid_mutation) omics
  GROUP BY omics.ensg, omics.celllinename;
-- drop schemas
DROP SCHEMA _public CASCADE;
DROP SCHEMA _tissue CASCADE;
DROP SCHEMA _cellline CASCADE;
-- drop server
DROP SERVER origServer CASCADE;
DROP EXTENSION postgres_fdw;
-----------------
-- ORDINO -------
-----------------
-- connect to origServer
\connect :ORIGINAL_DBNAME;
-- drop schemas
--DROP SCHEMA _public CASCADE;
--DROP SCHEMA _tissue CASCADE;
--DROP SCHEMA _cellline CASCADE;
