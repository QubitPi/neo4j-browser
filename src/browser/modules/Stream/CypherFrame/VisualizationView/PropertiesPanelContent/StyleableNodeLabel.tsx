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
import React from 'react'
import { Popup } from 'semantic-ui-react'

import { StyledLabelChip } from 'neo4j-arc/common'
import {
  GraphInteractionCallBack,
  GraphStyleModel,
  NODE_LABEL_UPDATE
} from 'neo4j-arc/graph-visualization'

import { GrassEditor } from './GrassEditor'

export type StyleableNodeLabelProps = {
  selectedLabel: {
    label: string
    propertyKeys: string[]
    count?: number
  }
  graphStyle: GraphStyleModel
  /* The total number of nodes in returned graph */
  allNodesCount?: number | null
  onGraphInteraction?: GraphInteractionCallBack
  nodeId?: string
}
export function StyleableNodeLabel({
  graphStyle,
  selectedLabel,
  allNodesCount,
  onGraphInteraction = () => undefined,
  nodeId
}: StyleableNodeLabelProps): JSX.Element {
  const labels = selectedLabel.label === '*' ? [] : [selectedLabel.label]
  const graphStyleForLabel = graphStyle.forNode({
    labels: labels
  })
  const count =
    selectedLabel.label === '*' ? allNodesCount : selectedLabel.count

  return (
    <div
      data-testid="styleable-node-label"
      suppressContentEditableWarning={true}
      contentEditable="true"
      onKeyDown={(event: any) => {
        if (event.key == 'Enter') {
          event.preventDefault() // prevent new line char on Enter (https://stackoverflow.com/a/60008550)
        }
      }}
      onKeyUp={(event: any) => {
        if (event.keyCode === 13) {
          event.preventDefault()
          onGraphInteraction(NODE_LABEL_UPDATE, {
            nodeId: nodeId,
            oldLabel: labels[0],
            newLabel: event.currentTarget.textContent
          })
        }
      }}
    >
      <Popup
        on="click"
        basic
        key={selectedLabel.label}
        wide
        position="left center"
        offset={[0, 0]}
        trigger={
          <StyledLabelChip
            style={{
              backgroundColor: graphStyleForLabel.get('color'),
              color: graphStyleForLabel.get('text-color-internal')
            }}
            data-testid={`property-details-overview-node-label-${selectedLabel.label}`}
          >
            {`${selectedLabel.label}${
              count || count === 0 ? ` (${count})` : ''
            }`}
          </StyledLabelChip>
        }
      >
        <GrassEditor selectedLabel={selectedLabel} />
      </Popup>
    </div>
  )
}
