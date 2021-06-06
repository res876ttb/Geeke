/**
 * @file CheckListUtils.js
 * @description Utilities for handling toggle events of check list.
 * Keyword: "/// Start"
 */

/*************************************************
 * IMPORT
 *************************************************/
import {
  EditorState,
  Modifier,
  SelectionState
} from "draft-js";

/*************************************************
 * CONST
 *************************************************/
import {
  blockDataKeys
} from "../constant";

/*************************************************
 * FUNCTIONS
 *************************************************/
export const toggleToggleList = (editorState, blockKey, setNewSelectionState=true) => {
  let newEditorState = editorState;
  let newContentState = newEditorState.getCurrentContent();
  let selectionState = editorState.getSelection();
  let focusBlockKey = selectionState.getFocusKey();
  let newSelectionState = new SelectionState({
    focusKey: blockKey,
    focusOffset: 0,
    anchorKey: blockKey,
    anchorOffset: 0,
  });

  // Get block data
  let curBlock = newContentState.getBlockForKey(blockKey);
  let curBlockData = curBlock.getData();
  let toggle = curBlockData.get(blockDataKeys.toggleListToggle);

  // Set new check data
  let newBlockData = new Map(curBlockData);
  newBlockData.set(blockDataKeys.toggleListToggle, toggle ? false : true);

  // Merge new block data
  newContentState = Modifier.mergeBlockData(newContentState, newSelectionState, newBlockData);

  // Push state
  newEditorState = EditorState.push(newEditorState, newContentState, 'toggle-toggle-list');
  if (setNewSelectionState && focusBlockKey !== blockKey) {
    newEditorState = EditorState.forceSelection(newEditorState, newSelectionState);
  }

  return newEditorState;
};