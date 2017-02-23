DROP TRIGGER IF EXISTS checkProbeset ON probeset;
CREATE OR REPLACE FUNCTION checkProbeset() RETURNS trigger AS ' 
DECLARE
  num INT4;
  e TEXT;
BEGIN
  IF NEW.geneid IS NOT NULL THEN
    IF EXISTS (SELECT geneid FROM entrezgene WHERE geneid = NEW.geneid) THEN
      SELECT count(*) INTO num FROM entrezgene2ensemblgene WHERE geneid = NEW.geneid;
      IF num = 1 THEN
        SELECT ensg INTO e FROM entrezgene2ensemblgene WHERE geneid = NEW.geneid;
        NEW.ensg = e;
      END IF;
    ELSE
      NEW.geneid = NULL;
    END IF;
  END IF;

  RETURN NEW;
END;
' LANGUAGE 'plpgsql';

CREATE TRIGGER checkProbeset
  BEFORE INSERT OR UPDATE
  ON probeset
  FOR EACH ROW
    EXECUTE PROCEDURE checkProbeset();

-------------------------------------------------------------------------------------

DROP TRIGGER IF EXISTS updateGeneSymbolTrigger ON public.gene;
CREATE OR REPLACE FUNCTION updateGeneSymbol() RETURNS "trigger" AS $$
BEGIN
  IF (OLD.symbol IS NOT NULL) THEN
    IF NOT EXISTS (SELECT 1 FROM altensemblsymbol WHERE altsymbol = OLD.symbol AND ensg = NEW.ensg) THEN
      INSERT INTO altensemblsymbol (altsymbol, ensg) VALUES (OLD.symbol, NEW.ensg);
    END IF;
  END IF;

  IF (NEW.symbol IS NOT NULL) THEN
    DELETE FROM altensemblsymbol WHERE ensg = NEW.ensg AND altsymbol = NEW.symbol;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER updateGeneSymbolTrigger
  AFTER UPDATE
  ON public.gene
  FOR EACH ROW
  EXECUTE PROCEDURE updateGeneSymbol();

---------------------

DROP TRIGGER IF EXISTS updateEntrezGeneSymbolTrigger ON public.entrezgene;
CREATE OR REPLACE FUNCTION updateEntrezGeneSymbol() RETURNS "trigger" AS $$
BEGIN
  IF (OLD.symbol IS NOT NULL) THEN
    IF NOT EXISTS (SELECT 1 FROM altentrezgenesymbol WHERE symbol = OLD.symbol AND geneid = NEW.geneid) THEN
      INSERT INTO altentrezgenesymbol(symbol, geneid) VALUES (OLD.symbol, NEW.geneid);
    END IF;
  END IF;

  IF (NEW.symbol IS NOT NULL) THEN
    DELETE FROM altentrezgenesymbol WHERE geneid = NEW.geneid AND symbol = NEW.symbol;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER updateEntrezGeneSymbolTrigger
  AFTER UPDATE
  ON public.entrezgene
  FOR EACH ROW
  EXECUTE PROCEDURE updateEntrezGeneSymbol();

