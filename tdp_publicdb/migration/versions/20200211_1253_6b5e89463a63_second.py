"""Second

Revision ID: 6b5e89463a63
Revises:
Create Date: 2020-02-11 12:53:39.869637

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = '6b5e89463a63'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
  connection = op.get_bind()

  connection.execute(
        """

        """
    )
  pass


def downgrade():
  pass
