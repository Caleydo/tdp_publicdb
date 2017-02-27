-------------------------------------------------------------------------------
-- Name:             storedprocedureCellline.sql
-- Last changed:     
-- Description:      stored procedures for schema cellline
-- Author:           Andreas Wernitznig
-------------------------------------------------------------------------------

CREATE OR REPLACE LANGUAGE 'plperl';

CREATE OR REPLACE FUNCTION cellline.getCopyNumberRegion(hid TEXT, chrom INT2, nucstart INT4, nucstop INT4, alg TEXT) RETURNS REAL as $$
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
$$ language 'plpgsql';

-------------------------------------------------------------------------------
-- findMutationORsnp(text, text)
-- find a list of cell lines that have or have not a certain mutation of SNP 
-------------------------------------------------------------------------------
DROP FUNCTION IF EXISTS cellline.findMutationORsnp(symbol TEXT, proteinmutation TEXT);
DROP TYPE IF EXISTS mutsummary;

CREATE TYPE mutsummary AS (
  celllinename TEXT,
  numBINGS INT2,
  numBICS INT2,
  numBIWXS INT2,
  numCCLEWXS INT2,
  zygosity REAL,
  found BOOL,
  notfound BOOL
);

CREATE FUNCTION cellline.findMutationORsnp(symbol TEXT, proteinmutation TEXT) RETURNS SETOF mutsummary AS $$
  my $symbol = shift;
  my $proteinmutation = shift;
  my $res = [];
  my @sources = ("BI-NGS", "BI-CS", "BI-WXS", "CCLE-WXS");

  my $sql = "SELECT distinct exon FROM cellline.sequencingresultssnp WHERE symbol = '$symbol' 
             AND proteinmutation = '$proteinmutation'";
  my $findExon = spi_exec_query($sql);
  my $numExon = $findExon->{processed}; 
  my $exon = $findExon->{rows}[0]->{exon};

  if ($numExon == 1) {
    $sql = "SELECT celllinename, analysissource FROM cellline.analysisrun ar JOIN cellline.analysis a ON (a.analysisrunid = ar.analysisrunid) 
            JOIN cellline.analyzedexon ae ON (a.analysisrunid = ae.analysisrunid and a.analysisid = ae.analysisid) 
            WHERE ensg IN (SELECT ensg FROM gene WHERE symbol = '$symbol') and exon = $exon";

    my %analyzed;
    my $analyzed = spi_exec_query($sql);
    my $nrows = $analyzed->{processed};
    foreach my $rn (0 .. $nrows - 1) {
      my $row = $analyzed->{rows}[$rn];
      my $celllinename = $row->{celllinename};
      $analyzed{$celllinename} = [0, 0, 0, 0] unless (exists $analyzed{$celllinename});
      foreach my $n (0..3) {
        @{$analyzed{$celllinename}}[$n]++ if ($row->{analysissource} eq $sources[$n]);
      }
    }

    $sql = "SELECT celllinename, zygosity, analysissource FROM cellline.sequencingresultssnp 
            WHERE symbol = '$symbol' AND proteinmutation = '$proteinmutation'";

    my %mutations;
    my $mutations = spi_exec_query($sql);
    $nrows = $mutations->{processed};
    foreach my $rn (0 .. $nrows - 1) {
      my $row = $mutations->{rows}[$rn];
      my $celllinename = $row->{celllinename};
      $mutations{$celllinename} = [-1, -1, -1, -1] unless (exists $mutations{$celllinename});
      my $mymut = $mutations{$celllinename};
      foreach my $n (0..3) {
        @{$mymut}[$n] = $row->{zygosity} if (($row->{analysissource} eq $sources[$n]) & @{$mymut}[$n] < $row->{zygosity});
      }
    } 

    for my $celllinename (keys %analyzed) {
      my $zygosity = 0;
      my $found = 0;
      my $notfound = 0;
      if (exists $mutations{$celllinename}) {
        my $mymut = $mutations{$celllinename};
        @zyglist = sort { $a <=> $b } @{$mymut};
        $zygosity = $zyglist[$#zyglist]; 
        $found = 1;
        foreach my $n (0..3) { 
          $notfound = 1 if ((@{$analyzed{$celllinename}}[$n] > 0) & (@{$mymut}[$n] == -1));
        }
      } else {
        $zygosity = undef;
        $notfound = 1;
      }
      $sum = 0;
      $sum += $_ for @{$analyzed{$celllinename}};
      
      push(@$res, {celllinename => $celllinename, numbings => @{$analyzed{$celllinename}}[0], numbics => @{$analyzed{$celllinename}}[1], 
                   numbiwxs => @{$analyzed{$celllinename}}[2], numcclewxs => @{$analyzed{$celllinename}}[3],
                   zygosity => $zygosity, found => $found, notfound => $notfound}) unless ($sum == 0);
    }
  } else {
    elog(WARNING, "can not find snp/mutation in database") unless ($exon);
    return;
  }
  return $res;
$$ LANGUAGE plperl;

-------------------------------------------------------------------------------
-- fillDataDRC(myDrc INT4)
-- updates the base information about a dose response curve in the respective table
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION cellline.fillDataDRC(myDrc INT4) RETURNS BOOLEAN AS $$
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
$$ LANGUAGE 'plpgsql';

-------------------------------------------------------------------------------
-- getGeoMeanGI50(drugid, campaign, pretreatment
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION cellline.getGeoMeanGI50(text, text, text) RETURNS float as $$
DECLARE
  myAvg float;
begin
  SELECT into myAvg exp(avg(ln(x))) FROM
   (SELECT exp(avg(ln(gi50))) as x FROM cellline.doseresponsecurve 
    WHERE drugid = $1 AND campaign = $2 AND pretreatment = $3 AND valid GROUP BY celllinename) dt;
  return(myAvg);
end;
$$
LANGUAGE 'plpgsql';

CREATE OR REPLACE FUNCTION cellline.getGeoMeanGI50_2(text, text, text) RETURNS float as $$
DECLARE
  myAvg float;
begin
  SELECT INTO myAvg geomean(x) FROM
   (SELECT geomean(gi50) as x FROM cellline.doseresponsecurve
    WHERE drugid = $1 AND campaign = $2 AND pretreatment = $3 AND valid GROUP BY celllinename) dt;
  return(myAvg);
end;
$$
LANGUAGE 'plpgsql';

-------------------------------------------------------------------------------
DROP VIEW IF EXISTS cellline.combiDetails;
DROP FUNCTION IF EXISTS cellline.getCombiResults(INT4);
DROP TYPE IF EXISTS drmresult;

CREATE TYPE drmresult AS (
  conc1 REAL,
  conc2 REAL,
  poc REAL,
  cgi REAL,
  pochsa REAL,
  pocbliss REAL, 
  cgihsa REAL,
  cgibliss REAL,
  pochsaexcess REAL,
  pocblissexcess REAL,
  cgihsaexcess REAL,
  cgiblissexcess REAL
); 

-- getCombiResults(drm)
CREATE FUNCTION cellline.getCombiResults(INT4) RETURNS SETOF drmresult AS $$
  my $drm = shift;

  my $sql = " FROM cellline.measuredvalue m 
              JOIN cellline.plate p ON p.plateid = m.plateid 
              JOIN cellline.matrixanalysis ma ON ma.plateid = m.plateid AND ma.well = m.well 
              WHERE doseresponsematrix = " . $drm . " AND valid AND ";
  my $cat = " AND category = 'negative_control'";

  my $negControlAbs = spi_exec_query("SELECT avg(signal) $sql timepoint <> '0h' $cat")->{rows}[0]->{avg};
  my $tZeroAverageAbs = spi_exec_query("SELECT avg(signal) $sql timepoint = '0h' $cat")->{rows}[0]->{avg};
  my $ZeroAverageAbs = spi_exec_query("SELECT avg(signal) $sql category = 'empty'")->{rows}[0]->{avg};
  $ZeroAverageAbs = 0 if (!defined $ZeroAverageAbs);

  #my $groupby = "m.drugid, m.concentration, m.drugid2, m.concentration2 ";  # dangerous to ignore different drugs
  my $groupby = "m.concentration, m.concentration2 ";
  my $cols = "avg(m.signal) AS signal, " . $groupby;

  #elog(WARNING, "there is an error");
 
  my $rv = spi_exec_query("SELECT " . $cols . $sql . "category = 'test' GROUP BY " . $groupby);
  my $nrows = $rv->{processed};
  my $res = [];
  return $res if (!$nrows);

  my (%pocOnly1, %pocOnly2);
  $pocOnly1{0} = 100;
  $pocOnly2{0} = 100;
  foreach my $rn (0 .. $nrows - 1) {
    my $row = $rv->{rows}[$rn];
    my $poc = 100 * ($row->{signal} - $ZeroAverageAbs)/($negControlAbs - $ZeroAverageAbs);
    $pocOnly1{$row->{concentration}} = $poc if ($row->{concentration2} == 0);
    $pocOnly2{$row->{concentration2}} = $poc if ($row->{concentration} == 0);
  }

  push(@$res, {conc1 => 0, conc2 => 0, poc => 100, cgi => 0, pochsa => 100, pocbliss => 100, cgihsa => 0, cgibliss => 0, 
               pochsaexcess => 0, pocblissexcess => 0, cgihsaexcess => 0, cgiblissexcess => 0});
  my $tZeroAverage = 100 * ($tZeroAverageAbs - $ZeroAverageAbs)/($negControlAbs - $ZeroAverageAbs);

  foreach my $rn (0 .. $nrows - 1) {
    my $row = $rv->{rows}[$rn];
    my $poc = 100 * ($row->{signal} - $ZeroAverageAbs)/($negControlAbs - $ZeroAverageAbs);

    my $denominator = $poc < $tZeroAverage ? $tZeroAverage : 100 - $tZeroAverage;
    my $cgi = 100 * (1 - ($poc - $tZeroAverage)/$denominator);

    my $pocconc1 = $pocOnly1{$row->{concentration}};
    my $pocconc2 = $pocOnly2{$row->{concentration2}};
    my $pochsa =  $pocconc1 < $pocconc2 ? $pocconc1 : $pocconc2;
    my $IA = 1 - $pocconc1/100;
    my $IB = 1 - $pocconc2/100;
    my $pocbliss = 100 * (1 - ($IA + $IB - $IA * $IB));

    #$denominator = $pocconc1 < $tZeroAverage ? $tZeroAverage : 100 - $tZeroAverage;
    #$IA = 0.5 * (1 - ($pocconc1 - $tZeroAverage)/$denominator);
    #$denominator = $pocconc2 < $tZeroAverage ? $tZeroAverage : 100 - $tZeroAverage;
    #$IB = 0.5 * (1 - ($pocconc2 - $tZeroAverage)/$denominator);
    #my $cgihsa = 200 * ($IA > $IB ? $IA : $IB);
    #my $cgibliss = 200 * ($IA + $IB - $IA * $IB); 

    $denominator = $pocbliss < $tZeroAverage ? $tZeroAverage : 100 - $tZeroAverage;
    my $cgibliss = 100 * (1 - ($pocbliss - $tZeroAverage)/$denominator);
    $denominator = $pochsa < $tZeroAverage ? $tZeroAverage : 100 - $tZeroAverage;
    my $cgihsa = 100 * (1 - ($pochsa - $tZeroAverage)/$denominator);

    push(@$res, {conc1 => $row->{concentration}, conc2 => $row->{concentration2}, 
                 poc => $poc, cgi => $cgi, pochsa => $pochsa, 
                 pocbliss => $pocbliss, cgihsa => $cgihsa, cgibliss => $cgibliss, 
                 pochsaexcess => $pochsa - $poc, 
                 pocblissexcess => (abs($pocbliss - $poc) < 1e-13) ? 0 : $pocbliss - $poc, 
                 cgihsaexcess => (abs($cgi - $cgihsa) < 1e-13) ? 0 : $cgi - $cgihsa, 
                 cgiblissexcess => (abs($cgi - $cgibliss) < 1e-13) ? 0: $cgi - $cgibliss});
  }
  return $res; 
$$ LANGUAGE plperl;

--SELECT * FROM cellline.getCombiResults(2045) order by conc2, conc1;

---------------------------------------------------------------------
DROP FUNCTION IF EXISTS cellline.getCopyNumberCellline(TEXT);
DROP TYPE IF EXISTS copynumberresult;

CREATE TYPE copynumberresult AS (
  celllinename varchar(50),
  ensg varchar(20),
  log2copynumber real,
  weightedlog2copynumber real,
  copynumbergainintron  boolean,
  copynumberlossintron  boolean,
  copynumbergainexon    boolean,
  copynumberlossexon    boolean,
  gap                   boolean,
  jump                  boolean, 
  exonicchange          boolean, 
  intronicchange        boolean, 
  cosmicdeletion        TEXT,
  cosmiczygosity        real, 
  bicsdeletion          TEXT, 
  bicszygosity          real, 
  ngsdeletion           TEXT,
  ngszygosity           real,
  snpchipalteration     TEXT, 
  snpchipzygocity       real,
  numsources            smallint
);

--- getCopyNumber(chromosome, start, stop, cellline)

CREATE FUNCTION cellline.getCopyNumberCellline(TEXT) RETURNS SETOF copynumberresult AS $$
  my ($chromosome, $start, $stop, $celllinename) = @_;
  my $res = [];

  my $sql1 = "SELECT * FROM cellline.copynumberregion WHERE hybridizationid IN 
              (SELECT hybridizationid FROM cellline.hybridization WHERE celllinename = '$celllinename' 
               AND chipname = 'GenomeWideSNP_6.Full') AND algorithm = 'GLAD'";
  my $rv1 = spi_exec_query($sql1);
  my @cn;
  my $nrows1 = $rv1->{processed};

  foreach my $rn1 (0 .. $nrows1 - 1) {
    my $row = $rv->{rows}[$rn];
    push(@cn, $row->{mean}); 
  }

  my $sql = "SELECT ensg, chromosome, seqregionstart, seqregionend FROM gene";
  my $rv = spi_exec_query($sql);
  my $nrows = $rv->{processed};

  foreach my $rn (0 .. $nrows - 1) {
    my $row = $rv->{rows}[$rn];    
 
    push(@$res,  {celllinename => $celllinename,
               ensg => $row->{ensg},
               log2copynumber => 2,
               weightedlog2copynumber => 2.2, 
               copynumbergainintron => FALSE,
               copynumberlossintron => FALSE,
               copynumbergainexon => FALSE,
               copynumberlossexon => FALSE,
               gap => FALSE,
               jump => FALSE,
               exonicchange => FALSE,
               intronicchange => FALSE,
               cosmicdeletion => undef,
               cosmiczygosity => undef,  
               bicsdeletion => undef,
               bicszygosity => undef,
               ngsdeletion => undef,
               ngszygosity => undef,
               snpchipalteration => undef,
               snpchipzygocity => undef,
               numsources => 1
            });
  } 
  return $res;
$$ LANGUAGE plperl;

--EXPLAIN ANALYZE SELECT * from cellline.getCopyNumberCellline('PC-3') limit 10;
