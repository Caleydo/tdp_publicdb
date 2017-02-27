/*==============================================================*/
/* DBMS name:      PostgreSQL 7.3                               */
/* Created on:     25.11.2016 11:12:35                          */
/*==============================================================*/


/*==============================================================*/
/* Table: ALTENSEMBLSYMBOL                                      */
/*==============================================================*/
create table ALTENSEMBLSYMBOL (
ALTSYMBOL            TEXT                 not null,
ENSG                 TEXT                 not null,
constraint PK_ALTENSEMBLSYMBOL primary key (ALTSYMBOL, ENSG)
);

/*==============================================================*/
/* Table: ALTENTREZGENESYMBOL                                   */
/*==============================================================*/
create table ALTENTREZGENESYMBOL (
GENEID               INTEGER              not null,
SYMBOL               TEXT                 not null,
constraint PK_ALTENTREZGENESYMBOL primary key (GENEID, SYMBOL)
);

/*==============================================================*/
/* Table: CHIPTECHNOLOGY                                        */
/*==============================================================*/
create table CHIPTECHNOLOGY (
CHIPNAME             TEXT                 not null,
CHIPTYPE             TEXT                 null,
ENZYME               TEXT                 null,
constraint PK_CHIPTECHNOLOGY primary key (CHIPNAME)
);

/*==============================================================*/
/* Table: DRUG                                                  */
/*==============================================================*/
create table DRUG (
DRUGID               TEXT                 not null,
TARGET               TEXT                 null,
COMMONNAME           TEXT                 null,
SCIENTIFICNAME       TEXT                 null,
constraint PK_DRUG primary key (DRUGID)
);

/*==============================================================*/
/* Table: ENTREZGENE                                            */
/*==============================================================*/
create table ENTREZGENE (
GENEID               INTEGER              not null,
TAXID                INTEGER              null,
SYMBOL               TEXT                 null,
GENENAME             TEXT                 null,
CHROMOSOME           TEXT                 null,
LOCALISATION         TEXT                 null,
NUCLSTART            INT8                 null,
NUCLEND              INT8                 null,
STRAND               TEXT                 null,
GENOMEASSEMBLY       TEXT                 null,
constraint PK_ENTREZGENE primary key (GENEID)
);

/*==============================================================*/
/* Table: ENTREZGENE2ENSEMBLGENE                                */
/*==============================================================*/
create table ENTREZGENE2ENSEMBLGENE (
ENSG                 TEXT                 not null,
GENEID               INTEGER              not null,
constraint PK_ENTREZGENE2ENSEMBLGENE primary key (ENSG, GENEID)
);

/*==============================================================*/
/* Table: EXON                                                  */
/*==============================================================*/
create table EXON (
ENST                 TEXT                 not null,
ENSE                 TEXT                 not null,
CHROMOSOME           TEXT                 null,
SEQSTART             INT4                 null,
SEQEND               INT4                 null,
EXON                 INT2                 null,
constraint PK_EXON primary key (ENST, ENSE)
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
/* Table: GENE                                                  */
/*==============================================================*/
create table GENE (
ENSG                 TEXT                 not null,
SYMBOL               TEXT                 null,
NAME                 TEXT                 null,
CHROMOSOME           TEXT                 null,
STRAND               INT2                 null,
SEQREGIONSTART       INT4                 null,
SEQREGIONEND         INT4                 null,
BIOTYPE              TEXT                 null,
COSMIC_ID_GENE       INT4                 null,
GC_CONTENT           FLOAT4               null,
TARGIDID             SERIAL               not null,
constraint PK_GENE primary key (ENSG)
);

/*==============================================================*/
/* Table: GENEASSIGNMENT                                        */
/*==============================================================*/
create table GENEASSIGNMENT (
ENSG                 TEXT                 not null,
GENESETNAME          TEXT                 not null,
constraint PK_GENEASSIGNMENT primary key (ENSG, GENESETNAME)
);

/*==============================================================*/
/* Table: GENEEXPRESSIONCHIP                                    */
/*==============================================================*/
create table GENEEXPRESSIONCHIP (
GENEEXPRESSIONCHIP   TEXT                 not null,
DESCRIPTION          TEXT                 null,
SOURCE               TEXT                 null,
VERSION              TEXT                 null,
TAXID                INTEGER              null,
constraint PK_GENEEXPRESSIONCHIP primary key (GENEEXPRESSIONCHIP)
);

/*==============================================================*/
/* Table: GENESET                                               */
/*==============================================================*/
create table GENESET (
GENESETNAME          TEXT                 not null,
SPECIES              TEXT                 not null,
constraint PK_GENESET primary key (GENESETNAME)
);

/*==============================================================*/
/* Table: HOMOLOGENE                                            */
/*==============================================================*/
create table HOMOLOGENE (
HOMOLOGENECLUSTER    INT4                 not null,
GENEID               INTEGER              not null,
constraint PK_HOMOLOGENE primary key (HOMOLOGENECLUSTER, GENEID)
);

/*==============================================================*/
/* Table: INFORMATION                                           */
/*==============================================================*/
create table INFORMATION (
DESCRIPTION          TEXT                 not null,
INFORMATION          TEXT                 null,
constraint PK_INFORMATION primary key (DESCRIPTION)
);

/*==============================================================*/
/* Table: LABORATORY                                            */
/*==============================================================*/
create table LABORATORY (
LABORATORY           TEXT                 not null,
constraint PK_LABORATORY primary key (LABORATORY)
);

/*==============================================================*/
/* Table: MIRBASE                                               */
/*==============================================================*/
create table MIRBASE (
ACCESSION            TEXT                 not null,
ID                   TEXT                 null,
STATUS               TEXT                 null,
SEQUENCE             TEXT                 null,
constraint PK_MIRBASE primary key (ACCESSION)
);

/*==============================================================*/
/* Table: MIRBASE2ENSEMBLGENE                                   */
/*==============================================================*/
create table MIRBASE2ENSEMBLGENE (
ENSG                 TEXT                 not null,
ACCESSION            TEXT                 not null,
constraint PK_MIRBASE2ENSEMBLGENE primary key (ENSG, ACCESSION)
);

/*==============================================================*/
/* Table: MIRBASEMATURESEQ                                      */
/*==============================================================*/
create table MIRBASEMATURESEQ (
ACCESSION            TEXT                 not null,
MATURE_ACC           TEXT                 not null,
MATURE_ID            TEXT                 null,
MATURE_SEQUENCE      TEXT                 null,
constraint PK_MIRBASEMATURESEQ primary key (ACCESSION, MATURE_ACC)
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
/* Table: PROBESET                                              */
/*==============================================================*/
create table PROBESET (
GENEEXPRESSIONCHIP   TEXT                 not null,
PROBESET             TEXT                 not null,
ENSG                 TEXT                 null,
GENEID               INTEGER              null,
CANONICAL            BOOL                 null,
PROBES               INT2                 null,
MATCHES              INT2                 null,
XHYBS                INT2                 null,
FOUNDVIASEQMATCH     BOOL                 null,
RNASEQCORRELATION    REAL                 null,
CANONICALGSK         BOOL                 null,
RNASEQCORRELATIONGSK REAL                 null,
constraint PK_PROBESET primary key (GENEEXPRESSIONCHIP, PROBESET)
);

/*==============================================================*/
/* Table: REFSEQ                                                */
/*==============================================================*/
create table REFSEQ (
REFSEQID             TEXT                 not null,
GENEID               INTEGER              null,
TAXID                INTEGER              not null,
REFSEQDESC           TEXT                 null,
CDNASEQUENCE         TEXT                 not null,
constraint PK_REFSEQ primary key (REFSEQID)
);

/*==============================================================*/
/* Table: TRANSCRIPT                                            */
/*==============================================================*/
create table TRANSCRIPT (
ENST                 TEXT                 not null,
ENSG                 TEXT                 null,
TRANSCRIPTNAME       TEXT                 null,
CHROMOSOME           TEXT                 null,
STRAND               INT2                 null,
SEQSTART             INT4                 null,
SEQEND               INT4                 null,
ISCANONICAL          BOOL                 null,
COSMIC_ID_TRANSCRIPT INT4                 null,
constraint PK_TRANSCRIPT primary key (ENST)
);

alter table ALTENSEMBLSYMBOL
   add constraint FK_ALTENSEM_REFERENCE_GENE foreign key (ENSG)
      references GENE (ENSG)
      on delete restrict on update restrict;

alter table ALTENTREZGENESYMBOL
   add constraint FK_ALTENTREZSYMBOL_ENTREZGENE foreign key (GENEID)
      references ENTREZGENE (GENEID)
      on delete cascade on update cascade;

alter table ENTREZGENE2ENSEMBLGENE
   add constraint FK_ENTREZGE_REFERENCE_GENE foreign key (ENSG)
      references GENE (ENSG)
      on delete restrict on update restrict;

alter table ENTREZGENE2ENSEMBLGENE
   add constraint FK_ENTREZ2ENSE_GENE foreign key (GENEID)
      references ENTREZGENE (GENEID)
      on delete cascade on update cascade;

alter table EXON
   add constraint FK_EXON_REFERENCE_TRANSCRI foreign key (ENST)
      references TRANSCRIPT (ENST)
      on delete restrict on update restrict;

alter table GENEASSIGNMENT
   add constraint FK_GENEASSI_REFERENCE_GENESET foreign key (GENESETNAME)
      references GENESET (GENESETNAME)
      on delete cascade on update cascade;

alter table GENEASSIGNMENT
   add constraint FK_GENEASSI_REFERENCE_GENE foreign key (ENSG)
      references GENE (ENSG)
      on delete cascade on update restrict;

alter table HOMOLOGENE
   add constraint FK_HOMOLOGENE_ENTREZGENE foreign key (GENEID)
      references ENTREZGENE (GENEID)
      on delete cascade on update cascade;

alter table MIRBASE2ENSEMBLGENE
   add constraint FK_MIRBASE2_REFERENCE_GENE foreign key (ENSG)
      references GENE (ENSG)
      on delete restrict on update restrict;

alter table MIRBASE2ENSEMBLGENE
   add constraint FK_MIRBASE2_REFERENCE_MIRBASE foreign key (ACCESSION)
      references MIRBASE (ACCESSION)
      on delete cascade on update cascade;

alter table MIRBASEMATURESEQ
   add constraint FK_MIRBASEM_REFERENCE_MIRBASE foreign key (ACCESSION)
      references MIRBASE (ACCESSION)
      on delete cascade on update cascade;

alter table MUTATIONBLACKLIST
   add constraint FK_MUTATIONBLACK_TRANSCRIPT foreign key (ENST)
      references TRANSCRIPT (ENST)
      on delete restrict on update restrict;

alter table PROBESET
   add constraint FK_PROBESET_GENE foreign key (ENSG)
      references GENE (ENSG)
      on delete restrict on update restrict;

alter table PROBESET
   add constraint FK_PROBESET_REFERENCE_GENEEXPR foreign key (GENEEXPRESSIONCHIP)
      references GENEEXPRESSIONCHIP (GENEEXPRESSIONCHIP)
      on delete cascade on update cascade;

alter table PROBESET
   add constraint FK_PROBESET_ENTREZGENE foreign key (GENEID)
      references ENTREZGENE (GENEID)
      on delete cascade on update cascade;

alter table REFSEQ
   add constraint FK_REFSEQ_ENTREZGENE foreign key (GENEID)
      references ENTREZGENE (GENEID)
      on delete cascade on update cascade;

alter table TRANSCRIPT
   add constraint FK_TRANSCRI_REFERENCE_GENE foreign key (ENSG)
      references GENE (ENSG)
      on delete restrict on update cascade;

