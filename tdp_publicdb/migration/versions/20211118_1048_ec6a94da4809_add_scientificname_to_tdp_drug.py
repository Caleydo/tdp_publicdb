"""add_scientificname_to_tdp_drug

Revision ID: ec6a94da4809
Revises: e40e7676eb1c
Create Date: 2021-11-18 10:48:00.944480

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = "ec6a94da4809"
down_revision = "e40e7676eb1c"
branch_labels = None
depends_on = None


def upgrade():
    connection = op.get_bind()

    connection.execute(
        """
        CREATE OR REPLACE VIEW public.tdp_drug
            AS
            SELECT drug.drugid,
                drug.moa,
                drug.target,
                drug.scientificname
            FROM drug;

        ALTER TABLE public.tdp_drug
            OWNER TO postgres;
        """
    )


def downgrade():
    connection = op.get_bind()

    connection.execute(
        """
        CREATE OR REPLACE VIEW public.tdp_drug
            AS
            SELECT drug.drugid,
                drug.moa,
                drug.target
            FROM drug;

        ALTER TABLE public.tdp_drug
            OWNER TO postgres;
        """
    )
