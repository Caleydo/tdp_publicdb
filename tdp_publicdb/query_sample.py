from tdp_core.dbview import DBViewBuilder, inject_where


def create_sample(views, sample, gene, data):
  # panel
  views[sample.prefix + '_panel'] = DBViewBuilder().query("""
  SELECT panel as id, paneldescription as description
  FROM {s.schema}.tdp_panel ORDER BY panel ASC""".format(s=sample)).build()

  def _common_vis(builder):
    return builder.call(inject_where) \
      .idtype(sample.idtype) \
      .assign_ids() \
      .arg('ensg') \
      .filters(sample.columns) \
      .filter('panel', sample.panel) \
      .filter(sample.id, table='d') \
      .filter(gene.id, table='d')

  co_expression = DBViewBuilder().query("""
     SELECT s.{s.id} AS id, g.symbol, s.{s.id} as samplename, d.{{attribute}} AS expression, s.{{color}} as color
        FROM {d.schema}.tdp_expression AS d
        INNER JOIN {g.table} g ON d.{g.id} = g.{g.id}
        INNER JOIN {s.table} s ON d.{s.id} = s.{s.id}
        WHERE d.{g.id} = :ensg""".format(s=sample, g=gene, d=data)) \
    .replace('attribute', data.attributes).replace('color', sample.columns) \
    .call(_common_vis) \
    .build()

  views[sample.prefix + '_co_expression'] = co_expression

  expression_vs_copynumber = DBViewBuilder().query("""
   SELECT s.{s.id} AS id, g.symbol, s.{s.id} as samplename, d.{{expression_subtype}} AS expression, d2.{{copynumber_subtype}} AS cn, s.{{color}} as color
       FROM {d.schema}.tdp_expression AS d
       INNER JOIN {d.schema}.tdp_copynumber AS d2 ON d.{g.id} = d2.{g.id} AND d.{s.id} = d2.{s.id}
       INNER JOIN {g.table} g ON d.{g.id} = g.{g.id}
       INNER JOIN {s.table} s ON d.{s.id} = s.{s.id}
       WHERE d.{g.id} = :ensg""".format(s=sample, g=gene, d=data)) \
    .replace('expression_subtype', data.attributes).replace('copynumber_subtype', data.attributes).replace('color', sample.columns) \
    .call(_common_vis) \
    .build()

  views[sample.prefix + '_expression_vs_copynumber'] = expression_vs_copynumber

  onco_print = DBViewBuilder().query("""
     SELECT d.{s.id} AS id, d.{s.id} AS name, copynumberclass AS cn, D.tpm AS expr, D.aa_mutated, g.symbol
       FROM {d.schema}.tdp_data d
       INNER JOIN {g.table} g ON d.{g.id} = g.{g.id}
       INNER JOIN {s.table} s ON d.{s.id} = s.{s.id}
       WHERE d.{g.id} = :ensg AND s.species = :species""".format(s=sample, g=gene, d=data)) \
    .arg('species') \
    .call(_common_vis) \
    .build()

  views[sample.prefix + '_onco_print'] = onco_print

  onco_print_sample_list = DBViewBuilder().idtype(sample.idtype).query("""
       SELECT d.{s.id} AS id
     FROM {s.table} d
     WHERE d.species = :species""".format(s=sample)) \
    .call(inject_where) \
    .assign_ids() \
    .arg('species') \
    .filters(sample.columns) \
    .filter('panel', sample.panel) \
    .filter(sample.id, table='d') \
    .build()

  views[sample.prefix + '_onco_print_sample_list'] = onco_print_sample_list
