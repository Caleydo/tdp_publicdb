DROP VIEW IF EXISTS targid_gene;
CREATE VIEW targid_gene AS
  SELECT targidid, ensg, species, symbol, name, chromosome, strand, biotype, seqregionstart, seqregionend
  FROM gene;

DROP VIEW IF EXISTS targid_geneset;
CREATE VIEW targid_geneset AS
  SELECT genesetname, species FROM geneset;

DROP VIEW IF EXISTS targid_geneassignment;
CREATE VIEW targid_geneassignment AS
  SELECT ensg, genesetname FROM geneassignment;
