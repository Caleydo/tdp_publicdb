from tdp_core.dbview import DBViewBuilder, inject_where, limit_offset


def create_common(views, entity):
    views[entity.prefix] = (
        DBViewBuilder()
        .idtype(entity.idtype)
        .table(entity.table)
        .query(
            """
      SELECT d.{id} as id, d.*
      FROM {table} d
      ORDER BY {sort} ASC""".format(
                id=entity.id, table=entity.table, sort=entity.sort
            )
        )
        .derive_columns()
        .column(entity.id, label="id", type="string")
        .call(entity.column_def)
        .call(inject_where)
        .filter("panel", entity.panel, join=entity.panel_join)
        .filter("panel_" + entity.id, entity.panel, join=entity.panel_join)
        .build()
    )

    # lookup for the id and primary names the table

    views[entity.prefix + "_items"] = (
        DBViewBuilder("helper")
        .idtype(entity.idtype)
        .query(
            """
      SELECT {id} as id, {{column}} AS text
      FROM {table} WHERE LOWER({{column}}) LIKE :query AND species = :species
      ORDER BY {{column}} ASC""".format(
                table=entity.table, id=entity.id
            )
        )
        .replace("column", entity.columns)
        .call(limit_offset)
        .arg("query")
        .arg("species")
        .build()
    )

    views[entity.prefix + "_items_verify"] = (
        DBViewBuilder("helper")
        .idtype(entity.idtype)
        .query(
            """
      SELECT {id} as id, {{column}} AS text
       FROM {table} WHERE species = :species""".format(
                table=entity.table, id=entity.id
            )
        )
        .replace("column", entity.columns)
        .call(inject_where)
        .arg("species")
        .filter(entity.id, "LOWER(" + entity.id + ") {operator} {value}")
        .build()
    )

    # lookup for unique / distinct categorical values in a table
    views[entity.prefix + "_unique"] = (
        DBViewBuilder("helper")
        .query(
            """
        SELECT s as id, s as text
        FROM (SELECT distinct {{column}} AS s
              FROM {table} WHERE LOWER({{column}}) LIKE :query AND species = :species)
        ORDER BY {{column}} ASC""".format(
                table=entity.table
            )
        )
        .replace("column", entity.columns)
        .call(limit_offset)
        .arg("query")
        .arg("species")
        .build()
    )

    # lookup for unique / distinct categorical values in a table
    views[entity.prefix + "_unique_all"] = (
        DBViewBuilder("helper")
        .query(
            """
        SELECT distinct {{column}} AS text
        FROM {table} WHERE species = :species AND {{column}} is not null
        ORDER BY {{column}} ASC""".format(
                table=entity.table
            )
        )
        .replace("column", entity.columns)
        .arg("species")
        .build()
    )

    # use in database info
    views[entity.prefix + "_all_columns"] = (
        DBViewBuilder("helper")
        .query(
            """
    SELECT {sort} as id, * FROM {table}
  """.format(
                sort=entity.sort, table=entity.table
            )
        )
        .call(inject_where)
        .build()
    )

    # used for guessing id types
    views[entity.prefix + "_check_ids"] = (
        DBViewBuilder("helper")
        .query(
            """
    SELECT COUNT(*) AS matches FROM {table}
  """.format(
                table=entity.table
            )
        )
        .call(inject_where)
        .build()
    )
