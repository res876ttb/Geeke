/*************************************************
 * @file BlockDragButton.js
 * @description Block Drag Button.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React from 'react';
import { useSelector } from 'react-redux';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';

/*************************************************
 * Utils & States
 *************************************************/

/*************************************************
 * Import Components
 *************************************************/

/*************************************************
 * Constant
 *************************************************/
import {
  pmsc
} from '../states/editorMisc';

/*************************************************
 * Main components
 *************************************************/
const BlockDargButton = props => {
  // Props
  const blockKey = props.blockKey;
  const pageUuid = props.pageUuid;
  const readOnly = props.readOnly;
  const topOffset = props.topOffset; // Unit: rem
  const paddingLeft = props.paddingLeft;
  const handleBlockDargStart = props.handleBlockDargStart;

  // Reducers
  const editorMiscPages = useSelector(state => state.editorMisc.pages);
  const mouseOverBlockKey = editorMiscPages.get(pageUuid).get(pmsc.hover);
  const className = 'geeke-draggableWrapper' + (readOnly ? '' : ' geeke-draggableCursor') + (mouseOverBlockKey === blockKey ? '' : ' geeke-invisible');

  // Top offset
  let style = null;
  if (topOffset) {
    style = {top: `${topOffset}rem`};
  }

  return (
    <div
      className={className}
      contentEditable={false}
      draggable='true'
      style={{paddingLeft: `${paddingLeft}px`}}

      onDragStart={handleBlockDargStart}
    >
      <div className='geeke-draggableWrapperInner' style={style}>
        <DragIndicatorIcon style={{position: 'relative', right: '0.25rem'}} />
      </div>
    </div>
  )
}

export default BlockDargButton;
