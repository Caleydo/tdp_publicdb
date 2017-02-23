/*==============================================================*/
/* DBMS name:      PostgreSQL 7.3                               */
/* Created on:     23.02.2017 17:34:05                          */
/*==============================================================*/


/*==============================================================*/
/* Table: ANALYSIS                                              */
/*==============================================================*/
create table ANALYSIS (
ANALYSISID           INT4                 not null,
ANALYSISRUNID        INT4                 not null,
ENSG                 TEXT                 null,
VERSIONNUMBER        INT2                 null,
STATUS               TEXT                 null,
NUMREADS             INT4                 null,
constraint PK_ANALYSIS primary key (ANALYSISID, ANALYSISRUNID)
);

/*==============================================================*/
/* Table: ANALYSISRUN                                           */
/*==============================================================*/
create table ANALYSISRUN (
ANALYSISRUNID        INT4                 not null,
CELLLINENAME         TEXT                 not null,
CELLBATCHID          INT4                 null,
PUBMEDID             INT4                 null,
COMMENT              TEXT                 null,
SHORTREADARCHIVENUMBER TEXT                 null,
DIRECTORY            TEXT                 null,
ANALYSISSOURCE       TEXT                 null,
PUBLISH              BOOL                 not null,
constraint PK_ANALYSISRUN primary key (ANALYSISRUNID)
);

/*==============================================================*/
/* Table: ANALYZEDEXON                                          */
/*==============================================================*/
create table ANALYZEDEXON (
ANALYSISID           INT4                 not null,
ANALYSISRUNID        INT4                 not null,
ENST                 TEXT                 not null,
EXON                 INT2                 not null,
constraint PK_ANALYZEDEXON primary key (ANALYSISID, ANALYSISRUNID, ENST, EXON)
);

/*==============================================================*/
/* Table: CAMPAIGN                                              */
/*==============================================================*/
create table CAMPAIGN (
CAMPAIGN             TEXT                 not null,
CAMPAIGNDESC         TEXT                 null,
DIRECTORY            TEXT                 null,
constraint PK_CAMPAIGN primary key (CAMPAIGN)
);

/*==============================================================*/
/* Table: CELLLINE                                              */
/*==============================================================*/
create table CELLLINE (
CELLLINENAME         TEXT                 not null,
SPECIES              TEXT                 not null,
ORGAN                TEXT                 null,
TISSUE_SUBTYPE       TEXT                 null,
METASTATIC_SITE      TEXT                 null,
HISTOLOGY_TYPE       TEXT                 null,
HISTOLOGY_SUBTYPE    TEXT                 null,
MORPHOLOGY           TEXT                 null,
TUMORTYPE            TEXT                 null,
GROWTH_TYPE          TEXT                 null,
GENDER               TEXT                 null,
PLOIDY               TEXT                 null,
AGE_AT_SURGERY       TEXT                 null,
STAGE                TEXT                 null,
GRADE                TEXT                 null,
ATCC_NO              TEXT                 null,
DSMZ_NO              TEXT                 null,
ECACC_NO             TEXT                 null,
JCRB_NO              TEXT                 null,
ICLC_NO              TEXT                 null,
RIKEN_NO             TEXT                 null,
KCLB_NO              TEXT                 null,
COSMICID             INT4                 null,
PUBMED               INT4                 null,
COMMENT              TEXT                 null,
TARGIDID             SERIAL               not null,
constraint PK_CELLLINE primary key (CELLLINENAME)
);

/*==============================================================*/
/* Table: CELLLINE2SELECTION                                    */
/*==============================================================*/
create table CELLLINE2SELECTION (
CELLLINENAME         TEXT                 not null,
CELLLINESELECTIONID  INT4                 not null,
LABEL                TEXT                 null,
constraint PK_CELLLINE2SELECTION primary key (CELLLINENAME, CELLLINESELECTIONID)
);

/*==============================================================*/
/* Table: CELLLINEASSIGNMENT                                    */
/*==============================================================*/
create table CELLLINEASSIGNMENT (
CELLLINENAME         TEXT                 not null,
CELLLINEPANEL        TEXT                 not null,
constraint PK_CELLLINEASSIGNMENT primary key (CELLLINENAME, CELLLINEPANEL)
);

/*==============================================================*/
/* Table: CELLLINEPANEL                                         */
/*==============================================================*/
create table CELLLINEPANEL (
CELLLINEPANEL        TEXT                 not null,
CELLLINEPANELDESCRIPTION TEXT                 null,
constraint PK_CELLLINEPANEL primary key (CELLLINEPANEL)
);

/*==============================================================*/
/* Table: CELLLINESELECTION                                     */
/*==============================================================*/
create table CELLLINESELECTION (
CELLLINESELECTIONID  INT4                 not null,
DESCRIPTION          TEXT                 null,
UPDATEDATE           TIMESTAMP            null,
USERNAME             TEXT                 null,
PUBLISH              BOOLEAN              null,
CAMPAIGN             TEXT                 null,
DRCPARAMETER         TEXT                 null,
ENSG                 TEXT                 null,
LOG2CNCUTOFFLOW      FLOAT4               null,
LOG2CNCUTOFFHIGH     FLOAT4               null,
constraint PK_CELLLINESELECTION primary key (CELLLINESELECTIONID)
);

/*==============================================================*/
/* Table: CELLLINESELECTIONANALYSIS                             */
/*==============================================================*/
create table CELLLINESELECTIONANALYSIS (
CELLLINESELECTIONANALYSISID INT4                 not null,
CELLLINESELECTIONID  INT4                 not null,
ANALYSIS             TEXT                 null,
PVALUECUTOFF         FLOAT4               null,
ADJPVALUECUTOFF      FLOAT4               null,
FOLDCHANGECUTOFF     FLOAT4               null,
constraint PK_CELLLINESELECTIONANALYSIS primary key (CELLLINESELECTIONANALYSISID)
);

/*==============================================================*/
/* Table: CELLLINESELECTIONANALYSIS2GENE                        */
/*==============================================================*/
create table CELLLINESELECTIONANALYSIS2GENE (
ENSG                 TEXT                 null,
CELLLINESELECTIONANALYSISID INT4                 null,
PVALUE               FLOAT4               null,
ADJPVALUE            FLOAT4               null,
LOG2FOLDCHANGE       FLOAT4               null
);

/*==============================================================*/
/* Table: COPYNUMBERREGION                                      */
/*==============================================================*/
create table COPYNUMBERREGION (
HYBRIDIZATIONID      TEXT                 not null,
ALGORITHM            TEXT                 not null,
CHROMOSOME           INT2                 not null,
START                INT4                 not null,
STOP                 INT4                 not null,
LOG2RELATIVECOPYNUMBER FLOAT4               null,
SNPCOUNT             INT4                 null,
CALL                 TEXT                 null,
TOTALABSCOPYNUMBER   FLOAT4               null,
MINORABSCOPYNUMBER   FLOAT4               null,
CONFIDENCE           FLOAT4               null,
constraint PK_COPYNUMBERREGION primary key (HYBRIDIZATIONID, ALGORITHM, CHROMOSOME, START)
);

/*==============================================================*/
/* Table: COSMICEXTRACT                                         */
/*==============================================================*/
create table COSMICEXTRACT (
CELLLINENAME         TEXT                 not null,
GENE_NAME            TEXT                 not null,
ID_MUTATION          INT4                 not null,
ID_TRANSCRIPT        INT4                 not null,
ID_SAMPLE            INT4                 null,
CDS_MUT_SYNTAX       TEXT                 null,
AA_MUT_SYNTAX        TEXT                 null,
GENOMIC_WT_ALLELE_SEQ TEXT                 null,
GENOMIC_MUT_ALLELE_SEQ TEXT                 null,
SOMATIC_STATUS       TEXT                 null,
STATUS_CONSEQUENCE   TEXT                 null,
PERCENT_MUT_ALLELE   FLOAT4               null,
GENOME_START         INT4                 null,
GENOME_STOP          INT4                 null,
STRAND               CHAR                 null,
CHROMOSOME           INT2                 null,
ID_GENE              INT4                 null,
ENSEMBL_GENOME_START INT4                 null,
ENSEMBL_GENOME_STOP  INT4                 null,
ENSCHROM             INT2                 null,
SNP                  BOOL                 null,
constraint PK_COSMICEXTRACT primary key (CELLLINENAME, GENE_NAME, ID_MUTATION, ID_TRANSCRIPT)
);

/*==============================================================*/
/* Table: COSMICEXTRACTNGS                                      */
/*==============================================================*/
create table COSMICEXTRACTNGS (
CELLLINENAME         TEXT                 not null,
GENE_NAME            TEXT                 not null,
ID_MUTATION          INT4                 not null,
ID_TRANSCRIPT        INT4                 not null,
ID_SAMPLE            INT4                 null,
CDS_MUT_SYNTAX       TEXT                 null,
AA_MUT_SYNTAX        TEXT                 null,
GENOMIC_WT_ALLELE_SEQ TEXT                 null,
GENOMIC_MUT_ALLELE_SEQ TEXT                 null,
SOMATIC_STATUS       TEXT                 null,
STATUS_CONSEQUENCE   TEXT                 null,
PERCENT_MUT_ALLELE   FLOAT4               null,
GENOME_START         INT4                 null,
GENOME_STOP          INT4                 null,
STRAND               CHAR                 null,
CHROMOSOME           INT2                 null,
ID_GENE              INT4                 null,
ENSEMBL_GENOME_START INT4                 null,
ENSEMBL_GENOME_STOP  INT4                 null,
ENSCHROM             INT2                 null,
SNP                  BOOL                 null,
constraint PK_COSMICEXTRACTNGS primary key (CELLLINENAME, GENE_NAME, ID_MUTATION, ID_TRANSCRIPT)
);

/*==============================================================*/
/* Table: CURVEANALYSIS                                         */
/*==============================================================*/
create table CURVEANALYSIS (
PLATEID              INT4                 not null,
WELL                 TEXT                 not null,
DOSERESPONSECURVE    INT4                 not null,
constraint PK_CURVEANALYSIS primary key (PLATEID, WELL, DOSERESPONSECURVE)
);

/*==============================================================*/
/* Table: DOSERESPONSECURVE                                     */
/*==============================================================*/
create table DOSERESPONSECURVE (
DOSERESPONSECURVE    INT4                 not null,
EC50                 FLOAT4               null,
EC50CALC             FLOAT4               null,
EC50OPERATOR         CHAR(1)              null,
TOP                  FLOAT4               null,
BOTTOM               FLOAT4               null,
SLOPE                FLOAT4               null,
IC50                 FLOAT4               null,
IC50CALC             FLOAT4               null,
IC50OPERATOR         CHAR(1)              null,
GI50                 FLOAT4               null,
GI50CALC             FLOAT4               null,
GI50OPERATOR         CHAR(1)              null,
TGI                  FLOAT4               null,
TGICALC              FLOAT4               null,
TGIOPERATOR          CHAR(1)              null,
TZERO                FLOAT4               null,
TZEROSD              FLOAT4               null,
ZERO                 FLOAT4               null,
NEGCONTROL           FLOAT4               null,
NEGCONTROLSD         FLOAT4               null,
AMAX                 FLOAT4               null,
ACTAREA              FLOAT4               null,
IMAGEPATH            TEXT                 null,
CLASSIFICATION       TEXT                 null,
DRCCLASS             TEXT                 null,
WRONGCONCRANGE       BOOL                 null,
FLATCURVE            BOOL                 null,
CALCIMPOSSIBLE       BOOL                 null,
BIPHASICCURVE        BOOL                 null,
INACTIVE             BOOL                 null,
VALID                BOOL                 null,
RECALCULATE          BOOL                 null,
LOCKED               BOOL                 null,
DEVIATION            FLOAT4               null,
QUALITYSCORE         FLOAT4               null,
FIXEDTOP             BOOL                 null,
FIXEDBOTTOM          BOOL                 null,
FIXEDSLOPE           BOOL                 null,
FIXEDEC50            BOOL                 null,
COMMENT              TEXT                 null,
CELLLINENAME         TEXT                 null,
DRUGID               TEXT                 null,
SAMPLEID             INT4                 null,
CELLSPERWELL         INT4                 null,
TIMEPOINT            TEXT                 null,
PRETREATMENT         TEXT                 null,
CAMPAIGN             TEXT                 null,
ROUND                INT2                 null,
PROLIFERATIONTEST    TEXT                 null,
LABORATORY           TEXT                 null,
constraint PK_DOSERESPONSECURVE primary key (DOSERESPONSECURVE)
);

/*==============================================================*/
/* Table: DOSERESPONSEMATRIX                                    */
/*==============================================================*/
create table DOSERESPONSEMATRIX (
DOSERESPONSEMATRIX   INT4                 not null,
MAXCGIBLISSEXCESS    FLOAT4               null,
MINCGIBLISSEXCESS    FLOAT4               null,
MAXPOCBLISSEXCESS    FLOAT4               null,
MINPOCBLISSEXCESS    FLOAT4               null,
MINCGIHSAEXCESS      FLOAT4               null,
MAXCGIHSAEXCESS      FLOAT4               null,
MINPOCHSAEXCESS      FLOAT4               null,
MAXPOCHSAEXCESS      FLOAT4               null,
MIN3CGIBLISSEXCESS   FLOAT4               null,
MAX3CGIBLISSEXCESS   FLOAT4               null,
IMAGEPATH            TEXT                 null,
TZERO                FLOAT4               null,
TZEROSD              FLOAT4               null,
ZERO                 FLOAT4               null,
NEGCONTROL           FLOAT4               null,
NEGCONTROLSD         FLOAT4               null,
VALID                BOOL                 null,
RECALCULATE          BOOL                 null,
LOCKED               BOOL                 null,
CELLLINENAME         TEXT                 null,
DRUGID               TEXT                 null,
SAMPLEID             INT4                 null,
DRUGID2              TEXT                 null,
SAMPLEID2            INT4                 null,
CELLSPERWELL         INT4                 null,
TREATMENTTIME        TEXT                 null,
TREATMENTTIME2       TEXT                 null,
TIMEPOINT            TEXT                 null,
PRETREATMENT         TEXT                 null,
CAMPAIGN             TEXT                 null,
ROUND                INT2                 null,
PROLIFERATIONTEST    TEXT                 null,
LABORATORY           TEXT                 null,
constraint PK_DOSERESPONSEMATRIX primary key (DOSERESPONSEMATRIX)
);

/*==============================================================*/
/* Table: FUSIONDESCRIPTION                                     */
/*==============================================================*/
create table FUSIONDESCRIPTION (
PROCESSEDFUSION      INT4                 not null,
FUSIONTYPE           TEXT                 not null,
constraint PK_FUSIONDESCRIPTION primary key (PROCESSEDFUSION, FUSIONTYPE)
);

/*==============================================================*/
/* Table: FUSIONTYPE                                            */
/*==============================================================*/
create table FUSIONTYPE (
FUSIONTYPE           TEXT                 not null,
FUSIONDESCRIPTION    TEXT                 null,
constraint PK_FUSIONTYPE primary key (FUSIONTYPE)
);

/*==============================================================*/
/* Table: HYBRIDIZATION                                         */
/*==============================================================*/
create table HYBRIDIZATION (
HYBRIDIZATIONID      TEXT                 not null,
CHIPNAME             TEXT                 null,
CELLLINENAME         TEXT                 null,
HYBRIDIZATIONGROUPID INT4                 null,
LABORATORY           TEXT                 null,
HYBRIDIZATIONOK      BOOL                 null,
SNPCALL              FLOAT4               null,
PICNICPLOIDY         FLOAT4               null,
CELLBATCHID          INT4                 null,
COSMICID             INT4                 null,
MOCHA                INT4                 null,
DIRECTORY            TEXT                 null,
COMMENT              TEXT                 null,
PUBLISH              BOOL                 null,
ISXENOGRAFT          BOOL                 null,
COMPOUND             TEXT                 null,
SAMPLE               INT4                 null,
constraint PK_HYBRIDIZATION primary key (HYBRIDIZATIONID)
);

/*==============================================================*/
/* Table: HYBRIDIZATIONGROUP                                    */
/*==============================================================*/
create table HYBRIDIZATIONGROUP (
HYBRIDIZATIONGROUPID INT4                 not null,
HYBRIDIZATIONGROUPNAME TEXT                 null,
RDATAFILEPATH        TEXT                 null,
constraint PK_HYBRIDIZATIONGROUP primary key (HYBRIDIZATIONGROUPID)
);

/*==============================================================*/
/* Table: MATRIXANALYSIS                                        */
/*==============================================================*/
create table MATRIXANALYSIS (
PLATEID              INT4                 not null,
WELL                 TEXT                 not null,
DOSERESPONSEMATRIX   INT4                 not null,
constraint PK_MATRIXANALYSIS primary key (PLATEID, WELL, DOSERESPONSEMATRIX)
);

/*==============================================================*/
/* Table: MEASUREDVALUE                                         */
/*==============================================================*/
create table MEASUREDVALUE (
PLATEID              INT4                 not null,
WELL                 TEXT                 not null,
CELLLINENAME         TEXT                 null,
CELLBATCHID          INT4                 null,
CELLSPERWELL         INT4                 null,
CATEGORY             TEXT                 null,
DRUGID               TEXT                 null,
SAMPLEID             INT4                 null,
CONCENTRATION        FLOAT4               null,
DRUGID2              TEXT                 null,
SAMPLEID2            INT4                 null,
CONCENTRATION2       FLOAT4               null,
PRETREATMENT         TEXT                 null,
SIGNAL               FLOAT4               null,
VALID                BOOL                 null,
constraint PK_MEASUREDVALUE primary key (PLATEID, WELL)
);

/*==============================================================*/
/* Table: MUTATION                                              */
/*==============================================================*/
create table MUTATION (
ANALYSISID           INT4                 not null,
ANALYSISRUNID        INT4                 not null,
CHROMOSOME           TEXT                 not null,
STARTPOS             INT8                 not null,
ENDPOS               INT8                 not null,
ENST                 TEXT                 not null,
MUTATIONTYPE         TEXT                 not null,
MUTATIONEFFECT       TEXT                 null,
ASSEMBLY             TEXT                 null,
GENOMICREGION        TEXT                 null,
EXON                 INT2                 null,
CDNAMUTATION         TEXT                 not null,
PROTEINMUTATION      TEXT                 null,
SNP                  BOOL                 null,
SNPSOURCE            TEXT                 null,
DBSNPID              TEXT                 null,
NUMREADS             INT4                 null,
NUMMUTANTREADS       INT4                 null,
NUMREFERENCEREADS    INT4                 null,
ZYGOSITY             FLOAT4               null,
QUALITYSCORE         FLOAT4               null,
SIFTSCORE            FLOAT4               null,
RNAZYGOSITY          FLOAT4               null,
constraint PK_MUTATION primary key (ANALYSISID, ANALYSISRUNID, CHROMOSOME, STARTPOS, ENDPOS, ENST, CDNAMUTATION)
);

/*==============================================================*/
/* Table: MUTATIONBLACKLIST                                     */
/*==============================================================*/
create table MUTATIONBLACKLIST (
STARTPOS             INT8                 not null,
ENDPOS               INT8                 not null,
CHROMOSOME           TEXT                 not null,
ENST                 TEXT                 not null,
CDNAMUTATION         TEXT                 not null,
constraint PK_MUTATIONBLACKLIST primary key (STARTPOS, ENDPOS, CHROMOSOME, ENST, CDNAMUTATION)
);

/*==============================================================*/
/* Table: MUTATIONEFFECT                                        */
/*==============================================================*/
create table MUTATIONEFFECT (
MUTATIONEFFECT       TEXT                 not null,
DESCRIPTION          TEXT                 null,
constraint PK_MUTATIONEFFECT primary key (MUTATIONEFFECT)
);

/*==============================================================*/
/* Table: MUTATIONTYPE                                          */
/*==============================================================*/
create table MUTATIONTYPE (
MUTATIONTYPE         TEXT                 not null,
DESCRIPTION          TEXT                 null,
constraint PK_MUTATIONTYPE primary key (MUTATIONTYPE)
);

/*==============================================================*/
/* Table: NGSGROUP                                              */
/*==============================================================*/
create table NGSGROUP (
NGSGROUPID           INT4                 not null,
NGSNAME              TEXT                 null,
RDATAFILEPATH        TEXT                 null,
PROCESSINGPIPELINE   TEXT                 null,
constraint PK_NGSGROUP primary key (NGSGROUPID)
);

/*==============================================================*/
/* Table: NGSPROTOCOL                                           */
/*==============================================================*/
create table NGSPROTOCOL (
NGSPROTOCOLID        INT4                 not null,
PLEXITY              INT2                 null,
STRANDNESS           TEXT                 null,
RNASELECTION         TEXT                 null,
constraint PK_NGSPROTOCOL primary key (NGSPROTOCOLID)
);

/*==============================================================*/
/* Table: NGSRUN                                                */
/*==============================================================*/
create table NGSRUN (
NGSID                TEXT                 not null,
CELLLINENAME         TEXT                 null,
NGSPROTOCOLID        INT4                 null,
NGSGROUPID           INT4                 null,
LABORATORY           TEXT                 null,
CELLBATCHID          INT4                 null,
DIRECTORY            TEXT                 null,
ISXENOGRAFT          BOOL                 null,
PUBLISH              BOOL                 null,
COMMENT              TEXT                 null,
CANONICAL            BOOL                 null,
constraint PK_NGSRUN primary key (NGSID)
);

/*==============================================================*/
/* Table: PLATE                                                 */
/*==============================================================*/
create table PLATE (
PLATEID              INT4                 not null,
PROLIFERATIONTEST    TEXT                 not null,
LABORATORY           TEXT                 null,
CAMPAIGN             TEXT                 null,
TREATMENTTIME        TEXT                 null,
TREATMENTTIME2       TEXT                 null,
TIMEPOINT            TEXT                 null,
DATAFILE             TEXT                 null,
PLATEINDATAFILE      INT2                 null,
ROUND                INT2                 null,
constraint PK_PLATE primary key (PLATEID)
);

/*==============================================================*/
/* Table: PROCESSEDCOPYNUMBER                                   */
/*==============================================================*/
create table PROCESSEDCOPYNUMBER (
CELLLINENAME         TEXT                 not null,
ENSG                 TEXT                 not null,
LOG2RELATIVECOPYNUMBER FLOAT4               null,
LOG2RELATIVECOPYNUMBERDEV FLOAT4               null,
COPYNUMBERGAININTRON BOOL                 null,
COPYNUMBERLOSSINTRON BOOL                 null,
COPYNUMBERGAINEXON   BOOL                 null,
COPYNUMBERLOSSEXON   BOOL                 null,
GAP                  BOOL                 null,
JUMP                 BOOL                 null,
EXONICCHANGE         BOOL                 null,
INTRONICCHANGE       BOOL                 null,
COSMICDELETION       TEXT                 null,
COSMICZYGOSITY       FLOAT4               null,
CSDELETION           TEXT                 null,
CSZYGOSITY           FLOAT4               null,
NGSDELETION          TEXT                 null,
NGSZYGOSITY          FLOAT4               null,
SNPCHIPALTERATION    TEXT                 null,
SNPCHIPZYGOSITY      FLOAT4               null,
NUMSOURCES           INT2                 null,
TOTALABSCOPYNUMBER   FLOAT4               null,
TOTALABSCOPYNUMBERDEV FLOAT4               null,
MINORABSCOPYNUMBER   FLOAT4               null,
MINORABSCOPYNUMBERDEV FLOAT4               null,
LOSSOFHETEROZYGOSITY BOOL                 null,
constraint PK_PROCESSEDCOPYNUMBER primary key (CELLLINENAME, ENSG)
);

/*==============================================================*/
/* Table: PROCESSEDFUSIONGENE                                   */
/*==============================================================*/
create table PROCESSEDFUSIONGENE (
PROCESSEDFUSION      INT4                 not null,
CELLLINENAME         TEXT                 not null,
ENSG1                TEXT                 not null,
ENSG2                TEXT                 not null,
COUNTSOFCOMMONMAPPINGREADS INT4                 null,
SPANNINGPAIRS        INT4                 null,
SPANNINGUNIQUEREADS  INT4                 null,
LONGESTANCHORFOUND   INT4                 null,
FUSIONFINDINGMETHOD  TEXT                 null,
CHRGENE1             TEXT                 null,
CHRGENE2             TEXT                 null,
NUCLGENE1            INT4                 null,
NUCLGENE2            INT4                 null,
STRANDGENE1          CHAR                 null,
STRANDGENE2          CHAR                 null,
NGSID                TEXT                 null,
PREDICTEDEFFECT      TEXT                 null,
constraint PK_PROCESSEDFUSIONGENE primary key (PROCESSEDFUSION)
);

/*==============================================================*/
/* Table: PROCESSEDRNASEQ                                       */
/*==============================================================*/
create table PROCESSEDRNASEQ (
NGSID                TEXT                 not null,
ENSG                 TEXT                 not null,
LOG2FPKM             REAL                 null,
LOG2TPM              REAL                 null,
COUNTS               INT4                 null,
STATUS               CHAR                 null,
constraint PK_PROCESSEDRNASEQ primary key (NGSID, ENSG)
);

/*==============================================================*/
/* Table: PROCESSEDRNASEQJSON                                   */
/*==============================================================*/
create table PROCESSEDRNASEQJSON (
CELLLINENAME         TEXT                 not null,
LOG2TPM              JSONB                null,
COUNTS               JSONB                null,
constraint PK_PROCESSEDRNASEQJSON primary key (CELLLINENAME)
);

/*==============================================================*/
/* Table: PROCESSEDSEQUENCE                                     */
/*==============================================================*/
create table PROCESSEDSEQUENCE (
CELLLINENAME         TEXT                 not null,
ENST                 TEXT                 not null,
VERSIONNUMBER        INT2                 null,
BICSDNAMUTATION      TEXT                 null,
BICSAAMUTATION       TEXT                 null,
BICSZYGOSITY         FLOAT4               null,
BIEXONDNAMUTATION    TEXT                 null,
BIEXONAAMUTATION     TEXT                 null,
BIEXONZYGOSITY       FLOAT4               null,
BIWXSDNAMUTATION     TEXT                 null,
BIWXSAAMUTATION      TEXT                 null,
BIWXSZYGOSITY        FLOAT4               null,
BIWGSDNAMUTATION     TEXT                 null,
BIWGSAAMUTATION      TEXT                 null,
BIWGSZYGOSITY        FLOAT4               null,
BIWGSNONCODINGDNAMUTATION TEXT                 null,
BIWGSNONCODINGZYGOSITY FLOAT4               null,
COSMICCSDNAMUTATION  TEXT                 null,
COSMICCSAAMUTATION   TEXT                 null,
COSMICCSZYGOSITY     FLOAT4               null,
COSMICWXSDNAMUTATION TEXT                 null,
COSMICWXSAAMUTATION  TEXT                 null,
COSMICWXSZYGOSITY    FLOAT4               null,
CCLEWXSDNAMUTATION   TEXT                 null,
CCLEWXSAAMUTATION    TEXT                 null,
CCLEWXSZYGOSITY      FLOAT4               null,
DNAMUTATION          TEXT                 null,
AAMUTATION           TEXT                 null,
ZYGOSITY             FLOAT4               null,
EXONSCOMPLETE        FLOAT4               null,
CONFIRMEDDETAIL      BOOL                 null,
NUMSOURCES           INT2                 null,
constraint PK_PROCESSEDSEQUENCE primary key (CELLLINENAME, ENST)
);

/*==============================================================*/
/* Table: PROLIFERATIONTEST                                     */
/*==============================================================*/
create table PROLIFERATIONTEST (
PROLIFERATIONTEST    TEXT                 not null,
PROLIFERATIONTESTNAME TEXT                 null,
METHOD               TEXT                 null,
constraint PK_PROLIFERATIONTEST primary key (PROLIFERATIONTEST)
);

/*==============================================================*/
/* Table: REFERRINGTZEROPLATE                                   */
/*==============================================================*/
create table REFERRINGTZEROPLATE (
TZEROPLATEID         INT4                 not null,
PLATEID              INT4                 not null,
constraint PK_REFERRINGTZEROPLATE primary key (TZEROPLATEID, PLATEID)
);

/*==============================================================*/
/* Table: SAMPLEPREPARATIONINNGSRUN                             */
/*==============================================================*/
create table SAMPLEPREPARATIONINNGSRUN (
SAMPLEPREPARATIONID  TEXT                 not null,
FLOWCELLID           TEXT                 not null,
FLOWCELLLANE         INT2                 not null,
ANALYSISRUNID        INT4                 not null,
FINALSEQUENCINGLIBRARY TEXT                 null,
BAITDESIGN           TEXT                 null,
constraint PK_SAMPLEPREPARATIONINNGSRUN primary key (SAMPLEPREPARATIONID, FLOWCELLID, FLOWCELLLANE, ANALYSISRUNID)
);

/*==============================================================*/
/* Table: SIMILARITY                                            */
/*==============================================================*/
create table SIMILARITY (
SIMILARITYID         INT4                 not null,
CELLLINENAME         TEXT                 not null,
SIMILARITYTYPE       TEXT                 null,
SOURCE               TEXT                 null,
COMMENT              TEXT                 null,
constraint PK_SIMILARITY primary key (SIMILARITYID, CELLLINENAME)
);

/*==============================================================*/
/* Table: SIMILARITYTYPE                                        */
/*==============================================================*/
create table SIMILARITYTYPE (
SIMILARITYTYPE       TEXT                 not null,
SIMILARITYDESCRIPTION TEXT                 null,
constraint PK_SIMILARITYTYPE primary key (SIMILARITYTYPE)
);

/*==============================================================*/
/* Table: TREATMENT                                             */
/*==============================================================*/
create table TREATMENT (
NGSID                TEXT                 not null,
DRUGID               TEXT                 not null,
TREATMENTTIME        TEXT                 not null,
CONCENTRATION        FLOAT4               null,
constraint PK_TREATMENT primary key (NGSID, DRUGID, TREATMENTTIME)
);

/*==============================================================*/
/* Table: VERSION                                               */
/*==============================================================*/
create table VERSION (
VERSIONNUMBER        INT2                 not null,
DATE                 DATE                 null,
constraint PK_VERSION primary key (VERSIONNUMBER)
);

alter table ANALYSIS
   add constraint FK_ANALYSIS_ANALYSISRUN foreign key (ANALYSISRUNID)
      references ANALYSISRUN (ANALYSISRUNID)
      on delete cascade on update cascade;

alter table ANALYSIS
   add constraint FK_ANALYSIS_REFERENCE_VERSION foreign key (VERSIONNUMBER)
      references VERSION (VERSIONNUMBER)
      on delete cascade on update cascade;

alter table ANALYSIS
   add constraint FK_ANALYSIS_REFERENCE_GENE foreign key (ENSG)
      references GENE (ENSG)
      on delete restrict on update cascade;

alter table ANALYSISRUN
   add constraint FK_ANALYSIS_REFERENCE_CELLLINE foreign key (CELLLINENAME)
      references CELLLINE (CELLLINENAME)
      on delete restrict on update restrict;

alter table ANALYZEDEXON
   add constraint FK_ANALYZED_REFERENCE_TRANSCRI foreign key (ENST)
      references TRANSCRIPT (ENST)
      on delete cascade on update restrict;

alter table ANALYZEDEXON
   add constraint FK_ANALYZED_REFERENCE_ANALYSIS foreign key (ANALYSISID, ANALYSISRUNID)
      references ANALYSIS (ANALYSISID, ANALYSISRUNID)
      on delete cascade on update restrict;

alter table CELLLINE2SELECTION
   add constraint FK_CELLLINE2SELECTION_CELLLINE foreign key (CELLLINENAME)
      references CELLLINE (CELLLINENAME)
      on delete cascade on update cascade;

alter table CELLLINE2SELECTION
   add constraint FK_CELLLINE_2_SELECTION foreign key (CELLLINESELECTIONID)
      references CELLLINESELECTION (CELLLINESELECTIONID)
      on delete cascade on update cascade;

alter table CELLLINEASSIGNMENT
   add constraint FK_CELLLINE_Assignment foreign key (CELLLINENAME)
      references CELLLINE (CELLLINENAME)
      on delete restrict on update restrict;

alter table CELLLINEASSIGNMENT
   add constraint FK_CELLLINE_ASSIGNMENT_PANEL foreign key (CELLLINEPANEL)
      references CELLLINEPANEL (CELLLINEPANEL)
      on delete restrict on update restrict;

alter table CELLLINESELECTION
   add constraint FK_CELLLINE_REFERENCE_CAMPAIGN foreign key (CAMPAIGN)
      references CAMPAIGN (CAMPAIGN)
      on delete cascade on update cascade;

alter table CELLLINESELECTION
   add constraint FK_CELLLINESELECTION_GENE foreign key (ENSG)
      references GENE (ENSG)
      on delete cascade on update cascade;

alter table CELLLINESELECTIONANALYSIS
   add constraint FK_CELLLINESELANALYSIS_CELLLINE foreign key (CELLLINESELECTIONID)
      references CELLLINESELECTION (CELLLINESELECTIONID)
      on delete restrict on update restrict;

alter table CELLLINESELECTIONANALYSIS2GENE
   add constraint FK_CELLLINESELANAL_GENE foreign key (ENSG)
      references GENE (ENSG)
      on delete restrict on update restrict;

alter table CELLLINESELECTIONANALYSIS2GENE
   add constraint FK_CLSELANALGENE__CLSELANAL foreign key (CELLLINESELECTIONANALYSISID)
      references CELLLINESELECTIONANALYSIS (CELLLINESELECTIONANALYSISID)
      on delete restrict on update restrict;

alter table COPYNUMBERREGION
   add constraint FK_COPYNUMB_REFERENCE_HYBRIDIZ foreign key (HYBRIDIZATIONID)
      references HYBRIDIZATION (HYBRIDIZATIONID)
      on delete cascade on update cascade;

alter table CURVEANALYSIS
   add constraint FK_CURVEANA_REFERENCE_MEASURED foreign key (PLATEID, WELL)
      references MEASUREDVALUE (PLATEID, WELL)
      on delete cascade on update cascade;

alter table CURVEANALYSIS
   add constraint FK_CURVEANA_REFERENCE_DOSERESP foreign key (DOSERESPONSECURVE)
      references DOSERESPONSECURVE (DOSERESPONSECURVE)
      on delete cascade on update cascade;

alter table FUSIONDESCRIPTION
   add constraint FK_FUSIONDE_REFERENCE_PROCESSE foreign key (PROCESSEDFUSION)
      references PROCESSEDFUSIONGENE (PROCESSEDFUSION)
      on delete restrict on update restrict;

alter table FUSIONDESCRIPTION
   add constraint FK_FUSIONDE_REFERENCE_FUSIONTY foreign key (FUSIONTYPE)
      references FUSIONTYPE (FUSIONTYPE)
      on delete restrict on update restrict;

alter table HYBRIDIZATION
   add constraint FK_HYBRIDIZ_REFERENCE_CHIPTECH foreign key (CHIPNAME)
      references CHIPTECHNOLOGY (CHIPNAME)
      on delete cascade on update cascade;

alter table HYBRIDIZATION
   add constraint FK_HYBRIDIZ_REFERENCE_HYBRIDIZ foreign key (HYBRIDIZATIONGROUPID)
      references HYBRIDIZATIONGROUP (HYBRIDIZATIONGROUPID)
      on delete restrict on update restrict;

alter table HYBRIDIZATION
   add constraint FK_HYBRIDIZ_REFERENCE_CELLLINE foreign key (CELLLINENAME)
      references CELLLINE (CELLLINENAME)
      on delete cascade on update cascade;

alter table HYBRIDIZATION
   add constraint FK_HYBRIDIZ_REFERENCE_LABORATO foreign key (LABORATORY)
      references LABORATORY (LABORATORY)
      on delete restrict on update restrict;

alter table MATRIXANALYSIS
   add constraint FK_MATRIXAN_REFERENCE_MEASURED foreign key (PLATEID, WELL)
      references MEASUREDVALUE (PLATEID, WELL)
      on delete cascade on update cascade;

alter table MATRIXANALYSIS
   add constraint FK_MATRIXAN_REFERENCE_DOSERESP foreign key (DOSERESPONSEMATRIX)
      references DOSERESPONSEMATRIX (DOSERESPONSEMATRIX)
      on delete cascade on update cascade;

alter table MEASUREDVALUE
   add constraint FK_MEASURED_REFERENCE_DRUG2 foreign key (DRUGID)
      references DRUG (DRUGID)
      on delete restrict on update cascade;

alter table MEASUREDVALUE
   add constraint FK_MEASURED_REFERENCE_DRUG foreign key (DRUGID2)
      references DRUG (DRUGID)
      on delete restrict on update restrict;

alter table MEASUREDVALUE
   add constraint FK_MEASURED_REFERENCE_PLATE foreign key (PLATEID)
      references PLATE (PLATEID)
      on delete cascade on update cascade;

alter table MEASUREDVALUE
   add constraint FK_MEASURED_REFERENCE_CELLLINE foreign key (CELLLINENAME)
      references CELLLINE (CELLLINENAME)
      on delete restrict on update restrict;

alter table MUTATION
   add constraint FK_MUTATION_REFERENCE_ANALYSIS foreign key (ANALYSISID, ANALYSISRUNID)
      references ANALYSIS (ANALYSISID, ANALYSISRUNID)
      on delete cascade on update restrict;

alter table MUTATION
   add constraint FK_MUTATION_REFERENCE_TYPE foreign key (MUTATIONTYPE)
      references MUTATIONTYPE (MUTATIONTYPE)
      on delete restrict on update restrict;

alter table MUTATION
   add constraint FK_MUTATION_REFERENCE_TRANSCRI foreign key (ENST)
      references TRANSCRIPT (ENST)
      on delete restrict on update cascade;

alter table MUTATION
   add constraint FK_MUTATION_REFERENCE_Effect foreign key (MUTATIONEFFECT)
      references MUTATIONEFFECT (MUTATIONEFFECT)
      on delete restrict on update restrict;

alter table MUTATIONBLACKLIST
   add constraint FK_MUTATIONBLACK_TRANSCRIPT foreign key (ENST)
      references TRANSCRIPT (ENST)
      on delete restrict on update restrict;

alter table NGSRUN
   add constraint FK_NGSRUN_REFERENCE_CELLLINE foreign key (CELLLINENAME)
      references CELLLINE (CELLLINENAME)
      on delete restrict on update restrict;

alter table NGSRUN
   add constraint FK_NGSRUN_REFERENCE_NGSPROTO foreign key (NGSPROTOCOLID)
      references NGSPROTOCOL (NGSPROTOCOLID)
      on delete restrict on update restrict;

alter table NGSRUN
   add constraint FK_NGSRUN_REFERENCE_NGSGROUP foreign key (NGSGROUPID)
      references NGSGROUP (NGSGROUPID)
      on delete restrict on update restrict;

alter table NGSRUN
   add constraint FK_NGSRUN_REFERENCE_LABORATO foreign key (LABORATORY)
      references LABORATORY (LABORATORY)
      on delete restrict on update restrict;

alter table PLATE
   add constraint FK_PLATE_REFERENCE_PROLIFER foreign key (PROLIFERATIONTEST)
      references PROLIFERATIONTEST (PROLIFERATIONTEST)
      on delete restrict on update cascade;

alter table PLATE
   add constraint FK_PLATE_REFERENCE_CAMPAIGN foreign key (CAMPAIGN)
      references CAMPAIGN (CAMPAIGN)
      on delete cascade on update cascade;

alter table PLATE
   add constraint FK_PLATE_REFERENCE_LABORATO foreign key (LABORATORY)
      references LABORATORY (LABORATORY)
      on delete restrict on update cascade;

alter table PROCESSEDCOPYNUMBER
   add constraint FK_PROCESSE_CopyNumber_CELLLINE foreign key (CELLLINENAME)
      references CELLLINE (CELLLINENAME)
      on delete restrict on update restrict;

alter table PROCESSEDCOPYNUMBER
   add constraint FK_PROCESSEDCOPY_2_GENE foreign key (ENSG)
      references GENE (ENSG)
      on delete cascade on update cascade;

alter table PROCESSEDFUSIONGENE
   add constraint FK_Fusion_GENE1 foreign key (ENSG1)
      references GENE (ENSG)
      on delete restrict on update restrict;

alter table PROCESSEDFUSIONGENE
   add constraint FK_fusion_GENE2 foreign key (ENSG2)
      references GENE (ENSG)
      on delete restrict on update restrict;

alter table PROCESSEDFUSIONGENE
   add constraint FK_PROCESSE_REFERENCE_CELLLINE foreign key (CELLLINENAME)
      references CELLLINE (CELLLINENAME)
      on delete restrict on update restrict;

alter table PROCESSEDRNASEQ
   add constraint FK_PROCESSEDRNASEQ_GENE foreign key (ENSG)
      references GENE (ENSG)
      on delete restrict on update restrict;

alter table PROCESSEDRNASEQ
   add constraint FK_PROCESSE_REFERENCE_NGSRUN foreign key (NGSID)
      references NGSRUN (NGSID)
      on delete cascade on update cascade;

alter table PROCESSEDRNASEQJSON
   add constraint FK_JSON_CELLLINE foreign key (CELLLINENAME)
      references CELLLINE (CELLLINENAME)
      on delete restrict on update restrict;

alter table PROCESSEDSEQUENCE
   add constraint FK_PROCESSE_REFERENCE_TRANSCRI foreign key (ENST)
      references TRANSCRIPT (ENST)
      on delete cascade on update cascade;

alter table PROCESSEDSEQUENCE
   add constraint FK_PROCESSE_REFERENCE_VERSION foreign key (VERSIONNUMBER)
      references VERSION (VERSIONNUMBER)
      on delete cascade on update cascade;

alter table PROCESSEDSEQUENCE
   add constraint FK_PROCESSEDSequence_CELLLINE foreign key (CELLLINENAME)
      references CELLLINE (CELLLINENAME)
      on delete restrict on update restrict;

alter table REFERRINGTZEROPLATE
   add constraint FK_REFERRIN_REF2PLATE_PLATE1 foreign key (PLATEID)
      references PLATE (PLATEID)
      on delete cascade on update cascade;

alter table REFERRINGTZEROPLATE
   add constraint FK_REFERRIN_REF2PLATE_PLATE2 foreign key (TZEROPLATEID)
      references PLATE (PLATEID)
      on delete cascade on update cascade;

alter table SAMPLEPREPARATIONINNGSRUN
   add constraint FK_SAMPLEPR_REFERENCE_ANALYSIS foreign key (ANALYSISRUNID)
      references ANALYSISRUN (ANALYSISRUNID)
      on delete cascade on update cascade;

alter table SIMILARITY
   add constraint FK_SIMILARI_REFERENCE_CELLLINE foreign key (CELLLINENAME)
      references CELLLINE (CELLLINENAME)
      on delete cascade on update cascade;

alter table SIMILARITY
   add constraint FK_SIMILARI_REFERENCE_SIMILARI foreign key (SIMILARITYTYPE)
      references SIMILARITYTYPE (SIMILARITYTYPE)
      on delete cascade on update cascade;

alter table TREATMENT
   add constraint FK_TREATMEN_REFERENCE_NGSRUN foreign key (NGSID)
      references NGSRUN (NGSID)
      on delete restrict on update restrict;

alter table TREATMENT
   add constraint FK_TREATMEN_REFERENCE_DRUG foreign key (DRUGID)
      references DRUG (DRUGID)
      on delete restrict on update restrict;

