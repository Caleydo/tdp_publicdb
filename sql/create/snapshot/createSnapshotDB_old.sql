--
-- create script for targid db for Linz
--

SELECT dblink_connect('myconn', 'dbname=bioinfo.hg19');

------------------------------------

DROP TABLE IF EXISTS public.targid_gene;

CREATE TABLE public.targid_gene AS
  SELECT * FROM dblink('myconn', 'SELECT * FROM targid_gene') AS
  tt(targidid INT4, ensg TEXT, species TEXT, symbol TEXT, name TEXT, chromosome TEXT, strand INT2, biotype TEXT, seqregionstart INT4, seqregionend INT4);

ALTER TABLE public.targid_gene ADD PRIMARY KEY (ensg);
CREATE INDEX ON public.targid_gene(symbol);
------------------------------------

DROP SCHEMA IF EXISTS cellline CASCADE;
CREATE SCHEMA cellline;

--
CREATE TABLE cellline.targid_cellline AS
  SELECT * FROM dblink('myconn', 'SELECT * FROM cellline.targid_cellline WHERE celllinename IN (SELECT celllinename FROM cellline.celllineassignment where celllinepanel = $$CCLE$$)') AS
  tt(targidid INT4, celllinename TEXT, species TEXT, organ TEXT, tumortype TEXT, gender TEXT, metastatic_site TEXT, histology_type TEXT, morphology TEXT, growth_type TEXT, age_at_surgery TEXT);

ALTER TABLE cellline.targid_cellline ADD PRIMARY KEY (celllinename);

--
CREATE TABLE cellline.targid_copynumber AS
  SELECT * FROM dblink('myconn', 'SELECT * FROM cellline.targid_copynumber WHERE celllinename IN (SELECT celllinename FROM cellline.celllineassignment where celllinepanel = $$CCLE$$)') AS
  tt(ensg TEXT, celllinename TEXT, log2relativecopynumber FLOAT4, relativecopynumber FLOAT4, copynumberclass INT2, totalabscopynumber FLOAT4);

ALTER TABLE cellline.targid_copynumber ADD PRIMARY KEY (ensg, celllinename);
CREATE INDEX ON cellline.targid_copynumber(celllinename);
CREATE INDEX ON cellline.targid_copynumber(log2relativecopynumber);

--
CREATE TABLE cellline.targid_expression AS
  SELECT * FROM dblink('myconn', 'SELECT * FROM cellline.targid_expression WHERE celllinename IN (SELECT celllinename FROM cellline.celllineassignment where celllinepanel = $$CCLE$$)') AS
  tt(ensg TEXT, celllinename TEXT, log2tpm FLOAT4, tpm FLOAT4, counts INT4);

ALTER TABLE cellline.targid_expression ADD PRIMARY KEY (ensg, celllinename);
CREATE INDEX ON cellline.targid_expression(celllinename);
CREATE INDEX ON cellline.targid_expression(tpm);

--
CREATE TABLE cellline.targid_mutation AS
  SELECT * FROM dblink('myconn', 'SELECT * FROM cellline.targid_mutation WHERE celllinename IN (SELECT celllinename FROM cellline.celllineassignment where celllinepanel = $$CCLE$$)') AS
  tt( ensg TEXT, celllinename TEXT, dna_mutated boolean, dnamutation TEXT, aa_mutated boolean,
      aamutation TEXT, zygosity FLOAT4,  exonscomplete  FLOAT4, confirmeddetail boolean, numsources INT2);

ALTER TABLE cellline.targid_mutation ADD PRIMARY KEY (ensg, celllinename);
CREATE INDEX ON cellline.targid_mutation(celllinename);

--
CREATE OR REPLACE VIEW cellline.targid_data AS
  SELECT ensg, celllinename, max(copynumberclass) as copynumberclass, max(tpm) as tpm, every(dna_mutated) as dna_mutated
  FROM (
    SELECT ensg, celllinename, copynumberclass, null as tpm, null::BOOL as dna_mutated FROM cellline.targid_copynumber
    UNION ALL
    SELECT ensg, celllinename, null as copynumberclass, tpm, null::BOOL as dna_mutated FROM cellline.targid_expression
    UNION ALL
    SELECT ensg, celllinename, null as copynumberclass, null as tpm, dna_mutated FROM cellline.targid_mutation
  ) omics
  GROUP BY ensg, celllinename;

--
CREATE TABLE cellline.targid_panel AS
  SELECT * FROM dblink('myconn', 'SELECT * FROM cellline.targid_panel') AS
  tt(panel TEXT, paneldescription TEXT);
ALTER TABLE cellline.targid_panel ADD PRIMARY KEY (panel);

--
CREATE TABLE cellline.targid_panelassignment AS
  SELECT * FROM dblink('myconn', 'SELECT * FROM cellline.targid_panelassignment WHERE celllinename IN (SELECT celllinename FROM cellline.celllineassignment where celllinepanel = $$CCLE$$)') AS
  tt(celllinename TEXT, panel TEXT);
ALTER TABLE cellline.targid_panelassignment  ADD PRIMARY KEY (celllinename, panel);

---------------------------------------
DROP SCHEMA IF EXISTS tissue CASCADE;
CREATE SCHEMA tissue;

CREATE TABLE tissue.targid_tissue AS
  SELECT * FROM dblink('myconn', 'SELECT * FROM tissue.targid_tissue WHERE tumortype IN ($$Lung adenocarcinoma$$, $$Colon adenocarcinoma$$) OR tumortype_adjacent IN ($$Lung adenocarcinoma$$, $$Colon adenocarcinoma$$)') AS
  tt(targidid INT4, tissuename TEXT, species TEXT, organ TEXT, gender TEXT, tumortype TEXT, tumortype_adjacent TEXT);
ALTER TABLE tissue.targid_tissue ADD PRIMARY KEY (tissuename);

--
CREATE TABLE tissue.targid_copynumber AS
  SELECT * FROM dblink('myconn', 'SELECT * FROM tissue.targid_copynumber WHERE tissuename IN (SELECT tissuename FROM tissue.tissue WHERE tumortype IN ($$Lung adenocarcinoma$$, $$Colon adenocarcinoma$$) OR tumortype_adjacent IN ($$Lung adenocarcinoma$$, $$Colon adenocarcinoma$$))') AS
  tt(ensg TEXT, tissuename TEXT, log2relativecopynumber FLOAT4, relativecopynumber FLOAT4, copynumberclass INT2, totalabscopynumber FLOAT4);

ALTER TABLE tissue.targid_copynumber ADD PRIMARY KEY (ensg, tissuename);
CREATE INDEX ON tissue.targid_copynumber(tissuename);
CREATE INDEX ON tissue.targid_copynumber(log2relativecopynumber);  ----- or relativecopynumber ???

--
CREATE TABLE tissue.targid_expression AS
  SELECT * FROM dblink('myconn', 'SELECT * FROM tissue.targid_expression WHERE tissuename IN (SELECT tissuename FROM tissue.tissue WHERE tumortype IN ($$Lung adenocarcinoma$$, $$Colon adenocarcinoma$$) OR tumortype_adjacent IN ($$Lung adenocarcinoma$$, $$Colon adenocarcinoma$$))') AS
  tt(ensg TEXT, tissuename TEXT, log2tpm FLOAT4, tpm FLOAT4, counts INT4);

ALTER TABLE tissue.targid_expression ADD PRIMARY KEY (ensg, tissuename);
CREATE INDEX ON tissue.targid_expression(tissuename);
CREATE INDEX ON tissue.targid_expression(tpm);

--
CREATE TABLE tissue.targid_mutation AS
  SELECT * FROM dblink('myconn', 'SELECT * FROM tissue.targid_mutation WHERE tissuename IN (SELECT tissuename FROM tissue.tissue WHERE tumortype IN ($$Lung adenocarcinoma$$, $$Colon adenocarcinoma$$) OR tumortype_adjacent IN ($$Lung adenocarcinoma$$, $$Colon adenocarcinoma$$))') AS
  tt( ensg TEXT, tissuename TEXT, dna_mutated boolean, dnamutation TEXT, aa_mutated boolean,
      aamutation TEXT, zygosity FLOAT4, exonscomplete  FLOAT4);

ALTER TABLE tissue.targid_mutation ADD PRIMARY KEY (ensg, tissuename);
CREATE INDEX ON tissue.targid_mutation(tissuename);

--
CREATE OR REPLACE VIEW tissue.targid_data AS
  SELECT ensg, tissuename, max(copynumberclass) as copynumberclass, max(tpm) as tpm, every(dna_mutated) as dna_mutated
  FROM (
    SELECT ensg, tissuename, copynumberclass, null as tpm, null::BOOL as dna_mutated FROM tissue.targid_copynumber
    UNION ALL
    SELECT ensg, tissuename, null as copynumberclass, tpm, null::BOOL as dna_mutated FROM tissue.targid_expression
    UNION ALL
    SELECT ensg, tissuename, null as copynumberclass, null as tpm, dna_mutated FROM tissue.targid_mutation
  ) omics
  GROUP BY ensg, tissuename;

--
CREATE TABLE tissue.targid_panel AS
  SELECT * FROM dblink('myconn', 'SELECT * FROM tissue.targid_panel WHERE panel IN ($$TCGA normals$$, $$TCGA tumors$$)') AS
  tt(panel TEXT, paneldescription TEXT);
ALTER TABLE tissue.targid_panel ADD PRIMARY KEY (panel);

--
CREATE TABLE tissue.targid_panelassignment AS
  SELECT * FROM dblink('myconn', 'SELECT * FROM tissue.targid_panelassignment WHERE tissuename IN (SELECT tissuename FROM tissue.tissue WHERE tumortype IN ($$Lung adenocarcinoma$$, $$Colon adenocarcinoma$$) OR tumortype_adjacent IN ($$Lung adenocarcinoma$$, $$Colon adenocarcinoma$$))') AS
  tt(tissuename TEXT, panel TEXT);
ALTER TABLE tissue.targid_panelassignment  ADD PRIMARY KEY (tissuename, panel);

------------------------------------
DROP TABLE public.targid_geneset;
CREATE TABLE public.targid_geneset AS
  SELECT * FROM dblink('myconn', 'SELECT * FROM public.geneset') AS
  tt(genesetname TEXT, species TEXT);
ALTER TABLE public.targid_geneset ADD PRIMARY KEY (genesetname);

DROP TABLE public.targid_geneassignment;
CREATE TABLE public.targid_geneassignment AS
  SELECT * FROM dblink('myconn', 'SELECT * FROM public.geneassignment') AS
  tt(ensg TEXT, genesetname TEXT);
ALTER TABLE public.targid_geneassignment ADD PRIMARY KEY (ensg, genesetname);
