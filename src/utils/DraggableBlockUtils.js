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
export const draggableOnDragStart = (e, dispatch, pageUuid, blockUuid) => {
  e.stopPropagation();
  e.dataTransfer.setData('geeke-drag', `geeke-block:${blockUuid}`);
  setDragBlock(dispatch, pageUuid, blockUuid);
}

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

export const draggableOnDragEnter = (e, dispatch, pageUuid, blockUuid) => {
  e.stopPropagation();
  setDragBlock(dispatch, pageUuid, blockUuid);
}

export const draggableOnDragLeave = (e, dispatch, pageUuid) => {
  e.stopPropagation();
  setDragBlock(dispatch, pageUuid, null);
}

export const draggableOnDrop = (e, dispatch, pageUuid) => {
  e.stopPropagation();
  console.log(e.dataTransfer.getData('geeke-drag'));
  setDragBlock(dispatch, pageUuid, null);
}