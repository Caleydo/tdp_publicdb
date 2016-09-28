/*
Store incremental IDs for primary entities in DB #247
@see https://github.com/Caleydo/targid2/issues/247
*/

ALTER TABLE targid_gene ADD COLUMN targidid SERIAL;
ALTER TABLE cellline.targid_cellline ADD COLUMN targidid SERIAL;
ALTER TABLE tissue.targid_tissue ADD COLUMN targidid SERIAL;
