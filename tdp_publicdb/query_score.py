from tdp_core.dbview import DBViewBuilder, inject_where
import re


def create_gene_sample_score(views, gene, sample, data, prefix='', inline_aggregate_sample_filter=False):
  basename = '{view_prefix}{g}_{s}'.format(g=gene.prefix, s=sample.prefix, view_prefix=prefix)

  def _common(builder):
    return builder \
      .arg('species') \
      .replace('table', data.tables) \
      .filter('panel', gene.panel, join=gene.panel_join) \
      .filter(sample.id, table='d') \
      .filter('panel_' + sample.id, sample.panel, join=sample.panel_join) \
      .filter(gene.id, table='d') \
      .filter('panel_' + gene.id, gene.panel, join=gene.panel_join)

  views[basename + '_single_score'] = DBViewBuilder().idtype(gene.idtype).query("""
          SELECT d.{g.id} AS id, d.{{attribute}} AS score
          FROM {d.schema}.tdp_{{table}} d
          INNER JOIN {s.table} s ON d.{s.id} = s.{s.id}
          INNER JOIN {g.table} g ON d.{g.id} = g.{g.id}
          WHERE g.species = :species AND d.{s.id} = :name""".format(g=gene, s=sample, d=data)) \
    .replace('attribute', data.attributes) \
    .call(inject_where) \
    .arg('name') \
    .filters(sample.columns) \
    .call(_common) \
    .build()

  def aggregate(attr):
    b = DBViewBuilder().idtype(gene.idtype)
    if inline_aggregate_sample_filter:
      b.query("""SELECT d.{g.id} AS id, {attr}
                   FROM {d.schema}.tdp_{{table}} d
                   INNER JOIN {s.table} s ON d.{s.id} = s.{s.id}
                   {{joins}}
                   WHERE s.species = :species
                   {{and_where}}
                   GROUP BY d.{g.id}""".format(g=gene, s=sample, d=data, attr=attr))
      b.query('count', """
                    SELECT count(DISTINCT d.{s.id})
                    FROM {d.schema}.tdp_{{table}} d
                    INNER JOIN {s.table} s ON d.{s.id} = s.{s.id}
                    {{joins}}
                    WHERE s.species = :species
                    {{and_where}}""".format(g=gene, s=sample, d=data))
      b.filters(sample.columns, table='s')
    else:
      b.query("""SELECT d.{g.id} AS id, {attr}
             FROM {d.schema}.tdp_{{table}} d
             {{joins}}
             WHERE d.{s.id} = ANY(ARRAY(SELECT {s.id} FROM {s.table} WHERE species = :species {{and_sample_where}}))
             {{and_where}}
             GROUP BY d.{g.id}""".format(g=gene, s=sample, d=data, attr=attr))
      b.query('count', """
              SELECT count(DISTINCT d.{s.id})
              FROM {d.schema}.tdp_{{table}} d
              {{joins}}
              WHERE d.{s.id} = ANY(ARRAY(SELECT {s.id} FROM {s.table} WHERE species = :species {{and_sample_where}}))
              {{and_where}}""".format(g=gene, s=sample, d=data))
      b.filters(sample.columns, group='sample')
    b.replace('and_sample_where').replace('and_where').replace('joins')
    b.call(_common)
    return b

  views[basename + '_frequency_mutation_score'] = aggregate(
    """SUM({attribute}::integer) as count, COUNT({attribute}) as total""") \
    .replace('attribute', data.attributes) \
    .build()

  views[basename + '_frequency_score'] = aggregate(
    """SUM(({attribute} {operator} :value)::INT4) as count, COUNT({attribute}) as total""") \
    .replace('attribute', data.attributes).replace('operator', data.operators) \
    .arg('value') \
    .build()

  views[basename + '_frequency_copynumberclass_score'] = aggregate(
    """SUM(({attribute} in ({value}))::INT4) as count, COUNT({attribute}) as total""") \
    .replace('attribute', data.attributes).replace('value', re.compile('([-\d]+)(,[-\d])*')) \
    .build()

  views[basename + '_score'] = aggregate("""{agg_score} AS score""") \
    .replace('agg_score') \
    .build()
