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

import {
  setMouseOverBlockKey,
} from '../states/editorMisc';
import {
  trimNumberListInWholePage,
  trimNumberListWithSameDepth,
  findPreviousBlockWithSameDepth,
} from './NumberListUtils';
import {
  GeekeMap,
  updateBlockData,
} from "./Misc";

/*************************************************
 * CONST
 *************************************************/
import {
  blockDataKeys,
  constAceEditorAction,
  constBlockType,
  constMoveDirection,
  headingType,
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
  deleteMultipleBlocks: 7,
  moveDownToCodeBlock: 8,
  moveUpToCodeBlock: 9,
  moveToPreviousBlock: 10,
  moveToNextBlock: 11,
  selectPreviousSpecialBlock: 12,
  selectNextSpecialBlock: 13,
  toggleInlineStrikeThrough: 14,
  toggleInlineCode: 15,
};

/**
 * key             : value
 * dispatcher name : error message
 */
const dispatcherNotFoundConst = {
  setEditorState: 'setEditorState is not configured!',
  setFocusBlockKey: 'setFocusBlockKey is not configured!',
  moveCursor: 'moveCursor is not configured!',
  handleFocusEditor: 'handleFocusEditor is not configured!',
  setMoveDirection: 'setMoveDirection is not configured!',
};

/**
 * key        : value
 * block type : unique number
 */
const blockDataPreserveConstant = {
  none: 0,
  all: 1,
};

/**
 * key                : value
 * name of block data : block type
 */
const blockDataPreserveConfig = {
  [blockDataKeys.indentLevel]: [blockDataPreserveConstant.all],
  [blockDataKeys.numberListOrder]: [constBlockType.numberList],
  [blockDataKeys.checkListCheck]: [blockDataPreserveConstant.none],
  [blockDataKeys.parentKey]: [blockDataPreserveConstant.all],
  [blockDataKeys.toggleListToggle]: [blockDataPreserveConstant.none],
  [blockDataKeys.headingType]: [blockDataPreserveConstant.none],
};

const specialBlockSet = new Set([
  constBlockType.code,
]);

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
    if (selectionState.getFocusKey() === selectionState.getAnchorKey()) {
      return defaultBackspaceFunciton();
    } else {
      return keyCommandConst.deleteMultipleBlocks;
    }
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
  let needTrimNumberList = !(prevBlock && curBlock.getType() !== constBlockType.numberList && prevBlock.getType() !== constBlockType.numberList);

  // Make sure that prevBlock is a numberListBlock
  if (prevBlock && prevBlock.getType() !== constBlockType.numberList) prevBlock = null;

  return [keyCommandConst.multiCommands, keyCommandConst.handleBackspace, (prevBlock ? prevBlock.getKey() : null), needTrimNumberList];
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
    if (selectionState.getFocusKey() === selectionState.getAnchorKey()) {
      return defaultDeleteFunciton();
    } else {
      return keyCommandConst.deleteMultipleBlocks;
    }
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
  let needTrimNumberList = curBlock.getType() === constBlockType.numberList || nextBlock.getType() === constBlockType.numberList;

  return [keyCommandConst.multiCommands, keyCommandConst.handleDelete, endKey, needTrimNumberList];
};

const mapKeyToEditorCommand_arrowKey = (e, editorState) => {
  const defaultArrowKeyFunction = () => null;

  const selectionState = editorState.getSelection();

  // No need to handle the event that selection is not collapsed because in this condition, arrow key will not move the caret to next/previous block.
  if (!selectionState.isCollapsed()) return defaultArrowKeyFunction();

  // Functions to check whether to move to code block
  const contentState = editorState.getCurrentContent();
  const focusBlockKey = selectionState.getFocusKey();
  const focusBlock = contentState.getBlockForKey(focusBlockKey);
  const focusOffset = selectionState.getFocusOffset();
  const hasShift = e.shiftKey;

  const checkMoveUp = (leftKey=false) => {
    // Check whether current position is at first
    if (leftKey && focusOffset > 0) return defaultArrowKeyFunction();

    // If this is the first block
    const previousBlock = contentState.getBlockBefore(focusBlockKey);
    if (!previousBlock) return defaultArrowKeyFunction();

    // Check whether the previous block is a code block
    if (previousBlock.getType() === constBlockType.code && !hasShift) {
      // This is exactly the block that you can move up!
      return keyCommandConst.moveUpToCodeBlock;
    }

    return defaultArrowKeyFunction();
  };

  const checkMoveDown = (rightKey=false) => {
    // Check whether current position is at the end of the block
    if (rightKey && focusOffset < focusBlock.getLength()) return defaultArrowKeyFunction();

    // If this is the last block
    const nextBlock = contentState.getBlockAfter(focusBlockKey);
    if (!nextBlock) return defaultArrowKeyFunction();

    // Check whether the next block is a code block
    if (nextBlock.getType() === constBlockType.code && !hasShift) {
      return keyCommandConst.moveDownToCodeBlock;
    }

    return defaultArrowKeyFunction();
  };

  switch (e.keyCode) {
    case 37: // Left
      return checkMoveUp(true);

    case 38: // Up
      return checkMoveUp(false);

    case 39: // Right
      return checkMoveDown(true);

    case 40: // Down
      return checkMoveDown(false);

    default:
      console.error(`Unknown keycode ${e.keyCode}. Use default action`);
      return defaultArrowKeyFunction();
  }
};

const mapKeyToEditorCommand_s = (e, config) => {
  if (((!isOSX && KeyBindingUtil.isCtrlKeyCommand(e)) || KeyBindingUtil.hasCommandModifier(e)) && e.shiftKey) {
    return keyCommandConst.toggleInlineStrikeThrough;
  }

  return null;
};

const mapKeyToEditorCommand_e = (e, config) => {
  if ((!isOSX && KeyBindingUtil.isCtrlKeyCommand(e)) || KeyBindingUtil.hasCommandModifier(e)) {
    return keyCommandConst.toggleInlineCode;
  }

  return null;
};

export const mapKeyToEditorCommand = (e, config, dispatch, editorState, pageUuid) => {
  setMouseOverBlockKey(dispatch, pageUuid, null);

  switch (e.keyCode) {
    case 9: // Tab
      return mapKeyToEditorCommand_tab(e, config);

    case 32: // Space
      return mapKeyToEditorCommand_space(e, config);

    case 8: // Backspace
      return mapKeyToEditorCommand_backspace(e, config, editorState);

    case 46: // Delete
      return mapKeyToEditorCommand_delete(e, config, editorState);

    case 37: // Left
    case 38: // Up
    case 39: // Right
    case 40: // Down
      return mapKeyToEditorCommand_arrowKey(e, editorState);

    case 83: // S
      return mapKeyToEditorCommand_s(e, config);

    case 69: // E
      return mapKeyToEditorCommand_e(e, config);

    default:
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
  let newBlockData = new GeekeMap(curContent.getBlockForKey(keyArray[startIndex]).getData());
  newBlockData.set(blockDataKeys.indentLevel, startBlock.getData().has(blockDataKeys.indentLevel) ? startBlock.getData().get(blockDataKeys.indentLevel) : 0);
  let newContentState = updateBlockData(curContent, keyArray[startIndex], newBlockData);

  // Update indent level for each block
  let minIndentLevel = 9999999;
  for (let i = startIndex; i <= endIndex; i++) {
    let block = blockMap.get(keyArray[i]);
    let blockData = block.getData();
    let newBlockData = new GeekeMap(blockData);
    let curIndentLevel = 0;
    if (blockData.has(blockDataKeys.indentLevel)) {
      curIndentLevel = blockData.get(blockDataKeys.indentLevel);
    }

    minIndentLevel = Math.min(minIndentLevel, curIndentLevel);

    // Check whether the first selected block can be indented
    if (i === startIndex && curIndentLevel === prevIndentLevel + 1) {
      return;
    }

    if (curIndentLevel <= prevIndentLevel) curIndentLevel += 1;
    prevIndentLevel = curIndentLevel;
    newBlockData.set(blockDataKeys.indentLevel, curIndentLevel);

    newContentState = updateBlockData(newContentState, keyArray[i], newBlockData);
  }

  // Check whether the indent of all the children blocks are changed.
  let nextBlock = newContentState.getBlockAfter(endBlockKey);
  let changeMoreIndent = false;
  if (nextBlock) {
    let nextBlockData = nextBlock.getData();
    if (nextBlockData.has(blockDataKeys.indentLevel) && nextBlockData.get(blockDataKeys.indentLevel) > minIndentLevel) {
      changeMoreIndent = true;
    }
  }

  // If not all the children blocks are chagned, update them
  while (changeMoreIndent) {
    if (!nextBlock) break;
    let nextBlockData = nextBlock.getData();
    let nextBlockDepth = nextBlockData.has(blockDataKeys.indentLevel) ? nextBlockData.get(blockDataKeys.indentLevel) : 0;
    if (nextBlockDepth <= minIndentLevel) break;

    let newNextBlockData = new GeekeMap(nextBlockData);
    newNextBlockData.set(blockDataKeys.indentLevel, nextBlockDepth + 1);
    newContentState = updateBlockData(newContentState, nextBlock.getKey(), newNextBlockData);
    nextBlock = newContentState.getBlockAfter(nextBlock.getKey());
  }

  // Push state
  newContentState = trimNumberListInWholePage(newContentState);
  let newEditorState = EditorState.push(editorState, newContentState, "more-indent");
  if (curSelection.isCollapsed()) {
    newEditorState = EditorState.forceSelection(newEditorState, new SelectionState({
      focusKey: focusBlockKey,
      focusOffset: focusBlockLength === 0 ? 1 : focusOffset,
      anchorKey: focusBlockKey,
      anchorOffset: focusBlockLength === 0 ? 1 : focusOffset,
    }));
  }

  // Update editorState
  dispatcher.setEditorState(newEditorState);
};

const handleKeyCommand_lessIndent = (editorState, dispatcher, returnResult=false) => {
  if (!returnResult && !dispatcher.setEditorState) {
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
  let newBlockData = new GeekeMap(curContent.getBlockForKey(keyArray[startIndex]).getData());
  newBlockData.set(blockDataKeys.indentLevel, startBlock.getData().has(blockDataKeys.indentLevel) ? startBlock.getData().get(blockDataKeys.indentLevel) : 0);
  let newContentState = updateBlockData(curContent, keyArray[startIndex], newBlockData);

  // Update indent level for each block
  let minIndentLevel = 9999999;
  let updated = 0;
  for (let i = startIndex; i <= endIndex; i++) {
    let block = blockMap.get(keyArray[i]);
    let blockData = block.getData();
    let newBlockData = new GeekeMap(blockData);
    let curIndentLevel = 0;
    if (blockData.has(blockDataKeys.indentLevel)) {
      curIndentLevel = blockData.get(blockDataKeys.indentLevel);
    }

    minIndentLevel = Math.min(curIndentLevel, minIndentLevel);

    if (curIndentLevel > 0) {
      newBlockData.set(blockDataKeys.indentLevel, curIndentLevel - 1);
      updated += 1;
    } else {
      continue;
    }

    newContentState = updateBlockData(newContentState, keyArray[i], newBlockData);
  }

  // Check whether the indent of all the children blocks are changed.
  let nextBlock = newContentState.getBlockAfter(endBlockKey);
  let changeMoreIndent = false;
  if (nextBlock) {
    let nextBlockData = nextBlock.getData();
    if (nextBlockData.has(blockDataKeys.indentLevel) && nextBlockData.get(blockDataKeys.indentLevel) > minIndentLevel) {
      changeMoreIndent = true;
    }
  }

  // If not all the children blocks are chagned, update them
  while (changeMoreIndent) {
    if (!nextBlock) break;
    let nextBlockData = nextBlock.getData();
    let nextBlockDepth = nextBlockData.has(blockDataKeys.indentLevel) ? nextBlockData.get(blockDataKeys.indentLevel) : 0;
    if (nextBlockDepth <= minIndentLevel) break;

    let newNextBlockData = new GeekeMap(nextBlockData);
    newNextBlockData.set(blockDataKeys.indentLevel, nextBlockDepth - 1);
    newContentState = updateBlockData(newContentState, nextBlock.getKey(), newNextBlockData);
    nextBlock = newContentState.getBlockAfter(nextBlock.getKey());
    updated += 1;
  }

  // Check whether the editor is updated by reducing the indent level of some blocks
  if (updated === 0) return;

  // Push state
  newContentState = trimNumberListInWholePage(newContentState);
  if (returnResult) return newContentState;
  let newEditorState = EditorState.push(editorState, newContentState, "less-indent");
  if (curSelection.isCollapsed()) {
    newEditorState = EditorState.forceSelection(newEditorState, new SelectionState({
      focusKey: focusBlockKey,
      focusOffset: focusBlockLength === 0 ? 1 : focusOffset,
      anchorKey: focusBlockKey,
      anchorOffset: focusBlockLength === 0 ? 1 : focusOffset,
    }));
  }

  // Update editorState
  dispatcher.setEditorState(newEditorState);
  return 'handled';
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
  const __firstSpaceIndex = blockText.indexOf(' ');
  const firstSpaceIndex = __firstSpaceIndex > -1 ? __firstSpaceIndex : focusBlock.getLength();

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
    // Get entity by key and offset
    let focusInlineStyle = focusBlock.getInlineStyleAt(caretPosition - 1);
    let focusEntity = focusBlock.getEntityAt(caretPosition - 1);

    // Insert space with the same inline style to the entity
    let newContentState = Modifier.insertText(contentState, selectionState, ' ', focusInlineStyle, focusEntity);
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
  let newHeadingType = 1;
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

    // Quote
    case '"':
      if (focusBlockType !== constBlockType.quote) newType = constBlockType.quote;
      break;

    // Heading
    case '#':
      if (focusBlockType !== constBlockType.heading) newType = constBlockType.heading;
      newHeadingType = headingType.h1;
      break;
    case '##':
      if (focusBlockType !== constBlockType.heading) newType = constBlockType.heading;
      newHeadingType = headingType.h2;
      break;
    case '###':
      if (focusBlockType !== constBlockType.heading) newType = constBlockType.heading;
      newHeadingType = headingType.h3;
      break;
    case '####':
      if (focusBlockType !== constBlockType.heading) newType = constBlockType.heading;
      newHeadingType = headingType.h4;
      break;
    case '#####':
      if (focusBlockType !== constBlockType.heading) newType = constBlockType.heading;
      newHeadingType = headingType.h5;
      break;
    case '######':
      if (focusBlockType !== constBlockType.heading) newType = constBlockType.heading;
      newHeadingType = headingType.h6;
      break;

    // Other cases
    default:
      // Numbered list
      if (keyword.match(/^\d+\./) && focusBlockType !== constBlockType.numberList) {
        handleConvertToNumberList();
        return 'handled';
      }

      // Code Block
      if (keyword.match(/^```/) && focusBlockType !== constBlockType.code) {
        newType = constBlockType.code;
        break;
      }

      // Default: null
      break;
  }

  // If not a valid keyword, then just insert a space
  if (!newType) {
    insertSpaceToCurrentSelection();
    return 'handled';
  }

  // Before convert the block into another type, insert a space first for a better undo
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
      let focusBlockData = new GeekeMap(focusBlock.getData());
      focusBlockData.delete(blockDataKeys.numberListOrder);
      newContentState = updateBlockData(newContentState, focusKey, focusBlockData);

      // Trim the following blocks
      let baseIndentLevel = focusBlockData.has(blockDataKeys.indentLevel) ? focusBlockData.get(blockDataKeys.indentLevel) : 0;
      let nextBlock = newContentState.getBlockAfter(focusKey);
      if (nextBlock) {
        newContentState = trimNumberListWithSameDepth(newContentState, nextBlock.getKey(), baseIndentLevel);
      }
    } break;

    case constBlockType.toggleList: {
      // Remove toggleListToggle from current block
      let focusBlockData = new GeekeMap(focusBlock.getData());
      focusBlockData.delete(blockDataKeys.toggleListToggle);
      newContentState = updateBlockData(newContentState, focusKey, focusBlockData);
    } break;

    case constBlockType.checkList: {
      // Remove checkListCheck from current block
      let focusBlockData = new GeekeMap(focusBlock.getData());
      focusBlockData.delete(blockDataKeys.checkListCheck);
      newContentState = updateBlockData(newContentState, focusKey, focusBlockData);
    } break;

    default:
      break;
  }

  // Set heading type if the new type is heading
  if (newType === constBlockType.heading) {
    let focusBlock = newContentState.getBlockForKey(focusKey);
    let focusBlockData = new GeekeMap(focusBlock.getData());
    focusBlockData.set(blockDataKeys.headingType, newHeadingType);
    newContentState = updateBlockData(newContentState, focusKey, focusBlockData);
  }

  // If newType is code, then put the content to block data
  if (newType === constBlockType.code) {
    // Put content to block data
    let focusBlock = newContentState.getBlockForKey(focusKey);
    let focusBlockData = new GeekeMap(focusBlock.getData());
    let focusBlockContent = focusBlock.getText();
    focusBlockData.set(blockDataKeys.codeContent, focusBlockContent);
    newContentState = updateBlockData(newContentState, focusKey, focusBlockData);

    // Remove block text
    let selectionToRemoveText = new SelectionState({
      focusKey: focusKey,
      focusOffset: focusBlockContent.length,
      anchorKey: focusKey,
      anchorOffset: 0
    });
    newContentState = Modifier.removeRange(newContentState, selectionToRemoveText, 'forward');
  }

  // Update editorState
  newEditorState = EditorState.push(newEditorState, newContentState, 'change-block-type');
  newEditorState = EditorState.forceSelection(newEditorState, newSelectionState);
  dispatcher.setEditorState(newEditorState);

  return 'handled';
};

export const handleKeyCommand_backspace = (editorState, command, dispatcher, returnResult=false) => {
  if (!dispatcher.setEditorState) {
    console.error(dispatcherNotFoundConst.setEditorState);
    return 'not-handled';
  }

  // Constants
  const prevBlockKeyWithSameDepth = command[2];
  const needTrimNumberList = command[3];
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
    let focusBlockData = new GeekeMap(focusBlock.getData());
    let dataChanged = false;
    const removeBlockData = blockDataKey => {
      if (focusBlockData.has(blockDataKey)) {
        focusBlockData.delete(blockDataKey);
        dataChanged = true;
      }
    }

    // TODO: automation...
    removeBlockData(blockDataKeys.numberListOrder);
    removeBlockData(blockDataKeys.toggleListToggle);
    removeBlockData(blockDataKeys.checkListCheck);
    removeBlockData(blockDataKeys.headingType);
    removeBlockData(blockDataKeys.codeContent);
    removeBlockData(blockDataKeys.codeLanguage);
    removeBlockData(blockDataKeys.codeWrapping);
    removeBlockData(blockDataKeys.codeTheme);
    removeBlockData(blockDataKeys.codeLineNumber);

    if (dataChanged) {
      newContentState = updateBlockData(newContentState, null, focusBlockData, newSelectionState);
    }

    // Trim the next list
    let nextBlock = newContentState.getBlockAfter(focusBlock.getKey());
    if (nextBlock) {
      if (needTrimNumberList) {
        newContentState = trimNumberListWithSameDepth(newContentState, nextBlock.getKey(), baseIndentLevel);
      }
      newSelectionState = null; // No need to set new selection state
    }
  } else {
    const selectionState = newEditorState.getSelection();
    const curBlock = newContentState.getBlockForKey(selectionState.getFocusKey());
    let prevBlock = newContentState.getBlockBefore(selectionState.getFocusKey());
    if (!prevBlock) return 'not-handled';

    // Update parent map & depth
    // Check whether the previous block is the parent of current block
    // If true, make the indent less by 1 level if current indent level is not at root
    if (focusBlockData.get(blockDataKeys.parentKey) === prevBlock.getKey() && baseIndentLevel > 0) {
      newContentState = handleKeyCommand_lessIndent(editorState, dispatcher, true);
    } else {
      // Update parent for preparing to remove this block...
      let newParentBlock = findPreviousBlockWithSameDepth(newContentState, focusKey, baseIndentLevel);
      let newParentBlockKey = newParentBlock.getKey();
      console.assert(newParentBlock, 'Unhandled condition: newParentBlock is undefined!');
      let tempBlock = newContentState.getBlockAfter(focusKey);
      while (true) {
        if (!tempBlock) break;
        let tempBlockData = tempBlock.getData();
        let tempBlockDepth = tempBlockData.has(blockDataKeys.indentLevel) ? tempBlockData.get(blockDataKeys.indentLevel) : 0;
        if (tempBlockDepth <= baseIndentLevel) break;

        let newTempBlockData = new GeekeMap(tempBlockData);
        newTempBlockData.set(blockDataKeys.parentKey, newParentBlockKey);
        newContentState = updateBlockData(newContentState, tempBlock.getKey(), newTempBlockData);
        tempBlock = newContentState.getBlockAfter(tempBlock.getKey());
      }

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
      if (needTrimNumberList) {
        if (prevBlockKeyWithSameDepth) {
          let prevBlock = newContentState.getBlockForKey(prevBlockKeyWithSameDepth);
          let prevBlockData = prevBlock.getData();
          let prevNumberListOrder = prevBlockData.has(blockDataKeys.numberListOrder) ? prevBlockData.get(blockDataKeys.numberListOrder) : 1;
          newContentState = trimNumberListWithSameDepth(newContentState, prevBlockKeyWithSameDepth, baseIndentLevel, prevNumberListOrder);
        } else {
          newContentState = trimNumberListWithSameDepth(newContentState, focusKey, baseIndentLevel);
        }
      }
    }
  }

  if (returnResult) return newContentState;

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
  const needTrimNumberList = command[3];
  let newEditorState = editorState;
  let newContentState = editorState.getCurrentContent();
  const curBlock = newContentState.getBlockForKey(curBlockKey);
  const nextBlock = newContentState.getBlockAfter(curBlockKey);
  const nextBlockKey = nextBlock.getKey();
  const curBlockData = curBlock.getData();
  const nextBlockData = nextBlock.getData();
  const baseIndentLevel = curBlockData.has(blockDataKeys.indentLevel) ? curBlockData.get(blockDataKeys.indentLevel) : 0;
  const nextIndentLevel = nextBlockData.has(blockDataKeys.indentLevel) ? nextBlockData.get(blockDataKeys.indentLevel) : 0;
  const baseNumberListOrder = curBlockData.has(blockDataKeys.numberListOrder) ? curBlockData.get(blockDataKeys.numberListOrder) : 1;

  // Check whether the block to be deleted has children.
  // If no children, then no need to re-organize the parent map.
  // If has children, update the parent map
  const nextNextBlock = newContentState.getBlockAfter(nextBlockKey);
  if (nextNextBlock && nextNextBlock.getData().get(blockDataKeys.parentKey) === nextBlockKey) {
    // Chech whether current block is the parent of the next block
    // If yes, then make indent of the children of nextBlock less by 1
    if (nextBlockData.get(blockDataKeys.parentKey) === curBlockKey) {
      let tempBlock = newContentState.getBlockAfter(nextBlockKey);
      while (true) { // Iterate through all block with more depth
        if (!tempBlock) break;
        let tempBlockKey = tempBlock.getKey();
        let tempBlockData = tempBlock.getData();
        let tempBlockDepth = tempBlockData.has(blockDataKeys.indentLevel) ? tempBlockData.get(blockDataKeys.indentLevel) : 0;

        // Only deal with the children of the deleted block (nextBlock)
        if (tempBlockDepth - 1 <= baseIndentLevel) break;

        // Update depth
        let tempData = new GeekeMap(tempBlockData);
        tempData.set(blockDataKeys.indentLevel, tempBlockDepth - 1);

        // If the indent level - 1 is not equal to the nextIndentLevel, then it is not a direct child of next block. No need to process it.
        if (tempBlockDepth - 1 === nextIndentLevel) {
          tempData.set(blockDataKeys.parentKey, curBlockKey);
        }

        // Update block data to contentState
        newContentState = updateBlockData(newContentState, tempBlockKey, tempData);
        tempBlock = newContentState.getBlockAfter(tempBlockKey);
      }
    } else {
      // Update parentKey of the children of the nextBlock to curBlock
      let tempBlock = newContentState.getBlockAfter(nextBlockKey);
      let previousBlock = findPreviousBlockWithSameDepth(newContentState, nextBlockKey, nextIndentLevel);
      // In this case, previousBlock must not be undefined
      console.assert(previousBlock, 'Un-handled case: previousBlock cannot be found!');
      let previousBlockKey = previousBlock.getKey();
      while (true) {
        if (!tempBlock) break;
        let tempBlockKey = tempBlock.getKey();
        let tempBlockData = tempBlock.getData();
        let tempBlockDepth = tempBlockData.has(blockDataKeys.indentLevel) ? tempBlockData.get(blockDataKeys.indentLevel) : 0;

        // Only deal with the children of the deleted block (nextBlock)
        if (tempBlockDepth <= nextIndentLevel) break;

        // If the indent level - 1 is not equal to the nextIndentLevel, then it is not a direct child of next block. No need to process it.
        if (tempBlockDepth - 1 === nextIndentLevel) {
          let tempData = new GeekeMap(tempBlockData);
          tempData.set(blockDataKeys.parentKey, previousBlockKey);
          newContentState = updateBlockData(newContentState, tempBlockKey, tempData);
        }

        tempBlock = newContentState.getBlockAfter(tempBlockKey);
      }
    }
  }

  // Remove block
  const removeSelectionState = new SelectionState({
    anchorKey: curBlockKey,
    anchorOffset: curBlock.getLength(),
    focusKey: nextBlock.getKey(),
    focusOffset: 0,
  });
  newContentState = Modifier.removeRange(newContentState, removeSelectionState, 'backward');

  if (needTrimNumberList) {
    // Trim the following blocks
    if (curBlock.getType() === constBlockType.numberList && baseIndentLevel === nextIndentLevel) {
      newContentState = trimNumberListWithSameDepth(newContentState, curBlockKey, baseIndentLevel, baseNumberListOrder);
    } else {
      const newNextBlock = newContentState.getBlockAfter(curBlockKey);
      newContentState = trimNumberListWithSameDepth(newContentState, newNextBlock.getKey(), nextIndentLevel, 1);
    }
  }

  // Update editorState
  newEditorState = EditorState.push(editorState, newContentState, 'delete-number-list');
  newEditorState = EditorState.forceSelection(newEditorState, selectionState);
  dispatcher.setEditorState(newEditorState);

  return 'handled';
};

const handleKeyCommand_deleteMultipleBlocks = (editorState, command, dispatcher) => {
  if (!dispatcher.setEditorState) {
    console.error(dispatcherNotFoundConst.setEditorState);
    return 'not-handled';
  }

  let newContentState = editorState.getCurrentContent();
  let selectionState = editorState.getSelection();
  let startBlockKey = selectionState.getStartKey();
  let startOffset = selectionState.getStartOffset();
  let endBlockKey = selectionState.getEndKey();
  let nextToEndBlock = newContentState.getBlockAfter(endBlockKey);

  // Sanity check whether startOffset is valid. If not, set it to the length of the startBlock
  let startBlock = newContentState.getBlockForKey(startBlockKey);
  if (startBlock.getLength() < startOffset) {
    startOffset = startBlock.getLength();
  }

  // If this is not the end of the editor...
  if (nextToEndBlock) {
    let curBlock = nextToEndBlock;
    let baseBlock = newContentState.getBlockForKey(startBlockKey);
    let curBlockData = curBlock.getData();
    let baseBlockData = baseBlock.getData();
    let curBlockDepth = curBlockData.has(blockDataKeys.indentLevel) ? curBlockData.get(blockDataKeys.indentLevel) : 0;
    let baseBlockDepth = baseBlockData.has(blockDataKeys.indentLevel) ? baseBlockData.get(blockDataKeys.indentLevel) : 0;
    let depthDelta = curBlockDepth - baseBlockDepth;

    // Only when depth delta is larger than 0, which means the later block has deeper depth than the base block, we have to update the block depth.
    if (depthDelta > 0) {
      let tempBlock = curBlock;
      while (true) {
        if (!tempBlock) break;
        let tempBlockData = curBlock.getData();
        let tempBlockDepth = tempBlockData.has(blockDataKeys.indentLevel) ? tempBlockData.get(blockDataKeys.indentLevel) : 0;
        if (tempBlockDepth <= curBlockDepth) break;

        let newTempBlockData = new GeekeMap(tempBlockData);
        newTempBlockData.set(blockDataKeys.indentLevel, tempBlockDepth - depthDelta);
        newContentState = updateBlockData(newContentState, newTempBlockData);
        tempBlock = newContentState.getBlockAfter(tempBlock.getKey());
      }
    }
  }

  // If the focus block is a special block, set the block type to basic block and remove all the related block data
  const focusBlockType = newContentState.getBlockForKey(selectionState.getFocusKey()).getType();
  if (specialBlockSet.has(focusBlockType)) {
    let newEditorState = EditorState.push(editorState, newContentState, 'insert-characters');
    newContentState = handleKeyCommand_backspace(newEditorState, command, dispatcher, true);
  }

  // Remove the block
  newContentState = Modifier.removeRange(newContentState, selectionState, 'backward');

  // Trim the page
  newContentState = trimNumberListInWholePage(newContentState);

  // Push undo stack
  let newEditorState = EditorState.push(editorState, newContentState, 'delete-block');
  newEditorState = EditorState.forceSelection(newEditorState, new SelectionState({
    anchorKey: startBlockKey,
    anchorOffset: startOffset,
    focusKey: startBlockKey,
    focusOffset: startOffset,
  }));

  dispatcher.setEditorState(newEditorState);

  return 'handled';
};

const handleKeyCommand_moveUpToSpecialBlock = (editorState, dispatcher) => {
  const contentState = editorState.getCurrentContent();
  const selectionState = editorState.getSelection();

  // Check whether current selectionState is collapsed
  if (!selectionState.isCollapsed()) return 'not-handled';

  // Check whether the previous block exists
  const focusBlockKey = selectionState.getFocusKey();
  const previousBlock = contentState.getBlockBefore(focusBlockKey);
  if (!previousBlock) return 'not-handled';

  // Set selectionState to the previous block first
  const previousBlockKey = previousBlock.getKey();
  let newEditorState = EditorState.forceSelection(editorState, new SelectionState({
    focusKey: previousBlockKey,
    focusOffset: 0,
    anchorKey: previousBlockKey,
    anchorOffset: 0,
  }));
  dispatcher.setEditorState(newEditorState);

  // Focus the special block
  dispatcher.focusSpecialBlock(previousBlockKey, constMoveDirection.up);

  return 'handled';
}

const handleKeyCommand_moveDownToSpecialBlock = (editorState, dispatcher) => {
  const contentState = editorState.getCurrentContent();
  const selectionState = editorState.getSelection();

  // Check whether current selectionState is collapsed
  if (!selectionState.isCollapsed()) return 'not-handled';

  // Check whether the next block exists
  const focusBlockKey = selectionState.getFocusKey();
  const nextBlock = contentState.getBlockAfter(focusBlockKey);
  if (!nextBlock) return 'not-handled';

  // Set selectionState to the previous block first
  const nextBlockKey = nextBlock.getKey();
  let newEditorState = EditorState.forceSelection(editorState, new SelectionState({
    focusKey: nextBlockKey,
    focusOffset: 0,
    anchorKey: nextBlockKey,
    anchorOffset: 0,
  }));
  dispatcher.setEditorState(newEditorState);

  // Focus the special block
  dispatcher.focusSpecialBlock(nextBlockKey, constMoveDirection.down);

  return 'handled';
}

const handleKeyCommand_moveToPreviousBlock = (editorState, dispatcher, blockKey, restArgs=null) => {
  if (restArgs === null) return 'not-handled';

  const selectionState = editorState.getSelection();
  const focusBlockKey = blockKey ? blockKey : selectionState.getFocusKey();
  let newContentState = editorState.getCurrentContent();

  // If current block is code block, then blur it first
  const focusBlock = newContentState.getBlockForKey(focusBlockKey);
  if (focusBlock.getType() === constBlockType.code) {
    restArgs.blurAceEditor();
    restArgs.handleFocusEditor();
  }

  // Check whether previous block is a special block
  const previousBlock = newContentState.getBlockBefore(focusBlockKey);
  if (!previousBlock) return 'not-handled'; // If this is the first block, then no need to handle this event.
  if (specialBlockSet.has(previousBlock.getType())) {
    // The previous block is a special block
    return handleKeyCommand_moveUpToSpecialBlock(EditorState.forceSelection(editorState, new SelectionState({
      focusKey: focusBlockKey,
      focusOffset: 0,
      anchorKey: focusBlockKey,
      anchorOffset: 0,
    })), dispatcher, restArgs);
  }

  // The previous block is NOT a special block. Then, se the cursor position to the end of the previous block.
  const previousBlockLength = previousBlock.getLength();
  const previousBlockKey = previousBlock.getKey();
  const newSelectionState = new SelectionState({
    focusKey: previousBlockKey,
    focusOffset: previousBlockLength,
    anchorKey: previousBlockKey,
    anchorOffset: previousBlockLength,
  });
  const newEditorState = EditorState.forceSelection(editorState, newSelectionState);

  // Render the new selection
  dispatcher.setEditorState(newEditorState);

  return 'handled';
};

const handleKeyCommand_moveToNextBlock = (editorState, dispatcher, blockKey, restArgs=null) => {
  if (restArgs === null) return 'not-handled';

  const selectionState = editorState.getSelection();
  const focusBlockKey = blockKey ? blockKey : selectionState.getFocusKey();
  let newContentState = editorState.getCurrentContent();

  // If current block is code block, then blur it first
  const focusBlock = newContentState.getBlockForKey(focusBlockKey);
  if (focusBlock.getType() === constBlockType.code) {
    restArgs.blurAceEditor();
    restArgs.handleFocusEditor();
  }

  // Check whether next block is a special block
  const nextBlock = newContentState.getBlockAfter(focusBlockKey);
  if (!nextBlock) return 'not-handled'; // If this is the first block, then no need to handle this event.
  if (specialBlockSet.has(nextBlock.getType())) {
    // The next block is a special block
    return handleKeyCommand_moveDownToSpecialBlock(EditorState.forceSelection(editorState, new SelectionState({
      focusKey: focusBlockKey,
      focusOffset: 0,
      anchorKey: focusBlockKey,
      anchorOffset: 0,
    })), dispatcher, restArgs);
  }

  // The previous block is NOT a special block. Then, se the cursor position to the end of the previous block.
  const nextBlockKey = nextBlock.getKey();
  const newSelectionState = new SelectionState({
    focusKey: nextBlockKey,
    focusOffset: 0,
    anchorKey: nextBlockKey,
    anchorOffset: 0,
  });
  const newEditorState = EditorState.forceSelection(editorState, newSelectionState);

  // Render the new selection
  dispatcher.setEditorState(newEditorState);

  return 'handled';
};

const handleKeyCommand_toggleInlineStrikeThrough = (editorState, dispatcher) => {
  dispatcher.toggleInlineStyle('STRIKETHROUGH');
  return 'handled';
};

const handleKeyCommand_toggleInlineCode = (editorState, dispatcher) => {
  dispatcher.toggleInlineStyle('CODE');
  return 'handled';
};

export const handleKeyCommand = (editorState, command, dispatcher, blockKey, restArgs=null) => {
  switch (command) {
    case keyCommandConst.moreIndent:
      return handleKeyCommand_moreIndent(editorState, dispatcher);

    case keyCommandConst.lessIndent:
      return handleKeyCommand_lessIndent(editorState, dispatcher);

    case keyCommandConst.doNothing:
      return false;

    case keyCommandConst.checkBlockTypeConversion:
      return handleKeyCommand_checkBlockTypeConversion(editorState, command, dispatcher);

    case keyCommandConst.deleteMultipleBlocks:
      return handleKeyCommand_deleteMultipleBlocks(editorState, command, dispatcher);

    case keyCommandConst.moveToNextBlock:
      return handleKeyCommand_moveToNextBlock(editorState, dispatcher, blockKey, restArgs);

    case keyCommandConst.moveToPreviousBlock:
      return handleKeyCommand_moveToPreviousBlock(editorState, dispatcher, blockKey, restArgs);

    case keyCommandConst.moveUpToCodeBlock:
      return handleKeyCommand_moveUpToSpecialBlock(editorState, dispatcher);

    case keyCommandConst.moveDownToCodeBlock:
      return handleKeyCommand_moveDownToSpecialBlock(editorState, dispatcher);

    case keyCommandConst.toggleInlineStrikeThrough:
      return handleKeyCommand_toggleInlineStrikeThrough(editorState, dispatcher);

    case keyCommandConst.toggleInlineCode:
      return handleKeyCommand_toggleInlineCode(editorState, dispatcher);

    default:
      if (typeof(command) === typeof([]) && command.length > 0 && command[0] === keyCommandConst.multiCommands) {
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
// TODO: Copy different block data depends on different block
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
  const toggleBlockData = (!isOSX && KeyBindingUtil.isCtrlKeyCommand(e)) || KeyBindingUtil.hasCommandModifier(e);

  // Variables
  let newEditorState = editorState;
  let newContentState = contentState;

  // If selection is not collapsed... return false!
  // TODO: handle this kind of case
  if (!selectionState.isCollapsed()) {
    console.error('Unhandled condition: selectionState is not collapsed when enter is pressed!');
    return true;
  }

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

  // Check whether the current block is not a default block and the content is empty.
  // If both conditions are true, then convert this block into a default block and remove the corresponding block data.
  if (curBlockType !== constBlockType.default && curBlock.getLength() === 0) {
    newContentState = Modifier.setBlockType(newContentState, selectionState, 'unstyled');

    // Update block data: remove numberListOrder from block data
    let focusBlockData = new GeekeMap(curBlock.getData());
    let dataChanged = false;
    if (focusBlockData.has(blockDataKeys.numberListOrder)) {
      focusBlockData.delete(blockDataKeys.numberListOrder);
      dataChanged = true;
    }
    if (focusBlockData.has(blockDataKeys.toggleListToggle)) {
      focusBlockData.delete(blockDataKeys.toggleListToggle);
      dataChanged = true;
    }
    if (focusBlockData.has(blockDataKeys.checkListCheck)) {
      focusBlockData.delete(blockDataKeys.checkListCheck);
      dataChanged = true;
    }
    if (dataChanged) {
      newContentState = updateBlockData(newContentState, null, focusBlockData, selectionState);
    }

    // Trim the next list
    let nextBlock = newContentState.getBlockAfter(curBlock.getKey());
    if (nextBlock) {
      let prevBlock = newContentState.getBlockBefore(curBlock.getKey());
      if (!(prevBlock && curBlock.getType() !== constBlockType.numberList && prevBlock.getType() !== constBlockType.numberList)) {
        newContentState = trimNumberListWithSameDepth(newContentState, nextBlock.getKey(), indentLevel);
      }
    }

    // Push to undo stack
    newEditorState = EditorState.push(editorState, newContentState, 'split-block');
    dispatcher.setEditorState(newEditorState);

    return true;
  }

  // Copy only necessary block data
  let newMap = new GeekeMap();
  blockData.forEach((value, key) => {
    if (config[key].indexOf(blockDataPreserveConstant.all) > -1 ||
        config[key].indexOf(curBlockType) > -1) {
      newMap.set(key, value);
    }
  });

  if (toggleBlockData) {
    switch (curBlockType) {
      case constBlockType.toggleList:
        // Update block data
        newMap.set(blockDataKeys.toggleListToggle, !blockData.get(blockDataKeys.toggleListToggle));
        // Merge block data into contentState
        newContentState = updateBlockData(newContentState, curBlock.getKey(), newMap);
        // Update undo stack
        newEditorState = EditorState.push(editorState, newContentState, 'change-block-data');
        // Update editor
        dispatcher.setEditorState(newEditorState);

        return true;

      case constBlockType.checkList:
        // Update block data
        newMap.set(blockDataKeys.checkListCheck, !blockData.get(blockDataKeys.checkListCheck));
        // Merge block data into contentState
        newContentState = updateBlockData(newContentState, curBlock.getKey(), newMap);
        // Update undo stack
        newEditorState = EditorState.push(editorState, newContentState, 'change-block-data');
        // Update editor
        dispatcher.setEditorState(newEditorState);

        return true;

      default:
        break;
    }
  }

  // Perform split block operation
  newContentState = Modifier.splitBlock(newContentState, selectionState);
  // Use push to get a new editorState with a new selectionState for merging block data
  newEditorState = EditorState.push(newEditorState, newContentState, "split-block");
  const newSelectionState = newEditorState.getSelection();

  // Update block data
  newContentState = updateBlockData(newContentState, null, newMap, newSelectionState);

  // If current block is number list block, modify the number list order after this block
  if (curBlockType === constBlockType.numberList) {
    let focusBlock = newContentState.getBlockForKey(selectionState.getFocusKey());
    let focusBlockData = focusBlock.getData();
    let baseNumberListOrder = focusBlockData.has(blockDataKeys.numberListOrder) ? focusBlockData.get(blockDataKeys.numberListOrder) : 1;
    newContentState = trimNumberListWithSameDepth(newContentState, selectionState.getFocusKey(), indentLevel, baseNumberListOrder);
  }

  // If current block is heading, remove the block type and set it to default
  if (curBlockType === constBlockType.heading) {
    let nextBlock = newContentState.getBlockAfter(selectionState.getFocusKey());
    let nextBlockKey = nextBlock.getKey();
    newContentState = Modifier.setBlockType(newContentState, new SelectionState({
      focusKey: nextBlockKey,
      focusOffset: 0,
      anchorKey: nextBlockKey,
      anchorOffset: 0,
    }), constBlockType.default);
  }

  // Push copy block data action into editorState & update selection state
  // Note: to ignore the push we used for generating a new selectionState, use original editorState to push undo stack
  newEditorState = EditorState.push(editorState, newContentState, 'split-block');
  newEditorState = EditorState.forceSelection(newEditorState, newSelectionState);

  // Render current change
  dispatcher.setEditorState(newEditorState);

  return true;
}
/// End handleReturn

/// Start handleAceEditor
const handleAceEditor_up = (editor, dispatcher) => {
  if (!dispatcher.moveCursor) {
    console.error(dispatcherNotFoundConst.moveCursor);
    return null;
  }

  const selection = editor.getSelection();
  const cursor = selection.getCursor();

  // Check whether range start is equal to range end. If not, apply the default action.
  const selectionAnchor = selection.getSelectionAnchor();
  const selectionLead = selection.getSelectionLead();
  if (selectionAnchor.row !== selectionLead.row || selectionAnchor.column !== selectionLead.column) return false;

  // Check whether current cursor position at the first line. If not, apply the default action.
  if (cursor.row !== 0 || cursor.column !== 0) return false;

  // Current cursor is at the first line of the ace editor. However, up arrow key is pressed now because user want to move to the previous block.
  dispatcher.moveCursor(keyCommandConst.moveToPreviousBlock);
};

const handleAceEditor_down = (editor, dispatcher) => {
  if (!dispatcher.moveCursor) {
    console.error(dispatcherNotFoundConst.moveCursor);
    return null;
  }

  const selection = editor.getSelection();
  const cursor = selection.getCursor();
  const editSession = editor.getSession();
  const lastLine = editSession.getLength() - 1;
  const lastLineLastPosition = editSession.getLine(lastLine).length;

  // Check whether range start is equal to range end. If not, apply the default action.
  const selectionAnchor = selection.getSelectionAnchor();
  const selectionLead = selection.getSelectionLead();
  if (selectionAnchor.row !== selectionLead.row || selectionAnchor.column !== selectionLead.column) return false;

  // Check whether current cursor position at the last line. If not, apply the default action.
  if (cursor.row !== lastLine || cursor.column !== lastLineLastPosition) return false;

  // Current cursor is at the last line of the ace editor. However, down arrow key is pressed now because user want to move to the next block.
  dispatcher.moveCursor(keyCommandConst.moveToNextBlock);
};

const handleAceEditor_left = (editor, dispatcher) => {
  if (!dispatcher.moveCursor) {
    console.error(dispatcherNotFoundConst.moveCursor);
    return null;
  }

  const selection = editor.getSelection();
  const cursor = selection.getCursor();

  // Check whether range start is equal to range end. If not, apply the default action.
  const selectionAnchor = selection.getSelectionAnchor();
  const selectionLead = selection.getSelectionLead();
  if (selectionAnchor.row !== selectionLead.row || selectionAnchor.column !== selectionLead.column) return false;

  // Check whether current cursor position at the start of the first line. If not, apply the default action.
  if (cursor.row !== 0 || cursor.column !== 0) return false;

  // Current cursor is at the beginning of the first line of the ace editor. However, left arrow key is pressed now because user want to move to the previous block.
  dispatcher.moveCursor(keyCommandConst.moveToPreviousBlock);
};

const handleAceEditor_right = (editor, dispatcher) => {
  if (!dispatcher.moveCursor) {
    console.error(dispatcherNotFoundConst.moveCursor);
    return null;
  }

  const selection = editor.getSelection();
  const cursor = selection.getCursor();
  const editSession = editor.getSession();
  const lastLine = editSession.getLength() - 1;
  const lastLineLastPosition = editSession.getLine(lastLine).length;

  // Check whether range start is equal to range end. If not, apply the default action.
  const selectionAnchor = selection.getSelectionAnchor();
  const selectionLead = selection.getSelectionLead();
  if (selectionAnchor.row !== selectionLead.row || selectionAnchor.column !== selectionLead.column) return false;

  // Check whether current cursor position at the last line. If not, apply the default action.
  if (cursor.row !== lastLine || cursor.column !== lastLineLastPosition) return false;

  // Current cursor is at the end of the last line of the ace editor. However, right arrow key is pressed now because user want to move to the next block.
  dispatcher.moveCursor(keyCommandConst.moveToNextBlock);
};

const handleAceEditor_backspace = (editor, dispatcher) => {
  if (!dispatcher.moveCursor) {
    console.error(dispatcherNotFoundConst.moveCursor);
    return false;
  }

  // Check whether the code block is empty. If not, perform normal backspace operation
  let editorContent = editor.getValue();
  if (editorContent !== '') return false;

  // 1. Blur ace editor to make editingCode to false
  // 2. Focus editor
  // 3. Remove block style and block data
  dispatcher.onBlur();
  dispatcher.handleFocusEditor();
  dispatcher.moveCursor([keyCommandConst.multiCommands, keyCommandConst.handleBackspace, null, false]);
};

export const handleAceEditor = (editor, action, dispatcher) => {
  switch(action) {
    case constAceEditorAction.up:
      return handleAceEditor_up(editor, dispatcher);

    case constAceEditorAction.down:
      return handleAceEditor_down(editor, dispatcher);

    case constAceEditorAction.left:
      return handleAceEditor_left(editor, dispatcher);

    case constAceEditorAction.right:
      return handleAceEditor_right(editor, dispatcher);

    case constAceEditorAction.backspace:
      return handleAceEditor_backspace(editor, dispatcher);

    default:
      console.error(`Unknown action in handleAceEditor: ${action}`);
      return false;
  }
}