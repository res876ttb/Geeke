/*************************************************
 * @file NumberedListBlock.js
 * @description Blocks in numbered list.
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
} from '../utils/DraggableBlockUtils';

/*************************************************
 * Import Components
 *************************************************/
import BlockDargButton from './BlcokDragButton';

/*************************************************
 * Styles
 *************************************************/
import '../styles/BasicBlock.css';
import '../styles/NumberedListBlock.css';

/*************************************************
 * Constant
 *************************************************/
import {
  blockDataKeys,
  indentWidth,
  constBlockType,
} from '../constant';

/*************************************************
 * Main components
 *************************************************/
const NumberedListBlock = props => {
  // Props
  const pageUuid = props.blockProps.pageUuid;
  const blockData = props.block.getData();
  const blockKey = props.block.key;
  const readOnly = props.blockProps.readOnly;
  const handleBlockDargStart = props.blockProps.handleBlockDargStart;
  const contentState = props.contentState;

  // Reducers
  const dispatch = useDispatch();

  // Variables
  let indentLevel = 0;

  // Functions
  const onMouseOver = e => _onMouseOver(e, dispatch, pageUuid, blockKey);
  const onMouseLeave = e => _onMouseLeave(e, dispatch, pageUuid);

  // Get indent level from block data
  if (blockData.has(blockDataKeys.indentLevel)) {
    indentLevel = blockData.get(blockDataKeys.indentLevel);
  }

  // Get the number of this list
  let curBlock = props.block;
  let curBlockData = null;
  let curBlockIndentLevel = 0;
  let numberCounter = 1;
  while (curBlock) {
    curBlock = contentState.getBlockBefore(curBlock.getKey());
    if (!curBlock) break;
    curBlockData = curBlock.getData();
    curBlockIndentLevel = curBlockData.has(blockDataKeys.indentLevel) ? curBlockData.get(blockDataKeys.indentLevel) : 0;
    if (curBlock.getType() === constBlockType.numberList && curBlockIndentLevel === indentLevel) numberCounter += 1;
    else break;
  }

  return (
    <div
      className='geeke-blockWrapper'
      style={{marginLeft: `${indentWidth * indentLevel}rem`}}
      geeke='true'

      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
    >
      <BlockDargButton
        blockKey={blockKey}
        pageUuid={pageUuid}
        readOnly={readOnly}
        handleBlockDargStart={handleBlockDargStart}
      />
      <div className='geeke-numberedListMark noselect' contentEditable={false}>
        <div className='geeke-numberedListMarkInner'>
          {numberCounter}.
        </div>
      </div>
      <div className='geeke-numberedListEditor'>
        <EditorBlock {...props} />
      </div>
    </div>
  )
}

export default NumberedListBlock;
