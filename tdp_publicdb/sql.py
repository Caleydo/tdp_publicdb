# flake8: noqa
from ordino.dbview import DBViewBuilder, DBConnector, limit_offset, inject_where
import re

__author__ = 'Samuel Gratzl'

idtype_celline = 'Cellline'
_primary_cellline = 'celllinename'
cellline_columns = [_primary_cellline, 'species', 'tumortype', 'organ', 'gender', 'metastatic_site', 'histology_type', 'morphology', 'growth_type', 'age_at_surgery']

idtype_tissue = 'Tissue'
_primary_tissue = 'tissuename'
tissue_columns = [_primary_tissue, 'species', 'tumortype', 'organ', 'gender']

idtype_gene = 'Ensembl'
_primary_gene = 'ensg'
gene_columns = [_primary_gene, 'symbol', 'species', 'chromosome', 'strand', 'biotype', 'seqregionstart', 'seqregionend']
_column_query_gene = 'targidid as _id, t.ensg as id, symbol, species, chromosome, strand, biotype, seqregionstart, seqregionend, name'
filter_gene_panel_no = 'ensg = ANY(SELECT ensg FROM public.targid_geneassignment WHERE genesetname {operator} {value})'
filter_gene_panel = 'c.'+ filter_gene_panel_no
filter_gene_panel_d = 'd.'+ filter_gene_panel_no

agg_score = DBViewBuilder().query('{agg}({data_subtype})') \
  .query('median', 'percentile_cont(0.5) WITHIN GROUP (ORDER BY {data_subtype})') \
  .query('boxplot', 'percentile_cont(ARRAY[0, 0.25, 0.5, 0.75, 1]) WITHIN GROUP (ORDER BY {data_subtype})') \
  .replace('agg').replace('data_subtype')\
  .build()

tables = ['expression', 'mutation', 'copynumber']
attributes = ['relativecopynumber', 'totalabscopynumber', 'copynumberclass', 'aa_mutated', 'aamutation', 'dna_mutated', 'dnamutation', 'tpm', 'counts']
operators = ['<', '>', '>=', '<=', '=', '<>']

def _create_common(result, prefix, table, primary, idtype, columns):
  # lookup for the id and primary names the table

  result[prefix + '_items'] = DBViewBuilder().idtype(idtype).query("""
      SELECT targidid, {primary} as id, {{column}} AS text
      FROM {table} WHERE LOWER({{column}}) LIKE :query AND species = :species
      ORDER BY {{column}} ASC""".format(table=table, primary=primary)) \
    .replace('column', columns)\
    .call(limit_offset) \
    .arg('query').arg('species')\
    .build()

  result[prefix + '_items_verify'] = DBViewBuilder().idtype(idtype).query("""
      SELECT {primary} as id,{{column}} AS text
       FROM {table} WHERE species = :species""".format(table=table, primary=primary))\
    .call(inject_where)\
    .arg('column') \
    .arg('species')\
    .build()

  # lookup for unique / distinct categorical values in a table
  result[prefix + '_unique'] = DBViewBuilder().query("""
        SELECT s as id, s as text
        FROM (SELECT distinct {{column}} AS s
              FROM {table} WHERE LOWER({{column}}) LIKE :query AND species = :species)
        ORDER BY {{column}} ASC""".format(table=table)) \
    .replace('column', columns)\
    .call(limit_offset) \
    .arg('query').arg('species')\
    .build()
  # lookup for unique / distinct categorical values in a table
  result[prefix + '_unique_all'] = DBViewBuilder().query("""
        SELECT distinct {{column}} AS text
        FROM {table} WHERE species = :species AND {{column}} is not null
        ORDER BY {{column}} ASC""".format(table=table)) \
    .replace('column', columns)\
    .arg('species')\
    .build()


def create_gene_score(result, other_prefix, other_primary, other_columns):
  filter_panel = 'c.{primary} = ANY(SELECT {primary} FROM {base}.targid_panelassignment WHERE panel {{operator}} {{value}})'.format(
    primary=other_primary, base=other_prefix)
  basename = 'gene_' + other_prefix

  result[basename + '_single_score'] = DBViewBuilder().idtype(idtype_gene).query("""
          SELECT D.ensg AS id, D.{{attribute}} AS score
          FROM {base}.targid_{{table}} D
          INNER JOIN {base}.targid_{base} C ON D.{primary} = C.{primary}
          INNER JOIN public.targid_gene G ON G.ensg = D.ensg
          WHERE C.species = :species AND C.{primary} = :name""".format(primary=other_primary, base=other_prefix)) \
    .replace('table', tables).replace('attribute', attributes)\
    .call(inject_where)\
    .arg('name').arg('species') \
    .filters(other_columns) \
    .filter('panel', filter_gene_panel_d) \
    .filter('panel_ensg', filter_gene_panel_d) \
    .filter('ensg', table='d') \
    .build()

  result[basename + '_frequency_mutation_score'] = DBViewBuilder().idtype(idtype_gene).query("""
           SELECT ensg AS id, SUM({{attribute}}::integer) as count, COUNT({{attribute}}) as total
           FROM {base}.targid_{{table}} d
           INNER JOIN {base}.targid_{base} c ON c.{primary} = d.{primary}
           WHERE c.species = :species
           GROUP BY ensg""".format(primary=other_primary, base=other_prefix)) \
    .replace('table', tables).replace('attribute', attributes)\
    .call(inject_where) \
    .arg('species') \
    .filters(other_columns) \
    .filter('panel', filter_panel) \
    .filter('panel_ensg', filter_gene_panel_d) \
    .filter('ensg', table='d') \
    .filter(other_primary, table = 'c') \
    .build()

  result[basename + '_frequency_score'] = DBViewBuilder().idtype(idtype_gene).query("""
           SELECT ensg AS id, SUM(({{attribute}} {{operator}} :value)::INT4) as count, COUNT({{attribute}}) as total
           FROM {base}.targid_{{table}} d
           INNER JOIN {base}.targid_{base} c ON c.{primary} = d.{primary}
           WHERE c.species = :species  
           GROUP BY ensg""".format(primary=other_primary, base=other_prefix)) \
    .replace('table', tables).replace('attribute', attributes).replace('operator', operators) \
    .call(inject_where) \
    .arg('value').arg('species') \
    .filters(other_columns) \
    .filter('panel', filter_panel) \
    .filter('panel_ensg', filter_gene_panel_d) \
    .filter('ensg', table='d') \
    .filter(other_primary, table='c')\
    .build()

  result[basename + '_score'] = DBViewBuilder().idtype(idtype_gene).query("""
            SELECT D.ensg AS id, {{agg_score}} AS score
            FROM {base}.targid_{{table}} D
            INNER JOIN {base}.targid_{base} C ON D.{primary} = C.{primary}
            WHERE C.species = :species {{and_where}}
            GROUP BY D.ensg""".format(primary=other_primary, base=other_prefix)) \
    .query('count', """
              SELECT count(DISTINCT D.{primary})
              FROM {base}.targid_{{table}} D
              INNER JOIN {base}.targid_{base} C ON D.{primary} = C.{primary}
              WHERE C.species = :species {{and_where}}""".format(primary=other_primary, base=other_prefix))\
    .replace('table', tables).replace('agg_score').replace('and_where')\
    .arg('species') \
    .filters(other_columns) \
    .filter('panel', filter_panel) \
    .filter('panel_ensg', filter_gene_panel_d) \
    .filter('ensg', table='d') \
    .filter(other_primary, table='d') \
    .build()


def create_cellline_specific(query):
  return query \
    .column('tumortype', type='categorical') \
    .column('organ', type='categorical') \
    .column('gender', type='categorical') \
    .column('metastatic_site', type='categorical') \
    .column('histology_type', type='categorical') \
    .column('morphology', type='categorical') \
    .column('growth_type', type='categorical') \
    .column('age_at_surgery', type='categorical')


def create_tissue_specific(query):
  return query \
    .column('tumortype', type='categorical') \
    .column('organ', type='categorical') \
    .column('gender', type='categorical') \
    .column('vendorname', type='categorical') \
    .column('race', type='categorical') \
    .column('ethnicity', type='categorical') \


def create_sample(result, basename, idtype, primary, base_columns, columns):
  table = '{base}.targid_{base}'.format(base=basename)
  _create_common(result, basename, table, primary, idtype, columns)


  filter_panel = 'c.{primary} = ANY(SELECT {primary} FROM {base}.targid_panelassignment WHERE panel {{operator}} {{value}})'.format(
    primary=primary, base=basename)
  filter_panel_d = 'd.{primary} = ANY(SELECT {primary} FROM {base}.targid_panelassignment WHERE panel {{operator}} {{value}})'.format(
    primary=primary, base=basename)

  result[basename] = DBViewBuilder().idtype(idtype).table(table) \
    .query("""
      SELECT targidid as _id, {primary} as id, *
      FROM {table} c
      ORDER BY {primary} ASC""".format(table=table, primary=primary)) \
    .derive_columns()\
    .call(inject_where) \
    .call(base_columns) \
    .column(primary, label='id', type='string') \
    .filters(columns) \
    .filter('panel', filter_panel) \
    .filter(primary, table='c') \
    .build()

  result[basename + '_panel'] = DBViewBuilder().query("""
  SELECT panel as id, paneldescription as description
  FROM {base}.targid_panel ORDER BY panel ASC""".format(base=basename)).build()

  co_expression = DBViewBuilder().idtype(idtype_gene).query("""
     SELECT c.targidid AS _id, a.ensg AS id, g.symbol, C.{primary} as samplename, a.{{attribute}} AS expression
        FROM {base}.targid_expression AS a
        INNER JOIN PUBLIC.targid_gene g ON a.ensg = g.ensg
        INNER JOIN {base}.targid_{base} C ON a.{primary} = C.{primary}
        WHERE a.ensg = :ensg""".format(primary=primary, base=basename))\
    .replace('attribute', attributes)\
    .call(inject_where)\
    .arg('ensg') \
    .filters(columns) \
    .filter('panel', filter_panel) \
    .filter(primary, table='c') \
    .build()

  result[basename + '_co_expression'] = co_expression
  expression_vs_copynumber = DBViewBuilder().idtype(idtype_gene).query("""
   SELECT c.targidid AS _id, a.ensg AS id, g.symbol, c.{primary} as samplename, a.{{expression_subtype}} AS expression, b.{{copynumber_subtype}} AS cn
       FROM {base}.targid_expression AS a
       INNER JOIN {base}.targid_copynumber AS b ON a.ensg = b.ensg AND a.{primary} = b.{primary}
       INNER JOIN PUBLIC.targid_gene g ON a.ensg = g.ensg
       INNER JOIN {base}.targid_{base} C ON a.{primary} = C.{primary}
       WHERE a.ensg = :ensg""".format(primary=primary, base=basename)) \
    .replace('expression_subtype', attributes).replace('copynumber_subtype', attributes)\
    .call(inject_where)\
    .arg('ensg')\
    .filters(columns) \
    .filter('panel', filter_panel) \
    .filter(primary, table='c') \
    .build()

  result[basename + '_expression_vs_copynumber'] = expression_vs_copynumber

  onco_print = DBViewBuilder().idtype(idtype_gene).query("""
     SELECT g.targidid AS _id, d.ensg AS id, d.{primary} AS name, copynumberclass AS cn, D.tpm AS expr, D.aa_mutated, g.symbol
       FROM {base}.targid_data D
       INNER JOIN {base}.targid_{base} C ON D.{primary} = C.{primary}
       INNER JOIN PUBLIC.targid_gene g ON D.ensg = g.ensg
       WHERE D.ensg = :ensg AND C.species = :species""".format(primary=primary, base=basename))\
    .call(inject_where) \
    .arg('ensg').arg('species') \
    .filters(columns) \
    .filter('panel', filter_panel) \
    .filter(primary, table='c') \
    .filter('ensg', table='d') \
    .build()

  result[basename + '_onco_print'] = onco_print

  onco_print_sample_list = DBViewBuilder().idtype(idtype).query("""
       SELECT C.targidid AS _id, C.{primary} AS id
     FROM {base}.targid_{base} C
     WHERE C.species = :species""".format(primary=primary, base=basename)) \
    .call(inject_where)\
    .arg('species') \
    .filters(columns) \
    .filter('panel', filter_panel) \
    .filter(primary, table='c') \
    .build()

  result[basename + '_onco_print_sample_list'] = onco_print_sample_list


  result[basename + '_gene_single_score'] = DBViewBuilder().idtype(idtype).query("""
        SELECT D.{primary} AS id, D.{{attribute}} AS score
        FROM {base}.targid_{{table}} D
        INNER JOIN public.targid_gene g ON D.ensg = g.ensg
       INNER JOIN {base}.targid_{base} C ON d.{primary} = C.{primary}
        WHERE g.species = :species AND g.ensg = :name""".format(primary=primary, base=basename)) \
    .replace('table', tables).replace('attribute', attributes)\
    .call(inject_where)\
    .arg('name').arg('species')\
    .filters(columns) \
    .filter('panel', filter_panel) \
    .filter('panel_' + primary, filter_panel) \
    .filter(primary, table='c') \
    .build()

  result[basename + '_gene_frequency_mutation_score'] = DBViewBuilder().idtype(idtype).query("""
        SELECT d.{primary} AS id, SUM({{attribute}}::integer) as count, COUNT({{attribute}}) as total
           FROM {base}.targid_{{table}} d
         INNER JOIN public.targid_gene g ON g.ensg = d.ensg
           WHERE g.species = :species
           GROUP BY d.{primary}""".format(primary=primary, base=basename)) \
    .replace('table', tables).replace('attribute', attributes) \
    .call(inject_where) \
    .arg('species')\
    .filters(columns) \
    .filter('panel', filter_gene_panel) \
    .filter('panel_' + primary, filter_panel_d) \
    .filter(primary, table='d') \
    .filter('ensg', table='g') \
    .build()

  result[basename + '_gene_frequency_score'] = DBViewBuilder().idtype(idtype).query("""
        SELECT d.{primary} AS id, SUM(({{attribute}} {{operator}} :value)::INT4) as count, COUNT({{attribute}}) as total
           FROM {base}.targid_{{table}} d
         INNER JOIN public.targid_gene g ON g.ensg = d.ensg
           WHERE g.species = :species
           GROUP BY d.{primary}""".format(primary=primary, base=basename)) \
    .replace('table', tables).replace('attribute', attributes).replace('operator', operators)\
    .call(inject_where) \
    .arg('value').arg('species') \
    .filters(columns) \
    .filter('panel', filter_gene_panel) \
    .filter('panel_' + primary, filter_panel_d) \
    .filter(primary, table='d') \
    .filter('ensg', table='g') \
    .build()

  result[basename + '_gene_score'] = DBViewBuilder().idtype(idtype).query("""
          SELECT D.{primary} AS id, {{agg_score}} AS score
          FROM {base}.targid_{{table}} D
          INNER JOIN public.targid_gene C ON D.ensg = C.ensg
          WHERE C.species = :species {{and_where}}
          GROUP BY D.{primary}""".format(primary=primary, base=basename)) \
    .query('count', """
              SELECT count(DISTINCT {primary})
              FROM {base}.targid_{{table}} D
              INNER JOIN public.targid_gene C ON D.ensg = C.ensg
              WHERE C.species = :species {{and_where}}
              GROUP BY D.{primary}""".format(primary=primary, base=basename)) \
    .replace('table', tables).replace('agg_score').replace('and_where')\
    .arg('species')\
    .filters(gene_columns) \
    .filter('panel', filter_gene_panel) \
    .filter('panel_' + primary, filter_panel_d) \
    .filter(primary, table='d') \
    .filter('ensg', table='c') \
    .build()

  result[basename + '_check_ids'] = DBViewBuilder().query("""
    SELECT COUNT(*) AS matches FROM {base}.targid_{base}
  """.format(primary=primary, base=basename))\
    .call(inject_where)\
    .build()

  result[basename + '_all_columns'] = DBViewBuilder().query("""
    SELECT {primary} as id, * FROM {base}.targid_{base}
  """.format(base=basename, primary=primary))\
    .call(inject_where)\
    .build()



views = dict(
  gene=DBViewBuilder().idtype(idtype_gene).table('public.targid_gene').query("""
  SELECT targidid as _id, {primary} as id, *
  FROM public.targid_gene t
  ORDER BY t.symbol ASC""".format(primary=_primary_gene))
    .derive_columns()
    .column(_primary_gene, label='id', type='string')
    .call(inject_where)
    .filter('panel', 'ensg = ANY(SELECT ensg FROM public.targid_geneassignment WHERE genesetname {operator} {value})')
    .build(),
  gene_panel=DBViewBuilder().query("""
    SELECT genesetname AS id, species AS description FROM public.targid_geneset ORDER BY genesetname ASC""")
    .build(),

  gene_gene_items=DBViewBuilder().idtype(idtype_gene).query("""
      SELECT targidid, ensg as id, symbol AS text
      FROM public.targid_gene WHERE (LOWER(symbol) LIKE :query OR LOWER(ensg) LIKE :query) AND species = :species
      ORDER BY ensg ASC""") \
    .call(limit_offset) \
    .arg('query').arg('species')
    .build(),

  gene_gene_items_verify=DBViewBuilder().idtype(idtype_gene).query("""
      SELECT ensg as id, symbol AS text
       FROM public.targid_gene WHERE species = :species""") \
    .call(inject_where)
    .arg('species') \
    .filter('symbol', '(lower(ensg) {operator} {value} or lower(symbol) {operator} {value})')
    .build(),

  gene_map_ensgs=DBViewBuilder().idtype(idtype_gene).query("""
    SELECT targidid AS _id, ensg AS id, symbol
    FROM public.targid_gene WHERE ensg IN ({ensgs}) AND species = :species
    ORDER BY symbol ASC""")
    .replace('ensgs', re.compile('(\'[\w]+\')(,\'[\w]+\')*'))
    .arg('species')
    .build(),

  gene_all_columns=DBViewBuilder().query("""
    SELECT symbol as id, * FROM public.targid_gene
  """)
    .call(inject_where)
    .build(),

  gene_match_symbols=DBViewBuilder().query("""
    SELECT COUNT(*) as matches FROM public.targid_gene
  """)
    .call(inject_where)
    .build()
)

_create_common(views, 'gene', 'public.targid_gene', _primary_gene, idtype_gene, gene_columns)
create_gene_score(views, 'cellline', _primary_cellline, cellline_columns)
create_gene_score(views, 'tissue', _primary_tissue, tissue_columns)

create_sample(views, 'cellline', idtype_celline, _primary_cellline, create_cellline_specific, cellline_columns)
create_sample(views, 'tissue', idtype_tissue, _primary_tissue, create_tissue_specific, tissue_columns)



def create():
  d = DBConnector(views, agg_score)
  d.description = 'TCGA/CCLE database as assembled by Boehringer Ingelheim GmbH'
  return d
