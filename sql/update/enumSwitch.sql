CREATE TYPE biotype_enum AS ENUM ('TR_J_gene', 'misc_RNA', 'TR_D_gene', 'Mt_rRNA', 'IG_D_gene',
'vaultRNA', 'scRNA', 'polymorphic_pseudogene', 'transcribed_unitary_pseudogene', 'unitary_pseudogene',
'processed_pseudogene', '3prime_overlapping_ncRNA', 'antisense', 'IG_V_pseudogene', 'IG_V_gene',
'non_coding', 'IG_LV_gene', 'ribozyme', 'transcribed_processed_pseudogene', 'miRNA',
'sRNA', 'IG_C_gene', 'scaRNA', 'snRNA', 'TR_J_pseudogene',
'TR_V_pseudogene', 'LRG_gene', 'processed_transcript', 'transcribed_unprocessed_pseudogene', 'TR_C_gene',
'Mt_tRNA', 'bidirectional_promoter_lncRNA', 'pseudogene', 'protein_coding', 'TR_V_gene',
'sense_intronic', 'IG_C_pseudogene', 'IG_J_gene', 'unprocessed_pseudogene', 'lincRNA',
'sense_overlapping', 'snoRNA', 'IG_pseudogene', 'macro_lncRNA', 'rRNA',
'TEC', 'IG_D_pseudogene', 'IG_J_pseudogene');

CREATE TYPE species_enum AS ENUM('human', 'mouse', 'rat');

CREATE TYPE tumortype_enum AS ENUM('placenta carcinomar', 'breast carcinoma', 'hematopoietic/leukemia',
'normal', 'ovarian carcinoma', 'NSCLC', 'mesothelioma', 'retinoblastoma', 'medulloblastoma', 'renal carcinoma',
'gastric carcinoma', 'SCLC', 'hematopoietic/myeloma', 'rhabdomyosarcoma', 'uterus carcinoma', 'bladder carcinoma',
'renal cancer other', 'skin/SCC', 'cervix carcinoma', 'prostate benign hyperplasia', 'melanoma',
'adrenal gland carcinoma', 'esophagus carcinoma', 'astrocytoma/glioblastoma', 'bone sarcoma',
'pancreas carcinoma', 'SCLC/neuroendocrine', 'neuroblastoma', 'thyroid carcinoma', 'prostate carcinoma',
'liver carcinoma', 'colon carcinoma', 'pancreatic insulinoma', 'hematopoietic/lymphoma', 'HNSCC',
'vulva carcinoma', 'gallbladder carcinoma', 'sarcoma/soft tissue');


ALTER TABLE cellline.cellline alter column species type species_enum using species::species_enum;
ALTER TABLE tissue.tissue alter column species type species_enum using species::species_enum;

ALTER TABLE public.gene ALTER COLUMN biotype type biotype_enum USING biotype::biotype_enum;

ALTER TABLE cellline.cellline ALTER COLUMN tumortype type tumortype_enum using tumortype::tumortype_enum;
