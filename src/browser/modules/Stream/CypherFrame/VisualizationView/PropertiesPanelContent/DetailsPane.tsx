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
import React, { useState } from 'react'

import { ClipboardCopier, PropertiesTable, upperFirst } from 'neo4j-arc/common'

import { StyleableNodeLabel } from './StyleableNodeLabel'
import { StyleableRelType } from './StyleableRelType'
import { PaneBody, PaneHeader, PaneTitle, PaneWrapper } from './styled'
import { DetailsPaneProps } from 'neo4j-arc'

import { DETAILS_PANE_TITLE_UPDATE } from 'neo4j-arc/graph-visualization'

export const DETAILS_PANE_STEP_SIZE = 1000
export function DetailsPane({
  vizItem,
  graphStyle,
  nodeInspectorWidth,
  onGraphInteraction = () => undefined
}: DetailsPaneProps): JSX.Element {
  const [maxPropertiesCount, setMaxPropertiesCount] = useState(
    DETAILS_PANE_STEP_SIZE
  )

  const idProperty = {
    key: '<id>',
    value: `${vizItem.item.id}`,
    type: 'String'
  }
  const elementIdProperty = {
    key: '<elementId>',
    value: `${vizItem.item.elementId}`,
    type: 'String'
  }
  const allItemProperties = [
    idProperty,
    elementIdProperty,
    ...vizItem.item.propertyList
  ].sort((a, b) => (a.key < b.key ? -1 : 1))
  const visibleItemProperties = allItemProperties.slice(0, maxPropertiesCount)

  const handleMorePropertiesClick = (numMore: number) => {
    setMaxPropertiesCount(maxPropertiesCount + numMore)
  }

  let paneTitle = ''
  const item = vizItem.item
  const captionPropertyKey = graphStyle
    .pickupCaptionPropertyKey(item)
    // strip off sorounding "{}" because pickupCaptionPropertyKey(item) returns something like "{title}"
    .replace(/[{}]/g, '')
  for (let i = 0; i < item.propertyList.length; i++) {
    if (item.propertyList[i].key == captionPropertyKey) {
      paneTitle = item.propertyList[i].value
    }
  }

  return (
    <PaneWrapper>
      <PaneHeader>
        <PaneTitle data-testid="viz-details-pane-title">
          <div
            suppressContentEditableWarning={true}
            contentEditable="true"
            onKeyUp={(event: any) => {
              if (event.keyCode === 13) {
                event.preventDefault()
                onGraphInteraction(DETAILS_PANE_TITLE_UPDATE, {
                  isNode: vizItem.type === 'node',
                  nodeOrRelId: vizItem.item.id,
                  titlePropertyKey: captionPropertyKey,
                  newTitle: event.currentTarget.textContent
                })
              }
            }}
          >
            <span>{`${paneTitle}`}</span>
          </div>
          <ClipboardCopier
            textToCopy={allItemProperties
              .map(prop => `${prop.key}: ${prop.value}`)
              .join('\n')}
            titleText="Copy all properties to clipboard"
            iconSize={12}
          />
        </PaneTitle>
        {vizItem.type === 'relationship' && (
          <StyleableRelType
            selectedRelType={{
              propertyKeys: vizItem.item.propertyList.map(p => p.key),
              relType: vizItem.item.type
            }}
            graphStyle={graphStyle}
            onGraphInteraction={onGraphInteraction}
            relId={vizItem.item.id}
            sourceNodeId={vizItem.item.source.id}
            targetNodeId={vizItem.item.target.id}
          />
        )}
        {vizItem.type === 'node' &&
          vizItem.item.labels.map((label: string) => {
            return (
              <StyleableNodeLabel
                key={label}
                graphStyle={graphStyle}
                selectedLabel={{
                  label,
                  propertyKeys: vizItem.item.propertyList.map(p => p.key)
                }}
                onGraphInteraction={onGraphInteraction}
                nodeId={vizItem.item.id}
              />
            )
          })}
      </PaneHeader>
      <PaneBody data-testid="viz-details-pane-body">
        <PropertiesTable
          isNode={vizItem.type === 'node'}
          visibleProperties={visibleItemProperties}
          onMoreClick={handleMorePropertiesClick}
          moreStep={DETAILS_PANE_STEP_SIZE}
          totalNumItems={allItemProperties.length}
          nodeInspectorWidth={nodeInspectorWidth}
          onGraphInteraction={onGraphInteraction}
        />
      </PaneBody>
    </PaneWrapper>
  )
}
