/*
 * Copyright Jiaqi Liu
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

describe('Internationalization', () => {
  before(function () {
    cy.visit(Cypress.config('url'), {
      onBeforeLoad(win) {
        Object.defineProperty(win.navigator, 'language', { value: 'zh-CN' })
        Object.defineProperty(win.navigator, 'languages', { value: ['zh'] })
        Object.defineProperty(win.navigator, 'accept_languages', {
          value: ['zh']
        })
      }
    })
      .title()
      .should('include', 'Neo4j Browser')
    cy.wait(3000)
    cy.ensureConnection()
  })

  it('supports Chinese', () => {
    cy.executeCommand(':clear')
    cy.executeCommand(`CREATE (a:TestLabel {name: 'testNode'}) RETURN a`, {
      parseSpecialCharSequences: false
    })

    cy.get('[data-testid="vizInspector"]').contains('节点类型')

    cy.executeCommand('MATCH (n) DETACH DELETE n')
  })
})
