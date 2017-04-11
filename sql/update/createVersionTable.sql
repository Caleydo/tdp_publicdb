CREATE TABLE IF NOT EXISTS public.ordino_version
(
  major integer,
  minor integer,
  revision integer,
  date date,
  CONSTRAINT pk_version PRIMARY KEY (major, minor, revision)
);
