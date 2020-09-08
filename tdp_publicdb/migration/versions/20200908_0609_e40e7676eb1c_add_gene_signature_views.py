"""Add gene signature view

Revision ID: e40e7676eb1c
Revises: 9ed460a9ea4a
Create Date: 2020-09-08 06:09:26.477650

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = 'e40e7676eb1c'
down_revision = '9ed460a9ea4a'
branch_labels = None
depends_on = None


def upgrade():
    connection = op.get_bind()

    connection.execute(
        """
        CREATE TABLE public.genesignature (
        signature text NOT NULL,
        description text,
        unit text,
        hyperlink text
        );

        ALTER TABLE ONLY public.genesignature
            ADD CONSTRAINT pk_genesignature PRIMARY KEY (signature);

        CREATE TABLE cellline.cellline2genesignature (
            celllinename text NOT NULL,
            signature text NOT NULL,
            score real NOT NULL
        );

        ALTER TABLE ONLY cellline.cellline2genesignature
            ADD CONSTRAINT pk_cellline2genesignature PRIMARY KEY (celllinename, signature);

        ALTER TABLE ONLY cellline.cellline2genesignature
            ADD CONSTRAINT fk_cellline_reference_cellline FOREIGN KEY (celllinename) REFERENCES cellline.cellline(celllinename) ON UPDATE CASCADE ON DELETE CASCADE;

        ALTER TABLE ONLY cellline.cellline2genesignature
            ADD CONSTRAINT fk_cellline_reference_genesign FOREIGN KEY (signature) REFERENCES public.genesignature(signature) ON UPDATE CASCADE ON DELETE CASCADE;


        CREATE TABLE tissue.tissue2genesignature (
            tissuename text NOT NULL,
            signature text NOT NULL,
            score real NOT NULL
        );


        ALTER TABLE ONLY tissue.tissue2genesignature
            ADD CONSTRAINT pk_tissue2genesignature PRIMARY KEY (tissuename, signature);

        ALTER TABLE ONLY tissue.tissue2genesignature
            ADD CONSTRAINT fk_tissue2g_reference_genesign FOREIGN KEY (signature) REFERENCES public.genesignature(signature) ON UPDATE CASCADE ON DELETE CASCADE;

        ALTER TABLE ONLY tissue.tissue2genesignature
            ADD CONSTRAINT fk_tissue2g_reference_tissue FOREIGN KEY (tissuename) REFERENCES tissue.tissue(tissuename) ON UPDATE CASCADE ON DELETE CASCADE;

        DROP VIEW IF EXISTS public.tdp_genesignature;
        CREATE VIEW public.tdp_genesignature AS
        SELECT signature, description, unit, hyperlink FROM public.genesignature;

        DROP VIEW IF EXISTS cellline.tdp_cellline2genesignature;
        CREATE VIEW cellline.tdp_cellline2genesignature AS
        SELECT celllinename, signature, score
        FROM cellline.cellline2genesignature;

        DROP VIEW IF EXISTS tissue.tdp_tissue2genesignature;
        CREATE VIEW tissue.tdp_tissue2genesignature AS
        SELECT tissuename, signature, score
        FROM tissue.tissue2genesignature;
        """
    )


def downgrade():
    connection = op.get_bind()

    connection.execute(
        """
        DROP TABLE public.genesignature CASCADE;

        DROP TABLE cellline.cellline2genesignature CASCADE;

        DROP TABLE tissue.tissue2genesignature CASCADE;
        """
    )
