"""First_Revision

Revision ID: b477004c3673
Revises:
Create Date: 2020-03-02 13:12:59.636711

"""
from alembic import op
from codecs import open
import sqlalchemy as sa
from os import path

# revision identifiers, used by Alembic.
revision = 'b477004c3673'
down_revision = None
branch_labels = None
depends_on = None

# import the schema
here = path.relpath(path.dirname(__file__))
sql_file_path = path.join(here, './assets/ordino-hg38-schema-postgres12.sql')
ordino_hg38_schema = open(sql_file_path, mode='r').read()


def upgrade():
    connection = op.get_bind()
    # escape special characters before executing
    connection.execute(sa.text(ordino_hg38_schema))
    pass


def downgrade():
    """
    """
    pass
