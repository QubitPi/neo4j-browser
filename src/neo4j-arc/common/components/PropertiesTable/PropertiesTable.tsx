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

import { ClickableUrls } from '../ClickableUrls'
import {
  AlternatingTable,
  CopyCell,
  KeyCell,
  StyledExpandValueButton,
  StyledInlineList,
  ValueCell
} from './PropertiesTable.style'
import { ClipboardCopier } from '../ClipboardCopier'
import { ShowMoreOrAll } from '../ShowMoreOrAll/ShowMoreOrAll'
import { VizItemProperty } from 'neo4j-arc/common'
import {
  GraphInteractionCallBack,
  PROP_UPDATE
} from '../../../graph-visualization'

export const ELLIPSIS = '\u2026'
export const WIDE_VIEW_THRESHOLD = 900
export const MAX_LENGTH_NARROW = 150
export const MAX_LENGTH_WIDE = 300

type ExpandableValueProps = {
  isNode: boolean
  nodeOrRelId: string
  propKey: string
  value: string
  width: number
  type: string
  onGraphInteraction: GraphInteractionCallBack
}

function ExpandableValue({
  isNode,
  nodeOrRelId,
  propKey,
  value,
  width,
  type,
  onGraphInteraction
}: ExpandableValueProps) {
  const [expanded, setExpanded] = useState(false)

  const maxLength =
    width > WIDE_VIEW_THRESHOLD ? MAX_LENGTH_WIDE : MAX_LENGTH_NARROW

  const handleExpandClick = () => {
    setExpanded(true)
  }

  let valueShown = expanded ? value : value.slice(0, maxLength)
  const valueIsTrimmed = valueShown.length !== value.length
  valueShown += valueIsTrimmed ? ELLIPSIS : ''

  return (
    <div
      data-testid={`properties-table-${propKey}-value-cell`}
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
          onGraphInteraction(PROP_UPDATE, {
            isNode: isNode,
            nodeOrRelId: nodeOrRelId,
            propKey: propKey,
            propVal: event.currentTarget.textContent
          })
        }
      }}
    >
      {type.startsWith('Array') && '['}
      <ClickableUrls text={valueShown} />
      {valueIsTrimmed && (
        <StyledExpandValueButton onClick={handleExpandClick}>
          {' Show all'}
        </StyledExpandValueButton>
      )}
      {type.startsWith('Array') && ']'}
    </div>
  )
}

type PropertiesViewProps = {
  isNode: boolean
  visibleProperties: VizItemProperty[]
  onMoreClick: (numMore: number) => void
  totalNumItems: number
  moreStep: number
  nodeInspectorWidth: number
  onGraphInteraction?: GraphInteractionCallBack
}

export const PropertiesTable = ({
  isNode,
  visibleProperties,
  totalNumItems,
  onMoreClick,
  moreStep,
  nodeInspectorWidth,
  onGraphInteraction
}: PropertiesViewProps): JSX.Element => {
  let id = ''
  for (let i = 0; i < visibleProperties.length; i++) {
    if (visibleProperties[i].key == '<id>') {
      id = visibleProperties[i].value
    }
  }

  return (
    <>
      <StyledInlineList>
        <AlternatingTable>
          <tbody data-testid="viz-details-pane-properties-table">
            {visibleProperties.map(({ key, type, value }) => (
              <tr key={key} title={type}>
                <KeyCell>
                  <ClickableUrls text={key} />
                </KeyCell>
                <ValueCell>
                  <ExpandableValue
                    isNode={isNode}
                    nodeOrRelId={id}
                    propKey={key}
                    value={value}
                    width={nodeInspectorWidth}
                    type={type}
                    onGraphInteraction={onGraphInteraction ?? (() => undefined)}
                  />
                </ValueCell>
                <CopyCell>
                  <ClipboardCopier
                    titleText={'Copy key and value'}
                    textToCopy={`${key}: ${value}`}
                    iconSize={12}
                  />
                </CopyCell>
              </tr>
            ))}
          </tbody>
        </AlternatingTable>
      </StyledInlineList>
      <ShowMoreOrAll
        total={totalNumItems}
        shown={visibleProperties.length}
        moreStep={moreStep}
        onMore={onMoreClick}
      />
    </>
  )
}
