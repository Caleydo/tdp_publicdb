/*==============================================================*/
/* DBMS name:      PostgreSQL 7.3                               */
/* Created on:     11.08.2017 10:08:02                          */
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
TISSUENAME           TEXT                 not null,
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
/* Table: COPYNUMBERREGION                                      */
/*==============================================================*/
create table COPYNUMBERREGION (
HYBRIDIZATIONID      TEXT                 null,
ALGORITHM            TEXT                 not null,
CHROMOSOME           INT2                 not null,
START                INT4                 not null,
STOP                 INT4                 not null,
LOG2RELATIVECOPYNUMBER FLOAT4               null,
SNPCOUNT             INT4                 null,
CALL                 TEXT                 null,
TOTALABSCOPYNUMBER   FLOAT4               null,
MINORABSCOPYNUMBER   FLOAT4               null,
CONFIDENCE           FLOAT4               null
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
/* Table: HLATYPE                                               */
/*==============================================================*/
create table HLATYPE (
NGSID                TEXT                 not null,
HLA_CLASS            TEXT                 not null,
ALLELE1              TEXT                 null,
ALLELE2              TEXT                 null,
constraint PK_HLATYPE primary key (NGSID, HLA_CLASS)
);

/*==============================================================*/
/* Table: HYBRIDIZATION                                         */
/*==============================================================*/
create table HYBRIDIZATION (
HYBRIDIZATIONID      TEXT                 not null,
CHIPNAME             TEXT                 null,
TISSUENAME           TEXT                 null,
LABORATORY           TEXT                 null,
HYBRIDIZATIONGROUPID INT4                 null,
HYBRIDIZATIONOK      BOOL                 null,
SNPCALL              FLOAT4               null,
PICNICPLOIDY         FLOAT4               null,
DIRECTORY            TEXT                 null,
COMMENT              TEXT                 null,
PUBLISH              BOOL                 null,
constraint PK_HYBRIDIZATION primary key (HYBRIDIZATIONID)
);

/*==============================================================*/
/* Table: HYBRIDIZATIONGROUP                                    */
/*==============================================================*/
create table HYBRIDIZATIONGROUP (
HYBRIDIZATIONGROUPID INT4                 not null,
HYBRIDIZATIONGROUPNAME TEXT                 null,
GEOSERIESNUMBER      TEXT                 null,
ARRAYEXPRESSNUMBER   TEXT                 null,
RDATAFILEPATH        TEXT                 null,
constraint PK_HYBRIDIZATIONGROUP primary key (HYBRIDIZATIONGROUPID)
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
MUTATIONTYPE         TEXT                 null,
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
/* Table: NGSRUN                                                */
/*==============================================================*/
create table NGSRUN (
NGSID                TEXT                 not null,
TISSUENAME           TEXT                 not null,
NGSPROTOCOLID        INT4                 null,
LABORATORY           TEXT                 null,
NGSGROUPID           INT4                 null,
CELLBATCHID          INT4                 null,
DIRECTORY            TEXT                 null,
ASSOCIATEDNGSID      TEXT                 null,
ISXENOGRAFT          BOOL                 null,
PUBLISH              BOOL                 null,
COMMENT              TEXT                 null,
CANONICAL            BOOL                 null,
constraint PK_NGSRUN primary key (NGSID)
);

/*==============================================================*/
/* Table: PATIENT                                               */
/*==============================================================*/
create table PATIENT (
PATIENTNAME          TEXT                 not null,
VITAL_STATUS         BOOL                 null,
DAYS_TO_BIRTH        INT4                 null,
GENDER               TEXT                 null,
HEIGHT               FLOAT4               null,
WEIGHT               FLOAT4               null,
RACE                 TEXT                 null,
ETHNICITY            TEXT                 null,
HISTORY_OF_NEOAD_TREATMENT TEXT                 null,
DAYS_TO_LAST_FOLLOWUP INT4                 null,
DAYS_TO_LAST_KNOWN_ALIVE INT4                 null,
DAYS_TO_DEATH        INT4                 null,
PERSON_NEOPLASM_CANCER_STATUS TEXT                 null,
constraint PK_PATIENT primary key (PATIENTNAME)
);

/*==============================================================*/
/* Table: PROCESSEDCOPYNUMBER                                   */
/*==============================================================*/
create table PROCESSEDCOPYNUMBER (
TISSUENAME           TEXT                 not null,
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
constraint PK_PROCESSEDCOPYNUMBER primary key (TISSUENAME, ENSG)
);

/*==============================================================*/
/* Table: PROCESSEDFUSIONGENE                                   */
/*==============================================================*/
create table PROCESSEDFUSIONGENE (
PROCESSEDFUSION      INT4                 not null,
TISSUENAME           TEXT                 not null,
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
ENSG                 TEXT                 not null,
NGSID                TEXT                 not null,
LOG2FPKM             REAL                 null,
LOG2TPM              REAL                 null,
COUNTS               INT4                 null,
STATUS               CHAR                 null,
constraint PK_PROCESSEDRNASEQ primary key (ENSG, NGSID)
);

/*==============================================================*/
/* Table: PROCESSEDSEQUENCE                                     */
/*==============================================================*/
create table PROCESSEDSEQUENCE (
TISSUENAME           TEXT                 not null,
ENST                 TEXT                 not null,
VERSIONNUMBER        INT2                 null,
DNAMUTATION          TEXT                 null,
AAMUTATION           TEXT                 null,
ZYGOSITY             FLOAT4               null,
EXONSCOMPLETE        FLOAT4               null,
constraint PK_PROCESSEDSEQUENCE primary key (TISSUENAME, ENST)
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
TISSUENAME           TEXT                 not null,
SIMILARITYTYPE       TEXT                 null,
SOURCE               TEXT                 null,
COMMENT              TEXT                 null,
constraint PK_SIMILARITY primary key (SIMILARITYID, TISSUENAME)
);

/*==============================================================*/
/* Table: TISSUE                                                */
/*==============================================================*/
create table TISSUE (
TISSUENAME           TEXT                 not null,
VENDORNAME           TEXT                 not null,
SPECIES              SPECIES_ENUM         not null,
ORGAN                TEXT                 null,
TUMORTYPE            TEXT                 null,
PATIENTNAME          TEXT                 null,
TUMORTYPE_ADJACENT   TEXT                 null,
TISSUE_SUBTYPE       TEXT                 null,
METASTATIC_SITE      TEXT                 null,
HISTOLOGY_TYPE       TEXT                 null,
HISTOLOGY_SUBTYPE    TEXT                 null,
GENDER               TEXT                 null,
AGE_AT_SURGERY       TEXT                 null,
STAGE                TEXT                 null,
GRADE                TEXT                 null,
SAMPLE_DESCRIPTION   TEXT                 null,
COMMENT              TEXT                 null,
TARGIDID             SERIAL               not null,
DNASEQUENCED         BOOL                 null,
TUMORPURITY          FLOAT4               null,
constraint PK_TISSUE primary key (TISSUENAME)
);

/*==============================================================*/
/* Table: TISSUEASSIGNMENT                                      */
/*==============================================================*/
create table TISSUEASSIGNMENT (
TISSUEPANEL          TEXT                 not null,
TISSUENAME           TEXT                 not null,
constraint PK_TISSUEASSIGNMENT primary key (TISSUEPANEL, TISSUENAME)
);

/*==============================================================*/
/* Table: TISSUEPANEL                                           */
/*==============================================================*/
create table TISSUEPANEL (
TISSUEPANEL          TEXT                 not null,
TISSUEPANELDESCRIPTION TEXT                 null,
constraint PK_TISSUEPANEL primary key (TISSUEPANEL)
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
/* Table: TUMORTYPE                                             */
/*==============================================================*/
create table TUMORTYPE (
TUMORTYPE            TEXT                 not null,
TUMORTYPEDESC        TEXT                 null,
constraint PK_TUMORTYPE primary key (TUMORTYPE)
);

/*==============================================================*/
/* Table: VENDOR                                                */
/*==============================================================*/
create table VENDOR (
VENDORNAME           TEXT                 not null,
VENDORURL            TEXT                 null,
constraint PK_VENDOR primary key (VENDORNAME)
);

alter table ANALYSIS
   add constraint FK_ANALYSIS_REFERENCE_GENE foreign key (ENSG)
      references GENE (ENSG)
      on delete restrict on update restrict;

alter table ANALYSIS
   add constraint FK_ANALYSIS_REFERENCE_ANALYSIS foreign key (ANALYSISRUNID)
      references ANALYSISRUN (ANALYSISRUNID)
      on delete cascade on update cascade;

alter table ANALYSISRUN
   add constraint FK_ANALYSIS_REFERENCE_TISSUE foreign key (TISSUENAME)
      references TISSUE (TISSUENAME)
      on delete restrict on update restrict;

alter table ANALYZEDEXON
   add constraint FK_ANALYZED_REFERENCE_TRANSCRI foreign key (ENST)
      references TRANSCRIPT (ENST)
      on delete cascade on update cascade;

alter table ANALYZEDEXON
   add constraint FK_ANALYZED_REFERENCE_ANALYSIS foreign key (ANALYSISID, ANALYSISRUNID)
      references ANALYSIS (ANALYSISID, ANALYSISRUNID)
      on delete cascade on update cascade;

alter table COPYNUMBERREGION
   add constraint FK_COPYNUMB_REFERENCE_HYBRIDIZ foreign key (HYBRIDIZATIONID)
      references HYBRIDIZATION (HYBRIDIZATIONID)
      on delete restrict on update restrict;

alter table FUSIONDESCRIPTION
   add constraint FK_FUSIONDE_REFERENCE_PROCESSE foreign key (PROCESSEDFUSION)
      references PROCESSEDFUSIONGENE (PROCESSEDFUSION)
      on delete restrict on update restrict;

alter table FUSIONDESCRIPTION
   add constraint FK_FUSIONDE_REFERENCE_FUSIONTY foreign key (FUSIONTYPE)
      references FUSIONTYPE (FUSIONTYPE)
      on delete restrict on update restrict;

alter table HLATYPE
   add constraint FK_HLATYPE_REFERENCE_NGSRUN foreign key (NGSID)
      references NGSRUN (NGSID)
      on delete cascade on update restrict;

alter table HYBRIDIZATION
   add constraint FK_HYBRIDIZ_REFERENCE_CHIPTECH foreign key (CHIPNAME)
      references CHIPTECHNOLOGY (CHIPNAME)
      on delete cascade on update cascade;

alter table HYBRIDIZATION
   add constraint FK_HYBRIDIZ_REFERENCE_LABORATO foreign key (LABORATORY)
      references LABORATORY (LABORATORY)
      on delete cascade on update cascade;

alter table HYBRIDIZATION
   add constraint FK_HYBRIDIZ_REFERENCE_HYBRIDIZ foreign key (HYBRIDIZATIONGROUPID)
      references HYBRIDIZATIONGROUP (HYBRIDIZATIONGROUPID)
      on delete restrict on update restrict;

alter table HYBRIDIZATION
   add constraint FK_HYBRIDIZ_REFERENCE_TISSUE foreign key (TISSUENAME)
      references TISSUE (TISSUENAME)
      on delete cascade on update cascade;

alter table MUTATION
   add constraint FK_MUTATION_MUTATIONTYPE foreign key (MUTATIONTYPE)
      references MUTATIONTYPE (MUTATIONTYPE)
      on delete restrict on update restrict;

alter table MUTATION
   add constraint FK_MUTATION_MUTATIONEFF foreign key (MUTATIONEFFECT)
      references MUTATIONEFFECT (MUTATIONEFFECT)
      on delete restrict on update restrict;

alter table MUTATION
   add constraint FK_MUTATION_TRANSCRIPT foreign key (ENST)
      references TRANSCRIPT (ENST)
      on delete restrict on update restrict;

alter table MUTATION
   add constraint FK_MUTATION_REFERENCE_ANALYSIS foreign key (ANALYSISID, ANALYSISRUNID)
      references ANALYSIS (ANALYSISID, ANALYSISRUNID)
      on delete cascade on update restrict;

alter table NGSRUN
   add constraint FK_NGSRUN_REFERENCE_NGSGROUP foreign key (NGSGROUPID)
      references NGSGROUP (NGSGROUPID)
      on delete restrict on update restrict;

alter table NGSRUN
   add constraint FK_NGSRUN_REFERENCE_TISSUE foreign key (TISSUENAME)
      references TISSUE (TISSUENAME)
      on delete cascade on update cascade;

alter table NGSRUN
   add constraint FK_NGSRUN_REFERENCE_LABORATO foreign key (LABORATORY)
      references LABORATORY (LABORATORY)
      on delete restrict on update restrict;

alter table NGSRUN
   add constraint FK_NGSRUN_REFERENCE_NGSRUN foreign key (ASSOCIATEDNGSID)
      references NGSRUN (NGSID)
      on delete cascade on update cascade;

alter table NGSRUN
   add constraint FK_NGSRUN_REFERENCE_NGSPROTO foreign key (NGSPROTOCOLID)
      references NGSPROTOCOL (NGSPROTOCOLID)
      on delete restrict on update restrict;

alter table PROCESSEDCOPYNUMBER
   add constraint FK_PROCCN_2_TISSUE foreign key (TISSUENAME)
      references TISSUE (TISSUENAME)
      on delete restrict on update restrict;

alter table PROCESSEDCOPYNUMBER
   add constraint FK_PROCESSECN_2_GENE foreign key (ENSG)
      references GENE (ENSG)
      on delete restrict on update restrict;

alter table PROCESSEDFUSIONGENE
   add constraint FK_PROCESSE_REFERENCE_TISSUE foreign key (TISSUENAME)
      references TISSUE (TISSUENAME)
      on delete restrict on update restrict;

alter table PROCESSEDFUSIONGENE
   add constraint FK_PROCESSEFUSEION_ENSG1 foreign key (ENSG1)
      references GENE (ENSG)
      on delete restrict on update restrict;

alter table PROCESSEDFUSIONGENE
   add constraint FK_PROCESSEFUSEION_ENSG2 foreign key (ENSG2)
      references GENE (ENSG)
      on delete restrict on update restrict;

alter table PROCESSEDRNASEQ
   add constraint FK_PROCESSERNAS2GENE foreign key (ENSG)
      references GENE (ENSG)
      on delete restrict on update restrict;

alter table PROCESSEDRNASEQ
   add constraint FK_PROCESSE_REFERENCE_NGSRUN foreign key (NGSID)
      references NGSRUN (NGSID)
      on delete restrict on update restrict;

alter table PROCESSEDSEQUENCE
   add constraint FK_PROCESSED_2_TISSUE foreign key (TISSUENAME)
      references TISSUE (TISSUENAME)
      on delete restrict on update restrict;

alter table PROCESSEDSEQUENCE
   add constraint FK_PROCESSESeq_TRANSCRIpt foreign key (ENST)
      references TRANSCRIPT (ENST)
      on delete restrict on update restrict;

alter table SAMPLEPREPARATIONINNGSRUN
   add constraint FK_SAMPLEPR_REFERENCE_ANALYSIS foreign key (ANALYSISRUNID)
      references ANALYSISRUN (ANALYSISRUNID)
      on delete cascade on update cascade;

alter table SIMILARITY
   add constraint FK_SIMILARI_REFERENCE_SIMILARI foreign key (SIMILARITYTYPE)
      references SIMILARITYTYPE (SIMILARITYTYPE)
      on delete cascade on update cascade;

alter table SIMILARITY
   add constraint FK_SIMILARI_REFERENCE_TISSUE foreign key (TISSUENAME)
      references TISSUE (TISSUENAME)
      on delete restrict on update restrict;

alter table TISSUE
   add constraint FK_TISSUE_REFERENCE_VENDOR foreign key (VENDORNAME)
      references VENDOR (VENDORNAME)
      on delete restrict on update restrict;

alter table TISSUE
   add constraint FK_TISSUE_REFERENCE_TUMORTYP foreign key (TUMORTYPE)
      references TUMORTYPE (TUMORTYPE)
      on delete restrict on update restrict;

alter table TISSUE
   add constraint FK_TISSUE_REFERENCE_PATIENT foreign key (PATIENTNAME)
      references PATIENT (PATIENTNAME)
      on delete restrict on update restrict;

alter table TISSUE
   add constraint FK_TISSUE_TUMORTYPEADJACENT foreign key (TUMORTYPE_ADJACENT)
      references TUMORTYPE (TUMORTYPE)
      on delete restrict on update restrict;

alter table TISSUEASSIGNMENT
   add constraint FK_TISSUEAS_REFERENCE_TISSUE foreign key (TISSUENAME)
      references TISSUE (TISSUENAME)
      on delete restrict on update restrict;

alter table TISSUEASSIGNMENT
   add constraint FK_TISSUEAS_REFERENCE_TISSUEPA foreign key (TISSUEPANEL)
      references TISSUEPANEL (TISSUEPANEL)
      on delete restrict on update restrict;

alter table TREATMENT
   add constraint FK_TREATMEN_REFERENCE_NGSRUN foreign key (NGSID)
      references NGSRUN (NGSID)
      on delete restrict on update restrict;

alter table TREATMENT
   add constraint FK_TREATMEN_REFERENCE_DRUG foreign key (DRUGID)
      references DRUG (DRUGID)
      on delete restrict on update restrict;

