import {
  GraphInteractionCallBack,
  NODE_ON_CANVAS_CREATE
} from 'neo4j-arc/graph-visualization'

const createNodeGraphInteractionCallback: GraphInteractionCallBack = (
  event,
  properties
) => {
  if (event !== NODE_ON_CANVAS_CREATE) {
    return
  }

  // create on-canvas node

  // persists node to DB

  return
}

export default createNodeGraphInteractionCallback
