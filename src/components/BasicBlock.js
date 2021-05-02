/*************************************************
 * @file BasicBlock.js
 * @description Basic block.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React from 'react';
import { EditorBlock } from 'draft-js';
import { useDispatch } from 'react-redux';

/*************************************************
 * Utils & States
 *************************************************/
import {
  setMouseOverBlockKey,
  unsetMouseOverBlockKey,
} from '../states/editorMisc';

/*************************************************
 * Import Components
 *************************************************/
import BlockDargButton from './BlcokDragButton';

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

/*************************************************
 * Main components
 *************************************************/
const BasicBlock = props => {
  // Props
  const pageUuid = props.blockProps.pageUuid;
  const blockData = props.block.getData();
  const blockKey = props.block.key;

  // Reducers
  const dispatch = useDispatch();

  // Variables
  let indentLevel = 0;

  // Functions
  const onMouseOver = e => {
    e.stopPropagation();
    setMouseOverBlockKey(dispatch, pageUuid, blockKey);
  };

  const onMouseLeave = e => {
    e.stopPropagation();
    unsetMouseOverBlockKey(dispatch, pageUuid);
  }

  if (blockData.has(blockDataKeys.indentLevel)) {
    indentLevel = blockData.get(blockDataKeys.indentLevel);
  }

  return (
    <div
      className='geeke-blockWrapper'
      style={{marginLeft: `${indentWidth * indentLevel}rem`}}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
    >
      <BlockDargButton blockKey={blockKey} pageUuid={pageUuid} />
      <EditorBlock {...props} />
    </div>
  )
}

export default BasicBlock;
