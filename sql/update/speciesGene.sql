ALTER TABLE public.gene ADD COLUMN species SPECIES_ENUM; 
UPDATE public.gene SET species = getSpecies(ensg)::species_enum;
ALTER TABLE public.gene ALTER COLUMN species SET NOT NULL;
