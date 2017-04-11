#!/bin/sh
dbname="ordino"
username="ordino"
host="ordino-database.c3akc9u7lksn.eu-central-1.rds.amazonaws.com"
port=5432
sql_script=createSnapshotDB_fast.sql

psql_exit_status=`psql -U ${username} -h ${host} -p ${port} -A -t -q -d ${dbname} -f ${sql_script}`
if [ -z "$psql_exit_status" ]
then
	echo "psql failed to run script: sql_script" 1>&2
	exit $psql_exit_status
fi
done
