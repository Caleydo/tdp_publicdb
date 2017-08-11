\set ON_ERROR_ROLLBACK interactive
begin;
/*==============================================================*/
/* Table: SIMILARITYTYPE                                        */
/*==============================================================*/
create table SIMILARITYTYPE (
SIMILARITYTYPE       TEXT                 not null,
SIMILARITYDESCRIPTION TEXT                 null,
constraint PK_SIMILARITYTYPE primary key (SIMILARITYTYPE)
);
	  
--empty for now
commit;