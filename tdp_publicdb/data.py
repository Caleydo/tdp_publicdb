from collections import namedtuple
from .entity import cellline, tissue

tables = ['expression', 'mutation', 'copynumber']
attributes = ['relativecopynumber', 'totalabscopynumber', 'copynumberclass', 'aa_mutated', 'aamutation', 'dna_mutated',
              'dnamutation', 'tpm', 'counts', 'zygosity']
operators = ['<', '>', '>=', '<=', '=', '<>']

DataEntity = namedtuple('DataEntity', ['schema', 'tables', 'attributes', 'operators'])

cellline_data = DataEntity(cellline.schema, tables, attributes, operators)
tissue_data = DataEntity(tissue.schema, tables, attributes, operators)
