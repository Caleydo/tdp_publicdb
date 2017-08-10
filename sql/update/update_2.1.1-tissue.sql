
/*==============================================================*/
/* Table: PATIENT                                               */
/*==============================================================*/
alter table tissue.PATIENT rename column "race_list" to "race";

/*==============================================================*/
/* Table: PROCESSEDRNASEQ                                       */
/*==============================================================*/
alter table tissue.PROCESSEDRNASEQ add "status" TYPE CHAR;

/*==============================================================*/
/* Table: SIMILARITYTYPE                                        */
/*==============================================================*/
drop table tissue.SIMILARITYTYPE;

/* Table: TISSUE                                                */
/*==============================================================*/
alter table tissue.tissue add "sequenced" TYPE BOOL;

alter table tissue.tissue
add constraint FK_TISSUE_TUMORTYPEADJACENT foreign key (TUMORTYPE_ADJACENT)
  references tissue.TUMORTYPE (TUMORTYPE)
  on delete restrict on update restrict;