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

# cosmic idtype
idtype = 'Cosmic'

views = dict()

# gene
create_common(views, gene)
create_gene(views, gene)

# cellline
create_common(views, cellline)
create_sample(views, cellline, gene, cellline_data)

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

mappings = [
  # TODO: throws error: DBMapping('Cellline', 'Cosmic', """SELECT celllinename as f, cosmicid as t FROM cellline.tdp_cellline WHERE celllinename in :ids""")
  DBMapping('Cellline', 'Cosmic', """SELECT celllinename as f, cosmicid as t FROM cellline.tdp_cellline""")
]

def create():
  d = DBConnector(views, agg_score, mappings=mappings)
  d.description = 'TCGA/CCLE database as assembled by Boehringer Ingelheim GmbH'
  return d
