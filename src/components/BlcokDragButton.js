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

  // Reducers
  const editorMiscPages = useSelector(state => state.editorMisc.pages);
  const mouseOverBlockKey = editorMiscPages.get(pageUuid).get(pmsc.hover);

  return (
    <div className={'geeke-draggableWrapper' + (mouseOverBlockKey === blockKey ? '' : ' geeke-invisible')} contentEditable={false}>
      <img draggable="false" src='./drag.svg' alt='handleBlockDrag'></img>
    </div>
  )
}

export default BlockDargButton;
