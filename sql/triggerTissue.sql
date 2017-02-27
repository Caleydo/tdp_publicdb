---------------------------------------------
DROP TRIGGER IF EXISTS updateAssociatedNGSRunTrigger on tissue.ngsrun;
CREATE OR REPLACE FUNCTION tissue.updateAssociatedNGSRuns() RETURNS "trigger" AS $$
DECLARE
  angsid TEXT;
  nngsid TEXT;
BEGIN
  IF (NEW.ngsid = NEW.associatedngsid) THEN 
    RAISE EXCEPTION 'circular reference on ngsid and associatedngsid';
  END IF;
  SELECT INTO angsid associatedngsid FROM tissue.ngsrun WHERE ngsid = NEW.associatedngsid;
  IF (angsid IS DISTINCT FROM NEW.ngsid) AND (NEW.associatedngsid IS NOT NULL) THEN
    UPDATE tissue.ngsrun SET associatedngsid = NEW.ngsid WHERE ngsid = NEW.associatedngsid;
  END IF;
  IF (NEW.associatedngsid IS NULL) THEN
    SELECT INTO nngsid ngsid FROM tissue.ngsrun WHERE associatedngsid = NEW.ngsid;
    IF nngsid IS NOT NULL THEN 
      UPDATE tissue.ngsrun SET associatedngsid = NULL WHERE ngsid = nngsid;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER updateAssociatedNGSRunTrigger
  AFTER INSERT OR UPDATE
  ON tissue.ngsrun
  FOR EACH ROW
  EXECUTE PROCEDURE tissue.updateAssociatedNGSRuns();
