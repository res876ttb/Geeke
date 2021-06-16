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
  SelectionState,
} from "draft-js";
import {
  GeekeMap,
  updateBlockData,
} from "./Misc";

/*************************************************
 * CONST
 *************************************************/
import {
  blockDataKeys
} from "../constant";

/*************************************************
 * FUNCTIONS
 *************************************************/
export const toggleCheckList = (editorState, blockKey) => {
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
  let checked = curBlockData.get(blockDataKeys.checkListCheck);

  // Set new check data
  let newBlockData = new GeekeMap(curBlockData);
  newBlockData.set(blockDataKeys.checkListCheck, checked ? false : true);

  // Merge new block data
  newContentState = updateBlockData(newContentState, null, newBlockData, newSelectionState);

  // Push state
  newEditorState = EditorState.push(newEditorState, newContentState, 'toggle-check-list');
  if (focusBlockKey !== blockKey) {
    newEditorState = EditorState.forceSelection(newEditorState, newSelectionState);
  }

  return newEditorState;
};