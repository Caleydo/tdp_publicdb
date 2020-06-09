# flake8: noqa
from tdp_core.dbview import DBConnector, DBMapping
from .pg_agg_score import agg_score
from .entity import cellline, gene, tissue, drug
from .data import cellline_data, tissue_data, cellline_depletion, cellline_drug
from .query_common import create_common
from .query_gene import create_gene
from .query_sample import create_sample
from .query_score import create_gene_sample_score
from tdp_core.dbview import DBViewBuilder, inject_where, limit_offset
from .query_drug import create_drug, create_drug_sample_score

__author__ = 'Samuel Gratzl'

views = dict()

# gene
create_common(views, gene)
create_gene(views, gene)

# cellline
create_common(views, cellline)
create_sample(views, cellline, gene, cellline_data)

# drug
create_drug(views, drug)
create_drug_sample_score(views, cellline, drug, cellline_drug, 'drug_')

# scores cellline x gene
create_gene_sample_score(views, gene, cellline, cellline_data)
create_gene_sample_score(views, cellline, gene, cellline_data, inline_aggregate_sample_filter=True)

# tissue
create_common(views, tissue)
create_sample(views, tissue, gene, tissue_data)

# scores tissue x gene
create_gene_sample_score(views, gene, tissue, tissue_data)
create_gene_sample_score(views, tissue, gene, tissue_data, inline_aggregate_sample_filter=True)

# depletion scores
create_gene_sample_score(views, gene, cellline, cellline_depletion, 'depletion_', callback=lambda x: x.filter('depletionscreen'))
create_gene_sample_score(views, cellline, gene, cellline_depletion, 'depletion_', inline_aggregate_sample_filter=True, callback=lambda x: x.filter('depletionscreen'))

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
