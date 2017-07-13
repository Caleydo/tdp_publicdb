DROP VIEW IF EXISTS tissue.processedcopynumberview;
CREATE VIEW tissue.processedcopynumberview AS
SELECT symbol, pcn.* FROM tissue.processedcopynumber pcn JOIN gene g ON (g.ensg = pcn.ensg);

DROP VIEW IF EXISTS tissue.processedsequenceview;
CREATE VIEW tissue.processedsequenceview AS
SELECT symbol, t.ensg, ps.* from tissue.processedsequence ps JOIN transcript t on (t.enst = ps.enst) join gene g on (g.ensg = t.ensg);

DROP VIEW IF EXISTS tissue.hybrid;
CREATE VIEW tissue.hybrid AS
SELECT hybridizationid, h.chipname, chiptype, h.tissuename, organ, tumortype, histology_type, histology_subtype,
       laboratory, hybridizationgroupname, directory, h.comment
FROM tissue.hybridization h JOIN tissue.hybridizationgroup hg ON (hg.hybridizationgroupid = h.hybridizationgroupid)
JOIN tissue.tissue t ON (h.tissuename = t.tissuename) JOIN chiptechnology ct ON (ct.chipname = h.chipname) WHERE publish = TRUE;

DROP VIEW IF EXISTS tissue.processedfusiongeneview;
CREATE VIEW tissue.processedfusiongeneview AS
SELECT pfg.processedfusion, pfg.tissuename, pfg.ensg1, pfg.ensg2, g1.symbol as symbol1, g2.symbol as symbol2, pfg.countsofcommonmappingreads,
       pfg.spanningpairs, pfg.spanninguniquereads, pfg.longestanchorfound, pfg.fusionfindingmethod, pfg.chrgene1, pfg.chrgene2,
       pfg.nuclgene1, pfg.nuclgene2, pfg.strandgene1, pfg.strandgene2, pfg.ngsid, pfg.predictedeffect FROM tissue.processedfusiongene pfg
       JOIN gene g1 on (pfg.ensg1 = g1.ensg)
       JOIN gene g2 on (pfg.ensg2 = g2.ensg);

DROP VIEW IF EXISTS tissue.processedrnaseqview CASCADE;
CREATE VIEW tissue.processedrnaseqview AS
SELECT prs.ngsid, tissuename, prs.ensg, prs.log2fpkm, prs.log2tpm, prs.counts, prs.status FROM tissue.processedrnaseq prs 
       JOIN tissue.ngsrun nr ON nr.ngsid = prs.ngsid WHERE nr.canonical;

----
DROP MATERIALIZED VIEW tissue.tcgaensg CASCADE;
CREATE MATERIALIZED VIEW tissue.tcgaensg AS
SELECT DISTINCT enst
  FROM tissue.processedsequence WHERE processedsequence.tissuename IN 
  (SELECT tissuename FROM tissue.tissueassignment WHERE tissuepanel = 'TCGA tumors');

----
DROP MATERIALIZED VIEW IF EXISTS tissue.processedsequenceExtended CASCADE;
CREATE MATERIALIZED VIEW tissue.processedsequenceExtended AS
WITH TCGAtissue AS (
  SELECT tissuename
    FROM tissue.tissueassignment WHERE tissuepanel = 'TCGA tumors'
  ),
  TCGAenst AS (
    SELECT enst FROM tissue.tcgaensg
  )
  SELECT ps.enst, ps.tissuename, ps.versionnumber, ps.dnamutation, ps.aamutation, ps.zygosity, ps.exonscomplete
    FROM tissue.processedsequence ps WHERE tissuename NOT IN (SELECT tissuename FROM TCGAtissue)
  UNION
  SELECT t.enst, t.tissuename, coalesce(versionnumber, 1) AS versionnumber,
    coalesce(dnamutation, 'wt') AS dnamutation, coalesce(aamutation, 'wt') AS aamutation, zygosity, exonscomplete
    FROM (SELECT tissuename, enst FROM TCGAtissue, TCGAenst) AS t 
    LEFT OUTER JOIN tissue.processedsequence ps ON (t.tissuename = ps.tissuename AND t.enst = ps.enst);

--- alternative to the above one
--DROP VIEW IF EXISTS tissue.processedsequenceExtended CASCADE;
--CREATE VIEW tissue.processedsequenceExtended AS
--WITH TCGAtissue AS (
--  SELECT tissuename             
--    FROM tissue.tissueassignment WHERE tissuepanel = 'TCGA tumors'
--  ),
--  TCGAenst AS (
--  SELECT DISTINCT enst FROM tissue.processedsequence
--    WHERE tissuename IN (SELECT tissuename FROM TCGAtissue)
--  )
--  SELECT ps.* FROM tissue.processedsequence ps
--  UNION
--  SELECT tissuename, e.enst, 1 AS versionnumber, 'wt' AS dnamutation, 'wt' AS aamutation, NULL AS zygosity, NULL AS exonscomplete
--    FROM TCGAtissue t, TCGAenst e WHERE (t.tissuename, e.enst) NOT IN 
--     (SELECT ps.tissuename, ps.enst FROM tissue.processedsequence ps JOIN TCGAtissue t ON (ps.tissuename = t.tissuename)
--  ) AS;
