/*************************************************
 * @file Misc.js
 * @description Some Useful Functions
 *************************************************/

/*************************************************
 * IMPORT LIBRARIES
 *************************************************/
import { Modifier, SelectionState } from 'draft-js';
import { v4 as uuidv4 } from 'uuid';

/*************************************************
 * CONSTANTS
 *************************************************/
const uuidBytes = [0x6e, 0xc0, 0xbd, 0x7f, 0x11, 0xc0, 0x43, 0xda, 0x97, 0x5e, 0x2a, 0x8a, 0xd9, 0xeb, 0xae, 0x0b];

/*************************************************
 * FUNCTIONS
 *************************************************/
export function newBlockId() {
  return uuidv4(uuidBytes);
}

export const getFirstBlockKey = contentState => {
  const blockMap = contentState.getBlockMap();
  return blockMap.keys().next().value;
}

export const getLastBlockKey = contentState => {
  const blockMap = contentState.getBlockMap();
  return Array.from(blockMap.keys()).pop();
}

export const updateBlockData = (contentState, blockKey, blockData, selectionState=null) => {
  if (selectionState) {
    return Modifier.setBlockData(contentState, selectionState, blockData);
  } else {
    return Modifier.setBlockData(contentState, new SelectionState({
      focusKey: blockKey,
      focusOffset: 0,
      anchorKey: blockKey,
      anchorOffset: 0,
    }), blockData);
  }
}