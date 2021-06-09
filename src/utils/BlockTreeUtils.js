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
class IntuitiveMap {
  constructor() {
    this.map = new Map();

    return new Proxy(this, {
      set: (_, key, value) => {
        return this.map.set(key, value);
      },
      get: (_, key) => {
        // if (key === 'getMap') return this.getMap;
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

  constructor() {}

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

export class BlockTree {
  constructor(contentBlock) {
    tree = this.contentBlockToTree(contentBlock);
  }

  contentBlockToTree(contentBlock) {
    tree = new BlockList();

    // Iterate through contentBlock
  }
}