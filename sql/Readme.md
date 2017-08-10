SQL Scripts
===================
The sql directory has the following sub-directories:
- create: includes all create scripts to create the live database
- create/snapshot: includes all scripts to create the snapshot of the live database
- update: includes alle update scripts to update a live or snapshot database
- views: common views that can be created upon change

Create a live-database
----------
Use the script `createDB.sh` in the create directory to create the live database.

Import/Export a database
----------
Import:
```bash
pg_dump ${dbname} | gzip > ${filename}.gz
```

Export:
```bash
gunzip < ${filename}.gz | psql psql -U ${username} -h ${host} -p ${port} ${dbname}
```

**!Take care of diffent encoding formats!**

Create a snapshot
----------
There are the following three sql scripts to create the snapshot:
- `createSnapshotDB_old.sql`: obsolete script
- `createSnapshotDB_fast.sql`: copies in the original db the snapshot data and from there to the snapshot db
- `createSnapshotDB_slow.sql`: copies the data directly from the original db to the snapshot db, can't use indices efficiently and is therefore slower.

The two latter scripts have the following variables:
- GENE_LIMIT: how many genes should be included in the snapshot db
- TISSUE_LIMIT: how many tissues should be included in the snapshot db
- CELLLINE_LIMIT: how many celllines should be included in the snapshot db
- ORIGINAL_DBNAME: original database name
- SNAPSHOT_DBNAME: snapshot database name
- DB_USER: user who has the permission in both databases
- DB_PASSWORD: password for the DB_USER

To execute one of the scripts, you can use the `createSnapshotDB.sh` script.

Update a database
-------------
To update a database please insert a script with the following naming convention in the update directory:
`update_{major-version}.{minor-version}.{revision}-{notes}.sql`
You can execute the script `updateDB.sh` to update the database to the actual version (internally a table with the name **ordino_version** will be created and includes all updates).
