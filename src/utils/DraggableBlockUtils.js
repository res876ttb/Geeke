/**
 * @file DraggableBlockUtils.js
 * @description Utilities for handling dragging blocks.
 */

/*************************************************
 * IMPORT
 *************************************************/
import {
  setMouseOverBlockKey,
  unsetMouseOverBlockKey,
} from '../states/editorMisc';
import {
  getFirstBlockKey,
  getLastBlockKey,
} from '../utils/Misc';
import { trimNumberListInWholePage } from './NumberListUtils';

/*************************************************
 * CONST
 *************************************************/
import {
  editorLeftPadding,
  editorDraggableButtonWidth,
  editorDraggableButtonLeftPadding,
  remToPx,
  oneRem,
  blockDataKeys,
  dragMaskHeight,
  indentWidth,
} from '../constant';
import {
  EditorState,
  SelectionState,
  AtomicBlockUtils,
  Modifier,
} from 'draft-js';

/*************************************************
 * FUNCTIONS
 *************************************************/
const getElementAtDropPosition = (x, y) => {
  let elements = document.elementsFromPoint(x, y);
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].className === 'geeke-pageDragShadow' && i + 1 < elements.length) {
      return elements[i + 1];
    }
  }
  return elements[0];
}

const getBlockElementFromAnyDomEle = target => {
  if (!target) return null;
  let curElement = target;

  if (curElement.nodeName === 'HTML') return null;
  while (!curElement.hasAttribute('geeke')) {
    if (curElement === document.body) return null;
    curElement = curElement.parentNode;
  }

  return curElement;
}

const getBlockKeyFromBlockElement = element => {
  if (!element) return null;

  const elementParent = element.parentNode;
  const blockKey = elementParent.getAttribute('data-offset-key').split('-')[0];

  return blockKey;
}

const getBlockDepthFromBlockKey = (key, contentState) => {
  let depth = 0;
  const block = contentState.getBlockForKey(key);
  const blockData = block.getData();
  depth = blockData.has(blockDataKeys.indentLevel) ? blockData.get(blockDataKeys.indentLevel) : 0;

  return depth;
}

const moveAtomicBlock = (contentState, atomicBlock, targetRange, insertionMode) => {
  const editorState = EditorState.createWithContent(contentState);
  const newEditorState = AtomicBlockUtils.moveAtomicBlock(editorState, atomicBlock, targetRange, insertionMode);
  return newEditorState.getCurrentContent();
}

const handleDrop_normalBlock = (e, pageUuid, editorState, selectedBlocks) => {
  const mouseX = e.clientX, mouseY = e.clientY;
  const dropComponent = getElementAtDropPosition(mouseX, mouseY);
  if (dropComponent === null) return editorState;

  const contentState = editorState.getCurrentContent();
  const selectionState = editorState.getCurrentContent();
  const blockMap = contentState.getBlockMap();
  const previousBlock = contentState.getBlockBefore(selectedBlocks[0]);
  const previousBlockKey = previousBlock ? previousBlock.getKey() : null;
  const newSelectionState = new SelectionState({
    anchorKey: selectedBlocks[0],
    anchorOffset: 0,
    focusKey: selectedBlocks[0],
    focusOffset: 0,
  });
  let newEditorState = editorState;
  let newContentState = contentState;

  // Check whether drop above the editor. TODO: check whether first block or last block...
  const editorId = `geeke-editor-${pageUuid}`;
  const editorRect = document.getElementById(editorId).getBoundingClientRect();
  const editorTopFromPageTop = editorRect.top;
  const editorBottomFromPageTop = editorRect.bottom;
  const editorRightFromPageLeft = editorRect.right;
  const insertBeforeFirstBlock = mouseY <= editorTopFromPageTop;
  const insertAfterLastBlock = mouseY >= editorBottomFromPageTop;

  // Calculate target depth
  const dragMaskLeft = editorRect.left + remToPx(editorLeftPadding);
  const cursorDeltaX = mouseX - dragMaskLeft;
  const depth = Math.floor(cursorDeltaX / remToPx(indentWidth));

  // Get target block id
  let targetBlockKey = null;
  if (insertBeforeFirstBlock) {
    targetBlockKey = getFirstBlockKey(contentState);
  } else if (insertAfterLastBlock) {
    targetBlockKey = getLastBlockKey(contentState);
  } else {
    const dropComponent = getElementAtDropPosition(editorRightFromPageLeft - remToPx(editorLeftPadding), mouseY);
    const blockElement = getBlockElementFromAnyDomEle(dropComponent);
    targetBlockKey = getBlockKeyFromBlockElement(blockElement);
  }

  // Check whether the drop position is the selected blocks
  if (selectedBlocks.indexOf(targetBlockKey) !== -1) return editorState;

  // Set block moving setting
  let previousKey = targetBlockKey;
  let insertionMode = insertBeforeFirstBlock ? 'before' : 'after';

  // Check whether the block position is changed
  if (targetBlockKey !== previousBlockKey) {
    // If the position is changed, move selected block iteratively
    for (let i = 0; i < selectedBlocks.length; i++) {
      const blockKeyToBeMoved = selectedBlocks[i];
      const blockLengthToBeMoved = blockMap.get(blockKeyToBeMoved).getLength();
      newContentState = moveAtomicBlock(
        newContentState,
        contentState.getBlockForKey(blockKeyToBeMoved),
        new SelectionState({
          anchorKey:    previousKey,
          anchorOffset: blockLengthToBeMoved,
          focusKey:     previousKey,
          focusOffset:  blockLengthToBeMoved,
        }),
        insertionMode
      );
      if (!insertBeforeFirstBlock) previousKey = blockKeyToBeMoved;
    }

    // Push state (before modifying indent level)
    newContentState = newContentState.merge({
      selectionBefore: selectionState,
      selectionAfter: newSelectionState.set('hasFocus', true),
    });
    newEditorState = EditorState.push(editorState, newContentState, 'drag-and-drop-blocks');
  }

  // Modify block data (just like indentLevel)
  // Set prevIndentLevel
  let prevIndentLevel = -1;
  if (!insertBeforeFirstBlock) {
    let blockData = blockMap.get(targetBlockKey).getData();
    if (blockData.has(blockDataKeys.indentLevel)) {
      prevIndentLevel = blockData.get(blockDataKeys.indentLevel);
    } else {
      prevIndentLevel = 0;
    }
  }
  if (depth < 0) prevIndentLevel = 0;
  else prevIndentLevel = Math.min(prevIndentLevel + 1, depth);

  // Get indentLevel of first selected block
  const firstSelectedBlockData = blockMap.get(selectedBlocks[0]).getData();
  const firstSelectedIndentLevel = firstSelectedBlockData.has(blockDataKeys.indentLevel) ? firstSelectedBlockData.get(blockDataKeys.indentLevel) : 0;
  const indentLevelDelta = prevIndentLevel - firstSelectedIndentLevel;

  // Check whether indent level should be updated. If not, trim the whole page and return directly
  if (indentLevelDelta === 0) {
    newContentState = trimNumberListInWholePage(newContentState);
    newEditorState = EditorState.push(editorState, newContentState, 'drag-and-drop-blocks');
    newEditorState = EditorState.acceptSelection(newEditorState, newSelectionState);
    return newEditorState;
  }

  // Update indent level for each block
  newContentState = newEditorState.getCurrentContent();
  for (let i = 0; i < selectedBlocks.length; i++) {
    const thisKey = selectedBlocks[i];
    const thisBlock = blockMap.get(thisKey);
    const blockData = thisBlock.getData();
    let newBlockData = new Map(blockData);
    let curIndentLevel = 0;
    if (blockData.has(blockDataKeys.indentLevel)) {
      curIndentLevel = blockData.get(blockDataKeys.indentLevel);
    }

    curIndentLevel += indentLevelDelta;
    curIndentLevel = Math.min(curIndentLevel, prevIndentLevel + 1);
    curIndentLevel = Math.max(curIndentLevel, 0);
    prevIndentLevel = curIndentLevel;

    newBlockData.set(blockDataKeys.indentLevel, curIndentLevel);
    newContentState = Modifier.mergeBlockData(newContentState, new SelectionState({
      anchorKey: thisKey,
      anchorOffset: 0,
      focusKey: thisKey,
      focusOffset: 0,
    }), newBlockData);
  }

  // Trim the whole page and push state to undo stack
  newContentState = newContentState.merge({
    selectionBefore: selectionState,
    selectionAfter: newSelectionState.set('hasFocus', true),
  });
  newContentState = trimNumberListInWholePage(newContentState);
  newEditorState = EditorState.acceptSelection(newEditorState, newSelectionState);
  newEditorState = EditorState.push(editorState, newContentState, 'drag-and-drop-blocks');

  return newEditorState;
};

export const onMouseOver = (e, dispatch, pageUuid, blockKey) => {
  e.stopPropagation();
  setMouseOverBlockKey(dispatch, pageUuid, blockKey);
};

export const onMouseLeave = (e, dispatch, pageUuid) => {
  e.stopPropagation();
  unsetMouseOverBlockKey(dispatch, pageUuid);
};

export const onDragStart = (e, readOnly, renderEleId, setDragShadowPos, editorState, handleDropCallback=handleDrop_normalBlock) => {
  if (readOnly) {
    return;
  }

  // Constants
  const selectionState = editorState.getSelection();
  const contentState = editorState.getCurrentContent();

  // Find target DOM element and get the block key of the dragged block
  const target = getBlockElementFromAnyDomEle(e.target);
  const targetBlockKey = getBlockKeyFromBlockElement(target);

  // Get size of the cloned object
  const targetRect = target.getBoundingClientRect();
  const targetWidth = targetRect.width;
  const targetHeight = targetRect.height;

  // Find all selected blocks
  const endBlockKey = selectionState.getEndKey();
  let curBlock = contentState.getBlockForKey(selectionState.getStartKey());
  let selectedBlocks = [];
  while (curBlock.getKey() !== endBlockKey) {
    selectedBlocks.push(curBlock.getKey());
    curBlock = contentState.getBlockAfter(curBlock.getKey());
  }
  selectedBlocks.push(curBlock.getKey());

  // Check if the dragged block is in the selected blocks
  if (selectedBlocks.indexOf(targetBlockKey) < 0) {
    selectedBlocks = [targetBlockKey];
  }

  // Find all child blocks of the dragged blocks
  curBlock = contentState.getBlockForKey(targetBlockKey);
  let curChild = true;
  let curBlockData = curBlock.getData();
  let baseBlockDepth = curBlockData.has(blockDataKeys.indentLevel) ? curBlockData.get(blockDataKeys.indentLevel) : 0;
  while (curBlock && curChild) {
    curBlock = contentState.getBlockAfter(curBlock.getKey());
    if (!curBlock) break;
    curBlockData = curBlock.getData();
    curChild = curBlockData.has(blockDataKeys.indentLevel) ? curChild ? curBlockData.get(blockDataKeys.indentLevel) > baseBlockDepth : false : false;
    if (curChild && selectedBlocks.indexOf(curBlock.getKey()) < 0) selectedBlocks.push(curBlock.getKey());
  }

  // Calculate X offset
  const computedEle = window.getComputedStyle(target, null);
  const targetMarginLeft = parseFloat(computedEle.getPropertyValue('margin-left').replace('px', ''));
  const targetPaddingLeft = parseFloat(computedEle.getPropertyValue('padding-left').replace('px', ''));
  const targetPaddingRight = parseFloat(computedEle.getPropertyValue('padding-right').replace('px', ''));
  const offsetX = targetMarginLeft + remToPx(editorLeftPadding - editorDraggableButtonLeftPadding + editorDraggableButtonWidth / 2);
  const offsetXBackground = targetMarginLeft + remToPx(editorLeftPadding - editorDraggableButtonLeftPadding);
  const targetTextWidth = targetWidth - targetPaddingLeft - targetPaddingRight + remToPx(editorDraggableButtonLeftPadding);

  // Clone the target component
  let clone = target.cloneNode(true);

  // Set size of cloned component
  clone.style.width = `${targetWidth}px`;
  clone.style.height = `${targetHeight}px`;
  clone.style.lineHeight = `1.4rem`;

  // Create a block represents there are multiple blocks when dragging
  let moreBlocks = document.createElement('div');
  moreBlocks.innerHTML = '<b>...</b>';
  moreBlocks.style.position = 'absolute';
  moreBlocks.style.left = `${remToPx(editorDraggableButtonLeftPadding)}px`;
  moreBlocks.style.bottom = `0.2rem`;

  // Create background component
  let background = document.createElement('div');
  background.style.left = `${offsetXBackground}px`;
  background.style.position = 'absolute';
  background.style.width = `${targetTextWidth}px`;
  background.style.height = `${targetHeight + (selectedBlocks.length > 1 ? remToPx(1.4) : 0)}px`;
  background.style.top = `0px`;
  background.style.background = 'rgba(114, 199, 255, 0.5)';
  background.style.borderRadius = '0.2rem';

  // Render the background and the cloned component
  let dragShadowEle = document.getElementById(renderEleId);
  if (selectedBlocks.length > 1) {
    background.appendChild(moreBlocks);
  }
  dragShadowEle.appendChild(background);
  dragShadowEle.appendChild(clone);

  // Start mouse tracker
  setDragShadowPos([offsetX, oneRem / 2, true, (e, pageUuid, editorState) => {
    return handleDropCallback(e, pageUuid, editorState, selectedBlocks);
  }, selectedBlocks]);
};

export const onDragEnd = (e, setReadOnly, renderEleId, setDragShadowPos) => {
  e.stopPropagation();
  setReadOnly(false);

  // Remove event listener
  document.onmousemove = null;
  document.onmouseup = null;

  // Remove shadow element
  let dragShadowEle = document.getElementById(renderEleId);
  dragShadowEle.innerHTML = '';

  // Disable drag event listener
  setDragShadowPos([-1, -1, false, null, []]);
};

export const createDragMaskParam = (mouseX, mouseY, pageUuid, editorState, selectedBlocks) => {
  // Sanity check if there are any selected blocks
  if (selectedBlocks.length === 0) return null;

  // Get block at current cursor position
  const dropComponent = getElementAtDropPosition(mouseX, mouseY);
  if (dropComponent === null) return null;

  // Constants
  const contentState = editorState.getCurrentContent();

  // Check whether drop above the editor. TODO: check whether first block or last block...
  const editorId = `geeke-editor-${pageUuid}`;
  const editorRect = document.getElementById(editorId).getBoundingClientRect();
  const editorTopFromPageTop = editorRect.top;
  const editorBottomFromPageTop = editorRect.bottom;
  const editorRightFromPageLeft = editorRect.right;
  const insertBeforeFirstBlock = mouseY <= editorTopFromPageTop;
  const insertAfterLastBlock = mouseY >= editorBottomFromPageTop;

  // Calculate X offset
  const offsetX = editorRect.left;
  const editorTop = editorRect.top;
  const editorBottom = editorRect.bottom;
  const editorWidth = editorRect.width;

  // Check whether mouse is over any editor block. If not, handle it
  if (insertBeforeFirstBlock) {
    return {
      left: `${offsetX}px`,
      top: `${editorTop}px`,
      width: `${editorWidth}px`,
      depth: -1,
    };
  } else if (insertAfterLastBlock) {
    // Get depth of the last block
    const lastBlockKey = getLastBlockKey(contentState)
    const depth = getBlockDepthFromBlockKey(lastBlockKey, contentState);

    // Return result!
    return {
      left: `${offsetX}px`,
      top: `${editorBottom - remToPx(dragMaskHeight)}px`,
      width: `${editorWidth}px`,
      depth: depth,
    };
  }

  // Get target block key
  const target = getBlockElementFromAnyDomEle(getElementAtDropPosition(editorRightFromPageLeft - remToPx(editorLeftPadding), mouseY));
  const targetBlockKey = getBlockKeyFromBlockElement(target);

  // Check whether target block is selected. If so, do not show mask.
  if (selectedBlocks.indexOf(targetBlockKey) !== -1 || targetBlockKey === null) return null;

  // Get size of the cloned object
  const targetRect = target.getBoundingClientRect();
  const targetbottom = targetRect.bottom;

  // Get depth of the target block
  const depth = getBlockDepthFromBlockKey(targetBlockKey, contentState);

  // Create the position and size parameters for the drag mask
  return {
    left: `${offsetX}px`,
    top: `${targetbottom - remToPx(dragMaskHeight)}px`,
    width: `${editorWidth}px`,
    depth: depth,
  };
};