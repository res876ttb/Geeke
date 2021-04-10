/*************************************************
 * @file BlockDragMask.js
 * @description Show the mask over a block when a block drag over this block.
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
import '../styles/BlockDragMask.css';

/*************************************************
 * Constant
 *************************************************/
import {
  indentWidth,
  draggableLeftPadding,
  editorLeftPadding,
  dragMaskHeight,
} from '../constant';

/*************************************************
 * Main components
 *************************************************/
const BlockDragMask = props => {
  // Props
  const pageUuid = props.pageId;

  // States & Reducers
  const state = useSelector(state => state.editor);

  // Constants
  const draggedBlock = state.draggedBlock[pageUuid];
  const show = (draggedBlock ? draggedBlock.blockUuid ? true : false : false) && draggedBlock.bottom;
  
  // Variables
  let bottom = 0;
  let left = 0;

  if (show) {
    bottom = draggedBlock.bottom;
    left = draggedBlock.left;
  }

  return (
    <div className={'geeke-blockDragMask' + (show ? '' : ' geeke-invisible')}
         style={{left: left, top: bottom - dragMaskHeight}}>
    </div>
  )
};

export default BlockDragMask;