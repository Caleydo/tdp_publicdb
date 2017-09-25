from tdp_core.dbview import DBViewBuilder, inject_where, limit_offset


def create_gene(result, gene):
  result[gene.prefix + '_panel'] = DBViewBuilder().query("""
      SELECT genesetname AS id, species AS description FROM public.tdp_geneset ORDER BY genesetname ASC""") \
    .build()

  result[gene.prefix + '_gene_items'] = DBViewBuilder().idtype(gene.idtype).query("""
          SELECT {g.id} as id, symbol AS text
          FROM {g.table} WHERE (LOWER(symbol) LIKE :query OR LOWER(ensg) LIKE :query) AND species = :species
          ORDER BY {g.id} ASC""".format(g=gene)) \
    .call(limit_offset) \
    .assign_ids() \
    .arg('query').arg('species') \
    .build()

  result[gene.prefix + '_gene_items_verify'] = DBViewBuilder().idtype(gene.idtype).query("""
          SELECT {g.id} as id, symbol AS text
          FROM {g.table} WHERE species = :species""".format(g=gene)) \
    .call(inject_where) \
    .arg('species') \
    .filter('symbol', '(lower(ensg) {operator} {value} or lower(symbol) {operator} {value})') \
    .build()

  result[gene.prefix + '_map_ensgs'] = DBViewBuilder().idtype(gene.idtype).query("""
        SELECT {g.id} AS id, symbol
        FROM {g.table} WHERE {g.id} IN ({ensgs}) AND species = :species
        ORDER BY symbol ASC""".format(g=gene)) \
    .assign_ids() \
    .replace('ensgs', re.compile('(\'[\w]+\')(,\'[\w]+\')*')) \
    .arg('species') \
    .build()

  result[gene.prefix + '_match_symbols'] = DBViewBuilder().query("""
        SELECT COUNT(*) as matches FROM public.tdp_gene
      """) \
    .call(inject_where) \
    .build()
