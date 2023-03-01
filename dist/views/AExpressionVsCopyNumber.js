import { IDTypeManager, SelectionUtils, SelectOperation } from 'visyn_core';
import { ErrorAlertHandler, FormElementType, AD3View } from 'tdp_core';
import * as d3v3 from 'd3v3';
import { jStat } from 'jstat';
import { FormSubtype } from '../providers/forms';
import { ViewUtils } from './ViewUtils';
const spearmancoeffTitle = 'Spearman Coefficient: ';
export class AExpressionVsCopyNumber extends AD3View {
    constructor() {
        super(...arguments);
        this.margin = { top: 40, right: 5, bottom: 50, left: 90 };
        this.width = 280 - this.margin.left - this.margin.right;
        this.height = 320 - this.margin.top - this.margin.bottom;
        this.x = d3v3.scale.linear();
        this.y = d3v3.scale.log();
        this.color = ViewUtils.colorScale();
        this.xAxis = d3v3.svg.axis().orient('bottom').scale(this.x);
        this.yAxis = d3v3.svg.axis().orient('left').scale(this.y).tickFormat(this.y.tickFormat(2, '.1f'));
    }
    initImpl() {
        super.initImpl();
        this.node.classList.add('expressionVsCopyNumber', 'multiple');
        this.$legend = this.$node.append('div');
        return this.updateCharts();
    }
    getParameterFormDescs() {
        return [
            {
                type: FormElementType.SELECT,
                label: 'Expression',
                id: FormSubtype.FORM_EXPRESSION_SUBTYPE_ID,
                options: {
                    optionsData: this.getExpressionValues(),
                },
                useSession: false,
            },
            {
                type: FormElementType.SELECT,
                label: 'Copy Number',
                id: FormSubtype.FORM_COPYNUMBER_SUBTYPE_ID,
                options: {
                    optionsData: this.getCopyNumberValues(),
                },
                useSession: false,
            },
        ];
    }
    parameterChanged(name) {
        super.parameterChanged(name);
        this.color.domain([]); // reset colors
        this.updateCharts(true);
    }
    selectionChanged() {
        super.selectionChanged();
        this.updateCharts();
    }
    /**
     * Filter expression values with 0, because log scale cannot handle log(0)
     * @param rows
     * @returns {any}
     */
    filterZeroValues(rows) {
        const rows2 = rows.filter((d) => d.expression !== 0 && d.expression !== undefined);
        console.log(`filtered ${rows.length - rows2.length} zero values`);
        return rows2;
    }
    updateCharts(updateAll = false) {
        this.setBusy(true);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        const { ids } = this.selection;
        const { idtype } = this.selection;
        const data = ids.map((id) => {
            return { id, geneName: '', rows: [] };
        });
        const $ids = this.$node.selectAll('div.ids').data(data, (d) => d.id.toString());
        const $idsEnter = $ids.enter().append('div').classed('ids', true);
        // decide whether to load data for newly added items
        // or to reload the data for all items (e.g. due to parameter change)
        const enterOrUpdateAll = updateAll ? $ids : $idsEnter;
        enterOrUpdateAll.each(function (d) {
            const $id = d3v3.select(this);
            const promise = IDTypeManager.getInstance()
                .mapOneNameToFirstName(idtype, d.id, that.idType)
                .then((name) => Promise.all([that.loadData(name), that.loadFirstName(name)]));
            // on error
            promise.catch(ErrorAlertHandler.getInstance().errorAlert).catch((error) => {
                console.error(error);
                that.setBusy(false);
            });
            // on success
            promise.then((input) => {
                d.rows = that.filterZeroValues(input[0]);
                d.geneName = input[1];
                // console.log('loaded data for', d.geneName);
                that.initChart($id);
                that.resizeChart($id);
                that.updateChartData($id);
                that.setBusy(false);
            });
        });
        $ids
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
        svg.append('text').attr('class', 'x label').style('text-anchor', 'middle').text(this.getParameter(FormSubtype.FORM_COPYNUMBER_SUBTYPE_ID).name);
        svg.append('g').attr('class', 'y axis');
        svg
            .append('text')
            .attr('class', 'y label')
            .attr('transform', 'rotate(-90)')
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .text(this.getParameter(FormSubtype.FORM_EXPRESSION_SUBTYPE_ID).name);
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
         cx: (d) => this.x(d.expression),
         cy: (d) => this.y(d.cn),
         }); */
    }
    updateChartData($parent) {
        const data = $parent.datum();
        const { geneName } = data;
        const rows = data.rows.slice();
        // sort missing colors to the front
        rows.sort((a, b) => (a.color === b.color ? 0 : a.color === null ? -1 : b.color === null ? 1 : 0));
        this.x.domain([0, d3v3.max(rows, (d) => d.cn)]);
        this.y.domain([1, d3v3.max(rows, (d) => d.expression)]).clamp(true);
        ViewUtils.integrateColors(this.color, rows.map((d) => d.color));
        ViewUtils.legend(this.$legend.node(), this.color);
        const $g = $parent.select('svg g');
        $g.select('text.x.label').text(this.getParameter(FormSubtype.FORM_COPYNUMBER_SUBTYPE_ID).name);
        $g.select('text.y.label').text(this.getParameter(FormSubtype.FORM_EXPRESSION_SUBTYPE_ID).name);
        $g.select('g.x.axis').call(this.xAxis);
        $g.select('g.y.axis').call(this.yAxis);
        let title = `No data for ${geneName}`;
        if (rows[0]) {
            title = geneName;
        }
        $g.select('text.title').text(title);
        // statistics
        const formatter = d3v3.format('.4f');
        const spearmancoeff = jStat.jStat.spearmancoeff(rows.map((d) => d.cn), rows.map((d) => d.expression));
        $parent.select('div.statistics .spearmancoeff').text(spearmancoeffTitle + formatter(spearmancoeff));
        const marks = $g.selectAll('.mark').data(rows);
        marks
            .enter()
            .append('circle')
            .classed('mark', true)
            .attr('r', 2)
            .on('click', (d) => {
            const { target } = d3v3.event;
            const selectOperation = SelectionUtils.toSelectOperation(d3v3.event);
            const oldSelection = this.getItemSelection();
            const { id } = d;
            const newSelection = SelectionUtils.integrateSelection(oldSelection.ids, [id], selectOperation);
            if (selectOperation === SelectOperation.SET) {
                d3v3.selectAll('circle.mark.clicked').classed('clicked', false);
            }
            d3v3.select(target).classed('clicked', selectOperation !== SelectOperation.REMOVE);
            this.select(newSelection);
        })
            .append('title');
        marks.attr('data-id', (d) => d.id);
        marks.attr('data-color', (d) => String(d.color));
        marks.classed('disabled', false); // show all and reset filtering
        marks
            .select('title')
            .text((d) => `${d.samplename} (${this.getParameter(FormSubtype.FORM_COPYNUMBER_SUBTYPE_ID).name}: ${d.cn}, ${this.getParameter(FormSubtype.FORM_EXPRESSION_SUBTYPE_ID).name}: ${d.expression}, color: ${d.color})`);
        marks
            .transition()
            .attr({
            cx: (d) => this.x(d.cn),
            cy: (d) => this.y(d.expression),
        })
            .style('fill', (d) => (d.color ? this.color(d.color) : null));
        marks.exit().remove();
    }
}
//# sourceMappingURL=AExpressionVsCopyNumber.js.map