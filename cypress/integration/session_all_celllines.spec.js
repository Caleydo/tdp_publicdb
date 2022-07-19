import {scrollElementIntoCenter} from 'tdp_core/dist/cypress/utils';
import {waitLineupReadyOrdino} from 'ordino/dist/cypress/utils';

it('Load all Celllines', function() {
    cy.visit(Cypress.env('host'));

    // Login
    cy.get('[data-testid=ordino-navbar] [data-testid=start-analysis-button]').click();
    
    cy.login(); // use Cypress command registerd in Ordino app

    // Show you can select single genes if you wanted
    scrollElementIntoCenter('[data-testid=dataset-card-cellline-dataset] [data-testid=human-tab] [data-testid=ordino-dataset-searchbox] [data-testid=async-paginate-input]').click()
    cy.get('[data-testid=dataset-card-cellline-dataset] [data-testid=human-tab] [data-testid=ordino-dataset-searchbox] [data-testid=async-paginate-input]').click()
    // wait intentionally a few seconds
    cy.wait(2000)
    cy.get('[data-testid=dataset-card-cellline-dataset] [data-testid=human-link]').click();

    // Open Lineup ranking
    // Define api calls to wait:
    cy.intercept('/api/tdp/db/publicdb/cellline/desc').as('cellline_desc');
    cy.intercept('/api/tdp/db/publicdb/cellline/filter?filter_species=human&filter_panel=CCLE').as('human_cellline');
    cy.get('[data-testid=ccle-button]').click();
    cy.wait('@cellline_desc');
    cy.wait('@human_cellline');
    waitLineupReadyOrdino(0)
});
