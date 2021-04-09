/*************************************************
 * @file BlockDragMask.js
 * @description Show the mask over a block when a block drag over this block.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React from 'react';
 
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
} from '../constant';

/*************************************************
 * Main components
 *************************************************/
const BlockDragMask = props => {
  const show = props.show;

  return (
    <div className={'geeke-blockDragMask' + (show ? '' : ' geeke-invisible')}>

    </div>
  )
};

export default BlockDragMask;