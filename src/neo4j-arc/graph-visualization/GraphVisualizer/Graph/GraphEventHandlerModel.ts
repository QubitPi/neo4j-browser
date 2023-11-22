/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
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

import { GraphModel } from '../../models/Graph'
import { NodeModel } from '../../models/Node'
import { RelationshipModel } from '../../models/Relationship'
import { GetNodeNeighboursFn, VizItem } from '../../types'
import {
  GraphStats,
  getGraphStats,
  mapNodes,
  mapRelationships
} from '../../utils/mapper'
import { Visualization } from './visualization/Visualization'

export const NODE_ON_CANVAS_CREATE = 'NODE_ON_CANVAS_CREATE'
export const NODE_PROP_UPDATE = 'NODE_PROP_UPDATE'
export const NODE_LABEL_UPDATE = 'NODE_LABEL_UPDATE'
export const REL_ON_CANVAS_CREATE = 'REL_ON_CANVAS_CREATE'
export const REL_TYPE_UPDATE = 'REL_TYPE_UPDATE'

export type GraphInteraction =
  | 'NODE_EXPAND'
  | 'NODE_UNPINNED'
  | 'NODE_DISMISSED'
  | 'NODE_ON_CANVAS_CREATE'
  | typeof NODE_ON_CANVAS_CREATE
  | typeof NODE_PROP_UPDATE
  | typeof NODE_LABEL_UPDATE
  | typeof REL_ON_CANVAS_CREATE
  | typeof REL_TYPE_UPDATE

export type GraphInteractionCallBack = (
  event: GraphInteraction,
  properties?: Record<string, unknown>
) => void

export class GraphEventHandlerModel {
  getNodeNeighbours: GetNodeNeighboursFn
  graph: GraphModel
  visualization: Visualization
  onGraphModelChange: (stats: GraphStats) => void
  onItemMouseOver: (item: VizItem) => void
  onItemSelected: (item: VizItem) => void
  onGraphInteraction: GraphInteractionCallBack
  selectedItem: NodeModel | RelationshipModel | null

  private altCreatedRelSourceNode: any
  private altCreatedRelTargetNode: any

  constructor(
    graph: GraphModel,
    visualization: Visualization,
    getNodeNeighbours: GetNodeNeighboursFn,
    onItemMouseOver: (item: VizItem) => void,
    onItemSelected: (item: VizItem) => void,
    onGraphModelChange: (stats: GraphStats) => void,
    onGraphInteraction?: (event: GraphInteraction) => void
  ) {
    this.graph = graph
    this.visualization = visualization
    this.getNodeNeighbours = getNodeNeighbours
    this.selectedItem = null
    this.onItemMouseOver = onItemMouseOver
    this.onItemSelected = onItemSelected
    this.onGraphInteraction = onGraphInteraction ?? (() => undefined)

    this.onGraphModelChange = onGraphModelChange

    this.altCreatedRelSourceNode = null
    this.altCreatedRelTargetNode = null
  }

  graphModelChanged(): void {
    this.onGraphModelChange(getGraphStats(this.graph))
  }

  selectItem(item: NodeModel | RelationshipModel): void {
    if (this.selectedItem) {
      this.selectedItem.selected = false
    }
    this.selectedItem = item
    item.selected = true

    this.visualization.update({
      updateNodes: this.selectedItem.isNode,
      updateRelationships: this.selectedItem.isRelationship,
      restartSimulation: false
    })
  }

  deselectItem(): void {
    if (this.selectedItem) {
      this.selectedItem.selected = false

      this.visualization.update({
        updateNodes: this.selectedItem.isNode,
        updateRelationships: this.selectedItem.isRelationship,
        restartSimulation: false
      })

      this.selectedItem = null
    }
    this.onItemSelected({
      type: 'canvas',
      item: {
        nodeCount: this.graph.nodes().length,
        relationshipCount: this.graph.relationships().length
      }
    })
  }

  nodeClose(d: NodeModel): void {
    this.graph.removeConnectedRelationships(d)
    this.graph.removeNode(d)
    this.deselectItem()
    this.visualization.update({
      updateNodes: true,
      updateRelationships: true,
      restartSimulation: true
    })
    this.graphModelChanged()
    this.onGraphInteraction('NODE_DISMISSED')
  }

  nodeClicked(node: NodeModel): void {
    if (!node) {
      return
    }
    node.hoverFixed = false
    node.fx = node.x
    node.fy = node.y
    if (!node.selected) {
      this.selectItem(node)
      this.onItemSelected({
        type: 'node',
        item: node
      })
    } else {
      this.deselectItem()
    }
  }

  nodeUnlock(d: NodeModel): void {
    if (!d) {
      return
    }
    d.fx = null
    d.fy = null
    this.deselectItem()
    this.onGraphInteraction('NODE_UNPINNED')
  }

  nodeDblClicked(d: NodeModel): void {
    if (d.expanded) {
      this.nodeCollapse(d)
      return
    }
    d.expanded = true
    const graph = this.graph
    const visualization = this.visualization
    const graphModelChanged = this.graphModelChanged.bind(this)
    this.getNodeNeighbours(
      d,
      this.graph.findNodeNeighbourIds(d.id),
      ({ nodes, relationships }) => {
        graph.addExpandedNodes(d, mapNodes(nodes))
        graph.addRelationships(mapRelationships(relationships, graph))
        visualization.update({ updateNodes: true, updateRelationships: true })
        graphModelChanged()
      }
    )
    this.onGraphInteraction('NODE_EXPAND')
  }

  nodeCollapse(d: NodeModel): void {
    d.expanded = false
    this.graph.collapseNode(d)
    this.visualization.update({ updateNodes: true, updateRelationships: true })
    this.graphModelChanged()
  }

  onNodeMouseOver(node: NodeModel): void {
    if (!node.contextMenu) {
      this.onItemMouseOver({
        type: 'node',
        item: node
      })
    }
  }

  onMenuMouseOver(itemWithMenu: NodeModel): void {
    if (!itemWithMenu.contextMenu) {
      throw new Error('menuMouseOver triggered without menu')
    }
    this.onItemMouseOver({
      type: 'context-menu-item',
      item: {
        label: itemWithMenu.contextMenu.label,
        content: itemWithMenu.contextMenu.menuContent,
        selection: itemWithMenu.contextMenu.menuSelection
      }
    })
  }

  onRelationshipMouseOver(relationship: RelationshipModel): void {
    this.onItemMouseOver({
      type: 'relationship',
      item: relationship
    })
  }

  onRelationshipClicked(relationship: RelationshipModel): void {
    if (!relationship.selected) {
      this.selectItem(relationship)
      this.onItemSelected({
        type: 'relationship',
        item: relationship
      })
    } else {
      this.deselectItem()
    }
  }

  onCanvasClicked(): void {
    this.deselectItem()
  }

  onCanvasDblClicked(): void {
    const transientId: string =
      'transient-' + Math.random().toString(36).slice(2)

    this.graph.addNodes([
      new NodeModel(
        transientId,
        ['Undefined'],
        {
          name: 'New Node',
          description: 'New Node'
        },
        {
          name: 'string',
          description: 'string'
        },
        transientId
      )
    ])
    this.visualization.update({ updateNodes: true, updateRelationships: true })
    this.graphModelChanged()

    this.onGraphInteraction(NODE_ON_CANVAS_CREATE, {
      name: 'New Node',
      description: 'New Node',
      labels: ['Undefined']
    })
  }

  onItemMouseOut(): void {
    this.onItemMouseOver({
      type: 'canvas',
      item: {
        nodeCount: this.graph.nodes().length,
        relationshipCount: this.graph.relationships().length
      }
    })
  }

  nodeAltDown(node: NodeModel): void {
    if (!node) {
      return
    }

    if (
      this.altCreatedRelSourceNode == null &&
      this.altCreatedRelTargetNode == null
    ) {
      this.altCreatedRelSourceNode = node
    } else if (
      this.altCreatedRelSourceNode != null &&
      this.altCreatedRelTargetNode == null
    ) {
      this.altCreatedRelTargetNode = node

      const transientId: string =
        'transient-' + Math.random().toString(36).slice(2)

      const altCreatedRel: RelationshipModel = new RelationshipModel(
        transientId,
        this.altCreatedRelSourceNode,
        this.altCreatedRelTargetNode,
        transientId,
        { name: 'new link' },
        { name: 'string' },
        transientId
      )

      this.graph.addRelationships([altCreatedRel])
      this.visualization.update({
        updateNodes: true,
        updateRelationships: true
      })
      this.graphModelChanged()

      this.onGraphInteraction(REL_ON_CANVAS_CREATE, {
        type: transientId,
        sourceNodeId: this.altCreatedRelSourceNode.id,
        targetNodeId: this.altCreatedRelTargetNode.id
      })

      this.altCreatedRelSourceNode = null
      this.altCreatedRelTargetNode = null
    }
  }

  bindEventHandlers(): void {
    this.visualization
      .on('nodeMouseOver', this.onNodeMouseOver.bind(this))
      .on('nodeMouseOut', this.onItemMouseOut.bind(this))
      .on('menuMouseOver', this.onMenuMouseOver.bind(this))
      .on('menuMouseOut', this.onItemMouseOut.bind(this))
      .on('relMouseOver', this.onRelationshipMouseOver.bind(this))
      .on('relMouseOut', this.onItemMouseOut.bind(this))
      .on('relationshipClicked', this.onRelationshipClicked.bind(this))
      .on('canvasClicked', this.onCanvasClicked.bind(this))
      .on('canvasDblClicked', this.onCanvasDblClicked.bind(this))
      .on('nodeClose', this.nodeClose.bind(this))
      .on('nodeClicked', this.nodeClicked.bind(this))
      .on('nodeDblClicked', this.nodeDblClicked.bind(this))
      .on('nodeUnlock', this.nodeUnlock.bind(this))
      .on('nodeAltDown', this.nodeAltDown.bind(this))
    this.onItemMouseOut()
  }
}
