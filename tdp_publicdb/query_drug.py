from tdp_core.dbview import DBViewBuilder, inject_where, limit_offset

# drug entity is missing the species column as is the case for the other entities,
# therefore a custom view query is needed for now


def create_drug(views, drug):
    views[drug.prefix + '_items'] = DBViewBuilder('helper').idtype(drug.idtype).query("""
    SELECT {id} as id, {{column}} AS text
    FROM {table} WHERE LOWER({{column}}) LIKE :query
    ORDER BY {{column}} ASC""".format(table=drug.table, id=drug.id)) \
     .replace('column', drug.columns) \
     .call(limit_offset) \
     .assign_ids() \
     .arg('query') \
     .build()

    views[drug.prefix + '_drug_items'] = DBViewBuilder('helper').idtype(drug.idtype).query("""
          SELECT {g.id} as id, {g.id} as text, moa, target
          FROM {g.table} WHERE (LOWER(drugid) LIKE :query OR LOWER(moa) LIKE :query OR LOWER(target) LIKE :query)
          ORDER BY drugid ASC""".format(g=drug)) \
        .call(limit_offset) \
        .assign_ids() \
        .arg('query') \
        .build()

    views[drug.prefix + '_drug_items_verify'] = DBViewBuilder('helper').idtype(drug.idtype).query("""
          SELECT {g.id} as id, {g.id} as text, moa, target
          FROM {g.table} """.format(g=drug)) \
        .call(inject_where) \
        .assign_ids() \
        .filter('drug', '(lower(drugid) {operator} {value} or lower(moa) {operator} {value}) or lower(target) {operator} {value})') \
        .build()


def create_drug_sample_score(views, cellline, drug, data, prefix='', callback=None):
    basename = '{view_prefix}{g}_{s}'.format(g=cellline.prefix, s=drug.prefix, view_prefix=prefix)

    views[basename + '_single_score'] = DBViewBuilder('score').idtype(drug.idtype).query("""
          SELECT d.{g.id} AS id, d.{{attribute}} AS score
          FROM {d.schema}.tdp_{{table}} d
          INNER JOIN {s.table} s ON d.{s.id} = s.{s.id}
          INNER JOIN {g.table} g ON d.{g.id} = g.{g.id}
          WHERE d.{s.id} = :name""".format(g=cellline, s=drug, d=data)) \
        .replace('attribute', data.attributes) \
        .replace('table', data.tables) \
        .call(inject_where) \
        .arg('name') \
        .filter('campaign') \
        .build()
