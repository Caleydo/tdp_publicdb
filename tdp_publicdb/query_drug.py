from .entity import drug
from tdp_core.dbview import DBViewBuilder, inject_where, limit_offset

# drug entity is missing the species column as is the case for the other entities,
# therefore a custom view query is needed for now


def create_common_drug(views, entity):
    views[drug.prefix + '_items'] = DBViewBuilder('helper').idtype(drug.idtype).query("""
    SELECT {id} as id, {{column}} AS text
    FROM {table} WHERE LOWER({{column}}) LIKE :query
    ORDER BY {{column}} ASC""".format(table=drug.table, id=drug.id)) \
     .replace('column', drug.columns) \
     .call(limit_offset) \
     .assign_ids() \
     .arg('query') \
     .build()


def create_drug_sample_score(views, drug, sample, data, prefix='', callback=None):
    basename = '{view_prefix}{g}_{s}'.format(g=drug.prefix, s=sample.prefix, view_prefix=prefix)

    views[basename + '_single_score'] = DBViewBuilder('score').idtype(drug.idtype).query("""
          SELECT d.{g.id} AS id, d.{{attribute}} AS score
          FROM {d.schema}.tdp_{{table}} d
          INNER JOIN {s.table} s ON d.{s.id} = s.{s.id}
          INNER JOIN {g.table} g ON d.{g.id} = g.{g.id}
          WHERE g.species = :species AND d.{s.id} = :name""".format(g=drug, s=sample, d=data)) \
      .replace('attribute', data.attributes) \
      .call(inject_where) \
      .arg('name') \
      .call(callback) \
      .filters(drug.columns) \
      .build()
