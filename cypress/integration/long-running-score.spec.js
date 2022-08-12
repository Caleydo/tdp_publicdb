// https://www.youtube.com/watch?v=JZIIf-k852g&t=1s
it('Long Running Score', function() {
    cy.visit(Cypress.env('host'));
    // Login
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
    cy.wait(2000);
    cy.get('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(2) > span').click();
    cy.select2SingleSelect("data-type", "Relative Copy Number")
    cy.formSelect("aggregation", "Boxplot")
    cy.get('[data-testid=primary-dialog-button]').click();
    cy.checkScoreColLoadedOrdino(0, ['Relative Copy Number', 'Boxplot'], 9)

    // Add column
    cy.get('[data-testid=add-column-button]').click();
    cy.get('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(2) > span').click();
    cy.formSelect("aggregation", "Frequency")
    cy.formSelect("comparison-operator", "> greater than")
    cy.get(':nth-child(5) > .form-control').clear();
    cy.get(':nth-child(5) > .form-control').type('4');
    cy.get('[data-testid=primary-dialog-button]').click();
    cy.checkScoreColLoadedOrdino(0, ['Frequency > 4'], 10)
})