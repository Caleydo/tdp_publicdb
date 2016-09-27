/*
Replace log2fpkm with tpm #250
@see https://github.com/Caleydo/targid2/issues/250
*/

ALTER TABLE cellline.targid_expression rename column log2fpkm to tpm;
UPDATE cellline.targid_expression set tpm = pow(2, log2tpm);

ALTER TABLE tissue.targid_expression rename column log2fpkm to tpm;
UPDATE tissue.targid_expression set tpm = pow(2, log2tpm);

ALTER TABLE cellline.targid_data rename column log2tpm to tpm;
UPDATE cellline.targid_data set tpm = pow(2, log2tpm);

/* When using views instead of tables us the following SQL queries*/
/*
DROP VIEW  cellline.targid_expression;

CREATE OR REPLACE VIEW cellline.targid_expression AS
  SELECT ensg, celllinename, log2tpm, pow(2, log2tpm) as tpm, counts
  FROM cellline.processedrnaseqview;

DROP VIEW cellline.targid_data;

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

DROP VIEW tissue.targid_expression;

CREATE OR REPLACE VIEW tissue.targid_expression AS
  SELECT ensg, tissuename, log2tpm, pow(2, log2tpm) as tpm, counts
  FROM tissue.processedrnaseqview;

DROP VIEW tissue.targid_data;

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

 */
