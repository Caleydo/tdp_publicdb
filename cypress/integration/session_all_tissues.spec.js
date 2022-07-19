import {scrollElementIntoCenter} from 'tdp_core/dist/cypress/utils';
import {waitLineupReadyOrdino} from 'ordino/dist/cypress/utils';

it('Load all Tissues', function() {
    cy.visit(Cypress.env('host'));

    // Login
    cy.get('[data-testid=ordino-navbar] [data-testid=start-analysis-button]').click();
    
    cy.login(); // use Cypress command registerd in Ordino app

    // Show you can select single genes if you wanted
    scrollElementIntoCenter('[data-testid=dataset-card-tissue-dataset] [data-testid=human-tab] [data-testid=ordino-dataset-searchbox] [data-testid=async-paginate-input]').click()
    cy.get('[data-testid=dataset-card-tissue-dataset] [data-testid=human-tab] [data-testid=ordino-dataset-searchbox] [data-testid=async-paginate-input]').click()
    // wait intentionally a few seconds
    cy.wait(2000)
    cy.get('[data-testid=dataset-card-tissue-dataset] [data-testid=human-link]').click();

    // Open Lineup ranking
    // Define api calls to wait:
    cy.intercept('/api/tdp/db/publicdb/tissue/desc').as('tissue_desc');
    cy.intercept('/api/tdp/db/publicdb/tissue/filter?filter_species=human&filter_panel=TCGA+normals').as('human_tissue');
    cy.get('[data-testid=tcga-normals-button]').click();
    cy.wait('@tissue_desc');
    cy.wait('@human_tissue');
    waitLineupReadyOrdino(0)
});
