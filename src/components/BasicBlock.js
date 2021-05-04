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
  onMouseOver as _onMouseOver,
  onMouseLeave as _onMouseLeave,
  onDragStart as _onDragStart,
  onDragEnd as _onDragEnd,
  onDragEnter as _onDragEnter,
} from '../utils/DraggableBlockUtils';

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
  const setReadOnly = props.blockProps.setReadOnly;
  const readOnly = props.blockProps.readOnly;

  // Reducers
  const dispatch = useDispatch();

  // Variables
  let indentLevel = 0;

  // Functions
  const onMouseOver = e => _onMouseOver(e, dispatch, pageUuid, blockKey);
  const onMouseLeave = e => _onMouseLeave(e, dispatch, pageUuid);
  const onDragStart = e => _onDragStart(e, readOnly, setReadOnly);
  const onDragEnd = e => _onDragEnd(e, setReadOnly);
  const onDragEnter = e => _onDragEnter(e);

  if (blockData.has(blockDataKeys.indentLevel)) {
    indentLevel = blockData.get(blockDataKeys.indentLevel);
  }

  return (
    <div
      className='geeke-blockWrapper'
      draggable={true}
      style={{marginLeft: `${indentWidth * indentLevel}rem`}}

      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragEnter={onDragEnter}
    >
      <BlockDargButton blockKey={blockKey} pageUuid={pageUuid} readOnly={readOnly} />
      <div onDragStart={e => {e.preventDefault(); e.stopPropagation();}} draggable='true'>
        <EditorBlock {...props} />
      </div>
    </div>
  )
}

export default BasicBlock;
