"""Add additional columns to cellline.tdp_cellline view

Revision ID: dd7c97913940
Revises: 4c6cb36e57e0
Create Date: 2020-04-20 10:44:34.665270

"""
from alembic import op

# import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "dd7c97913940"
down_revision = "4c6cb36e57e0"
branch_labels = None
depends_on = None


def upgrade():
    connection = op.get_bind()

    connection.execute(
        """
        DROP MATERIALIZED VIEW IF EXISTS cellline.mutationalburden CASCADE;
        CREATE MATERIALIZED VIEW cellline.mutationalburden AS
        SELECT psv.celllinename, species, tumortype, sum((aamutation <> 'wt')::INT4)/count(*)::REAL AS mutational_fraction
          FROM cellline.processedsequenceview psv JOIN cellline.cellline cl ON cl.celllinename = psv.celllinename
          GROUP BY psv.celllinename, species, tumortype having count(*) > 10000;

        CREATE OR REPLACE VIEW cellline.tdp_cellline AS
          SELECT tdpid, cl.celllinename, cl.species, organ, cl.tumortype, gender, metastatic_site, histology_type, morphology,
          growth_type, age_at_surgery, cosmicid, microsatellite_stability_class, microsatellite_stability_score,
          hla_a_allele1, hla_a_allele2, mutational_fraction
          FROM cellline.cellline cl
          LEFT JOIN cellline.microsatelliteinstabilityview msiv ON cl.celllinename = msiv.celllinename
          LEFT JOIN cellline.hla_a_type hla ON cl.celllinename = hla.celllinename
          LEFT JOIN cellline.mutationalburden mb ON cl.celllinename = mb.celllinename;
        """
    )
    pass


def downgrade():
    connection = op.get_bind()

    connection.execute(
        """
        DROP MATERIALIZED VIEW IF EXISTS cellline.mutationalburden CASCADE;
        CREATE MATERIALIZED VIEW cellline.mutationalburden AS
        SELECT psv.celllinename,
          cl.species,
          cl.tumortype,
          ((sum(((psv.aamutation <> 'wt'::text))::integer))::double precision / (count(*))::real) AS mutational_fraction
          FROM (cellline.processedsequenceview psv
            JOIN cellline.cellline cl ON ((cl.celllinename = psv.celllinename)))
        GROUP BY psv.celllinename, cl.species, cl.tumortype
        HAVING (count(*) > 10000)
        WITH NO DATA;

      REFRESH MATERIALIZED VIEW cellline.mutationalburden;
      -------------------------------------------------------------------------------
      CREATE OR REPLACE VIEW cellline.tdp_cellline AS
      SELECT cl.tdpid,
        cl.celllinename,
        cl.species,
        cl.organ,
        cl.tumortype,
        cl.gender,
        cl.metastatic_site,
        cl.histology_type,
        cl.morphology,
        cl.growth_type,
        cl.age_at_surgery,
        cl.cosmicid,
        msiv.microsatellite_stability_class,
        msiv.microsatellite_stability_score,
        hla.hla_a_allele1,
        hla.hla_a_allele2,
        mb.mutational_fraction
        FROM (((cellline.cellline cl
          LEFT JOIN cellline.microsatelliteinstabilityview msiv ON ((cl.celllinename = msiv.celllinename)))
          LEFT JOIN cellline.hla_a_type hla ON ((cl.celllinename = hla.celllinename)))
          LEFT JOIN cellline.mutationalburden mb ON ((cl.celllinename = mb.celllinename)));
        """
    )
    pass
