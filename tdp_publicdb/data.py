from collections import namedtuple
from .entity import cellline, tissue

tables = ['expression', 'mutation', 'copynumber']
attributes = ['relativecopynumber', 'totalabscopynumber', 'copynumberclass', 'aa_mutated', 'aamutation', 'dna_mutated',
              'dnamutation', 'tpm', 'counts', 'zygosity']
operators = ['<', '>', '>=', '<=', '=', '<>']

DataEntity = namedtuple('DataEntity', ['schema', 'tables', 'attributes', 'operators'])

depletion_tables = ['depletionscore']
depletion_attributes = ['rsa', 'ataris', 'ceres']

cellline_data = DataEntity(cellline.schema, tables, attributes, operators)
tissue_data = DataEntity(tissue.schema, tables, attributes, operators)
cellline_depletion = DataEntity(cellline.schema, depletion_tables, depletion_attributes, operators)

drug_tables = ['drugscore']
drug_attributes = ['actarea', 'ic50', 'ec50']
cellline_drug = DataEntity(cellline.schema, drug_tables, drug_attributes, operators)
