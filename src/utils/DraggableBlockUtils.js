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
import {
//   indentWidth,
  editorLeftPadding,
  editorDraggableButtonWidth,
  editorDraggableButtonLeftPadding,
  remToPx,
  oneRem,
} from '../constant';

/*************************************************
 * FUNCTIONS
 *************************************************/
export const onMouseOver = (e, dispatch, pageUuid, blockKey) => {
  e.stopPropagation();
  setMouseOverBlockKey(dispatch, pageUuid, blockKey);
};

export const onMouseLeave = (e, dispatch, pageUuid) => {
  e.stopPropagation();
  unsetMouseOverBlockKey(dispatch, pageUuid);
};

export const onDragStart = (e, readOnly, setReadOnly, renderEleId, setDragShadowPos, editorState) => {
  if (!readOnly) {
    setReadOnly(true);
  } else {
    return;
  }

  // Constants
  const selectionState = editorState.getSelection();
  const contentState = editorState.getCurrentContent();

  // Find target DOM component
  let target = e.target;
  while (true && !target.hasAttribute('geeke')) {
    target = target.parentNode;
  }

  // Get the block key of the dragged block
  const targetParent = target.parentNode;
  const targetBlockKey = targetParent.getAttribute('data-offset-key').split('-')[0];

  // Find all selected component
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

  // Calculate the group info of all blocks

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
  setDragShadowPos([offsetX, oneRem / 2, true]);
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
  setDragShadowPos([-1, -1, false]);
};