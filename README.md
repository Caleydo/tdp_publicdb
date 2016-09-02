TargID BioInfoDB Connector ![Caleydo Web Server Plugin](https://img.shields.io/badge/Caleydo%20Web-Server-10ACDF.svg)
===================

This repository contains the database connector for the BioInfoDB and the respective SQL queries to drive the [tagid_common](https://github.com/Caleydo/targid_common/) views and visualizations.

Installation
------------

[Set up a virtual machine using Vagrant](http://www.caleydo.org/documentation/vagrant/) and run these commands inside the virtual machine:

```bash
./manage.sh clone Caleydo/targid_bioinfodb
./manage.sh resolve
```

If you want this plugin to be dynamically resolved as part of another application of plugin, you need to add it as a peer dependency to the _package.json_ of the application or plugin it should belong to:

```json
{
  "peerDependencies": {
    "targid_bioinfodb": "*"
  }
}
```

Local PostgreSQL installation
------------

1. [Download PostgreSQL](http://www.enterprisedb.com/products-services-training/pgdownload) for your operating system and install it
2. Add the installation path to the PATH variable
  - On Windows: `C:\Program Files\PostgreSQL\9.5\bin`
3. Start pgAdmin (is included in the download from enterprisedb.com) and try the database connection
  - On Windows: After the installation the _postgresql-x64-9.5_ service should already run
4. Open a command line window
  - On Windows: **Git Bash does not work**, use the normal command line instead
5. Run `psql -d postgres -U postgres < D:\Downloads\targid2.dump` importing the dump into the default _postgres_ database (-d) using the _postgres_ user (-U)
6. Depending on the dump file size the import takes a while
  - The console output is updated from time to time
7. When the import has finished: Switch to pgAdmin and refresh the _postgres_ database
  - You should now be able to see the schemas _cellline_, _public_, and _tissues_


***

<a href="https://caleydo.org"><img src="http://caleydo.org/assets/images/logos/caleydo.svg" align="left" width="200px" hspace="10" vspace="6"></a>
This repository is part of **[Caleydo Web](http://caleydo.org/)**, a platform for developing web-based visualization applications. For tutorials, API docs, and more information about the build and deployment process, see the [documentation page](http://caleydo.org/documentation/).
