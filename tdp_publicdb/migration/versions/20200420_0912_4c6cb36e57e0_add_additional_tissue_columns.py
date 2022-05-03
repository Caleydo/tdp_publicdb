"""Add additional columns to tissue.tdp_tissue

Revision ID: 4c6cb36e57e0
Revises: b477004c3673
Create Date: 2020-04-20 09:12:02.390722

"""
from alembic import op

# import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "4c6cb36e57e0"
down_revision = "b477004c3673"
branch_labels = None
depends_on = None


def upgrade():
    connection = op.get_bind()

    connection.execute(
        """

        -- Note: No reverse statement for the following update statement in downgrade() available!
        UPDATE tissue.tissue SET dnasequenced = TRUE WHERE tissuename IN (SELECT DISTINCT tissuename FROM tissue.processedsequence);
        REFRESH MATERIALIZED VIEW tissue.TCGAenst;

        --------------------------------------------------------------

        CREATE OR REPLACE VIEW tissue.hla_a_type AS
        SELECT t.tissuename, n.rnaseqrunid, allele1 AS HLA_A_allele1, allele2 as HLA_A_allele2 FROM tissue.tissue t
        JOIN tissue.rnaseqrun n ON (t.tissuename = n.tissuename AND canonical)
        JOIN tissue.hlatype h ON (n.rnaseqrunid = h.rnaseqrunid AND hla_class = 'A');

        DROP MATERIALIZED VIEW IF EXISTS tissue.mutationalburden CASCADE;
        CREATE MATERIALIZED VIEW tissue.mutationalburden AS
        SELECT pse.tissuename, species, tumortype, sum((aamutation <> 'wt')::INT4)/count(*)::REAL AS mutational_fraction
          FROM tissue.processedsequenceExtended pse JOIN tissue.tissue t ON t.tissuename = pse.tissuename JOIN transcript tr on tr.enst = pse.enst
          WHERE iscanonical
          GROUP BY pse.tissuename, species, tumortype having count(*) > 10000;

        DROP VIEW IF EXISTS tissue.tdp_tissue CASCADE;

        CREATE VIEW tissue.tdp_tissue AS
          SELECT t.tdpid, t.tissuename, t.species, t.organ, coalesce(t.gender, p.gender) AS gender, t.tumortype, t.tumortype_adjacent,
            vendorname, race, ethnicity, microsatellite_stability_score, microsatellite_stability_class, immune_environment, gi_mol_subgroup,
            floor(days_to_birth/-365.25) as age, days_to_death, days_to_last_followup, vital_status,
            height, weight, round((weight/(height/100)^2)::NUMERIC, 2) AS bmi, tumorpurity, hla_a_allele1, hla_a_allele2, mutational_fraction
          FROM tissue.tissue t LEFT OUTER JOIN tissue.patient p ON p.patientname = t.patientname
          LEFT JOIN tissue.hla_a_type hla ON t.tissuename = hla.tissuename
          LEFT JOIN tissue.mutationalburden mb ON t.tissuename = mb.tissuename;
        """
    )
    pass


def downgrade():

    connection = op.get_bind()

    connection.execute(
        """
        -- hla_a_type
        DROP VIEW IF EXISTS tissue.hla_a_type CASCADE;
        --------------------------------------------------------------
        -- mutationalburden
        DROP MATERIALIZED VIEW IF EXISTS tissue.mutationalburden CASCADE;
        --------------------------------------------------------------
        -- tdp_tissue
        DROP VIEW IF EXISTS tissue.tdp_tissue CASCADE;

        CREATE VIEW tissue.tdp_tissue AS
          SELECT t.tdpid,
            t.tissuename,
            t.species,
            t.organ,
            COALESCE(t.gender, p.gender) AS gender,
            t.tumortype,
            t.tumortype_adjacent,
            t.vendorname,
            p.race,
            p.ethnicity,
            t.microsatellite_stability_score,
            t.microsatellite_stability_class,
            t.immune_environment,
            t.gi_mol_subgroup,
            floor(((p.days_to_birth)::numeric / '-365.25'::numeric)) AS age,
            p.days_to_death,
            p.days_to_last_followup,
            p.vital_status,
            p.height,
            p.weight,
            round(((p.weight / ((p.height / (100)::double precision) ^ (2)::double precision)))::numeric, 2) AS bmi,
            t.tumorpurity
            FROM (tissue.tissue t
              LEFT JOIN tissue.patient p ON ((p.patientname = t.patientname)));
        """
    )
    pass
