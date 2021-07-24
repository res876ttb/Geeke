/*************************************************
 * @file BlockDragButton.js
 * @description Block Drag Button.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import DragIndicatorIcon from '@material-ui/icons/DragIndicator'

/*************************************************
 * Utils & States
 *************************************************/

/*************************************************
 * Import Components
 *************************************************/

/*************************************************
 * Constant
 *************************************************/
import { pmsc, setDragShadowPos as _setDragShadowPos } from '../states/editorMisc'
import { onDragStart } from '../utils/DraggableBlockUtils'

/*************************************************
 * Main components
 *************************************************/
const BlockDargButton = (props) => {
  // Props
  const blockKey = props.blockKey
  const pageUuid = props.pageUuid
  const readOnly = props.readOnly
  const topOffset = props.topOffset // Unit: rem
  const paddingLeft = props.paddingLeft
  const dargShadowId = `geeke-dragShadow-${pageUuid}`

  // Reducers
  const dispatch = useDispatch()
  const editorMiscPage = useSelector((state) => state.editorMisc.pages.get(pageUuid))
  const editorPage = useSelector((state) => state.editor.cachedPages.get(pageUuid))
  const mouseOverBlockKey = editorMiscPage.get(pmsc.hover)
  const editorState = editorPage.get('content')
  const className =
    'geeke-draggableWrapper' +
    (readOnly ? '' : ' geeke-draggableCursor') +
    (mouseOverBlockKey === blockKey ? '' : ' geeke-invisible')

  // Functions
  const setDragShadowPos = (newShadowPos) => _setDragShadowPos(dispatch, pageUuid, newShadowPos)

  // Top offset
  let style = null
  if (topOffset) {
    style = { top: `${topOffset}rem` }
  }

  return (
    <div
      className={className}
      contentEditable={false}
      draggable="true"
      style={{ paddingLeft: `${paddingLeft}px` }}
      onDragStart={(e) => onDragStart(e, readOnly, dargShadowId, setDragShadowPos, editorState, blockKey)}
    >
      <div className="geeke-draggableWrapperInner" style={style}>
        <DragIndicatorIcon style={{ position: 'relative', right: '0.25rem' }} />
      </div>
    </div>
  )
}

export default BlockDargButton
