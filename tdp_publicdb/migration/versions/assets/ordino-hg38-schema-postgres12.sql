








SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

-- Upgrading schema with alembic fails when the below command is also executed.
-- SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;






CREATE SCHEMA cellline;


ALTER SCHEMA cellline OWNER TO postgres;










CREATE SCHEMA tissue;


ALTER SCHEMA tissue OWNER TO postgres;






 CREATE TYPE public.copynumberresult AS (
 	celllinename character varying(50),
 	ensg character varying(20),
 	log2copynumber real,
 	weightedlog2copynumber real,
 	copynumbergainintron boolean,
 	copynumberlossintron boolean,
 	copynumbergainexon boolean,
 	copynumberlossexon boolean,
 	gap boolean,
 	jump boolean,
 	exonicchange boolean,
 	intronicchange boolean,
 	cosmicdeletion text,
 	cosmiczygosity real,
 	bicsdeletion text,
 	bicszygosity real,
 	ngsdeletion text,
 	ngszygosity real,
 	snpchipalteration text,
 	snpchipzygocity real,
 	numsources smallint
 );


 ALTER TYPE public.copynumberresult OWNER TO postgres;






 CREATE TYPE public.drmresult AS (
 	conc1 real,
 	conc2 real,
 	poc real,
 	cgi real,
 	pochsa real,
 	pocbliss real,
 	cgihsa real,
 	cgibliss real,
 	pochsaexcess real,
 	pocblissexcess real,
 	cgihsaexcess real,
 	cgiblissexcess real
 );


 ALTER TYPE public.drmresult OWNER TO postgres;






 CREATE TYPE public.geomean_state AS (
 	my_sum real,
 	my_count integer
 );


 ALTER TYPE public.geomean_state OWNER TO postgres;






 CREATE TYPE public.mutsummary AS (
 	celllinename text,
 	numbings smallint,
 	numbics smallint,
 	numbiwxs smallint,
 	numcclewxs smallint,
 	zygosity real,
 	found boolean,
 	notfound boolean
 );


 ALTER TYPE public.mutsummary OWNER TO postgres;






 CREATE FUNCTION cellline.filldatadrc(mydrc integer) RETURNS boolean
     LANGUAGE plpgsql
     AS $$
 DECLARE
   rs record;
 BEGIN
   SELECT INTO rs distinct m.celllinename, cl.organ, m.drugid, m.sampleid, d.target,
     m.cellsperwell, p.timepoint, m.pretreatment, p.campaign, p.round, p.proliferationtest, p.laboratory
     FROM cellline.doseresponsecurve drc
     JOIN cellline.curveanalysis c ON c.doseresponsecurve = drc.doseresponsecurve
     JOIN cellline.measuredvalue m ON (m.plateid = c.plateid AND m.well = c.well)
     JOIN cellline.plate p ON p.plateid = m.plateid
     JOIN cellline.cellline cl ON cl.celllinename = m.celllinename
     JOIN drug d ON d.drugid = m.drugid
     WHERE category = 'test' AND drc.doseresponsecurve = myDrc;
   IF FOUND THEN
     UPDATE cellline.doseresponsecurve
     SET celllinename = rs.celllinename, drugid = rs.drugid, sampleid = rs.sampleid,
         cellsperwell = rs.cellsperwell, timepoint = rs.timepoint, pretreatment = rs.pretreatment,
         campaign = rs.campaign, round = rs.round, proliferationtest = rs.proliferationtest,
         laboratory = rs.laboratory
         WHERE doseresponsecurve = myDrc;
   END IF;
   RETURN true;
 END;
 $$;


 ALTER FUNCTION cellline.filldatadrc(mydrc integer) OWNER TO postgres;






 CREATE FUNCTION cellline.getcopynumberregion(hid text, chrom smallint, nucstart integer, nucstop integer, alg text) RETURNS real
     LANGUAGE plpgsql
     AS $$
 DECLARE
   ld_row record;
   nCounter INTEGER;
   mymean REAL;
   retval REAL;
 BEGIN
     nCounter = 0;

     FOR ld_row IN SELECT log2relativecopynumber as m FROM cellline.copynumberregion WHERE algorithm = alg AND
         hybridizationid = hid AND chromosome = chrom AND start <= nucstart AND stop >= nucstop
     LOOP
       nCounter = nCounter + 1;
       mymean = ld_row.m;
     END LOOP;

     IF nCounter = 1 THEN
       RETURN 2 * 2 ^ mymean;
     ELSE
       SELECT INTO nCounter count(*) FROM cellline.copynumberregion WHERE algorithm = alg AND
         hybridizationid = hid AND chromosome = chrom AND
         ((start >= nucstart AND start <= nucstop) OR (stop >= nucstart AND stop <= nucstop));
       IF (nCounter <= 1) THEN retval := -1; END IF;
       IF (nCounter > 1) THEN retval := -2; END IF;
       RETURN retval;
     END IF;
 END;
 $$;


 ALTER FUNCTION cellline.getcopynumberregion(hid text, chrom smallint, nucstart integer, nucstop integer, alg text) OWNER TO postgres;






 CREATE FUNCTION cellline.getgeomeangi50(text, text, text) RETURNS double precision
     LANGUAGE plpgsql
     AS $_$
 DECLARE
   myAvg float;
 begin
   SELECT into myAvg exp(avg(ln(x))) FROM
    (SELECT exp(avg(ln(gi50))) as x FROM cellline.doseresponsecurve
     WHERE drugid = $1 AND campaign = $2 AND pretreatment = $3 AND valid GROUP BY celllinename) dt;
   return(myAvg);
 end;
 $_$;


 ALTER FUNCTION cellline.getgeomeangi50(text, text, text) OWNER TO postgres;






 CREATE FUNCTION cellline.getgeomeangi50_2(text, text, text) RETURNS double precision
     LANGUAGE plpgsql
     AS $_$
 DECLARE
   myAvg float;
 begin
   SELECT INTO myAvg geomean(x) FROM
    (SELECT geomean(gi50) as x FROM cellline.doseresponsecurve
     WHERE drugid = $1 AND campaign = $2 AND pretreatment = $3 AND valid GROUP BY celllinename) dt;
   return(myAvg);
 end;
 $_$;


 ALTER FUNCTION cellline.getgeomeangi50_2(text, text, text) OWNER TO postgres;






 CREATE FUNCTION public.avgexp(state public.geomean_state) RETURNS double precision
     LANGUAGE plpgsql
     AS $$
   BEGIN
     return(exp(state.my_sum/state.my_count));
   END;
 $$;


 ALTER FUNCTION public.avgexp(state public.geomean_state) OWNER TO postgres;






 CREATE FUNCTION public.calcxondrc(top real, bottom real, slope real, ec50 real, poc real) RETURNS real
     LANGUAGE plpgsql
     AS $$
 DECLARE
   x50 REAL;
 BEGIN
   if ((top is null) OR (bottom is null) OR (slope is null) OR (ec50 is null) OR (poc is null) OR (bottom > poc) OR (poc > top)) THEN
      RETURN NULL;
   END IF;
   x50 := (ec50 * ((top - bottom)/(poc - bottom) - 1)^(1/slope));
   RETURN x50;
 END;
 $$;


 ALTER FUNCTION public.calcxondrc(top real, bottom real, slope real, ec50 real, poc real) OWNER TO postgres;






 CREATE FUNCTION public.calcyondrc(top real, bottom real, slope real, ec50 real, conc real) RETURNS real
     LANGUAGE plpgsql
     AS $$
   BEGIN
     IF ((top IS NULL) OR (bottom IS NULL) OR (slope IS NULL) OR (ec50 IS NULL)) THEN
       RETURN 100;
     ELSE
       RETURN (((top - bottom)/((conc/ec50)^slope + 1)) + bottom);
     END IF;
   END;
 $$;


 ALTER FUNCTION public.calcyondrc(top real, bottom real, slope real, ec50 real, conc real) OWNER TO postgres;






 CREATE FUNCTION public.cellline_expression(rnaseqrun text[], min_max integer) RETURNS TABLE(celllinename text, ensg text, log2fpkm real, log2tpm real, log2cpm real, counts integer)
     LANGUAGE plpgsql
     AS $$
 BEGIN
   RETURN QUERY
   WITH expr_data AS (
     SELECT r.celllinename, e.ensg, e.log2fpkm, e.log2tpm, e.log2cpm, e.counts FROM cellline.processedrnaseq e
     INNER JOIN cellline.rnaseqrun r ON r.rnaseqrunid = e.rnaseqrunid
     WHERE r.rnaseqrunid = ANY(rnaseqrun)
   ),
   ensg_expr AS (
     SELECT e.ensg from expr_data e GROUP BY e.ensg HAVING max(e.counts) >= min_max
   )
   SELECT n.celllinename, n.ensg, n.counts FROM expr_data n INNER JOIN ensg_expr e ON e.ensg = n.ensg;
 END; $$;


 ALTER FUNCTION public.cellline_expression(rnaseqrun text[], min_max integer) OWNER TO postgres;






 CREATE FUNCTION public.checkdeletemeasuredvalue() RETURNS trigger
     LANGUAGE plpgsql
     AS $$
 DECLARE
   nLocked INT4;
   nPlates INT4;
 BEGIN
   SELECT INTO nLocked count(*) FROM cellline.doseresponsecurve WHERE doseresponsecurve IN
     (SELECT distinct doseresponsecurve FROM cellline.curveanalysis WHERE
     plateid = OLD.plateid and well = OLD.well) AND locked;
   IF (nLocked > 0) THEN
     SELECT INTO nPlates count(*) FROM cellline.plate WHERE plateid = OLD.plateid;
     IF (nPlates > 0) THEN
       RETURN NULL;
     ELSE
       RETURN OLD;
     END IF;
   ELSE
     RETURN OLD;
   END IF;
 END;
 $$;


 ALTER FUNCTION public.checkdeletemeasuredvalue() OWNER TO postgres;






 CREATE FUNCTION public.checkinvaliddeclaration() RETURNS trigger
     LANGUAGE plpgsql
     AS $$
 DECLARE
   nLocked INT4;
   nPlates INT4;
 BEGIN
   SELECT INTO nLocked count(*) FROM cellline.doseresponsecurve WHERE doseresponsecurve IN
     (SELECT distinct doseresponsecurve FROM cellline.curveanalysis WHERE
     plateid = OLD.plateid and well = OLD.well) AND locked;
   IF (nLocked > 0) THEN
     RETURN NULL;
   ELSE
     RETURN NEW;
   END IF;
 END;
 $$;


 ALTER FUNCTION public.checkinvaliddeclaration() OWNER TO postgres;






 CREATE FUNCTION public.checkprobeset() RETURNS trigger
     LANGUAGE plpgsql
     AS $$
 DECLARE
   num INT4;
   e TEXT;
 BEGIN
   IF NEW.geneid IS NOT NULL THEN
     IF EXISTS (SELECT geneid FROM public.entrezgene WHERE geneid = NEW.geneid) THEN
       SELECT count(*) INTO num FROM public.entrezgene2ensemblgene WHERE geneid = NEW.geneid;
       IF num = 1 THEN
         SELECT ensg INTO e FROM public.entrezgene2ensemblgene WHERE geneid = NEW.geneid;
         NEW.ensg = e;
       END IF;
     ELSE
       NEW.geneid = NULL;
     END IF;
   END IF;

   RETURN NEW;
 END;
 $$;


 ALTER FUNCTION public.checkprobeset() OWNER TO postgres;






 CREATE FUNCTION public.cleanname(name text) RETURNS text
     LANGUAGE plpgsql
     AS $$
 DECLARE
   cleanName TEXT;
 BEGIN
   cleanName := regexp_replace(name, '[-_[:space:]]', '', 'g');
   cleanName := regexp_replace(cleanName, '[/,().]', '', 'g');
   RETURN lower(cleanName);
 END;
 $$;


 ALTER FUNCTION public.cleanname(name text) OWNER TO postgres;






 CREATE FUNCTION public.coarse(seq text) RETURNS text
     LANGUAGE plpgsql
     AS $$
   BEGIN
     IF seq <> 'wt' THEN
       RETURN 'mut';
     ELSE
       RETURN(seq);
     END IF;
   END;
 $$;


 ALTER FUNCTION public.coarse(seq text) OWNER TO postgres;






 CREATE FUNCTION public.coarsenum(seq text) RETURNS smallint
     LANGUAGE plpgsql
     AS $$
   BEGIN
     IF seq <> 'wt' THEN
       RETURN 1;
     ELSE
       RETURN 0;
     END IF;
   END;
 $$;


 ALTER FUNCTION public.coarsenum(seq text) OWNER TO postgres;






 CREATE FUNCTION public.combineoperator(acc text, instr text) RETURNS text
     LANGUAGE plpgsql
     AS $$
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
 $$;


 ALTER FUNCTION public.combineoperator(acc text, instr text) OWNER TO postgres;






 CREATE FUNCTION public.compute_boxplot(arr double precision[]) RETURNS json
     LANGUAGE plpgsql
     AS $$
 DECLARE
   percentiles double precision[];
   q1 double precision;
   q3 double precision;
   iqr double precision;
   upper_whisker double precision;
   lower_whisker double precision;
   max_whisker double precision;
   min_whisker double precision;
   outliers double precision[];
 BEGIN
   percentiles := percentile_cont(ARRAY[0, 0.25, 0.5, 0.75, 1]) WITHIN GROUP (ORDER BY v ASC) FROM unnest(arr) AS t(v);

   q1 := percentiles[2];
   q3 := percentiles[4];
   iqr := q3 - q1;

   min_whisker := q1 - 1.5 * iqr;
   max_whisker := q3 + 1.5 * iqr;

   lower_whisker := coalesce(min(x), q1) FROM unnest(arr) x WHERE x >= min_whisker AND x < q1;
   upper_whisker := coalesce(max(x), q3) FROM unnest(arr) x WHERE x <= max_whisker AND x > q3;

   outliers := array_agg(v ORDER BY v ASC) FROM unnest(arr) as t(v) WHERE v < min_whisker OR v > max_whisker;

   RETURN json_build_object('min', percentiles[1], 'q1', q1, 'median', percentiles[3], 'q3', q3, 'max', percentiles[5], 'outlier', outliers, 'whiskerLow', lower_whisker, 'whiskerHigh', upper_whisker);
 END;
 $$;


 ALTER FUNCTION public.compute_boxplot(arr double precision[]) OWNER TO postgres;






 CREATE FUNCTION public.deltapoc(top real, bottom real, slope real, ec50 real, tzero real, conc real) RETURNS real
     LANGUAGE plpgsql
     AS $$
   BEGIN
     IF ((top IS NULL) OR (bottom IS NULL) OR (slope IS NULL) OR (ec50 IS NULL)) THEN
       RETURN 100 - tZero;
     ELSE
       RETURN (((top - bottom)/((conc/ec50)^slope + 1)) + bottom) - tZero;
     END IF;
   END;
 $$;


 ALTER FUNCTION public.deltapoc(top real, bottom real, slope real, ec50 real, tzero real, conc real) OWNER TO postgres;






 CREATE FUNCTION public.ensemblspecies(taxid integer) RETURNS text
     LANGUAGE plpgsql
     AS $$
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
 $$;


 ALTER FUNCTION public.ensemblspecies(taxid integer) OWNER TO postgres;






 CREATE FUNCTION public.ensemblspecies(id text) RETURNS text
     LANGUAGE plpgsql
     AS $$
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
 $$;


 ALTER FUNCTION public.ensemblspecies(id text) OWNER TO postgres;






 CREATE FUNCTION public.fillbasedatadrc() RETURNS trigger
     LANGUAGE plpgsql
     AS $$
 DECLARE
   rs record;
 BEGIN
   SELECT INTO rs distinct m.celllinename, m.drugid, m.sampleid,
     m.cellsperwell, p.timepoint, m.pretreatment, p.campaign, p.round, p.proliferationtest, p.laboratory
     FROM cellline.doseresponsecurve drc
     JOIN cellline.curveanalysis c ON c.doseresponsecurve = drc.doseresponsecurve
     JOIN cellline.measuredvalue m ON (m.plateid = c.plateid AND m.well = c.well)
     JOIN cellline.plate p ON p.plateid = m.plateid
     JOIN cellline.cellline cl ON cl.celllinename = m.celllinename
     WHERE category = 'test' AND drc.doseresponsecurve = NEW.doseresponsecurve;
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
 $$;


 ALTER FUNCTION public.fillbasedatadrc() OWNER TO postgres;






 CREATE FUNCTION public.fillbasedatadrm() RETURNS trigger
     LANGUAGE plpgsql
     AS $$
 DECLARE
   rs record;
   rs2 record;
 BEGIN
   SELECT INTO rs2 distinct m.drugid
     FROM cellline.doseresponsematrix drm
     JOIN cellline.matrixanalysis ma ON ma.doseresponsematrix = drm.doseresponsematrix
     JOIN cellline.measuredvalue m ON (m.plateid = ma.plateid AND m.well = ma.well)
     JOIN cellline.plate p ON p.plateid = m.plateid
     JOIN cellline.cellline cl ON cl.celllinename = m.celllinename
     WHERE category = 'negative_control' AND drm.doseresponsematrix = NEW.doseresponsematrix;
   SELECT INTO rs distinct m.celllinename, m.drugid, m.sampleid, m.drugid2, m.sampleid2,
     m.cellsperwell, p.timepoint, p.treatmenttime, p.treatmenttime2, m.pretreatment,
     p.campaign, p.round, p.proliferationtest, p.laboratory
     FROM cellline.doseresponsematrix drm
     JOIN cellline.matrixanalysis ma ON ma.doseresponsematrix = drm.doseresponsematrix
     JOIN cellline.measuredvalue m ON (m.plateid = ma.plateid AND m.well = ma.well)
     JOIN cellline.plate p ON p.plateid = m.plateid
     JOIN cellline.cellline cl ON cl.celllinename = m.celllinename
     WHERE category = 'test' AND m.drugid <> rs2.drugid AND m.drugid2 <> rs2.drugid
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
 $$;


 ALTER FUNCTION public.fillbasedatadrm() OWNER TO postgres;






 CREATE FUNCTION public.getcellgrowthinhibition(top real, bottom real, slope real, ec50 real, tzero real, conc real) RETURNS real
     LANGUAGE plpgsql
     AS $$
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
 $$;


 ALTER FUNCTION public.getcellgrowthinhibition(top real, bottom real, slope real, ec50 real, tzero real, conc real) OWNER TO postgres;






 CREATE FUNCTION public.getcellprolifinhibition(top real, bottom real, slope real, ec50 real, tzero real, conc real) RETURNS real
     LANGUAGE plpgsql
     AS $$
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
 $$;


 ALTER FUNCTION public.getcellprolifinhibition(top real, bottom real, slope real, ec50 real, tzero real, conc real) OWNER TO postgres;






 CREATE FUNCTION public.getcodinglength(exon smallint, transstart integer, transend integer, seqstart integer, seqend integer, strand smallint, startexon integer, endexon integer) RETURNS integer
     LANGUAGE plpgsql
     AS $$
 DECLARE
   myLen INT4;
 BEGIN
   IF ((exon < startexon) OR (exon > endexon)) THEN
     RETURN(0);
   END IF;
   IF ((transstart IS NULL) AND (transend IS NULL)) THEN
     RETURN(seqend - seqstart + 1);
   END IF;
   myLen := seqend - seqstart + 1;
   IF (transend IS NOT NULL) THEN
     myLen := transend;
   END IF;
   IF (transstart IS NOT NULL) THEN
     myLen := myLen - transstart + 1;
   END IF;
   RETURN(myLen);
 END;
 $$;


 ALTER FUNCTION public.getcodinglength(exon smallint, transstart integer, transend integer, seqstart integer, seqend integer, strand smallint, startexon integer, endexon integer) OWNER TO postgres;






 CREATE FUNCTION public.getspecies(ensg text) RETURNS text
     LANGUAGE plpgsql STABLE
     AS $$
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
 $$;


 ALTER FUNCTION public.getspecies(ensg text) OWNER TO postgres;






 CREATE FUNCTION public.ispositive(value real) RETURNS boolean
     LANGUAGE plpgsql IMMUTABLE
     AS $$
   BEGIN
     RETURN (value > 0);
   END;
 $$;


 ALTER FUNCTION public.ispositive(value real) OWNER TO postgres;






 CREATE FUNCTION public.lnsum(state public.geomean_state, nextvalue double precision) RETURNS public.geomean_state
     LANGUAGE plpgsql
     AS $$
   BEGIN
     state.my_sum := state.my_sum + ln(nextvalue);
     state.my_count := state.my_count + 1;
     return state;
   END;
 $$;


 ALTER FUNCTION public.lnsum(state public.geomean_state, nextvalue double precision) OWNER TO postgres;






 CREATE FUNCTION public.replacenull(val text, replaceval text) RETURNS text
     LANGUAGE plpgsql
     AS $$
 BEGIN
   IF (val IS NULL) THEN
     RETURN replaceVal;
   END IF;
   RETURN val;
 END;
 $$;


 ALTER FUNCTION public.replacenull(val text, replaceval text) OWNER TO postgres;






 CREATE FUNCTION public.setentrezgene2ensemblgene(myensg text, mygeneid integer) RETURNS smallint
     LANGUAGE plpgsql
     AS $$
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
 $$;


 ALTER FUNCTION public.setentrezgene2ensemblgene(myensg text, mygeneid integer) OWNER TO postgres;






 CREATE FUNCTION public.sethomologene2entrezgene(myhomologenecluster integer, mygeneid integer) RETURNS smallint
     LANGUAGE plpgsql
     AS $$
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
 $$;


 ALTER FUNCTION public.sethomologene2entrezgene(myhomologenecluster integer, mygeneid integer) OWNER TO postgres;






 CREATE FUNCTION public.setmirbase2ensemblgene(myensg text, miracc text) RETURNS smallint
     LANGUAGE plpgsql
     AS $$
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
 $$;


 ALTER FUNCTION public.setmirbase2ensemblgene(myensg text, miracc text) OWNER TO postgres;






 CREATE FUNCTION public.setrecalculate() RETURNS trigger
     LANGUAGE plpgsql
     AS $$
 BEGIN
   UPDATE cellline.doseresponsecurve SET recalculate = TRUE WHERE doseresponsecurve IN
          (SELECT doseresponsecurve FROM cellline.curveanalysis
           WHERE plateid = OLD.plateid AND well = OLD.well);
   UPDATE cellline.doseresponsematrix SET recalculate = TRUE WHERE doseresponsematrix IN
          (SELECT doseresponsematrix FROM cellline.matrixanalysis
           WHERE plateid = OLD.plateid AND well = OLD.well);
   RETURN NULL;
 END;
 $$;


 ALTER FUNCTION public.setrecalculate() OWNER TO postgres;






 CREATE FUNCTION public.updateentrezgenesymbol() RETURNS trigger
     LANGUAGE plpgsql
     AS $$
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
 $$;


 ALTER FUNCTION public.updateentrezgenesymbol() OWNER TO postgres;






 CREATE FUNCTION public.updategenesymbol() RETURNS trigger
     LANGUAGE plpgsql
     AS $$
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
 $$;


 ALTER FUNCTION public.updategenesymbol() OWNER TO postgres;






 CREATE FUNCTION public.upsertinfo(descript text, info text) RETURNS void
     LANGUAGE plpgsql
     AS $$
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
 $$;


 ALTER FUNCTION public.upsertinfo(descript text, info text) OWNER TO postgres;






 CREATE FUNCTION tissue.updateassociatedrnaseqruns() RETURNS trigger
     LANGUAGE plpgsql
     AS $$
 DECLARE
   arnaseqrunid TEXT;
   nrnaseqrunid TEXT;
 BEGIN
   IF (NEW.rnaseqrunid = NEW.associatedrnaseqrunid) THEN
     RAISE EXCEPTION 'circular reference on rnaseqrunid and associatedrnaseqrunid';
   END IF;
   SELECT INTO arnaseqrunid associatedrnaseqrunid FROM tissue.rnaseqrun WHERE rnaseqrunid = NEW.associatedrnaseqrunid;
   IF (arnaseqrunid IS DISTINCT FROM NEW.rnaseqrunid) AND (NEW.associatedrnaseqrunid IS NOT NULL) THEN
     UPDATE tissue.rnaseqrun SET associatedrnaseqrunid = NEW.rnaseqrunid WHERE rnaseqrunid = NEW.associatedrnaseqrunid;
   END IF;
   IF (NEW.associatedrnaseqrunid IS NULL) THEN
     SELECT INTO nrnaseqrunid rnaseqrunid FROM tissue.rnaseqrun WHERE associatedrnaseqrunid = NEW.rnaseqrunid;
     IF nrnaseqrunid IS NOT NULL THEN
       UPDATE tissue.rnaseqrun SET associatedrnaseqrunid = NULL WHERE rnaseqrunid = nrnaseqrunid;
     END IF;
   END IF;
   RETURN NEW;
 END;
 $$;


 ALTER FUNCTION tissue.updateassociatedrnaseqruns() OWNER TO postgres;






 CREATE AGGREGATE public.boxplot(double precision) (
     SFUNC = array_append,
     STYPE = double precision[],
     INITCOND = '{}',
     FINALFUNC = public.compute_boxplot
 );


 ALTER AGGREGATE public.boxplot(double precision) OWNER TO postgres;






 CREATE AGGREGATE public.comboperator(text) (
     SFUNC = public.combineoperator,
     STYPE = text,
     INITCOND = ''
 );


 ALTER AGGREGATE public.comboperator(text) OWNER TO postgres;






 CREATE AGGREGATE public.geomean(double precision) (
     SFUNC = public.lnsum,
     STYPE = public.geomean_state,
     INITCOND = '(0, 0)',
     FINALFUNC = public.avgexp
 );


 ALTER AGGREGATE public.geomean(double precision) OWNER TO postgres;

 SET default_tablespace = '';







 CREATE TABLE cellline.mutation (
     dnaseqrunid integer NOT NULL,
     chromosome text NOT NULL,
     startpos bigint NOT NULL,
     enst text NOT NULL,
     mutationeffect text,
     assembly text,
     genomicregion text,
     exon smallint,
     cdnamutation text,
     proteinmutation text,
     snp boolean,
     snpsource text,
     dbsnpid text,
     dnazygosity real,
     dnacoverage integer,
     rnazygosity real,
     rnacoverage integer,
     qualityscore real,
     siftscore text,
     onekg_allelicfreq real,
     gnomad_allelicfreq real
 );


 ALTER TABLE cellline.mutation OWNER TO postgres;






 CREATE TABLE public.transcript (
     enst text NOT NULL,
     ensg text,
     transcriptname text,
     chromosome text,
     strand smallint,
     seqstart integer,
     seqend integer,
     iscanonical boolean,
     cosmic_id_transcript integer
 );


 ALTER TABLE public.transcript OWNER TO postgres;






 CREATE VIEW cellline.alltranscriptmutation AS
  SELECT m.dnaseqrunid,
     m.chromosome,
     m.startpos,
     m.enst,
     m.mutationeffect,
     m.assembly,
     m.genomicregion,
     m.exon,
     m.cdnamutation,
     m.proteinmutation,
     m.snp,
     m.snpsource,
     m.dbsnpid,
     m.dnazygosity,
     m.dnacoverage,
     m.rnazygosity,
     m.rnacoverage,
     m.qualityscore,
     m.siftscore,
     m.onekg_allelicfreq,
     m.gnomad_allelicfreq,
     t.ensg,
     t.transcriptname
    FROM cellline.mutation m,
     public.transcript t
   WHERE (t.enst = m.enst);


 ALTER TABLE cellline.alltranscriptmutation OWNER TO postgres;






 CREATE TABLE cellline.alternative_celllinename (
     celllinename text NOT NULL,
     alternative_celllinename text NOT NULL,
     source text NOT NULL
 );


 ALTER TABLE cellline.alternative_celllinename OWNER TO postgres;






 CREATE TABLE cellline.analyzedexon (
     ense text NOT NULL,
     dnaseqrunid integer NOT NULL
 );


 ALTER TABLE cellline.analyzedexon OWNER TO postgres;






 CREATE TABLE public.exon (
     ense text NOT NULL,
     chromosome text,
     seqstart integer,
     seqend integer
 );


 ALTER TABLE public.exon OWNER TO postgres;






 CREATE TABLE public.gene (
     ensg text NOT NULL,
     symbol text,
     name text,
     chromosome text,
     strand smallint,
     seqregionstart integer,
     seqregionend integer,
     biotype text,
     cosmic_id_gene integer,
     gc_content real,
     species text NOT NULL,
     tdpid integer NOT NULL
 );


 ALTER TABLE public.gene OWNER TO postgres;






 CREATE TABLE public.transcript2exon (
     enst text NOT NULL,
     ense text NOT NULL,
     exon smallint,
     transstart integer,
     transend integer
 );


 ALTER TABLE public.transcript2exon OWNER TO postgres;






 CREATE VIEW public.gene2transcript2exon AS
  SELECT g.ensg,
     g.symbol,
     g.name,
     g.chromosome,
     g.strand,
     g.seqregionstart,
     g.seqregionend,
     g.biotype,
     g.cosmic_id_gene,
     g.gc_content,
     g.species,
     g.tdpid,
     t.enst,
     t.transcriptname,
     t.seqstart AS transcript_seqstart,
     t.seqend AS transcript_seqend,
     t.iscanonical,
     t.cosmic_id_transcript,
     e.ense,
     t2e.exon,
     e.seqstart AS exon_seqstart,
     e.seqend AS exon_seqend
    FROM (((public.gene g
      JOIN public.transcript t ON ((t.ensg = g.ensg)))
      JOIN public.transcript2exon t2e ON ((t2e.enst = t.enst)))
      JOIN public.exon e ON ((e.ense = t2e.ense)));


 ALTER TABLE public.gene2transcript2exon OWNER TO postgres;






 CREATE VIEW cellline.analysis AS
  SELECT DISTINCT g2t2e.ensg,
     ae.dnaseqrunid
    FROM (cellline.analyzedexon ae
      JOIN public.gene2transcript2exon g2t2e ON ((g2t2e.ense = ae.ense)));


 ALTER TABLE cellline.analysis OWNER TO postgres;






 CREATE TABLE cellline.cellline (
     celllinename text NOT NULL,
     species text NOT NULL,
     organ text,
     tissue_subtype text,
     metastatic_site text,
     histology_type text,
     histology_subtype text,
     morphology text,
     tumortype text,
     growth_type text,
     gender text,
     ploidy text,
     age_at_surgery text,
     stage text,
     grade text,
     atcc_no text,
     dsmz_no text,
     ecacc_no text,
     jcrb_no text,
     iclc_no text,
     riken_no text,
     kclb_no text,
     cosmicid integer,
     pubmed integer,
     cellosaurus text,
     depmap text,
     cell_model_passport text,
     ccle text,
     comment text,
     public boolean,
     tdpid integer NOT NULL
 );


 ALTER TABLE cellline.cellline OWNER TO postgres;






 CREATE TABLE cellline.hlatype (
     rnaseqrunid text NOT NULL,
     hla_class text NOT NULL,
     allele1 text,
     allele2 text
 );


 ALTER TABLE cellline.hlatype OWNER TO postgres;






 CREATE TABLE cellline.rnaseqrun (
     rnaseqrunid text NOT NULL,
     celllinename text,
     ngsprotocolid integer,
     rnaseqgroupid integer,
     laboratory text,
     cellbatchid integer,
     directory text,
     isxenograft boolean,
     publish boolean,
     comment text,
     canonical boolean,
     sourceid text
 );


 ALTER TABLE cellline.rnaseqrun OWNER TO postgres;






 CREATE VIEW cellline.hla_a_type AS
  SELECT c.celllinename,
     n.rnaseqrunid,
     h.allele1 AS hla_a_allele1,
     h.allele2 AS hla_a_allele2
    FROM ((cellline.cellline c
      JOIN cellline.rnaseqrun n ON (((c.celllinename = n.celllinename) AND n.canonical)))
      JOIN cellline.hlatype h ON (((n.rnaseqrunid = h.rnaseqrunid) AND (h.hla_class = 'A'::text))));


 ALTER TABLE cellline.hla_a_type OWNER TO postgres;






 CREATE TABLE cellline.processedcopynumber (
     celllinename text NOT NULL,
     ensg text NOT NULL,
     log2relativecopynumber real,
     log2relativecopynumberdev real,
     copynumbergainintron boolean,
     copynumberlossintron boolean,
     copynumbergainexon boolean,
     copynumberlossexon boolean,
     gap boolean,
     jump boolean,
     exonicchange boolean,
     intronicchange boolean,
     cosmicdeletion text,
     cosmiczygosity real,
     csdeletion text,
     cszygosity real,
     ngsdeletion text,
     ngszygosity real,
     snpchipalteration text,
     snpchipzygosity real,
     numsources smallint,
     totalabscopynumber real,
     totalabscopynumberdev real,
     minorabscopynumber real,
     minorabscopynumberdev real,
     lossofheterozygosity boolean
 );


 ALTER TABLE cellline.processedcopynumber OWNER TO postgres;






 CREATE TABLE cellline.processedfusiongene (
     processedfusion integer NOT NULL,
     celllinename text NOT NULL,
     ensg1 text NOT NULL,
     ensg2 text NOT NULL,
     countsofcommonmappingreads integer,
     spanningpairs integer,
     spanninguniquereads integer,
     longestanchorfound integer,
     fusionfindingmethod text,
     chrgene1 text,
     chrgene2 text,
     nuclgene1 integer,
     nuclgene2 integer,
     strandgene1 character(1),
     strandgene2 character(1),
     rnaseqrunid text,
     predictedeffect text
 );


 ALTER TABLE cellline.processedfusiongene OWNER TO postgres;






 CREATE TABLE cellline.processedsequence (
     celllinename text NOT NULL,
     enst text NOT NULL,
     bicsdnamutation text,
     bicsaamutation text,
     bicsdnazygosity real,
     bicsrnazygosity real,
     biexondnamutation text,
     biexonaamutation text,
     biexondnazygosity real,
     biexonrnazygosity real,
     biwxsdnamutation text,
     biwxsaamutation text,
     biwxsdnazygosity real,
     biwxsrnazygosity real,
     biwgsdnamutation text,
     biwgsaamutation text,
     biwgsdnazygosity real,
     biwgsrnazygosity real,
     biwgsnoncodingdnamutation text,
     biwgsnoncodingdnazygosity real,
     cosmiccsdnamutation text,
     cosmiccsaamutation text,
     cosmiccsdnazygosity real,
     cosmiccsrnazygosity real,
     cosmicwxsdnamutation text,
     cosmicwxsaamutation text,
     cosmicwxsdnazygosity real,
     cosmicwxsrnazygosity real,
     cclewxsdnamutation text,
     cclewxsaamutation text,
     cclewxsdnazygosity real,
     cclewxsrnazygosity real,
     dnamutation text,
     dnamutation_truncated text,
     aamutation text,
     aamutation_truncated text,
     dnazygosity real,
     rnazygosity real,
     exonscomplete real,
     confirmeddetail boolean,
     numsources smallint
 );


 ALTER TABLE cellline.processedsequence OWNER TO postgres;






 CREATE VIEW cellline.availabledata AS
  SELECT cl.celllinename,
     (EXISTS ( SELECT processedsequence.enst
            FROM cellline.processedsequence
           WHERE (processedsequence.celllinename = cl.celllinename))) AS dnaseqexists,
     (EXISTS ( SELECT processedcopynumber.ensg
            FROM cellline.processedcopynumber
           WHERE (processedcopynumber.celllinename = cl.celllinename))) AS copynumberexists,
     (EXISTS ( SELECT rnaseqrun.rnaseqrunid
            FROM cellline.rnaseqrun
           WHERE ((rnaseqrun.celllinename = cl.celllinename) AND rnaseqrun.canonical))) AS rnaseqexists,
     (EXISTS ( SELECT processedfusiongene.ensg1
            FROM cellline.processedfusiongene
           WHERE (processedfusiongene.celllinename = cl.celllinename))) AS fusiongeneexists,
     (EXISTS ( SELECT hla_a_type.rnaseqrunid
            FROM cellline.hla_a_type
           WHERE (hla_a_type.celllinename = cl.celllinename))) AS hlatypeexists,
     cl.tumortype
    FROM cellline.cellline cl;


 ALTER TABLE cellline.availabledata OWNER TO postgres;






 CREATE TABLE cellline.campaign (
     campaign text NOT NULL,
     campaigndesc text,
     directory text
 );


 ALTER TABLE cellline.campaign OWNER TO postgres;






 CREATE VIEW cellline.canonicalmutation AS
  SELECT m.dnaseqrunid,
     m.chromosome,
     m.startpos,
     m.enst,
     m.mutationeffect,
     m.assembly,
     m.genomicregion,
     m.exon,
     m.cdnamutation,
     m.proteinmutation,
     m.snp,
     m.snpsource,
     m.dbsnpid,
     m.dnazygosity,
     m.dnacoverage,
     m.rnazygosity,
     m.rnacoverage,
     m.qualityscore,
     m.siftscore,
     m.onekg_allelicfreq,
     m.gnomad_allelicfreq,
     t.ensg,
     t.transcriptname
    FROM cellline.mutation m,
     public.transcript t
   WHERE ((t.enst = m.enst) AND t.iscanonical);


 ALTER TABLE cellline.canonicalmutation OWNER TO postgres;






 CREATE SEQUENCE cellline.cellline_tdpid_seq
     AS integer
     START WITH 1
     INCREMENT BY 1
     NO MINVALUE
     NO MAXVALUE
     CACHE 1;


 ALTER TABLE cellline.cellline_tdpid_seq OWNER TO postgres;







 ALTER SEQUENCE cellline.cellline_tdpid_seq OWNED BY cellline.cellline.tdpid;







 CREATE TABLE cellline.celllineassignment (
     celllinename text NOT NULL,
     celllinepanel text NOT NULL
 );


 ALTER TABLE cellline.celllineassignment OWNER TO postgres;






 CREATE VIEW cellline.processedsequenceview AS
  SELECT g.symbol,
     t.ensg,
     ps.celllinename,
     ps.enst,
     ps.bicsdnamutation,
     ps.bicsaamutation,
     ps.bicsdnazygosity,
     ps.bicsrnazygosity,
     ps.biexondnamutation,
     ps.biexonaamutation,
     ps.biexondnazygosity,
     ps.biexonrnazygosity,
     ps.biwxsdnamutation,
     ps.biwxsaamutation,
     ps.biwxsdnazygosity,
     ps.biwxsrnazygosity,
     ps.biwgsdnamutation,
     ps.biwgsaamutation,
     ps.biwgsdnazygosity,
     ps.biwgsrnazygosity,
     ps.biwgsnoncodingdnamutation,
     ps.biwgsnoncodingdnazygosity,
     ps.cosmiccsdnamutation,
     ps.cosmiccsaamutation,
     ps.cosmiccsdnazygosity,
     ps.cosmiccsrnazygosity,
     ps.cosmicwxsdnamutation,
     ps.cosmicwxsaamutation,
     ps.cosmicwxsdnazygosity,
     ps.cosmicwxsrnazygosity,
     ps.cclewxsdnamutation,
     ps.cclewxsaamutation,
     ps.cclewxsdnazygosity,
     ps.cclewxsrnazygosity,
     ps.dnamutation,
     ps.dnamutation_truncated,
     ps.aamutation,
     ps.aamutation_truncated,
     ps.dnazygosity,
     ps.rnazygosity,
     ps.exonscomplete,
     ps.confirmeddetail,
     ps.numsources
    FROM ((cellline.processedsequence ps
      JOIN public.transcript t ON ((t.enst = ps.enst)))
      JOIN public.gene g ON ((g.ensg = t.ensg)));


 ALTER TABLE cellline.processedsequenceview OWNER TO postgres;






 CREATE VIEW cellline.celllinemutcn AS
  SELECT gcl.ensg,
     gcl.symbol,
     gcl.celllinename,
     psv.enst,
     psv.dnamutation,
     psv.aamutation,
     psv.dnazygosity,
     psv.exonscomplete,
     psv.confirmeddetail,
     psv.numsources AS processedsequencenumsources,
     pcn.log2relativecopynumber,
     pcn.log2relativecopynumberdev,
     pcn.copynumbergainintron,
     pcn.copynumberlossintron,
     pcn.copynumbergainexon,
     pcn.copynumberlossexon,
     pcn.gap,
     pcn.jump,
     pcn.exonicchange,
     pcn.intronicchange,
     pcn.numsources AS processedcopynumbernumsources,
     pcn.totalabscopynumber,
     pcn.totalabscopynumberdev,
     pcn.minorabscopynumber,
     pcn.minorabscopynumberdev,
     pcn.lossofheterozygosity
    FROM ((( SELECT g.ensg,
             g.symbol,
             cl.celllinename
            FROM public.gene g,
             cellline.cellline cl) gcl
      LEFT JOIN cellline.processedsequenceview psv ON (((gcl.ensg = psv.ensg) AND (gcl.celllinename = psv.celllinename))))
      LEFT JOIN cellline.processedcopynumber pcn ON (((gcl.ensg = pcn.ensg) AND (gcl.celllinename = pcn.celllinename))));


 ALTER TABLE cellline.celllinemutcn OWNER TO postgres;






 CREATE TABLE cellline.celllinepanel (
     celllinepanel text NOT NULL,
     celllinepaneldescription text,
     species text
 );


 ALTER TABLE cellline.celllinepanel OWNER TO postgres;






 CREATE TABLE cellline.copynumberregion (
     hybridizationid text NOT NULL,
     algorithm text NOT NULL,
     chromosome smallint NOT NULL,
     start integer NOT NULL,
     stop integer NOT NULL,
     log2relativecopynumber real,
     snpcount integer,
     call text,
     totalabscopynumber real,
     minorabscopynumber real,
     confidence real
 );


 ALTER TABLE cellline.copynumberregion OWNER TO postgres;






 CREATE TABLE cellline.copynumberregionngs (
     rnaseqrunid text NOT NULL,
     algorithm text NOT NULL,
     chromosome smallint NOT NULL,
     start integer NOT NULL,
     stop integer NOT NULL,
     log2relativecopynumber real,
     call text,
     totalabscopynumber real,
     minorabscopynumber real,
     confidence real
 );


 ALTER TABLE cellline.copynumberregionngs OWNER TO postgres;






 CREATE TABLE cellline.curveanalysis (
     plateid integer NOT NULL,
     well text NOT NULL,
     doseresponsecurve integer NOT NULL
 );


 ALTER TABLE cellline.curveanalysis OWNER TO postgres;






 CREATE TABLE cellline.depletionscreen (
     depletionscreen text NOT NULL,
     depletionscreendescription text
 );


 ALTER TABLE cellline.depletionscreen OWNER TO postgres;






 CREATE TABLE cellline.dnaseqfileassociation (
     celllinename text NOT NULL,
     vcf_file text NOT NULL,
     description text
 );


 ALTER TABLE cellline.dnaseqfileassociation OWNER TO postgres;






 CREATE TABLE cellline.dnaseqrun (
     dnaseqrunid integer NOT NULL,
     celllinename text NOT NULL,
     cellbatchid integer,
     pubmedid integer,
     comment text,
     vcf_fileid text,
     analysissource text,
     publish boolean NOT NULL
 );


 ALTER TABLE cellline.dnaseqrun OWNER TO postgres;






 CREATE SEQUENCE cellline.dnaseqrunsequence
     START WITH 1
     INCREMENT BY 1
     NO MINVALUE
     NO MAXVALUE
     CACHE 1;


 ALTER TABLE cellline.dnaseqrunsequence OWNER TO postgres;






 CREATE TABLE cellline.doseresponsecurve (
     doseresponsecurve integer NOT NULL,
     ec50 real,
     ec50calc real,
     ec50operator character(1),
     top real,
     bottom real,
     slope real,
     ic50 real,
     ic50calc real,
     ic50operator character(1),
     gi50 real,
     gi50calc real,
     gi50operator character(1),
     tgi real,
     tgicalc real,
     tgioperator character(1),
     tzero real,
     tzerosd real,
     zero real,
     negcontrol real,
     negcontrolsd real,
     amax real,
     actarea real,
     imagepath text,
     classification text,
     drcclass text,
     wrongconcrange boolean,
     flatcurve boolean,
     calcimpossible boolean,
     biphasiccurve boolean,
     inactive boolean,
     valid boolean,
     recalculate boolean,
     locked boolean,
     deviation real,
     qualityscore real,
     fixedtop boolean,
     fixedbottom boolean,
     fixedslope boolean,
     fixedec50 boolean,
     comment text,
     celllinename text,
     drugid text,
     sampleid integer,
     cellsperwell integer,
     timepoint text,
     pretreatment text,
     campaign text,
     round smallint,
     proliferationtest text,
     laboratory text
 );


 ALTER TABLE cellline.doseresponsecurve OWNER TO postgres;






 CREATE SEQUENCE cellline.doseresponsecurvesequence
     START WITH 1
     INCREMENT BY 1
     NO MINVALUE
     NO MAXVALUE
     CACHE 1;


 ALTER TABLE cellline.doseresponsecurvesequence OWNER TO postgres;






 CREATE TABLE cellline.doseresponsematrix (
     doseresponsematrix integer NOT NULL,
     maxcgiblissexcess real,
     mincgiblissexcess real,
     maxpocblissexcess real,
     minpocblissexcess real,
     mincgihsaexcess real,
     maxcgihsaexcess real,
     minpochsaexcess real,
     maxpochsaexcess real,
     min3cgiblissexcess real,
     max3cgiblissexcess real,
     imagepath text,
     tzero real,
     tzerosd real,
     zero real,
     negcontrol real,
     negcontrolsd real,
     valid boolean,
     recalculate boolean,
     locked boolean,
     celllinename text,
     drugid text,
     sampleid integer,
     drugid2 text,
     sampleid2 integer,
     cellsperwell integer,
     treatmenttime text,
     treatmenttime2 text,
     timepoint text,
     pretreatment text,
     campaign text,
     round smallint,
     proliferationtest text,
     laboratory text
 );


 ALTER TABLE cellline.doseresponsematrix OWNER TO postgres;






 CREATE SEQUENCE cellline.doseresponsematrixsequence
     START WITH 1
     INCREMENT BY 1
     NO MINVALUE
     NO MAXVALUE
     CACHE 1;


 ALTER TABLE cellline.doseresponsematrixsequence OWNER TO postgres;






 CREATE TABLE cellline.processedrnaseq (
     rnaseqrunid text NOT NULL,
     ensg text NOT NULL,
     log2fpkm real,
     log2tpm real,
     log2cpm real,
     counts integer,
     status character(1)
 );


 ALTER TABLE cellline.processedrnaseq OWNER TO postgres;






 CREATE MATERIALIZED VIEW cellline.expressed_ensg AS
  SELECT processedrnaseq.ensg
    FROM cellline.processedrnaseq
   GROUP BY processedrnaseq.ensg
  HAVING (max(processedrnaseq.counts) >= 20)
   WITH NO DATA;


 ALTER TABLE cellline.expressed_ensg OWNER TO postgres;






 CREATE TABLE cellline.fusiondescription (
     processedfusion integer NOT NULL,
     fusiontype text NOT NULL
 );


 ALTER TABLE cellline.fusiondescription OWNER TO postgres;






 CREATE TABLE cellline.geneexpressionset (
     geneexpressionset text NOT NULL,
     prettyname text,
     rdatafile text,
     htmldescription text
 );


 ALTER TABLE cellline.geneexpressionset OWNER TO postgres;






 CREATE TABLE cellline.hybridization (
     hybridizationid text NOT NULL,
     chipname text,
     celllinename text,
     hybridizationgroupid integer,
     laboratory text,
     hybridizationok boolean,
     snpcall real,
     picnicploidy real,
     cellbatchid integer,
     cosmicid integer,
     mocha integer,
     analysisdirectory text,
     comment text,
     publish boolean,
     isxenograft boolean,
     compound text,
     sample integer,
     rawcopyintensity real,
     rawcopymapd real,
     rawcopywaviness real,
     rawcopysnpd real,
     rawcopysnpskew real,
     rawcopychrx real,
     rawcopychry real,
     rawcopychrm real,
     rawcopynumcin integer,
     rawcopystrcin integer,
     cel_file text
 );


 ALTER TABLE cellline.hybridization OWNER TO postgres;






 CREATE TABLE cellline.hybridizationgroup (
     hybridizationgroupid integer NOT NULL,
     hybridizationgroupname text,
     rdatafilepath text
 );


 ALTER TABLE cellline.hybridizationgroup OWNER TO postgres;






 CREATE TABLE public.chiptechnology (
     chipname text NOT NULL,
     chiptype text,
     enzyme text
 );


 ALTER TABLE public.chiptechnology OWNER TO postgres;






 CREATE VIEW cellline.hybrid AS
  SELECT h.hybridizationid,
     h.chipname,
     ct.chiptype,
     h.celllinename,
     c.organ,
     c.tumortype,
     c.histology_type,
     c.histology_subtype,
     c.morphology,
     c.growth_type,
     h.laboratory,
     hg.hybridizationgroupname,
     h.cellbatchid,
     h.analysisdirectory AS directory,
     h.isxenograft,
     h.compound,
     h.comment
    FROM (((cellline.hybridization h
      JOIN cellline.hybridizationgroup hg ON ((hg.hybridizationgroupid = h.hybridizationgroupid)))
      JOIN cellline.cellline c ON ((h.celllinename = c.celllinename)))
      JOIN public.chiptechnology ct ON ((ct.chipname = h.chipname)))
   WHERE (h.publish = true);


 ALTER TABLE cellline.hybrid OWNER TO postgres;






 CREATE TABLE cellline.matrixanalysis (
     plateid integer NOT NULL,
     well text NOT NULL,
     doseresponsematrix integer NOT NULL
 );


 ALTER TABLE cellline.matrixanalysis OWNER TO postgres;






 CREATE TABLE cellline.measuredvalue (
     plateid integer NOT NULL,
     well text NOT NULL,
     celllinename text,
     cellbatchid integer,
     cellsperwell integer,
     category text,
     drugid text,
     sampleid integer,
     concentration real,
     drugid2 text,
     sampleid2 integer,
     concentration2 real,
     pretreatment text,
     signal real,
     valid boolean
 );


 ALTER TABLE cellline.measuredvalue OWNER TO postgres;






 CREATE TABLE cellline.metabolite (
     metabolite text NOT NULL
 );


 ALTER TABLE cellline.metabolite OWNER TO postgres;






 CREATE TABLE cellline.microsatelliteinstability (
     dnaseqrunid integer NOT NULL,
     microsatellite_stability_score real,
     microsatellite_stability_class text,
     total_number_of_sites integer
 );


 ALTER TABLE cellline.microsatelliteinstability OWNER TO postgres;






 CREATE VIEW cellline.microsatelliteinstabilityview AS
  SELECT a.dnaseqrunid,
     a.microsatellite_stability_score,
     a.microsatellite_stability_class,
     a.celllinename
    FROM ( SELECT ms.dnaseqrunid,
             ms.microsatellite_stability_score,
             ms.microsatellite_stability_class,
             r.celllinename,
             row_number() OVER (PARTITION BY r.celllinename ORDER BY ms.total_number_of_sites DESC) AS row_id
            FROM (cellline.microsatelliteinstability ms
              JOIN cellline.dnaseqrun r ON ((r.dnaseqrunid = ms.dnaseqrunid)))
           WHERE r.publish) a
   WHERE (a.row_id = 1);


 ALTER TABLE cellline.microsatelliteinstabilityview OWNER TO postgres;






 CREATE TABLE cellline.mutational_signature (
     mutational_signature text NOT NULL,
     mutational_signature_desc text
 );


 ALTER TABLE cellline.mutational_signature OWNER TO postgres;






 CREATE TABLE cellline.mutational_signature_profile (
     celllinename text NOT NULL,
     mutational_signature text NOT NULL,
     freq_estimation smallint,
     activity real
 );


 ALTER TABLE cellline.mutational_signature_profile OWNER TO postgres;






 CREATE MATERIALIZED VIEW cellline.mutationalburden AS
  SELECT psv.celllinename,
     cl.species,
     cl.tumortype,
     ((sum(((psv.aamutation <> 'wt'::text))::integer))::double precision / (count(*))::real) AS mutational_fraction
    FROM (cellline.processedsequenceview psv
      JOIN cellline.cellline cl ON ((cl.celllinename = psv.celllinename)))
   GROUP BY psv.celllinename, cl.species, cl.tumortype
  HAVING (count(*) > 10000)
   WITH NO DATA;


 ALTER TABLE cellline.mutationalburden OWNER TO postgres;


REFRESH MATERIALIZED VIEW cellline.mutationalburden;



 CREATE VIEW cellline.other_celllinename AS
  SELECT alternative_celllinename.celllinename,
     alternative_celllinename.alternative_celllinename AS other_celllinename
    FROM cellline.alternative_celllinename
 UNION
  SELECT cellline.celllinename,
     cellline.ccle AS other_celllinename
    FROM cellline.cellline
   WHERE (cellline.ccle IS NOT NULL)
 UNION
  SELECT cellline.celllinename,
     cellline.depmap AS other_celllinename
    FROM cellline.cellline
   WHERE (cellline.depmap IS NOT NULL)
 UNION
  SELECT cellline.celllinename,
     cellline.cell_model_passport AS other_celllinename
    FROM cellline.cellline
   WHERE (cellline.cell_model_passport IS NOT NULL)
 UNION
  SELECT cellline.celllinename,
     cellline.cellosaurus AS other_celllinename
    FROM cellline.cellline
   WHERE (cellline.cellosaurus IS NOT NULL);


 ALTER TABLE cellline.other_celllinename OWNER TO postgres;






 CREATE TABLE cellline.plate (
     plateid integer NOT NULL,
     proliferationtest text NOT NULL,
     laboratory text,
     campaign text,
     treatmenttime text,
     treatmenttime2 text,
     timepoint text,
     datafile text,
     plateindatafile smallint,
     round smallint
 );


 ALTER TABLE cellline.plate OWNER TO postgres;






 CREATE SEQUENCE cellline.plateidsequence
     START WITH 1
     INCREMENT BY 1
     NO MINVALUE
     NO MAXVALUE
     CACHE 1;


 ALTER TABLE cellline.plateidsequence OWNER TO postgres;






 CREATE VIEW cellline.processedcopynumberview AS
  SELECT g.symbol,
     pcn.celllinename,
     pcn.ensg,
     pcn.log2relativecopynumber,
     pcn.log2relativecopynumberdev,
     pcn.copynumbergainintron,
     pcn.copynumberlossintron,
     pcn.copynumbergainexon,
     pcn.copynumberlossexon,
     pcn.gap,
     pcn.jump,
     pcn.exonicchange,
     pcn.intronicchange,
     pcn.cosmicdeletion,
     pcn.cosmiczygosity,
     pcn.csdeletion,
     pcn.cszygosity,
     pcn.ngsdeletion,
     pcn.ngszygosity,
     pcn.snpchipalteration,
     pcn.snpchipzygosity,
     pcn.numsources,
     pcn.totalabscopynumber,
     pcn.totalabscopynumberdev,
     pcn.minorabscopynumber,
     pcn.minorabscopynumberdev,
     pcn.lossofheterozygosity
    FROM (cellline.processedcopynumber pcn
      JOIN public.gene g ON ((g.ensg = pcn.ensg)));


 ALTER TABLE cellline.processedcopynumberview OWNER TO postgres;






 CREATE TABLE cellline.processeddepletionscore (
     ensg text NOT NULL,
     celllinename text NOT NULL,
     depletionscreen text NOT NULL,
     rsa real,
     ataris real,
     ceres real,
     escore real,
     dep_prob real
 );


 ALTER TABLE cellline.processeddepletionscore OWNER TO postgres;






 CREATE VIEW cellline.processeddepletionscoreview AS
  SELECT d.ensg,
     g.symbol,
     d.celllinename,
     d.depletionscreen,
     d.rsa,
     d.ataris,
     d.ceres,
     d.escore
    FROM (cellline.processeddepletionscore d
      JOIN public.gene g ON ((d.ensg = g.ensg)));


 ALTER TABLE cellline.processeddepletionscoreview OWNER TO postgres;






 CREATE VIEW cellline.processedfusiongeneview AS
  SELECT pfg.processedfusion,
     pfg.celllinename,
     pfg.ensg1,
     pfg.ensg2,
     g1.symbol AS symbol1,
     g2.symbol AS symbol2,
     pfg.countsofcommonmappingreads,
     pfg.spanningpairs,
     pfg.spanninguniquereads,
     pfg.longestanchorfound,
     pfg.fusionfindingmethod,
     pfg.chrgene1,
     pfg.chrgene2,
     pfg.nuclgene1,
     pfg.nuclgene2,
     pfg.strandgene1,
     pfg.strandgene2,
     pfg.rnaseqrunid,
     pfg.predictedeffect
    FROM ((cellline.processedfusiongene pfg
      JOIN public.gene g1 ON ((pfg.ensg1 = g1.ensg)))
      JOIN public.gene g2 ON ((pfg.ensg2 = g2.ensg)));


 ALTER TABLE cellline.processedfusiongeneview OWNER TO postgres;






 CREATE SEQUENCE cellline.processedfusionsequence
     START WITH 1
     INCREMENT BY 1
     NO MINVALUE
     NO MAXVALUE
     CACHE 1;


 ALTER TABLE cellline.processedfusionsequence OWNER TO postgres;






 CREATE TABLE cellline.processedmetabolite (
     metabolite text,
     celllinename text,
     score real
 );


 ALTER TABLE cellline.processedmetabolite OWNER TO postgres;






 CREATE TABLE cellline.processedproteinexpression (
     celllinename text NOT NULL,
     antibody text NOT NULL,
     score real
 );


 ALTER TABLE cellline.processedproteinexpression OWNER TO postgres;






 CREATE TABLE cellline.processedproteinmassspec (
     uniprotid text NOT NULL,
     accession text NOT NULL,
     isoform smallint NOT NULL,
     celllinename text NOT NULL,
     score real NOT NULL
 );


 ALTER TABLE cellline.processedproteinmassspec OWNER TO postgres;






 CREATE TABLE cellline.processedrnaseqtranscript (
     rnaseqrunid text NOT NULL,
     enst text NOT NULL,
     log2fpkm real,
     log2tpm real,
     counts integer,
     status character(1)
 );


 ALTER TABLE cellline.processedrnaseqtranscript OWNER TO postgres;






 CREATE VIEW cellline.processedrnaseqtranscriptview AS
  SELECT prs.rnaseqrunid,
     nr.celllinename,
     prs.enst,
     prs.log2fpkm,
     prs.log2tpm,
     prs.counts,
     prs.status
    FROM (cellline.processedrnaseqtranscript prs
      JOIN cellline.rnaseqrun nr ON ((nr.rnaseqrunid = prs.rnaseqrunid)))
   WHERE nr.canonical;


 ALTER TABLE cellline.processedrnaseqtranscriptview OWNER TO postgres;






 CREATE TABLE cellline.rnaseqgroup (
     rnaseqgroupid integer NOT NULL,
     rnaseqname text,
     rdatafilepath text,
     processingpipeline text
 );


 ALTER TABLE cellline.rnaseqgroup OWNER TO postgres;






 CREATE VIEW cellline.processedrnaseqview AS
  SELECT prs.rnaseqrunid,
     nr.celllinename,
     prs.ensg,
     prs.log2fpkm,
     prs.log2tpm,
     prs.log2cpm,
     prs.counts,
     prs.status
    FROM ((cellline.processedrnaseq prs
      JOIN cellline.rnaseqrun nr ON ((nr.rnaseqrunid = prs.rnaseqrunid)))
      JOIN cellline.rnaseqgroup ng ON ((nr.rnaseqgroupid = ng.rnaseqgroupid)))
   WHERE (nr.canonical AND ((ng.rnaseqname ~~ 'untreated %cellline reference set%'::text) AND (ng.processingpipeline ~~ 'RNA-seq%'::text)));


 ALTER TABLE cellline.processedrnaseqview OWNER TO postgres;






 CREATE TABLE cellline.proliferationtest (
     proliferationtest text NOT NULL,
     proliferationtestname text,
     method text
 );


 ALTER TABLE cellline.proliferationtest OWNER TO postgres;






 CREATE TABLE cellline.referringtzeroplate (
     tzeroplateid integer NOT NULL,
     plateid integer NOT NULL
 );


 ALTER TABLE cellline.referringtzeroplate OWNER TO postgres;






 CREATE TABLE public.drug (
     drugid text NOT NULL,
     target text,
     commonname text,
     scientificname text
 );


 ALTER TABLE public.drug OWNER TO postgres;






 CREATE VIEW cellline.results AS
  SELECT drc.doseresponsecurve,
     drc.ec50,
     drc.ec50calc,
     drc.ec50operator,
     drc.top,
     drc.bottom,
     drc.slope,
     drc.gi50,
     drc.gi50calc,
     drc.gi50operator,
     drc.ic50,
     drc.ic50calc,
     drc.ic50operator,
     drc.tgi,
     drc.tgicalc,
     drc.tgioperator,
     drc.tzero,
     drc.tzerosd,
     drc.negcontrolsd,
     drc.amax,
     drc.actarea,
     drc.classification,
     drc.round,
     drc.deviation,
     drc.celllinename,
     cl.organ,
     cl.tissue_subtype,
     cl.tumortype,
     cl.metastatic_site,
     cl.histology_type,
     cl.histology_subtype,
     cl.morphology,
     cl.growth_type,
     cl.gender,
     drc.cellsperwell,
     drc.timepoint,
     drc.drugid,
     d.target,
     drc.sampleid,
     drc.pretreatment,
     drc.laboratory,
     drc.proliferationtest,
     drc.campaign,
     drc.imagepath,
     drc.calcimpossible,
     drc.biphasiccurve,
     drc.flatcurve,
     drc.wrongconcrange,
     drc.inactive,
     drc.valid,
     drc.recalculate,
     drc.locked,
     drc.fixedtop,
     drc.fixedbottom,
     drc.fixedslope,
     drc.fixedec50
    FROM ((cellline.doseresponsecurve drc
      JOIN cellline.cellline cl ON ((cl.celllinename = drc.celllinename)))
      JOIN public.drug d ON ((d.drugid = drc.drugid)));


 ALTER TABLE cellline.results OWNER TO postgres;






 CREATE VIEW cellline.resultscombi AS
  SELECT DISTINCT drm.doseresponsematrix,
     drm.maxcgiblissexcess,
     drm.mincgiblissexcess,
     drm.maxpocblissexcess,
     drm.minpocblissexcess,
     drm.mincgihsaexcess,
     drm.maxcgihsaexcess,
     drm.minpochsaexcess,
     drm.maxpochsaexcess,
     (drm.min3cgiblissexcess + drm.max3cgiblissexcess) AS combo6,
     drm.tzero,
     drm.tzerosd,
     drm.negcontrolsd,
     drm.round,
     cl.celllinename,
     cl.organ,
     cl.tissue_subtype,
     cl.tumortype,
     cl.metastatic_site,
     cl.histology_type,
     cl.histology_subtype,
     cl.morphology,
     cl.growth_type,
     cl.gender,
     drm.cellsperwell,
     drm.timepoint,
     drm.drugid,
     d1.target,
     drm.sampleid,
     drm.treatmenttime,
     drm.drugid2,
     d2.target AS target2,
     drm.sampleid2,
     drm.treatmenttime2,
     drm.pretreatment,
     drm.laboratory,
     drm.proliferationtest,
     drm.campaign,
     drm.imagepath,
     drm.valid,
     drm.recalculate,
     drm.locked
    FROM (((cellline.doseresponsematrix drm
      JOIN cellline.cellline cl ON ((cl.celllinename = drm.celllinename)))
      JOIN public.drug d1 ON ((d1.drugid = drm.drugid)))
      JOIN public.drug d2 ON ((d2.drugid = drm.drugid2)));


 ALTER TABLE cellline.resultscombi OWNER TO postgres;






 CREATE TABLE cellline.samplepreparationinngsrun (
     samplepreparationid text NOT NULL,
     flowcellid text NOT NULL,
     flowcelllane smallint NOT NULL,
     dnaseqrunid integer NOT NULL,
     finalsequencinglibrary text,
     baitdesign text
 );


 ALTER TABLE cellline.samplepreparationinngsrun OWNER TO postgres;






 CREATE TABLE cellline.sampleset (
     sampleset text NOT NULL,
     samplesetname text
 );


 ALTER TABLE cellline.sampleset OWNER TO postgres;






 CREATE TABLE cellline.samplesetassignment (
     rnaseqrunid text NOT NULL,
     sampleset text NOT NULL
 );


 ALTER TABLE cellline.samplesetassignment OWNER TO postgres;






 CREATE TABLE cellline.samplesetgroup (
     samplesetgroup text NOT NULL,
     geneexpressionset text,
     "ORDER" smallint NOT NULL
 );


 ALTER TABLE cellline.samplesetgroup OWNER TO postgres;






 CREATE TABLE cellline.samplesetgroupassignment (
     samplesetgroup text NOT NULL,
     sampleset text NOT NULL,
     color text,
     "ORDER" smallint,
     background smallint
 );


 ALTER TABLE cellline.samplesetgroupassignment OWNER TO postgres;






 CREATE VIEW cellline.sequencingresults AS
  SELECT ar.celllinename,
     ar.cellbatchid,
     c.cosmicid,
     ar.analysissource,
     g.symbol,
     g.name,
     ar.dnaseqrunid,
     cm.chromosome,
     cm.startpos,
     cm.enst,
     cm.mutationeffect,
     cm.assembly,
     cm.genomicregion,
     cm.exon,
     cm.dnacoverage,
     cm.rnacoverage,
     cm.gnomad_allelicfreq,
     cm.onekg_allelicfreq,
     cm.cdnamutation,
     cm.proteinmutation,
     cm.snp,
     cm.snpsource,
     cm.dbsnpid,
     cm.dnazygosity,
     cm.qualityscore,
     cm.siftscore,
     g.ensg,
     g.biotype
    FROM ((((cellline.dnaseqrun ar
      JOIN cellline.analysis a ON ((ar.dnaseqrunid = a.dnaseqrunid)))
      JOIN public.gene g ON ((a.ensg = g.ensg)))
      JOIN cellline.cellline c ON ((c.celllinename = ar.celllinename)))
      LEFT JOIN cellline.canonicalmutation cm ON (((cm.dnaseqrunid = a.dnaseqrunid) AND (cm.ensg = a.ensg) AND (NOT cm.snp))))
   WHERE ar.publish;


 ALTER TABLE cellline.sequencingresults OWNER TO postgres;






 CREATE VIEW cellline.sequencingresultssnp AS
  SELECT ar.celllinename,
     ar.cellbatchid,
     c.cosmicid,
     ar.analysissource,
     g.symbol,
     g.name,
     ar.dnaseqrunid,
     cm.chromosome,
     cm.startpos,
     cm.enst,
     cm.mutationeffect,
     cm.assembly,
     cm.genomicregion,
     cm.exon,
     cm.dnacoverage,
     cm.rnacoverage,
     cm.gnomad_allelicfreq,
     cm.onekg_allelicfreq,
     cm.cdnamutation,
     cm.proteinmutation,
     cm.snp,
     cm.snpsource,
     cm.dbsnpid,
     cm.dnazygosity,
     cm.qualityscore,
     cm.siftscore,
     g.ensg,
     g.biotype
    FROM ((((cellline.dnaseqrun ar
      JOIN cellline.analysis a ON ((ar.dnaseqrunid = a.dnaseqrunid)))
      JOIN public.gene g ON ((a.ensg = g.ensg)))
      JOIN cellline.cellline c ON ((c.celllinename = ar.celllinename)))
      LEFT JOIN cellline.canonicalmutation cm ON (((cm.dnaseqrunid = a.dnaseqrunid) AND (cm.ensg = a.ensg))))
   WHERE ar.publish;


 ALTER TABLE cellline.sequencingresultssnp OWNER TO postgres;






 CREATE TABLE cellline.similarity (
     similarityid integer NOT NULL,
     celllinename text NOT NULL,
     similaritytype text,
     source text,
     comment text
 );


 ALTER TABLE cellline.similarity OWNER TO postgres;






 CREATE VIEW cellline.tdp_cellline AS
  SELECT cl.tdpid,
     cl.celllinename,
     cl.species,
     cl.organ,
     cl.tumortype,
     cl.gender,
     cl.metastatic_site,
     cl.histology_type,
     cl.morphology,
     cl.growth_type,
     cl.age_at_surgery,
     cl.cosmicid,
     msiv.microsatellite_stability_class,
     msiv.microsatellite_stability_score,
     hla.hla_a_allele1,
     hla.hla_a_allele2,
     mb.mutational_fraction
    FROM (((cellline.cellline cl
      LEFT JOIN cellline.microsatelliteinstabilityview msiv ON ((cl.celllinename = msiv.celllinename)))
      LEFT JOIN cellline.hla_a_type hla ON ((cl.celllinename = hla.celllinename)))
      LEFT JOIN cellline.mutationalburden mb ON ((cl.celllinename = mb.celllinename)));


 ALTER TABLE cellline.tdp_cellline OWNER TO postgres;






 CREATE VIEW cellline.tdp_copynumber AS
  SELECT processedcopynumber.ensg,
     processedcopynumber.celllinename,
     processedcopynumber.log2relativecopynumber,
     (pow((2)::double precision, (processedcopynumber.log2relativecopynumber)::double precision) * (2)::double precision) AS relativecopynumber,
         CASE
             WHEN (processedcopynumber.log2relativecopynumber > (log((2)::numeric, (3.5 / (2)::numeric)))::double precision) THEN (2)::smallint
             WHEN (processedcopynumber.log2relativecopynumber < (log((2)::numeric, (1.0 / (2)::numeric)))::double precision) THEN (- (2)::smallint)
             ELSE (0)::smallint
         END AS copynumberclass,
     processedcopynumber.totalabscopynumber
    FROM cellline.processedcopynumber;


 ALTER TABLE cellline.tdp_copynumber OWNER TO postgres;






 CREATE VIEW cellline.tdp_expression AS
  SELECT processedrnaseqview.ensg,
     processedrnaseqview.celllinename,
     processedrnaseqview.log2tpm,
     pow((2)::double precision, (processedrnaseqview.log2tpm)::double precision) AS tpm,
     processedrnaseqview.counts
    FROM cellline.processedrnaseqview;


 ALTER TABLE cellline.tdp_expression OWNER TO postgres;






 CREATE VIEW cellline.tdp_mutation AS
  SELECT t.ensg,
     ps.celllinename,
     (public.coarse(ps.dnamutation) = 'mut'::text) AS dna_mutated,
     ps.dnamutation,
     (public.coarse(ps.aamutation) = 'mut'::text) AS aa_mutated,
     ps.aamutation,
     ps.dnazygosity AS zygosity,
     ps.exonscomplete,
     ps.confirmeddetail,
     ps.numsources
    FROM (cellline.processedsequence ps
      JOIN public.transcript t ON (((t.enst = ps.enst) AND t.iscanonical)));


 ALTER TABLE cellline.tdp_mutation OWNER TO postgres;






 CREATE VIEW cellline.tdp_data AS
  SELECT omics.ensg,
     omics.celllinename,
     max(omics.copynumberclass) AS copynumberclass,
     max(omics.tpm) AS tpm,
     every(omics.dna_mutated) AS dna_mutated,
     every(omics.aa_mutated) AS aa_mutated
    FROM ( SELECT tdp_copynumber.ensg,
             tdp_copynumber.celllinename,
             tdp_copynumber.copynumberclass,
             NULL::double precision AS tpm,
             NULL::boolean AS dna_mutated,
             NULL::boolean AS aa_mutated
            FROM cellline.tdp_copynumber
         UNION ALL
          SELECT tdp_expression.ensg,
             tdp_expression.celllinename,
             NULL::smallint AS copynumberclass,
             tdp_expression.tpm,
             NULL::boolean AS dna_mutated,
             NULL::boolean AS aa_mutated
            FROM cellline.tdp_expression
         UNION ALL
          SELECT tdp_mutation.ensg,
             tdp_mutation.celllinename,
             NULL::smallint AS copynumberclass,
             NULL::double precision AS tpm,
             tdp_mutation.dna_mutated,
             tdp_mutation.aa_mutated
            FROM cellline.tdp_mutation) omics
   GROUP BY omics.ensg, omics.celllinename;


 ALTER TABLE cellline.tdp_data OWNER TO postgres;






 CREATE VIEW cellline.tdp_depletionscore AS
  SELECT processeddepletionscoreview.ensg,
     processeddepletionscoreview.symbol,
     processeddepletionscoreview.celllinename,
     processeddepletionscoreview.depletionscreen,
     processeddepletionscoreview.rsa,
     processeddepletionscoreview.ataris,
     processeddepletionscoreview.ceres
    FROM cellline.processeddepletionscoreview;


 ALTER TABLE cellline.tdp_depletionscore OWNER TO postgres;






 CREATE VIEW cellline.tdp_depletionscreen AS
  SELECT depletionscreen.depletionscreen,
     depletionscreen.depletionscreendescription
    FROM cellline.depletionscreen;


 ALTER TABLE cellline.tdp_depletionscreen OWNER TO postgres;






 CREATE VIEW cellline.tdp_panel AS
  SELECT celllinepanel.celllinepanel AS panel,
     celllinepanel.celllinepaneldescription AS paneldescription,
     celllinepanel.species
    FROM cellline.celllinepanel;


 ALTER TABLE cellline.tdp_panel OWNER TO postgres;






 CREATE VIEW cellline.tdp_panelassignment AS
  SELECT celllineassignment.celllinename,
     celllineassignment.celllinepanel AS panel
    FROM cellline.celllineassignment;


 ALTER TABLE cellline.tdp_panelassignment OWNER TO postgres;






 CREATE TABLE cellline.treatment (
     rnaseqrunid text NOT NULL,
     drugid text NOT NULL,
     treatmenttime text NOT NULL,
     concentration real,
     concentration_units text
 );


 ALTER TABLE cellline.treatment OWNER TO postgres;









 CREATE TABLE public.altensemblsymbol (
     altsymbol text NOT NULL,
     ensg text NOT NULL
 );


 ALTER TABLE public.altensemblsymbol OWNER TO postgres;






 CREATE TABLE public.altentrezgenesymbol (
     geneid integer NOT NULL,
     symbol text NOT NULL
 );


 ALTER TABLE public.altentrezgenesymbol OWNER TO postgres;






 CREATE TABLE public.antibody (
     antibody text NOT NULL,
     validation_status text NOT NULL,
     vendor text,
     catalog_number text
 );


 ALTER TABLE public.antibody OWNER TO postgres;






 CREATE VIEW public.codingexons AS
  SELECT x.ense,
     x.enst,
     x.exon,
     x.transstart,
     x.transend,
     x.chromosome,
     x.seqstart,
     x.seqend,
     x.strand,
     x.startexon,
     x.endexon,
     public.getcodinglength(x.exon, x.transstart, x.transend, x.seqstart, x.seqend, x.strand, (x.startexon)::integer, (x.endexon)::integer) AS codinglength
    FROM ( SELECT t2e.ense,
             t2e.enst,
             t2e.exon,
             t2e.transstart,
             t2e.transend,
             e.chromosome,
             e.seqstart,
             e.seqend,
             t.strand,
             ( SELECT transcript2exon.exon
                    FROM public.transcript2exon
                   WHERE ((transcript2exon.transstart IS NOT NULL) AND (transcript2exon.enst = t.enst))) AS startexon,
             ( SELECT transcript2exon.exon
                    FROM public.transcript2exon
                   WHERE ((transcript2exon.transend IS NOT NULL) AND (transcript2exon.enst = t.enst))) AS endexon
            FROM ((public.transcript2exon t2e
              JOIN public.exon e USING (ense))
              JOIN public.transcript t ON ((t.enst = t2e.enst)))) x;


 ALTER TABLE public.codingexons OWNER TO postgres;






 CREATE TABLE public.entrezgene (
     geneid integer NOT NULL,
     taxid integer,
     symbol text,
     genename text,
     chromosome text,
     localisation text,
     nuclstart bigint,
     nuclend bigint,
     strand text,
     genomeassembly text
 );


 ALTER TABLE public.entrezgene OWNER TO postgres;






 CREATE TABLE public.entrezgene2ensemblgene (
     ensg text NOT NULL,
     geneid integer NOT NULL
 );


 ALTER TABLE public.entrezgene2ensemblgene OWNER TO postgres;






 CREATE VIEW public.normchromentrezgene2ensemblgene AS
  SELECT e2e.ensg,
     e2e.geneid
    FROM ((public.entrezgene2ensemblgene e2e
      JOIN public.gene g ON ((g.ensg = e2e.ensg)))
      JOIN public.entrezgene eg ON ((eg.geneid = e2e.geneid)))
   WHERE ((length(g.chromosome) <= 2) AND (eg.localisation <> '-'::text));


 ALTER TABLE public.normchromentrezgene2ensemblgene OWNER TO postgres;






 CREATE VIEW public.distinctentrezgene2ensemblgene AS
  SELECT g.ensg,
     e.geneid
    FROM ((( SELECT normchromentrezgene2ensemblgene.ensg,
             normchromentrezgene2ensemblgene.geneid
            FROM public.normchromentrezgene2ensemblgene
           WHERE ((normchromentrezgene2ensemblgene.ensg IN ( SELECT normchromentrezgene2ensemblgene_1.ensg
                    FROM public.normchromentrezgene2ensemblgene normchromentrezgene2ensemblgene_1
                   GROUP BY normchromentrezgene2ensemblgene_1.ensg
                  HAVING (count(*) = 1))) AND (normchromentrezgene2ensemblgene.geneid IN ( SELECT normchromentrezgene2ensemblgene_1.geneid
                    FROM public.normchromentrezgene2ensemblgene normchromentrezgene2ensemblgene_1
                   GROUP BY normchromentrezgene2ensemblgene_1.geneid
                  HAVING (count(*) = 1))))) e2e
      JOIN public.gene g ON ((g.ensg = e2e.ensg)))
      JOIN public.entrezgene e ON ((e.geneid = e2e.geneid)))
   WHERE (e.chromosome = g.chromosome)
 UNION
  SELECT g.ensg,
     e.geneid
    FROM ((( SELECT normchromentrezgene2ensemblgene.ensg,
             normchromentrezgene2ensemblgene.geneid
            FROM public.normchromentrezgene2ensemblgene
           WHERE ((normchromentrezgene2ensemblgene.ensg IN ( SELECT normchromentrezgene2ensemblgene_1.ensg
                    FROM public.normchromentrezgene2ensemblgene normchromentrezgene2ensemblgene_1
                   GROUP BY normchromentrezgene2ensemblgene_1.ensg
                  HAVING (count(*) > 1))) OR (normchromentrezgene2ensemblgene.geneid IN ( SELECT normchromentrezgene2ensemblgene_1.geneid
                    FROM public.normchromentrezgene2ensemblgene normchromentrezgene2ensemblgene_1
                   GROUP BY normchromentrezgene2ensemblgene_1.geneid
                  HAVING (count(*) > 1))))) e2e
      JOIN public.gene g ON ((g.ensg = e2e.ensg)))
      JOIN public.entrezgene e ON ((e.geneid = e2e.geneid)))
   WHERE ((e.chromosome = g.chromosome) AND (g.symbol = e.symbol) AND (e.nuclstart IS NOT NULL) AND (e.nuclend IS NOT NULL));


 ALTER TABLE public.distinctentrezgene2ensemblgene OWNER TO postgres;






 CREATE TABLE public.fusiontype (
     fusiontype text NOT NULL,
     fusiondescription text
 );


 ALTER TABLE public.fusiontype OWNER TO postgres;






 CREATE TABLE public.gene2antibody (
     ensg text NOT NULL,
     antibody text NOT NULL
 );


 ALTER TABLE public.gene2antibody OWNER TO postgres;






 CREATE SEQUENCE public.gene_tdpid_seq
     AS integer
     START WITH 1
     INCREMENT BY 1
     NO MINVALUE
     NO MAXVALUE
     CACHE 1;


 ALTER TABLE public.gene_tdpid_seq OWNER TO postgres;







 ALTER SEQUENCE public.gene_tdpid_seq OWNED BY public.gene.tdpid;







 CREATE TABLE public.geneassignment (
     ensg text NOT NULL,
     genesetname text NOT NULL
 );


 ALTER TABLE public.geneassignment OWNER TO postgres;






 CREATE TABLE public.geneexpressionchip (
     geneexpressionchip text NOT NULL,
     description text,
     source text,
     version text,
     taxid integer
 );


 ALTER TABLE public.geneexpressionchip OWNER TO postgres;






 CREATE TABLE public.geneset (
     genesetname text NOT NULL,
     species text NOT NULL
 );


 ALTER TABLE public.geneset OWNER TO postgres;






 CREATE TABLE public.homologene (
     homologenecluster integer NOT NULL,
     geneid integer NOT NULL
 );


 ALTER TABLE public.homologene OWNER TO postgres;






 CREATE VIEW public.humanmouseorthologs AS
  SELECT eh.ensg AS humanensg,
     eh.geneid AS humangeneid,
     eh.symbol AS humansymbol,
     em.ensg AS mouseensg,
     em.geneid AS mousegeneid,
     em.symbol AS mousesymbol
    FROM (( SELECT e.ensg,
             g.symbol,
             h.homologenecluster,
             h.geneid
            FROM ((public.normchromentrezgene2ensemblgene e
              JOIN public.homologene h ON (((h.geneid = e.geneid) AND (public.getspecies(e.ensg) = 'human'::text))))
              JOIN public.gene g ON ((g.ensg = e.ensg)))) eh
      JOIN ( SELECT e.ensg,
             g.symbol,
             h.homologenecluster,
             h.geneid
            FROM ((public.normchromentrezgene2ensemblgene e
              JOIN public.homologene h ON (((h.geneid = e.geneid) AND (public.getspecies(e.ensg) = 'mouse'::text))))
              JOIN public.gene g ON ((g.ensg = e.ensg)))) em ON ((eh.homologenecluster = em.homologenecluster)));


 ALTER TABLE public.humanmouseorthologs OWNER TO postgres;






 CREATE TABLE public.information (
     description text NOT NULL,
     information text
 );


 ALTER TABLE public.information OWNER TO postgres;






 CREATE TABLE public.laboratory (
     laboratory text NOT NULL
 );


 ALTER TABLE public.laboratory OWNER TO postgres;






 CREATE TABLE public.mirbase (
     accession text NOT NULL,
     id text,
     status text,
     sequence text
 );


 ALTER TABLE public.mirbase OWNER TO postgres;






 CREATE TABLE public.mirbase2ensemblgene (
     ensg text NOT NULL,
     accession text NOT NULL
 );


 ALTER TABLE public.mirbase2ensemblgene OWNER TO postgres;






 CREATE TABLE public.mirbasematureseq (
     accession text NOT NULL,
     mature_acc text NOT NULL,
     mature_id text,
     mature_sequence text
 );


 ALTER TABLE public.mirbasematureseq OWNER TO postgres;






 CREATE TABLE public.mutationblacklist (
     startpos bigint,
     chromosome text,
     enst text,
     cdnamutation text
 );


 ALTER TABLE public.mutationblacklist OWNER TO postgres;






 CREATE TABLE public.mutationeffect (
     mutationeffect text NOT NULL,
     description text,
     impact text
 );


 ALTER TABLE public.mutationeffect OWNER TO postgres;






 CREATE TABLE public.mutationtype (
     mutationtype text NOT NULL,
     description text
 );


 ALTER TABLE public.mutationtype OWNER TO postgres;






 CREATE TABLE public.ngsprotocol (
     ngsprotocolid integer NOT NULL,
     ngsprotocolname text,
     plexity smallint,
     strandness text,
     rnaselection text
 );


 ALTER TABLE public.ngsprotocol OWNER TO postgres;






 CREATE TABLE public.probeset (
     geneexpressionchip text NOT NULL,
     probeset text NOT NULL,
     ensg text,
     geneid integer,
     canonical boolean,
     probes smallint,
     matches smallint,
     xhybs smallint,
     foundviaseqmatch boolean,
     rnaseqcorrelation real,
     canonicalgsk boolean,
     rnaseqcorrelationgsk real
 );


 ALTER TABLE public.probeset OWNER TO postgres;






 CREATE TABLE public.refseq (
     refseqid text NOT NULL,
     geneid integer,
     taxid integer NOT NULL,
     refseqdesc text,
     cdnasequence text NOT NULL
 );


 ALTER TABLE public.refseq OWNER TO postgres;






 CREATE TABLE public.similaritytype (
     similaritytype text NOT NULL,
     similaritydescription text
 );


 ALTER TABLE public.similaritytype OWNER TO postgres;






 CREATE VIEW public.tdp_gene AS
  SELECT gene.tdpid,
     gene.ensg,
     gene.species,
     gene.symbol,
     gene.name,
     gene.chromosome,
     gene.strand,
     gene.biotype,
     gene.seqregionstart,
     gene.seqregionend
    FROM public.gene
   WHERE (length(gene.chromosome) <= 2);


 ALTER TABLE public.tdp_gene OWNER TO postgres;






 CREATE VIEW public.tdp_geneassignment AS
  SELECT geneassignment.ensg,
     geneassignment.genesetname
    FROM public.geneassignment;


 ALTER TABLE public.tdp_geneassignment OWNER TO postgres;






 CREATE VIEW public.tdp_geneset AS
  SELECT geneset.genesetname,
     geneset.species
    FROM public.geneset;


 ALTER TABLE public.tdp_geneset OWNER TO postgres;








 CREATE TABLE public.uniprot (
     uniprotid text NOT NULL,
     proteinname text
 );


 ALTER TABLE public.uniprot OWNER TO postgres;






 CREATE TABLE public.uniprot2ensemblgene (
     uniprotid text,
     ensg text
 );


 ALTER TABLE public.uniprot2ensemblgene OWNER TO postgres;






 CREATE TABLE public.uniprot2entrezgene (
     geneid integer,
     uniprotid text
 );


 ALTER TABLE public.uniprot2entrezgene OWNER TO postgres;






 CREATE TABLE public.uniprotaccession (
     uniprotid text NOT NULL,
     accession text NOT NULL
 );


 ALTER TABLE public.uniprotaccession OWNER TO postgres;






 CREATE TABLE tissue.analyzedexon (
     ense text NOT NULL,
     dnaseqrunid integer NOT NULL
 );


 ALTER TABLE tissue.analyzedexon OWNER TO postgres;






 CREATE TABLE tissue.copynumberregion (
     hybridizationid text,
     algorithm text NOT NULL,
     chromosome smallint NOT NULL,
     start integer NOT NULL,
     stop integer NOT NULL,
     log2relativecopynumber real,
     snpcount integer,
     call text,
     totalabscopynumber real,
     minorabscopynumber real,
     confidence real
 );


 ALTER TABLE tissue.copynumberregion OWNER TO postgres;






 CREATE TABLE tissue.dnaseqfileassociation (
     tissuename text NOT NULL,
     vcf_file text NOT NULL,
     description text
 );


 ALTER TABLE tissue.dnaseqfileassociation OWNER TO postgres;






 CREATE TABLE tissue.dnaseqrun (
     dnaseqrunid integer NOT NULL,
     tissuename text NOT NULL,
     cellbatchid integer,
     pubmedid integer,
     comment text,
     vcf_fileid text,
     analysissource text,
     publish boolean NOT NULL
 );


 ALTER TABLE tissue.dnaseqrun OWNER TO postgres;






 CREATE SEQUENCE tissue.dnaseqrunsequence
     START WITH 1
     INCREMENT BY 1
     NO MINVALUE
     NO MAXVALUE
     CACHE 1;


 ALTER TABLE tissue.dnaseqrunsequence OWNER TO postgres;






 CREATE SEQUENCE tissue.doseresponsecurvesequence
     START WITH 1
     INCREMENT BY 1
     NO MINVALUE
     NO MAXVALUE
     CACHE 1;


 ALTER TABLE tissue.doseresponsecurvesequence OWNER TO postgres;






 CREATE SEQUENCE tissue.doseresponsematrixsequence
     START WITH 1
     INCREMENT BY 1
     NO MINVALUE
     NO MAXVALUE
     CACHE 1;


 ALTER TABLE tissue.doseresponsematrixsequence OWNER TO postgres;






 CREATE TABLE tissue.fusiondescription (
     processedfusion integer NOT NULL,
     fusiontype text NOT NULL
 );


 ALTER TABLE tissue.fusiondescription OWNER TO postgres;






 CREATE TABLE tissue.hlatype (
     rnaseqrunid text NOT NULL,
     hla_class text NOT NULL,
     allele1 text,
     allele2 text
 );


 ALTER TABLE tissue.hlatype OWNER TO postgres;






 CREATE TABLE tissue.hybridization (
     hybridizationid text NOT NULL,
     chipname text,
     tissuename text,
     laboratory text,
     hybridizationgroupid integer,
     hybridizationok boolean,
     snpcall real,
     picnicploidy real,
     analysisdirectory text,
     comment text,
     publish boolean,
     rawcopyintensity real,
     rawcopymapd real,
     rawcopywaviness real,
     rawcopysnpd real,
     rawcopysnpskew real,
     rawcopychrx real,
     rawcopychry real,
     rawcopychrm real,
     rawcopynumcin integer,
     rawcopystrcin integer,
     celfile text
 );


 ALTER TABLE tissue.hybridization OWNER TO postgres;






 CREATE TABLE tissue.hybridizationgroup (
     hybridizationgroupid integer NOT NULL,
     hybridizationgroupname text,
     geoseriesnumber text,
     arrayexpressnumber text,
     rdatafilepath text
 );


 ALTER TABLE tissue.hybridizationgroup OWNER TO postgres;






 CREATE TABLE tissue.tissue (
     tissuename text NOT NULL,
     vendorname text NOT NULL,
     species text NOT NULL,
     organ text,
     tumortype text,
     patientname text,
     tumortype_adjacent text,
     tissue_subtype text,
     metastatic_site text,
     histology_type text,
     histology_subtype text,
     gender text,
     age_at_surgery text,
     stage text,
     grade text,
     sample_description text,
     comment text,
     dnasequenced boolean,
     tumorpurity real,
     tdpid integer NOT NULL,
     microsatellite_stability_score real,
     microsatellite_stability_class text,
     immune_environment text,
     gi_mol_subgroup text,
     icluster text,
     til_pattern text,
     number_of_clones real,
     clone_tree_score real,
     rna_integrity_number real,
     minutes_ischemia integer,
     autolysis_score text
 );


 ALTER TABLE tissue.tissue OWNER TO postgres;






 CREATE VIEW tissue.hybrid AS
  SELECT h.hybridizationid,
     h.chipname,
     ct.chiptype,
     h.tissuename,
     t.organ,
     t.tumortype,
     t.histology_type,
     t.histology_subtype,
     h.laboratory,
     hg.hybridizationgroupname,
     h.analysisdirectory AS directory,
     h.comment
    FROM (((tissue.hybridization h
      JOIN tissue.hybridizationgroup hg ON ((hg.hybridizationgroupid = h.hybridizationgroupid)))
      JOIN tissue.tissue t ON ((h.tissuename = t.tissuename)))
      JOIN public.chiptechnology ct ON ((ct.chipname = h.chipname)))
   WHERE (h.publish = true);


 ALTER TABLE tissue.hybrid OWNER TO postgres;






 CREATE TABLE tissue.immunecelldeconvolution (
     tissuename text NOT NULL,
     celltype text NOT NULL,
     score real
 );


 ALTER TABLE tissue.immunecelldeconvolution OWNER TO postgres;






 CREATE TABLE tissue.metabolics (
     tissuename text NOT NULL,
     metabolic_pathway text NOT NULL,
     score real NOT NULL
 );


 ALTER TABLE tissue.metabolics OWNER TO postgres;






 CREATE TABLE tissue.mutation (
     dnaseqrunid integer NOT NULL,
     chromosome text NOT NULL,
     startpos bigint NOT NULL,
     enst text NOT NULL,
     mutationeffect text,
     assembly text,
     exon smallint,
     cdnamutation text,
     proteinmutation text,
     dbsnpid text,
     qualityscore real,
     siftscore text,
     dnacoverage integer,
     dnazygosity real,
     rnacoverage integer,
     rnazygosity real,
     gnomad_allelicfreq real,
     onekg_allelicfreq real
 );


 ALTER TABLE tissue.mutation OWNER TO postgres;






 CREATE TABLE tissue.patient (
     patientname text NOT NULL,
     vital_status boolean,
     days_to_birth integer,
     gender text,
     height real,
     weight real,
     race text,
     ethnicity text,
     history_of_neoad_treatment text,
     days_to_last_followup integer,
     days_to_last_known_alive integer,
     days_to_death integer,
     person_neoplasm_cancer_status text,
     death_classification text
 );


 ALTER TABLE tissue.patient OWNER TO postgres;






 CREATE SEQUENCE tissue.plateidsequence
     START WITH 1
     INCREMENT BY 1
     NO MINVALUE
     NO MAXVALUE
     CACHE 1;


 ALTER TABLE tissue.plateidsequence OWNER TO postgres;






 CREATE TABLE tissue.processedcopynumber (
     tissuename text NOT NULL,
     ensg text NOT NULL,
     log2relativecopynumber real,
     log2relativecopynumberdev real,
     copynumbergainintron boolean,
     copynumberlossintron boolean,
     copynumbergainexon boolean,
     copynumberlossexon boolean,
     gap boolean,
     jump boolean,
     exonicchange boolean,
     intronicchange boolean,
     cosmicdeletion text,
     cosmiczygosity real,
     csdeletion text,
     cszygosity real,
     ngsdeletion text,
     ngszygosity real,
     snpchipalteration text,
     snpchipzygosity real,
     numsources smallint,
     totalabscopynumber real,
     totalabscopynumberdev real,
     minorabscopynumber real,
     minorabscopynumberdev real,
     lossofheterozygosity boolean
 );


 ALTER TABLE tissue.processedcopynumber OWNER TO postgres;






 CREATE VIEW tissue.processedcopynumberview AS
  SELECT g.symbol,
     pcn.tissuename,
     pcn.ensg,
     pcn.log2relativecopynumber,
     pcn.log2relativecopynumberdev,
     pcn.copynumbergainintron,
     pcn.copynumberlossintron,
     pcn.copynumbergainexon,
     pcn.copynumberlossexon,
     pcn.gap,
     pcn.jump,
     pcn.exonicchange,
     pcn.intronicchange,
     pcn.cosmicdeletion,
     pcn.cosmiczygosity,
     pcn.csdeletion,
     pcn.cszygosity,
     pcn.ngsdeletion,
     pcn.ngszygosity,
     pcn.snpchipalteration,
     pcn.snpchipzygosity,
     pcn.numsources,
     pcn.totalabscopynumber,
     pcn.totalabscopynumberdev,
     pcn.minorabscopynumber,
     pcn.minorabscopynumberdev,
     pcn.lossofheterozygosity
    FROM (tissue.processedcopynumber pcn
      JOIN public.gene g ON ((g.ensg = pcn.ensg)));


 ALTER TABLE tissue.processedcopynumberview OWNER TO postgres;






 CREATE TABLE tissue.processedfusiongene (
     processedfusion integer NOT NULL,
     tissuename text NOT NULL,
     ensg1 text NOT NULL,
     ensg2 text NOT NULL,
     countsofcommonmappingreads integer,
     spanningpairs integer,
     spanninguniquereads integer,
     longestanchorfound integer,
     fusionfindingmethod text,
     chrgene1 text,
     chrgene2 text,
     nuclgene1 integer,
     nuclgene2 integer,
     strandgene1 character(1),
     strandgene2 character(1),
     rnaseqrunid text,
     predictedeffect text
 );


 ALTER TABLE tissue.processedfusiongene OWNER TO postgres;






 CREATE VIEW tissue.processedfusiongeneview AS
  SELECT pfg.processedfusion,
     pfg.tissuename,
     pfg.ensg1,
     pfg.ensg2,
     g1.symbol AS symbol1,
     g2.symbol AS symbol2,
     pfg.countsofcommonmappingreads,
     pfg.spanningpairs,
     pfg.spanninguniquereads,
     pfg.longestanchorfound,
     pfg.fusionfindingmethod,
     pfg.chrgene1,
     pfg.chrgene2,
     pfg.nuclgene1,
     pfg.nuclgene2,
     pfg.strandgene1,
     pfg.strandgene2,
     pfg.rnaseqrunid,
     pfg.predictedeffect
    FROM ((tissue.processedfusiongene pfg
      JOIN public.gene g1 ON ((pfg.ensg1 = g1.ensg)))
      JOIN public.gene g2 ON ((pfg.ensg2 = g2.ensg)));


 ALTER TABLE tissue.processedfusiongeneview OWNER TO postgres;






 CREATE SEQUENCE tissue.processedfusionsequence
     START WITH 1
     INCREMENT BY 1
     NO MINVALUE
     NO MAXVALUE
     CACHE 1;


 ALTER TABLE tissue.processedfusionsequence OWNER TO postgres;






 CREATE TABLE tissue.processedrnaseq (
     ensg text NOT NULL,
     rnaseqrunid text NOT NULL,
     log2fpkm real,
     log2tpm real,
     log2cpm real,
     counts integer
 );


 ALTER TABLE tissue.processedrnaseq OWNER TO postgres;






 CREATE TABLE tissue.rnaseqrun (
     rnaseqrunid text NOT NULL,
     tissuename text NOT NULL,
     laboratory text,
     rnaseqgroupid integer,
     associatedrnaseqrunid text,
     cellbatchid integer,
     directory text,
     isxenograft boolean,
     publish boolean,
     comment text,
     canonical boolean,
     sourceid text
 );


 ALTER TABLE tissue.rnaseqrun OWNER TO postgres;






 CREATE VIEW tissue.processedrnaseqview AS
  SELECT prs.rnaseqrunid,
     nr.tissuename,
     prs.ensg,
     prs.log2fpkm,
     prs.log2tpm,
     prs.log2cpm,
     prs.counts
    FROM (tissue.processedrnaseq prs
      JOIN tissue.rnaseqrun nr ON ((nr.rnaseqrunid = prs.rnaseqrunid)))
   WHERE nr.canonical;


 ALTER TABLE tissue.processedrnaseqview OWNER TO postgres;






 CREATE TABLE tissue.processedsequence (
     tissuename text NOT NULL,
     enst text NOT NULL,
     dnamutation text,
     dnamutation_truncated text,
     aamutation text,
     aamutation_truncated text,
     dnazygosity real,
     rnazygosity real,
     exonscomplete real
 );


 ALTER TABLE tissue.processedsequence OWNER TO postgres;






 CREATE TABLE tissue.tissueassignment (
     tissuepanel text NOT NULL,
     tissuename text NOT NULL
 );


 ALTER TABLE tissue.tissueassignment OWNER TO postgres;






 CREATE MATERIALIZED VIEW tissue.tcgaenst AS
  WITH tcgatissue AS (
          SELECT t_1.tissuename
            FROM (tissue.tissueassignment ta
              JOIN tissue.tissue t_1 ON ((t_1.tissuename = ta.tissuename)))
           WHERE ((ta.tissuepanel = 'TCGA tumors'::text) AND t_1.dnasequenced)
         )
  SELECT DISTINCT p.enst
    FROM (tissue.processedsequence p
      JOIN tcgatissue t ON ((p.tissuename = t.tissuename)))
   WITH NO DATA;


 ALTER TABLE tissue.tcgaenst OWNER TO postgres;






 CREATE VIEW tissue.processedsequenceextended AS
  WITH tcgatissue AS (
          SELECT t_1.tissuename
            FROM (tissue.tissueassignment ta
              JOIN tissue.tissue t_1 ON ((t_1.tissuename = ta.tissuename)))
           WHERE ((ta.tissuepanel = 'TCGA tumors'::text) AND t_1.dnasequenced)
         )
  SELECT t.ensg,
     t.enst,
     t.tissuename,
     t.dnamutation,
     t.aamutation,
     t.dnazygosity,
     t.exonscomplete
    FROM ( SELECT tr.ensg,
             ps.enst,
             ps.tissuename,
             ps.dnamutation,
             ps.aamutation,
             ps.dnazygosity,
             ps.exonscomplete
            FROM (tissue.processedsequence ps
              JOIN public.transcript tr ON (((ps.enst = tr.enst) AND tr.iscanonical)))
           WHERE (NOT (ps.tissuename IN ( SELECT tcgatissue.tissuename
                    FROM tcgatissue)))
         UNION
          SELECT tr.ensg,
             e.enst,
             t_1.tissuename,
             COALESCE(ps.dnamutation, 'wt'::text) AS dnamutation,
             COALESCE(ps.aamutation, 'wt'::text) AS aamutation,
             ps.dnazygosity,
             ps.exonscomplete
            FROM (((( SELECT tcgatissue.tissuename
                    FROM tcgatissue) t_1
              LEFT JOIN tissue.tcgaenst e ON (true))
              LEFT JOIN public.transcript tr ON (((e.enst = tr.enst) AND tr.iscanonical)))
              LEFT JOIN tissue.processedsequence ps ON (((t_1.tissuename = ps.tissuename) AND (e.enst = ps.enst))))) t;


 ALTER TABLE tissue.processedsequenceextended OWNER TO postgres;






 CREATE VIEW tissue.processedsequenceview AS
  SELECT g.symbol,
     t.ensg,
     ps.tissuename,
     ps.enst,
     ps.dnamutation,
     ps.dnamutation_truncated,
     ps.aamutation,
     ps.aamutation_truncated,
     ps.dnazygosity,
     ps.rnazygosity,
     ps.exonscomplete
    FROM ((tissue.processedsequence ps
      JOIN public.transcript t ON ((t.enst = ps.enst)))
      JOIN public.gene g ON ((g.ensg = t.ensg)));


 ALTER TABLE tissue.processedsequenceview OWNER TO postgres;






 CREATE TABLE tissue.rnaseqgroup (
     rnaseqgroupid integer NOT NULL,
     rnaseqname text,
     rdatafilepath text,
     processingpipeline text
 );


 ALTER TABLE tissue.rnaseqgroup OWNER TO postgres;






 CREATE TABLE tissue.samplepreparationinngsrun (
     samplepreparationid text NOT NULL,
     flowcellid text NOT NULL,
     flowcelllane smallint NOT NULL,
     dnaseqrunid integer NOT NULL,
     finalsequencinglibrary text,
     baitdesign text
 );


 ALTER TABLE tissue.samplepreparationinngsrun OWNER TO postgres;






 CREATE TABLE tissue.signaling_pathway (
     tissuename text NOT NULL,
     cell_cycle boolean,
     hippo boolean,
     myc boolean,
     notch boolean,
     nrf2 boolean,
     pi3k boolean,
     rtk_ras boolean,
     tp53 boolean,
     tgf_beta boolean,
     wnt boolean
 );


 ALTER TABLE tissue.signaling_pathway OWNER TO postgres;






 CREATE TABLE tissue.similarity (
     similarityid integer NOT NULL,
     tissuename text NOT NULL,
     similaritytype text,
     source text,
     comment text
 );


 ALTER TABLE tissue.similarity OWNER TO postgres;






 CREATE VIEW tissue.tdp_copynumber AS
  SELECT processedcopynumber.ensg,
     processedcopynumber.tissuename,
     processedcopynumber.log2relativecopynumber,
     (pow((2)::double precision, (processedcopynumber.log2relativecopynumber)::double precision) * (2)::double precision) AS relativecopynumber,
         CASE
             WHEN (processedcopynumber.log2relativecopynumber > (log((2)::numeric, (3.5 / (2)::numeric)))::double precision) THEN (2)::smallint
             WHEN (processedcopynumber.log2relativecopynumber < (log((2)::numeric, (1.0 / (2)::numeric)))::double precision) THEN (- (2)::smallint)
             ELSE (0)::smallint
         END AS copynumberclass,
     processedcopynumber.totalabscopynumber
    FROM tissue.processedcopynumber;


 ALTER TABLE tissue.tdp_copynumber OWNER TO postgres;






 CREATE VIEW tissue.tdp_expression AS
  SELECT processedrnaseqview.ensg,
     processedrnaseqview.tissuename,
     processedrnaseqview.log2tpm,
     pow((2)::double precision, (processedrnaseqview.log2tpm)::double precision) AS tpm,
     processedrnaseqview.counts
    FROM tissue.processedrnaseqview;


 ALTER TABLE tissue.tdp_expression OWNER TO postgres;






 CREATE VIEW tissue.tdp_mutation AS
  SELECT ps.ensg,
     ps.tissuename,
     (public.coarse(ps.dnamutation) = 'mut'::text) AS dna_mutated,
     ps.dnamutation,
     (public.coarse(ps.aamutation) = 'mut'::text) AS aa_mutated,
     ps.aamutation,
     ps.dnazygosity AS zygosity,
     ps.exonscomplete
    FROM tissue.processedsequenceextended ps;


 ALTER TABLE tissue.tdp_mutation OWNER TO postgres;






 CREATE VIEW tissue.tdp_data AS
  SELECT omics.ensg,
     omics.tissuename,
     max(omics.copynumberclass) AS copynumberclass,
     max(omics.tpm) AS tpm,
     every(omics.dna_mutated) AS dna_mutated,
     every(omics.aa_mutated) AS aa_mutated
    FROM ( SELECT tdp_copynumber.ensg,
             tdp_copynumber.tissuename,
             tdp_copynumber.copynumberclass,
             NULL::double precision AS tpm,
             NULL::boolean AS dna_mutated,
             NULL::boolean AS aa_mutated
            FROM tissue.tdp_copynumber
         UNION ALL
          SELECT tdp_expression.ensg,
             tdp_expression.tissuename,
             NULL::smallint AS copynumberclass,
             tdp_expression.tpm,
             NULL::boolean AS dna_mutated,
             NULL::boolean AS aa_mutated
            FROM tissue.tdp_expression
         UNION ALL
          SELECT tdp_mutation.ensg,
             tdp_mutation.tissuename,
             NULL::smallint AS copynumberclass,
             NULL::double precision AS tpm,
             tdp_mutation.dna_mutated,
             tdp_mutation.aa_mutated
            FROM tissue.tdp_mutation) omics
   GROUP BY omics.ensg, omics.tissuename;


 ALTER TABLE tissue.tdp_data OWNER TO postgres;






 CREATE TABLE tissue.tissuepanel (
     tissuepanel text NOT NULL,
     tissuepaneldescription text,
     species text
 );


 ALTER TABLE tissue.tissuepanel OWNER TO postgres;






 CREATE VIEW tissue.tdp_panel AS
  SELECT tissuepanel.tissuepanel AS panel,
     tissuepanel.tissuepaneldescription AS paneldescription,
     tissuepanel.species
    FROM tissue.tissuepanel;


 ALTER TABLE tissue.tdp_panel OWNER TO postgres;






 CREATE VIEW tissue.tdp_panelassignment AS
  SELECT tissueassignment.tissuename,
     tissueassignment.tissuepanel AS panel
    FROM tissue.tissueassignment;


 ALTER TABLE tissue.tdp_panelassignment OWNER TO postgres;






 CREATE VIEW tissue.tdp_tissue AS
  SELECT t.tdpid,
     t.tissuename,
     t.species,
     t.organ,
     COALESCE(t.gender, p.gender) AS gender,
     t.tumortype,
     t.tumortype_adjacent,
     t.vendorname,
     p.race,
     p.ethnicity,
     t.microsatellite_stability_score,
     t.microsatellite_stability_class,
     t.immune_environment,
     t.gi_mol_subgroup,
     floor(((p.days_to_birth)::numeric / '-365.25'::numeric)) AS age,
     p.days_to_death,
     p.days_to_last_followup,
     p.vital_status,
     p.height,
     p.weight,
     round(((p.weight / ((p.height / (100)::double precision) ^ (2)::double precision)))::numeric, 2) AS bmi,
     t.tumorpurity
    FROM (tissue.tissue t
      LEFT JOIN tissue.patient p ON ((p.patientname = t.patientname)));


 ALTER TABLE tissue.tdp_tissue OWNER TO postgres;






 CREATE SEQUENCE tissue.tissue_tdpid_seq
     AS integer
     START WITH 1
     INCREMENT BY 1
     NO MINVALUE
     NO MAXVALUE
     CACHE 1;


 ALTER TABLE tissue.tissue_tdpid_seq OWNER TO postgres;







 ALTER SEQUENCE tissue.tissue_tdpid_seq OWNED BY tissue.tissue.tdpid;







 CREATE SEQUENCE tissue.tissueselectionanalysissequence
     START WITH 1
     INCREMENT BY 1
     NO MINVALUE
     NO MAXVALUE
     CACHE 1;


 ALTER TABLE tissue.tissueselectionanalysissequence OWNER TO postgres;






 CREATE SEQUENCE tissue.tissueselectionsequence
     START WITH 1
     INCREMENT BY 1
     NO MINVALUE
     NO MAXVALUE
     CACHE 1;


 ALTER TABLE tissue.tissueselectionsequence OWNER TO postgres;






 CREATE TABLE tissue.treatment (
     rnaseqrunid text NOT NULL,
     drugid text NOT NULL,
     treatmenttime text NOT NULL,
     concentration real,
     concentration_units text
 );


 ALTER TABLE tissue.treatment OWNER TO postgres;






 CREATE TABLE tissue.tumortype (
     tumortype text NOT NULL,
     tumortypedesc text
 );


 ALTER TABLE tissue.tumortype OWNER TO postgres;






 CREATE TABLE tissue.vendor (
     vendorname text NOT NULL,
     vendorurl text
 );


 ALTER TABLE tissue.vendor OWNER TO postgres;






 ALTER TABLE ONLY cellline.cellline ALTER COLUMN tdpid SET DEFAULT nextval('cellline.cellline_tdpid_seq'::regclass);



















 ALTER TABLE ONLY public.gene ALTER COLUMN tdpid SET DEFAULT nextval('public.gene_tdpid_seq'::regclass);







 ALTER TABLE ONLY tissue.tissue ALTER COLUMN tdpid SET DEFAULT nextval('tissue.tissue_tdpid_seq'::regclass);







 ALTER TABLE ONLY cellline.alternative_celllinename
     ADD CONSTRAINT pk_alternative_celllinename PRIMARY KEY (celllinename, alternative_celllinename, source);







 ALTER TABLE ONLY cellline.analyzedexon
     ADD CONSTRAINT pk_analyzedexon PRIMARY KEY (dnaseqrunid, ense);







 ALTER TABLE ONLY cellline.campaign
     ADD CONSTRAINT pk_campaign PRIMARY KEY (campaign);







 ALTER TABLE ONLY cellline.cellline
     ADD CONSTRAINT pk_cellline PRIMARY KEY (celllinename);







 ALTER TABLE ONLY cellline.celllineassignment
     ADD CONSTRAINT pk_celllineassignment PRIMARY KEY (celllinename, celllinepanel);







 ALTER TABLE ONLY cellline.celllinepanel
     ADD CONSTRAINT pk_celllinepanel PRIMARY KEY (celllinepanel);







 ALTER TABLE ONLY cellline.copynumberregion
     ADD CONSTRAINT pk_copynumberregion PRIMARY KEY (hybridizationid, algorithm, chromosome, start);







 ALTER TABLE ONLY cellline.copynumberregionngs
     ADD CONSTRAINT pk_copynumberregionngs PRIMARY KEY (rnaseqrunid, algorithm, chromosome, start);







 ALTER TABLE ONLY cellline.curveanalysis
     ADD CONSTRAINT pk_curveanalysis PRIMARY KEY (plateid, well, doseresponsecurve);







 ALTER TABLE ONLY cellline.depletionscreen
     ADD CONSTRAINT pk_depletionscreen PRIMARY KEY (depletionscreen);







 ALTER TABLE ONLY cellline.dnaseqfileassociation
     ADD CONSTRAINT pk_dnaseqfileassociation PRIMARY KEY (vcf_file, celllinename);







 ALTER TABLE ONLY cellline.dnaseqrun
     ADD CONSTRAINT pk_dnaseqrun PRIMARY KEY (dnaseqrunid);







 ALTER TABLE ONLY cellline.doseresponsecurve
     ADD CONSTRAINT pk_doseresponsecurve PRIMARY KEY (doseresponsecurve);







 ALTER TABLE ONLY cellline.doseresponsematrix
     ADD CONSTRAINT pk_doseresponsematrix PRIMARY KEY (doseresponsematrix);







 ALTER TABLE ONLY cellline.fusiondescription
     ADD CONSTRAINT pk_fusiondescription PRIMARY KEY (processedfusion, fusiontype);







 ALTER TABLE ONLY cellline.geneexpressionset
     ADD CONSTRAINT pk_geneexpressionset PRIMARY KEY (geneexpressionset);







 ALTER TABLE ONLY cellline.hlatype
     ADD CONSTRAINT pk_hlatype PRIMARY KEY (rnaseqrunid, hla_class);







 ALTER TABLE ONLY cellline.hybridization
     ADD CONSTRAINT pk_hybridization PRIMARY KEY (hybridizationid);







 ALTER TABLE ONLY cellline.hybridizationgroup
     ADD CONSTRAINT pk_hybridizationgroup PRIMARY KEY (hybridizationgroupid);







 ALTER TABLE ONLY cellline.matrixanalysis
     ADD CONSTRAINT pk_matrixanalysis PRIMARY KEY (plateid, well, doseresponsematrix);







 ALTER TABLE ONLY cellline.measuredvalue
     ADD CONSTRAINT pk_measuredvalue PRIMARY KEY (plateid, well);







 ALTER TABLE ONLY cellline.metabolite
     ADD CONSTRAINT pk_metabolite PRIMARY KEY (metabolite);







 ALTER TABLE ONLY cellline.microsatelliteinstability
     ADD CONSTRAINT pk_microsatelliteinstability PRIMARY KEY (dnaseqrunid);







 ALTER TABLE ONLY cellline.mutational_signature
     ADD CONSTRAINT pk_mutational_signature PRIMARY KEY (mutational_signature);







 ALTER TABLE ONLY cellline.mutational_signature_profile
     ADD CONSTRAINT pk_mutational_signature_profil PRIMARY KEY (celllinename, mutational_signature);







 ALTER TABLE ONLY cellline.plate
     ADD CONSTRAINT pk_plate PRIMARY KEY (plateid);







 ALTER TABLE ONLY cellline.processedcopynumber
     ADD CONSTRAINT pk_processedcopynumber PRIMARY KEY (celllinename, ensg);







 ALTER TABLE ONLY cellline.processeddepletionscore
     ADD CONSTRAINT pk_processeddepletionscore PRIMARY KEY (depletionscreen, celllinename, ensg);







 ALTER TABLE ONLY cellline.processedfusiongene
     ADD CONSTRAINT pk_processedfusiongene PRIMARY KEY (processedfusion);







 ALTER TABLE ONLY cellline.processedproteinexpression
     ADD CONSTRAINT pk_processedproteinexpression PRIMARY KEY (celllinename, antibody);







 ALTER TABLE ONLY cellline.processedproteinmassspec
     ADD CONSTRAINT pk_processedproteinmassspec PRIMARY KEY (celllinename, uniprotid, accession, isoform);







 ALTER TABLE ONLY cellline.processedrnaseq
     ADD CONSTRAINT pk_processedrnaseq PRIMARY KEY (rnaseqrunid, ensg);







 ALTER TABLE ONLY cellline.processedrnaseqtranscript
     ADD CONSTRAINT pk_processedrnaseqtranscript PRIMARY KEY (rnaseqrunid, enst);







 ALTER TABLE ONLY cellline.processedsequence
     ADD CONSTRAINT pk_processedsequence PRIMARY KEY (celllinename, enst);







 ALTER TABLE ONLY cellline.proliferationtest
     ADD CONSTRAINT pk_proliferationtest PRIMARY KEY (proliferationtest);







 ALTER TABLE ONLY cellline.referringtzeroplate
     ADD CONSTRAINT pk_referringtzeroplate PRIMARY KEY (tzeroplateid, plateid);







 ALTER TABLE ONLY cellline.rnaseqgroup
     ADD CONSTRAINT pk_rnaseqgroup PRIMARY KEY (rnaseqgroupid);







 ALTER TABLE ONLY cellline.rnaseqrun
     ADD CONSTRAINT pk_rnaseqrun PRIMARY KEY (rnaseqrunid);







 ALTER TABLE ONLY cellline.samplepreparationinngsrun
     ADD CONSTRAINT pk_samplepreparationinngsrun PRIMARY KEY (samplepreparationid, flowcellid, flowcelllane, dnaseqrunid);







 ALTER TABLE ONLY cellline.sampleset
     ADD CONSTRAINT pk_sampleset PRIMARY KEY (sampleset);







 ALTER TABLE ONLY cellline.samplesetassignment
     ADD CONSTRAINT pk_samplesetassignment PRIMARY KEY (rnaseqrunid, sampleset);







 ALTER TABLE ONLY cellline.samplesetgroup
     ADD CONSTRAINT pk_samplesetgroup PRIMARY KEY (samplesetgroup);







 ALTER TABLE ONLY cellline.samplesetgroupassignment
     ADD CONSTRAINT pk_samplesetgroupassignment PRIMARY KEY (samplesetgroup, sampleset);







 ALTER TABLE ONLY cellline.similarity
     ADD CONSTRAINT pk_similarity PRIMARY KEY (similarityid, celllinename);







 ALTER TABLE ONLY cellline.treatment
     ADD CONSTRAINT pk_treatment PRIMARY KEY (rnaseqrunid, drugid, treatmenttime);









 ALTER TABLE ONLY public.altensemblsymbol
     ADD CONSTRAINT pk_altensemblsymbol PRIMARY KEY (altsymbol, ensg);







 ALTER TABLE ONLY public.altentrezgenesymbol
     ADD CONSTRAINT pk_altentrezgenesymbol PRIMARY KEY (geneid, symbol);







 ALTER TABLE ONLY public.antibody
     ADD CONSTRAINT pk_antibody PRIMARY KEY (antibody);







 ALTER TABLE ONLY public.chiptechnology
     ADD CONSTRAINT pk_chiptechnology PRIMARY KEY (chipname);







 ALTER TABLE ONLY public.drug
     ADD CONSTRAINT pk_drug PRIMARY KEY (drugid);







 ALTER TABLE ONLY public.entrezgene
     ADD CONSTRAINT pk_entrezgene PRIMARY KEY (geneid);







 ALTER TABLE ONLY public.entrezgene2ensemblgene
     ADD CONSTRAINT pk_entrezgene2ensemblgene PRIMARY KEY (ensg, geneid);







 ALTER TABLE ONLY public.exon
     ADD CONSTRAINT pk_exon PRIMARY KEY (ense);







 ALTER TABLE ONLY public.fusiontype
     ADD CONSTRAINT pk_fusiontype PRIMARY KEY (fusiontype);







 ALTER TABLE ONLY public.gene
     ADD CONSTRAINT pk_gene PRIMARY KEY (ensg);







 ALTER TABLE ONLY public.gene2antibody
     ADD CONSTRAINT pk_gene2antibody PRIMARY KEY (ensg, antibody);







 ALTER TABLE ONLY public.geneassignment
     ADD CONSTRAINT pk_geneassignment PRIMARY KEY (ensg, genesetname);







 ALTER TABLE ONLY public.geneexpressionchip
     ADD CONSTRAINT pk_geneexpressionchip PRIMARY KEY (geneexpressionchip);







 ALTER TABLE ONLY public.geneset
     ADD CONSTRAINT pk_geneset PRIMARY KEY (genesetname);







 ALTER TABLE ONLY public.homologene
     ADD CONSTRAINT pk_homologene PRIMARY KEY (homologenecluster, geneid);







 ALTER TABLE ONLY public.information
     ADD CONSTRAINT pk_information PRIMARY KEY (description);







 ALTER TABLE ONLY public.laboratory
     ADD CONSTRAINT pk_laboratory PRIMARY KEY (laboratory);







 ALTER TABLE ONLY public.mirbase
     ADD CONSTRAINT pk_mirbase PRIMARY KEY (accession);







 ALTER TABLE ONLY public.mirbase2ensemblgene
     ADD CONSTRAINT pk_mirbase2ensemblgene PRIMARY KEY (ensg, accession);







 ALTER TABLE ONLY public.mirbasematureseq
     ADD CONSTRAINT pk_mirbasematureseq PRIMARY KEY (accession, mature_acc);







 ALTER TABLE ONLY public.mutationeffect
     ADD CONSTRAINT pk_mutationeffect PRIMARY KEY (mutationeffect);







 ALTER TABLE ONLY public.mutationtype
     ADD CONSTRAINT pk_mutationtype PRIMARY KEY (mutationtype);







 ALTER TABLE ONLY public.ngsprotocol
     ADD CONSTRAINT pk_ngsprotocol PRIMARY KEY (ngsprotocolid);







 ALTER TABLE ONLY public.probeset
     ADD CONSTRAINT pk_probeset PRIMARY KEY (geneexpressionchip, probeset);







 ALTER TABLE ONLY public.refseq
     ADD CONSTRAINT pk_refseq PRIMARY KEY (refseqid);







 ALTER TABLE ONLY public.similaritytype
     ADD CONSTRAINT pk_similaritytype PRIMARY KEY (similaritytype);







 ALTER TABLE ONLY public.transcript
     ADD CONSTRAINT pk_transcript PRIMARY KEY (enst);







 ALTER TABLE ONLY public.transcript2exon
     ADD CONSTRAINT pk_transcript2exon PRIMARY KEY (enst, ense);







 ALTER TABLE ONLY public.uniprot
     ADD CONSTRAINT pk_uniprot PRIMARY KEY (uniprotid);







 ALTER TABLE ONLY public.uniprotaccession
     ADD CONSTRAINT pk_uniprotaccession PRIMARY KEY (uniprotid, accession);











 ALTER TABLE ONLY tissue.analyzedexon
     ADD CONSTRAINT pk_analyzedexon PRIMARY KEY (ense, dnaseqrunid);







 ALTER TABLE ONLY tissue.dnaseqfileassociation
     ADD CONSTRAINT pk_dnaseqfileassociation PRIMARY KEY (tissuename, vcf_file);







 ALTER TABLE ONLY tissue.dnaseqrun
     ADD CONSTRAINT pk_dnaseqrun PRIMARY KEY (dnaseqrunid);







 ALTER TABLE ONLY tissue.fusiondescription
     ADD CONSTRAINT pk_fusiondescription PRIMARY KEY (processedfusion, fusiontype);







 ALTER TABLE ONLY tissue.hlatype
     ADD CONSTRAINT pk_hlatype PRIMARY KEY (rnaseqrunid, hla_class);







 ALTER TABLE ONLY tissue.hybridization
     ADD CONSTRAINT pk_hybridization PRIMARY KEY (hybridizationid);







 ALTER TABLE ONLY tissue.hybridizationgroup
     ADD CONSTRAINT pk_hybridizationgroup PRIMARY KEY (hybridizationgroupid);







 ALTER TABLE ONLY tissue.immunecelldeconvolution
     ADD CONSTRAINT pk_immunecelldeconvolution PRIMARY KEY (tissuename, celltype);







 ALTER TABLE ONLY tissue.metabolics
     ADD CONSTRAINT pk_metabolics PRIMARY KEY (tissuename, metabolic_pathway);







 ALTER TABLE ONLY tissue.patient
     ADD CONSTRAINT pk_patient PRIMARY KEY (patientname);







 ALTER TABLE ONLY tissue.processedcopynumber
     ADD CONSTRAINT pk_processedcopynumber PRIMARY KEY (tissuename, ensg);







 ALTER TABLE ONLY tissue.processedfusiongene
     ADD CONSTRAINT pk_processedfusiongene PRIMARY KEY (processedfusion);







 ALTER TABLE ONLY tissue.processedrnaseq
     ADD CONSTRAINT pk_processedrnaseq PRIMARY KEY (ensg, rnaseqrunid);







 ALTER TABLE ONLY tissue.processedsequence
     ADD CONSTRAINT pk_processedsequence PRIMARY KEY (tissuename, enst);







 ALTER TABLE ONLY tissue.rnaseqgroup
     ADD CONSTRAINT pk_rnaseqgroup PRIMARY KEY (rnaseqgroupid);







 ALTER TABLE ONLY tissue.rnaseqrun
     ADD CONSTRAINT pk_rnaseqrun PRIMARY KEY (rnaseqrunid);







 ALTER TABLE ONLY tissue.samplepreparationinngsrun
     ADD CONSTRAINT pk_samplepreparationinngsrun PRIMARY KEY (samplepreparationid, flowcellid, flowcelllane, dnaseqrunid);







 ALTER TABLE ONLY tissue.signaling_pathway
     ADD CONSTRAINT pk_signaling_pathway PRIMARY KEY (tissuename);







 ALTER TABLE ONLY tissue.similarity
     ADD CONSTRAINT pk_similarity PRIMARY KEY (similarityid, tissuename);







 ALTER TABLE ONLY tissue.tissue
     ADD CONSTRAINT pk_tissue PRIMARY KEY (tissuename);







 ALTER TABLE ONLY tissue.tissueassignment
     ADD CONSTRAINT pk_tissueassignment PRIMARY KEY (tissuepanel, tissuename);







 ALTER TABLE ONLY tissue.tissuepanel
     ADD CONSTRAINT pk_tissuepanel PRIMARY KEY (tissuepanel);







 ALTER TABLE ONLY tissue.treatment
     ADD CONSTRAINT pk_treatment PRIMARY KEY (rnaseqrunid, drugid, treatmenttime);







 ALTER TABLE ONLY tissue.tumortype
     ADD CONSTRAINT pk_tumortype PRIMARY KEY (tumortype);







 ALTER TABLE ONLY tissue.vendor
     ADD CONSTRAINT pk_vendor PRIMARY KEY (vendorname);







 CREATE INDEX campaign_plate_index ON cellline.plate USING btree (campaign);







 CREATE INDEX conc_measuredvalue_index ON cellline.measuredvalue USING btree (public.ispositive(concentration));







 CREATE INDEX drc_curveanalysis_index ON cellline.curveanalysis USING btree (doseresponsecurve);







 CREATE INDEX drc_drug_campaign_pret_index ON cellline.doseresponsecurve USING btree (drugid, campaign, pretreatment);







 CREATE INDEX drm_doseresponsematrix ON cellline.matrixanalysis USING btree (doseresponsematrix);







 CREATE INDEX drugcat_measuredvalue_index ON cellline.measuredvalue USING btree (drugid, category);







 CREATE INDEX idx_cellline_tdpid ON cellline.cellline USING btree (tdpid, species, tumortype);







 CREATE INDEX idx_copynumberregion ON cellline.copynumberregion USING btree (start, stop, chromosome, algorithm);







 CREATE INDEX idx_hybridization_celllinename ON cellline.hybridization USING btree (celllinename);







 CREATE INDEX idx_log2relativecopynumber ON cellline.processedcopynumber USING btree (log2relativecopynumber);







 CREATE INDEX idx_processedcopynumberensg ON cellline.processedcopynumber USING btree (ensg);







 CREATE INDEX idx_processeddepletionscore ON cellline.processeddepletionscore USING btree (ensg, depletionscreen);







 CREATE INDEX idx_processeddepletionscore2 ON cellline.processeddepletionscore USING btree (depletionscreen, celllinename);







 CREATE INDEX idx_processedfusioncl ON cellline.processedfusiongene USING btree (celllinename);







 CREATE INDEX idx_processedfusiongene1 ON cellline.processedfusiongene USING btree (ensg1, celllinename);







 CREATE INDEX idx_processedfusiongene2 ON cellline.processedfusiongene USING btree (ensg2, celllinename);







 CREATE INDEX idx_processedrnaseq ON cellline.processedrnaseq USING btree (ensg, rnaseqrunid);







 CREATE INDEX idx_processedrnaseqtrans ON cellline.processedrnaseqtranscript USING btree (enst, rnaseqrunid);







 CREATE INDEX idx_processedsequenceenst ON cellline.processedsequence USING btree (enst);







 CREATE INDEX idx_rnaseqruncelllinename ON cellline.rnaseqrun USING btree (celllinename, canonical);







 CREATE INDEX plateid_plate_index ON cellline.plate USING btree (plateid);







 CREATE INDEX idx_altentrezgenesymbol ON public.altentrezgenesymbol USING btree (symbol);







 CREATE INDEX idx_cosmicgene ON public.gene USING btree (cosmic_id_gene);







 CREATE INDEX idx_entrezgenesymbol ON public.entrezgene USING btree (symbol);







 CREATE INDEX idx_exon ON public.exon USING btree (chromosome, seqstart, seqend);







 CREATE INDEX idx_genesymbol ON public.gene USING btree (symbol);







 CREATE INDEX idx_genetdpid ON public.gene USING btree (tdpid);







 CREATE INDEX idx_transcript_canon ON public.transcript USING btree (iscanonical);







 CREATE INDEX idx_transcript_ensg ON public.transcript USING btree (ensg);







 CREATE INDEX idx_transcript_location ON public.transcript USING btree (chromosome, seqstart, seqend);







 CREATE UNIQUE INDEX idx_processedcnensgtissue ON tissue.processedcopynumber USING btree (ensg, tissuename);







 CREATE UNIQUE INDEX idx_processedrnaseq ON tissue.processedrnaseq USING btree (rnaseqrunid, ensg);







 CREATE INDEX idx_processedsequence ON tissue.processedsequence USING btree (enst);







 CREATE INDEX idx_rnaseqrun_canonical ON tissue.rnaseqrun USING btree (canonical);







 CREATE INDEX idx_rnaseqrun_tissuename ON tissue.rnaseqrun USING btree (tissuename);







 CREATE INDEX idx_tdp_copynumber ON tissue.processedcopynumber USING btree ((
 CASE
     WHEN (log2relativecopynumber > (log((2)::numeric, (3.5 / (2)::numeric)))::double precision) THEN (2)::smallint
     WHEN (log2relativecopynumber < (log((2)::numeric, (1.0 / (2)::numeric)))::double precision) THEN (- (2)::smallint)
     ELSE (0)::smallint
 END));







 CREATE INDEX idx_tissue_dnasequence ON tissue.tissue USING btree (dnasequenced);







 CREATE INDEX idx_tissue_tdpid ON tissue.tissue USING btree (tdpid, species, tumortype);







 CREATE INDEX idx_tissue_tumortype ON tissue.tissue USING btree (tumortype);







 CREATE INDEX idx_tissueassignment_tissuename ON tissue.tissueassignment USING btree (tissuepanel);







 CREATE TRIGGER checkdeletemeasuredvalue BEFORE DELETE ON cellline.measuredvalue FOR EACH ROW EXECUTE PROCEDURE public.checkdeletemeasuredvalue();







 CREATE TRIGGER checkinvalidatecurve BEFORE UPDATE ON cellline.measuredvalue FOR EACH ROW EXECUTE PROCEDURE public.checkinvaliddeclaration();







 CREATE TRIGGER filldrc BEFORE UPDATE ON cellline.doseresponsecurve FOR EACH ROW EXECUTE PROCEDURE public.fillbasedatadrc();







 CREATE TRIGGER filldrm BEFORE UPDATE ON cellline.doseresponsematrix FOR EACH ROW EXECUTE PROCEDURE public.fillbasedatadrm();







 CREATE TRIGGER recalccurve AFTER DELETE OR UPDATE ON cellline.measuredvalue FOR EACH ROW EXECUTE PROCEDURE public.setrecalculate();







 CREATE TRIGGER checkprobeset BEFORE INSERT OR UPDATE ON public.probeset FOR EACH ROW EXECUTE PROCEDURE public.checkprobeset();







 CREATE TRIGGER updateentrezgenesymboltrigger AFTER UPDATE ON public.entrezgene FOR EACH ROW EXECUTE PROCEDURE public.updateentrezgenesymbol();







 CREATE TRIGGER updategenesymboltrigger AFTER UPDATE ON public.gene FOR EACH ROW EXECUTE PROCEDURE public.updategenesymbol();







 CREATE TRIGGER updateassociatedrnaseqruntrigger AFTER INSERT OR UPDATE ON tissue.rnaseqrun FOR EACH ROW EXECUTE PROCEDURE tissue.updateassociatedrnaseqruns();







 ALTER TABLE ONLY cellline.alternative_celllinename
     ADD CONSTRAINT fk_alternat_reference_cellline FOREIGN KEY (celllinename) REFERENCES cellline.cellline(celllinename) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.analyzedexon
     ADD CONSTRAINT fk_analyzed_reference_dnaseqru FOREIGN KEY (dnaseqrunid) REFERENCES cellline.dnaseqrun(dnaseqrunid) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY cellline.analyzedexon
     ADD CONSTRAINT fk_analyzed_reference_exon FOREIGN KEY (ense) REFERENCES public.exon(ense) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.celllineassignment
     ADD CONSTRAINT fk_cellline_assignment FOREIGN KEY (celllinename) REFERENCES cellline.cellline(celllinename) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.celllineassignment
     ADD CONSTRAINT fk_cellline_assignment_panel FOREIGN KEY (celllinepanel) REFERENCES cellline.celllinepanel(celllinepanel) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.copynumberregion
     ADD CONSTRAINT fk_copynumb_reference_hybridiz FOREIGN KEY (hybridizationid) REFERENCES cellline.hybridization(hybridizationid) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY cellline.copynumberregionngs
     ADD CONSTRAINT fk_copynumb_reference_rnaseqru FOREIGN KEY (rnaseqrunid) REFERENCES cellline.rnaseqrun(rnaseqrunid) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.curveanalysis
     ADD CONSTRAINT fk_curveana_reference_doseresp FOREIGN KEY (doseresponsecurve) REFERENCES cellline.doseresponsecurve(doseresponsecurve) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY cellline.curveanalysis
     ADD CONSTRAINT fk_curveana_reference_measured FOREIGN KEY (plateid, well) REFERENCES cellline.measuredvalue(plateid, well) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY cellline.dnaseqfileassociation
     ADD CONSTRAINT fk_dnaseqfi_reference_cellline FOREIGN KEY (celllinename) REFERENCES cellline.cellline(celllinename) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.dnaseqrun
     ADD CONSTRAINT fk_dnaseqru_reference_cellline FOREIGN KEY (celllinename) REFERENCES cellline.cellline(celllinename) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.processedfusiongene
     ADD CONSTRAINT fk_fusion_gene1 FOREIGN KEY (ensg1) REFERENCES public.gene(ensg) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.processedfusiongene
     ADD CONSTRAINT fk_fusion_gene2 FOREIGN KEY (ensg2) REFERENCES public.gene(ensg) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.fusiondescription
     ADD CONSTRAINT fk_fusionde_reference_fusionty FOREIGN KEY (fusiontype) REFERENCES public.fusiontype(fusiontype) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.fusiondescription
     ADD CONSTRAINT fk_fusionde_reference_processe FOREIGN KEY (processedfusion) REFERENCES cellline.processedfusiongene(processedfusion) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.hlatype
     ADD CONSTRAINT fk_hlatype_reference_rnaseqru FOREIGN KEY (rnaseqrunid) REFERENCES cellline.rnaseqrun(rnaseqrunid) ON UPDATE RESTRICT ON DELETE CASCADE;







 ALTER TABLE ONLY cellline.hybridization
     ADD CONSTRAINT fk_hybridiz_reference_cellline FOREIGN KEY (celllinename) REFERENCES cellline.cellline(celllinename) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY cellline.hybridization
     ADD CONSTRAINT fk_hybridiz_reference_chiptech FOREIGN KEY (chipname) REFERENCES public.chiptechnology(chipname) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY cellline.hybridization
     ADD CONSTRAINT fk_hybridiz_reference_hybridiz FOREIGN KEY (hybridizationgroupid) REFERENCES cellline.hybridizationgroup(hybridizationgroupid) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.hybridization
     ADD CONSTRAINT fk_hybridiz_reference_laborato FOREIGN KEY (laboratory) REFERENCES public.laboratory(laboratory) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.matrixanalysis
     ADD CONSTRAINT fk_matrixan_reference_doseresp FOREIGN KEY (doseresponsematrix) REFERENCES cellline.doseresponsematrix(doseresponsematrix) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY cellline.matrixanalysis
     ADD CONSTRAINT fk_matrixan_reference_measured FOREIGN KEY (plateid, well) REFERENCES cellline.measuredvalue(plateid, well) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY cellline.measuredvalue
     ADD CONSTRAINT fk_measured_reference_cellline FOREIGN KEY (celllinename) REFERENCES cellline.cellline(celllinename) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.measuredvalue
     ADD CONSTRAINT fk_measured_reference_drug FOREIGN KEY (drugid2) REFERENCES public.drug(drugid) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.measuredvalue
     ADD CONSTRAINT fk_measured_reference_drug2 FOREIGN KEY (drugid) REFERENCES public.drug(drugid) ON UPDATE CASCADE ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.measuredvalue
     ADD CONSTRAINT fk_measured_reference_plate FOREIGN KEY (plateid) REFERENCES cellline.plate(plateid) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY cellline.microsatelliteinstability
     ADD CONSTRAINT fk_microsat_reference_dnaseqru FOREIGN KEY (dnaseqrunid) REFERENCES cellline.dnaseqrun(dnaseqrunid) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY cellline.mutational_signature_profile
     ADD CONSTRAINT fk_mutation_reference_cellline FOREIGN KEY (celllinename) REFERENCES cellline.cellline(celllinename) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.mutation
     ADD CONSTRAINT fk_mutation_reference_dnaseqru FOREIGN KEY (dnaseqrunid) REFERENCES cellline.dnaseqrun(dnaseqrunid) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY cellline.mutation
     ADD CONSTRAINT fk_mutation_reference_effect FOREIGN KEY (mutationeffect) REFERENCES public.mutationeffect(mutationeffect) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.mutational_signature_profile
     ADD CONSTRAINT fk_mutation_reference_mutation FOREIGN KEY (mutational_signature) REFERENCES cellline.mutational_signature(mutational_signature) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.mutation
     ADD CONSTRAINT fk_mutation_reference_transcri FOREIGN KEY (enst) REFERENCES public.transcript(enst) ON UPDATE CASCADE ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.plate
     ADD CONSTRAINT fk_plate_reference_campaign FOREIGN KEY (campaign) REFERENCES cellline.campaign(campaign) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY cellline.plate
     ADD CONSTRAINT fk_plate_reference_laborato FOREIGN KEY (laboratory) REFERENCES public.laboratory(laboratory) ON UPDATE CASCADE ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.plate
     ADD CONSTRAINT fk_plate_reference_prolifer FOREIGN KEY (proliferationtest) REFERENCES cellline.proliferationtest(proliferationtest) ON UPDATE CASCADE ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.processedmetabolite
     ADD CONSTRAINT fk_processe_cellline2_cellline FOREIGN KEY (celllinename) REFERENCES cellline.cellline(celllinename) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.processedcopynumber
     ADD CONSTRAINT fk_processe_copynumber_cellline FOREIGN KEY (celllinename) REFERENCES cellline.cellline(celllinename) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.processedmetabolite
     ADD CONSTRAINT fk_processe_metabolit_metaboli FOREIGN KEY (metabolite) REFERENCES cellline.metabolite(metabolite) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.processedproteinexpression
     ADD CONSTRAINT fk_processe_prot_cellline FOREIGN KEY (celllinename) REFERENCES cellline.cellline(celllinename) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.processedproteinexpression
     ADD CONSTRAINT fk_processe_reference_antibody FOREIGN KEY (antibody) REFERENCES public.antibody(antibody) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.processeddepletionscore
     ADD CONSTRAINT fk_processe_reference_depletio FOREIGN KEY (depletionscreen) REFERENCES cellline.depletionscreen(depletionscreen) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.processeddepletionscore
     ADD CONSTRAINT fk_processe_reference_gene FOREIGN KEY (ensg) REFERENCES public.gene(ensg) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.processedrnaseq
     ADD CONSTRAINT fk_processe_reference_rnaseqru FOREIGN KEY (rnaseqrunid) REFERENCES cellline.rnaseqrun(rnaseqrunid) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY cellline.processedsequence
     ADD CONSTRAINT fk_processe_reference_transcri FOREIGN KEY (enst) REFERENCES public.transcript(enst) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY cellline.processedproteinmassspec
     ADD CONSTRAINT fk_processe_reference_uniprota FOREIGN KEY (uniprotid, accession) REFERENCES public.uniprotaccession(uniprotid, accession) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.processeddepletionscore
     ADD CONSTRAINT fk_processed_depletion_cellline FOREIGN KEY (celllinename) REFERENCES cellline.cellline(celllinename) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.processedcopynumber
     ADD CONSTRAINT fk_processedcopy_2_gene FOREIGN KEY (ensg) REFERENCES public.gene(ensg) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY cellline.processedfusiongene
     ADD CONSTRAINT fk_processedfusion_cellline FOREIGN KEY (celllinename) REFERENCES cellline.cellline(celllinename) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.processedrnaseq
     ADD CONSTRAINT fk_processedrnaseq_gene FOREIGN KEY (ensg) REFERENCES public.gene(ensg) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.processedsequence
     ADD CONSTRAINT fk_processedsequence_cellline FOREIGN KEY (celllinename) REFERENCES cellline.cellline(celllinename) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.processedproteinmassspec
     ADD CONSTRAINT fk_processprotmass_cellline FOREIGN KEY (celllinename) REFERENCES cellline.cellline(celllinename) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.referringtzeroplate
     ADD CONSTRAINT fk_referrin_ref2plate_plate1 FOREIGN KEY (plateid) REFERENCES cellline.plate(plateid) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY cellline.referringtzeroplate
     ADD CONSTRAINT fk_referrin_ref2plate_plate2 FOREIGN KEY (tzeroplateid) REFERENCES cellline.plate(plateid) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY cellline.rnaseqrun
     ADD CONSTRAINT fk_rnaseqru_reference_cellline FOREIGN KEY (celllinename) REFERENCES cellline.cellline(celllinename) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.rnaseqrun
     ADD CONSTRAINT fk_rnaseqru_reference_laborato FOREIGN KEY (laboratory) REFERENCES public.laboratory(laboratory) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.rnaseqrun
     ADD CONSTRAINT fk_rnaseqru_reference_ngsproto FOREIGN KEY (ngsprotocolid) REFERENCES public.ngsprotocol(ngsprotocolid) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.rnaseqrun
     ADD CONSTRAINT fk_rnaseqru_reference_rnaseqgr FOREIGN KEY (rnaseqgroupid) REFERENCES cellline.rnaseqgroup(rnaseqgroupid) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.processedrnaseqtranscript
     ADD CONSTRAINT fk_rnaseqtrans_ngsrun FOREIGN KEY (rnaseqrunid) REFERENCES cellline.rnaseqrun(rnaseqrunid) ON UPDATE RESTRICT ON DELETE CASCADE;







 ALTER TABLE ONLY cellline.processedrnaseqtranscript
     ADD CONSTRAINT fk_rnaseqtrans_transcripts FOREIGN KEY (enst) REFERENCES public.transcript(enst) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.samplepreparationinngsrun
     ADD CONSTRAINT fk_samplepr_reference_dnaseqru FOREIGN KEY (dnaseqrunid) REFERENCES cellline.dnaseqrun(dnaseqrunid) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY cellline.samplesetgroup
     ADD CONSTRAINT fk_samplese_reference_geneexpr FOREIGN KEY (geneexpressionset) REFERENCES cellline.geneexpressionset(geneexpressionset) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.samplesetassignment
     ADD CONSTRAINT fk_samplese_reference_rnaseqru FOREIGN KEY (rnaseqrunid) REFERENCES cellline.rnaseqrun(rnaseqrunid) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY cellline.samplesetgroupassignment
     ADD CONSTRAINT fk_samplese_samplesetgroup FOREIGN KEY (samplesetgroup) REFERENCES cellline.samplesetgroup(samplesetgroup) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY cellline.samplesetassignment
     ADD CONSTRAINT fk_sampleset_ass FOREIGN KEY (sampleset) REFERENCES cellline.sampleset(sampleset) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY cellline.samplesetgroupassignment
     ADD CONSTRAINT fk_sampleset_groupass FOREIGN KEY (sampleset) REFERENCES cellline.sampleset(sampleset) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY cellline.similarity
     ADD CONSTRAINT fk_similari_reference_cellline FOREIGN KEY (celllinename) REFERENCES cellline.cellline(celllinename) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY cellline.similarity
     ADD CONSTRAINT fk_similari_reference_similari FOREIGN KEY (similaritytype) REFERENCES public.similaritytype(similaritytype) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY cellline.treatment
     ADD CONSTRAINT fk_treatmen_reference_drug FOREIGN KEY (drugid) REFERENCES public.drug(drugid) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY cellline.treatment
     ADD CONSTRAINT fk_treatmen_reference_rnaseqru FOREIGN KEY (rnaseqrunid) REFERENCES cellline.rnaseqrun(rnaseqrunid) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY public.altensemblsymbol
     ADD CONSTRAINT fk_altensem_reference_gene FOREIGN KEY (ensg) REFERENCES public.gene(ensg) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY public.altentrezgenesymbol
     ADD CONSTRAINT fk_altentrezsymbol_entrezgene FOREIGN KEY (geneid) REFERENCES public.entrezgene(geneid) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY public.entrezgene2ensemblgene
     ADD CONSTRAINT fk_entrez2ense_gene FOREIGN KEY (geneid) REFERENCES public.entrezgene(geneid) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY public.entrezgene2ensemblgene
     ADD CONSTRAINT fk_entrezge_reference_gene FOREIGN KEY (ensg) REFERENCES public.gene(ensg) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY public.gene2antibody
     ADD CONSTRAINT fk_gene2ant_reference_antibody FOREIGN KEY (antibody) REFERENCES public.antibody(antibody) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY public.gene2antibody
     ADD CONSTRAINT fk_gene2ant_reference_gene FOREIGN KEY (ensg) REFERENCES public.gene(ensg) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY public.geneassignment
     ADD CONSTRAINT fk_geneassi_reference_gene FOREIGN KEY (ensg) REFERENCES public.gene(ensg) ON UPDATE RESTRICT ON DELETE CASCADE;







 ALTER TABLE ONLY public.geneassignment
     ADD CONSTRAINT fk_geneassi_reference_geneset FOREIGN KEY (genesetname) REFERENCES public.geneset(genesetname) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY public.homologene
     ADD CONSTRAINT fk_homologene_entrezgene FOREIGN KEY (geneid) REFERENCES public.entrezgene(geneid) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY public.mirbase2ensemblgene
     ADD CONSTRAINT fk_mirbase2_reference_gene FOREIGN KEY (ensg) REFERENCES public.gene(ensg) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY public.mirbase2ensemblgene
     ADD CONSTRAINT fk_mirbase2_reference_mirbase FOREIGN KEY (accession) REFERENCES public.mirbase(accession) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY public.mirbasematureseq
     ADD CONSTRAINT fk_mirbasem_reference_mirbase FOREIGN KEY (accession) REFERENCES public.mirbase(accession) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY public.mutationblacklist
     ADD CONSTRAINT fk_mutationblack_transcript FOREIGN KEY (enst) REFERENCES public.transcript(enst) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY public.probeset
     ADD CONSTRAINT fk_probeset_entrezgene FOREIGN KEY (geneid) REFERENCES public.entrezgene(geneid) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY public.probeset
     ADD CONSTRAINT fk_probeset_gene FOREIGN KEY (ensg) REFERENCES public.gene(ensg) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY public.probeset
     ADD CONSTRAINT fk_probeset_reference_geneexpr FOREIGN KEY (geneexpressionchip) REFERENCES public.geneexpressionchip(geneexpressionchip) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY public.refseq
     ADD CONSTRAINT fk_refseq_entrezgene FOREIGN KEY (geneid) REFERENCES public.entrezgene(geneid) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY public.transcript2exon
     ADD CONSTRAINT fk_transcri_reference_exon FOREIGN KEY (ense) REFERENCES public.exon(ense) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY public.transcript
     ADD CONSTRAINT fk_transcri_reference_gene FOREIGN KEY (ensg) REFERENCES public.gene(ensg) ON UPDATE CASCADE ON DELETE RESTRICT;







 ALTER TABLE ONLY public.transcript2exon
     ADD CONSTRAINT fk_transcri_reference_transcri FOREIGN KEY (enst) REFERENCES public.transcript(enst) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY public.uniprot2entrezgene
     ADD CONSTRAINT fk_uniprot2_reference_entrezge FOREIGN KEY (geneid) REFERENCES public.entrezgene(geneid) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY public.uniprot2ensemblgene
     ADD CONSTRAINT fk_uniprot2_reference_gene FOREIGN KEY (ensg) REFERENCES public.gene(ensg) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY public.uniprot2entrezgene
     ADD CONSTRAINT fk_uniprot2_uniprot2entrez FOREIGN KEY (uniprotid) REFERENCES public.uniprot(uniprotid) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY public.uniprot2ensemblgene
     ADD CONSTRAINT fk_uniprot2_uniprot2gene FOREIGN KEY (uniprotid) REFERENCES public.uniprot(uniprotid) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY public.uniprotaccession
     ADD CONSTRAINT fk_uniprota_reference_uniprot FOREIGN KEY (uniprotid) REFERENCES public.uniprot(uniprotid) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY tissue.analyzedexon
     ADD CONSTRAINT fk_analyzed_reference_dnaseqru FOREIGN KEY (dnaseqrunid) REFERENCES tissue.dnaseqrun(dnaseqrunid) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY tissue.analyzedexon
     ADD CONSTRAINT fk_analyzed_reference_exon FOREIGN KEY (ense) REFERENCES public.exon(ense) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY tissue.copynumberregion
     ADD CONSTRAINT fk_copynumb_reference_hybridiz FOREIGN KEY (hybridizationid) REFERENCES tissue.hybridization(hybridizationid) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY tissue.dnaseqfileassociation
     ADD CONSTRAINT fk_dnaseqfi_reference_tissue FOREIGN KEY (tissuename) REFERENCES tissue.tissue(tissuename) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY tissue.dnaseqrun
     ADD CONSTRAINT fk_dnaseqru_reference_tissue FOREIGN KEY (tissuename) REFERENCES tissue.tissue(tissuename) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY tissue.fusiondescription
     ADD CONSTRAINT fk_fusionde_reference_fusionty FOREIGN KEY (fusiontype) REFERENCES public.fusiontype(fusiontype) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY tissue.fusiondescription
     ADD CONSTRAINT fk_fusionde_reference_processe FOREIGN KEY (processedfusion) REFERENCES tissue.processedfusiongene(processedfusion) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY tissue.hlatype
     ADD CONSTRAINT fk_hlatype_reference_rnaseqru FOREIGN KEY (rnaseqrunid) REFERENCES tissue.rnaseqrun(rnaseqrunid) ON UPDATE RESTRICT ON DELETE CASCADE;







 ALTER TABLE ONLY tissue.hybridization
     ADD CONSTRAINT fk_hybridiz_reference_chiptech FOREIGN KEY (chipname) REFERENCES public.chiptechnology(chipname) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY tissue.hybridization
     ADD CONSTRAINT fk_hybridiz_reference_hybridiz FOREIGN KEY (hybridizationgroupid) REFERENCES tissue.hybridizationgroup(hybridizationgroupid) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY tissue.hybridization
     ADD CONSTRAINT fk_hybridiz_reference_laborato FOREIGN KEY (laboratory) REFERENCES public.laboratory(laboratory) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY tissue.hybridization
     ADD CONSTRAINT fk_hybridiz_reference_tissue FOREIGN KEY (tissuename) REFERENCES tissue.tissue(tissuename) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY tissue.immunecelldeconvolution
     ADD CONSTRAINT fk_immunece_reference_tissue FOREIGN KEY (tissuename) REFERENCES tissue.tissue(tissuename) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY tissue.metabolics
     ADD CONSTRAINT fk_metaboli_reference_tissue FOREIGN KEY (tissuename) REFERENCES tissue.tissue(tissuename) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY tissue.mutation
     ADD CONSTRAINT fk_mutation_mutationeff FOREIGN KEY (mutationeffect) REFERENCES public.mutationeffect(mutationeffect) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY tissue.mutation
     ADD CONSTRAINT fk_mutation_reference_dnaseqru FOREIGN KEY (dnaseqrunid) REFERENCES tissue.dnaseqrun(dnaseqrunid) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY tissue.mutation
     ADD CONSTRAINT fk_mutation_transcript FOREIGN KEY (enst) REFERENCES public.transcript(enst) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY tissue.processedcopynumber
     ADD CONSTRAINT fk_proccn_2_tissue FOREIGN KEY (tissuename) REFERENCES tissue.tissue(tissuename) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY tissue.processedrnaseq
     ADD CONSTRAINT fk_processe_reference_rnaseqru FOREIGN KEY (rnaseqrunid) REFERENCES tissue.rnaseqrun(rnaseqrunid) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY tissue.processedfusiongene
     ADD CONSTRAINT fk_processe_reference_tissue FOREIGN KEY (tissuename) REFERENCES tissue.tissue(tissuename) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY tissue.processedcopynumber
     ADD CONSTRAINT fk_processecn_2_gene FOREIGN KEY (ensg) REFERENCES public.gene(ensg) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY tissue.processedsequence
     ADD CONSTRAINT fk_processed_2_tissue FOREIGN KEY (tissuename) REFERENCES tissue.tissue(tissuename) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY tissue.processedfusiongene
     ADD CONSTRAINT fk_processefuseion_ensg1 FOREIGN KEY (ensg1) REFERENCES public.gene(ensg) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY tissue.processedfusiongene
     ADD CONSTRAINT fk_processefuseion_ensg2 FOREIGN KEY (ensg2) REFERENCES public.gene(ensg) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY tissue.processedrnaseq
     ADD CONSTRAINT fk_processernas2gene FOREIGN KEY (ensg) REFERENCES public.gene(ensg) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY tissue.processedsequence
     ADD CONSTRAINT fk_processeseq_transcript FOREIGN KEY (enst) REFERENCES public.transcript(enst) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY tissue.rnaseqrun
     ADD CONSTRAINT fk_rnaseqru_reference_laborato FOREIGN KEY (laboratory) REFERENCES public.laboratory(laboratory) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY tissue.rnaseqrun
     ADD CONSTRAINT fk_rnaseqru_reference_rnaseqgr FOREIGN KEY (rnaseqgroupid) REFERENCES tissue.rnaseqgroup(rnaseqgroupid) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY tissue.rnaseqrun
     ADD CONSTRAINT fk_rnaseqru_reference_rnaseqru FOREIGN KEY (associatedrnaseqrunid) REFERENCES tissue.rnaseqrun(rnaseqrunid) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY tissue.rnaseqrun
     ADD CONSTRAINT fk_rnaseqru_reference_tissue FOREIGN KEY (tissuename) REFERENCES tissue.tissue(tissuename) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY tissue.samplepreparationinngsrun
     ADD CONSTRAINT fk_samplepr_reference_dnaseqru FOREIGN KEY (dnaseqrunid) REFERENCES tissue.dnaseqrun(dnaseqrunid) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY tissue.signaling_pathway
     ADD CONSTRAINT fk_signalin_reference_tissue FOREIGN KEY (tissuename) REFERENCES tissue.tissue(tissuename) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY tissue.similarity
     ADD CONSTRAINT fk_similari_reference_similari FOREIGN KEY (similaritytype) REFERENCES public.similaritytype(similaritytype) ON UPDATE CASCADE ON DELETE CASCADE;







 ALTER TABLE ONLY tissue.similarity
     ADD CONSTRAINT fk_similari_reference_tissue FOREIGN KEY (tissuename) REFERENCES tissue.tissue(tissuename) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY tissue.tissue
     ADD CONSTRAINT fk_tissue_reference_patient FOREIGN KEY (patientname) REFERENCES tissue.patient(patientname) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY tissue.tissue
     ADD CONSTRAINT fk_tissue_reference_tumortyp FOREIGN KEY (tumortype) REFERENCES tissue.tumortype(tumortype) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY tissue.tissue
     ADD CONSTRAINT fk_tissue_reference_vendor FOREIGN KEY (vendorname) REFERENCES tissue.vendor(vendorname) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY tissue.tissue
     ADD CONSTRAINT fk_tissue_tumortypeadjacent FOREIGN KEY (tumortype_adjacent) REFERENCES tissue.tumortype(tumortype) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY tissue.tissueassignment
     ADD CONSTRAINT fk_tissueas_reference_tissue FOREIGN KEY (tissuename) REFERENCES tissue.tissue(tissuename) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY tissue.tissueassignment
     ADD CONSTRAINT fk_tissueas_reference_tissuepa FOREIGN KEY (tissuepanel) REFERENCES tissue.tissuepanel(tissuepanel) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY tissue.treatment
     ADD CONSTRAINT fk_treatmen_reference_drug FOREIGN KEY (drugid) REFERENCES public.drug(drugid) ON UPDATE RESTRICT ON DELETE RESTRICT;







 ALTER TABLE ONLY tissue.treatment
     ADD CONSTRAINT fk_treatmen_reference_rnaseqru FOREIGN KEY (rnaseqrunid) REFERENCES tissue.rnaseqrun(rnaseqrunid) ON UPDATE RESTRICT ON DELETE RESTRICT;








