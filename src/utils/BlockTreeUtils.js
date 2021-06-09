/**
 * @file BlockTreeUtils.js
 * @description Utilities for handling position of caret.
 */

/*************************************************
 * IMPORT
 *************************************************/

/*************************************************
 * CONST
 *************************************************/

/*************************************************
 * FUNCTIONS
 *************************************************/

export class BlockList {
  indexHash = new Map(); // key: key, value: index of key
  valueArray = [];
  keyArray = [];

  constructor() {}

  clear() {
    this.indexHash = new Map();
    this.valueArray = [];
    this.keyArray = [];
  }

  isEmpty() {
    return this.getSize() === 0;
  }

  getIndex(key) {
    if (this.indexHash.has(key)) return this.indexHash.get(key);
    return null;
  }

  getValue(key) {
    if (this.indexHash.has(key)) return this.valueArray[this.indexHash.get(key)];
    return null;
  }

  getSize() {
    // console.assert(this.valueArray.length === this.keyArray.length, 'Length of valueArray and keyArray is not equal!');
    return this.valueArray.length;
  }

  append(key, keyArray, valueArray) {
    let curIndex = this.indexHash.has(key) ? (this.indexHash.get(key) + 1) : 0;
    let appendSize = valueArray.length;

    // Update index of original array
    for (let i = curIndex; i < this.keyArray.length; i++) {
      this.indexHash.set(this.keyArray[i], this.indexHash.get(this.keyArray[i]) + appendSize);
    }

    // Insert values into valueArray
    this.valueArray.splice(curIndex, 0, ...valueArray);

    // Insert keys into keyArray
    this.keyArray.splice(curIndex, 0, ...keyArray);

    // Update index of newly add keys
    for (let i = 0; i < appendSize; i++, curIndex++) {
      this.indexHash.set(keyArray[i], curIndex);
    }
  }

  delete(keys) {
    if (Array.isArray(keys)) {
      // Note: this keys array must contain continuous keys.
      // Sanity check whether the keys array is empty
      if (keys.length === 0) return;

      let firstKeyIndex = this.indexHash.get(keys[0]);

      // Update index after the deleted items
      for (let i = firstKeyIndex + keys.length; i < this.valueArray.length; i++) {
        this.indexHash.set(this.keyArray[i], this.indexHash.get(this.keyArray[i]) - keys.length);
      }

      // Remove items from array
      this.valueArray.splice(firstKeyIndex, keys.length);
      this.keyArray.splice(firstKeyIndex, keys.length);

      // Remove items from indexHash
      for (let i = 0; i < keys.length; i++) {
        this.indexHash.delete(keys[i]);
      }
    } else {
      let keyIndex = this.indexHash.get(keys);

      // Update index after the deleted item
      for (let i = keyIndex + 1; i < this.valueArray.length; i++) {
        this.indexHash.set(this.keyArray[i], this.indexHash.get(this.keyArray[i]) - 1);
      }

      // Remove item from array
      this.valueArray.splice(keyIndex, 1);
      this.keyArray.splice(keyIndex, 1);

      // Remove item from indexHash
      this.indexHash.delete(keys);
    }
  }
}

export class BlockTree {
  constructor(contentBlock) {
    tree = this.contentBlockToTree(contentBlock);
  }

  contentBlockToTree(contentBlock) {
    tree = new BlockList();

    // Iterate through contentBlock
  }
}