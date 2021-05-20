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

/*************************************************
 * CONST
 *************************************************/
import Immutable from 'immutable';
import {
//   indentWidth,
  editorLeftPadding,
  editorDraggableButtonWidth,
  editorDraggableButtonLeftPadding,
  remToPx,
  oneRem,
  blockDataKeys,
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
  return null;
}

const getBlockElement = target => {
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

const moveAtomicBlock = (contentState, atomicBlock, targetRange, insertionMode) => {
  const editorState = EditorState.createWithContent(contentState);
  const newEditorState = AtomicBlockUtils.moveAtomicBlock(editorState, atomicBlock, targetRange, insertionMode);
  return newEditorState.getCurrentContent();
}

const handleDrop_normalBlock = (e, pageUuid, editorState, selectedBlocks, depth=null) => {
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

  // Check whether drop above the editor
  const editorId = `geeke-editor-${pageUuid}`;
  const editorTopFromPageTop = document.getElementById(editorId).getBoundingClientRect().top;
  const insertBeforeFirstBlock = mouseY <= editorTopFromPageTop;

  // Get target block id
  const target = getBlockElement(dropComponent);
  const targetBlockKey = insertBeforeFirstBlock ? null : getBlockKeyFromBlockElement(target);
  const isInsertFirstBlock = targetBlockKey === null;

  // Check whether the drop position is the selected blocks
  if (selectedBlocks.indexOf(targetBlockKey) !== -1) return editorState;

  // Set block moving setting
  let previousKey = targetBlockKey;
  let insertionMode = 'after';
  if (targetBlockKey === null) {
    previousKey = blockMap.keys().next().value;
    insertionMode = 'before';
  }

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
      if (!isInsertFirstBlock) previousKey = blockKeyToBeMoved;
    }

    // Push state (before modifying indent level)
    newContentState = newContentState.merge({
      selectionBefore: selectionState,
      selectionAfter: newSelectionState.set('hasFocus', true),
    });
    newEditorState = EditorState.push(newEditorState, newContentState, 'drag-and-drop-blocks');
  }

  // Modify block data (just like indentLevel)
  // Set prevIndentLevel
  let prevIndentLevel = -1;
  if (!isInsertFirstBlock) {
    let blockData = blockMap.get(targetBlockKey).getData();
    if (blockData.has(blockDataKeys.indentLevel)) {
      prevIndentLevel = blockData.get(blockDataKeys.indentLevel);
    } else {
      prevIndentLevel = 0;
    }
  }
  if (depth !== null) prevIndentLevel = depth - 1;

  // Get indentLevel of first selected block
  const firstSelectedBlockData = blockMap.get(selectedBlocks[0]).getData();
  const firstSelectedIndentLevel = firstSelectedBlockData.has(blockDataKeys.indentLevel) ? firstSelectedBlockData.get(blockDataKeys.indentLevel) : 0;
  const indentLevelDelta = prevIndentLevel - firstSelectedIndentLevel;

  // Update indent level for each block
  newContentState = newEditorState.getCurrentContent();
  for (let i = 0; i < selectedBlocks.length; i++) {
    const thisKey = selectedBlocks[i];
    const thisBlock = blockMap.get(thisKey);
    const blockData = thisBlock.getData();
    let curIndentLevel = 0;
    if (blockData.has(blockDataKeys.indentLevel)) {
      curIndentLevel = blockData.get(blockDataKeys.indentLevel);
    }

    curIndentLevel += indentLevelDelta;
    curIndentLevel = Math.min(curIndentLevel, prevIndentLevel + 1);
    curIndentLevel = Math.max(curIndentLevel, 0);
    prevIndentLevel = curIndentLevel;

    newContentState = Modifier.setBlockData(newContentState, new SelectionState({
      anchorKey: thisKey,
      anchorOffset: 0,
      focusKey: thisKey,
      focusOffset: 0,
    }), Immutable.Map({[blockDataKeys.indentLevel]: curIndentLevel}));
  }

  // Push state
  newContentState = newContentState.merge({
    selectionBefore: selectionState,
    selectionAfter: newSelectionState.set('hasFocus', true),
  });
  newEditorState = EditorState.push(newEditorState, newContentState, 'drag-and-drop-blocks');
  newEditorState = EditorState.acceptSelection(newEditorState, newSelectionState);

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

export const onDragStart = (e, readOnly, setReadOnly, renderEleId, setDragShadowPos, editorState, handleDropCallback=handleDrop_normalBlock) => {
  if (!readOnly) {
    setReadOnly(true);
  } else {
    return;
  }

  // Constants
  const selectionState = editorState.getSelection();
  const contentState = editorState.getCurrentContent();

  // Find target DOM element and get the block key of the dragged block
  const target = getBlockElement(e.target);
  const targetBlockKey = getBlockKeyFromBlockElement(target);

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

  // Calculate X offset
  const computedEle = window.getComputedStyle(target, null);
  const marginLeft = parseInt(computedEle.getPropertyValue('margin-left').replace('px', ''));
  const offsetX = marginLeft + remToPx(editorLeftPadding - editorDraggableButtonLeftPadding + editorDraggableButtonWidth / 2);

  // Clone the target component
  let clone = target.cloneNode(true);

  // Render the cloned component
  let dragShadowEle = document.getElementById(renderEleId);
  dragShadowEle.appendChild(clone);

  // Start mouse tracker
  setDragShadowPos([offsetX, oneRem / 2, true, (e, pageUuid, editorState, depth) => {
    return handleDropCallback(e, pageUuid, editorState, selectedBlocks, depth);
  }]);
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
  setDragShadowPos([-1, -1, false, null]);
};