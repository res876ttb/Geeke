/*************************************************
 * @file HeadingBlock.js
 * @description Heading block.
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
import { isShowBlock } from '../utils/NumberListUtils';

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
  editorTopPadding,
  headingType,
  indentWidth,
  remToPx,
} from '../constant';

/*************************************************
 * Main components
 *************************************************/
const HeadingBlock = props => {
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
  const onMouseOver = e => _onMouseOver(e, dispatch, pageUuid, blockKey);
  const onMouseLeave = e => _onMouseLeave(e, dispatch, pageUuid);

  if (blockData.has(blockDataKeys.indentLevel)) {
    indentLevel = blockData.get(blockDataKeys.indentLevel);
  }

  const paddingLeft = remToPx(indentWidth * indentLevel);

  // Set font style
  let style = 'h1';
  let paddingTop = 2 + editorTopPadding; // Unit: rem
  let topOffset = 3;                     // Unit: rem
  switch (blockData.get(blockDataKeys.headingType)) {
    case headingType.h1:
      style = 'h1';
      paddingTop = 2 + editorTopPadding;
      topOffset = 3;
      break;

    case headingType.h2:
      style = 'h2';
      paddingTop = 1.7 + editorTopPadding;
      topOffset = 2.3;
      break;

    case headingType.h3:
      style = 'h3';
      paddingTop = 1.5 + editorTopPadding;
      topOffset = 1.9;
      break;

    case headingType.h4:
      style = 'h4';
      paddingTop = 1.3 + editorTopPadding;
      topOffset = 1.5;
      break;

    case headingType.h5:
      style = 'h5';
      paddingTop = 1.2 + editorTopPadding;
      topOffset = 1.2;
      break;

    case headingType.h6:
      style = 'h6';
      paddingTop = 1.2 + editorTopPadding;
      topOffset = 1.1;
      break;

    default:
      break;
  }

  return (
    <div
      className='geeke-blockWrapper'
      style={{paddingLeft: `${paddingLeft + remToPx(editorLeftPadding)}px`,
              paddingTop:  `${paddingTop}rem`}}
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
        topOffset={topOffset}
      />
      <div className={'geeke-headingEditor ' + style}>
        <EditorBlock {...props} />
      </div>
    </div>
  )
}

export default HeadingBlock;
