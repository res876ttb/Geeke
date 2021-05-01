/*************************************************
 * @file BasicBlock.js
 * @description Basic block.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React, { useState } from 'react';

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
  blockDataKeys,
  indentWidth,
} from '../constant';
import { EditorBlock } from 'draft-js';

/*************************************************
 * Main components
 *************************************************/
const BasicBlock = props => {
  // Props
  const blockData = props.block.getData();

  // States
  const [mouseOver, setMouseOver] = useState(false);

  // Variables
  let indentLevel = 0;

  if (blockData.has(blockDataKeys.indentLevel)) {
    indentLevel = blockData.get(blockDataKeys.indentLevel);
  }

  return (
    <div
      className='geeke-blockWrapper'
      style={{marginLeft: `${indentWidth * indentLevel}rem`}}
      onMouseOver={() => setMouseOver(true)}
      onMouseLeave={() => setMouseOver(false)}
    >
      <div contentEditable={false} className={'geeke-draggableWrapper' + (mouseOver ? '' : ' geeke-invisible')}>
        <img draggable="false" src='./drag.svg' alt='handleBlockDrag'></img>
      </div>

      <EditorBlock {...props} />
    </div>
  )
}

export default BasicBlock;
