"""new_depletion_scores

Revision ID: 5a8dc3921597
Revises: ec6a94da4809
Create Date: 2022-06-14 12:44:43.553285

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5a8dc3921597'
down_revision = 'ec6a94da4809'
branch_labels = None
depends_on = None


def upgrade():
    connection = op.get_bind()

    connection.execute(
        """
        ALTER TABLE cellline.processeddepletionscore
        ADD COLUMN IF NOT EXISTS chronos real;
        ADD COLUMN IF NOT EXISTS escore real;

        -- DROP VIEW cellline.processeddepletionscoreview;

        CREATE OR REPLACE VIEW cellline.processeddepletionscoreview
        AS
        SELECT d.ensg,
            g.symbol,
            d.celllinename,
            d.depletionscreen,
            d.rsa,
            d.ataris,
            d.ceres,
            d.escore,
            d.chronos
        FROM cellline.processeddepletionscore d
            JOIN gene g ON d.ensg = g.ensg;

        ALTER TABLE cellline.processeddepletionscoreview
            OWNER TO postgres;

        CREATE OR REPLACE VIEW cellline.tdp_depletionscore
        AS
        SELECT ensg,
            symbol,
            celllinename,
            depletionscreen,
            rsa,
            ataris,
            ceres,
            escore,
            chronos
        FROM cellline.processeddepletionscoreview;

        ALTER TABLE cellline.tdp_depletionscore
            OWNER TO postgres;
                """
    )


def downgrade():
    """

    -- DROP VIEW cellline.processeddepletionscoreview;

    CREATE OR REPLACE VIEW cellline.processeddepletionscoreview
    AS
    SELECT d.ensg,
        g.symbol,
        d.celllinename,
        d.depletionscreen,
        d.rsa,
        d.ataris,
        d.ceres
    FROM cellline.processeddepletionscore d
        JOIN gene g ON d.ensg = g.ensg;

    ALTER TABLE cellline.processeddepletionscoreview
        OWNER TO postgres;

    CREATE OR REPLACE VIEW cellline.tdp_depletionscore
    AS
    SELECT ensg,
        symbol,
        celllinename,
        depletionscreen,
        rsa,
        ataris,
        ceres
    FROM cellline.processeddepletionscoreview;

    ALTER TABLE cellline.tdp_depletionscore
        OWNER TO postgres;

    ALTER TABLE cellline.processeddepletionscore
        DROP COLUMN IF EXISTS chronos;
        DROP COLUMN IF EXISTS escore;
            """
