import { ColumnDescUtils, IDTypeManager } from 'tdp_core';
import { zipWith } from 'lodash';
import { scale as d3Scale } from 'd3v3';
import { FieldUtils } from '../providers';
export class ViewUtils {
    static integrateColors(scale, colors) {
        const old = new Set(scale.domain());
        colors = Array.from(new Set(colors.filter((d) => Boolean(d) && !old.has(d)))); // just valid ones
        colors.sort(); // sort by name
        // append new ones
        scale.domain(scale.domain().concat(colors));
    }
    static colorScale() {
        return d3Scale.ordinal().range(ViewUtils.colors);
    }
    static legend(legend, scale) {
        legend.classList.add('tdp-legend');
        const categories = scale.domain();
        if (categories.length === 0) {
            legend.innerHTML = '';
            return;
        }
        const cats = scale
            .domain()
            .map((category) => {
            return `
          <div>
              <span style="background-color: ${scale(category)}"></span>
              <span>${category}</span>
          </div>
      `;
        })
            .join('\n');
        legend.innerHTML = `
          <div>
              <span></span>
              <span>Hide/Show All</span>
          </div>
          ${cats}
          <div>
              <span style="background-color: black"></span>
              <span>Unknown</span>
          </div>`;
        Array.from(legend.children).forEach((d, i) => d.addEventListener('click', () => {
            const disabled = d.classList.toggle('disabled');
            if (i === 0) {
                // all
                Array.from(legend.children).forEach((lgd) => lgd.classList.toggle('disabled', disabled));
                Array.from(legend.parentElement.querySelectorAll(`.mark`)).forEach((s) => s.classList.toggle('disabled', disabled));
            }
            else {
                const cat = scale.domain()[i - 1] || 'null';
                Array.from(legend.parentElement.querySelectorAll(`.mark[data-color="${cat}"]`)).forEach((s) => s.classList.toggle('disabled', disabled));
            }
        }));
    }
    static async loadFirstName(ensg) {
        const symbols = await IDTypeManager.getInstance().mapNameToFirstName(IDTypeManager.getInstance().resolveIdType('Ensembl'), [ensg], IDTypeManager.getInstance().resolveIdType('GeneSymbol'));
        return symbols.length > 0 ? symbols[0] : ensg;
    }
    static async loadGeneList(ensgs) {
        const symbols = await IDTypeManager.getInstance().mapNameToFirstName(IDTypeManager.getInstance().resolveIdType('Ensembl'), ensgs, IDTypeManager.getInstance().resolveIdType('GeneSymbol'));
        return zipWith(ensgs, symbols, (ensg, symbol) => {
            return {
                id: ensg,
                symbol,
            };
        });
    }
    static postProcessScore(subType) {
        return (rows) => {
            if (subType.useForAggregation.indexOf('log2') !== -1) {
                return FieldUtils.convertLog2ToLinear(rows, 'score');
            }
            if (subType.type === 'cat') {
                rows = rows
                    .filter((row) => row.score !== null)
                    .map((row) => {
                    row.score = row.score.toString();
                    return row;
                });
            }
            return rows;
        };
    }
    static subTypeDesc(dataSubType, id, label, col = `col_${id}`) {
        if (dataSubType.type === 'boolean' || dataSubType.type === 'string') {
            return ColumnDescUtils.stringCol(col, { label });
        }
        if (dataSubType.type === 'cat') {
            return ColumnDescUtils.categoricalCol(col, dataSubType.categories, { label });
        }
        return ColumnDescUtils.numberCol(col, dataSubType.domain[0], dataSubType.domain[1], { label });
    }
    /**
     * Extracts ranking options from .env file (via process.env) and returns them in an object that can be spread into the ranking options.
     */
    static rankingOptionsFromEnv() {
        return process.env.RANKING_ENABLE_VIS_PANEL == null ? {} : { enableVisPanel: JSON.parse(process.env.RANKING_ENABLE_VIS_PANEL) };
    }
}
ViewUtils.base = d3Scale.category20().range().slice(); // splice out the orange since used for selection;
ViewUtils.removed = ViewUtils.base.splice(2, 2);
// reorder such that repeat after the primary colors
ViewUtils.colors = ViewUtils.base.filter((d, i) => i % 2 === 0).concat(ViewUtils.base.filter((d, i) => i % 2 === 1));
//# sourceMappingURL=ViewUtils.js.map