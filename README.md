tdp_publicdb [![Phovea][phovea-image]][phovea-url] https://circleci.com/gh/Caleydo/tdp_publicdb.svg?style=shield&circle-token=89fdd541186de8c3af935cecda2542bcd62b9816)](https://circleci.com/gh/Caleydo/tdp_publicdb)
=====================

This repository contains the database connector for the BI-internal bioinfoDB.hg19 database and the respective SQL queries to drive the [tagid_common](https://github.com/Caleydo/targid_common/) views and visualizations.

URLs to test the deployed version
---

- Kubernetes Logs: http://vieas00082.eu.boehringer.com:31373/
- Ordino Dev: http://vieas00083.eu.boehringer.com:30180/
- Ordino Stable: http://vieas00083.eu.boehringer.com:30181/
- Ordino Biberach Dev: http://vieas00083.eu.boehringer.com:30182/
- Ordino Public DB Test: http://vieas00084.eu.boehringer.com:30183

Installation
------------

```
git clone https://github.com/caleydo/tdp_publicdb.git
cd tdp_publicdb
npm install
```

Testing
-------

```
npm test
```

Building
--------

```
npm run build
```



***

<a href="https://caleydo.org"><img src="http://caleydo.org/assets/images/logos/caleydo.svg" align="left" width="200px" hspace="10" vspace="6"></a>
This repository is part of **[Phovea](http://phovea.caleydo.org/)**, a platform for developing web-based visualization applications. For tutorials, API docs, and more information about the build and deployment process, see the [documentation page](http://phovea.caleydo.org).


[phovea-image]: https://img.shields.io/badge/Phovea-Client%20Plugin-F47D20.svg
[phovea-url]: https://phovea.caleydo.org