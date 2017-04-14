
-- add "name" field to view
DROP VIEW public.targid_gene;
CREATE VIEW public.targid_gene AS 
 SELECT public.gene.targidid,
    gene.ensg,
    getspecies(gene.ensg) AS species,
    gene.symbol,
    gene.name,
    gene.chromosome,
    gene.strand,
    gene.biotype,
    gene.seqregionstart,
    gene.seqregionend
   FROM gene;