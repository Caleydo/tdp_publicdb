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
SELECT prs.ngsid, tissuename, prs.ensg, prs.log2fpkm, prs.log2tpm, prs.counts FROM tissue.processedrnaseq prs 
       JOIN tissue.ngsrun nr ON nr.ngsid = prs.ngsid WHERE nr.canonical;

