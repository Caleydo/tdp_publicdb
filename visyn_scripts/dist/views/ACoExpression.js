/**
 * Created by Holger Stitz on 12.08.2016.
 */
import { IDTypeManager } from 'tdp_core';
import { FormElementType } from 'tdp_core';
import { ErrorAlertHandler } from 'tdp_core';
import * as d3 from 'd3';
import { SelectionUtils, SelectOperation } from 'tdp_core';
import { AD3View } from 'tdp_core';
import { jStat } from 'jstat';
import { ViewUtils } from './ViewUtils';
const FORM_ID_REFERENCE_GENE = 'referenceGene';
/**
 * Filter expression values with 0, because log scale cannot handle log(0)
 * @param rows
 * @returns {any}
 */
function filterZeroValues(rows) {
    const rows2 = rows.filter((d) => d.expression !== 0 && d.expression !== undefined);
    console.log(`filtered ${rows.length - rows2.length} zero values`);
    return rows2;
}
const spearmancoeffTitle = 'Spearman Coefficient: ';
export class ACoExpression extends AD3View {
    constructor() {
        super(...arguments);
        this.margin = { top: 40, right: 5, bottom: 50, left: 90 };
        this.width = 280 - this.margin.left - this.margin.right;
        this.height = 320 - this.margin.top - this.margin.bottom;
        this.refGene = null;
        this.refGeneExpression = [];
        this.x = d3.scale.log();
        this.y = d3.scale.log();
        this.color = ViewUtils.colorScale();
        this.xAxis = d3.svg.axis().orient('bottom').scale(this.x).tickFormat(this.x.tickFormat(2, '.1f')); // .tickFormat((d) => d.toFixed(1));
        this.yAxis = d3.svg.axis().orient('left').scale(this.y).tickFormat(this.y.tickFormat(2, '.1f')); // .tickFormat((d) => d.toFixed(1));
    }
    initImpl() {
        super.initImpl();
        this.$node.classed('coExpression', true);
        this.$node.classed('multiple', true);
        this.$errorMessage = this.$node.append('p').classed('nodata', true).attr('hidden', true);
        this.$legend = this.$node.append('div');
        // update the refGene select first, then update ref expression data and as last the charts
        return this.updateRefGeneSelect(this.selection)
            .then((refGene) => {
            this.refGene = refGene;
            if (refGene) {
                return this.loadRefGeneData(refGene);
            }
            return null;
        })
            .then((expressions) => {
            this.refGeneExpression = expressions;
            this.updateChart(this.refGene, expressions, true);
        });
    }
    getParameterFormDescs() {
        return [
            {
                type: FormElementType.SELECT,
                label: 'Reference Gene',
                id: FORM_ID_REFERENCE_GENE,
                options: {
                    optionsData: [],
                },
            },
        ];
    }
    parameterChanged(name) {
        super.parameterChanged(name);
        this.color.domain([]); // reset colors
        if (name === FORM_ID_REFERENCE_GENE) {
            this.refGene = this.getParameterElement(FORM_ID_REFERENCE_GENE).value;
        }
        if (!this.refGene) {
            this.refGeneExpression = null;
            this.updateChart(null, null, true);
        }
        else {
            this.loadRefGeneData(this.refGene).then((expressions) => {
                this.refGeneExpression = expressions;
                this.updateChart(this.refGene, this.refGeneExpression, true);
            });
        }
    }
    selectionChanged() {
        super.selectionChanged();
        // update the refGene select first, then update the charts
        const bak = this.refGene;
        this.updateRefGeneSelect(this.selection).then((refGene) => {
            this.refGene = refGene;
            const refChanged = bak === null || refGene === null || bak.value !== refGene.value;
            if (refChanged) {
                this.refGeneExpression = null;
                if (refGene) {
                    this.loadRefGeneData(refGene).then((expressions) => {
                        this.refGeneExpression = expressions;
                        this.updateChart(refGene, this.refGeneExpression, true);
                    });
                }
            }
            else {
                this.updateChart(refGene, this.refGeneExpression, refChanged);
            }
        });
    }
    updateRefGeneSelect(selection) {
        return this.resolveSelection().then((genesEnsembl) => {
            // console.log('Ensembl', genesEnsembl);
            const promise = this.loadGeneList(genesEnsembl);
            // on error
            promise.catch(ErrorAlertHandler.getInstance().errorAlert).catch((error) => {
                console.error(error);
                this.setBusy(false);
            });
            // on success
            return promise.then((input) => {
                const data = input.map((d) => {
                    return {
                        // use EnsemblID if symbol is empty
                        value: d.symbol ? d.symbol : d.id,
                        name: d.symbol && d.symbol !== d.id ? `${d.symbol} (${d.id})` : d.id,
                        data: d,
                    };
                });
                // console.log('gene symbols', data);
                const refGeneSelect = this.getParameterElement(FORM_ID_REFERENCE_GENE);
                // backup entry and restore the selectedIndex by value afterwards again,
                // because the position of the selected element might change
                const old = refGeneSelect.value;
                refGeneSelect.updateOptionElements(data);
                if (old !== null) {
                    refGeneSelect.value = old;
                }
                // set reference gene
                return refGeneSelect.value;
            });
        });
    }
    async loadRefGeneData(refGene) {
        const rows = await this.loadData(refGene.data.id);
        return filterZeroValues(rows);
    }
    updateChart(refGene, refGeneExpression, updateAll = false) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        const { ids } = this.selection;
        const { idtype } = this.selection;
        const isEmpty = refGene == null || ids.length < 2;
        const noData = refGeneExpression == null || refGeneExpression.length === 0;
        if (isEmpty) {
            this.$errorMessage.text('Select two or more genes.').attr('hidden', false);
            this.$node.selectAll('div.plots').remove();
            this.color.domain([]); // reset
            ViewUtils.legend(this.$legend.node(), this.color);
            return;
        }
        if (noData) {
            this.$errorMessage.text(this.getNoDataErrorMessage(refGene)).attr('hidden', false);
            this.$node.selectAll('div.plots').remove();
            this.color.domain([]); // reset
            ViewUtils.legend(this.$legend.node(), this.color);
            return;
        }
        const data = ids
            .filter((id) => id !== refGene.data.id) // skip refGene, because it's already loaded
            .map((id) => {
            return { id, geneName: '', rows: [] };
        });
        // show/hide message and loading indicator if two less genes are selected
        this.$errorMessage.attr('hidden', data.length > 0);
        this.setBusy(data.length > 0);
        const $plots = this.$node.selectAll('div.plots').data(data, (d) => d.id.toString());
        const $plotsEnter = $plots.enter().append('div').classed('plots', true);
        // decide whether to load data for newly added items
        // or to reload the data for all items (e.g. due to parameter change)
        const enterOrUpdateAll = updateAll ? $plots : $plotsEnter;
        enterOrUpdateAll.each(function (d) {
            const $id = d3.select(this);
            const promise = IDTypeManager.getInstance()
                .mapNameToFirstName(idtype, [d.id], that.idType)
                .then(([name]) => {
                return Promise.all([that.loadData(name), that.loadFirstName(name)]);
            });
            // on error
            promise.catch(ErrorAlertHandler.getInstance().errorAlert).catch((error) => {
                console.error(error);
                that.setBusy(false);
            });
            // on success
            promise.then((input) => {
                // use EnsemblID if symbol is empty
                d.rows = filterZeroValues(input[0]);
                d.geneName = input[1];
                // console.log('loaded data for', d.geneName);
                that.initChart($id);
                that.resizeChart($id);
                that.updateChartData(refGene.data, refGeneExpression, d, $id);
                that.setBusy(false);
            });
        });
        $plots
            .exit()
            .remove()
            .each(function (d) {
            that.setBusy(false);
        });
    }
    initChart($parent) {
        // already initialized svg node -> skip this part
        if ($parent.select('svg').size() > 0) {
            return;
        }
        const svg = $parent.append('svg').append('g').attr('transform', `translate(${this.margin.left},${this.margin.top})`);
        svg.append('g').attr('class', 'title').attr('transform', `translate(0,${this.height})`);
        svg.append('text').attr('class', 'title').style('text-anchor', 'middle');
        svg.append('g').attr('class', 'x axis').attr('transform', `translate(0,${this.height})`);
        svg.append('text').attr('class', 'x label').style('text-anchor', 'middle').text('Expression');
        svg.append('g').attr('class', 'y axis');
        svg.append('text').attr('class', 'y label').attr('transform', 'rotate(-90)').attr('dy', '1em').style('text-anchor', 'middle').text('Expression');
        $parent.append('div').classed('statistics', true).append('div').attr('class', 'spearmancoeff');
    }
    resizeChart($parent) {
        this.x.range([0, this.width]);
        this.y.range([this.height, 0]);
        const svg = $parent
            .select('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom);
        svg.select('text.title').attr('transform', `translate(${this.width / 2} ,${-0.25 * this.margin.top})`);
        svg.select('g.x.axis').call(this.xAxis);
        svg.select('g.y.axis').call(this.yAxis);
        svg.select('text.x.label').attr('transform', `translate(${this.width / 2} ,${this.height + 0.75 * this.margin.bottom})`);
        svg
            .select('text.y.label')
            .attr('y', 0 - this.margin.left)
            .attr('x', 0 - this.height / 2);
        // shift also the points on resizing
        // causes the d3 error: `<circle> attribute cx: Expected length, "NaN".`
        /* svg.selectAll('.mark')
          .transition().attr({
            cx : (d) => this.x(d.expression),
            cy : (d) => this.y(d.expression),
          }); */
    }
    updateChartData(refGene, refGeneExpression, data, $parent) {
        const { geneName } = data;
        // hide small multiple co-expression plot because it would just project the ref gene on its own
        if (!refGene || refGene.id === geneName) {
            $parent.classed('hidden', true);
            return;
        }
        const { rows } = data;
        const hasData = rows != null && rows.length > 0 && refGeneExpression != null && refGeneExpression.length > 0;
        const $g = $parent.select('svg g');
        $g.select('text.title').text(hasData ? geneName : `No data for ${geneName}`);
        if (!hasData) {
            $g.selectAll('.mark').remove();
            return;
        }
        this.x.domain([1, d3.max(refGeneExpression, (d) => d.expression)]).clamp(true);
        this.y.domain([1, d3.max(rows, (d) => d.expression)]).clamp(true);
        ViewUtils.integrateColors(this.color, rows.map((d) => d.color));
        ViewUtils.legend(this.$legend.node(), this.color);
        const attribute = this.getAttributeName();
        $g.select('text.x.label').text(`${attribute} of ${refGene.symbol}`);
        $g.select('text.y.label').text(`${attribute} of ${geneName}`);
        // get smaller and larger array to build intersection between both
        const largerArray = refGeneExpression.length <= rows.length ? rows : refGeneExpression;
        const smallerArray = refGeneExpression.length <= rows.length ? refGeneExpression : rows;
        const firstIsReference = refGeneExpression.length <= rows.length;
        // build hashmap for faster access
        const hash = d3.map(largerArray, (d) => d.samplename);
        const data2 = smallerArray.reduce((result, d) => {
            if (hash.has(d.samplename)) {
                result.push({ expr1: d.expression, expr2: hash.get(d.samplename).expression, title: d.samplename, color: d.color, id: d.id });
            }
            return result;
        }, []);
        // sort missing colors to the front
        data2.sort((a, b) => (a.color === b.color ? 0 : a.color === null ? -1 : b.color === null ? 1 : 0));
        // statistics
        {
            const formatter = d3.format('.4f');
            const xData = data2.map((d) => d.expr1);
            const yData = data2.map((d) => d.expr2);
            const spearmancoeff = jStat.jStat.spearmancoeff(firstIsReference ? xData : yData, !firstIsReference ? xData : yData);
            $parent.select('div.statistics .spearmancoeff').text(spearmancoeffTitle + formatter(spearmancoeff));
        }
        const marks = $g.selectAll('.mark').data(data2);
        marks
            .enter()
            .append('circle')
            .classed('mark', true)
            .attr('r', 2)
            .on('click', (d) => {
            const { target } = d3.event;
            const selectOperation = SelectionUtils.toSelectOperation(d3.event);
            const oldSelection = this.getItemSelection();
            const { id } = d;
            const newSelection = SelectionUtils.integrateSelection(oldSelection.ids, [id], selectOperation);
            if (selectOperation === SelectOperation.SET) {
                d3.selectAll('circle.mark.clicked').classed('clicked', false);
            }
            d3.select(target).classed('clicked', selectOperation !== SelectOperation.REMOVE);
            this.select(newSelection);
        })
            .append('title');
        marks.attr('data-id', (d) => d.id);
        marks.attr('data-color', (d) => String(d.color));
        marks.classed('disabled', false); // show all and reset filtering
        marks
            .select('title')
            .text((d) => `${d.title} (${refGene.symbol}: ${firstIsReference ? d.expr1 : d.expr2}, ${geneName}: ${firstIsReference ? d.expr2 : d.expr1}, color: ${d.color})`);
        marks
            .transition()
            .attr({
            cx: (d) => this.x(firstIsReference ? d.expr1 : d.expr2),
            cy: (d) => this.y(firstIsReference ? d.expr2 : d.expr1),
        })
            .style('fill', (d) => (d.color ? this.color(d.color) : null));
        marks.exit().remove();
    }
    getNoDataErrorMessage(refGene) {
        return `No data for the selected reference gene ${refGene.data.symbol} (${refGene.data.id}) available.`;
    }
}
//# sourceMappingURL=ACoExpression.js.map