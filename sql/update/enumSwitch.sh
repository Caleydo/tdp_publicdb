#!/bin/sh

db="psql bioinfo.hg38"

cd /data/bioinf/wernitznig/bioinfoDB/Database
cat targid_views* | egrep -i "^CREATE" | sed 's/^CREATE/DROP/g;' | sed 's/ AS/ CASCADE;/g;' | $db

cat enumSwitch.sql | $db

cat targid_views* | $db
cat permission.sql | $db
