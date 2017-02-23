-------------------------------------------------
---- Views for celllineDB -----------------------
-------------------------------------------------

DROP VIEW IF EXISTS cellline.hybrid;
CREATE VIEW cellline.hybrid AS
SELECT hybridizationid, h.chipname, chiptype, h.celllinename, organ, tumortype, histology_type, histology_subtype, 
       morphology, growth_type, laboratory, hybridizationgroupname, cellbatchid, directory, isxenograft, compound, h.comment 
FROM cellline.hybridization h JOIN cellline.hybridizationgroup hg ON (hg.hybridizationgroupid = h.hybridizationgroupid) 
JOIN cellline.cellline c ON (h.celllinename = c.celllinename) JOIN chiptechnology ct ON (ct.chipname = h.chipname) WHERE publish = TRUE;

-------------------------------------------------
---- Views for sequenceDB -----------------------
-------------------------------------------------

DROP VIEW IF EXISTS cellline.sequencingResults ;
DROP VIEW IF EXISTS cellline.sequencingResultsSNP ;
DROP VIEW IF EXISTS cellline.cannonicalMutation;

-------------------------------------------------

CREATE VIEW cellline.cannonicalMutation AS
SELECT m.*, t.ENSG, t.transcriptname FROM cellline.mutation m, transcript t WHERE t.enst = m.enst AND t.iscanonical;

-------------------------------------------------
CREATE VIEW cellline.sequencingResults AS
SELECT ar.celllinename, ar.cellbatchid, c.cosmicid, ar.analysissource, g.symbol, g.name, a.analysisid, a.analysisrunid, 
cm.chromosome, cm.startpos, cm.endpos, cm.enst,
cm.mutationtype, cm.mutationeffect, cm.assembly, cm.genomicregion, cm.exon,
cm.cdnamutation, cm.proteinmutation, cm.snp, cm.snpsource, cm.dbsnpid,
cm.numreads, cm.nummutantreads, cm.numreferencereads, cm.zygosity, cm.qualityscore,
cm.siftscore, g.ensg, g.biotype
FROM cellline.analysis a
JOIN cellline.analysisrun ar ON (a.analysisrunid = ar.analysisrunid)
JOIN gene g ON (a.ENSG = g.ENSG)
JOIN cellline.cellline c ON (c.celllinename = ar.celllinename)
LEFT OUTER JOIN cellline.cannonicalMutation cm ON (cm.analysisrunid = a.analysisrunid AND cm.analysisid = a.analysisid AND NOT snp)
WHERE publish;

---------------------------------------------------

CREATE VIEW cellline.sequencingResultsSNP AS
SELECT ar.celllinename, ar.cellbatchid, c.cosmicid, ar.analysissource, g.symbol, g.name, a.analysisid, a.analysisrunid,
cm.chromosome, cm.startpos, cm.endpos, cm.enst,
cm.mutationtype, cm.mutationeffect, cm.assembly, cm.genomicregion, cm.exon,
cm.cdnamutation, cm.proteinmutation, cm.snp, cm.snpsource, cm.dbsnpid,
cm.numreads, cm.nummutantreads, cm.numreferencereads, cm.zygosity, cm.qualityscore,
cm.siftscore, g.ensg, g.biotype
FROM cellline.analysis a
JOIN cellline.analysisrun ar ON (a.analysisrunid = ar.analysisrunid)
JOIN gene g ON (a.ENSG = g.ENSG)
JOIN cellline.cellline c ON (c.celllinename = ar.celllinename)
LEFT OUTER JOIN cellline.cannonicalMutation cm ON (cm.analysisrunid = a.analysisrunid AND cm.analysisid = a.analysisid)
WHERE publish;

---------------------------------------------------

DROP VIEW IF EXISTS cellline.sequencingResultsAllTranscripts;
DROP VIEW IF EXISTS cellline.allTranscriptMutation;

---------------------------------------------------

CREATE VIEW cellline.allTranscriptMutation AS
SELECT m.*, t.ENSG, t.transcriptname FROM cellline.mutation m, transcript t WHERE t.enst = m.enst;

---------------------------------------------------

CREATE VIEW cellline.sequencingResultsAllTranscripts AS
SELECT ar.celllinename, ar.cellbatchid, c.cosmicid, ar.analysissource, g.symbol, g.name, a.analysisid, a.analysisrunid,
atm.chromosome, atm.startpos, atm.endpos, atm.enst,
atm.mutationtype, atm.mutationeffect, atm.assembly, atm.genomicregion, atm.exon,
atm.cdnamutation, atm.proteinmutation, atm.snp, atm.snpsource, atm.dbsnpid,
atm.numreads, atm.nummutantreads, atm.numreferencereads, atm.zygosity, atm.qualityscore,
atm.siftscore, g.ensg, g.biotype
FROM cellline.analysis a
JOIN cellline.analysisrun ar ON (a.analysisrunid = ar.analysisrunid)
JOIN gene g ON (a.ENSG = g.ENSG)
JOIN cellline.cellline c ON (c.celllinename = ar.celllinename)
LEFT OUTER JOIN cellline.allTranscriptMutation atm ON (atm.analysisrunid = a.analysisrunid AND atm.analysisid = a.analysisid)
WHERE publish;

----------------------------------------------------
DROP VIEW IF EXISTS cellline.celllineMutCN;
DROP VIEW IF EXISTS cellline.processedsequenceview;

CREATE VIEW cellline.processedsequenceview AS 
SELECT symbol, t.ensg, ps.* from cellline.processedsequence ps JOIN transcript t on (t.enst = ps.enst) join gene g on (g.ensg = t.ensg);

DROP VIEW IF EXISTS cellline.processedcopynumberview;
CREATE VIEW cellline.processedcopynumberview AS
SELECT symbol, pcn.* FROM cellline.processedcopynumber pcn JOIN gene g ON (g.ensg = pcn.ensg);

----------------------------------------------------
CREATE VIEW cellline.celllineMutCN AS
SELECT gcl.ensg, gcl.symbol, gcl.celllinename, psv.enst, psv.dnamutation, psv.aamutation, psv.zygosity, psv.exonscomplete, psv.confirmeddetail, psv.numsources as processedsequencenumsources,
       pcn.log2relativecopynumber, pcn.log2relativeCopyNumberDev, pcn.copynumbergainintron, pcn.copynumberlossintron, pcn.copynumbergainexon, pcn.copynumberlossexon,
       pcn.gap, pcn.jump, pcn.exonicchange, pcn.intronicchange, pcn.numsources as processedcopynumbernumsources,
       pcn.totalAbsCopyNumber, pcn.totalAbsCopyNumberDev, pcn.minorAbsCopyNumber, pcn.minorAbsCopyNumberDev, pcn.lossofheterozygosity 
       FROM (SELECT ensg, symbol, celllinename FROM gene g, cellline.cellline cl) gcl 
       LEFT JOIN cellline.processedsequenceview psv on (gcl.ensg = psv.ensg AND gcl.celllinename = psv.celllinename) 
       LEFT JOIN cellline.processedcopynumber pcn on (gcl.ensg = pcn.ensg AND gcl.celllinename = pcn.celllinename);

DROP VIEW IF EXISTS cellline.processedfusiongeneview;
CREATE VIEW cellline.processedfusiongeneview AS
SELECT pfg.processedfusion, pfg.celllinename, pfg.ensg1, pfg.ensg2, g1.symbol as symbol1, g2.symbol as symbol2, pfg.countsofcommonmappingreads, 
       pfg.spanningpairs, pfg.spanninguniquereads, pfg.longestanchorfound, pfg.fusionfindingmethod, pfg.chrgene1, pfg.chrgene2, 
       pfg.nuclgene1, pfg.nuclgene2, pfg.strandgene1, pfg.strandgene2, pfg.ngsid, pfg.predictedeffect FROM cellline.processedfusiongene pfg
       JOIN gene g1 on (pfg.ensg1 = g1.ensg)
       JOIN gene g2 on (pfg.ensg2 = g2.ensg);

DROP VIEW IF EXISTS cellline.processedrnaseqview CASCADE;
CREATE VIEW cellline.processedrnaseqview AS
SELECT prs.ngsid, celllinename, prs.ensg, prs.log2fpkm, prs.log2tpm, prs.counts, prs.status FROM cellline.processedrnaseq prs JOIN cellline.ngsrun nr ON nr.ngsid = prs.ngsid WHERE nr.canonical;

--CREATE VIEW cellline.processedrnaseqview AS
--SELECT prs.ngsid, celllinename, prs.ensg, prs.log2fpkm, prs.log2tpm, prs.counts FROM cellline.ngsrun nr JOIN cellline.processedrnaseq prs ON (nr.ngsid = prs.ngsid) WHERE nr.canonical;

-------------------------------------------------
---- Views for prolifDB -----------------------
-------------------------------------------------

DROP VIEW IF EXISTS cellline.results;

CREATE VIEW cellline.results AS 
SELECT doseresponsecurve, ec50, ec50calc, ec50operator, top, bottom, slope,
gi50, gi50calc, gi50operator, ic50, ic50calc, ic50operator, tgi, tgicalc, tgioperator, 
tzero, tzerosd, negControlSD, amax, actarea, drc.classification, round, deviation, 
drc.celllinename, cl.organ, cl.tissue_subtype, cl.tumortype, cl.metastatic_site, cl.histology_type, 
cl.histology_subtype, cl.morphology, cl.growth_type, cl.gender, drc.cellsperwell, timepoint, drc.drugid, d.target, sampleid, 
pretreatment, laboratory, proliferationtest, campaign, imagepath,
calcimpossible, biphasiccurve, flatcurve, wrongconcrange, inactive, drc.valid, recalculate, locked, fixedtop, fixedbottom, fixedslope, fixedec50
FROM cellline.doseresponsecurve drc
JOIN cellline.cellline cl ON cl.celllinename = drc.celllinename
JOIN drug d ON d.drugid = drc.drugid;

-------------------------------------------------------
--DROP VIEW IF EXISTS cellline.results2;

--CREATE VIEW cellline.results2 AS
--SELECT distinct drc.doseresponsecurve, ec50, ec50calc, ec50operator, top, bottom, slope,
--gi50, ic50, tgi, tzero, tzerosd, negControlSD, drc.classification, p.round, deviation, datafile,
--m.celllinename, organ, drc.cellsperwell, p.timepoint, m.drugid, d.target, m.sampleid, m.pretreatment, p.laboratory, p.proliferationtest, p.campaign, imagepath,
--calcimpossible, drc.valid, recalculate, locked, fixedtop, fixedbottom, fixedslope, fixedec50
--FROM cellline.doseresponsecurve drc
--JOIN cellline.curveanalysis c ON c.doseresponsecurve = drc.doseresponsecurve
--JOIN cellline.measuredvalue m ON (m.plateid = c.plateid AND m.well = c.well)
--JOIN cellline.plate p ON p.plateid = m.plateid
--JOIN cellline.cellline cl ON cl.celllinename = m.celllinename
--JOIN drug d ON d.drugid = m.drugid
--WHERE category = 'test';

-------------------------------------------------------

--DROP VIEW IF EXISTS cellline.resultsCombi;

--CREATE VIEW cellline.resultsCombi AS
--SELECT distinct drm.doseresponsematrix, maxcgiblissexcess, mincgiblissexcess, maxpocblissexcess, minpocblissexcess, 
--mincgihsaexcess, maxcgihsaexcess, minpochsaexcess, maxpochsaexcess, tzero, tzerosd, negControlSD, p.round, 
--m.celllinename, organ, cl.tissue_subtype, cl.tumortype, cl.metastatic_site, cl.histology_type, 
--cl.histology_subtype, cl.morphology, cl.growth_type, cl.gender, m.cellsperwell, p.timepoint, 
--m.drugid, d1.target, m.sampleid, drm.treatmenttime, 
--m.drugid2, d2.target as target2, m.sampleid2, drm.treatmenttime2, 
--drm.pretreatment, p.laboratory, p.proliferationtest, p.campaign, imagepath,
--drm.valid, recalculate, locked
--FROM cellline.doseresponsematrix drm
--JOIN cellline.matrixanalysis ma ON ma.doseresponsematrix = drm.doseresponsematrix
--JOIN cellline.measuredvalue m ON (m.plateid = ma.plateid AND m.well = ma.well AND (m.drugid <> 'DMSO' AND m.drugid2 <> 'DMSO'))
--JOIN cellline.plate p ON p.plateid = m.plateid
--JOIN cellline.cellline cl ON cl.celllinename = m.celllinename
--JOIN drug d1 ON d1.drugid = m.drugid
--JOIN drug d2 ON d2.drugid = m.drugid2
--WHERE category = 'test';

DROP VIEW IF EXISTS cellline.resultsCombi;

CREATE VIEW cellline.resultsCombi AS
SELECT distinct drm.doseresponsematrix, maxcgiblissexcess, mincgiblissexcess, maxpocblissexcess, minpocblissexcess,
mincgihsaexcess, maxcgihsaexcess, minpochsaexcess, maxpochsaexcess, min3cgiblissexcess + max3cgiblissexcess as combo6, tzero, tzerosd, negControlSD, round,
cl.celllinename, organ, cl.tissue_subtype, cl.tumortype, cl.metastatic_site, cl.histology_type,
cl.histology_subtype, cl.morphology, cl.growth_type, cl.gender, cellsperwell, timepoint,
drm.drugid, d1.target, sampleid, drm.treatmenttime,
drm.drugid2, d2.target as target2, sampleid2, drm.treatmenttime2,
drm.pretreatment, laboratory, proliferationtest, campaign, imagepath,
drm.valid, recalculate, locked
FROM cellline.doseresponsematrix drm
JOIN cellline.cellline cl ON cl.celllinename = drm.celllinename
JOIN drug d1 ON d1.drugid = drm.drugid
JOIN drug d2 ON d2.drugid = drm.drugid2;

-------------------------------------------------------

CREATE OR REPLACE VIEW cellline.combiDetails AS 
SELECT doseresponsematrix, drugid, drugid2, (cellline.getcombiResults(drm.doseresponsematrix)).* FROM cellline.doseresponsematrix drm;
