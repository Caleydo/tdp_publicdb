\set ON_ERROR_ROLLBACK interactive
begin;

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

DROP VIEW IF EXISTS tissue.targid_tissue CASCADE;
DROP VIEW IF EXISTS cellline.targid_cellline CASCADE;
DROP VIEW IF EXISTS targid_gene CASCADE;
DROP VIEW IF EXISTS targid_geneset;

ALTER TABLE cellline.cellline alter column species TYPE species_enum USING species::species_enum;
ALTER TABLE tissue.tissue alter column species TYPE species_enum USING species::species_enum;
ALTER TABLE public.geneset ALTER COLUMN species TYPE species_enum USING species::species_enum;

ALTER TABLE public.gene ALTER COLUMN biotype TYPE biotype_enum USING biotype::biotype_enum;

ALTER TABLE cellline.cellline ALTER COLUMN tumortype TYPE tumortype_enum USING tumortype::tumortype_enum;

commit;