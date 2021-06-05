/*************************************************
 * @file BlockDragButton.js
 * @description Block Drag Button.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React from 'react';
import { useSelector } from 'react-redux';

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
  const paddingLeft = props.paddingLeft;
  const handleBlockDargStart = props.handleBlockDargStart;

  // Reducers
  const editorMiscPages = useSelector(state => state.editorMisc.pages);
  const mouseOverBlockKey = editorMiscPages.get(pageUuid).get(pmsc.hover);
  const className = 'geeke-draggableWrapper' + (readOnly ? '' : ' geeke-draggableCursor') + (mouseOverBlockKey === blockKey ? '' : ' geeke-invisible');

  return (
    <div
      className={className}
      contentEditable={false}
      draggable='true'
      style={{paddingLeft: `${paddingLeft}px`}}

      onDragStart={handleBlockDargStart}
    >
      <div className='geeke-draggableWrapperInner'>
        <img draggable="false" src='./drag.svg' alt='handleBlockDrag'></img>
      </div>
    </div>
  )
}

export default BlockDargButton;
