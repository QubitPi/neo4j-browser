/*
 * Copyright (c) Jiaqi Liu
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
import { render, screen } from '@testing-library/react'
import React from 'react'

import { BasicNode, BasicRelationship } from 'neo4j-arc/common'
import { GraphVisualizer } from 'neo4j-arc/graph-visualization'

describe('<GraphVisualizer />', () => {
  const isFullscreen = true
  const nodes: BasicNode[] = [
    {
      id: '1',
      labels: ['Person'],
      properties: {
        name: 'Jack',
        age: '20'
      },
      propertyTypes: {
        name: 'string',
        age: 'number'
      }
    },
    {
      id: '2',
      labels: ['React'],
      properties: {
        name: 'ReactJS'
      },
      propertyTypes: {
        name: 'string'
      }
    }
  ]
  const links: BasicRelationship[] = [
    {
      id: '3',
      startNodeId: '1',
      endNodeId: '2',
      type: 'likes',
      properties: {},
      propertyTypes: {}
    }
  ]

  type RenderComponentProps = {
    showNodeInspectorPanel?: boolean
  }

  const renderComponent = ({
    showNodeInspectorPanel = true
  }: RenderComponentProps) => {
    return render(
      <GraphVisualizer
        maxNeighbours={100}
        hasTruncatedFields={false}
        nodes={nodes}
        autocompleteRelationships={false}
        relationships={links}
        isFullscreen={isFullscreen}
        nodeLimitHit={false}
        getAutoCompleteCallback={undefined}
        wheelZoomRequiresModKey={!isFullscreen}
        wheelZoomInfoMessageEnabled={false}
        useGeneratedDefaultColors={false}
        initialZoomToFit={true}
      />
    )
  }

  test('should render NodeInspectorPanel by default', async () => {
    renderComponent({})

    expect(
      screen.getByRole('button', {
        name: 'Collapse the node properties display'
      })
    ).toBeInTheDocument()
  })

  test('should not render NodeInspectorPanel if explicitly being turned off', async () => {
    renderComponent({ showNodeInspectorPanel: false })

    expect(
      screen.getByRole('button', {
        name: 'Collapse the node properties display'
      })
    ).not.toBeInTheDocument()
  })
})
