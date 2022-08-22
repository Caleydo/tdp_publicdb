it('Load all Genes', function() {
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
});
