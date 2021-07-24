/*************************************************
 * @file QuoteBlock.js
 * @description Blocks in quote block.
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
import { onMouseOver as _onMouseOver, onMouseLeave as _onMouseLeave } from '../utils/DraggableBlockUtils';
import { isShowBlock } from '../utils/NumberListUtils';

/*************************************************
 * Import Components
 *************************************************/
import BlockDargButton from './BlcokDragButton';

/*************************************************
 * Constant
 *************************************************/
import { blockDataKeys, editorLeftPadding, indentWidth, remToPx } from '../constant';

/*************************************************
 * Main components
 *************************************************/
const QuoteBlock = (props) => {
  // Props
  const pageUuid = props.blockProps.pageUuid;
  const blockData = props.block.getData();
  const blockKey = props.block.key;
  const readOnly = props.blockProps.readOnly;
  const handleBlockDargStart = props.blockProps.handleBlockDargStart;
  const contentState = props.contentState;

  // Reducers
  const dispatch = useDispatch();

  // Check whether to show this block
  if (!isShowBlock(contentState, blockKey)) {
    return null;
  }

  // Variables
  let indentLevel = 0;

  // Functions
  const onMouseOver = (e) => _onMouseOver(e, dispatch, pageUuid, blockKey);
  const onMouseLeave = (e) => _onMouseLeave(e, dispatch, pageUuid);

  if (blockData.has(blockDataKeys.indentLevel)) {
    indentLevel = blockData.get(blockDataKeys.indentLevel);
  }

  const paddingLeft = remToPx(indentWidth * indentLevel);

  return (
    <div
      className="geeke-blockWrapper"
      style={{ paddingLeft: `${paddingLeft + remToPx(editorLeftPadding)}px` }}
      geeke="true"
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
      <div className="geeke-quoteBar noselect" contentEditable={false} style={{ paddingLeft: `${paddingLeft}px` }}>
        <div className="geeke-quoteBarInner"></div>
      </div>
      <div className="geeke-quoteEditor">
        <EditorBlock {...props} />
      </div>
    </div>
  );
};

export default QuoteBlock;
