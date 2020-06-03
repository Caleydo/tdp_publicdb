"""Add drugscore view

Revision ID: 9ed460a9ea4a
Revises: dd7c97913940
Create Date: 2020-06-03 06:31:30.718184

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = '9ed460a9ea4a'
down_revision = 'dd7c97913940'
branch_labels = None
depends_on = None


def upgrade():
    connection = op.get_bind()

    connection.execute(
        """
        ALTER TABLE drug
        ADD COLUMN moa text;

        DROP VIEW IF EXISTS tdp_drug;
        CREATE VIEW tdp_drug AS
          SELECT drugid, moa, target FROM drug;

        DROP VIEW IF EXISTS cellline.tdp_drugscore;
        CREATE VIEW cellline.tdp_drugscore AS
          SELECT celllinename, drugid, ic50, actarea, campaign
          FROM cellline.doseresponsecurve;
        """
    )


def downgrade():
    connection = op.get_bind()

    connection.execute(
        """
        ALTER TABLE drug
        DROP COLUMN moa;

        DROP VIEW IF EXISTS tdp_drug;

        DROP VIEW IF EXISTS cellline.tdp_drugscore;
        """
    )
