/**
 * @file BlockKeyboardUtils.js
 * @description Utilities for handling keyboard input.
 */

/*************************************************
 * IMPORT
 *************************************************/
import { EditorState, getDefaultKeyBinding, Modifier, RichUtils, SelectionState } from "draft-js";
import Immutable from 'immutable';

/*************************************************
 * CONST
 *************************************************/
import {blockDataKeys} from '../constant';
export const defaultKeyboardHandlingConfig = {
  indentBlock: true,
  createNewBlock: true,
  insertNewLine: true,
};

const keyCommandConst = {
  doNothing: 0,
  moreIndent: 1,
  lessIndent: 2,
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
}

export const mapKeyToEditorCommand = (e, config) => {
  switch (e.keyCode) {
    case 9: // Tab
      return mapKeyToEditorCommand_tab(e, config);

    default:
      return getDefaultKeyBinding(e);
  }
};
/// End mapKeyToEditorCommand

/// Start handleKeyCommand
const handleKeyCommand_moreIndent = (editorState, dispatcher) => {
  if (!dispatcher.setEditorState) {
    console.error(dispatcherNotFoundConst.setEditorState);
    return;
  }

  // Constants
  const curContent = editorState.getCurrentContent();
  const curSelection = editorState.getSelection();
  const startBlockKey = curSelection.getStartKey();
  const endBlockKey = curSelection.getEndKey();
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
  let newContent = Modifier.setBlockData(curContent, new SelectionState({
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
    let curIndentLevel = 0;
    if (blockData.has(blockDataKeys.indentLevel)) {
      curIndentLevel = blockData.get(blockDataKeys.indentLevel);
    }

    if (curIndentLevel <= prevIndentLevel) curIndentLevel += 1;

    newContent = Modifier.setBlockData(newContent, new SelectionState({
      anchorKey: keyArray[i],
      anchorOffset: 0,
      focusKey: keyArray[i],
      focusOffset: 0,
    }), Immutable.Map({[blockDataKeys.indentLevel]: curIndentLevel}));
  }

  // Update editorState
  dispatcher.setEditorState(EditorState.createWithContent(newContent));
};

const handleKeyCommand_lessIndent = (editorState, dispatcher) => {
  console.log('Less indent!');
  if (!dispatcher.setEditorState) {
    console.error(dispatcherNotFoundConst.setEditorState);
    return;
  }

  // Constants
  const curContent = editorState.getCurrentContent();
  const curSelection = editorState.getSelection();
  const startBlockKey = curSelection.getStartKey();
  const endBlockKey = curSelection.getEndKey();
  const blockMap = curContent.getBlockMap();
  const keyArray = Array.from(blockMap.keys());
  const startIndex = keyArray.indexOf(startBlockKey);
  const endIndex = keyArray.indexOf(endBlockKey);
  const startBlock = blockMap.get(keyArray[startIndex]);

  // Initialize new content
  let newContent = Modifier.setBlockData(curContent, new SelectionState({
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
    let curIndentLevel = 0;
    if (blockData.has(blockDataKeys.indentLevel)) {
      curIndentLevel = blockData.get(blockDataKeys.indentLevel);
    }

    if (curIndentLevel > 0) curIndentLevel -= 1;

    newContent = Modifier.setBlockData(newContent, new SelectionState({
      anchorKey: keyArray[i],
      anchorOffset: 0,
      focusKey: keyArray[i],
      focusOffset: 0,
    }), Immutable.Map({[blockDataKeys.indentLevel]: curIndentLevel}));
  }

  // Update editorState
  dispatcher.setEditorState(EditorState.createWithContent(newContent));
};

const handleKeyCommand_default = (editorState, command, dispatcher) => {
  if (!dispatcher.setEditorState) {
    console.error(dispatcherNotFoundConst.setEditorState);
    return false;
  }

  const newEditorState = RichUtils.handleKeyCommand(editorState, command);
  if (!newEditorState) return false;

  dispatcher.setEditorState(newEditorState);
  return true;
};

export const handleKeyCommand = (editorState, command, dispatcher) => {
  switch (command) {
    case keyCommandConst.moreIndent:
      return handleKeyCommand_moreIndent(editorState, dispatcher);

    case keyCommandConst.lessIndent:
      return handleKeyCommand_lessIndent(editorState, dispatcher);

    case keyCommandConst.doNothing:
      return false;

    default:
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

  // If selection is not collapsed... return false!
  if (!selectionState.isCollapsed()) return false;

  // Get all block data from current block
  const curBlock = contentState.getBlockMap().get(originalBlockKey);
  const curBlockType = curBlock.getType();
  const blockData = curBlock.getData();

  // Copy only necessary block data
  let newMap = new Map();
  blockData.forEach((value, key) => {
    if (config[key].indexOf(blockDataPreserveConstant.all) > -1 ||
        config[key].indexOf(curBlockType) > -1) {
      newMap.set(key, value);
    }
  });

  // Perform split block operation
  let newContentState = Modifier.splitBlock(contentState, selectionState);
  let newEditorState = EditorState.push(editorState, newContentState, "split-block");
  const newSelectionState = newEditorState.getSelection();

  // Merge block data
  newContentState = Modifier.mergeBlockData(
    newEditorState.getCurrentContent(),
    newSelectionState,
    newMap
  )

  // Push copy block data action into editorState
  newEditorState = EditorState.push(newEditorState, newContentState, 'split-block');

  // Render current change
  dispatcher.setEditorState(newEditorState);

  return true;
}