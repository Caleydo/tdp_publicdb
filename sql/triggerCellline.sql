CREATE OR REPLACE LANGUAGE 'plpgsql';

---- sequenceDB ----------

-------------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS updateVersionTrigger on analysis;
CREATE OR REPLACE FUNCTION updateVersion() RETURNS "trigger" AS '
DECLARE
  versionN INT2;
BEGIN
  SELECT INTO versionN max(versionNumber) FROM version;
  IF FOUND THEN
    NEW.versionnumber := versionN;
  END IF;
  RETURN NEW;
END;
' LANGUAGE 'plpgsql';

CREATE TRIGGER updateVersionTrigger
  BEFORE INSERT OR UPDATE
  ON cellline.analysis
  FOR EACH ROW
    EXECUTE PROCEDURE updateVersion();

-------------------------------------------------------------------------------------

--DROP TRIGGER IF EXISTS canonicalTranscriptOnly ON cellline.analyzedexon;
--CREATE OR REPLACE FUNCTION removeNonCanonicalTranscripts() RETURNS "trigger" AS '
--DECLARE
--  isCanon BOOL;
--BEGIN
--  SELECT INTO isCanon iscanonical FROM transcript WHERE enst = NEW.enst;
--  IF isCanon THEN
--    RETURN NEW;
--  ELSE
--    RETURN NULL;
--  END IF;
--END;
--' LANGUAGE 'plpgsql';

--CREATE TRIGGER canonicalTranscriptOnly
--  BEFORE INSERT OR UPDATE
--  ON cellline.analyzedexon 
--  FOR EACH ROW
--    EXECUTE PROCEDURE removeNonCanonicalTranscripts();

-------------------------------------------------------------------------------------

-- prolifDB ---------

-------------------------------------------------------------------------------------
--DROP TRIGGER IF EXISTS deleteDRCTrigger ON cellline.curveanalysis;
--CREATE OR REPLACE FUNCTION deleteDRC() RETURNS "trigger" AS '
--BEGIN
--  DELETE FROM doseresponsecurve WHERE doseresponsecurve = OLD.doseresponsecurve;
--  RETURN NEW;
--END;
--' LANGUAGE 'plpgsql';

--CREATE TRIGGER deleteDRCTrigger 
-- AFTER UPDATE OR DELETE
-- ON cellline.curveanalysis 
-- FOR EACH ROW
--EXECUTE PROCEDURE deleteDRC();

-------------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS recalcCurve ON cellline.measuredvalue;
CREATE OR REPLACE FUNCTION setRecalculate() RETURNS "trigger" AS '
BEGIN
  UPDATE doseresponsecurve SET recalculate = TRUE WHERE doseresponsecurve IN
         (SELECT doseresponsecurve FROM curveanalysis 
          WHERE plateid = OLD.plateid AND well = OLD.well);
  UPDATE doseresponsematrix SET recalculate = TRUE WHERE doseresponsematrix IN
         (SELECT doseresponsematrix FROM matrixanalysis 
          WHERE plateid = OLD.plateid AND well = OLD.well);
  RETURN NULL;
END;
' LANGUAGE 'plpgsql';

CREATE TRIGGER recalcCurve
  AFTER UPDATE OR DELETE
  ON cellline.measuredvalue
  FOR EACH ROW
    EXECUTE PROCEDURE setRecalculate();

-------------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS checkInvalidateCurve ON measuredvalue;
CREATE OR REPLACE FUNCTION checkInvalidDeclaration() RETURNS "trigger" AS '
DECLARE
  nLocked INT4;
  nPlates INT4;
BEGIN
  SELECT INTO nLocked count(*) FROM doseresponsecurve WHERE doseresponsecurve IN 
    (SELECT distinct doseresponsecurve FROM curveanalysis WHERE 
    plateid = OLD.plateid and well = OLD.well) AND locked;
  IF (nLocked > 0) THEN
    RETURN NULL;
  ELSE
    RETURN NEW;
  END IF;
END;
' LANGUAGE 'plpgsql';

CREATE TRIGGER checkInvalidateCurve 
  BEFORE UPDATE
  ON cellline.measuredvalue
  FOR EACH ROW
    EXECUTE PROCEDURE checkInvalidDeclaration();

-------------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS checkDeleteMeasuredValue ON measuredvalue; 
CREATE OR REPLACE FUNCTION checkDeleteMeasuredValue() RETURNS "trigger" AS '
DECLARE
  nLocked INT4;
  nPlates INT4;
BEGIN
  SELECT INTO nLocked count(*) FROM doseresponsecurve WHERE doseresponsecurve IN 
    (SELECT distinct doseresponsecurve FROM curveanalysis WHERE 
    plateid = OLD.plateid and well = OLD.well) AND locked;
  IF (nLocked > 0) THEN
    SELECT INTO nPlates count(*) FROM plate WHERE plateid = OLD.plateid;
    IF (nPlates > 0) THEN
      RETURN NULL;
    ELSE
      RETURN OLD;
    END IF;
  ELSE
    RETURN OLD; 
  END IF;
END;
' LANGUAGE 'plpgsql';

CREATE TRIGGER checkDeleteMeasuredValue
  BEFORE DELETE
  ON cellline.measuredvalue
  FOR EACH ROW
    EXECUTE PROCEDURE checkDeleteMeasuredValue();

-------------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS fillDRC ON cellline.doseresponsecurve;
CREATE OR REPLACE FUNCTION fillBaseDataDRC() RETURNS "trigger" AS '
DECLARE
  rs record;
BEGIN
  SELECT INTO rs distinct m.celllinename, m.drugid, m.sampleid,
    m.cellsperwell, p.timepoint, m.pretreatment, p.campaign, p.round, p.proliferationtest, p.laboratory 
    FROM doseresponsecurve drc
    JOIN curveanalysis c ON c.doseresponsecurve = drc.doseresponsecurve
    JOIN measuredvalue m ON (m.plateid = c.plateid AND m.well = c.well)
    JOIN plate p ON p.plateid = m.plateid
    JOIN cellline cl ON cl.celllinename = m.celllinename
    WHERE category = ''test'' AND drc.doseresponsecurve = NEW.doseresponsecurve;
  IF FOUND THEN
    NEW.celllinename := rs.celllinename;
    NEW.drugid := rs.drugid;
    NEW.sampleid := rs.sampleid;
    NEW.cellsperwell := rs.cellsperwell;
    NEW.timepoint := rs.timepoint;
    NEW.pretreatment := rs.pretreatment;
    NEW.campaign := rs.campaign;
    NEW.round := rs.round;
    NEW.proliferationtest := rs.proliferationtest;
    NEW.laboratory := rs.laboratory;
  END IF;
  RETURN NEW;
END;
' LANGUAGE 'plpgsql';

CREATE TRIGGER fillDRC 
  BEFORE UPDATE
  ON cellline.doseresponsecurve 
  FOR EACH ROW
    EXECUTE PROCEDURE fillBaseDataDRC();

-------------------------------------------------------------------------------------

--DROP TRIGGER IF EXISTS updatePlateInfo ON cellline.plate;
--CREATE TRIGGER updatePlateInfo
--  AFTER UPDATE
--  ON cellline.plate
--  FOR EACH ROW
--    EXECUTE PROCEDURE fillBaseDataDRC();

-------------------------------------------------------------------------------------

DROP TRIGGER IF EXISTS fillDRM ON cellline.doseresponsematrix;
CREATE OR REPLACE FUNCTION fillBaseDataDRM() RETURNS "trigger" AS '
DECLARE
  rs record;
  rs2 record;
BEGIN
  SELECT INTO rs2 distinct m.drugid
    FROM doseresponsematrix drm
    JOIN matrixanalysis ma ON ma.doseresponsematrix = drm.doseresponsematrix
    JOIN measuredvalue m ON (m.plateid = ma.plateid AND m.well = ma.well)
    JOIN plate p ON p.plateid = m.plateid
    JOIN cellline cl ON cl.celllinename = m.celllinename
    WHERE category = ''negative_control'' AND drm.doseresponsematrix = NEW.doseresponsematrix;
  SELECT INTO rs distinct m.celllinename, m.drugid, m.sampleid, m.drugid2, m.sampleid2,
    m.cellsperwell, p.timepoint, p.treatmenttime, p.treatmenttime2, m.pretreatment, 
    p.campaign, p.round, p.proliferationtest, p.laboratory
    FROM doseresponsematrix drm
    JOIN matrixanalysis ma ON ma.doseresponsematrix = drm.doseresponsematrix
    JOIN measuredvalue m ON (m.plateid = ma.plateid AND m.well = ma.well)
    JOIN plate p ON p.plateid = m.plateid
    JOIN cellline cl ON cl.celllinename = m.celllinename
    WHERE category = ''test'' AND m.drugid <> rs2.drugid AND m.drugid2 <> rs2.drugid 
    AND drm.doseresponsematrix = NEW.doseresponsematrix;
  IF FOUND THEN
    NEW.celllinename := rs.celllinename;
    NEW.drugid := rs.drugid;
    NEW.sampleid := rs.sampleid;
    NEW.drugid2 := rs.drugid2;
    NEW.sampleid2 := rs.sampleid2;
    NEW.cellsperwell := rs.cellsperwell;
    NEW.treatmenttime := rs.treatmenttime;
    NEW.treatmenttime2 := rs.treatmenttime2;
    NEW.timepoint := rs.timepoint;
    NEW.pretreatment := rs.pretreatment;
    NEW.campaign := rs.campaign;
    NEW.round := rs.round;
    NEW.proliferationtest := rs.proliferationtest;
    NEW.laboratory := rs.laboratory;
  END IF;
  RETURN NEW;
END;
' LANGUAGE 'plpgsql';

CREATE TRIGGER fillDRM
  BEFORE UPDATE
  ON cellline.doseresponsematrix
  FOR EACH ROW 
    EXECUTE PROCEDURE fillBaseDataDRM();
