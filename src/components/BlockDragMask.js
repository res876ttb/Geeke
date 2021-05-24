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
  editorLeftPadding,
  dragMaskIndentInterval,
  remToPx,
} from '../constant';

/*************************************************
 * Main components
 *************************************************/
const BlockDragMask = props => {
  // Props
  const dragMaskParam = props.dragMaskParam;

  // Check whether dragMaskParam is not empty
  if (dragMaskParam === null) return null;

  // Extract dragMaskParam
  const left = dragMaskParam.left;
  const top = dragMaskParam.top;
  const depth = dragMaskParam.depth;
  const width = parseInt(dragMaskParam.width);

  // Generate masks
  let nopacity = 0.8;
  let leftPadding = <div key='-1' className='geeke-inlineBlock'
                         style={{paddingLeft: `${editorLeftPadding}rem`}}></div>;
  let masks = [leftPadding];
  for (let i = 0; i <= depth; i++) {
    let mask = <div key={`${i}`} className='geeke-dragMask'
                    style={{left: `${editorLeftPadding + indentWidth * i}rem`,
                            backgroundColor: `rgba(2, 141, 255, ${1 - nopacity})`,
                            width: `${indentWidth - dragMaskIndentInterval}rem`}}></div>;
    nopacity *= nopacity;
    masks.push(mask);
  }
  let lastMaskLeft = remToPx(editorLeftPadding + indentWidth * (depth + 1));
  masks.push(<div key='-2' className='geeke-dragMaskRight'
                  style={{left: `${lastMaskLeft}px`,
                          width: `${width - lastMaskLeft - remToPx(editorLeftPadding)}px`,
                          backgroundColor: `rgba(2, 141, 255, ${1 - nopacity})`}}></div>);

  return (
    <div className='geeke-blockDragMask'
         style={{left: left, top: top}}>
      {masks}
    </div>
  )
};

export default BlockDragMask;