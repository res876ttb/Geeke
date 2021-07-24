/**
 * @file NumberListUtils.js
 * @description Utilities for handling keyboard input.
 * Keyword: "/// Start"
 */

// TODO: Rename filename & function name

/*************************************************
 * IMPORT
 *************************************************/
import { blockDataKeys, constBlockType } from '../constant'
import { GeekeMap, getFirstBlockKey, updateBlockData } from '../utils/Misc'

/*************************************************
 * CONST
 *************************************************/

/*************************************************
 * FUNCTIONS
 *************************************************/
export const findPreviousBlockWithSameDepth = (contentState, blockKey, indentLevel) => {
  let prevBlock = contentState.getBlockForKey(blockKey)
  if (!prevBlock) return null
  let prevBlockData = null
  let prevIndentLevel = 0
  while (prevBlock) {
    prevBlock = contentState.getBlockBefore(prevBlock.getKey())
    if (!prevBlock) return null
    prevBlockData = prevBlock.getData()
    prevIndentLevel = prevBlockData.has(blockDataKeys.indentLevel) ? prevBlockData.get(blockDataKeys.indentLevel) : 0
    if (prevIndentLevel < indentLevel) return null
    if (prevIndentLevel === indentLevel) return prevBlock
  }

  return null
}

export const findNextBlockWithSameDepth = (contentState, blockKey, indentLevel) => {
  let nextBlock = contentState.getBlockForKey(blockKey)
  if (!nextBlock) return null
  let nextBlockData = null
  let nextIndentLevel = 0
  while (nextBlock) {
    nextBlock = contentState.getBlockAfter(nextBlock.getKey())
    if (!nextBlock) return null
    nextBlockData = nextBlock.getData()
    nextIndentLevel = nextBlockData.has(blockDataKeys.indentLevel) ? nextBlockData.get(blockDataKeys.indentLevel) : 0
    if (nextIndentLevel < indentLevel) return null
    if (nextIndentLevel === indentLevel) return nextBlock
  }

  return null
}

export const trimNumberListWithSameDepth = (contentState, blockKey, indentLevel, startOrder = 1) => {
  let newContentState = contentState
  let curBlock = newContentState.getBlockForKey(blockKey)
  let curBlockData = curBlock.getData()
  let curBlockType = curBlock.getType()
  let curBlockKey = null
  let curIndentLevel = curBlockData.has(blockDataKeys.indentLevel) ? curBlockData.get(blockDataKeys.indentLevel) : 0

  // Find first block with the same depth if current block is not valid for trimming
  if (curBlockType !== constBlockType.numberList || curIndentLevel !== indentLevel) {
    curBlock = findNextBlockWithSameDepth(contentState, blockKey, indentLevel)
    if (!curBlock) return contentState
  }

  // Set numberListOrder of current block to startOrder
  curBlockData = curBlock.getData()
  curBlockKey = curBlock.getKey()
  let newBlockData = new GeekeMap(curBlockData)
  newBlockData.set(blockDataKeys.numberListOrder, startOrder)
  newContentState = updateBlockData(newContentState, curBlockKey, newBlockData)

  // Update curBlock and curBlockData to the latest value
  curBlock = newContentState.getBlockForKey(curBlockKey)
  curBlockData = curBlock.getData()

  // Set base block indent level
  let curNumberListOrder = curBlockData.get(blockDataKeys.numberListOrder) + 1
  while (curBlock) {
    // Check whether next block is valid
    curBlock = newContentState.getBlockAfter(curBlock.getKey())
    if (!curBlock) break

    // Check whether next block should be trimed.
    curBlockKey = curBlock.getKey()
    curBlockType = curBlock.getType()
    curBlockData = curBlock.getData()
    curIndentLevel = curBlockData.has(blockDataKeys.indentLevel) ? curBlockData.get(blockDataKeys.indentLevel) : 0
    if (curIndentLevel < indentLevel) break
    if (curIndentLevel > indentLevel) continue
    if (curBlockType !== constBlockType.numberList) break

    // Trim this block
    let newBlockData = new GeekeMap(curBlockData)
    newBlockData.set(blockDataKeys.numberListOrder, curNumberListOrder)
    curNumberListOrder += 1

    // Merge new block data into editorState
    newContentState = updateBlockData(newContentState, curBlockKey, newBlockData)
  }

  return newContentState
}

export const trimNumberListInWholePage = (contentState) => {
  let numberListOrderMap = new GeekeMap([[0, 0]])
  let parentKeyMap = new GeekeMap([
    [-1, null],
    [0, null],
  ])
  let curDepth = 0
  let newContentState = contentState
  let firstBlockKey = getFirstBlockKey(newContentState)
  let curBlock = newContentState.getBlockForKey(firstBlockKey)

  while (curBlock) {
    // Get depth & type
    let blockData = curBlock.getData()
    let blockDepth = blockData.has(blockDataKeys.indentLevel) ? blockData.get(blockDataKeys.indentLevel) : 0
    let blockType = curBlock.getType()
    let blockKey = curBlock.getKey()
    let blockParentKey = blockData.get(blockDataKeys.parentKey)

    // If current depth is change, move depth pointer: curDepth, and modify numberListOrderMap
    if (blockDepth > curDepth) {
      let parentKey = parentKeyMap.get(curDepth)
      while (curDepth < blockDepth) {
        curDepth += 1
        numberListOrderMap.set(curDepth, 0)
        parentKeyMap.set(curDepth, parentKey)
      }
    } else if (curDepth > blockDepth) {
      curDepth = blockDepth
    }
    parentKeyMap.set(curDepth, blockKey)

    // Check whether to update parent block
    if (blockParentKey !== parentKeyMap.get(curDepth - 1)) {
      let newBlockData = new GeekeMap(blockData)
      newBlockData.set(blockDataKeys.parentKey, parentKeyMap.get(curDepth - 1))
      newContentState = updateBlockData(newContentState, curBlock.getKey(), newBlockData)
      blockData = newContentState.getBlockForKey(curBlock.getKey()).getData()
    }

    // If current block is number list
    if (blockType === constBlockType.numberList) {
      // If current list is the first number list, set numberListOrderMap start from 1
      if (numberListOrderMap.get(curDepth) === 0) {
        // When numerListOrderMap[curDepth] = 0, there are no list before.
        numberListOrderMap.set(curDepth, 1)
      }

      // Get numberListOrder of this block
      let numberListOrder = blockData.get(blockDataKeys.numberListOrder)

      // Check numberListOrder of this block. If it is not correct,
      if (numberListOrder !== numberListOrderMap.get(curDepth)) {
        let newBlockData = new GeekeMap(blockData)
        newBlockData.set(blockDataKeys.numberListOrder, numberListOrderMap.get(curDepth))
        newContentState = updateBlockData(newContentState, curBlock.getKey(), newBlockData)
      }

      // Update numberListOrderMap
      numberListOrderMap.set(curDepth, numberListOrderMap.get(curDepth) + 1)
    } else {
      // If improper number list data exists in a block, remove it!
      if (blockData.has(blockDataKeys.numberListOrder)) {
        let newBlockData = new GeekeMap(blockData)
        newBlockData.delete(blockDataKeys.numberListOrder)
        newContentState = updateBlockData(newContentState, curBlock.getKey(), newBlockData)
      }

      numberListOrderMap.set(curDepth, 0)
    }

    // Go to the next block
    curBlock = newContentState.getBlockAfter(curBlock.getKey())
  }

  return newContentState
}

export const isShowBlock = (contentState, key) => {
  let curBlock = contentState.getBlockForKey(key)
  let blockData = curBlock.getData()
  curBlock = contentState.getBlockForKey(blockData.get(blockDataKeys.parentKey))

  while (curBlock) {
    blockData = curBlock.getData()
    if (blockData.has(blockDataKeys.toggleListToggle)) {
      if (!blockData.get(blockDataKeys.toggleListToggle)) {
        return false
      }
    } else if (curBlock.getType() === constBlockType.toggleList) {
      return false
    }
    curBlock = contentState.getBlockForKey(blockData.get(blockDataKeys.parentKey))
  }

  return true
}
