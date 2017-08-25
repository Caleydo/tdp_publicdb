\set ON_ERROR_ROLLBACK interactive
begin;
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
alter table tissue.tissue add "DNASEQUENCED" TYPE BOOL;
alter table tissue.tissue add "TUMORPURITY" TYPE FLOAT4;

alter table tissue.tissue
add constraint FK_TISSUE_TUMORTYPEADJACENT foreign key (TUMORTYPE_ADJACENT)
  references tissue.TUMORTYPE (TUMORTYPE)
  on delete restrict on update restrict;

alter table NGSRUN
  drop constraint FK_NGSRUN_REFERENCE_TISSUE;
alter table NGSRUN
   add constraint FK_NGSRUN_REFERENCE_TISSUE foreign key (TISSUENAME)
      references TISSUE (TISSUENAME)
      on delete cascade on update cascade;
	  
commit;