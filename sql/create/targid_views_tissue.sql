CREATE OR REPLACE VIEW tissue.targid_tissue AS
  SELECT targidid, tissuename, species, organ, gender, tumortype, tumortype_adjacent
  FROM tissue.tissue;

CREATE OR REPLACE VIEW tissue.targid_copynumber AS
  SELECT ensg, tissuename, log2relativecopynumber, pow(2,log2relativecopynumber)*2 AS relativecopynumber, getcopynumberclass(log2relativecopynumber) AS copynumberclass, totalabscopynumber
  FROM tissue.processedcopynumber;

CREATE OR REPLACE VIEW tissue.targid_expression AS
  SELECT ensg, tissuename, log2tpm, pow(2, log2tpm) as tpm, counts
  FROM tissue.processedrnaseqview;

CREATE OR REPLACE VIEW tissue.targid_mutation AS
  SELECT t.ensg, ps.tissuename, coarse(ps.dnamutation) = 'mut' AS dna_mutated, ps.dnamutation, 
    coarse(ps.aamutation) = 'mut' AS aa_mutated, ps.aamutation, ps.zygosity, 
    ps.exonscomplete
 FROM tissue.processedsequence ps JOIN public.transcript t ON t.enst::text = ps.enst::text
 WHERE t.iscanonical;

--combines expression, mutation, and copy number data into a single view
CREATE OR REPLACE VIEW tissue.targid_data AS
  SELECT ensg, tissuename, max(copynumberclass) as copynumberclass, max(tpm) as tpm, every(dna_mutated) as dna_mutated, every(aa_mutated) as aa_mutated
  FROM (
    SELECT ensg, tissuename, copynumberclass, null as tpm, null::BOOL as dna_mutated, null::BOOL as aa_mutated FROM tissue.targid_copynumber
    UNION ALL
    SELECT ensg, tissuename, null as copynumberclass, tpm, null::BOOL as dna_mutated, null::BOOL as aa_mutated FROM tissue.targid_expression 
    UNION ALL
    SELECT ensg, tissuename, null as copynumberclass, null as tpm, dna_mutated, aa_mutated FROM tissue.targid_mutation
  ) omics 
GROUP BY ensg, tissuename;

--CREATE OR REPLACE VIEW tissue.targid_data AS
--  SELECT clg.ensg, clg.tissuename, copynumberclass, log2fpkm, dna_mutated FROM (SELECT ensg, tissuename FROM tissue.tissue, public.gene) clg 
--    LEFT JOIN tissue.targid_copynumber tc ON clg.tissuename = tc.tissuename AND clg.ensg = tc.ensg
--    LEFT JOIN tissue.processedrnaSeqview ps on clg.tissuename = ps.tissuename AND clg.ensg = ps.ensg 
--    LEFT JOIN tissue.targid_mutation tm on clg.tissuename = tm.tissuename AND clg.ensg = tm.ensg
--  WHERE NOT (copynumberclass IS NULL AND log2fpkm IS NULL AND dna_mutated IS NULL);

CREATE OR REPLACE VIEW tissue.targid_panel AS
  SELECT tissuepanel as panel, tissuepaneldescription as paneldescription
  FROM tissue.tissuepanel;
 
CREATE OR REPLACE VIEW tissue.targid_panelassignment AS
  SELECT tissuename, tissuepanel as panel
  FROM tissue.tissueassignment;

