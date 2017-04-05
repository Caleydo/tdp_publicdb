-------------------------------------------------------
CREATE OR REPLACE VIEW normchromentrezgene2ensemblgene AS
SELECT e2e.* FROM entrezgene2ensemblgene e2e join gene g on g.ensg = e2e.ensg where length(chromosome) <= 2;

CREATE OR REPLACE VIEW distinctentrezgene2ensemblgene AS
SELECT g.ensg, e.geneid FROM
       (SELECT ensg, geneid FROM normchromentrezgene2ensemblgene
       WHERE ensg IN (SELECT ensg FROM normchromentrezgene2ensemblgene GROUP BY ensg HAVING count(*) = 1)
       AND geneid IN (SELECT geneid FROM normchromentrezgene2ensemblgene GROUP BY geneid HAVING count(*) = 1)) e2e
       JOIN gene g ON g.ensg = e2e.ensg JOIN entrezgene e ON e.geneid = e2e.geneid
       WHERE e.chromosome = g.chromosome;

