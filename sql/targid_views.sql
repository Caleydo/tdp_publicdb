CREATE OR REPLACE VIEW targid_gene AS
  SELECT targidid, ensg, getSpecies(ensg) AS species, symbol, chromosome, strand, biotype, seqregionstart, seqregionend
  FROM gene;

CREATE OR REPLACE VIEW targid_geneset AS
  SELECT genesetname, species FROM geneset;

CREATE OR REPLACE VIEW targid_geneassignment AS
  SELECT ensg, genesetname FROM geneassignment;
