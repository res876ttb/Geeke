/**
 * @file DraggableBlockUtils.js
 * @description Utilities for handling dragging blocks.
 */

/*************************************************
 * IMPORT
 *************************************************/
import {
  setHoverBlock,
  setDragBlock,
} from '../states/editor';

/*************************************************
 * CONST
 *************************************************/

/*************************************************
 * FUNCTIONS
 *************************************************/
export const draggableOnMouseEnter = (e, dispatch, pageUuid, blockUuid) => {
  e.stopPropagation();
  setHoverBlock(dispatch, pageUuid, blockUuid);
}

export const draggableOnMouseLeave = (e, dispatch, pageUuid) => {
  e.stopPropagation();
  setHoverBlock(dispatch, pageUuid, null);
}

export const draggableOnMouseMove = (e, dispatch, pageUuid, blockUuid) => {
  e.stopPropagation();
  setHoverBlock(dispatch, pageUuid, blockUuid);
}

export const draggableOnKeyDown = (e, dispatch, pageUuid) => {
  e.stopPropagation();
  setHoverBlock(dispatch, pageUuid, null);
}

export const draggableOnDragStart = (e, dispatch, pageUuid, blockUuid, setLockDrop) => {
  e.stopPropagation();
  e.dataTransfer.setData('geeke-drag', 'geeke-block');
  setDragBlock(dispatch, pageUuid, blockUuid);
  setLockDrop(true);
}

export const draggableOnDragEnter = (e, dispatch, pageUuid, blockUuid, draggedBlockUuid, lockDrop) => {
  e.stopPropagation();

  if (lockDrop) {
    setDragBlock(dispatch, pageUuid, draggedBlockUuid);
    return;
  }

  const getBlockDom = (dom) => {
    if (dom.hasAttribute('geeke-type')) {
      return dom;
    } else if (dom) {
      return getBlockDom(dom.parentNode);
    }
  };

  let dom = getBlockDom(e.target);
  let domRect = dom.getBoundingClientRect();
  
  if (blockUuid === draggedBlockUuid) {
    setDragBlock(dispatch, pageUuid, draggedBlockUuid); // Do not need to show drag mask
  } else {
    setDragBlock(dispatch, pageUuid, draggedBlockUuid, domRect.left, domRect.bottom);
  }
}

export const draggableOnDragEnd = (e, dispatch, pageUuid, setLockDrop) => {
  e.stopPropagation();
  setLockDrop(false);
  setDragBlock(dispatch, pageUuid);
}

export const draggableOnDrop = (e, dispatch, pageUuid, draggedBlockUuid) => {
  e.stopPropagation();
}