/**
 * @file BlockTreeUtils.js
 * @description Utilities for handling position of caret.
 */

/*************************************************
 * IMPORT
 *************************************************/
import { blockDataKeys } from "../constant";
import { getFirstBlockKey } from "./Misc";

/*************************************************
 * CONST
 *************************************************/

/*************************************************
 * FUNCTIONS
 *************************************************/
class IntuitiveMap {
  constructor(map) {
    if (map instanceof Map) {
      this.map = map;
    } else {
      this.map = new Map();
    }

    return new Proxy(this, {
      set: (_, key, value) => {
        return this.map.set(key, value);
      },
      get: (_, key) => {
        if (key === 'map') return this.getMap();
        return this.map.get(key);
      },
      has: (_, key) => {
        return this.map.has(key);
      },
      deleteProperty: (_, key) => {
        if (this.map.has(key)) {
          return this.map.delete(key);
        }
        return false;
      },
    });
  }

  getMap() {
    return this.map
  }
}

export class BlockList {
  indexHash = new IntuitiveMap(); // key: key, value: index of key
  valueArray = [];
  keyArray = [];
  type = 'unstyled';

  clear() {
    this.indexHash = new IntuitiveMap();
    this.valueArray = [];
    this.keyArray = [];
  }

  isEmpty() {
    return this.getSize() === 0;
  }

  getIndex(key) {
    if (key in this.indexHash) return this.indexHash[key];
    return null;
  }

  getValue(key) {
    if (key in this.indexHash) return this.valueArray[this.indexHash[key]];
    return null;
  }

  getSize() {
    // console.assert(this.valueArray.length === this.keyArray.length, 'Length of valueArray and keyArray is not equal!');
    return this.valueArray.length;
  }

  getType() {
    return this.type;
  }

  setType(newType) {
    this.type = newType;
  }

  append(key, keyArray, valueArray) {
    let curIndex = key in this.indexHash ? (this.indexHash[key] + 1) : 0;
    let appendSize = valueArray.length;

    // Update index of original array
    for (let i = curIndex; i < this.keyArray.length; i++) {
      this.indexHash[this.keyArray[i]] += appendSize;
    }

    // Insert values into valueArray
    this.valueArray.splice(curIndex, 0, ...valueArray);

    // Insert keys into keyArray
    this.keyArray.splice(curIndex, 0, ...keyArray);

    // Update index of newly add keys
    for (let i = 0; i < appendSize; i++, curIndex++) {
      this.indexHash[keyArray[i]] = curIndex;
    }
  }

  delete(keys) {
    if (Array.isArray(keys)) {
      // Note: this keys array must contain continuous keys.
      // Sanity check whether the keys array is empty
      if (keys.length === 0) return;
      if (!(keys[0] in this.indexHash)) return;

      let firstKeyIndex = this.indexHash[keys[0]];

      // Update index after the deleted items
      for (let i = firstKeyIndex + keys.length; i < this.valueArray.length; i++) {
        this.indexHash[this.keyArray[i]] -= keys.length;
      }

      // Remove items from array
      this.valueArray.splice(firstKeyIndex, keys.length);
      this.keyArray.splice(firstKeyIndex, keys.length);

      // Remove items from indexHash
      for (let i = 0; i < keys.length; i++) {
        delete this.indexHash[keys[i]];
      }
    } else {
      if (!(keys in this.indexHash)) return undefined;
      let keyIndex = this.indexHash[keys];

      // Update index after the deleted item
      for (let i = keyIndex + 1; i < this.valueArray.length; i++) {
        this.indexHash[this.keyArray[i]] -= 1;
      }

      // Remove item from array
      this.valueArray.splice(keyIndex, 1);
      this.keyArray.splice(keyIndex, 1);

      // Remove item from indexHash
      delete this.indexHash[keys];
    }
  }
}

class ParentInfo {
  key = null;
  blockListIndex = -1;
  inListOrder = -1;

  constructor(key, blockListIndex, inListOrder) {
    this.key = key;
    this.blockListIndex = blockListIndex;
    this.inListOrder = inListOrder;
  }
}

export class BlockTree {
  constructor(contentState) {
    this.tree = this.contentStateToTree(contentState);
    this.parentMap = this.createParentMapFromTree(this.tree);
  }

  contentStateToTree(contentState) {
    // Iterate through contentState
    let curBlock = contentState.getBlockForKey(getFirstBlockKey(contentState));
    let blockTypeDepthMap = new IntuitiveMap();
    blockTypeDepthMap[0] = curBlock.getType();

    // Function to pase a certain level of blocks
    const parseContentState = curDepth => {
      let blockLists = [];
      let blockKeys = [];
      let children = [];

      while (curBlock) {
        // Get data about this block
        let blockType = curBlock.getType();
        let blockData = curBlock.getData();
        let blockKey = curBlock.getKey();
        let blockDepth = blockData.has(blockDataKeys.indentLevel) ? blockData.get(blockDataKeys.indentLevel) : 0;

        if (curDepth < blockDepth) {
          // This is a child block of previous block.
          console.assert(curDepth + 1 === blockDepth, `The depth difference between curDepth and blockDepth must be only 1!`);
          children[children.length - 1] = parseContentState(curDepth + 1);

          if (!curBlock) {
            let blockList = new BlockList();
            blockList.append(null, blockKeys, children);
            blockList.setType(blockTypeDepthMap[curDepth]);
            blockLists.push(blockList);
            return blockLists;
          }

          // Update blockKey
          blockKey = curBlock.getKey();
          blockData = curBlock.getData();
          blockType = curBlock.getType();
          blockDepth = blockData.has(blockDataKeys.indentLevel) ? blockData.get(blockDataKeys.indentLevel) : 0;
        }

        if (curDepth > blockDepth) {
          // No more blocks with the same depth. Just return the result.

          // Check whether there are blocks which are not put into blockLists
          if (blockKeys.length > 0) {
            let blockList = new BlockList();
            blockList.append(null, blockKeys, children);
            blockList.setType(blockTypeDepthMap[curDepth]);
            blockLists.push(blockList);
          }

          // Delete current block type from blockTypeDepthMap
          delete blockTypeDepthMap[curDepth];

          return blockLists;
        }

        // This block has the same depth as the previous one.

        // Check whether the blockType is the same as the previous block.
        if (!blockTypeDepthMap[curDepth]) {
          // This is the first block in this depth, so just set current blockType to the block type map
          blockTypeDepthMap[curDepth] = blockType;
        } else if (blockType !== blockTypeDepthMap[curDepth]) {
          // Type is mismatch. Put the current result into the blockLists
          let blockList = new BlockList();
          blockList.append(null, blockKeys, children);
          blockList.setType(blockTypeDepthMap[curDepth]);
          blockLists.push(blockList);

          // Clear blockKeys and children
          blockKeys = [];
          children = [];

          // Update blockTypeDepthMap
          blockTypeDepthMap[curDepth] = blockType;
        }

        // Update blockKeys and children
        blockKeys.push(blockKey);
        children.push([]);

        curBlock = contentState.getBlockAfter(blockKey);
      }

      if (blockKeys.length > 0) {
        let blockList = new BlockList();
        blockList.append(null, blockKeys, children);
        blockList.setType(blockTypeDepthMap[curDepth]);
        blockLists.push(blockList);
      }

      return blockLists;
    };

    return parseContentState(0);
  }

  createParentMapFromTree(tree) {
    let parentMap = new IntuitiveMap();

    const createParentMap = (parentId, nodes) => { // nodes is an array of BlockLists
      for (let i = 0; i < nodes.length; i++) {
        for (let j = 0; j < nodes[i].valueArray.length; j++) {
          parentMap[nodes[i].keyArray[j]] = new ParentInfo(parentId, i, j);
          createParentMap(nodes[i].keyArray[j], nodes[i].valueArray[j]);
        }
      }
    };

    createParentMap(null, tree);

    return parentMap;
  }

  getParent(key) {

  }

  getParentAndData(contentState, key) {
    if (!(key in this.parentMap)) return null;
  }
}