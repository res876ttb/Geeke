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

export const onDragStart = (e, readOnly, setReadOnly, renderEleId, setDragShadowPos) => {
  e.stopPropagation();
  e.preventDefault();

  if (!readOnly) {
    setReadOnly(true);
  } else {
    return;
  }

  // Find target DOM component
  let target = e.target;
  while (true && !target.hasAttribute('geeke')) {
    target = target.parentNode;
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
  setDragShadowPos([offsetX, oneRem / 2, true]);
};

export const onDragEnter = (e) => {
  e.stopPropagation();
  // const clientX = e.clientX;
  // const clientY = e.clientY;
  // const mouseOverElement = document.elementFromPoint(clientX, clientY);

  // console.log(mouseOverElement);
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