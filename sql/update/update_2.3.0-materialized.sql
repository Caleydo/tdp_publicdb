\set ON_ERROR_ROLLBACK interactive
begin;
\i ../create/view.sql
\i ../create/viewCellline.sql
\i ../create/viewTissue.sql
\i ../create/indexTissue.sql
commmit;