/**
 * @file BlockKeyboardUtils.js
 * @description Utilities for handling keyboard input.
 */

/*************************************************
 * IMPORT
 *************************************************/
import {
  EditorState,
  getDefaultKeyBinding,
  Modifier,
  RichUtils,
  SelectionState,
} from "draft-js";
import Immutable from 'immutable';

import {
  unsetMouseOverBlockKey,
} from '../states/editorMisc';

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
};

const keyCommandConst = {
  doNothing: 0,
  moreIndent: 1,
  lessIndent: 2,
  checkBlockTypeConversion: 3,
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
};

const mapKeyToEditorCommand_space = (e, config) => {
  if (!config.convertBlockTypeInline) return getDefaultKeyBinding(e);
  return keyCommandConst.checkBlockTypeConversion;
};

export const mapKeyToEditorCommand = (e, config, dispatch, pageUuid) => {
  unsetMouseOverBlockKey(dispatch, pageUuid);

  switch (e.keyCode) {
    case 9: // Tab
      return mapKeyToEditorCommand_tab(e, config);

    case 32: // Space
      return mapKeyToEditorCommand_space(e, config);

    default:
      return getDefaultKeyBinding(e);
  }
};
/// End mapKeyToEditorCommand

/// Start handleKeyCommand
const handleKeyCommand_moreIndent = (editorState, dispatcher) => {
  if (!dispatcher.setEditorState) {
    console.error(dispatcherNotFoundConst.setEditorState);
    return false;
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

    // Check whether the first selected block can be indented
    if (i === startIndex && curIndentLevel === prevIndentLevel + 1) {
      return;
    }

    if (curIndentLevel <= prevIndentLevel) curIndentLevel += 1;
    prevIndentLevel = curIndentLevel;

    newContent = Modifier.setBlockData(newContent, new SelectionState({
      anchorKey: keyArray[i],
      anchorOffset: 0,
      focusKey: keyArray[i],
      focusOffset: 0,
    }), Immutable.Map({[blockDataKeys.indentLevel]: curIndentLevel}));
  }

  // Push state
  const newEditorState = EditorState.push(editorState, newContent, "more-indent");

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
  let updated = 0;
  for (let i = startIndex; i <= endIndex; i++) {
    let block = blockMap.get(keyArray[i]);
    let blockData = block.getData();
    let curIndentLevel = 0;
    if (blockData.has(blockDataKeys.indentLevel)) {
      curIndentLevel = blockData.get(blockDataKeys.indentLevel);
    }

    if (curIndentLevel > 0) {
      curIndentLevel -= 1;
      updated += 1;
    }

    newContent = Modifier.setBlockData(newContent, new SelectionState({
      anchorKey: keyArray[i],
      anchorOffset: 0,
      focusKey: keyArray[i],
      focusOffset: 0,
    }), Immutable.Map({[blockDataKeys.indentLevel]: curIndentLevel}));
  }

  // Check whether the editor is updated by reducing the indent level of some blocks
  if (updated === 0) return;

  // Push state
  const newEditorState = EditorState.push(editorState, newContent, "less-indent");

  // Update editorState
  dispatcher.setEditorState(newEditorState);
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

// TODO: this implementation may have performance issue if user enter space continuously...
const handleKeyCommand_checkBlockTypeConversion = (editorState, command, dispatcher) => {
  if (!dispatcher.setEditorState) {
    console.error(dispatcherNotFoundConst.setEditorState);
    return false;
  }

  // Get current caret position. Absolutely, if selectionState is not collapse, this feature must not work.
  const selectionState = editorState.getSelection();
  const caretPosition = selectionState.getFocusOffset();
  if (!selectionState.isCollapsed()) return handleKeyCommand_default(editorState, command, dispatcher);

  // Get current block content and find the position of the first space
  const contentState = editorState.getCurrentContent();
  const focusKey = selectionState.getFocusKey();
  const focusBlock = contentState.getBlockForKey(focusKey);
  const blockText = focusBlock.getText();
  const firstSpaceIndex__ = blockText.indexOf(' ');
  const firstSpaceIndex = firstSpaceIndex__ > -1 ? firstSpaceIndex__ : focusBlock.getLength();

  // Check whether current caret position is before the first space. If not, this is not the type conversion case, and insert a space back
  const insertSpaceToCurrentSelection = () => {
    let newContentState = Modifier.insertText(contentState, selectionState, ' ');
    let newEditorState = EditorState.push(editorState, newContentState, 'insert-characters');
    dispatcher.setEditorState(newEditorState);
  };

  if (caretPosition >= firstSpaceIndex && caretPosition !== focusBlock.getLength()) {
    insertSpaceToCurrentSelection();
    return true;
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
    focusOffset: caretPosition,
    anchorKey: focusKey,
    anchorOffset: 0,
  });

  // Get new type
  let newType = null;
  switch (keyword) {
    case '*':
    case '-':
      newType = constBlockType.bulletList;
      break;

    default:
      break;
  }

  if (!newType) {
    insertSpaceToCurrentSelection();
    return true;
  }

  let newContentState = contentState;
  let newEditorState = editorState;
  newContentState = Modifier.setBlockType(newContentState, selectionState, newType);
  newContentState = Modifier.removeRange(newContentState, rangeToRemove, 'forward');
  newEditorState = EditorState.push(newEditorState, newContentState, 'change-block-type');
  newEditorState = EditorState.forceSelection(newEditorState, newSelectionState);
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

    case keyCommandConst.checkBlockTypeConversion:
      return handleKeyCommand_checkBlockTypeConversion(editorState, command, dispatcher);

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
  const hasShift = e.shiftKey;

  // If selection is not collapsed... return false!
  if (!selectionState.isCollapsed()) return false;

  // If shift is pressed, then insert soft new line
  if (hasShift) {
    const newEditorState = RichUtils.insertSoftNewline(editorState);
    dispatcher.setEditorState(newEditorState);
    return true;
  }

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
  // Use push to get a new editorState with a new selectionState for merging block data
  let newEditorState = EditorState.push(editorState, newContentState, "split-block");
  const newSelectionState = newEditorState.getSelection();

  // Merge block data
  newContentState = Modifier.mergeBlockData(
    newEditorState.getCurrentContent(),
    newSelectionState,
    newMap
  );

  // Push copy block data action into editorState & update selection state
  // Note: to ignore the push we used for generating a new selectionState, use original editorState to push undo stack
  newEditorState = EditorState.push(editorState, newContentState, 'split-block');
  newEditorState = EditorState.forceSelection(newEditorState, newSelectionState);

  // Render current change
  dispatcher.setEditorState(newEditorState);

  return true;
}