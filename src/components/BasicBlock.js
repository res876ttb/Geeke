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
  const readOnly = props.blockProps.readOnly;
  const handleBlockDargStart = props.blockProps.handleBlockDargStart;

  // Reducers
  const dispatch = useDispatch();

  // Variables
  let indentLevel = 0;

  // Functions
  const onMouseOver = e => _onMouseOver(e, dispatch, pageUuid, blockKey);
  const onMouseLeave = e => _onMouseLeave(e, dispatch, pageUuid);

  if (blockData.has(blockDataKeys.indentLevel)) {
    indentLevel = blockData.get(blockDataKeys.indentLevel);
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
      <EditorBlock {...props} />
    </div>
  )
}

export default BasicBlock;
