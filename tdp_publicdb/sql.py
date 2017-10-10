# flake8: noqa
from tdp_core.dbview import DBConnector
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

# scores cellline x gene
create_gene_sample_score(views, gene, cellline, cellline_data)
create_gene_sample_score(views, cellline, gene, cellline_data)

# tissue
create_common(views, tissue)
create_sample(views, tissue, gene, tissue_data)

# scores tissue x gene
create_gene_sample_score(views, gene, tissue, tissue_data)
create_gene_sample_score(views, tissue, gene, tissue_data)

create_gene_sample_score(views, gene, cellline, cellline_depletion, 'depletion_')
create_gene_sample_score(views, cellline, gene, cellline_depletion, 'depletion_')



def create():
  d = DBConnector(views, agg_score)
  d.description = 'TCGA/CCLE database as assembled by Boehringer Ingelheim GmbH'
  return d
