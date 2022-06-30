from tdp_core.dbview import DBViewBuilder, inject_where, limit_offset


def create_gene(views, gene):
    views[gene.prefix + "_panel"] = (
        DBViewBuilder()
        .query(
            """
      SELECT genesetname AS id, species AS description, species FROM public.tdp_geneset ORDER BY genesetname ASC"""
        )
        .build()
    )

    views[gene.prefix + "_gene_items"] = (
        DBViewBuilder("helper")
        .idtype(gene.idtype)
        .query(
            """
          SELECT {g.id} as id, symbol AS text
          FROM {g.table} WHERE (LOWER(symbol) LIKE :query OR LOWER(ensg) LIKE :query) AND species = :species
          ORDER BY symbol ASC""".format(
                g=gene
            )
        )
        .call(limit_offset)
        .arg("query")
        .arg("species")
        .build()
    )

    views[gene.prefix + "_gene_items_verify"] = (
        DBViewBuilder("helper")
        .idtype(gene.idtype)
        .query(
            """
          SELECT {g.id} as id, symbol AS text
          FROM {g.table} WHERE species = :species""".format(
                g=gene
            )
        )
        .call(inject_where)
        .arg("species")
        .filter("symbol", "(lower(ensg) {operator} {value} or lower(symbol) {operator} {value})")
        .build()
    )

    views[gene.prefix + "_match_symbols"] = (
        DBViewBuilder("helper")
        .query(
            """
        SELECT COUNT(*) as matches FROM public.tdp_gene
      """
        )
        .call(inject_where)
        .build()
    )

    views[gene.prefix + "_signature"] = (
        DBViewBuilder("helper")
        .query(
            """
        SELECT  g.signature as id, g.description
        FROM {g.schema}.tdp_genesignature g
     """.format(
                g=gene
            )
        )
        .build()
    )
