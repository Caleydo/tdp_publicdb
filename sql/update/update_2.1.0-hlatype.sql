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

alter table HLATYPE
   add constraint FK_HLATYPE_REFERENCE_NGSRUN foreign key (NGSID)
      references NGSRUN (NGSID)
      on delete cascade on update restrict;