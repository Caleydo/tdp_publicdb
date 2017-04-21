# flake8: noqa
from ordino.dbview import DBViewBuilder, DBConnector

__author__ = 'Samuel Gratzl'

idtype_celline = 'Cellline'
_primary_cellline = 'celllinename'

idtype_tissue = 'Tissue'
_primary_tissue = 'tissuename'

_column_query_cellline_tissue = 'targidid as _id, organ, gender, tumortype'

idtype_gene = 'Ensembl'
_primary_gene = 'ensg'
_index_gene = "row_number() OVER(ORDER BY t.ensg ASC) as _index"
_column_query_gene = 'targidid as _id, t.ensg as id, symbol, species, chromosome, strand, biotype, seqregionstart, seqregionend, name'
filter_gene_panel = 'c.ensg = ANY(SELECT ensg FROM public.targid_geneassignment WHERE genesetname %(operator)s %(value)s)'
filter_gene_panel_d = 'd.ensg = ANY(SELECT ensg FROM public.targid_geneassignment WHERE genesetname %(operator)s %(value)s)'
filter_gene_panel_no = 'ensg = ANY(SELECT ensg FROM public.targid_geneassignment WHERE genesetname %(operator)s %(value)s)'

agg_score = DBViewBuilder().query('%(agg)s(%(data_subtype)s)') \
  .query('median', 'percentile_cont(0.5) WITHIN GROUP (ORDER BY %(data_subtype)s)') \
  .query('boxplot', 'percentile_cont(ARRAY[0, 0.25, 0.5, 0.75, 1]) WITHIN GROUP (ORDER BY %(data_subtype)s)') \
  .replace('agg').replace('data_subtype').build()


def _create_common(result, prefix, table, primary, idtype):
  # lookup for the id and primary names the table
  result[prefix + '_items'] = DBViewBuilder().idtype(idtype).query("""
      SELECT {primary} as id, %(column)s AS text
      FROM {table} WHERE LOWER(%(column)s) LIKE :query AND species = :species
      ORDER BY %(column)s ASC LIMIT %(limit)s OFFSET %(offset)s""".format(table=table, primary=primary)) \
    .query('count', """
      SELECT COUNT(*) AS total_count
      FROM {table} WHERE LOWER(%(column)s) LIKE :query AND species = :species""".format(table=table)) \
    .replace("column").replace("limit").replace("offset") \
    .arg("query").arg('species').build()

  # lookup for unique / distinct categorical values in a table
  result[prefix + '_unique'] = DBViewBuilder().query("""
        SELECT s as id, s as text
        FROM (SELECT distinct %(column)s AS s
              FROM {table} WHERE LOWER(%(column)s) LIKE :query AND species = :species)
        ORDER BY %(column)s ASC LIMIT %(limit)s OFFSET %(offset)s""".format(table=table)) \
    .query('count', """
        SELECT COUNT(distinct %(column)s) AS total_count
        FROM {table} WHERE LOWER(%(column)s) LIKE :query AND species = :species""".format(table=table)) \
    .replace("column").replace("limit").replace("offset") \
    .arg("query").arg('species').build()
  # lookup for unique / distinct categorical values in a table
  result[prefix + '_unique_all'] = DBViewBuilder().query("""
        SELECT distinct %(column)s AS text
        FROM {table} WHERE species = :species AND %(column)s is not null
        ORDER BY %(column)s ASC""".format(table=table)) \
    .replace('column').arg('species').build()


def create_gene_score(result, other_prefix, other_primary):
  filter_panel = 'c.{primary} = ANY(SELECT {primary} FROM {base}.targid_panelassignment WHERE panel %(operator)s %(value)s)'.format(
    primary=other_primary, base=other_prefix)
  basename = 'gene_' + other_prefix

  result[basename + '_single_score'] = DBViewBuilder().idtype(idtype_gene).query("""
          SELECT D.ensg AS id, D.%(attribute)s AS score
          FROM {base}.targid_%(table)s D
          INNER JOIN {base}.targid_{base} C ON D.{primary} = C.{primary}
          WHERE C.species = :species AND C.{primary} = :name %(and_where)s""".format(primary=other_primary, base=other_prefix)) \
    .replace('table').replace('attribute') \
    .query('filter_panel_ensg', filter_gene_panel_no) \
    .replace('and_where').arg('name').arg('species').build()

  result[basename + '_frequency_score'] = DBViewBuilder().idtype(idtype_gene).query("""
           SELECT a.ensg AS id, (COALESCE(freq.count,0)+0.0) AS count, a.total
           FROM (
           SELECT COUNT(*) AS total, ensg
           FROM {base}.targid_%(table)s d
           INNER JOIN {base}.targid_{base} c ON c.{primary} = d.{primary}
           WHERE c.species = :species %(and_where)s
           GROUP BY ensg
           ) a
           LEFT JOIN (
           SELECT COUNT(*) AS count, ensg
           FROM {base}.targid_%(table)s d
           INNER JOIN {base}.targid_{base} c ON c.{primary} = d.{primary}
           WHERE c.species = :species %(and_where)s AND %(attribute)s %(operator)s :value
           GROUP BY ensg
           ) freq
           ON freq.ensg = a.ensg""".format(primary=other_primary, base=other_prefix)) \
    .replace("table").replace('and_where').replace("attribute").replace("operator") \
    .query('filter_panel', filter_panel) \
    .query('filter_panel_ensg', filter_gene_panel_no) \
    .query('filter_' + other_primary, 'c.'+ other_primary + ' %(operator)s %(value)s') \
    .arg("species").arg("value").build()

  result[basename + '_score'] = DBViewBuilder().idtype(idtype_gene).query("""
            SELECT D.ensg AS id, %(agg_score)s AS score
            FROM {base}.targid_%(table)s D
            INNER JOIN {base}.targid_{base} C ON D.{primary} = C.{primary}
            WHERE C.species = :species %(and_where)s
            GROUP BY D.ensg""".format(primary=other_primary, base=other_prefix)) \
    .query('filter_panel', filter_panel) \
    .query('filter_panel_ensg', filter_gene_panel_d) \
    .query('filter_' + other_primary, 'd.'+ other_primary + ' %(operator)s %(value)s') \
    .replace('table').replace('agg_score').replace('and_where').arg('species').build()


def create_sample(result, basename, idtype, primary):
  _create_common(result, basename, '{base}.targid_{base}'.format(base=basename), primary, idtype)
  index = 'row_number() OVER(ORDER BY c.{primary} ASC) as _index'.format(primary=primary)
  column_query = 'targidid as _id, c.{primary} as id, species, tumortype, organ, gender'.format(primary=primary)

  filter_panel = 'c.{primary} = ANY(SELECT {primary} FROM {base}.targid_panelassignment WHERE panel %(operator)s %(value)s)'.format(
    primary=primary, base=basename)
  filter_panel_d = 'd.{primary} = ANY(SELECT {primary} FROM {base}.targid_panelassignment WHERE panel %(operator)s %(value)s)'.format(
    primary=primary, base=basename)

  result[basename] = DBViewBuilder().idtype(idtype).column(primary, label='id', type='string') \
    .column('species', type='categorical') \
    .column('tumortype', type='categorical') \
    .column('organ', type='categorical') \
    .column('gender', type='categorical') \
    .query("""
      SELECT {index}, {columns}
      FROM {base}.targid_{base} c
      %(where)s
      ORDER BY {primary} ASC""".format(index=index, columns=column_query, base=basename, primary=primary)) \
    .query_categories("""
      SELECT distinct %(col)s as cat
      FROM {base}.targid_{base}
      WHERE %(col)s is not null""".format(base=basename)) \
    .replace('where').query('filter_panel', filter_panel) \
    .query('filter_' + primary, 'c.'+ primary + ' %(operator)s %(value)s') \
    .build()

  result[basename + '_panel'] = DBViewBuilder().query("""
  SELECT panel as id, paneldescription as description
  FROM {base}.targid_panel ORDER BY panel ASC""".format(base=basename)).build()

  co_expression = DBViewBuilder().idtype(idtype_gene).query("""
     SELECT c.targidid AS _id, a.ensg AS id, g.symbol, C.{primary} as samplename, a.%(attribute)s AS expression
        FROM {base}.targid_expression AS a
        INNER JOIN PUBLIC.targid_gene g ON a.ensg = g.ensg
        INNER JOIN {base}.targid_{base} C ON a.{primary} = C.{primary}
        WHERE a.ensg = :ensg %(and_where)s""".format(primary=primary, base=basename)).arg("ensg").replace('and_where').replace(
    "attribute") \
    .query('filter_panel', filter_panel) \
    .query('filter_' + primary, 'c.'+ primary + ' %(operator)s %(value)s') \
    .build()

  result[basename + '_co_expression'] = co_expression
  expression_vs_copynumber = DBViewBuilder().idtype(idtype_gene).query("""
   SELECT c.targidid AS _id, a.ensg AS id, g.symbol, c.{primary} as samplename, a.%(expression_subtype)s AS expression, b.%(copynumber_subtype)s AS cn
       FROM {base}.targid_expression AS a
       INNER JOIN {base}.targid_copynumber AS b ON a.ensg = b.ensg AND a.{primary} = b.{primary}
       INNER JOIN PUBLIC.targid_gene g ON a.ensg = g.ensg
       INNER JOIN {base}.targid_{base} C ON a.{primary} = C.{primary}
       WHERE a.ensg = :ensg %(and_where)s""".format(primary=primary, base=basename)).arg("ensg").replace('and_where').replace(
    "expression_subtype").replace("copynumber_subtype") \
    .query('filter_panel', filter_panel) \
    .query('filter_' + primary, 'c.'+ primary + ' %(operator)s %(value)s') \
    .build()

  result[basename + '_expression_vs_copynumber'] = expression_vs_copynumber

  onco_print = DBViewBuilder().idtype(idtype_gene).query("""
     SELECT g.targidid AS _id, d.ensg AS id, d.{primary} AS name, copynumberclass AS cn, D.tpm AS expr, D.aa_mutated, g.symbol
       FROM {base}.targid_data D
       INNER JOIN {base}.targid_{base} C ON D.{primary} = C.{primary}
       INNER JOIN PUBLIC.targid_gene g ON D.ensg = g.ensg
       WHERE D.ensg = :ensg AND C.species = :species %(and_where)s""".format(primary=primary, base=basename)).arg(
    "ensg").arg("species").replace('and_where') \
    .query('filter_panel', filter_panel) \
    .query('filter_' + primary, 'c.'+ primary + ' %(operator)s %(value)s') \
    .query('filter_ensg', 'd.ensg %(operator)s %(value)s') \
    .build()

  result[basename + '_onco_print'] = onco_print

  onco_print_sample_list = DBViewBuilder().idtype(idtype).query("""
       SELECT C.targidid AS _id, C.{primary} AS id
     FROM {base}.targid_{base} C
     WHERE C.species = :species %(and_where)s""".format(primary=primary, base=basename)).arg("species").replace('and_where') \
    .query('filter_panel', filter_panel) \
    .query('filter_' + primary, 'c.'+ primary + ' %(operator)s %(value)s') \
    .build()

  result[basename + '_onco_print_sample_list'] = onco_print_sample_list


  result[basename + '_gene_single_score'] = DBViewBuilder().idtype(idtype).query("""
        SELECT D.{primary} AS id, D.%(attribute)s AS score
        FROM {base}.targid_%(table)s D
        INNER JOIN public.targid_gene g ON D.ensg = g.ensg
       INNER JOIN {base}.targid_{base} C ON d.{primary} = C.{primary}
        WHERE g.species = :species AND g.ensg = :name %(and_where)s""".format(primary=primary, base=basename)) \
    .replace('table').replace('attribute').replace('and_where').arg('name').arg('species')\
    .query('filter_panel', filter_panel) \
    .query('filter_panel_' + primary, filter_panel) \
    .query('filter_' + primary, 'c.'+ primary + ' %(operator)s %(value)s') \
    .build()

  result[basename + '_gene_frequency_score'] = DBViewBuilder().idtype(idtype).query("""
         SELECT a.{primary} AS id, (COALESCE(freq.count,0)+0.0) AS count, a.total
         FROM (
         SELECT COUNT(*) AS total, d.{primary}
         FROM {base}.targid_%(table)s d
         INNER JOIN public.targid_gene g ON g.ensg = d.ensg
         WHERE g.species = :species %(and_where)s
         GROUP BY d.{primary}
         ) a
         LEFT JOIN (
         SELECT COUNT(*) AS count, d.{primary}
         FROM {base}.targid_%(table)s d
         INNER JOIN PUBLIC.targid_gene g ON g.ensg = d.ensg
         WHERE g.species = :species %(and_where)s AND %(attribute)s %(operator)s :value
         GROUP BY d.{primary}
         ) freq
         ON freq.{primary} = a.{primary}""".format(primary=primary, base=basename)) \
    .replace("table").replace('and_where').replace("attribute").replace("operator") \
    .query('filter_panel', filter_gene_panel) \
    .query('filter_panel_' + primary, filter_panel_d) \
    .query('filter_' + primary, 'd.' + primary + ' %(operator)s %(value)s') \
    .query('filter_ensg', 'g.ensg %(operator)s %(value)s') \
    .arg("species").arg("value").build()

  result[basename + '_gene_score'] = DBViewBuilder().idtype(idtype).query("""
          SELECT D.{primary} AS id, %(agg_score)s AS score
          FROM {base}.targid_%(table)s D
          INNER JOIN public.targid_gene C ON D.ensg = C.ensg
          WHERE C.species = :species %(and_where)s
          GROUP BY D.{primary}""".format(primary=primary, base=basename)) \
    .query('filter_panel', filter_gene_panel) \
    .query('filter_panel_' + primary, filter_panel_d) \
    .query('filter_' + primary, 'd.' + primary + ' %(operator)s %(value)s') \
    .query('filter_ensg', 'c.ensg %(operator)s %(value)s') \
    .replace('table').replace('agg_score').replace('and_where').arg('species').build()

  result[basename + '_check_ids'] = DBViewBuilder().query("""
    SELECT COUNT(*) AS matches FROM {base}.targid_{base} %(where)s
  """.format(primary=primary, base=basename)).replace('where').build()

  result[basename + '_all_columns'] = DBViewBuilder().query("""
    SELECT {primary} as id, * FROM {base}.targid_{base} %(where)s
  """.format(base=basename, primary=primary)).replace('where').build()



views = dict(
  gene=DBViewBuilder().idtype(idtype_gene).query("""
  SELECT {index}, {columns}
  FROM public.targid_gene t
  %(where)s
  ORDER BY t.symbol ASC""".format(index=_index_gene, columns=_column_query_gene))
    .query_stats("""
  SELECT min(strand) AS strand_min, max(strand) AS strand_max, min(seqregionstart) AS seqregionstart_min, max(seqregionstart) AS seqregionstart_max,
    min(seqregionend) AS seqregionend_min, max(seqregionend) AS seqregionend_max FROM public.targid_gene""")
    .query_categories("""
  SELECT DISTINCT %(col)s AS cat FROM PUBLIC.targid_gene
  WHERE %(col)s IS NOT NULL""".format(base='gene'))
    .column(_primary_gene, label='id', type='string')
    .column('symbol', type='string')
    .column('species', type='categorical')
    .column('chromosome', type='string')
    .column('strand', type='number')
    .column('biotype', type='categorical')
    .column('seqregionstart', type='number')
    .column('seqregionend', type='number')
    .replace('where')
    .query('filter_panel', 'ensg = ANY(SELECT ensg FROM public.targid_geneassignment WHERE genesetname %(operator)s %(value)s)')
    .build(),
  gene_panel=DBViewBuilder().query("""
    SELECT genesetname AS id, species AS description FROM public.targid_geneset ORDER BY genesetname ASC""")
    .build(),

  gene_gene_items=DBViewBuilder().idtype(idtype_gene).query("""
      SELECT ensg as id, symbol AS text
      FROM public.targid_gene WHERE (LOWER(symbol) LIKE :query OR LOWER(ensg) LIKE :query) AND species = :species
      ORDER BY ensg ASC LIMIT %(limit)s OFFSET %(offset)s""") \
    .query('count', """
      SELECT COUNT(*) AS total_count
      FROM public.targid_gene WHERE (LOWER(symbol) LIKE :query OR LOWER(ensg) LIKE :query) AND species = :species""") \
    .replace("limit").replace("offset") \
    .arg("query").arg('species').build(),

  gene_map_ensgs=DBViewBuilder().idtype(idtype_gene).query("""
    SELECT targidid AS _id, ensg AS id, symbol
    FROM public.targid_gene WHERE ensg IN (%(ensgs)s) AND species = :species
    ORDER BY symbol ASC""")
    .arg('species')
    .replace('ensgs')
    .build(),

  gene_all_columns=DBViewBuilder().query("""
    SELECT symbol as id, * FROM public.targid_gene %(where)s
  """).replace('where').build()
)
_create_common(views, 'gene', 'public.targid_gene', _primary_gene, idtype_gene)
create_gene_score(views, 'cellline', _primary_cellline)
create_gene_score(views, 'tissue', _primary_tissue)
create_sample(views, 'cellline', idtype_celline, _primary_cellline)
create_sample(views, 'tissue', idtype_tissue, _primary_tissue)


def create():
  return DBConnector(agg_score, views)
