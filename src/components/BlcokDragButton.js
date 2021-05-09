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
import {
  onDragStart as _onDragStart,
} from '../utils/DraggableBlockUtils';

/*************************************************
 * Styles
 *************************************************/
import '../styles/BasicBlock.css';

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
  const setReadOnly = props.setReadOnly;
  const dargShadowId = props.dargShadowId;
  const setDragShadowPos = props.setDragShadowPos;

  // Reducers
  const editorMiscPages = useSelector(state => state.editorMisc.pages);
  const mouseOverBlockKey = editorMiscPages.get(pageUuid).get(pmsc.hover);
  const className = 'geeke-draggableWrapper' + (readOnly ? '' : ' geeke-draggableCursor') + (mouseOverBlockKey === blockKey ? '' : ' geeke-invisible');

  // Functions
  const onDragStart = e => _onDragStart(e, readOnly, setReadOnly, dargShadowId, setDragShadowPos);

  return (
    <div
      className={className}
      contentEditable={false}
      draggable='true'

      onDragStart={onDragStart}
    >
      <div className='geeke-draggableWrapperInner'>
        <img className='geeke-draggableButton' draggable="false" src='./drag.svg' alt='handleBlockDrag'></img>
      </div>
    </div>
  )
}

export default BlockDargButton;
