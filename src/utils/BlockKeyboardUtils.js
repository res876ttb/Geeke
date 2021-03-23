/**
 * @file BlockKeyboardUtils.js
 * @description Utilities for handling keyboard input.
 */

/*************************************************
 * IMPORT
 *************************************************/
import {
  ContentState,
  EditorState,
  getDefaultKeyBinding,
  Modifier,
  RichUtils,
  SelectionState,
} from 'draft-js';
import {
  addBlock,
  deleteBlocks,
  getNextBlock,
  getPreviousBlock,
  setFocusedBlock,
  setLessIndent,
  setMoreIndent,
  updateContent,
  enterSelectionMode,
  escapeSelectionMode,
  selectBlock,
  selectDirection,
} from '../states/editor';

/*************************************************
 * CONST
 *************************************************/
export const defaultKeyboardHandlingConfig = {
  createNewBlock: true,
  indentBlock: true,
  deleteBlock: true,
  moveCursor: true,
  selectionMode: true,
};

export const keyCommandConst = {
  lessIndent: 1,
  moreIndent: 2,
  newBlock: 3,
  moveCursorUp: 4,
  moveCursorDown: 5,
  selectUp: 6,
  selectDown: 7,
  selectLeft: 8,
  selectRight: 9,
  deleteBlockBackward: 10,
  deleteBlockForward: 11,
  moveCursorUpForward: 12,
  moveCursorDownBackward: 13,
  enterSelectionMode: 14,
  escapeSelectionMode: 15,
  selectAnchor: 16,
  selectFocus: 17,
};

/*************************************************
 * FUNCTIONS
 *************************************************/

//// Start of mapKeyToEditorCommand

const mapKeyToEditorCommand_enter = (e, config) => {
  if (!e.shiftKey) {
    e.preventDefault();
    if (config.createNewBlock) {
      return keyCommandConst.newBlock;
    }
  }
  return getDefaultKeyBinding(e);
}

const mapKeyToEditorCommand_tab = (e, config) => {
  if (config.indentBlock) {
    if (e.shiftKey) {
      return keyCommandConst.lessIndent;
    } else {
      return keyCommandConst.moreIndent;
    }
  }
  return getDefaultKeyBinding(e);
}

const mapKeyToEditorCommand_backspace = (e, config, isFirstBlock, editorState) => {
  const contentState = editorState.getCurrentContent();
  const selectionState = editorState.getSelection();
  const firstBlock = contentState.getFirstBlock();
  const firstBlockKey = firstBlock.getKey();
  const focusBlockKey = selectionState.getFocusKey();
  const focusOffset = selectionState.getFocusOffset();

  if (firstBlockKey === focusBlockKey && focusOffset === 0) {
    if (isFirstBlock) {
      if (config.indentBlock) {
        return keyCommandConst.lessIndent;
      }
    } else {
      if (config.deleteBlock) {
        return keyCommandConst.deleteBlockForward;
      }
    }
  }
  return getDefaultKeyBinding(e);
}

const mapKeyToEditorCommand_delete = (e, config, editorState) => {
  const contentState = editorState.getCurrentContent();
  const selectionState = editorState.getSelection();
  const lastBlock = contentState.getLastBlock();
  const lastBlockKey = lastBlock.getKey();
  const focusBlockKey = selectionState.getFocusKey();
  const focusOffset = selectionState.getFocusOffset();

  if (lastBlockKey === focusBlockKey && focusOffset === lastBlock.getLength()) {
    if (config.deleteBlock) {
      return keyCommandConst.deleteBlockBackward;
    }
  }
  return getDefaultKeyBinding(e);
}

const mapKeyToEditorCommand_arrowLeft = (e, config, editorState) => {
  const contentState = editorState.getCurrentContent();
  const selectionState = editorState.getSelection();
  const firstBlock = contentState.getFirstBlock();
  const firstBlockKey = firstBlock.getKey();
  const focusBlockKey = selectionState.getFocusKey();
  const focusOffset = selectionState.getFocusOffset();

  if (firstBlockKey === focusBlockKey && focusOffset === 0) {
    if (e.shiftKey) {
      return keyCommandConst.enterSelectionMode;
    } else {
      if (config.moveCursor) {
        return keyCommandConst.moveCursorUpForward;
      }
    }
  }
  return getDefaultKeyBinding(e);
}

const mapKeyToEditorCommand_arrowUp = (e, config, editorState) => {
  const contentState = editorState.getCurrentContent();
  const selectionState = editorState.getSelection();
  const firstBlock = contentState.getFirstBlock();
  const firstBlockKey = firstBlock.getKey();
  const focusBlockKey = selectionState.getFocusKey();

  if (e.shiftKey) {
    return keyCommandConst.enterSelectionMode;
  } else {
    if (firstBlockKey === focusBlockKey) {
      if (config.moveCursor) {
        return keyCommandConst.moveCursorUp;
      }
    }
  }
  return getDefaultKeyBinding(e);
}

const mapKeyToEditorCommand_arrowRight = (e, config, editorState) => {
  const contentState = editorState.getCurrentContent();
  const selectionState = editorState.getSelection();
  const lastBlock = contentState.getLastBlock();
  const lastBlockKey = lastBlock.getKey();
  const focusBlockKey = selectionState.getFocusKey();
  const focusOffset = selectionState.getFocusOffset();

  if (lastBlockKey === focusBlockKey && focusOffset === lastBlock.getLength()) {
    if (e.shiftKey) {
      return keyCommandConst.enterSelectionMode;
    } else {
      if (config.moveCursor) {
        return keyCommandConst.moveCursorDownBackward;
      }
    }
  }
  return getDefaultKeyBinding(e);
}

const mapKeyToEditorCommand_arrowDown = (e, config, editorState) => {
  const contentState = editorState.getCurrentContent();
  const selectionState = editorState.getSelection();
  const lastBlock = contentState.getLastBlock();
  const lastBlockKey = lastBlock.getKey();
  const focusBlockKey = selectionState.getFocusKey();

  if (e.shiftKey) {
    return keyCommandConst.enterSelectionMode;
  } else {
    if (lastBlockKey === focusBlockKey) {
      if (config.moveCursor) {
        return keyCommandConst.moveCursorDown;
      }
    }
  }
  return getDefaultKeyBinding(e);
};

const mapKeyToEditorCommand_escape = (e, config) => {
  if (config.selectionMode) {
    return keyCommandConst.enterSelectionMode;
  }
  return getDefaultKeyBinding(e);
};

export const mapKeyToEditorCommand = (e, config, editorState, isFirstBlock = false, customFunc = () => undefined) => {
  let res = customFunc();
  if (res) return res;

  switch (e.keyCode) {
    case 13: // Enter
      return mapKeyToEditorCommand_enter(e, config);
    
    case 9: // Tab
      return mapKeyToEditorCommand_tab(e, config);
    
    case 8: // Backspace
      return mapKeyToEditorCommand_backspace(e, config, isFirstBlock, editorState);
    
    case 46: // Delete
      return mapKeyToEditorCommand_delete(e, config, editorState);
    
    case 37: // Arrow key left
      return mapKeyToEditorCommand_arrowLeft(e, config, editorState);
    
    case 38: // Arrow key Up
      return mapKeyToEditorCommand_arrowUp(e, config, editorState);
    
    case 39: // Arrow key right
      return mapKeyToEditorCommand_arrowRight(e, config, editorState);

    case 40: // Arrow key Down
      return mapKeyToEditorCommand_arrowDown(e, config, editorState);
    
    case 27: // Escape
      return mapKeyToEditorCommand_escape(e, config);

    default:
      break;
  }

  return getDefaultKeyBinding(e);
};

//// End of mapKeyToEditorCommand

//// Start of handleKeyCommand

const handleKeyCommand_moveCursorUp = (dispatch, pageUuid, uuid, state, editorState) => {
  const previousUuid = getPreviousBlock(state, pageUuid, uuid);
  const contentState = editorState.getCurrentContent();

  if (previousUuid === uuid) {
    let firstBlock = contentState.getFirstBlock();
    let newSelectionState = new SelectionState({
      anchorKey: firstBlock.getKey(),
      anchorOffset: 0,
      focusKey: firstBlock.getKey(),
      focusOffset: 0,
    });
    updateContent(dispatch, uuid, EditorState.forceSelection(editorState, newSelectionState));
    return false;
  } else {
    setFocusedBlock(dispatch, pageUuid, previousUuid);
    return true;
  }
};

const handleKeyCommand_moveCursorDown = (dispatch, pageUuid, uuid, state, editorState) => {
  const nextUuid = getNextBlock(state, pageUuid, uuid);
  const contentState = editorState.getCurrentContent();

  if (nextUuid === uuid) {
    let lastBlock = contentState.getLastBlock();
    let newSelectionState = new SelectionState({
      anchorKey: lastBlock.getKey(),
      anchorOffset: lastBlock.getLength(),
      focusKey: lastBlock.getKey(),
      focusOffset: lastBlock.getLength(),
    });
    updateContent(dispatch, uuid, EditorState.forceSelection(editorState, newSelectionState));
    return false;
  } else {
    setFocusedBlock(dispatch, pageUuid, nextUuid);
    return true;
  }
};

const handleKeyCommand_moreIndent = (dispatch, pageUuid, uuid) => {
  setMoreIndent(dispatch, pageUuid, [uuid]);
};

const handleKeyCommand_lessIndent = (dispatch, pageUuid, uuid) => {
  setLessIndent(dispatch, pageUuid, [uuid]);
};

const handleKeyCommand_newBlock = (dispatch, pageUuid, parentUuid, uuid, state, editorState) => {
  const contentState = editorState.getCurrentContent();
  const selectionState = editorState.getSelection();
  const startKey = selectionState.getStartKey();
  const endKey = selectionState.getEndKey();
  const startOffset = selectionState.getStartOffset();
  const endOffset = selectionState.getEndOffset();

  let newContentState = contentState;

  // Split focused block into 2 blocks
  if (startKey !== endKey || startOffset !== endOffset) {
    newContentState = Modifier.removeRange(newContentState, selectionState, 'forward');
    newContentState = Modifier.splitBlock(newContentState, new SelectionState({
      anchorKey: startKey,
      anchorOffset: startOffset,
      focusKey: startKey,
      focusOffset: startOffset
    }));
  } else {
    newContentState = Modifier.splitBlock(newContentState, selectionState);
  }

  // Split block array into 2 heaps: current heap and the new heap.
  const blockArray = newContentState.getBlocksAsArray();
  let newBlockArray = [];
  let newNextBlockArray = [];
  let idx = 0;

  for(; idx < blockArray.length; idx++) {
    newBlockArray.push(blockArray[idx]);
    if (blockArray[idx].getKey() === startKey) break;
  }

  for (idx += 1; idx < blockArray.length; idx++) {
    newNextBlockArray.push(blockArray[idx]);
  }

  // Move cursor to correct position
  let newCurEditorState = EditorState.createWithContent(ContentState.createFromBlockArray(newBlockArray));
  let newNextEditorState = EditorState.createWithContent(ContentState.createFromBlockArray(newNextBlockArray));
  let newCurContentState = newCurEditorState.getCurrentContent();
  let newNextContentState = newNextEditorState.getCurrentContent();
  if (newBlockArray.length > 0) {
    newCurEditorState = EditorState.acceptSelection(newCurEditorState, new SelectionState({
      anchorKey: newCurContentState.getLastBlock().getKey(),
      anchorOffset: newCurContentState.getLastBlock().getLength(),
      focusKey: newCurContentState.getLastBlock().getKey(),
      focusOffset: newCurContentState.getLastBlock().getLength(),
    }));
  }
  if (newNextBlockArray.length > 0) {
    newNextEditorState = EditorState.acceptSelection(newNextEditorState, new SelectionState({
      anchorKey: newNextContentState.getFirstBlock().getKey(),
      anchorOffset: 0,
      focusKey: newNextContentState.getFirstBlock().getKey(),
      focusOffset: 0,
    }));
  }

  // Apply new editors state
  let newBlockId;
  if (state.cachedBlocks[uuid].blocks.length > 0) {
    newBlockId = addBlock(dispatch, pageUuid, uuid, null);
  } else {
    newBlockId = addBlock(dispatch, pageUuid, parentUuid, uuid);
  }
  updateContent(dispatch, uuid, newCurEditorState);
  updateContent(dispatch, newBlockId, newNextEditorState);
  setFocusedBlock(dispatch, pageUuid, newBlockId);
};

const handleKeyCommand_deleteBlockForward = (dispatch, pageUuid, parentUuid, uuid, state, editorState) => {
  const contentState = editorState.getCurrentContent();

  if (handleKeyCommand_moveCursorUp(dispatch, pageUuid, uuid, state, editorState)) {
    let previousBlockUuid = getPreviousBlock(state, pageUuid, uuid);
    let previousEditorState = state.cachedBlocks[previousBlockUuid].content;
    let previousContentState = previousEditorState.getCurrentContent();
    let previousBlockArray = previousContentState.getBlocksAsArray();
    let previousLastBlock = previousContentState.getLastBlock();
    let curBlockArray = contentState.getBlocksAsArray();
    let curFirstBlock = contentState.getFirstBlock();
    let fakeSelectionState = new SelectionState({
      anchorKey: previousLastBlock.getKey(),
      anchorOffset: previousLastBlock.getLength(),
      focusKey: curFirstBlock.getKey(),
      focusOffset: 0,
    });
    let newSelectionState = new SelectionState({
      anchorKey: previousLastBlock.getKey(),
      anchorOffset: previousLastBlock.getLength(),
      focusKey: previousLastBlock.getKey(),
      focusOffset: previousLastBlock.getLength(),
    });

    // Remove the barrier between these 2 blocks by remove the fake selection range
    let newPreviousContentState = ContentState.createFromBlockArray(previousBlockArray.concat(curBlockArray));
    newPreviousContentState = Modifier.removeRange(newPreviousContentState, fakeSelectionState, 'forward');

    // Create new editor state with the new selection
    let newPreviousEditorState = EditorState.createWithContent(newPreviousContentState);
    newPreviousEditorState = EditorState.acceptSelection(newPreviousEditorState, newSelectionState);

    updateContent(dispatch, previousBlockUuid, newPreviousEditorState);
    deleteBlocks(dispatch, pageUuid, parentUuid, [uuid], false);
  }
};

const handleKeyCommand_deleteBlockBackward = (dispatch, pageUuid, uuid, state, editorState) => {
  const contentState = editorState.getCurrentContent();
  let nextBlockUuid = getNextBlock(state, pageUuid, uuid);

  if (nextBlockUuid !== uuid) {
    let nextEditorState = state.cachedBlocks[nextBlockUuid].content;
    let nextContentState = nextEditorState.getCurrentContent();
    let nextBlockArray = nextContentState.getBlocksAsArray();
    let nextFirstBlock = nextContentState.getFirstBlock();
    let curBlockArray = contentState.getBlocksAsArray();
    let curLastBlock = contentState.getLastBlock();
    let fakeSelectionState = new SelectionState({
      anchorKey: curLastBlock.getKey(),
      anchorOffset: curLastBlock.getLength(),
      focusKey: nextFirstBlock.getKey(),
      focusOffset: 0,
    });
    let newSelectionState = new SelectionState({
      anchorKey: curLastBlock.getKey(),
      anchorOffset: curLastBlock.getLength(),
      focusKey: curLastBlock.getKey(),
      focusOffset: curLastBlock.getLength(),
    });

    // Remove the barrier between these 2 blocks by remove the fake selection range
    let newCurContentState = ContentState.createFromBlockArray(curBlockArray.concat(nextBlockArray));
    newCurContentState = Modifier.removeRange(newCurContentState, fakeSelectionState, 'forward');

    // Create new editor state with the new selection
    let newCurEditorState = EditorState.createWithContent(newCurContentState);
    newCurEditorState = EditorState.forceSelection(newCurEditorState, newSelectionState);

    updateContent(dispatch, uuid, newCurEditorState);
    deleteBlocks(dispatch, pageUuid, state.blockParents[nextBlockUuid], [nextBlockUuid], false);
  }
};

const handleKeyCommand_moveCursorUpForward = (dispatch, pageUuid, uuid, state, editorState) => {
  let previousBlockUuid = getPreviousBlock(state, pageUuid, uuid);
  let previousEditorState = state.cachedBlocks[previousBlockUuid].content;

  if (previousEditorState !== '' && previousBlockUuid !== uuid) {
    let previousContentState = previousEditorState.getCurrentContent();
    let previousLastBlock = previousContentState.getLastBlock();
    let newSelectionState = new SelectionState({
      anchorKey: previousLastBlock.getKey(),
      anchorOffset: previousLastBlock.getLength(),
      focusKey: previousLastBlock.getKey(),
      focusOffset: previousLastBlock.getLength(),
    });

    previousEditorState = EditorState.acceptSelection(previousEditorState, newSelectionState);
    updateContent(dispatch, previousBlockUuid, previousEditorState);
  }

  handleKeyCommand_moveCursorUp(dispatch, pageUuid, uuid, state, editorState);
};

const handleKeyCommand_moveCursorDownBackward = (dispatch, pageUuid, uuid, state, editorState) => {
  let nextBlockUuid = getNextBlock(state, pageUuid, uuid);
  let nextEditorState = state.cachedBlocks[nextBlockUuid].content;

  if (nextEditorState !== '' && nextBlockUuid !== uuid) {
    let nextContentState = nextEditorState.getCurrentContent();
    let nextFirstBlock = nextContentState.getFirstBlock();
    let newSelectionState = new SelectionState({
      anchorKey: nextFirstBlock.getKey(),
      anchorOffset: 0,
      focusKey: nextFirstBlock.getKey(),
      focusOffset: 0,
    });

    nextEditorState = EditorState.acceptSelection(nextEditorState, newSelectionState);
    updateContent(dispatch, nextBlockUuid, nextEditorState);
  }

  handleKeyCommand_moveCursorDown(dispatch, pageUuid, uuid, state, editorState);
};

const handleKeyCommand_default = (dispatch, command, uuid, editorState) => {
  const newState = RichUtils.handleKeyCommand(editorState, command);

  if (newState) {
    updateContent(dispatch, uuid, newState);
    return true;
  } else {
    return false;
  }
};

const handleKeyCommand_enterSelectionMode = (dispatch, pageUuid, uuid) => {
  enterSelectionMode(dispatch, pageUuid, uuid);
};

const handleKeyCommand_escapeSelectionMode = (dispatch, pageUuid) => {
  escapeSelectionMode(dispatch, pageUuid);
};

const handleKeyCommand_selectBlock = (dispatch, pageUuid, uuid, state, direction) => {
  if (state.focusedBlock[pageUuid].indexOf('_blockSelector') === -1) {
    // Current mode is not select block. Enter block selection mode.
    handleKeyCommand_enterSelectionMode(dispatch, pageUuid, uuid);
  } else {
    // Current mode is in block selection mode.
    switch (direction) {
      case keyCommandConst.selectUp:
        selectBlock(dispatch, pageUuid, selectDirection.up);
        break;

      case keyCommandConst.selectDown:
        selectBlock(dispatch, pageUuid, selectDirection.down);
        break;

      case keyCommandConst.selectLeft:
        selectBlock(dispatch, pageUuid, selectDirection.left);
        break;

      case keyCommandConst.selectRight:
        selectBlock(dispatch, pageUuid, selectDirection.right);
        break;
      
      default:
        break;
    }
  }
};

const handleKeyCommand_selectAnchor = (dispatch, pageUuid, state) => {
  setFocusedBlock(dispatch, pageUuid, state.selectedBlocks[pageUuid].anchorUuid);
};

const handleKeyCommand_selectFocus = (dispatch, pageUuid, state) => {
  setFocusedBlock(dispatch, pageUuid, state.selectedBlocks[pageUuid].focusUuid);
};

export const handleKeyCommand = (dispatch, pageUuid, parentUuid, uuid, state, editorState, command, customFunc = () => undefined) => {
  let res = customFunc();
  if (res) return res;

  switch (command) {
    case keyCommandConst.moreIndent:
      handleKeyCommand_moreIndent(dispatch, pageUuid, uuid);
      break;
    
    case keyCommandConst.lessIndent:
      handleKeyCommand_lessIndent(dispatch, pageUuid, uuid);
      break;
    
    case keyCommandConst.newBlock:
      handleKeyCommand_newBlock(dispatch, pageUuid, parentUuid, uuid, state, editorState);
      break;
    
    case keyCommandConst.deleteBlockForward:
      handleKeyCommand_deleteBlockForward(dispatch, pageUuid, parentUuid, uuid, state, editorState);
      break;

    case keyCommandConst.deleteBlockBackward:
      handleKeyCommand_deleteBlockBackward(dispatch, pageUuid, uuid, state, editorState);
      break;

    case keyCommandConst.moveCursorUp:
      handleKeyCommand_moveCursorUp(dispatch, pageUuid, uuid, state, editorState);
      break;
    
    case keyCommandConst.moveCursorUpForward:
      handleKeyCommand_moveCursorUpForward(dispatch, pageUuid, uuid, state, editorState);
      break;
    
    case keyCommandConst.moveCursorDown:
      handleKeyCommand_moveCursorDown(dispatch, pageUuid, uuid, state, editorState);
      break;
    
    case keyCommandConst.moveCursorDownBackward:
      handleKeyCommand_moveCursorDownBackward(dispatch, pageUuid, uuid, state, editorState);
      break;

    case keyCommandConst.enterSelectionMode:
      handleKeyCommand_enterSelectionMode(dispatch, pageUuid, uuid);
      break;
    
    case keyCommandConst.escapeSelectionMode:
      handleKeyCommand_escapeSelectionMode(dispatch, pageUuid);
      break;
    
    case keyCommandConst.selectUp:
    case keyCommandConst.selectDown:
    case keyCommandConst.selectLeft:
    case keyCommandConst.selectRight:
      handleKeyCommand_selectBlock(dispatch, pageUuid, uuid, state, command);
      break;

    case keyCommandConst.selectAnchor:
      handleKeyCommand_selectAnchor(dispatch, pageUuid, state);
      break;

    case keyCommandConst.selectFocus:
      handleKeyCommand_selectFocus(dispatch, pageUuid, state);
      break;

    default:
      break;
  }

  return handleKeyCommand_default(dispatch, command, uuid, editorState);;
};

//// End of handleKeyCommand