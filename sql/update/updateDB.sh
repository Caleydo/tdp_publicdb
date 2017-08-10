#!/bin/sh
dbname="ordino"
username="ordino"
host="ordino-database.c3akc9u7lksn.eu-central-1.rds.amazonaws.com"
port=5432
sql_select="SELECT major::text || '.' || minor::text || '.' || revision::text FROM public.ordino_version order by major desc, minor desc, revision desc limit 1"

actual_version=`psql -U ${username} -h ${host} -p ${port} -A -t -q -d ${dbname} -c "${sql_select}"`
## create table
if [ -z "$actual_version" ]
then
  psql_exit_status=`psql -U ${username} -h ${host} -p ${port} -A -t -q -d ${dbname} -f createVersionTable.sql`
  if [ -z "$psql_exit_status" ]
  then
	`psql -U ${username} -h ${host} -p ${port} -A -t -q -d ${dbname} -c "INSERT INTO public.ordino_version(major,minor,revision,date) values(0,0,0,now())"`
	actual_version=`psql -U ${username} -h ${host} -p ${port} -A -t -q -d ${dbname} -c "${sql_select}"`
  	if [ -z "$actual_version" ]
  	then
    		echo "psql failed while trying to run this sql initVersionTable script and insert statement" 1>&2
    		exit $psql_exit_status
	fi
  fi
fi
echo Actual version $actual_version
for filename in `ls -v update_[0-9]*.[0-9]*.[0-9]*-*.sql`; do
	check_version=${filename#update_}
	check_version=`echo $check_version | cut -d- -f1`
	major=`echo $check_version | cut -d. -f1`
  minor=`echo $check_version | cut -d. -f2`
  revision=`echo $check_version | cut -d. -f3`

	if [ $actual_version != $check_version ] && [ "$( echo "${actual_version}\\n${check_version}" | sort -V | head -1)" = $actual_version ]
	then
		psql_exit_status=`psql -U ${username} -h ${host} -p ${port} -A -t -q -d ${dbname} -f $filename`
		if [ -z "$psql_exit_status" ]
		then
			echo "psql failed to run script: $filename" 1>&2
    			exit $psql_exit_status
		fi
 		echo Version inserted  ${check_version}
		`psql -U ${username} -h ${host} -p ${port} -A -t -q -d ${dbname} -c "INSERT INTO public.ordino_version(major,minor,revision,date) values($major,$minor,$revision,now())"`
	fi
done

echo Recreating views
for filename in `ls -v ../views/*.sql`; do
  psql_exit_status=`psql -U ${username} -h ${host} -p ${port} -A -t -q -d ${dbname} -f $filename`
	if [ -z "$psql_exit_status" ]
	then
		echo "psql failed to run script: $filename" 1>&2
		exit $psql_exit_status
	fi
done

echo Fixing permissions
psql_exit_status=`psql -U ${username} -h ${host} -p ${port} -A -t -q -d ${dbname} -f ../create/permission.sql`
if [ -z "$psql_exit_status" ]
then
  echo "psql failed to run script: ../create/permission.sql" 1>&2
  exit $psql_exit_status
fi

echo Done :)
