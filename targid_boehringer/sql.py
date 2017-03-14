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
_column_query_gene = 'targidid as _id, t.ensg as id, symbol, species, chromosome, strand, biotype, seqregionstart, seqregionend'

agg_score = DBViewBuilder().query('%(agg)s(%(data_subtype)s)') \
    .query('median', 'percentile_cont(0.5) WITHIN GROUP (ORDER BY %(data_subtype)s)') \
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
        FROM {table} WHERE species = :species
        ORDER BY %(column)s ASC""".format(table=table)) \
    .replace('column').arg('species').build()

def create_sample(result, basename, idtype, primary):
  _create_common(result, basename, '{base}.targid_{base}'.format(base=basename), primary, idtype)
  index = 'row_number() OVER(ORDER BY t.{primary} ASC) as _index'.format(primary=primary)
  column_query = 'targidid as _id, t.{primary} as id, species, tumortype, organ, gender'.format(primary=primary)

  result[basename] = DBViewBuilder().idtype(idtype).column(primary, label='id', type='string')\
   .column('species', type='categorical') \
    .column('tumortype', type='categorical') \
    .column('organ', type='categorical') \
    .column('gender', type='categorical') \
    .query("""
      SELECT {index}, {columns}
      FROM {base}.targid_{base} t
      ORDER BY celllinename ASC""".format(index=index, columns=column_query, base=basename)) \
    .query_categories("""
      SELECT distinct %(col)s as cat
      FROM {base}.targid_{base}
      WHERE %(col)s is not null AND %(col)s <> ''""".format(base=basename)).build()

  result[basename + '_panel'] = DBViewBuilder().query("""
  SELECT panel as id, paneldescription as description
  FROM {base}.targid_panel ORDER BY panel ASC""".format(base=basename)).build()

  result[basename + '_filtered'] = DBViewBuilder().idtype(idtype).query("""
  SELECT {index}, {columns}
  FROM {base}.targid_{base} t
  WHERE species = :species""".format(index=index, columns=column_query, base=basename)).arg('species').build()

  result[basename + '_filtered_namedset'] = DBViewBuilder().idtype(idtype).query("""
  SELECT {index}, {columns}
  FROM {base}.targid_{base} t
  WHERE targidid IN (%(ids)s)""".format(index=index, columns=column_query, base=basename)).replace('ids').build()

  result[basename + '_filtered_panel'] = DBViewBuilder().idtype(idtype).query("""
  SELECT {index}, {columns}
  FROM {base}.targid_panelassignment s JOIN {base}.targid_{base} t ON s.{primary} = t.{primary}
  WHERE s.panel = :panel""".format(index=index, columns=column_query, base=basename, primary=primary)).arg('panel').build()


  co_expression = DBViewBuilder().idtype(idtype_gene).query("""
     SELECT c.targidid AS _id, a.ensg AS id, g.symbol, C.{primary} as samplename, a.%(expression_subtype)s AS expression
        FROM {base}.targid_expression AS a
        INNER JOIN PUBLIC.targid_gene g ON a.ensg = g.ensg
        INNER JOIN {base}.targid_{base} C ON a.{primary} = C.{primary}
        WHERE a.ensg = :ensg""".format(primary=primary, base=basename)).arg("ensg").replace("expression_subtype").build()

  result[basename + '_co_expression_all'] = co_expression
  result[basename + '_co_expression'] = DBViewBuilder().clone(co_expression) \
    .append(' AND c.tumortype = :tumortype').arg("tumortype").build()

  expression_vs_copynumber = DBViewBuilder().idtype(idtype_gene).query("""
   SELECT c.targidid AS _id, a.ensg AS id, g.symbol, c.{primary} as samplename, a.%(expression_subtype)s AS expression, b.%(copynumber_subtype)s AS cn
       FROM {base}.targid_expression AS a
       INNER JOIN {base}.targid_copynumber AS b ON a.ensg = b.ensg AND a.{primary} = b.{primary}
       INNER JOIN PUBLIC.targid_gene g ON a.ensg = g.ensg
       INNER JOIN {base}.targid_{base} C ON a.{primary} = C.{primary}
       WHERE a.ensg = :ensg""".format(primary=primary, base=basename)).arg("ensg").replace("expression_subtype").replace("copynumber_subtype").build()

  result[basename + '_expression_vs_copynumber_all'] = expression_vs_copynumber
  result[basename + '_expression_vs_copynumber'] = DBViewBuilder().clone(expression_vs_copynumber)\
    .append(' AND C.tumortype = :tumortype').arg("tumortype").build()

  onco_print = DBViewBuilder().idtype(idtype_gene).query("""
     SELECT g.targidid AS _id, d.ensg AS id, d.{primary} AS name, copynumberclass AS cn, D.tpm AS expr, D.aa_mutated, g.symbol
       FROM {base}.targid_data D
       INNER JOIN {base}.targid_{base} C ON D.{primary} = C.{primary}
       INNER JOIN PUBLIC.targid_gene g ON D.ensg = g.ensg
       WHERE D.ensg IN (%(ensgs)s) AND C.species = :species""".format(primary=primary, base=basename)).replace("ensgs").arg("species").build()

  result[basename + '_onco_print_all'] = onco_print
  result[basename + '_onco_print'] = DBViewBuilder().clone(onco_print) \
    .append(' AND C.tumortype = :tumortype').arg("tumortype").build()

  onco_print_sample_list = DBViewBuilder().idtype(idtype).query("""
       SELECT C.targidid AS _id, C.{primary} AS id
     FROM {base}.targid_{base} C
     WHERE C.species = :species""".format(primary=primary, base=basename)).arg("species").build()

  result[basename + '_onco_print_sample_list_all'] = onco_print_sample_list
  result[basename + '_onco_print_sample_list'] = DBViewBuilder().clone(onco_print_sample_list) \
    .append(' AND C.tumortype = :tumortype').arg("tumortype").build()


  result[basename + '_single_score'] = DBViewBuilder().idtype(idtype).query("""
        SELECT D.{primary} AS id, D.%(attribute)s AS score
        FROM {base}.targid_%(table)s D
        INNER JOIN public.targid_gene C ON D.ensg = C.ensg
        WHERE C.species = :species AND ensg = :name""".format(primary=primary, base=basename)) \
    .replace('table').replace('attribute').arg('name').arg('species').build()

  result[basename + '_frequency_score'] = DBViewBuilder().idtype(idtype).query("""
         SELECT a.{primary} AS id, (COALESCE(freq.count,0)+0.0) AS count, a.total
         FROM (
         SELECT COUNT(*) AS total, {primary}
         FROM {base}.targid_%(table)s m
         INNER JOIN public.targid_gene g ON g.ensg = m.ensg
         WHERE g.species = :species %{and_where}s
         GROUP BY {primary}
         ) a
         LEFT JOIN (
         SELECT COUNT(*) AS count, {primary}
         FROM {base}.targid_%(table)s M
         INNER JOIN PUBLIC.targid_gene g ON g.ensg = M.ensg
         WHERE g.species = :species %{and_where}s AND %(attribute)s %(operator)s :value AND
         GROUP BY {primary}
         ) freq
         ON freq.{primary} = a.{primary}""") \
    .replace("table").replace('and_where').replace("attribute").replace("operator") \
    .arg("species").arg("value").build()

  result[basename + '_mutation_frequency_score'] = DBViewBuilder().idtype(idtype).query("""
         SELECT a.{primary} AS id, (COALESCE(freq.count,0)+0.0) AS count, a.total
         FROM (
         SELECT COUNT(*) AS total, {primary}
         FROM {base}.targid_mutation m
         INNER JOIN public.targid_gene g ON g.ensg = m.ensg
         WHERE g.species = :species %{and_where}s
         GROUP BY {primary}
         ) a
         LEFT JOIN (
         SELECT COUNT(*) AS count, {primary}
         FROM {base}.targid_mutation M
         INNER JOIN PUBLIC.targid_gene g ON g.ensg = M.ensg
         WHERE g.species = :species %{and_where}s AND %(attribute)s = 'true' AND
         GROUP BY {primary}
         ) freq
         ON freq.{primary} = a.{primary}""") \
    .replace('and_where').replace("attribute").arg("species").build()

  result[basename + '_score'] = DBViewBuilder().idtype(idtype).query("""
          SELECT D.{primary} AS id, %(agg_score)s AS score
          FROM {base}.targid_%(table)s D
          INNER JOIN public.targid_gene C ON D.ensg = C.ensg
          WHERE C.species = :species %(and_where)s
          GROUP BY D.{primary}""".format(primary=primary, base=basename)) \
    .replace('table').replace('agg_score').replace('and_where').arg('species').build()


views = dict(
  gene=DBViewBuilder().idtype(idtype_gene).query("""
  SELECT {index}, {columns}
  FROM public.targid_gene t
  ORDER BY t.symbol ASC""".format(index=_index_gene, columns=_column_query_gene))
    .query_stats("""
  SELECT min(strand) AS strand_min, max(strand) AS strand_max, min(seqregionstart) AS seqregionstart_min, max(seqregionstart) AS seqregionstart_max,
    min(seqregionend) AS seqregionend_min, max(seqregionend) AS seqregionend_max FROM public.targid_gene""")
    .query_categories("""
  SELECT DISTINCT %(col)s AS cat FROM PUBLIC.targid_gene
  WHERE %(col)s IS NOT NULL AND %(col)s <> ''""".format(base='gene'))
    .column(_primary_gene, label='id', type='string')
    .column('symbol', type='string')
    .column('species', type='categorical')
    .column('chromosome', type='string')
    .column('strand', type='number')
    .column('biotype', type='categorical')
    .column('seqregionstart', type='number')
    .column('seqregionend', type='number')
    .build(),
  gene_panel=DBViewBuilder().query("""
    SELECT genesetname AS id, species AS description FROM public.targid_geneset ORDER BY genesetname ASC""")
    .build(),
  gene_filtered=DBViewBuilder().idtype(idtype_gene).query("""
    SELECT {index}, {columns}
    FROM public.targid_gene t
    WHERE species = :species""".format(index=_index_gene, columns=_column_query_gene))
    .arg('species')
    .build(),

  genes_by_names=DBViewBuilder().idtype(idtype_gene).query("""
    SELECT {index}, {columns}
    FROM public.targid_gene t
    WHERE species = :species AND %(entity_name)s IN (%(entities)s) """.format(index=_index_gene, columns=_column_query_gene))
    .replace('entity_name').replace('entities').arg('species')
    .build(),

  gene_filtered_namedset=DBViewBuilder().idtype(idtype_gene).query("""
    SELECT {index}, {columns}
    FROM public.targid_gene t
    WHERE targidid IN (%(ids)s)""".format(index=_index_gene, columns=_column_query_gene))
    .replace('ids')
    .build(),

  gene_filtered_panel=DBViewBuilder().idtype(idtype_gene).query("""
    SELECT {index}, {columns}
    FROM public.targid_geneassignment s JOIN public.targid_gene t ON s.ensg = t.ensg
    WHERE s.genesetname = :panel""".format(index=_index_gene, columns=_column_query_gene))
    .arg('panel')
    .build(),

  gene_map_ensgs=DBViewBuilder().idtype(idtype_gene).query("""
    SELECT targidid AS _id, ensg AS id, symbol
    FROM public.targid_gene WHERE ensg IN (%(ensgs)s) AND species = :species
    ORDER BY symbol ASC""")
    .arg('species')
    .replace('ensgs')
    .build(),

  enrichment=DBViewBuilder().idtype(idtype_gene).query("""
    SELECT cn.targidid AS _id, cn.ensg AS id, symbol, 2*pow(2, max(cnv)) AS score
    FROM %(schema)s.targid_copynumber copynumberclass
    JOIN PUBLIC.targid_gene g ON g.ensg = cn.ensg
    WHERE cnv > (
      SELECT max(cnv) FROM %(schema)s.targid_copynumber ab
      INNER JOIN %(schema)s.targid_%(table_name)s b ON b.%(entity_name)s = ab.%(entity_name)s
        WHERE ab.cn = :cn AND b.tumortype = :tumortype AND ab.ensg = :ensg
      )
    GROUP BY cn.ensg, symbol""")
    .arg('ensg').arg('cn').arg('tumortype')
    .replace('schema').replace('table_name').replace('entity_name')
    .build(),

  enrichment_all=DBViewBuilder().idtype(idtype_gene).query("""
    SELECT cn.targidid AS _id, cn.ensg AS id, symbol, 2*pow(2, max(cnv)) AS score
    FROM %(schema)s.targid_copynumber copynumberclass
    JOIN PUBLIC.targid_gene g ON g.ensg = cn.ensg
    WHERE cnv > (
    SELECT max(cnv) FROM %(schema)s.targid_copynumber ab
    INNER JOIN %(schema)s.targid_%(table_name)s b ON b.%(entity_name)s = ab.%(entity_name)s
    WHERE ab.cn = :cn AND ab.ensg = :ensg
    ) GROUP BY cn.ensg, symbol""")
    .arg('ensg').arg('cn')
    .replace('schema').replace('table_name').replace('entity_name')
    .build(),


  row=DBViewBuilder().idtype(idtype_tissue).query("""
     SELECT b.targidid AS _id, b.%(entity_name)s AS id, *
     FROM %(schema)s.targid_%(table_name)s b
     WHERE b.%(entity_name)s IN (%(entities)s)""")
    .replace("schema").replace("table_name").replace("entity_name").replace("entities")
    .build(),

  raw_data_table=DBViewBuilder().idtype(idtype_tissue).query("""
       SELECT b.targidid AS _id, b.%(entity_name)s AS id, b.species, b.organ, b.tumortype, b.gender
       FROM %(schema)s.targid_%(schema)s b
       WHERE b.tumortype = :tumortype AND b.species = :species""")
    .replace("schema").replace("table_name").replace("entity_name").replace("data_subtype")
    .arg("tumortype").arg("species")
    .build(),

  raw_data_table_all=DBViewBuilder().idtype(idtype_tissue).query("""
     SELECT b.targidid AS _id, b.%(entity_name)s AS id, b.species, b.organ, b.tumortype, b.gender
     FROM %(schema)s.targid_%(schema)s b
     WHERE b.species = :species""")
    .replace("schema").replace("table_name").replace("entity_name").replace("data_subtype")
    .arg("species")
    .build(),

  raw_data_table_column=DBViewBuilder().idtype(idtype_tissue).query("""
     SELECT b.targidid AS _id, b.%(entity_name)s AS id, %(data_subtype)s AS score
     FROM %(schema)s.targid_%(schema)s b
     INNER JOIN %(schema)s.targid_%(table_name)s ab ON b.%(entity_name)s = ab.%(entity_name)s
     WHERE ab.ensg = :ensg""")
    .replace("schema").replace("table_name").replace("entity_name").replace("data_subtype")
    .arg("ensg")
    .build(),

  raw_data_table_inverted=DBViewBuilder().idtype(idtype_gene).query("""
     SELECT b.targidid AS _id, b.ensg AS id, b.symbol, b.species, b.strand, b.chromosome, b.biotype, b.seqregionstart, b.seqregionend
     FROM public.targid_gene b
     WHERE b.biotype = :biotype AND b.species = :species""")
    .replace("schema").replace("table_name").replace("entity_name").replace("data_subtype")
    .arg("biotype").arg("species")
    .build(),

  raw_data_table_inverted_all=DBViewBuilder().idtype(idtype_gene).query("""
     SELECT b.targidid AS _id, b.ensg AS id, b.symbol, b.species, b.strand, b.chromosome, b.biotype, b.seqregionstart, b.seqregionend
     FROM public.targid_gene b
     WHERE b.species = :species""")
    .replace("schema").replace("table_name").replace("entity_name").replace("data_subtype")
    .arg("species")
    .build(),

  raw_data_table_inverted_column=DBViewBuilder().idtype(idtype_gene).query("""
     SELECT b.targidid AS _id, b.ensg AS id, %(data_subtype)s AS score
     FROM PUBLIC.targid_gene b
     INNER JOIN %(schema)s.targid_%(table_name)s ab ON ab.ensg = b.ensg
     WHERE ab.%(entity_name)s = :entity_value""")
    .replace("schema").replace("table_name").replace("entity_name").replace("data_subtype")
    .arg("entity_value")
    .build(),

  aggregated_score=DBViewBuilder().idtype(idtype_gene).query("""
     SELECT ensg AS id, %(agg_score)s AS score
     FROM %(schema)s.targid_%(table_name)s
     WHERE %(entity_name)s = ANY(ARRAY(SELECT %(entity_name)s FROM %(schema)s.targid_%(schema)s WHERE tumortype = :tumortype AND species = :species))
     GROUP BY ensg""")
    .replace("schema").replace("entity_name").replace("table_name").replace("data_subtype").replace("agg").replace("agg_score")
    .arg("tumortype").arg("species")
    .build(),

  aggregated_score_panel=DBViewBuilder().idtype(idtype_gene).query("""
     SELECT ensg AS id, %(agg_score)s AS score
     FROM %(schema)s.targid_%(table_name)s
     WHERE %(entity_name)s = ANY(ARRAY(SELECT %(entity_name)s FROM %(schema)s.targid_panelassignment WHERE panel = :panel))
     GROUP BY ensg""")
    .replace("schema").replace("entity_name").replace("table_name").replace("data_subtype").replace("agg").replace("agg_score")
    .arg("panel")
    .build(),

  aggregated_score_all=DBViewBuilder().idtype(idtype_gene).query("""
     SELECT ensg AS id, %(agg_score)s AS score
     FROM %(schema)s.targid_%(table_name)s
     WHERE %(entity_name)s = ANY(ARRAY(SELECT %(entity_name)s FROM %(schema)s.targid_%(schema)s WHERE species = :species))
     GROUP BY ensg""")
    .replace("schema").replace("entity_name").replace("table_name").replace("data_subtype").replace("agg").replace("agg_score")
    .arg("species")
    .build(),

  aggregated_score_boxplot=DBViewBuilder().idtype(idtype_gene).query("""
     SELECT ensg AS id, min(%(data_subtype)s) AS MIN, max(%(data_subtype)s) AS max,
     percentile_cont(0.5) WITHIN GROUP (ORDER BY %(data_subtype)s) AS median,
     percentile_cont(0.25) WITHIN GROUP (ORDER BY %(data_subtype)s) AS q1,
     percentile_cont(0.75) WITHIN GROUP (ORDER BY %(data_subtype)s) AS q3
     FROM %(schema)s.targid_%(table_name)s
     WHERE %(entity_name)s = ANY(ARRAY(SELECT %(entity_name)s FROM %(schema)s.targid_%(schema)s WHERE tumortype = :tumortype AND species = :species))
     GROUP BY ensg""")
    .replace("schema").replace("entity_name").replace("table_name").replace("data_subtype").replace("agg").replace("agg_score")
    .arg("tumortype").arg("species")
    .build(),

  aggregated_score_boxplot_all=DBViewBuilder().idtype(idtype_gene).query("""
     SELECT ensg AS id, min(%(data_subtype)s) AS MIN, max(%(data_subtype)s) AS max,
     percentile_cont(0.5) WITHIN GROUP (ORDER BY %(data_subtype)s) AS median,
     percentile_cont(0.25) WITHIN GROUP (ORDER BY %(data_subtype)s) AS q1,
     percentile_cont(0.75) WITHIN GROUP (ORDER BY %(data_subtype)s) AS q3
     FROM %(schema)s.targid_%(table_name)s
     WHERE %(entity_name)s = ANY(ARRAY(SELECT %(entity_name)s FROM %(schema)s.targid_%(schema)s WHERE species = :species))
     GROUP BY ensg""")
    .replace("schema").replace("entity_name").replace("table_name").replace("data_subtype").replace("agg").replace("agg_score")
    .arg("species")
    .build(),

  aggregated_score_boxplot_panel=DBViewBuilder().idtype(idtype_gene).query("""
     SELECT ensg AS id, min(%(data_subtype)s) AS MIN, max(%(data_subtype)s) AS max,
     percentile_cont(0.5) WITHIN GROUP (ORDER BY %(data_subtype)s) AS median,
     percentile_cont(0.25) WITHIN GROUP (ORDER BY %(data_subtype)s) AS q1,
     percentile_cont(0.75) WITHIN GROUP (ORDER BY %(data_subtype)s) AS q3
     FROM %(schema)s.targid_%(table_name)s
     WHERE %(entity_name)s = ANY(ARRAY(SELECT %(entity_name)s FROM %(schema)s.targid_panelassignment WHERE panel = :panel))
     GROUP BY ensg""")
    .replace("schema").replace("entity_name").replace("table_name").replace("data_subtype").replace("agg").replace("agg_score")
    .arg("panel")
    .build(),


  aggregated_score_inverted_all=DBViewBuilder().idtype(idtype_tissue).query("""
     SELECT %(entity_name)s AS id, %(agg_score)s AS score
     FROM %(schema)s.targid_%(table_name)s ab
     INNER JOIN PUBLIC.targid_gene b ON b.ensg = ab.ensg
     WHERE b.species = :species
     GROUP BY ab.%(entity_name)s""")
    .replace("schema").replace("entity_name").replace("table_name").replace("data_subtype").replace("agg").replace("agg_score")
    .arg("species")
    .build(),

  frequency_score=DBViewBuilder().idtype(idtype_gene).query("""
       SELECT a.ensg AS id, (coalesce(freq.count,0)+0.0) AS count, a.total
       FROM (
       SELECT COUNT(*) AS total, ensg
       FROM %(schema)s.targid_%(table_name)s M
       INNER JOIN %(schema)s.targid_%(schema)s C ON C.%(entity_name)s = M.%(entity_name)s
       WHERE C.tumortype = :tumortype AND C.species = :species
       GROUP BY ensg
       ) a
       LEFT JOIN (
       SELECT COUNT(*) AS count, ensg
       FROM %(schema)s.targid_%(table_name)s M
       INNER JOIN %(schema)s.targid_%(schema)s C ON C.%(entity_name)s = M.%(entity_name)s
       WHERE C.tumortype = :tumortype AND %(data_subtype)s %(operator)s %(value)s AND C.species = :species
       GROUP BY ensg
       ) freq
       ON freq.ensg = a.ensg""")
    .arg("tumortype").arg("species")
    .replace("schema").replace("entity_name").replace("table_name").replace("data_subtype").replace("operator").replace("value")
    .build(),

  frequency_score_all=DBViewBuilder().idtype(idtype_gene).query("""
       SELECT a.ensg AS id, (coalesce(freq.count,0)+0.0) AS count, a.total
       FROM (
       SELECT COUNT(*) AS total, ensg
       FROM %(schema)s.targid_%(table_name)s M
       INNER JOIN %(schema)s.targid_%(schema)s C ON C.%(entity_name)s = M.%(entity_name)s
       WHERE C.species = :species
       GROUP BY ensg
       ) a
       LEFT JOIN (
       SELECT COUNT(*) AS count, ensg
       FROM %(schema)s.targid_%(table_name)s  M
       INNER JOIN %(schema)s.targid_%(schema)s C ON C.%(entity_name)s = M.%(entity_name)s
       WHERE %(data_subtype)s %(operator)s %(value)s AND C.species = :species
       GROUP BY ensg
       ) freq
       ON freq.ensg = a.ensg""")
    .arg("species")
    .replace("schema").replace("entity_name").replace("table_name").replace("data_subtype").replace("operator").replace("value")
    .build(),

  frequency_score_inverted=DBViewBuilder().idtype(idtype_tissue).query("""
       SELECT a.%(entity_name)s AS id, (COALESCE(freq.count,0)+0.0) AS count, a.total
       FROM (
       SELECT COUNT(*) AS total, %(entity_name)s
       FROM %(schema)s.targid_%(table_name)s M
       INNER JOIN PUBLIC.targid_gene g ON g.ensg = M.ensg
       WHERE g.biotype = :biotype AND g.species = :species
       GROUP BY %(entity_name)s
       ) a
       LEFT JOIN (
       SELECT COUNT(*) AS count, %(entity_name)s
       FROM %(schema)s.targid_%(table_name)s M
       INNER JOIN PUBLIC.targid_gene g ON g.ensg = M.ensg
       WHERE g.biotype = :biotype AND %(data_subtype)s %(operator)s %(value)s AND g.species = :species
       GROUP BY %(entity_name)s
       ) freq
       ON freq.%(entity_name)s = a.%(entity_name)s""")
    .arg("biotype").arg("species")
    .replace("schema").replace("entity_name").replace("table_name").replace("data_subtype").replace("operator").replace("value")
    .build(),

  frequency_score_inverted_all=DBViewBuilder().idtype(idtype_tissue).query("""
       SELECT a.%(entity_name)s AS id, (COALESCE(freq.count,0)+0.0) AS count, a.total
       FROM (
         SELECT COUNT(*) AS total, %(entity_name)s
         FROM %(schema)s.targid_%(table_name)s M
         INNER JOIN PUBLIC.targid_gene g ON g.ensg = M.ensg
         WHERE g.species = :species
         GROUP BY %(entity_name)s
       ) a
       LEFT JOIN (
         SELECT COUNT(*) AS count, %(entity_name)s
         FROM %(schema)s.targid_%(table_name)s M
         INNER JOIN PUBLIC.targid_gene g ON g.ensg = M.ensg
         WHERE %(data_subtype)s %(operator)s %(value)s AND g.species = :species
         GROUP BY %(entity_name)s
       ) freq
       ON freq.%(entity_name)s = a.%(entity_name)s""")
    .arg("species")
    .replace("schema").replace("entity_name").replace("table_name").replace("data_subtype").replace("operator").replace("value")
    .build(),

  mutation_frequency=DBViewBuilder().idtype(idtype_gene).query("""
       SELECT a.ensg AS id, (coalesce(mut.mutated,0)+0.0) AS count, a.total
       FROM (
         SELECT COUNT(*) AS total, ensg
         FROM %(schema)s.targid_mutation M
         INNER JOIN %(schema)s.targid_%(schema)s C ON C.%(entity_name)s = M.%(entity_name)s
         WHERE C.tumortype = :tumortype AND C.species = :species
         GROUP BY ensg
       ) a
       LEFT JOIN (
         SELECT COUNT(*) AS mutated, ensg
         FROM %(schema)s.targid_mutation M
         INNER JOIN %(schema)s.targid_%(schema)s C ON C.%(entity_name)s = M.%(entity_name)s
         WHERE C.tumortype = :tumortype AND %(data_subtype)s = 'true' AND C.species = :species
         GROUP BY ensg
       ) mut
       ON mut.ensg = a.ensg""")
    .arg("tumortype").arg("species")
    .replace("schema").replace("entity_name").replace("data_subtype")
    .build(),

  mutation_frequency_all=DBViewBuilder().idtype(idtype_gene).query("""
       SELECT a.ensg AS id, (coalesce(mut.mutated,0)+0.0) AS count, a.total
       FROM (
         SELECT COUNT(*) AS total, ensg
         FROM %(schema)s.targid_mutation M
         INNER JOIN %(schema)s.targid_%(schema)s C ON C.%(entity_name)s = M.%(entity_name)s
         WHERE C.species = :species
         GROUP BY ensg
       ) a
       LEFT JOIN (
         SELECT COUNT(*) AS mutated, ensg
         FROM %(schema)s.targid_mutation M
         INNER JOIN %(schema)s.targid_%(schema)s C ON C.%(entity_name)s = M.%(entity_name)s
         WHERE %(data_subtype)s = 'true' AND C.species = :species
         GROUP BY ensg
       ) mut
       ON mut.ensg = a.ensg""")
    .arg("species")
    .replace("schema").replace("entity_name").replace("data_subtype")
    .build(),

  mutation_frequency_inverted=DBViewBuilder().idtype(idtype_gene).query("""
     SELECT a.%(entity_name)s AS id, (COALESCE(mut.mutated,0)+0.0) AS count, a.total
     FROM (
     SELECT COUNT(*) AS total, %(entity_name)s
     FROM %(schema)s.targid_mutation M
     INNER JOIN PUBLIC.targid_gene g ON g.ensg = M.ensg
     WHERE g.biotype = :biotype AND g.species = :species
     GROUP BY %(entity_name)s
     ) a
     LEFT JOIN (
     SELECT COUNT(*) AS mutated, %(entity_name)s
     FROM %(schema)s.targid_mutation M
     INNER JOIN PUBLIC.targid_gene g ON g.ensg = M.ensg
     WHERE g.biotype = :biotype AND %(data_subtype)s = 'true' AND g.species = :species
     GROUP BY %(entity_name)s
     ) mut
     ON mut.%(entity_name)s = a.%(entity_name)s""")
    .arg("biotype").arg("species")
    .replace("schema").replace("entity_name").replace("data_subtype")
    .build(),

  mutation_frequency_inverted_all=DBViewBuilder().idtype(idtype_gene).query("""
      SELECT a.%(entity_name)s AS id, (COALESCE(mut.mutated,0)+0.0) AS count, a.total
      FROM (
      SELECT COUNT(*) AS total, %(entity_name)s
      FROM %(schema)s.targid_mutation M
      INNER JOIN PUBLIC.targid_gene g ON g.ensg = M.ensg
      WHERE g.species = :species
      GROUP BY %(entity_name)s
      ) a
      LEFT JOIN (
      SELECT COUNT(*) AS mutated, %(entity_name)s
      FROM %(schema)s.targid_mutation M
      INNER JOIN public.targid_gene g ON g.ensg = M.ensg
      WHERE %(data_subtype)s = 'true' AND g.species = :species
      GROUP BY %(entity_name)s
      ) mut
      ON mut.%(entity_name)s = a.%(entity_name)s""")
    .arg("species")
    .replace("schema").replace("entity_name").replace("data_subtype")
    .build(),

  single_entity_lookup=DBViewBuilder().idtype(idtype_tissue).query("""
      SELECT targidid AS _id, %(id_column)s AS id, %(query_column)s AS TEXT
      FROM %(schema)s.targid_%(table_name)s WHERE species = :species AND LOWER(%(query_column)s) LIKE :query
      ORDER BY %(query_column)s ASC LIMIT %(limit)s OFFSET %(offset)s""")
    .query('count', """
      SELECT COUNT(*) AS total_count
      FROM %(schema)s.targid_%(table_name)s
      WHERE species = :species AND LOWER(%(query_column)s) LIKE :query""")
    .replace("schema").replace("table_name").replace("query_column").replace("id_column").replace("limit").replace("offset")
    .arg("query").arg("species")
    .build(),

  check_id_types=DBViewBuilder().query("""
    SELECT COUNT(*) AS matches FROM %(schema)s.targid_%(table_name)s WHERE %(entity_name)s IN (%(query)s)
  """).replace("entity_name").replace("schema").replace("table_name").replace("query")
  .build()
)
_create_common(views, 'gene', 'public.targid_gene', _primary_gene, idtype_gene)
create_sample(views, 'cellline', idtype_celline, _primary_cellline)
create_sample(views, 'tissue', idtype_tissue, _primary_tissue)


def create():
  return DBConnector(agg_score, views)
