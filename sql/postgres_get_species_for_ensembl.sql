/*
Add DB function to get species for given Ensembl ID #248
@see https://github.com/Caleydo/targid2/issues/248
*/

UPDATE public.targid_gene set species = 'human' WHERE species = 'Homo_sapiens';
UPDATE public.targid_gene set species = 'mouse' WHERE species = 'Mus_musculus';
UPDATE public.targid_gene set species = 'rat' WHERE species = 'Rattus_norvegicus';

/* When using views instead of tables us the following SQL queries*/
/*
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

CREATE OR REPLACE VIEW targid_gene AS
  SELECT ensg, getSpecies(ensg) AS species, symbol, chromosome, strand, biotype, seqregionstart, seqregionend
  FROM gene;
*/
