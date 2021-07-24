/*************************************************
 * @file Misc.js
 * @description Some Useful Functions
 *************************************************/

/*************************************************
 * IMPORT LIBRARIES
 *************************************************/
import { EditorState, Modifier, SelectionState } from 'draft-js'
import { v4 as uuidv4 } from 'uuid'

/*************************************************
 * CONSTANTS
 *************************************************/
const uuidBytes = [0x6e, 0xc0, 0xbd, 0x7f, 0x11, 0xc0, 0x43, 0xda, 0x97, 0x5e, 0x2a, 0x8a, 0xd9, 0xeb, 0xae, 0x0b]

/*************************************************
 * FUNCTIONS
 *************************************************/
export function newBlockId() {
  return uuidv4(uuidBytes)
}

export const getFirstBlockKey = (contentState) => {
  const blockMap = contentState.getBlockMap()
  return blockMap.keys().next().value
}

export const getLastBlockKey = (contentState) => {
  const blockMap = contentState.getBlockMap()
  return Array.from(blockMap.keys()).pop()
}

export const updateBlockData = (contentState, blockKey, blockData, selectionState = null) => {
  if (selectionState) {
    return Modifier.setBlockData(contentState, selectionState, blockData)
  } else {
    return Modifier.setBlockData(
      contentState,
      new SelectionState({
        focusKey: blockKey,
        focusOffset: 0,
        anchorKey: blockKey,
        anchorOffset: 0,
      }),
      blockData,
    )
  }
}

export class GeekeMap extends Map {
  toObject() {
    return Object.fromEntries(this)
  }
}

export const setSelectionStateByKey = (editorState, blockKey, offset = 0) => {
  return EditorState.forceSelection(
    editorState,
    new SelectionState({
      focusKey: blockKey,
      focusOffset: offset,
      anchorKey: blockKey,
      anchorOffset: offset,
    }),
  )
}

export const getBackgroundColorWithClass = (className) => {
  let targetStyle = null
  let styleSheets = document.styleSheets

  // Find background color first.
  for (let i in styleSheets) {
    let cssRules = styleSheets[i]['cssRules']
    for (let j in cssRules) {
      if (cssRules[j].selectorText === className) {
        targetStyle = cssRules[j].style
        break
      }
    }
  }

  if (!targetStyle || !targetStyle.backgroundColor) {
    // Unable to find background color. QQ
    return null
  }
  return targetStyle.backgroundColor
}

// Reference: https://javascript.plainenglish.io/how-to-find-the-caret-inside-a-contenteditable-element-955a5ad9bf81
export const getCaretRange = () => {
  const isSupported = typeof window.getSelection !== 'undefined'
  if (isSupported) {
    const selection = window.getSelection()
    if (selection.rangeCount !== 0) {
      const range = selection.getRangeAt(0).cloneRange()
      range.collapse(true)
      const rect = range.getClientRects()[0]
      if (rect) {
        return range
      }
    }
  }
  return null
}
