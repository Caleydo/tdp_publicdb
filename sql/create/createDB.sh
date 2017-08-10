#!/bin/sh

cd /data/bioinf/wernitznig/bioinfoDB/Database
#DB="psql bioinfo.hg38 -h vie-bio-postgres"
DB="psql ordino.hg19 -h vie-bio-postgres"

echo "drop schema tissue cascade;" | $DB
echo "drop schema cellline cascade;" | $DB

cat recreatePublic.sql | $DB

echo "CREATE schema tissue;" | $DB
echo "CREATE schema cellline;" | $DB

cat geneAnnotation.sql | $DB
echo "set search_path = tissue,public;" | cat - tissueDB.sql | $DB
echo "set search_path = cellline,public;" | cat - celllineDB.sql | $DB

cat storedprocedure.sql trigger.sql view.sql | $DB

cat storedprocedureCellline.sql triggerCellline.sql viewCellline.sql | $DB
cat storedprocedureTissue.sql triggerTissue.sql viewTissue.sql | $DB

cat sequenceCellline.sql sequenceTissue.sql | $DB

cat ../views/targid_views.sql ../views/targid_views_cellline.sql ../views/targid_views_tissue.sql | $DB
cat permission.sql | $DB
