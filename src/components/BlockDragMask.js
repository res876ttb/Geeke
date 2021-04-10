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
  editorLeftPadding,
  dragMaskHeight,
  dragMaskIndentInterval,
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
  if (!show) return null;
  const depth = parseInt(draggedBlock.depth) + 1;
  
  // Variables
  let bottom = draggedBlock.bottom;
  let left = draggedBlock.left;
  let nopacity = 0.8;

  // Generate masks
  let leftPadding = <div key='-1' className='geeke-inlineBlock' 
                         style={{paddingLeft: `${editorLeftPadding}rem`}}></div>;
  let masks = [leftPadding];
  for (let i = 0; i < depth; i++) {
    let mask = <div key={`${i}`} className='geeke-dragMask' 
                    style={{left: `${editorLeftPadding + indentWidth * i}rem`, 
                            backgroundColor: `rgba(2, 141, 255, ${1 - nopacity})`, 
                            width: `${indentWidth - dragMaskIndentInterval}rem`}}></div>;
    nopacity *= nopacity;
    masks.push(mask);
  }
  masks.push(<div key='-2' className='geeke-dragMaskRight' 
                  style={{left: `${editorLeftPadding + indentWidth * depth}rem`, 
                          backgroundColor: `rgba(2, 141, 255, ${1 - nopacity})`}}></div>);

  return (
    <div className='geeke-blockDragMask'
         style={{left: left, top: bottom - dragMaskHeight}}>
      {masks}
    </div>
  )
};

export default BlockDragMask;