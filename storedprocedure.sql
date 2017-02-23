-------------------------------------------------------------------------------
-- coarse(text)
-- transforms anything that is not 'wt' into 'mut'
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION COARSE(seq TEXT) RETURNS TEXT AS $$
  BEGIN
    IF seq <> 'wt' THEN
      RETURN 'mut';
    ELSE
      RETURN(seq);
    END IF;
  END;
$$ LANGUAGE plpgsql;

-------------------------------------------------------------------------------
-- coarsenum(text)
-- transforms mutations into 0 and 1 
-------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION COARSENUM(seq TEXT) RETURNS INT2 AS $$
  BEGIN
    IF seq <> 'wt' THEN
      RETURN 1;
    ELSE
      RETURN 0;
    END IF;
  END;
$$ LANGUAGE plpgsql;

-------------------------------------------------------------------------------
-- ensembl species
-- Homo_sapiens, Mus_musculus, or Rattus_norvegicus
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION EnsemblSpecies(id TEXT) RETURNS TEXT AS $$
  DECLARE
    part TEXT;
  BEGIN
    part := left(id, 4);
    IF part = 'ENSG' OR part = 'LRG_' OR part = 'hsa-' THEN
      RETURN('Homo_sapiens');
    ELSIF part = 'ENSM' OR part = 'mmu-' THEN
      RETURN('Mus_musculus');
    ELSIF part = 'ENSR' OR part = 'rno-' THEN
      RETURN('Rattus_norvegicus');
    ELSE
      RETURN('unknown');
    END IF;
  END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION EnsemblSpecies(taxid INTEGER) RETURNS TEXT AS $$
  BEGIN
    IF taxid = 9606 THEN
      RETURN('Homo_sapiens');
    ELSIF taxid = 10090 THEN
      RETURN('Mus_musculus');
    ELSIF taxid = 10116 THEN
      RETURN('Rattus_norvegicus');
    ELSE
      RETURN('unknown');
    END IF;
  END;
$$ LANGUAGE plpgsql;

-------------------------------------------------------------------------------
-- getSpecies
-- human, mouse, rat from ensembl gene id 
-------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION getSpecies(ensg TEXT) RETURNS TEXT AS $$
  DECLARE
    part TEXT;
  BEGIN
    part := left(ensg, 4);
    IF part = 'ENSG' OR part = 'LRG_' THEN
      RETURN('human');
    ELSIF part = 'ENSR' THEN
      RETURN('rat');
    ELSIF part = 'ENSM' THEN
      RETURN('mouse');
    ELSE
      RETURN('unknown');
    END IF;
  END;
$$ LANGUAGE plpgsql STABLE COST 100;

-------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION cleanName(name TEXT) RETURNS TEXT as $$ 
DECLARE
  cleanName TEXT;
BEGIN
  cleanName := regexp_replace(name, '[-_[:space:]]', '', 'g');
  cleanName := regexp_replace(cleanName, '[/,().]', '', 'g');
  RETURN lower(cleanName);
END;
$$ LANGUAGE 'plpgsql';

-------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION replaceNULL(val TEXT, replaceVal TEXT) RETURNS TEXT as $$
BEGIN
  IF (val IS NULL) THEN
    RETURN replaceVal;
  END IF;
  RETURN val;
END;
$$ LANGUAGE 'plpgsql';

-------------------------------------------------------------------------------
-- setHomologene2EntrezGene(homologenecluster, geneid)
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION setHomologene2EntrezGene(myHomologenecluster INT4, myGeneid INTEGER) RETURNS INT2 AS $$
DECLARE
  rec record;
  retval INT2;
BEGIN
  retval := 0;
  SELECT INTO rec * FROM entrezgene WHERE geneid = myGeneid;
  IF NOT found THEN
    RETURN 1;
  END IF;
  SELECT INTO rec * FROM homologene WHERE geneid = myGeneid AND homologenecluster = myHomologenecluster;
  IF found THEN
    RETURN 4;
  END IF;
  INSERT INTO homologene(homologenecluster, geneid) VALUES (myHomologenecluster, myGeneid);
  RETURN 0;
END;
$$
LANGUAGE plpgsql;

-------------------------------------------------------------------------------
-- upsertInfo(description, information)
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION upsertInfo(descript TEXT, info TEXT) RETURNS void AS $$
DECLARE
  rec record;
BEGIN
  SELECT INTO rec * FROM information WHERE description = descript;
  IF found THEN
    UPDATE information SET information = info WHERE description = descript;
  ELSE
    INSERT INTO information(description, information) VALUES (descript, info);
  END IF;
END;
$$
LANGUAGE plpgsql;

-------------------------------------------------------------------------------
-- setMirBase2EnsemblGene(ensg, geneid)
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION setMirBase2EnsemblGene(myEnsg TEXT, mirAcc TEXT) RETURNS INT2 AS $$
DECLARE
  rec record;
  retval INT2;
BEGIN
  retval := 0;

  SELECT INTO rec * FROM mirbase WHERE accession = mirAcc;
  IF NOT found THEN
    retval := 1;
  END IF;

  SELECT INTO rec * FROM gene WHERE ensg = myEnsg;
  IF found THEN
    IF rec.biotype <> 'miRNA' THEN
      retval := 5;
    END IF;
  ELSE
    retval := retval + 2;
  END IF;

  IF retval > 0 THEN
    RETURN retval;
  END IF;

  SELECT INTO rec * FROM mirbase2ensemblgene WHERE accession = mirAcc AND ensg = myEnsg;
  IF found THEN
    RETURN 4;
  END IF;
  INSERT INTO mirbase2ensemblgene(ensg, accession) VALUES (myEnsg, mirAcc);
  RETURN 0;
END;
$$
LANGUAGE plpgsql;

-------------------------------------------------------------------------------
-- setEntrezGene2EnsemblGene(ensg, geneid)
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION setEntrezGene2EnsemblGene(myEnsg TEXT, myGeneid INTEGER) RETURNS INT2 AS $$
DECLARE
  rec record;
  retval INT2;
BEGIN
  retval := 0;

  SELECT INTO rec * FROM entrezgene WHERE geneid = myGeneid;
  IF NOT found THEN
    retval := 1;
  END IF;

  SELECT INTO rec * FROM gene WHERE ensg = myEnsg;
  IF NOT found THEN
    retval := retval + 2;
  END IF;

  IF retval > 0 THEN
    RETURN retval;
  END IF;

  SELECT INTO rec * FROM entrezgene2ensemblgene WHERE geneid = myGeneid AND ensg = myEnsg;
  IF found THEN
    RETURN 4;
  END IF;
  INSERT INTO entrezgene2ensemblgene(ensg, geneid) VALUES (myEnsg, myGeneid);
  RETURN 0;
END;
$$
LANGUAGE plpgsql;

-------------------------------------------------------------------------------
-- getCopyNumberClass(log2relativecopynumber)
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION getCopyNumberClass(log2relativecopynumber REAL) RETURNS INT2 AS $$
  BEGIN
    IF log2relativecopynumber > log(2, 3.5/2) THEN
      RETURN 2;
    ELSIF log2relativecopynumber < log(2, 1.0/2) THEN
      RETURN -2;
    ELSE
      RETURN 0;
    END IF;
  END;
$$ LANGUAGE plpgsql STABLE COST 100;

-------------------------------------------------------------------------------
-- combOperator(text)
-- returns *, >, or ? 
-------------------------------------------------------------------------------

DROP AGGREGATE IF EXISTS combOperator(TEXT);
CREATE OR REPLACE FUNCTION combineOperator(acc TEXT, instr TEXT) RETURNS TEXT AS $$
  BEGIN
    IF acc IS NULL OR acc = '' THEN
      RETURN instr;
    ELSE
      IF acc <> instr THEN
        RETURN '?';
      ELSE
        RETURN instr;
      END IF;
    END IF;
  END;
$$ LANGUAGE plpgsql;

CREATE AGGREGATE combOperator(
  basetype    = text,
  sfunc       = combineOperator,
  stype       = text,
  initcond    = ''
);

-------------------------------------------------------------------------------
-- isPositive(value REAL)
-- returns true, if a value is positive otherwise false
-------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION isPositive(value REAL) RETURNS BOOLEAN AS $$
  BEGIN
    RETURN (value > 0);
  END;
$$ LANGUAGE plpgsql IMMUTABLE;

-------------------------------------------------------------------------------
-- DeltaPOC(top REAL, bottom REAL, slope REAL, ec50 REAL, tZero REAL, conc REAL)
-- returns the deltaPOC at a specific concentration
-------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION DeltaPOC(top REAL, bottom REAL, slope REAL, ec50 REAL, tZero REAL, conc REAL) RETURNS REAL AS $$
  BEGIN
    IF ((top IS NULL) OR (bottom IS NULL) OR (slope IS NULL) OR (ec50 IS NULL)) THEN
      RETURN 100 - tZero;
    ELSE
      RETURN (((top - bottom)/((conc/ec50)^slope + 1)) + bottom) - tZero;
    END IF;
  END;
$$ LANGUAGE plpgsql;

-------------------------------------------------------------------------------
-- calcYonDRC(top REAL, bottom REAL, slope REAL, ec50 REAL, conc REAL)
-- returns the POC at a specific concentration
-------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION calcYonDRC(top REAL, bottom REAL, slope REAL, ec50 REAL, conc REAL) RETURNS REAL AS $$
  BEGIN
    IF ((top IS NULL) OR (bottom IS NULL) OR (slope IS NULL) OR (ec50 IS NULL)) THEN
      RETURN 100;
    ELSE
      RETURN (((top - bottom)/((conc/ec50)^slope + 1)) + bottom);
    END IF;
  END;
$$ LANGUAGE plpgsql;

-------------------------------------------------------------------------------
-- calcXonDRC(top, bottom, slope, ec50, poc)
-- calculates the concentration at a certain poc based on a drc
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calcXonDRC(top REAL, bottom REAL, slope REAL, ec50 REAL, poc REAL) RETURNS REAL AS $$
DECLARE
  x50 REAL;
BEGIN
  if ((top is null) OR (bottom is null) OR (slope is null) OR (ec50 is null) OR (poc is null) OR (bottom > poc) OR (poc > top)) THEN
     RETURN NULL;
  END IF;
  x50 := (ec50 * ((top - bottom)/(poc - bottom) - 1)^(1/slope));
  RETURN x50;
END;
$$ LANGUAGE 'plpgsql';

-------------------------------------------------------------------------------
-- geoMean(campaign, drugid, pretreatment
-- cellsperwell, timepoint
-------------------------------------------------------------------------------
DROP AGGREGATE IF EXISTS geomean(float);

DROP FUNCTION IF EXISTS lnsum(state geomean_state, nextvalue float);
DROP FUNCTION IF EXISTS avgexp(state geomean_state);
DROP TYPE IF EXISTS geomean_state;

CREATE TYPE geomean_state as (
  my_sum REAL,
  my_count INT4
);

CREATE OR REPLACE FUNCTION lnsum(state geomean_state, nextvalue float) RETURNS geomean_state AS $$
  BEGIN
    state.my_sum := state.my_sum + ln(nextvalue);
    state.my_count := state.my_count + 1;
    return state;
  END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION avgexp(state geomean_state) RETURNS float as $$
  BEGIN
    return(exp(state.my_sum/state.my_count));
  END;
$$ LANGUAGE plpgsql;

CREATE AGGREGATE geomean(
  stype       = geomean_state,
  basetype    = float,
  sfunc       = lnsum,
  finalfunc   = avgexp,
  initcond    = '(0, 0)'
);
-------------------------------------------------------------------------------
-- getCellProlifInhibition(top, bottom, slope, ec50, tZero, conc) 
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION getCellProlifInhibition(top REAL, bottom REAL, slope REAL, ec50 REAL, tZero REAL, conc REAL) RETURNS REAL AS $$
DECLARE
  signal FLOAT;
BEGIN
  IF ((top IS NULL) OR (bottom IS NULL) OR (slope IS NULL) OR (ec50 IS NULL)) THEN
    signal := 100;
  ELSE
    signal := ((top - bottom)/((conc/ec50)^slope + 1)) + bottom;
  END IF;

  RETURN(100 * (1 - ((signal - tZero)/(100 - tZero))));
END;
$$ LANGUAGE plpgsql;


-------------------------------------------------------------------------------
-- getCellGrowthInhibition(top, bottom, slope, ec50, tZero, conc) 
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION getCellGrowthInhibition(top REAL, bottom REAL, slope REAL, ec50 REAL, tZero REAL, conc REAL) RETURNS REAL AS $$
DECLARE
  signal FLOAT;
BEGIN
  IF ((top IS NULL) OR (bottom IS NULL) OR (slope IS NULL) OR (ec50 IS NULL)) THEN
    signal := 100;
  ELSE
    signal := ((top - bottom)/((conc/ec50)^slope + 1)) + bottom;
  END IF;

  IF (signal >= tZero) THEN
    RETURN(100 * (1 - ((signal - tZero)/(100 - tZero))));
  ELSE
    RETURN(100 * (1 - ((signal - tZero)/tZero)));
  END IF;
END;
$$ LANGUAGE plpgsql;
