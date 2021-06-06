/**
 * @file BlockKeyboardUtils.js
 * @description Utilities for handling keyboard input.
 * Keyword: "/// Start"
 */

/*************************************************
 * IMPORT
 *************************************************/
import {
  EditorState,
  getDefaultKeyBinding,
  KeyBindingUtil,
  Modifier,
  RichUtils,
  SelectionState,
} from "draft-js";
import Immutable from 'immutable';

import {
  unsetMouseOverBlockKey,
} from '../states/editorMisc';
import {
  trimNumberListInWholePage,
  trimNumberListWithSameDepth,
  findPreviousBlockWithSameDepth,
} from './NumberListUtils';

/*************************************************
 * CONST
 *************************************************/
import {
  blockDataKeys,
  constBlockType,
} from '../constant';

export const defaultKeyboardHandlingConfig = {
  indentBlock: true,
  convertBlockTypeInline: true,
  numberList: true,
  bulletList: true,
};

const isOSX = navigator.userAgent.indexOf('Mac') !== -1;

const keyCommandConst = {
  doNothing: 0,
  moreIndent: 1,
  lessIndent: 2,
  checkBlockTypeConversion: 3,
  handleBackspace: 4,
  handleDelete: 5,
  multiCommands: 6,
};

/**
 * key             : value
 * dispatcher name : error message
 */
const dispatcherNotFoundConst = {
  setEditorState: 'setEditorState is not configured!',
};

/**
 * key        : value
 * block type : unique number
 */
const blockDataPreserveConstant = {
  none: 0,
  all: 1,
}

/**
 * key                : value
 * name of block data : block type
 */
const blockDataPreserveConfig = {
  [blockDataKeys.indentLevel]: [blockDataPreserveConstant.all],
  [blockDataKeys.numberListOrder]: [constBlockType.numberList],
  [blockDataKeys.checkListCheck]: [blockDataPreserveConstant.none],
}

/*************************************************
 * FUNCTIONS
 *************************************************/
/// Start mapKeyToEditorCommand
const mapKeyToEditorCommand_tab = (e, config) => {
  e.preventDefault();
  if (!config.indentBlock) return getDefaultKeyBinding(e);

  if (e.shiftKey) return keyCommandConst.lessIndent;
  else return keyCommandConst.moreIndent;
};

const mapKeyToEditorCommand_space = (e, config) => {
  if (!config.convertBlockTypeInline) return getDefaultKeyBinding(e);
  return keyCommandConst.checkBlockTypeConversion;
};

const mapKeyToEditorCommand_backspace = (e, config, editorState) => {
  // Default backspace function
  const defaultBackspaceFunciton = () => {
    if (KeyBindingUtil.isOptionKeyCommand(e) ||
        (!isOSX && KeyBindingUtil.isCtrlKeyCommand(e))) {
      return 'backspace-word';
    } else if (KeyBindingUtil.hasCommandModifier(e)) {
      return 'backspace-to-start-of-line';
    } else {
      return 'backspace';
    }
  }

  // If number list is not enabled, just run the default backspace function
  if (!config.numberList) return defaultBackspaceFunciton();

  const contentState = editorState.getCurrentContent();
  const selectionState = editorState.getSelection();
  const endKey = selectionState.getEndKey();

  // If selectionState is not collapsed, then perform delete action
  if (!selectionState.isCollapsed()) {
    return defaultBackspaceFunciton();
  }

  // Check whether current caret position is at the start of the block. If not, this backspace will not remove a block, and no need to trim the numberListOrder
  if (selectionState.getFocusOffset() !== 0) {
    return defaultBackspaceFunciton();
  }

  // Get first previous block with the same indent level
  const curBlock = contentState.getBlockForKey(endKey);
  const curBlockData = curBlock.getData();
  const baseIndentLevel = curBlockData.has(blockDataKeys.indentLevel) ? curBlockData.get(blockDataKeys.indentLevel) : 0;
  let prevBlock = findPreviousBlockWithSameDepth(contentState, endKey, baseIndentLevel);

  // Check whether this block and the previous block are not number list blocks
  if (prevBlock && curBlock.getType() !== constBlockType.numberList && prevBlock.getType() !== constBlockType.numberList) {
    return defaultBackspaceFunciton();
  }

  // Make sure that prevBlock is a numberListBlock
  if (prevBlock && prevBlock.getType() !== constBlockType.numberList) prevBlock = null;

  return [keyCommandConst.multiCommands, keyCommandConst.handleBackspace, prevBlock ? prevBlock.getKey() : null];
};

const mapKeyToEditorCommand_delete = (e, config, editorState) => {
  // Default delete function
  const defaultDeleteFunciton = () => {
    if (KeyBindingUtil.isOptionKeyCommand(e) ||
        (!isOSX && KeyBindingUtil.isCtrlKeyCommand(e))) {
      return 'delete-word';
    } else if (KeyBindingUtil.hasCommandModifier(e)) {
      return 'delete-to-end-of-block';
    } else {
      return 'delete';
    }
  };

  // if number list is not enabled, just run the default delete function
  if (!config.numberList) return defaultDeleteFunciton();

  const contentState = editorState.getCurrentContent();
  const selectionState = editorState.getSelection();
  const endKey = selectionState.getEndKey();
  const curBlock = contentState.getBlockForKey(endKey);
  const nextBlock = contentState.getBlockAfter(endKey);

  // If selectionState is not collapsed, then perform delete action
  if (!selectionState.isCollapsed()) {
    return defaultDeleteFunciton();
  }

  // Check whether current caret position is at the end of the block. If not, this delete will not remove a block, and no need to trim the numberListOrder
  if (selectionState.getFocusOffset() !== contentState.getBlockForKey(endKey).getLength()) {
    return defaultDeleteFunciton();
  }

  // If next block does not exists, then just use the default delete function
  if (!nextBlock) {
    return defaultDeleteFunciton();
  }

  // If this block and the next block are not number lists, then no need to trim the block as well
  if (curBlock.getType() !== constBlockType.numberList && nextBlock.getType() !== constBlockType.numberList) {
    return defaultDeleteFunciton();
  }

  return [keyCommandConst.multiCommands, keyCommandConst.handleDelete, endKey];
};

export const mapKeyToEditorCommand = (e, config, dispatch, editorState, pageUuid) => {
  unsetMouseOverBlockKey(dispatch, pageUuid);

  switch (e.keyCode) {
    case 9: // Tab
      return mapKeyToEditorCommand_tab(e, config);

    case 32: // Space
      return mapKeyToEditorCommand_space(e, config);

    case 8: // Backspace
      return mapKeyToEditorCommand_backspace(e, config, editorState);

    case 46: // Delete
      return mapKeyToEditorCommand_delete(e, config, editorState);

    default:
      // console.log(getDefaultKeyBinding(e));
      return getDefaultKeyBinding(e);
  }
};
/// End mapKeyToEditorCommand

/// Start handleKeyCommand
const handleKeyCommand_moreIndent = (editorState, dispatcher) => {
  if (!dispatcher.setEditorState) {
    console.error(dispatcherNotFoundConst.setEditorState);
    return 'not-handled';
  }

  // Constants
  const curContent = editorState.getCurrentContent();
  const curSelection = editorState.getSelection();
  const startBlockKey = curSelection.getStartKey();
  const endBlockKey = curSelection.getEndKey();
  const focusBlockKey = curSelection.getFocusKey();
  const focusOffset = curSelection.getFocusOffset();
  const focusBlock = curContent.getBlockForKey(focusBlockKey);
  const focusBlockLength = focusBlock.getLength();
  const blockMap = curContent.getBlockMap();
  const keyArray = Array.from(blockMap.keys());
  const startIndex = keyArray.indexOf(startBlockKey);
  const endIndex = keyArray.indexOf(endBlockKey);
  const startBlock = blockMap.get(keyArray[startIndex]);

  // Set prevIndentLevel
  let prevIndentLevel = -1;
  if (startIndex > 0) {
    let blockData = blockMap.get(keyArray[startIndex - 1]).getData();
    if (blockData.has(blockDataKeys.indentLevel)) {
      prevIndentLevel = blockData.get(blockDataKeys.indentLevel);
    } else {
      prevIndentLevel = 0;
    }
  }

  // Initialize new content
  let newContentState = Modifier.setBlockData(curContent, new SelectionState({
    anchorKey: keyArray[startIndex],
    anchorOffset: 0,
    focusKey: keyArray[startIndex],
    focusOffset: 0,
  }), Immutable.Map({[blockDataKeys.indentLevel]:
    startBlock.getData().has(blockDataKeys.indentLevel) ?
    startBlock.getData().get(blockDataKeys.indentLevel) : 0
  }));

  // Update indent level for each block
  for (let i = startIndex; i <= endIndex; i++) {
    let block = blockMap.get(keyArray[i]);
    let blockData = block.getData();
    let newBlockData = new Map(blockData);
    let curIndentLevel = 0;
    if (blockData.has(blockDataKeys.indentLevel)) {
      curIndentLevel = blockData.get(blockDataKeys.indentLevel);
    }

    // Check whether the first selected block can be indented
    if (i === startIndex && curIndentLevel === prevIndentLevel + 1) {
      return;
    }

    if (curIndentLevel <= prevIndentLevel) curIndentLevel += 1;
    prevIndentLevel = curIndentLevel;
    newBlockData.set(blockDataKeys.indentLevel, curIndentLevel);

    newContentState = Modifier.setBlockData(newContentState, new SelectionState({
      anchorKey: keyArray[i],
      anchorOffset: 0,
      focusKey: keyArray[i],
      focusOffset: 0,
    }), newBlockData);
  }

  // Push state
  newContentState = trimNumberListInWholePage(newContentState);
  let newEditorState = EditorState.push(editorState, newContentState, "more-indent");
  newEditorState = EditorState.forceSelection(newEditorState, new SelectionState({
    focusKey: focusBlockKey,
    focusOffset: focusBlockLength === 0 ? 1 : focusOffset,
    anchorKey: focusBlockKey,
    anchorOffset: focusBlockLength === 0 ? 1 : focusOffset,
  }));

  // Update editorState
  dispatcher.setEditorState(newEditorState);
};

const handleKeyCommand_lessIndent = (editorState, dispatcher) => {
  if (!dispatcher.setEditorState) {
    console.error(dispatcherNotFoundConst.setEditorState);
    return;
  }

  // Constants
  const curContent = editorState.getCurrentContent();
  const curSelection = editorState.getSelection();
  const startBlockKey = curSelection.getStartKey();
  const endBlockKey = curSelection.getEndKey();
  const focusBlockKey = curSelection.getFocusKey();
  const focusOffset = curSelection.getFocusOffset();
  const focusBlock = curContent.getBlockForKey(focusBlockKey);
  const focusBlockLength = focusBlock.getLength();
  const blockMap = curContent.getBlockMap();
  const keyArray = Array.from(blockMap.keys());
  const startIndex = keyArray.indexOf(startBlockKey);
  const endIndex = keyArray.indexOf(endBlockKey);
  const startBlock = blockMap.get(keyArray[startIndex]);

  // Initialize new content
  let newContentState = Modifier.setBlockData(curContent, new SelectionState({
    anchorKey: keyArray[startIndex],
    anchorOffset: 0,
    focusKey: keyArray[startIndex],
    focusOffset: 0,
  }), Immutable.Map({[blockDataKeys.indentLevel]:
    startBlock.getData().has(blockDataKeys.indentLevel) ?
    startBlock.getData().get(blockDataKeys.indentLevel) : 0
  }));

  // Update indent level for each block
  let updated = 0;
  for (let i = startIndex; i <= endIndex; i++) {
    let block = blockMap.get(keyArray[i]);
    let blockData = block.getData();
    let newBlockData = new Map(blockData);
    let curIndentLevel = 0;
    if (blockData.has(blockDataKeys.indentLevel)) {
      curIndentLevel = blockData.get(blockDataKeys.indentLevel);
    }

    if (curIndentLevel > 0) {
      newBlockData.set(blockDataKeys.indentLevel, curIndentLevel - 1);
      updated += 1;
    }

    newContentState = Modifier.setBlockData(newContentState, new SelectionState({
      anchorKey: keyArray[i],
      anchorOffset: 0,
      focusKey: keyArray[i],
      focusOffset: 0,
    }), newBlockData);
  }

  // Check whether the editor is updated by reducing the indent level of some blocks
  if (updated === 0) return;

  // Push state
  newContentState = trimNumberListInWholePage(newContentState);
  let newEditorState = EditorState.push(editorState, newContentState, "less-indent");
  newEditorState = EditorState.forceSelection(newEditorState, new SelectionState({
    focusKey: focusBlockKey,
    focusOffset: focusBlockLength === 0 ? 1 : focusOffset,
    anchorKey: focusBlockKey,
    anchorOffset: focusBlockLength === 0 ? 1 : focusOffset,
  }));

  // Update editorState
  dispatcher.setEditorState(newEditorState);
};

const handleKeyCommand_default = (editorState, command, dispatcher) => {
  if (!dispatcher.setEditorState) {
    console.error(dispatcherNotFoundConst.setEditorState);
    return 'not-handled';
  }

  const newEditorState = RichUtils.handleKeyCommand(editorState, command);
  if (!newEditorState) return 'not-handled';

  dispatcher.setEditorState(newEditorState);
  return 'handled';
};

// TODO: this implementation may have performance issue if user enter space continuously...
const handleKeyCommand_checkBlockTypeConversion = (editorState, command, dispatcher) => {
  if (!dispatcher.setEditorState) {
    console.error(dispatcherNotFoundConst.setEditorState);
    return 'not-handled';
  }

  // Get current caret position. Absolutely, if selectionState is not collapse, this feature must not work.
  const selectionState = editorState.getSelection();
  const caretPosition = selectionState.getFocusOffset();
  if (!selectionState.isCollapsed()) return handleKeyCommand_default(editorState, command, dispatcher);

  // Get current block content and find the position of the first space
  const contentState = editorState.getCurrentContent();
  const focusKey = selectionState.getFocusKey();
  const focusBlock = contentState.getBlockForKey(focusKey);
  const focusBlockType = focusBlock.getType();
  const blockText = focusBlock.getText();
  const firstSpaceIndex__ = blockText.indexOf(' ');
  const firstSpaceIndex = firstSpaceIndex__ > -1 ? firstSpaceIndex__ : focusBlock.getLength();

  // handleConvertToNumberList
  const handleConvertToNumberList = () => {
    // Before conver the block into another type, insert a space first for a better undo
    let newContentState = contentState;
    let newEditorState = editorState;
    newContentState = Modifier.insertText(contentState, selectionState, ' ');
    newEditorState = EditorState.push(editorState, newContentState, 'insert-characters');

    // Convert the type of the block
    newContentState = Modifier.setBlockType(newContentState, selectionState, constBlockType.numberList);
    newContentState = Modifier.removeRange(newContentState, rangeToRemove, 'forward');

    // Find previous block with the same depth
    const focusBlockData = focusBlock.getData();
    const curIndentLevel = focusBlockData.has(blockDataKeys.indentLevel) ? focusBlockData.get(blockDataKeys.indentLevel) : 0;
    const prevBlock = findPreviousBlockWithSameDepth(newContentState, focusKey, curIndentLevel);
    if (prevBlock && prevBlock.getType() === constBlockType.numberList) {
      const prevBlockData = prevBlock.getData();
      const prevBlockNumberListOrder = prevBlockData.has(blockDataKeys.numberListOrder) ? prevBlockData.get(blockDataKeys.numberListOrder) : 1;
      newContentState = trimNumberListWithSameDepth(newContentState, prevBlock.getKey(), curIndentLevel, prevBlockNumberListOrder);
    } else {
      newContentState = trimNumberListWithSameDepth(newContentState, focusKey, curIndentLevel);
    }

    // Update change via dispatcher
    newEditorState = EditorState.push(newEditorState, newContentState, 'change-block-type');
    newEditorState = EditorState.forceSelection(newEditorState, newSelectionState);
    dispatcher.setEditorState(newEditorState);
  };

  // Check whether current caret position is before the first space. If not, this is not the type conversion case, and insert a space back
  const insertSpaceToCurrentSelection = () => {
    let newContentState = Modifier.insertText(contentState, selectionState, ' ');
    let newEditorState = EditorState.push(editorState, newContentState, 'insert-characters');
    dispatcher.setEditorState(newEditorState);
  };

  if (caretPosition >= firstSpaceIndex && caretPosition !== focusBlock.getLength()) {
    insertSpaceToCurrentSelection();
    return 'handled';
  }

  // Get text befoer first space
  let keyword = blockText.slice(0, caretPosition);

  // Chech the conversion type and convert
  const newSelectionState = new SelectionState({
    focusKey: focusKey,
    focusOffset: 0,
    anchorKey: focusKey,
    anchorOffset: 0,
  });
  const rangeToRemove = new SelectionState({
    focusKey: focusKey,
    focusOffset: caretPosition + 1, // Including the extra space charactor
    anchorKey: focusKey,
    anchorOffset: 0,
  });

  // Get new type
  let newType = null;
  switch (keyword) {
    // Bullet list
    case '*':
    case '-':
      if (focusBlockType !== constBlockType.bulletList) newType = constBlockType.bulletList;
      break;

    // Check list
    case '[]':
      if (focusBlockType !== constBlockType.checkList) newType = constBlockType.checkList;
      break;

    // Toggle list
    case '>':
      if (focusBlockType !== constBlockType.toggleList) newType = constBlockType.toggleList;
      break;

    // Other cases
    default:
      // Numbered list
      if (keyword.match(/^\d+\./) && focusBlockType !== constBlockType.numberList) {
        handleConvertToNumberList();
        return 'handled';
      }

      // Default: null
      break;
  }

  // If not a valid keyword, then just insert a space
  if (!newType) {
    insertSpaceToCurrentSelection();
    return 'handled';
  }

  // Before conver the block into another type, insert a space first for a better undo
  let newContentState = contentState;
  let newEditorState = editorState;
  newContentState = Modifier.insertText(contentState, selectionState, ' ');
  newEditorState = EditorState.push(editorState, newContentState, 'insert-characters');

  // Convert the type of the block
  newContentState = Modifier.setBlockType(newContentState, selectionState, newType);
  newContentState = Modifier.removeRange(newContentState, rangeToRemove, 'forward');

  // Remove from block data according to its block type
  switch (focusBlockType) {
    case constBlockType.numberList: {
      // Remove numberListOrder from current block
      let focusBlockData = new Map(focusBlock.getData());
      let removeSelectionState = new SelectionState({
        focusKey: focusKey,
        focusOffset: 0,
        anchorKey: focusKey,
        anchorOffset: 0,
      });
      focusBlockData.delete(blockDataKeys.numberListOrder);
      newContentState = Modifier.mergeBlockData(newContentState, removeSelectionState, focusBlockData);

      // Trim the following blocks
      let baseIndentLevel = focusBlockData.has(blockDataKeys.indentLevel) ? focusBlockData.get(blockDataKeys.indentLevel) : 0;
      let nextBlock = newContentState.getBlockAfter(focusKey);
      if (nextBlock) {
        newContentState = trimNumberListWithSameDepth(newContentState, nextBlock.getKey(), baseIndentLevel);
      }
    } break;

    default:
      break;
  }

  // Update editorState
  newEditorState = EditorState.push(newEditorState, newContentState, 'change-block-type');
  newEditorState = EditorState.forceSelection(newEditorState, newSelectionState);
  dispatcher.setEditorState(newEditorState);
  return 'handled';
};

export const handleKeyCommand_backspace = (editorState, command, dispatcher) => {
  if (!dispatcher.setEditorState) {
    console.error(dispatcherNotFoundConst.setEditorState);
    return 'not-handled';
  }

  // Constants
  const prevBlockKeyWithSameDepth = command[2];
  let newEditorState = editorState;
  let newContentState = newEditorState.getCurrentContent();
  let newSelectionState = newEditorState.getSelection();
  let focusKey = newSelectionState.getFocusKey();
  let focusBlock = newContentState.getBlockForKey(focusKey);
  let focusBlockData = focusBlock.getData();
  let baseIndentLevel = focusBlockData.has(blockDataKeys.indentLevel) ? focusBlockData.get(blockDataKeys.indentLevel) : 0;

  // Check current block type. If it has type, remove it. If it does not have type, remove this block and append all text after caret to the previous block.
  if (focusBlock.getType() !== 'unstyled') {
    newContentState = Modifier.setBlockType(newContentState, newSelectionState, 'unstyled');

    // Update block data: remove numberListOrder from block data
    let focusBlockData = new Map(focusBlock.getData());
    if (focusBlockData.has(blockDataKeys.numberListOrder)) {
      focusBlockData.delete(blockDataKeys.numberListOrder);
      newContentState = Modifier.mergeBlockData(newContentState, newSelectionState, focusBlockData);
    }

    // Trim the next list
    let nextBlock = newContentState.getBlockAfter(focusBlock.getKey());
    if (nextBlock) {
      newContentState = trimNumberListWithSameDepth(newContentState, nextBlock.getKey(), baseIndentLevel);
      newSelectionState = null; // No need to set new selection state
    }
  } else {
    const selectionState = newEditorState.getSelection();
    const curBlock = newContentState.getBlockForKey(selectionState.getFocusKey());
    let prevBlock = newContentState.getBlockBefore(selectionState.getFocusKey());
    if (!prevBlock) return 'not-handled';

    // Remove the block
    prevBlock = newContentState.getBlockForKey(prevBlock.getKey());
    const removeSelectionState = new SelectionState({
      focusKey: curBlock.getKey(),
      focusOffset: 0,
      anchorKey: prevBlock.getKey(),
      anchorOffset: prevBlock.getLength(),
    });
    newContentState = Modifier.removeRange(newContentState, removeSelectionState, 'backward');

    // Set newSelectionState
    newSelectionState = new SelectionState({
      focusKey: prevBlock.getKey(),
      focusOffset: prevBlock.getLength(),
      anchorKey: prevBlock.getKey(),
      anchorOffset: prevBlock.getLength(),
    });

    // Update focusKey, because current block is removed
    focusKey = prevBlock.getKey();
    focusBlock = newContentState.getBlockForKey(focusKey);

    // Update block data: trim the numbered list (start from the prevBlock)
    if (prevBlockKeyWithSameDepth) {
      let prevBlock = newContentState.getBlockForKey(prevBlockKeyWithSameDepth);
      let prevBlockData = prevBlock.getData();
      let prevNumberListOrder = prevBlockData.has(blockDataKeys.numberListOrder) ? prevBlockData.get(blockDataKeys.numberListOrder) : 1;
      newContentState = trimNumberListWithSameDepth(newContentState, prevBlockKeyWithSameDepth, baseIndentLevel, prevNumberListOrder);
    } else {
      newContentState = trimNumberListWithSameDepth(newContentState, focusKey, baseIndentLevel);
    }
  }

  // Apply update to editorState
  newEditorState = EditorState.push(editorState, newContentState, 'change-block-type');
  console.assert(newEditorState !== null, 'newEditorState is null when handling backspace!');
  if (newSelectionState) {
    newEditorState = EditorState.forceSelection(newEditorState, newSelectionState);
  }
  dispatcher.setEditorState(newEditorState);

  return 'handled';
};

const handleKeyCommand_delete = (editorState, command, dispatcher) => {
  if (!dispatcher.setEditorState) {
    console.error(dispatcherNotFoundConst.setEditorState);
    return 'not-handled';
  }

  // Constants
  const selectionState = editorState.getSelection();
  const curBlockKey = command[2];
  let newEditorState = editorState;
  let newContentState = editorState.getCurrentContent();
  const curBlock = newContentState.getBlockForKey(curBlockKey);
  const nextBlock = newContentState.getBlockAfter(curBlockKey);
  const curBlockData = curBlock.getData();
  const nextBlockData = nextBlock.getData();
  const baseIndentLevel = curBlockData.has(blockDataKeys.indentLevel) ? curBlockData.get(blockDataKeys.indentLevel) : 0;
  const nextIndentLevel = nextBlockData.has(blockDataKeys.indentLevel) ? nextBlockData.get(blockDataKeys.indentLevel) : 0;
  const baseNumberListOrder = curBlockData.has(blockDataKeys.numberListOrder) ? curBlockData.get(blockDataKeys.numberListOrder) : 1;

  // Remove block
  const removeSelectionState = new SelectionState({
    anchorKey: curBlockKey,
    anchorOffset: curBlock.getLength(),
    focusKey: nextBlock.getKey(),
    focusOffset: 0,
  });
  newContentState = Modifier.removeRange(newContentState, removeSelectionState, 'backward');

  // Trim the following blocks
  if (curBlock.getType() === constBlockType.numberList && baseIndentLevel === nextIndentLevel) {
    newContentState = trimNumberListWithSameDepth(newContentState, curBlockKey, baseIndentLevel, baseNumberListOrder);
  } else {
    let nextBlock = newContentState.getBlockAfter(curBlockKey);
    newContentState = trimNumberListWithSameDepth(newContentState, nextBlock.getKey(), nextIndentLevel, 1);
  }

  // Update editorState
  newEditorState = EditorState.push(editorState, newContentState, 'delete-number-list');
  newEditorState = EditorState.forceSelection(newEditorState, selectionState);
  dispatcher.setEditorState(newEditorState);

  return 'handled';
};

export const handleKeyCommand = (editorState, command, dispatcher) => {
  switch (command) {
    case keyCommandConst.moreIndent:
      return handleKeyCommand_moreIndent(editorState, dispatcher);

    case keyCommandConst.lessIndent:
      return handleKeyCommand_lessIndent(editorState, dispatcher);

    case keyCommandConst.doNothing:
      return false;

    case keyCommandConst.checkBlockTypeConversion:
      return handleKeyCommand_checkBlockTypeConversion(editorState, command, dispatcher);

    default:
      if (typeof(command) === typeof([]) && command[0] === keyCommandConst.multiCommands) {
        switch(command[1]) {
          case keyCommandConst.handleBackspace:
            return handleKeyCommand_backspace(editorState, command, dispatcher);

          case keyCommandConst.handleDelete:
            return handleKeyCommand_delete(editorState, command, dispatcher);

          default:
            break;
        }
      }
      return handleKeyCommand_default(editorState, command, dispatcher);
  }
}
/// End handleKeyCommand

/// Start handleReturn
export const handleReturn = (e, editorState, dispatcher, config=blockDataPreserveConfig) => {
  if (!dispatcher.setEditorState) {
    console.error(dispatcherNotFoundConst.setEditorState);
    return false;
  }

  // Constants
  const contentState = editorState.getCurrentContent();
  const selectionState = editorState.getSelection();
  const originalBlockKey = selectionState.getEndKey();
  const hasShift = e.shiftKey;

  // Variables
  let newEditorState = editorState;
  let newContentState = contentState;

  // If selection is not collapsed... return false!
  if (!selectionState.isCollapsed()) return false;

  // If shift is pressed, then insert soft new line
  if (hasShift) {
    newEditorState = RichUtils.insertSoftNewline(newEditorState);
    dispatcher.setEditorState(newEditorState);
    return true;
  }

  // Get all block data from current block
  const curBlock = contentState.getBlockMap().get(originalBlockKey);
  const curBlockType = curBlock.getType();
  const blockData = curBlock.getData();
  const indentLevel = blockData.has(blockDataKeys.indentLevel) ? blockData.get(blockDataKeys.indentLevel) : 0;

  // Copy only necessary block data
  let newMap = new Map();
  blockData.forEach((value, key) => {
    if (config[key].indexOf(blockDataPreserveConstant.all) > -1 ||
        config[key].indexOf(curBlockType) > -1) {
      newMap.set(key, value);
    }
  });

  // Perform split block operation
  newContentState = Modifier.splitBlock(newContentState, selectionState);
  // Use push to get a new editorState with a new selectionState for merging block data
  newEditorState = EditorState.push(newEditorState, newContentState, "split-block");
  const newSelectionState = newEditorState.getSelection();

  // Merge block data
  newContentState = Modifier.mergeBlockData(
    newEditorState.getCurrentContent(),
    newSelectionState,
    newMap
  );

  // If current block is number list block, modify the number list order after this block
  if (curBlockType === constBlockType.numberList) {
    let focusBlock = newContentState.getBlockForKey(selectionState.getFocusKey());
    let focusBlockData = focusBlock.getData();
    let baseNumberListOrder = focusBlockData.has(blockDataKeys.numberListOrder) ? focusBlockData.get(blockDataKeys.numberListOrder) : 1;
    newContentState = trimNumberListWithSameDepth(newContentState, selectionState.getFocusKey(), indentLevel, baseNumberListOrder);
  }

  // Push copy block data action into editorState & update selection state
  // Note: to ignore the push we used for generating a new selectionState, use original editorState to push undo stack
  newEditorState = EditorState.push(editorState, newContentState, 'split-block');
  newEditorState = EditorState.forceSelection(newEditorState, newSelectionState);

  // Render current change
  dispatcher.setEditorState(newEditorState);

  return true;
}