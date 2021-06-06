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
 * Constant
 *************************************************/
import {
  blockDataKeys,
  editorLeftPadding,
  indentWidth,
  remToPx,
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

  const paddingLeft = remToPx(indentWidth * indentLevel);

  // Get the number of this list
  const numberListOrder = blockData.has(blockDataKeys.numberListOrder) ? blockData.get(blockDataKeys.numberListOrder) : 1;

  return (
    <div
      className='geeke-blockWrapper'
      style={{paddingLeft: `${paddingLeft + remToPx(editorLeftPadding)}px`}}
      geeke='true'

      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
    >
      <BlockDargButton
        blockKey={blockKey}
        pageUuid={pageUuid}
        readOnly={readOnly}
        handleBlockDargStart={handleBlockDargStart}
        paddingLeft={paddingLeft}
      />
      <div className='geeke-numberedListMark noselect' contentEditable={false} style={{paddingLeft: `${paddingLeft}px`}}>
        <div className='geeke-numberedListMarkInner'>
          {numberListOrder}.
        </div>
      </div>
      <div className='geeke-numberedListEditor'>
        <EditorBlock {...props} />
      </div>
    </div>
  )
}

export default NumberedListBlock;