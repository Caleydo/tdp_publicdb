CREATE OR REPLACE VIEW cellline.targid_cellline AS
  SELECT targidid, celllinename, species, organ, tumortype, gender, metastatic_site, histology_type, morphology, growth_type, age_at_surgery
  FROM cellline.cellline;

CREATE OR REPLACE VIEW cellline.targid_copynumber AS
  SELECT ensg, celllinename, log2relativecopynumber, pow(2,log2relativecopynumber)*2 AS relativecopynumber, getcopynumberclass(log2relativecopynumber) AS copynumberclass, totalabscopynumber
  FROM cellline.processedcopynumber;

CREATE OR REPLACE VIEW cellline.targid_expression AS
  SELECT ensg, celllinename, log2tpm, pow(2, log2tpm) as tpm, counts
  FROM cellline.processedrnaseqview;

CREATE OR REPLACE VIEW cellline.targid_mutation AS
  SELECT t.ensg, ps.celllinename, coarse(ps.dnamutation) = 'mut' AS dna_mutated, ps.dnamutation, coarse(ps.aamutation) = 'mut' AS aa_mutated, ps.aamutation, ps.zygosity, ps.exonscomplete, ps.confirmeddetail, ps.numsources
 FROM cellline.processedsequence ps JOIN transcript t ON t.enst::text = ps.enst::text
 WHERE t.iscanonical;

--combines expression, mutation, and copy number data into a single view
CREATE OR REPLACE VIEW cellline.targid_data AS
  SELECT ensg, celllinename, max(copynumberclass) as copynumberclass, max(tpm) as tpm, every(dna_mutated) as dna_mutated, every(aa_mutated) as aa_mutated
  FROM (
    SELECT ensg, celllinename, copynumberclass, null as tpm, null::BOOL as dna_mutated, null::BOOL as aa_mutated FROM cellline.targid_copynumber
    UNION ALL
    SELECT ensg, celllinename, null as copynumberclass, tpm, null::BOOL as dna_mutated, null::BOOL AS aa_mutated FROM cellline.targid_expression 
    UNION ALL
    SELECT ensg, celllinename, null as copynumberclass, null as tpm, dna_mutated, aa_mutated FROM cellline.targid_mutation
  ) omics 
  GROUP BY ensg, celllinename;

--CREATE OR REPLACE VIEW cellline.targid_data AS
--  SELECT clg.ensg, clg.celllinename, copynumberclass, log2fpkm, dna_mutated FROM (SELECT ensg, celllinename FROM cellline.cellline, gene) clg 
--    LEFT JOIN cellline.targid_copynumber tc ON clg.celllinename = tc.celllinename AND clg.ensg = tc.ensg
--    LEFT JOIN cellline.processedrnaSeqview ps on clg.celllinename = ps.celllinename AND clg.ensg = ps.ensg 
--    LEFT JOIN cellline.targid_mutation tm on clg.celllinename = tm.celllinename AND clg.ensg = tm.ensg
--  WHERE NOT (copynumberclass IS NULL AND log2fpkm IS NULL AND dna_mutated IS NULL);

CREATE OR REPLACE VIEW cellline.targid_panel AS
  SELECT celllinepanel as panel, celllinepaneldescription as paneldescription
  FROM cellline.celllinepanel;

CREATE OR REPLACE VIEW cellline.targid_panelassignment AS
  SELECT celllinename, celllinepanel as panel
  FROM cellline.celllineassignment; 
