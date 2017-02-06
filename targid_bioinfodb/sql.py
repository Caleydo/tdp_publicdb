from phovea_server.config import view
from targid2.dbview import DBViewBuilder, DBConnector

__author__ = 'Samuel Gratzl'
cc = view('targid_dummy')

idtype_celline = 'Cellline'
_primary_cellline = 'celllinename'

idtype_tissue = 'Tissue'
_primary_tissue = 'tissuename'

idtype_gene = 'Ensembl'
_primary_gene = 'ensg'
_index_gene = "row_number() OVER(ORDER BY t.ensg ASC) as _index"
_column_query_gene = 'targidid as _id, t.ensg as id, symbol, species, chromosome, strand, biotype, seqregionstart, seqregionend'

agg_score = DBViewBuilder() \
  .query('%(agg)s(%(data_subtype)s)') \
  .query('median', 'percentile_cont(0.5) WITHIN GROUP (ORDER BY %(data_subtype)s)') \
  .replace('agg').replace('data_subtype').build()


def create_sample(result, basename, idtype, primary):
  index = 'row_number() OVER(ORDER BY t.{primary} ASC) as _index'.format(primary=primary)
  column_query = 'targidid as _id, t.{primary} as id, species, tumortype, organ, gender'.format(primary=primary)

  result[basename] = DBViewBuilder() \
    .idtype(idtype) \
    .query("""
  SELECT {index}, {columns}
  FROM {base}.targid_{base} t
  ORDER BY celllinename ASC""".format(index=index, columns=column_query, base=base)) \
    .query_categories("""
    SELECT distinct %(col)s as cat
    FROM {base}.targid_{base}
    WHERE %(col)s is not null AND %(col)s <> ''""".format(base=base)) \
    .column(primary, label='id', type='string') \
    .column('species', type='categorical') \
    .column('tumortype', type='categorical') \
    .column('organ', type='categorical') \
    .column('gender', type='categorical') \
    .build()

  result[basename + '_panel'] = DBViewBuilder().query("""
  SELECT panel as id, paneldescription as description
  FROM {base}.targid_{base} ORDER BY panel ASC""".format(base=base)).build()

  result[basename + '_filtered'] = DBViewBuilder().idtype(idtype).query("""
  SELECT {index}, {columns}
  FROM {base}.targid_{base} t
  WHERE species = :species""".format(index=index, columns=column_query, base=base)).arg('species').build(),

  result[basename + '_filtered_namedset'] = DBViewBuilder().idtype(idtype).query("""
  SELECT {index}, {columns}
  FROM {base}.targid_{base} t
  WHERE targidid IN (:ids)""".format(index=index, columns=column_query, base=base)).replace('ids').build(),

  result[basename + '_filtered_panel'] = DBViewBuilder().idtype(idtype).query("""
  SELECT {index}, {columns}
  FROM {base}.targid_panelassignment s JOIN {base}.targid_{base} t ON s.{primary} = t.{primary}
  WHERE s.panel = :panel""".format(index=index, columns=column_query, base=base, primary=primary)).arg('panel').build()


views = dict(
  gene=DBViewBuilder().idtype(idtype_gene).query("""
  SELECT {index}, {columns}
  FROM public.targid_gene t
  ORDER BY t.symbol ASC""".format(index=_index_gene, columns=_column_query_gene))
    .query_stats("""
  SELECT min(strand) AS strand_min, max(strand) AS strand_max, min(seqregionstart) AS seqregionstart_min, max(seqregionstart) AS seqregionstart_max,
    min(seqregionend) AS seqregionend_min, max(seqregionend) AS seqregionend_max FROM public.targid_gene""")
    .query_categories("""
  SELECT DISTINCT %(col)S AS cat FROM PUBLIC.targid_gene
  WHERE %(col)S IS NOT NULL AND %(col)S <> ''""".format(base='gene'))
    .column(_primary_gene, label='id', type='string')
    .column('symbol', type='string')
    .column('tumortype', type='categorical')
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
    WHERE species = :species""".format(index=index, columns=column_query))
    .arg('species')
    .build(),

  gene_filtered_namedset=DBViewBuilder().idtype(idtype_gene).query("""
    SELECT {index}, {columns}
    FROM {base}.targid_{base} t
    WHERE targidid IN (:ids)""".format(index=index, columns=column_query))
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
    FROM public.targid_gene WHERE ensg IN (%(ensgs)S) AND species = :species
    ORDER BY symbol ASC""")
    .arg('species')
    .replace('ensgs')
    .build(),

  enrichment=DBViewBuilder().idtype(idtype_gene).query("""
    SELECT cn.targidid AS _id, cn.ensg AS id, symbol, 2*pow(2, max(cnv)) AS score
    FROM %(SCHEMA)S.targid_copynumber copynumberclass
    JOIN PUBLIC.targid_gene g ON g.ensg = cn.ensg
    WHERE cnv > (
      SELECT max(cnv) FROM %(SCHEMA)S.targid_copynumber ab
      INNER JOIN %(SCHEMA)S.targid_%(table_name)S b ON b.%(entity_name)S = ab.%(entity_name)S
        WHERE ab.cn = :cn AND b.tumortype = :tumortype AND ab.ensg = :ensg
      )
    GROUP BY cn.ensg, symbol""")
    .arg('ensg').arg('cn').arg('tumortype')
    .replace('schema').replace('table_name').replace('entity_name')
    .build(),

  enrichment_all=DBViewBuilder().idtype(idtype_gene).query("""
    SELECT cn.targidid AS _id, cn.ensg AS id, symbol, 2*pow(2, max(cnv)) AS score
    FROM %(SCHEMA)S.targid_copynumber copynumberclass
    JOIN PUBLIC.targid_gene g ON g.ensg = cn.ensg
    WHERE cnv > (
    SELECT max(cnv) FROM %(SCHEMA)S.targid_copynumber ab
    INNER JOIN %(SCHEMA)S.targid_%(table_name)S b ON b.%(entity_name)S = ab.%(entity_name)S
    WHERE ab.cn = :cn AND ab.ensg = :ensg
    ) GROUP BY cn.ensg, symbol""")
    .arg('ensg').arg('cn')
    .replace('schema').replace('table_name').replace('entity_name')
    .build(),

  onco_print_sample_list=DBViewBuilder().idtype(idtype_tissue).query("""
    SELECT d.targidid AS _id, d.%(entity_name)S AS id
    FROM %(SCHEMA)S.targid_%(table_name)S D
    WHERE D.tumortype = :tumortype AND D.species = :species""").arg("tumortype").arg("species").replace(
    "schema")
    .replace("table_name").replace("entity_name").build(),

  onco_print_sample_list_all=DBViewBuilder().idtype(idtype_tissue).query("""
   SELECT d.targidid AS _id, d.%(entity_name)S AS id
   FROM %(SCHEMA)S.targid_%(table_name)S D
   WHERE D.species = :species""")
    .arg("species")
    .replace("schema").replace("table_name").replace("entity_name")
    .build(),

  onco_print=DBViewBuilder().idtype(idtype_tissue).query("""
     SELECT g.targidid AS _id, d.ensg AS id, d.%(entity_name)S AS NAME, copynumberclass AS cn, D.tpm AS expr, D.aa_mutated, g.symbol
     FROM %(SCHEMA)S.targid_data D
     INNER JOIN %(SCHEMA)S.targid_%(table_name)S C ON D.%(entity_name)S = C.%(entity_name)S
     INNER JOIN PUBLIC.targid_gene g ON D.ensg = g.ensg
     WHERE C.tumortype = :tumortype AND D.ensg IN (%(ensgs)S) AND C.species = :species""")
    .replace("schema").replace("table_name").replace("entity_name").replace("ensgs")
    .arg("tumortype").arg("species")
    .build(),

  onco_print_all=DBViewBuilder().idtype(idtype_tissue).query("""
     SELECT g.targidid AS _id, d.ensg AS id, d.%(entity_name)S AS NAME, copynumberclass AS cn, D.tpm AS expr, D.aa_mutated, g.symbol
     FROM %(SCHEMA)S.targid_data D
     INNER JOIN %(SCHEMA)S.targid_%(table_name)S C ON D.%(entity_name)S = C.%(entity_name)S
     INNER JOIN PUBLIC.targid_gene g ON D.ensg = g.ensg
     WHERE D.ensg IN (%(ensgs)S) AND C.species = :species""")
    .arg("species")
    .replace("schema").replace("table_name").replace("entity_name").replace("ensgs")
    .build(),

  row=DBViewBuilder().idtype(idtype_tissue).query("""
     SELECT b.targidid AS _id, b.%(entity_name)S AS id, *
     FROM %(SCHEMA)S.targid_%(table_name)S b
     WHERE b.%(entity_name)S IN (%(entities)S)""")
    .replace("schema").replace("table_name").replace("entity_name").replace("entities")
    .build(),

  raw_data_table=DBViewBuilder().idtype(idtype_tissue).query("""
       SELECT b.targidid AS _id, b.%(entity_name)S AS id, b.species, b.organ, b.tumortype, b.gender
       FROM %(SCHEMA)S.targid_%(SCHEMA)S b
       WHERE b.tumortype = :tumortype AND b.species = :species""")
    .replace("schema").replace("table_name").replace("entity_name").replace("data_subtype")
    .arg("tumortype").arg("species")
    .build(),

  raw_data_table_all=DBViewBuilder().idtype(idtype_tissue).query("""
     SELECT b.targidid AS _id, b.%(entity_name)S AS id, b.species, b.organ, b.tumortype, b.gender
     FROM %(SCHEMA)S.targid_%(SCHEMA)S b
     WHERE b.species = :species""")
    .replace("schema").replace("table_name").replace("entity_name").replace("data_subtype")
    .arg("species")
    .build(),

  raw_data_table_column=DBViewBuilder().idtype(idtype_tissue).query("""
     SELECT b.targidid AS _id, b.%(entity_name)S AS id, %(data_subtype)S AS score
     FROM %(SCHEMA)S.targid_%(SCHEMA)S b
     INNER JOIN %(SCHEMA)S.targid_%(table_name)S ab ON b.%(entity_name)S = ab.%(entity_name)S
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
     SELECT b.targidid AS _id, b.ensg AS id, %(data_subtype)S AS score
     FROM PUBLIC.targid_gene b
     INNER JOIN %(SCHEMA)S.targid_%(table_name)S ab ON ab.ensg = b.ensg
     WHERE ab.%(entity_name)S = :entity_value""")
    .replace("schema").replace("table_name").replace("entity_name").replace("data_subtype")
    .arg("entity_value")
    .build(),

  co_expression=DBViewBuilder().idtype(idtype_gene).query("""
     SELECT c.targidid AS _id, a.ensg AS id, g.symbol, c.%(entity_name)S, a.%(expression_subtype)S AS expression
     FROM %(SCHEMA)S.targid_expression AS a
     INNER JOIN PUBLIC.targid_gene g ON a.ensg = g.ensg
     INNER JOIN %(SCHEMA)S.targid_%(SCHEMA)S C ON a.%(entity_name)S = C.%(entity_name)S
     WHERE C.tumortype = :tumortype AND a.ensg = :ensg""")
    .arg("ensg").arg("tumortype")
    .replace("schema").replace("entity_name").replace("expression_subtype")
    .build(),

  co_expression_all=DBViewBuilder().idtype(idtype_gene).query("""
     SELECT c.targidid AS _id, a.ensg AS id, g.symbol, c.%(entity_name)S, a.%(expression_subtype)S AS expression
     FROM %(SCHEMA)S.targid_expression AS a
     INNER JOIN PUBLIC.targid_gene g ON a.ensg = g.ensg
     INNER JOIN %(SCHEMA)S.targid_%(SCHEMA)S C ON a.%(entity_name)S = C.%(entity_name)S
     WHERE a.ensg = :ensg""")
    .arg("ensg")
    .replace("schema").replace("entity_name").replace("expression_subtype")
    .build(),

  expression_vs_copynumber=DBViewBuilder().idtype(idtype_gene).query("""
     SELECT c.targidid AS _id, a.ensg AS id, g.symbol, c.%(entity_name)S, a.%(expression_subtype)S AS expression, b.%(copynumber_subtype)S AS cn
     FROM %(SCHEMA)S.targid_expression AS a
     INNER JOIN %(SCHEMA)S.targid_copynumber AS b ON a.ensg = b.ensg AND a.%(entity_name)S = b.%(entity_name)S
     INNER JOIN PUBLIC.targid_gene g ON a.ensg = g.ensg
     INNER JOIN %(SCHEMA)S.targid_%(SCHEMA)S C ON a.%(entity_name)S = C.%(entity_name)S
     WHERE C.tumortype = :tumortype AND a.ensg = :ensg""")
    .arg("ensg").arg("tumortype")
    .replace("schema").replace("entity_name").replace("expression_subtype").replace("copynumber_subtype")
    .build(),

  expression_vs_copynumber_all=DBViewBuilder().idtype(idtype_gene).query("""
     SELECT c.targidid AS _id, a.ensg AS id, g.symbol, c.%(entity_name)S, a.%(expression_subtype)S AS expression, b.%(copynumber_subtype)S AS cn
     FROM %(SCHEMA)S.targid_expression AS a
     INNER JOIN %(SCHEMA)S.targid_copynumber AS b ON a.ensg = b.ensg AND a.%(entity_name)S = b.%(entity_name)S
     INNER JOIN PUBLIC.targid_gene g ON a.ensg = g.ensg
     INNER JOIN %(SCHEMA)S.targid_%(SCHEMA)S C ON a.%(entity_name)S = C.%(entity_name)S
     WHERE a.ensg = :ensg""")
    .arg("ensg")
    .replace("schema").replace("entity_name").replace("expression_subtype").replace("copynumber_subtype")
    .build(),

  aggregated_score=DBViewBuilder().idtype(idtype_gene).query("""
     SELECT ensg AS id, %(agg_score)S AS score
     FROM %(SCHEMA)S.targid_%(table_name)S
     WHERE %(entity_name)S = ANY(ARRAY(SELECT %(entity_name)S FROM %(SCHEMA)S.targid_%(SCHEMA)S WHERE tumortype = :tumortype AND species = :species))
     GROUP BY ensg""")
    .replace("schema").replace("entity_name").replace("table_name").replace("data_subtype").replace("agg").replace("agg_score")
    .arg("tumortype").arg("species")
    .build(),

  aggregated_score_panel=DBViewBuilder().idtype(idtype_gene).query("""
     SELECT ensg AS id, %(agg_score)S AS score
     FROM %(SCHEMA)S.targid_%(table_name)S
     WHERE %(entity_name)S = ANY(ARRAY(SELECT %(entity_name)S FROM %(SCHEMA)S.targid_panelassignment WHERE panel = :panel))
     GROUP BY ensg""")
    .replace("schema").replace("entity_name").replace("table_name").replace("data_subtype").replace("agg").replace("agg_score")
    .arg("panel")
    .build(),

  aggregated_score_all=DBViewBuilder().idtype(idtype_gene).query("""
     SELECT ensg AS id, %(agg_score)S AS score
     FROM %(SCHEMA)S.targid_%(table_name)S
     WHERE %(entity_name)S = ANY(ARRAY(SELECT %(entity_name)S FROM %(SCHEMA)S.targid_%(SCHEMA)S WHERE species = :species))
     GROUP BY ensg""")
    .replace("schema").replace("entity_name").replace("table_name").replace("data_subtype").replace("agg").replace("agg_score")
    .arg("species")
    .build(),

  aggregated_score_boxplot=DBViewBuilder().idtype(idtype_gene).query("""
     SELECT ensg AS id, min(%(data_subtype)s) AS MIN, max(%(data_subtype)S) AS max,
     percentile_cont(0.5) WITHIN GROUP (ORDER BY %(data_subtype)S) AS median,
     percentile_cont(0.25) WITHIN GROUP (ORDER BY %(data_subtype)S) AS q1,
     percentile_cont(0.75) WITHIN GROUP (ORDER BY %(data_subtype)S) AS q3
     FROM %(SCHEMA)S.targid_%(table_name)S
     WHERE %(entity_name)S = ANY(ARRAY(SELECT %(entity_name)S FROM %(SCHEMA)S.targid_%(SCHEMA)S WHERE tumortype = :tumortype AND species = :species))
     GROUP BY ensg""")
    .replace("schema").replace("entity_name").replace("table_name").replace("data_subtype").replace("agg").replace("agg_score")
    .arg("tumortype").arg("species")
    .build(),

  aggregated_score_boxplot_all=DBViewBuilder().idtype(idtype_gene).query("""
     SELECT ensg AS id, min(%(data_subtype)s) AS MIN, max(%(data_subtype)S) AS max,
     percentile_cont(0.5) WITHIN GROUP (ORDER BY %(data_subtype)S) AS median,
     percentile_cont(0.25) WITHIN GROUP (ORDER BY %(data_subtype)S) AS q1,
     percentile_cont(0.75) WITHIN GROUP (ORDER BY %(data_subtype)S) AS q3
     FROM %(SCHEMA)S.targid_%(table_name)S
     WHERE %(entity_name)S = ANY(ARRAY(SELECT %(entity_name)S FROM %(SCHEMA)S.targid_%(SCHEMA)S WHERE species = :species))
     GROUP BY ensg""")
    .replace("schema").replace("entity_name").replace("table_name").replace("data_subtype").replace("agg").replace("agg_score")
    .arg("species")
    .build(),

  aggregated_score_boxplot_panel=DBViewBuilder().idtype(idtype_gene).query("""
     SELECT ensg AS id, min(%(data_subtype)s) AS MIN, max(%(data_subtype)S) AS max,
     percentile_cont(0.5) WITHIN GROUP (ORDER BY %(data_subtype)S) AS median,
     percentile_cont(0.25) WITHIN GROUP (ORDER BY %(data_subtype)S) AS q1,
     percentile_cont(0.75) WITHIN GROUP (ORDER BY %(data_subtype)S) AS q3
     FROM %(SCHEMA)S.targid_%(table_name)S
     WHERE %(entity_name)S = ANY(ARRAY(SELECT %(entity_name)S FROM %(SCHEMA)S.targid_panelassignment WHERE panel = :panel))
     GROUP BY ensg""")
    .replace("schema").replace("entity_name").replace("table_name").replace("data_subtype").replace("agg").replace("agg_score")
    .arg("panel")
    .build(),

  aggregated_score_inverted=DBViewBuilder().idtype(idtype_tissue).query("""
     SELECT %(entity_name)S AS id, %(agg_score)S AS score
     FROM %(SCHEMA)S.targid_%(table_name)S ab
     INNER JOIN PUBLIC.targid_gene b ON b.ensg = ab.ensg
     WHERE b.biotype = :biotype AND b.species = :species
     GROUP BY ab.%(entity_name)S""")
    .replace("schema").replace("entity_name").replace("table_name").replace("data_subtype").replace("agg").replace("agg_score")
    .arg("biotype").arg("species")
    .build(),

  aggregated_score_inverted_all=DBViewBuilder().idtype(idtype_tissue).query("""
     SELECT %(entity_name)S AS id, %(agg_score)S AS score
     FROM %(SCHEMA)S.targid_%(table_name)S ab
     INNER JOIN PUBLIC.targid_gene b ON b.ensg = ab.ensg
     WHERE b.species = :species
     GROUP BY ab.%(entity_name)S""")
    .replace("schema").replace("entity_name").replace("table_name").replace("data_subtype").replace("agg").replace("agg_score")
    .arg("species")
    .build(),

  frequency_score=DBViewBuilder().idtype(idtype_gene).query("""
       SELECT a.ensg AS id, (coalesce(freq.count,0)+0.0) AS count, a.total
       FROM (
       SELECT COUNT(*) AS total, ensg
       FROM %(SCHEMA)S.targid_%(table_name)S M
       INNER JOIN %(SCHEMA)S.targid_%(SCHEMA)S C ON C.%(entity_name)S = M.%(entity_name)S
       WHERE C.tumortype = :tumortype AND C.species = :species
       GROUP BY ensg
       ) a
       LEFT JOIN (
       SELECT COUNT(*) AS count, ensg
       FROM %(SCHEMA)S.targid_%(table_name)S M
       INNER JOIN %(SCHEMA)S.targid_%(SCHEMA)S C ON C.%(entity_name)S = M.%(entity_name)S
       WHERE C.tumortype = :tumortype AND %(data_subtype)S %(OPERATOR)S %(VALUE)S AND C.species = :species
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
       FROM %(SCHEMA)S.targid_%(table_name)S M
       INNER JOIN %(SCHEMA)S.targid_%(SCHEMA)S C ON C.%(entity_name)S = M.%(entity_name)S
       WHERE C.species = :species
       GROUP BY ensg
       ) a
       LEFT JOIN (
       SELECT COUNT(*) AS count, ensg
       FROM %(SCHEMA)S.targid_%(table_name)S  M
       INNER JOIN %(SCHEMA)S.targid_%(SCHEMA)S C ON C.%(entity_name)S = M.%(entity_name)S
       WHERE %(data_subtype)S %(OPERATOR)S %(VALUE)S AND C.species = :species
       GROUP BY ensg
       ) freq
       ON freq.ensg = a.ensg""")
    .arg("species")
    .replace("schema").replace("entity_name").replace("table_name").replace("data_subtype").replace("operator").replace("value")
    .build(),

  frequency_score_inverted=DBViewBuilder().idtype(idtype_tissue).query("""
       SELECT a.%(entity_name)S AS id, (COALESCE(freq.count,0)+0.0) AS count, a.total
       FROM (
       SELECT COUNT(*) AS total, %(entity_name)S
       FROM %(SCHEMA)S.targid_%(table_name)S M
       INNER JOIN PUBLIC.targid_gene g ON g.ensg = M.ensg
       WHERE g.biotype = :biotype AND g.species = :species
       GROUP BY %(entity_name)S
       ) a
       LEFT JOIN (
       SELECT COUNT(*) AS count, %(entity_name)S
       FROM %(SCHEMA)S.targid_%(table_name)S M
       INNER JOIN PUBLIC.targid_gene g ON g.ensg = M.ensg
       WHERE g.biotype = :biotype AND %(data_subtype)S %(OPERATOR)S %(VALUE)S AND g.species = :species
       GROUP BY %(entity_name)S
       ) freq
       ON freq.%(entity_name)S = a.%(entity_name)S""")
    .arg("biotype").arg("species")
    .replace("schema").replace("entity_name").replace("table_name").replace("data_subtype").replace("operator").replace("value")
    .build(),

  frequency_score_inverted_all=DBViewBuilder().idtype(idtype_tissue).query("""
       SELECT a.%(entity_name)S AS id, (COALESCE(freq.count,0)+0.0) AS count, a.total
       FROM (
         SELECT COUNT(*) AS total, %(entity_name)S
         FROM %(SCHEMA)S.targid_%(table_name)S M
         INNER JOIN PUBLIC.targid_gene g ON g.ensg = M.ensg
         WHERE g.species = :species
         GROUP BY %(entity_name)S
       ) a
       LEFT JOIN (
         SELECT COUNT(*) AS count, %(entity_name)S
         FROM %(SCHEMA)S.targid_%(table_name)S M
         INNER JOIN PUBLIC.targid_gene g ON g.ensg = M.ensg
         WHERE %(data_subtype)S %(OPERATOR)S %(VALUE)S AND g.species = :species
         GROUP BY %(entity_name)S
       ) freq
       ON freq.%(entity_name)S = a.%(entity_name)S""")
    .arg("species")
    .replace("schema").replace("entity_name").replace("table_name").replace("data_subtype").replace("operator").replace("value")
    .build(),

  mutation_frequency=DBViewBuilder().idtype(idtype_gene).query("""
       SELECT a.ensg AS id, (coalesce(mut.mutated,0)+0.0) AS count, a.total
       FROM (
         SELECT COUNT(*) AS total, ensg
         FROM %(SCHEMA)S.targid_mutation M
         INNER JOIN %(SCHEMA)S.targid_%(SCHEMA)S C ON C.%(entity_name)S = M.%(entity_name)S
         WHERE C.tumortype = :tumortype AND C.species = :species
         GROUP BY ensg
       ) a
       LEFT JOIN (
         SELECT COUNT(*) AS mutated, ensg
         FROM %(SCHEMA)S.targid_mutation M
         INNER JOIN %(SCHEMA)S.targid_%(SCHEMA)S C ON C.%(entity_name)S = M.%(entity_name)S
         WHERE C.tumortype = :tumortype AND %(data_subtype)S = 'true' AND C.species = :species
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
         FROM %(SCHEMA)S.targid_mutation M
         INNER JOIN %(SCHEMA)S.targid_%(SCHEMA)S C ON C.%(entity_name)S = M.%(entity_name)S
         WHERE C.species = :species
         GROUP BY ensg
       ) a
       LEFT JOIN (
         SELECT COUNT(*) AS mutated, ensg
         FROM %(SCHEMA)S.targid_mutation M
         INNER JOIN %(SCHEMA)S.targid_%(SCHEMA)S C ON C.%(entity_name)S = M.%(entity_name)S
         WHERE %(data_subtype)S = 'true' AND C.species = :species
         GROUP BY ensg
       ) mut
       ON mut.ensg = a.ensg""")
    .arg("species")
    .replace("schema").replace("entity_name").replace("data_subtype")
    .build(),

  mutation_frequency_inverted=DBViewBuilder().idtype(idtype_gene).query("""
     SELECT a.%(entity_name)S AS id, (COALESCE(mut.mutated,0)+0.0) AS count, a.total
     FROM (
     SELECT COUNT(*) AS total, %(entity_name)S
     FROM %(SCHEMA)S.targid_mutation M
     INNER JOIN PUBLIC.targid_gene g ON g.ensg = M.ensg
     WHERE g.biotype = :biotype AND g.species = :species
     GROUP BY %(entity_name)S
     ) a
     LEFT JOIN (
     SELECT COUNT(*) AS mutated, %(entity_name)S
     FROM %(SCHEMA)S.targid_mutation M
     INNER JOIN PUBLIC.targid_gene g ON g.ensg = M.ensg
     WHERE g.biotype = :biotype AND %(data_subtype)S = 'true' AND g.species = :species
     GROUP BY %(entity_name)S
     ) mut
     ON mut.%(entity_name)S = a.%(entity_name)S""")
    .arg("biotype").arg("species")
    .replace("schema").replace("entity_name").replace("data_subtype")
    .build(),

  mutation_frequency_inverted_all=DBViewBuilder().idtype(idtype_gene).query("""
      SELECT a.%(entity_name)S AS id, (COALESCE(mut.mutated,0)+0.0) AS count, a.total
      FROM (
      SELECT COUNT(*) AS total, %(entity_name)S
      FROM %(SCHEMA)S.targid_mutation M
      INNER JOIN PUBLIC.targid_gene g ON g.ensg = M.ensg
      WHERE g.species = :species
      GROUP BY %(entity_name)S
      ) a
      LEFT JOIN (
      SELECT COUNT(*) AS mutated, %(entity_name)S
      FROM %(SCHEMA)S.targid_mutation M
      INNER JOIN PUBLIC.targid_gene g ON g.ensg = M.ensg
      WHERE %(data_subtype)S = 'true' AND g.species = :species
      GROUP BY %(entity_name)S
      ) mut
      ON mut.%(entity_name)S = a.%(entity_name)S""")
    .arg("species")
    .replace("schema").replace("entity_name").replace("data_subtype")
    .build(),

  single_entity_lookup=DBViewBuilder().idtype(idtype_tissue).query("""
      SELECT targidid AS _id, %(id_column)S AS id, %(query_column)S AS TEXT
      FROM %(SCHEMA)S.targid_%(table_name)S WHERE species = :species AND LOWER(%(query_column)S) LIKE :QUERY
      ORDER BY %(query_column)S ASC LIMIT %(LIMIT)S OFFSET %(OFFSET)S""")
    .query('count', """
      SELECT COUNT(*) AS total_count
      FROM %(SCHEMA)S.targid_%(table_name)S
      WHERE species = :species AND LOWER(%(query_column)S) LIKE :QUERY""")
    .replace("schema").replace("table_name").replace("query_column").replace("id_column").replace("limit").replace("offset")
    .arg("query").arg("species")
    .build(),

  single_entity_score=DBViewBuilder().idtype(idtype_gene).query("""
        SELECT ensg AS id, %(data_subtype)S AS score
        FROM %(SCHEMA)S.targid_%(table_name)S
       WHERE %(entity_name)S = :entity_value""")
    .replace("schema").replace("entity_name").replace("table_name").replace("data_subtype")
    .arg("entity_value")
    .build(),

  single_entity_score_inverted=DBViewBuilder().idtype(idtype_celline).query("""
        SELECT %(entity_name)S AS id, %(data_subtype)S AS score
        FROM %(SCHEMA)S.targid_%(table_name)S
        WHERE ensg = :entity_value""")
    .replace("schema").replace("entity_name").replace("table_name").replace("data_subtype")
    .arg("entity_value")
    .build()
)
create_sample(views, 'cellline', idtype_celline, _primary_cellline)
create_sample(views, 'tissue', idtype_tissue, _primary_tissue)


def create():
  return DBConnector(agg_score, views)
