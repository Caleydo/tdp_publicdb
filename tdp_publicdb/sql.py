# flake8: noqa
from tdp_core.dbview import DBConnector, DBMapping
from .pg_agg_score import agg_score
from .entity import cellline, gene, tissue
from .data import cellline_data, tissue_data, cellline_depletion
from .query_common import create_common
from .query_gene import create_gene
from .query_sample import create_sample
from .query_score import create_gene_sample_score

__author__ = 'Samuel Gratzl'

views = dict()

# gene
create_common(views, gene)
create_gene(views, gene)

# cellline
create_common(views, cellline)
create_sample(views, cellline, gene, cellline_data)

# drug
views[drug.prefix + '_items'] = DBViewBuilder('helper').idtype(drug.idtype).query("""
   SELECT {id} as id, {{column}} AS text
   FROM {table} WHERE LOWER({{column}}) LIKE :query
   ORDER BY {{column}} ASC""".format(table=drug.table, id=drug.id)) \
   .replace('column', drug.columns) \
   .call(limit_offset) \
   .assign_ids() \
   .arg('query') \
   .build()


# scores cellline x gene
create_gene_sample_score(views, gene, cellline, cellline_data)
create_gene_sample_score(views, cellline, gene, cellline_data, inline_aggregate_sample_filter=True)
create_gene_sample_score(views, cellline, drug, cellline_drug, 'drug_')

# tissue
create_common(views, tissue)
create_sample(views, tissue, gene, tissue_data)

# scores tissue x gene
create_gene_sample_score(views, gene, tissue, tissue_data)
create_gene_sample_score(views, tissue, gene, tissue_data, inline_aggregate_sample_filter=True)

# depletion scores
create_gene_sample_score(views, gene, cellline, cellline_depletion, 'depletion_', callback=lambda x: x.filter('depletionscreen'))
create_gene_sample_score(views, cellline, gene, cellline_depletion, 'depletion_', inline_aggregate_sample_filter=True, callback=lambda x: x.filter('depletionscreen'))


# query= """
# SELECT d.celllinename AS id, d.ataris AS score           FROM cellline.tdp_depletionscore d           
# INNER JOIN public.tdp_gene s ON d.ensg = s.ensg          
# INNER JOIN cellline.tdp_cellline g ON d.celllinename = g.celllinename             
# WHERE g.species = :species AND d.ensg = :name  AND depletionscreen = :depletionscreen ({'name': 'ENSG00000101986', 'species': 'human', 'depletionscreen': 'Drive'})
# """


# SELECT d.celllinename AS id, d.ic50 AS score           
# FROM cellline.tdp_drugscore d           
# INNER JOIN public.tdp_gene s ON d.ensg = s.ensg           
# INNER JOIN cellline.tdp_cellline g ON d.celllinename = g.celllinename 
# WHERE g.species = :species AND d.ensg = :name  ({'name': 'ENSG00000148584', 'species': 'human'})



# idtype mappings
mappings = [
  DBMapping(cellline.idtype, 'Cosmic',
            """SELECT {s.id} as f, CAST(cosmicid as text) as t
               FROM {s.table}
               WHERE {s.id} = ANY(:ids) AND cosmicid is NOT NULL""".format(s=cellline)),
  DBMapping('Cosmic', cellline.idtype,
            """SELECT CAST(cosmicid as text) as t, {s.id} as t
               FROM {s.table}
               WHERE cosmicid = ANY(:ids)""".format(s=cellline), integer_ids=True),
  DBMapping(gene.idtype, 'GeneSymbol',
            """SELECT {g.id} AS f, symbol as t
               FROM {g.table} WHERE {g.id} = ANY(:ids)""".format(g=gene)),
  DBMapping('GeneSymbol', gene.idtype,
            """SELECT symbol as f, {g.id} AS t
               FROM {g.table} WHERE symbol = ANY(:ids)""".format(g=gene))
]

def create():
  d = DBConnector(views, agg_score, mappings=mappings)
  d.description = 'TCGA/CCLE database as assembled by Boehringer Ingelheim GmbH'
  return d
