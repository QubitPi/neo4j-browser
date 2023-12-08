/*
 * Copyright Jiaqi Liu
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* global Cypress, cy, before */

describe('Node Inspection Panel rendering', () => {
  before(function () {
    cy.visit(Cypress.config('url')).title().should('include', 'Neo4j Browser')
    cy.wait(3000)
    cy.ensureConnection()
  })

  afterEach(() => {
    cy.executeCommand('MATCH (n) DETACH DELETE n')
  })

  it('should display node/rel caption as panel title', () => {
    cy.executeCommand(':clear')
    cy.executeCommand(`CREATE (s:SourceNode {name: 'My Node'}) RETURN s`, {
      parseSpecialCharSequences: false
    })

    cy.get(`[aria-label^="graph-node"]`)
      .trigger('mouseover', { force: true })
      .trigger('mouseenter', { force: true })
      .get('[data-testid="viz-details-pane-title"]')
      .contains('My Node')
  })

  it('details pane title should be editable and pressing enter does not insert a line break at the end of new title', () => {
    cy.executeCommand(':clear')
    cy.executeCommand(`CREATE (s:SourceNode {name: 'My Node'}) RETURN s`, {
      parseSpecialCharSequences: false
    })

    cy.get(`[aria-label^="graph-node"]`)
      .trigger('mouseover', { force: true })
      .trigger('mouseenter', { force: true })
      .get('[data-testid="viz-details-pane-title"]')
      .find('[contenteditable]')
      .clear()
      .type('New Title{enter}', { force: true })

    cy.wait(1500)

    cy.get(`[aria-label^="graph-node"]`)
      .first()
      .trigger('mouseover', { force: true })
      .trigger('mouseenter', { force: true })
      .get('[data-testid="viz-details-pane-title"]')
      .contains('New Title')
      .should(title => {
        expect(title.text()).to.equal('New Title')
      })
  })

  it('can directly modify node label in node inspector panel and pressing enter does not insert a line break at the end of new label', () => {
    cy.executeCommand(':clear')
    cy.executeCommand(`CREATE (a:TestLabel {name: 'testNode'}) RETURN a`, {
      parseSpecialCharSequences: false
    })

    cy.get(`[aria-label^="graph-node"]`)
      .first()
      .trigger('mouseover', { force: true })
      .trigger('mouseenter', { force: true })
      .trigger('click', { force: true })
      .get('[data-testid="styleable-node-label"]', { timeout: 5000 })
      .clear()
      .type('New Label{enter}', { force: true })
      .wait(1500)
      .get('[data-testid="styleable-node-label"]', { timeout: 5000 })
      .contains('New Label')
      .should(label => {
        expect(label.text()).to.equal('New Label')
      })
  })

  it('can directly modify relationship type in node inspector panel', () => {
    cy.executeCommand(':clear')
    cy.executeCommand(
      'CREATE (a:TestLabel)-[:CONNECTS]->(b:TestLabel) RETURN a, b'
    )
      .wait(3000)
      .get('.relationship', { timeout: 5000 })
      .click(5, 40)
      // .trigger('click', { force: true }) clicking on the rel center this way won't work
      .get('[data-testid="styleable-rel-type"]', { timeout: 5000 })
      .first()
      .clear()
      .type('New Link Label{enter}', { force: true })
      .wait(1500)
      .get('[data-testid="styleable-rel-type"]', { timeout: 5000 })
      .contains('New Link Label')
  })

  it('can directly modify properties table value and pressing enter does not insert a line break at the end of new value', () => {
    cy.executeCommand(':clear')
    cy.executeCommand(`CREATE (a:TestLabel {name: 'testNode'}) RETURN a`, {
      parseSpecialCharSequences: false
    })
      .wait(3000)
      .get(`[aria-label^="graph-node"]`)
      .first()
      .trigger('mouseover', { force: true })
      .trigger('mouseenter', { force: true })
      .trigger('click', { force: true })
      .get('[data-testid="properties-table-name-value-cell"]', {
        timeout: 5000
      })
      .clear()
      .type('New Name{enter}', { force: true })
      .wait(1500)
      .get('[data-testid="properties-table-name-value-cell"]', {
        timeout: 5000
      })
      .contains('New Name')
      .should(cellValue => {
        expect(cellValue.text()).to.equal('New Name')
      })
  })
})
