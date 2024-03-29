import { cy, it, Cypress } from 'local-cypress';

// https://www.youtube.com/watch?v=JZIIf-k852g&t=1s
it('ordino video', function() {
    cy.visit(Cypress.env('host'));

    cy.get('[data-testid=ordino-navbar] [data-testid=start-analysis-button]').click();
    
    cy.login(); // use Cypress command registerd in Ordino app

    // Show you can select single genes if you wanted
    cy.scrollElementIntoCenter('[data-testid=dataset-card-genes-dataset] [data-testid=human-tab] [data-testid=ordino-dataset-searchbox] [data-testid=async-paginate-input]').click()
    cy.get('[data-testid=dataset-card-genes-dataset] [data-testid=human-tab] [data-testid=ordino-dataset-searchbox] [data-testid=async-paginate-input]').click()
    // wait intentionally a few seconds
    cy.wait(2000)
    cy.get('[data-testid=dataset-card-genes-dataset] [data-testid=human-link]').click();

    // Open Lineup ranking
    // Define api calls to wait:
    cy.intercept('/api/tdp/db/publicdb/gene/desc').as('gene_desc');
    cy.intercept('/api/tdp/db/publicdb/gene/filter?filter_species=human&filter_panel=normal+chromosome+protein+coding+human+genes').as('human_genes');
    cy.get('[data-testid=normal-chromosome-protein-coding-human-genes-button]').click();
    cy.wait('@gene_desc');
    cy.wait('@human_genes');
    cy.waitLineupReadyOrdino(0)

    // Add column
    cy.get('[data-testid=add-column-button]').click();
    cy.get('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(1) > span').click();
    cy.select2MultiSelect("cell-line", "HCC1954")
    cy.select2MultiSelect("data-type", "Relative Copy Number")
    cy.get('[data-testid=primary-dialog-button]').click();
    cy.checkScoreColLoadedOrdino(0, ['HCC1954', 'Relative Copy Number'], 9);

    // Sort by column
    cy.get('[data-testid=viewWrapper-0] > .view > .inner > .tdp-view > :nth-child(1) > .le > .le-header > .le-thead > section:nth-last-child(-n+1) > .lu-toolbar > .lu-action-sort').click();

    // Show some information
    cy.get('[data-testid="(un)collapse-button"] > .fas').click();
    // intentionally wait 1 second
    cy.wait(1000)
    // filter with histogram not possible
    cy.get('[data-testid="(un)collapse-button"] > .fas').click();

    // Add column
    cy.get('[data-testid=add-column-button]').click();
    cy.get('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(1) > span').click();
    cy.select2MultiSelect("cell-line", "HCC1954")
    cy.select2MultiSelect("data-type", "Normalized Gene Expression (TPM Values)")
    cy.get('[data-testid=primary-dialog-button]').click();
    cy.checkScoreColLoadedOrdino(0, ['HCC1954', 'Normalized Gene Expression (TPM Values)'], 10)

    // Add column
    cy.get('[data-testid=add-column-button]').click();
    cy.get('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(5) > span').click();
    cy.select2MultiSelect("cell-line", "HCC1954")
    cy.select2MultiSelect("data-type", "DRIVE RSA (ER McDonald III et al., Cell, 2017)")
    cy.get('[data-testid=primary-dialog-button]').click();
    cy.checkScoreColLoadedOrdino(0, ['HCC1954', 'DRIVE RSA (ER McDonald III et al., Cell, 2017)'], 11)

    // Invert column
    // Here the title should be used. For some reason cypress has problmes, because there is a " character in the title. For now I use the data-id
    cy.get('[data-id="col10"] > .lu-toolbar > .lu-action-more').click();
    cy.get('.lu-action-data-mapping > span').click();
    cy.get('.browser-default').select('linear_invert');
    cy.get('.lu-dialog-buttons > [type="submit"]').click();

    // Add column
    cy.get('[data-testid=add-column-button]').click();
    cy.get('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(2) > span').click();
    cy.formSelect("row-1", "Tumor Type")
    cy.select2MultiSelect("row-1", "breast carcinoma")
    cy.select2SingleSelect("data-type", "Normalized Gene Expression (TPM Values)")
    cy.get('[data-testid=primary-dialog-button]').click();
    cy.checkScoreColLoadedOrdino(0, ['Tumor Type', 'breast carcinoma', 'Normalized Gene Expression (TPM Values)'], 12)

    // Add column
    cy.get('[data-testid=add-column-button]').click();
    cy.wait(2000);
    cy.get('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(2) > span').click();
    cy.select2SingleSelect("data-type", "Relative Copy Number")
    cy.formSelect("aggregation", "Boxplot")
    cy.get('[data-testid=primary-dialog-button]').click();
    cy.checkScoreColLoadedOrdino(0, ['Relative Copy Number', 'Boxplot'], 13)

    // Add column
    cy.get('[data-testid=add-column-button]').click();
    cy.get('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(2) > span').click();
    cy.formSelect("aggregation", "Frequency")
    cy.formSelect("comparison-operator", "> greater than")
    cy.get(':nth-child(5) > .form-control').clear();
    cy.get(':nth-child(5) > .form-control').type('4');
    cy.get('[data-testid=primary-dialog-button]').click();
    cy.checkScoreColLoadedOrdino(0, ['Frequency > 4'], 14)

    // Select elements and click on detail views
    cy.waitLineupReadyOrdino(0)
    cy.get('[data-index="0"] > .lu-renderer-selection').click();
    cy.get('[data-testid=celllinedb_expression_vs_copynumber]').click();
    cy.waitTdpNotBusy()
    cy.waitLineupReadyOrdino(0)
    cy.wait(2000)
    // cy.get('[data-index="6"] > .lu-renderer-selection').click();
    // cy.waitTdpNotBusy()
    // cy.waitLineupReadyOrdino(0)
    // cy.wait(2000)
    cy.get('[data-testid=targetvalidation]').click();
    cy.waitTdpNotBusy()
    cy.wait(2000)
    cy.get('[data-testid=ensembl_org]').click();
    cy.waitTdpNotBusy()
    cy.wait(2000)
    cy.get('[data-testid=copynumbertable]').click();
    cy.waitTdpNotBusy()
    cy.wait(2000)

    // Sort and filter columns
    cy.get('[data-testid=viewWrapper-1] > .view > .inner > .tdp-view > :nth-child(1) > .le > .le-header > .le-thead > section:nth-last-child(-n+1) > .lu-toolbar > .lu-action-sort').click();
    cy.get('[title="Tumor Type"] > .lu-toolbar > .lu-action-filter').click();
    cy.get('.lu-dialog-table > :nth-child(1) > :nth-child(2) > div').click();
    cy.get('.lu-dialog-table > :nth-child(1) > input').uncheck();
    cy.get(':nth-child(6) > :nth-child(2) > .lu-dialog-filter-table-entry-label').click();
    cy.get('.lu-dialog-table > :nth-child(6) > input').check();
    cy.get('.lu-dialog-buttons > [type="submit"]').click();

    // Add column
    cy.get('[data-testid=viewWrapper-1] [data-testid=side-panel-wrapper] [data-testid=lu-adder-div] [data-testid=add-column-button]').click();
    cy.get('[data-testid=viewWrapper-1] > .view > .inner > .tdp-view > [data-testid=side-panel-wrapper] > .panel-header > :nth-child(2) > [data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(1) > span').click();
    cy.select2MultiSelect("gene-symbol", ["BRCA1", "BRCA2"])
    cy.select2MultiSelect("data-type", "AA Mutated")
    cy.get('[data-testid=primary-dialog-button]').click();
    cy.checkScoreColLoadedOrdino(1, ['BRCA1', 'AA Mutated'], 10)
    cy.checkScoreColLoadedOrdino(1, ['BRCA2', 'AA Mutated'], 10)

    cy.waitLineupReadyOrdino(1)
    cy.get('[data-testid=viewWrapper-1] [data-index="0"] > .lu-renderer-selection').click();
    cy.get('[data-testid=viewWrapper-1] [data-index="12"] > .lu-renderer-selection').click();
    cy.get('[data-testid=cosmic]').click();
    // Intentionally wait 2 seconds
    cy.waitTdpNotBusy()
    cy.wait(2000)
    cy.get('[data-testid=show] [data-testid=form-select]').select('687455');
    // Intentionally wait 2 seconds
    cy.waitTdpNotBusy()
    cy.wait(2000)
    cy.get('[data-testid=ordino_sessions_shortcut-link]').click();
    cy.get('[data-testid=current-session-sessionscard] [data-testid=ordino0] [data-testid=save-button]').click();
    cy.get('[data-testid=agree-input]').check();
    cy.get('[data-testid=primary-dialog-button]').click();
    cy.get('[data-testid=ordino_sessions_tab] [data-testid=close-button]').click();
})