/**
 * @file CaretPositionUtils.js
 * @description Utilities for handling position of caret.
 */

/*************************************************
 * IMPORT
 *************************************************/
import { SelectionState, EditorState } from 'draft-js'
import { oneRem } from '../constant'
import { updateContent } from '../states/editor'

/*************************************************
 * CONST
 *************************************************/

/*************************************************
 * FUNCTIONS
 *************************************************/
// Check compatibility of getSelection and createRange
// @copyright: https://wuxinhua.com/2018/07/05/Contenteditable-The-Good-Part-And-The-Ugly/
function isSupportRange() {
  return typeof document.createRange === 'function' || typeof window.getSelection === 'function'
}

// Get caret position
// @copyright: https://wuxinhua.com/2018/07/05/Contenteditable-The-Good-Part-And-The-Ugly
function getCurrentRange() {
  let range = null
  let selection = null
  if (isSupportRange()) {
    selection = document.getSelection()
    if (selection.getRangeAt && selection.rangeCount) {
      range = document.getSelection().getRangeAt(0)
    }
  } else {
    range = document.selection.createRange()
  }
  return range
}

export const getCaretPosition = () => {
  let curRange = getCurrentRange()
  if (curRange === null) return -1

  return curRange.getBoundingClientRect().left
}

export const setNewCaretPosition = (dispatch, editorState, uuid, lastCaretPos) => {
  let previousBlockElement = document.getElementById(uuid)
  let leftOffset = previousBlockElement.getBoundingClientRect().left
  let paddingLeft = parseFloat(previousBlockElement.style.paddingLeft) * oneRem // Unit: rem to px
  let restOffset = lastCaretPos - (leftOffset + paddingLeft)

  let lastBlock = editorState.getCurrentContent().getLastBlock()
  let lastBlockKey = lastBlock.getKey()
  let newSelectionState = null

  if (restOffset <= 0) {
    newSelectionState = new SelectionState({
      anchorKey: lastBlockKey,
      anchorOffset: 0,
      focusKey: lastBlockKey,
      focusOffset: 0,
    })

    updateContent(dispatch, uuid, EditorState.forceSelection(editorState, newSelectionState))
  } else {
    let trailOffset = lastBlock.getLength()

    while (trailOffset > 0) {
      // Try selection
      newSelectionState = new SelectionState({
        anchorKey: lastBlockKey,
        anchorOffset: trailOffset,
        focusKey: lastBlockKey,
        focusOffset: trailOffset,
      })
      updateContent(dispatch, uuid, EditorState.forceSelection(editorState, newSelectionState))

      console.log(trailOffset, lastCaretPos, getCaretPosition())

      if (getCaretPosition() <= lastCaretPos) break

      // Current offset is too long... Try less 1 index.
      trailOffset--
    }
  }
}
