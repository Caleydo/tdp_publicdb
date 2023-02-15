# flake8: noqa
from collections import namedtuple

__author__ = "Samuel Gratzl"

Entity = namedtuple(
    "Entity",
    ["prefix", "idtype", "id", "schema", "table", "columns", "panel_table", "panel_name", "panel", "panel_join", "sort", "column_def"],
)


# common alias
# d ... data ... assumed for panels
# s ... sample
# g ... gene


def _gene_columns(query):
    return query.column("biotype", type="categorical").column("chromosome", type="categorical")


gene = Entity(
    "gene",
    idtype="Ensembl",
    id="ensg",
    schema="public",
    table="public.tdp_gene",
    columns=["ensg", "symbol", "species", "chromosome", "strand", "biotype", "seqregionstart", "seqregionend", "name"],
    panel_table="public.tdp_geneassignment",
    panel_name="genesetname",
    panel="ga.genesetname {operator} {value}",
    panel_join="INNER JOIN public.tdp_geneassignment ga ON d.ensg = ga.ensg",
    sort="symbol",
    column_def=_gene_columns,
)


def _tissue_columns(query):
    return (
        query.column("species", type="categorical")
        .column("tumortype", type="categorical")
        .column("organ", type="categorical")
        .column("gender", type="categorical")
        .column("tumortype_adjacent", type="string")
        .column("vendorname", type="categorical")
        .column("race", type="categorical")
        .column("ethnicity", type="categorical")
        .column("age", type="number")
        .column("days_to_death", type="number")
        .column("days_to_last_followup", type="number")
        .column(
            "vital_status",
            type="categorical",
            categories=[dict(name="true", label="Alive", color="white"), dict(name="false", label="Deceased", color="black")],
        )
        .column("height", type="number")
        .column("weight", type="number")
        .column("bmi", type="number")
        .column("tumorpurity", type="number")
        .column("microsatellite_stability_score", type="number")
        .column("microsatellite_stability_class", type="categorical")
        .column("mutational_fraction", type="number")
        .column("hla_a_allele1", type="categorical")
        .column("hla_a_allele2", type="categorical")
    )


tissue = Entity(
    "tissue",
    idtype="Tissue",
    id="tissuename",
    schema="tissue",
    table="tissue.tdp_tissue",
    columns=[
        "tissuename",
        "species",
        "tumortype",
        "organ",
        "gender",
        "tumortype_adjacent",
        "vendorname",
        "race",
        "ethnicity",
        "age",
        "days_to_last_followup",
        "days_to_death",
        "vital_status",
        "height",
        "weight",
        "bmi",
        "tumorpurity",
        "microsatellite_stability_class",
        "microsatellite_stability_score",
        "hla_a_allele1",
        "hla_a_allele2",
        "mutational_fraction",
    ],
    panel_table="tissue.tdp_panelassignment",
    panel_name="panel",
    panel="d.tissuename = ANY(ARRAY(SELECT tissuename FROM tissue.tdp_panelassignment WHERE panel {operator} {value}))",
    panel_join=None,
    sort="tissuename",
    column_def=_tissue_columns,
)


def _cellline_columns(query):
    return (
        query.column("tumortype", type="categorical")
        .column("organ", type="categorical")
        .column("gender", type="categorical")
        .column("metastatic_site", type="categorical")
        .column("histology_type", type="categorical")
        .column("morphology", type="categorical")
        .column("growth_type", type="categorical")
        .column("age_at_surgery", type="categorical")
        .column("cosmicid", type="number")
        .column("mutational_fraction", type="number")
        .column("microsatellite_stability_score", type="number")
        .column("microsatellite_stability_class", type="categorical")
        .column("hla_a_allele1", type="categorical")
        .column("hla_a_allele2", type="categorical")
    )


cellline = Entity(
    "cellline",
    idtype="Cellline",
    id="celllinename",
    schema="cellline",
    table="cellline.tdp_cellline",
    columns=[
        "celllinename",
        "cosmicid",
        "species",
        "tumortype",
        "organ",
        "gender",
        "metastatic_site",
        "histology_type",
        "morphology",
        "growth_type",
        "age_at_surgery",
        "microsatellite_stability_class",
        "hla_a_allele1",
        "hla_a_allele2",
        "microsatellite_stability_score",
        "mutational_fraction",
    ],
    panel_table="cellline.tdp_panelassignment",
    panel_name="panel",
    panel="d.celllinename = ANY(ARRAY(SELECT celllinename FROM cellline.tdp_panelassignment WHERE panel {operator} {value}))",
    panel_join=None,
    sort="celllinename",
    column_def=_cellline_columns,
)

drug = Entity(
    "drug",
    idtype="Drug",
    id="drugid",
    schema="public",
    table="public.tdp_drug",
    columns=["drugid", "moa", "target", "scientificname"],
    panel_table=None,
    panel_name=None,
    panel=None,
    panel_join=None,
    sort="drugid",
    column_def=None,
)
