from tdp_core.dbview import DBViewBuilder, inject_where


def create_sample(views, sample, gene, data):
    # panel
    views[sample.prefix + '_panel'] = DBViewBuilder().query("""
  SELECT panel as id, paneldescription as description, species
  FROM {s.schema}.tdp_panel ORDER BY panel ASC""".format(s=sample)).build()

    def _common_vis(builder):
        return builder.call(inject_where) \
          .idtype(sample.idtype) \
          .arg('ensg') \
          .filters(sample.columns) \
          .filter('panel', sample.panel, join=sample.panel_join) \
          .filter('panel_' + sample.id, sample.panel, join=sample.panel_join) \
          .filter(sample.id, table='d') \
          .filter(gene.id, table='d')

    co_expression = DBViewBuilder('helper').query("""
     SELECT s.{s.id} AS id, g.symbol, s.{s.id} as samplename, d.{{attribute}} AS expression, s.{{color}} as color
        FROM {d.schema}.tdp_expression AS d
        INNER JOIN {g.table} g ON d.{g.id} = g.{g.id}
        INNER JOIN {s.table} s ON d.{s.id} = s.{s.id}
        WHERE d.{g.id} = :ensg""".format(s=sample, g=gene, d=data)) \
        .replace('attribute', data.attributes).replace('color', sample.columns) \
        .call(_common_vis) \
        .build()

    co_expression_plain = DBViewBuilder('helper').query("""
       SELECT s.{s.id} AS id, g.symbol, s.{s.id} as samplename, d.{{attribute}} AS expression
          FROM {d.schema}.tdp_expression AS d
          INNER JOIN {g.table} g ON d.{g.id} = g.{g.id}
          INNER JOIN {s.table} s ON d.{s.id} = s.{s.id}
          WHERE d.{g.id} = :ensg""".format(s=sample, g=gene, d=data)) \
        .replace('attribute', data.attributes) \
        .call(_common_vis) \
        .build()

    views[sample.prefix + '_co_expression'] = co_expression
    views[sample.prefix + '_co_expression_plain'] = co_expression_plain

    expression_vs_copynumber = DBViewBuilder('helper').query("""
   SELECT s.{s.id} AS id, g.symbol, s.{s.id} as samplename, d.{{expression_subtype}} AS expression, d2.{{copynumber_subtype}} AS cn, s.{{color}} as color
       FROM {d.schema}.tdp_expression AS d
       INNER JOIN {d.schema}.tdp_copynumber AS d2 ON d.{g.id} = d2.{g.id} AND d.{s.id} = d2.{s.id}
       INNER JOIN {g.table} g ON d.{g.id} = g.{g.id}
       INNER JOIN {s.table} s ON d.{s.id} = s.{s.id}
       WHERE d.{g.id} = :ensg""".format(s=sample, g=gene, d=data)) \
        .replace('expression_subtype', data.attributes).replace('copynumber_subtype', data.attributes).replace('color', sample.columns) \
        .call(_common_vis) \
        .build()

    expression_vs_copynumber_plain = DBViewBuilder('helper').query("""
     SELECT s.{s.id} AS id, g.symbol, s.{s.id} as samplename, d.{{expression_subtype}} AS expression, d2.{{copynumber_subtype}} AS cn
         FROM {d.schema}.tdp_expression AS d
         INNER JOIN {d.schema}.tdp_copynumber AS d2 ON d.{g.id} = d2.{g.id} AND d.{s.id} = d2.{s.id}
         INNER JOIN {g.table} g ON d.{g.id} = g.{g.id}
         INNER JOIN {s.table} s ON d.{s.id} = s.{s.id}
         WHERE d.{g.id} = :ensg""".format(s=sample, g=gene, d=data)) \
        .replace('expression_subtype', data.attributes).replace('copynumber_subtype', data.attributes) \
        .call(_common_vis) \
        .build()

    views[sample.prefix + '_expression_vs_copynumber'] = expression_vs_copynumber
    views[sample.prefix + '_expression_vs_copynumber_plain'] = expression_vs_copynumber_plain

    onco_print = DBViewBuilder('helper').query("""
     SELECT d.{s.id} AS id, d.{s.id} AS name, copynumberclass AS cn, D.tpm AS expr, D.aa_mutated, g.symbol
       FROM {d.schema}.tdp_data d
       INNER JOIN {g.table} g ON d.{g.id} = g.{g.id}
       INNER JOIN {s.table} s ON d.{s.id} = s.{s.id}
       WHERE d.{g.id} = :ensg AND s.species = :species""".format(s=sample, g=gene, d=data)) \
        .arg('species') \
        .call(_common_vis) \
        .build()

    views[sample.prefix + '_onco_print'] = onco_print

    onco_print_sample_list = DBViewBuilder('helper').idtype(sample.idtype).query("""
       SELECT d.{s.id} AS id
     FROM {s.table} d
     WHERE d.species = :species""".format(s=sample)) \
        .call(inject_where) \
        .arg('species') \
        .filters(sample.columns) \
        .filter('panel', sample.panel, join=sample.panel_join) \
        .filter('panel_' + sample.id, sample.panel, join=sample.panel_join) \
        .filter(sample.id, table='d') \
        .build()

    views[sample.prefix + '_onco_print_sample_list'] = onco_print_sample_list
