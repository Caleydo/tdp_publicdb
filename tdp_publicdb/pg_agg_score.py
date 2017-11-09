from tdp_core.dbview import DBViewBuilder

agg_score = DBViewBuilder().query('{agg}({data_subtype})') \
  .query('median', 'percentile_cont(0.5) WITHIN GROUP (ORDER BY {data_subtype})') \
  .query('boxplot', 'percentile_cont(ARRAY[0, 0.25, 0.5, 0.75, 1]) WITHIN GROUP (ORDER BY {data_subtype})') \
  .replace('agg').replace('data_subtype') \
  .build()
