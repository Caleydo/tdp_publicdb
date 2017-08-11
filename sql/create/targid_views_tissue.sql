DROP VIEW tissue.targid_tissue CASCADE;
CREATE VIEW tissue.targid_tissue AS
  SELECT t.targidid, t.tissuename, t.species, t.organ, coalesce(t.gender, p.gender) AS gender, t.tumortype, t.tumortype_adjacent, vendorname, race, ethnicity,
    floor(days_to_birth/-365.25) as age, days_to_death, days_to_last_followup, vital_status,
    height, weight, round((weight/(height/100)^2)::NUMERIC, 2) AS bmi
  FROM tissue.tissue t LEFT OUTER JOIN tissue.patient p ON p.patientname = t.patientname;

DROP VIEW tissue.targid_copynumber CASCADE;
CREATE VIEW tissue.targid_copynumber AS
  SELECT ensg, tissuename, log2relativecopynumber, pow(2,log2relativecopynumber)*2 AS relativecopynumber, getcopynumberclass(log2relativecopynumber) AS copynumberclass, totalabscopynumber
  FROM tissue.processedcopynumber;

DROP VIEW tissue.targid_expression CASCADE;
CREATE VIEW tissue.targid_expression AS
  SELECT ensg, tissuename, log2tpm, pow(2, log2tpm) as tpm, counts
  FROM tissue.processedrnaseqview;

DROP VIEW tissue.targid_mutation CASCADE;
CREATE VIEW tissue.targid_mutation AS
  SELECT t.ensg,
    ps.tissuename,
    coarse(ps.dnamutation) = 'mut'::text AS dna_mutated, ps.dnamutation,
    coarse(ps.aamutation) = 'mut'::text AS aa_mutated, ps.aamutation,
    ps.zygosity, ps.exonscomplete
   FROM processedsequenceextended ps
     JOIN transcript t ON t.enst = ps.enst
  WHERE t.iscanonical;

--- alternative 1 (good when filtering by ensg)
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
    FROM tissue.processedsequence ps JOIN transcript tr ON (ps.enst = tr.enst AND iscanonical)
    WHERE tissuename NOT IN (SELECT tissuename FROM TCGAtissue)
  UNION
  SELECT tr.ensg, t.tissuename, ps.enst,
    coarse(coalesce(dnamutation, 'wt')) = 'mut' AS dna_mutated, coalesce(dnamutation, 'wt') AS dnamutation,
    coarse(coalesce(aamutation, 'wt')) = 'mut' AS aa_mutated, coalesce(aamutation, 'wt') AS aamutation, zygosity, ps.exonscomplete
  FROM (SELECT tissuename, enst FROM TCGAtissue, TCGAenst) AS t JOIN transcript tr ON (t.enst = tr.enst AND iscanonical)
    LEFT OUTER JOIN tissue.processedsequence ps ON (t.tissuename = ps.tissuename AND t.enst = ps.enst);


--- alternative 2 (good when filtering by tissuename)
DROP VIEW tissue.targid_mutation3 CASCADE;
CREATE VIEW tissue.targid_mutation3 AS
  SELECT t.ensg, ps.tissuename, 
    coarse(ps.dnamutation) = 'mut' AS dna_mutated, ps.dnamutation,  
    coarse(ps.aamutation) = 'mut' AS aa_mutated, ps.aamutation, 
    ps.zygosity, ps.exonscomplete
  FROM tissue.processedsequenceExtended ps JOIN transcript t on (t.enst = ps.enst) WHERE t.iscanonical;

-- select * from tissue.targid_mutation3 where tissuename = 'TCGA-06-5410-01' order by aamutation;
-- select * from tissue.targid_mutation3 where ensg = 'ENSG00000124875' order by aamutation;

--- find out if canonical mutations are missing
WITH 
  TCGAtissue AS (
    SELECT tissuename FROM tissue.tissueassignment WHERE tissuepanel = 'TCGA tumors' 
  ),
  TCGAgenes AS (
    SELECT DISTINCT ensg from tissue.processedsequence ps JOIN transcript t on t.enst = ps.enst JOIN TCGAtissue ti ON ps.tissuename = ti.tissuename WHERE not iscanonical
  )
  SELECT g.ensg, t.tissuename,
    (select count(*) FROM tissue.processedsequence ps join transcript tr on tr.enst = ps.enst WHERE ensg = g.ensg AND iscanonical and tissuename = t.tissuename) as can,
    (select count(*) FROM tissue.processedsequence ps join transcript tr on tr.enst = ps.enst WHERE ensg = g.ensg AND NOT iscanonical and tissuename = t.tissuename) as noncan
    FROM TCGAgenes g, TCGAtissue t order by noncan desc; 

WITH
  TCGAtissue AS (
    SELECT tissuename FROM tissue.tissueassignment WHERE tissuepanel = 'TCGA tumors'
  ),
  TCGAgenes AS (
    SELECT DISTINCT ensg from tissue.processedsequence ps JOIN transcript t on t.enst = ps.enst JOIN TCGAtissue ti ON ps.tissuename = ti.tissuename WHERE not iscanonical
  )
  SELECT g.ensg,
    (SELECT symbol from gene where ensg = g.ensg) AS symbol,
    (select count(*) FROM tissue.processedsequence ps join transcript tr on tr.enst = ps.enst JOIN TCGAtissue ti ON ps.tissuename = ti.tissuename WHERE ensg = g.ensg AND iscanonical) as can,
    (select count(*) FROM tissue.processedsequence ps join transcript tr on tr.enst = ps.enst JOIN TCGAtissue ti ON ps.tissuename = ti.tissuename WHERE ensg = g.ensg AND NOT iscanonical) as noncan
    FROM TCGAgenes g order by noncan desc;      

SELECT * FROM tissue.processedsequenceview WHERE ensg = 'ENSG00000168477';
SELECT * FROM tissue.processedsequenceview WHERE ensg = 'ENSG00000086758';
SELECT * FROM tissue.processedsequenceview WHERE ensg = 'ENSG00000168477';

-------

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
