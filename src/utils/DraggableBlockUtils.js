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
// import {
//   indentWidth,
//   editorLeftPadding,
//   remToPx,
// } from '../constant';

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

export const onDragStart = (e, readOnly, setReadOnly) => {
  e.stopPropagation();

  const cursorX = e.nativeEvent.clientX;
  const cursorY = e.nativeEvent.clientY;
  const sourceElement = document.elementFromPoint(cursorX, cursorY);

  if (sourceElement.draggable === true) {
    e.preventDefault();
    return;
  }

  if (!readOnly) {
    setReadOnly(true);
  } else {
    e.preventDefault();
  }
};

export const onDragEnter = (e) => {
  e.stopPropagation();
  const clientX = e.clientX;
  const clientY = e.clientY;
  const mouseOverElement = document.elementFromPoint(clientX, clientY);

  // console.log(mouseOverElement);
};

export const onDragEnd = (e, setReadOnly) => {
  e.stopPropagation();
  setReadOnly(false);
};