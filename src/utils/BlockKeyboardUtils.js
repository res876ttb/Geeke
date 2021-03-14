/**
 * @file BlockKeyboardUtils.js
 * @description Utilities for handling keyboard input.
 */

/*************************************************
 * IMPORT
 *************************************************/
 import {getDefaultKeyBinding} from 'draft-js';

/*************************************************
 * CONST
 *************************************************/
export const defaultKeyboardHandlingConfig = {
  createNewBlock: true,
  indentBlock: true,
  deleteBlock: true,
  moveCursor: true,
};

const keyCommandConst = {
  lessIndent: 1,
  moreIndent: 2,
  newBlock: 3,
  moveCursorUp: 4,
  moveCursorDown: 5,
  selectUp: 6,
  selectDown: 7,
  deleteBlockBackward: 8,
  deleteBlockForward: 9,
  moveCursorUpForward: 10,
  moveCursorDownBackward: 11,
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
      // Switch to block select mode
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
    // return keyCommandConst.selectUp;
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
      // Switch to block selection mode
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
    // return keyCommandConst.selectDown;
  } else {
    if (lastBlockKey === focusBlockKey) {
      if (config.moveCursor) {
        return keyCommandConst.moveCursorDown;
      }
    }
  }
  return getDefaultKeyBinding(e);
}

export const mapKeyToEditorCommand = (e, config, editorState, isFirstBlock, customFunc = () => undefined) => {
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

    default:
      break;
  }

  let res = customFunc();
  if (res) return res;
  return getDefaultKeyBinding(e);
};

//// End of mapKeyToEditorCommand