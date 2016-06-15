
CREATE OR REPLACE VIEW tissue.targid_tissue AS
 SELECT tissuename,
    species,
    organ,
    tumortype,
    gender
   FROM tissue.tissue;

CREATE OR REPLACE VIEW public.targid_gene AS
 SELECT ensg,
    ensemblspecies(ensg) AS species,
    symbol,
    chromosome,
    strand,
    biotype
   FROM public.gene;

CREATE OR REPLACE VIEW tissue.targid_copynumber AS
 SELECT ensg,
    tissuename,
    pow(2::double precision, log2relativecopynumber::double precision) * 2::double precision AS cnv,
    getcopynumberclass(log2relativecopynumber) AS cn
   FROM tissue.processedcopynumber;

CREATE OR REPLACE VIEW tissue.targid_expression AS
 SELECT ensg,
    tissuename,
    log2fpkm,
    log2tpm,
    counts
   FROM tissue.processedrnaseqview;


CREATE OR REPLACE VIEW tissue.targid_mutation AS
 SELECT t.ensg,
    ps.tissuename,
    coarse(ps.dnamutation) = 'mut'::text AS dna_mutated,
    ps.dnamutation,
    coarse(ps.aamutation) = 'mut'::text AS aa_mutated,
    ps.aamutation,
    ps.zygosity,
    ps.exonscomplete,
    ps.confirmeddetail,
    ps.numsources
   FROM tissue.processedsequence ps
     JOIN transcript t ON t.enst::text = ps.enst::text
  WHERE t.iscanonical;


--combines expression, mutation, and copy number data into a single view
CREATE OR REPLACE VIEW tissue.targid_data AS
 SELECT clg.ensg,
    clg.tissuename,
    tc.cn,
    ps.log2fpkm,
    tm.dna_mutated
   FROM ( SELECT gene.ensg,
            tissue.tissuename
           FROM tissue.tissue,
            public.gene) clg
     LEFT JOIN tissue.targid_copynumber tc ON clg.tissuename::text = tc.tissuename::text AND clg.ensg::text = tc.ensg::text
     LEFT JOIN tissue.processedrnaseqview ps ON clg.tissuename::text = ps.tissuename::text AND clg.ensg::text = ps.ensg::text
     LEFT JOIN tissue.targid_mutation tm ON clg.tissuename::text = tm.tissuename::text AND clg.ensg::text = tm.ensg::text
  WHERE NOT (tc.cn IS NULL AND ps.log2fpkm IS NULL AND tm.dna_mutated IS NULL);

--vogelstein gene subset
--g.symbol in ('ABI1','ABL1','ABL2','ACSL6','ACVR1B','AFF1','AFF3','AFF4','AKT1','ALK','AMER1','APC','AR','ARHGAP26','ARHGEF12','ARID1A','ARID1B','ARID2','ARNT','ASPSCR1','ASXL1','ATF1','ATM','ATRX','AXIN1','B2M','BAP1','BCL10','BCL11A','BCL11B','BCL2','BCL3','BCL6','BCL9','BCOR','BCR','BIRC3','BLM','BMPR1A','BRAF','BRCA1','BRCA2','BRD4','BRIP1','BUB1B','CARD11','CASC5','CASP8','CBFB','CBL','CCND1','CCND2','CCND3','CD274','CD74','CDC42EP1','CDC73','CDH1','CDK4','CDK6','CDKN2A','CDKN2C','CDX2','CEBPA','CHCHD7','CHEK2','CHIC2','CIC','CIITA','CLP1','CLTC','CNTRL','COL1A1','CREB1','CREB3L1','CREB3L2','CREBBP','CRLF2','CRTC1','CRTC3','CSF1R','CTNNB1','CYLD','DAXX','DDIT3','DDX10','DDX6','DEK','DICER1','DNMT1','DNMT3A','EGFR','EIF4A2','ELF4','ELK4','ELL','ELN','EP300','EPS15','ERBB2','ERCC2','ERCC3','ERCC4','ERCC5','ERG','ETV1','ETV4','ETV6','EWSR1','EXT1','EXT2','EZH2','FANCA','FANCC','FANCD2','FANCE','FANCF','FANCG','FBXW7','FCRL4','FEV','FGFR1','FGFR1OP','FGFR2','FGFR3','FH','FIP1L1','FLCN','FLI1','FLJ27352','FLT3','FN1','FNBP1','FOXL2','FOXO1','FOXO3','FOXO4','FOXP1','FSTL3','FUBP1','FUS','GAS7','GATA1','GATA2','GATA3','GMPS','GNA11','GNAQ','GNAS','GOPC','GPC3','GPHN','H3F3A','HAS2','HEY1','HIP1','HIST1H3B','HIST1H4I','HLF','HMGA2','HNF1A','HOXA11','HOXA13','HOXA9','HOXC11','HOXC13','HOXD11','HOXD13','HRAS','HSP90AA1','HSP90AA2','HSP90AB1','IDH1','IDH2','IKZF1','IL2','IL21R','IRF4','ITK','JAK1','JAK2','JAK3','JAZF1','KAT6A','KAT6B','KDM5A','KDM5C','KDM6A','KDSR','KIT','KLF4','KRAS','LASP1','LCK','LCP1','LIFR','LMO1','LMO2','LPP','LYL1','MAF','MAFB','MALT1','MAML2','MAP2K1','MAP2K4','MAP3K1','MDM2','MDM4','MDS2','MECOM','MED12','MEN1','MET','MKL1','MLH1','MLL','MLL2','MLL3','MLLT1','MLLT10','MLLT11','MLLT3','MLLT4','MLLT6','MNX1','MPL','MSH2','MSH6','MSI2','MTCP1','MUC1','MUTYH','MYB','MYC','MYCL1','MYCN','MYD88','MYH11','NAB2','NACA','NBN','NCKIPSD','NCOA1','NCOA2','NCOA3','NCOR1','NDRG1','NF1','NF2','NFATC2','NFE2L2','NFIB','NFKB2','NIN','NKX2-1','NLRP2','NOTCH1','NOTCH2','NPM1','NR4A3','NRAS','NSD1','NTRK1','NTRK3','NUMA1','NUP214','NUP98','NUTM1','NUTM2B','OLIG2','P2RY8','PAFAH1B2','PALB2','PAX3','PAX5','PAX7','PAX8','PBRM1','PCSK7','PDCD1LG2','PDE4DIP','PDGFB','PDGFRA','PDGFRB','PER1','PHF6','PHOX2B','PICALM','PIK3CA','PIK3R1','PIM1','PLAG1','PMEL','PML','PMS1','PMS2','POU2AF1','POU5F1','PPARG','PPP2R1A','PRCC','PRDM1','PRDM16','PRG4','PRG4','PRKAR1A','PRRX1','PSIP1','PTCH1','PTEN','PTPN11','PTPRK','RABEP1','RAD51B','RAF1','RALGDS','RANBP17','RAP1GDS1','RARA','RB1','RBM15','RECQL4','RET','RHOH','RMI2','RNF43','ROS1','RPN1','RSPO3','RUNX1','RUNX1T1','SBDS','SDC4','SDHAF2','SDHB','SDHC','SDHD','05.Sep','06.Sep','09.Sep','SET','SETBP1','SETD2','SF3B1','SFPQ','SH3GL1','SKP2','SLC34A2','SLC45A3','SMAD2','SMAD4','SMARCA4','SMARCB1','SMO','SNX29','SOCS1','SOX9','SPECC1','SPOP','SRGAP3','SRSF2','SRSF3','SS18','SSX1','SSX2','SSX4','STAG2','STAT6','STIL','STK11','STL','SUFU','SUZ12','SYK','TAF15','TAL1','TAL2','TCF3','TCF7L2','TCL1A','TCL6','TET1','TET2','TFE3','TFPT','TFRC','TLX1','TLX3','TMPRSS2','TNFAIP3','TNFRSF17','TOP1','TP53','TPM3','TPR','TRAF7','TRIM24','TRIP11','TSC1','TSC2','TSHR','TTL','U2AF1','VHL','VTI1A','WAS','WHSC1','WHSC1L1','WIF1','WRN','WT1','XPA','XPC','YWHAE','ZBTB16','ZMYM2','ZNF384','ZNF521')
