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
})
