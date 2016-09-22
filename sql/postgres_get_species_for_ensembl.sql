/*
Add DB function to get species for given Ensembl ID #248
@see https://github.com/Caleydo/targid2/issues/248
*/

CREATE OR REPLACE FUNCTION getSpecies(ensg TEXT) RETURNS TEXT AS $$
  DECLARE
    part TEXT;
  BEGIN
    part := left(ensg, 4);
    IF part = 'ENSG' OR part = 'LRG_' THEN
      RETURN('human');
    ELSIF part = 'ENSM' THEN
      RETURN('rat');
    ELSIF part = 'ENSR' THEN
      RETURN('mouse');
    ELSE
      RETURN('unknown');
    END IF;
  END;
$$ LANGUAGE plpgsql STABLE COST 100;

/*
How to use:

CREATE OR REPLACE VIEW targid_gene AS
  SELECT ensg, getSpecies(ensg) AS species, symbol, chromosome, strand, biotype, seqregionstart, seqregionend
  FROM gene;
*/
