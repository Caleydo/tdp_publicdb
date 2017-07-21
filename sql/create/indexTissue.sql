CREATE INDEX idx_processedrnaseq ON tissue.processedrnaseq(ensg, ngsid);
CREATE INDEX idx_processedcnensgtissue ON tissue.processedcopynumber(ensg, tissuename);
CREATE INDEX idx_processedsequence ON tissue.processedsequence(enst);

CREATE INDEX idx_tissue_targid ON tissue.tissue(targidid, species, tumortype);

--- indices on a materialized view
CREATE UNIQUE INDEX idx_processedsequenceEx1 ON tissue.processedsequenceExtended (tissuename, enst);
CREATE INDEX idx_processedsequenceEx2 ON tissue.processedsequenceExtended (enst);
