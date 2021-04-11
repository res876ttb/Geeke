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
  moveBlocks,
} from '../states/editor';

/*************************************************
 * CONST
 *************************************************/
import {
  indentWidth,
  editorLeftPadding,
  remToPx,
} from '../constant';

/*************************************************
 * FUNCTIONS
 *************************************************/
 const getBlockDom = (dom) => {
  if (dom.hasAttribute('geeke-type')) {
    // TODO: Support different action when there are multiple block types
    return dom;
  } else if (dom) {
    return getBlockDom(dom.parentNode);
  }
};

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

export const draggableOnDragEnter = (e, dispatch, pageUuid, blockUuid, draggedBlockInfo, lockDrop) => {
  e.stopPropagation();

  if (lockDrop) {
    setDragBlock(dispatch, pageUuid, draggedBlockInfo.blockUuid, draggedBlockInfo.depth);
    return;
  }

  let dom = getBlockDom(e.target);
  let depth = dom.getAttribute('depth');
  let domRect = dom.getBoundingClientRect();
  
  if (blockUuid === draggedBlockInfo.blockUuid) {
    setDragBlock(dispatch, pageUuid, draggedBlockInfo.blockUuid, depth); // Do not need to show drag mask
  } else {
    setDragBlock(dispatch, pageUuid, draggedBlockInfo.blockUuid, depth, domRect.left, domRect.bottom, depth);
  }
}

export const draggableOnDragEnd = (e, dispatch, pageUuid, setLockDrop) => {
  e.stopPropagation();
  setLockDrop(false);
  setDragBlock(dispatch, pageUuid);
}

export const draggableOnDrop = (e, dispatch, pageUuid, draggedBlockInfo, state) => {
  e.stopPropagation();
  setDragBlock(dispatch, pageUuid);

  let dom = getBlockDom(e.target);
  let targetBlockUuid = dom.getAttribute('geeke-id');
  let draggedBlockUuid = draggedBlockInfo.blockUuid;
  if (targetBlockUuid === draggedBlockUuid) return;
  let originParentUuid = state.blockParents[draggedBlockUuid];
  let targetParentBlockUuid = state.blockParents[targetBlockUuid];

  const selectedBlocks = state.selectedBlocks[pageUuid].blocks;
  const blocksToBeMoved = selectedBlocks.length > 0 ? selectedBlocks : [draggedBlockUuid];
  
  if (targetBlockUuid === pageUuid) {
    // Move selected block into first
    moveBlocks(dispatch, pageUuid, pageUuid, originParentUuid, null, blocksToBeMoved);
  } else {
    // Move selected block to the new position
    // 1. Calculate depth according to the drop position
    let cx = e.clientX - draggedBlockInfo.left - remToPx(editorLeftPadding);
    let oneIndentLevel = remToPx(indentWidth);
    let draggedTargetDepth = parseInt(draggedBlockInfo.depth); 
    let depth = (cx / oneIndentLevel) | 0; // https://stackoverflow.com/a/12837315/6868122
    depth = Math.min(depth, parseInt(draggedBlockInfo.depth) + 1);
    
    // 2. Find the new target parentUuid
    let recursiveUpLevel = draggedTargetDepth - depth;
    let previousUuid = targetBlockUuid;
    for (let i = 1; i < recursiveUpLevel; i++) { // This procedure has been done once
      previousUuid = targetParentBlockUuid;
      targetParentBlockUuid = state.blockParents[targetParentBlockUuid];
    }

    // 3. Move blocks
    if (recursiveUpLevel < 0) {
      // Dragged blocks are to be the children of the target block
      moveBlocks(dispatch, pageUuid, targetBlockUuid, originParentUuid, null, blocksToBeMoved);
    } else {
      moveBlocks(dispatch, pageUuid, targetParentBlockUuid, originParentUuid, previousUuid, blocksToBeMoved);
    }
  }
}