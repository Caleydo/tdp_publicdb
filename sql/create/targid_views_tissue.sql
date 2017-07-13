DROP VIEW tissue.targid_tissue CASCADE;
CREATE VIEW tissue.targid_tissue AS
  SELECT targidid, tissuename, species, organ, coalesce(t.gender, p.gender) AS gender, tumortype, tumortype_adjacent
  FROM tissue.tissue t LEFT OUTER JOIN tissue.patient p on p.patientname = t.patientname;

DROP VIEW tissue.targid_copynumber CASCADE;
CREATE VIEW tissue.targid_copynumber AS
  SELECT ensg, tissuename, log2relativecopynumber, pow(2,log2relativecopynumber)*2 AS relativecopynumber, getcopynumberclass(log2relativecopynumber) AS copynumberclass, totalabscopynumber
  FROM tissue.processedcopynumber;

DROP VIEW tissue.targid_expression CASCADE;
CREATE VIEW tissue.targid_expression AS
  SELECT ensg, tissuename, log2tpm, pow(2, log2tpm) as tpm, counts
  FROM tissue.processedrnaseqview;

---  old version (not using the materialized view, missing TCGA wild-types)
--DROP VIEW tissue.targid_mutation CASCADE;
--CREATE VIEW tissue.targid_mutation AS
--  SELECT t.ensg, ps.tissuename, coarse(ps.dnamutation) = 'mut' AS dna_mutated, ps.dnamutation, 
--    coarse(ps.aamutation) = 'mut' AS aa_mutated, ps.aamutation, ps.zygosity, ps.exonscomplete
--  FROM tissue.processedsequence ps JOIN public.transcript t ON t.enst::text = ps.enst::text
--  WHERE t.iscanonical;

--- new version using the materialized view tissue.processedsequenceExtended
DROP VIEW tissue.targid_mutation CASCADE;
CREATE VIEW tissue.targid_mutation AS
  SELECT t.ensg, ps.tissuename,
    coarse(ps.dnamutation) = 'mut' AS dna_mutated, ps.dnamutation,
    coarse(ps.aamutation) = 'mut' AS aa_mutated, ps.aamutation,
    ps.zygosity, ps.exonscomplete
  FROM tissue.processedsequenceExtended ps JOIN public.transcript t on (t.enst = ps.enst) WHERE t.iscanonical;

--- alternative (good when filtering by ensg)
DROP VIEW tissue.targid_mutation2 CASCADE; 
CREATE VIEW tissue.targid_mutation2 AS
WITH 
  TCGAtissue AS (
    SELECT tissuename FROM tissue.tissueassignment WHERE tissuepanel = 'TCGA tumors'
  ),
  TCGAenst AS (
    SELECT enst FROM tissue.tcgaensg
  )
  SELECT tr.ensg, ps.tissuename, ps.enst, 
    coarse(coalesce(ps.dnamutation, 'wt')) = 'mut' AS dna_mutated, coalesce(ps.dnamutation, 'wt') AS dnamutation,
    coarse(coalesce(aamutation, 'wt')) = 'mut' AS aa_mutated, coalesce(ps.aamutation, 'wt') AS aamutation, ps.zygosity, ps.exonscomplete 
    FROM tissue.processedsequence ps JOIN public.transcript tr ON (ps.enst = tr.enst AND iscanonical)
    WHERE tissuename NOT IN (SELECT tissuename FROM TCGAtissue)
  UNION
  SELECT tr.ensg, t.tissuename, ps.enst,
    coarse(coalesce(dnamutation, 'wt')) = 'mut' AS dna_mutated, coalesce(dnamutation, 'wt') AS dnamutation,
    coarse(coalesce(aamutation, 'wt')) = 'mut' AS aa_mutated, coalesce(aamutation, 'wt') AS aamutation, zygosity, ps.exonscomplete
  FROM (SELECT tissuename, enst FROM TCGAtissue, TCGAenst) AS t JOIN public.transcript tr ON (t.enst = tr.enst AND iscanonical)
    LEFT OUTER JOIN tissue.processedsequence ps ON (t.tissuename = ps.tissuename AND t.enst = ps.enst);

-- select * from tissue.targid_mutation2 where tissuename = 'TCGA-06-5410-01' order by aamutation;
-- select * from tissue.targid_mutation2 where ensg = 'ENSG00000124875' order by aamutation;

--combines expression, mutation, and copy number data into a single view
--DROP VIEW tissue.targid_data CASCADE;
CREATE VIEW tissue.targid_data AS
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

DROP VIEW tissue.targid_panel CASCADE;
CREATE VIEW tissue.targid_panel AS
  SELECT tissuepanel as panel, tissuepaneldescription as paneldescription
  FROM tissue.tissuepanel;

DROP VIEW tissue.targid_panelassignment CASCADE; 
CREATE VIEW tissue.targid_panelassignment AS
  SELECT tissuename, tissuepanel as panel
  FROM tissue.tissueassignment;
