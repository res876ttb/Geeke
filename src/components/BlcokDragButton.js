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

  // Reducers
  const editorMiscPages = useSelector(state => state.editorMisc.pages);
  const mouseOverBlockKey = editorMiscPages.get(pageUuid).get(pmsc.hover);
  const className = 'geeke-draggableWrapper' + (readOnly ? '' : ' geeke-draggableCursor') + (mouseOverBlockKey === blockKey ? '' : ' geeke-invisible');

  return (
    <div className={className} contentEditable={false}>
      <img draggable="false" src='./drag.svg' alt='handleBlockDrag'></img>
    </div>
  )
}

export default BlockDargButton;
