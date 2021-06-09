/**
 * @file BlcokTreeUtils.test.js
 * @description Test BlcokTree
 */

/*************************************************
 * IMPORT LIBRARIES
 *************************************************/
import {
  BlockList
} from "../utils/BlockTreeUtils";

/*************************************************
 * COMPONENTS TO TEST
 *************************************************/

/*************************************************
 * REDUX REDUCER
 *************************************************/

/*************************************************
 * TEST CODE
 *************************************************/

describe('Test BlockList', () => {
  test('append', () => {
    let blockList = new BlockList();

    expect(blockList.isEmpty()).toBeTruthy();
    blockList.append(null, [1], ['a']);
    expect(blockList.isEmpty()).not.toBeTruthy();
    expect(blockList.getIndex(1)).toBe(0);
    expect(blockList.getValue(1)).toBe('a');

    blockList.append(1, [2], ['b']);
    expect(blockList.isEmpty()).not.toBeTruthy();
    expect(blockList.getIndex(1)).toBe(0);
    expect(blockList.getIndex(2)).toBe(1);
    expect(blockList.getValue(1)).toBe('a');
    expect(blockList.getValue(2)).toBe('b');

    blockList.append(1, [3, 4], ['c', 'd']);
    expect(blockList.isEmpty()).not.toBeTruthy();
    expect(blockList.getIndex(1)).toBe(0);
    expect(blockList.getIndex(2)).toBe(3);
    expect(blockList.getIndex(3)).toBe(1);
    expect(blockList.getIndex(4)).toBe(2);
    expect(blockList.getValue(1)).toBe('a');
    expect(blockList.getValue(2)).toBe('b');
    expect(blockList.getValue(3)).toBe('c');
    expect(blockList.getValue(4)).toBe('d');

    blockList.append(null, [5], ['e']);
    expect(blockList.getIndex(5)).toBe(0);
    expect(blockList.getIndex(1)).toBe(1);
    expect(blockList.getIndex(2)).toBe(4);
    expect(blockList.getIndex(3)).toBe(2);
    expect(blockList.getIndex(4)).toBe(3);
    expect(blockList.getValue(5)).toBe('e');

    blockList.clear();
    blockList.append(1, [3, 4], ['c', 'd']);
    expect(blockList.isEmpty()).not.toBeTruthy();
    expect(blockList.getIndex(3)).toBe(0);
    expect(blockList.getIndex(4)).toBe(1);
    expect(blockList.getValue(3)).toBe('c');
    expect(blockList.getValue(4)).toBe('d');
  });

  test('delete', () => {
    let blockList = new BlockList();

    blockList.append(0, [1, 2, 3, 4, 5, 6], ['a', 'b', 'c', 'd', 'e', 'f']);

    blockList.delete(1);
    expect(blockList.getSize()).toBe(5);
    expect(blockList.isEmpty()).not.toBeTruthy();
    expect(blockList.getIndex(1)).toBeNull();
    expect(blockList.getIndex(2)).toBe(0);
    expect(blockList.getIndex(3)).toBe(1);
    expect(blockList.getIndex(4)).toBe(2);
    expect(blockList.getIndex(5)).toBe(3);
    expect(blockList.getIndex(6)).toBe(4);
    expect(blockList.getValue(1)).toBeNull();
    expect(blockList.getValue(2)).toBe('b');
    expect(blockList.getValue(3)).toBe('c');
    expect(blockList.getValue(4)).toBe('d');
    expect(blockList.getValue(5)).toBe('e');
    expect(blockList.getValue(6)).toBe('f');

    blockList.delete(3);
    expect(blockList.getSize()).toBe(4);
    expect(blockList.getIndex(2)).toBe(0);
    expect(blockList.getIndex(3)).toBeNull();
    expect(blockList.getIndex(4)).toBe(1);
    expect(blockList.getIndex(5)).toBe(2);
    expect(blockList.getIndex(6)).toBe(3);
    expect(blockList.getValue(2)).toBe('b');
    expect(blockList.getValue(3)).toBeNull();
    expect(blockList.getValue(4)).toBe('d');
    expect(blockList.getValue(5)).toBe('e');
    expect(blockList.getValue(6)).toBe('f');

    blockList.delete([2]);
    expect(blockList.getSize()).toBe(3);
    expect(blockList.getIndex(2)).toBeNull();
    expect(blockList.getIndex(4)).toBe(0);
    expect(blockList.getIndex(5)).toBe(1);
    expect(blockList.getIndex(6)).toBe(2);
    expect(blockList.getValue(2)).toBeNull();
    expect(blockList.getValue(4)).toBe('d');
    expect(blockList.getValue(5)).toBe('e');
    expect(blockList.getValue(6)).toBe('f');

    blockList.delete([5]);
    expect(blockList.getSize()).toBe(2);
    expect(blockList.getIndex(4)).toBe(0);
    expect(blockList.getIndex(5)).toBeNull();
    expect(blockList.getIndex(6)).toBe(1);
    expect(blockList.getValue(4)).toBe('d');
    expect(blockList.getValue(5)).toBeNull();
    expect(blockList.getValue(6)).toBe('f');

    blockList.delete([6]);
    expect(blockList.getSize()).toBe(1);
    expect(blockList.getIndex(4)).toBe(0);
    expect(blockList.getIndex(6)).toBeNull();
    expect(blockList.getValue(4)).toBe('d');
    expect(blockList.getValue(6)).toBeNull();

    blockList.clear()
    blockList.append(0, [1, 2, 3, 4, 5, 6, 7, 8], ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);

    blockList.delete([1, 2]);
    expect(blockList.getSize()).toBe(6);
    expect(blockList.getIndex(3)).toBe(0);

    blockList.delete([7, 8]);
    expect(blockList.getSize()).toBe(4);
    expect(blockList.getIndex(3)).toBe(0);
    expect(blockList.getIndex(7)).toBeNull();
  });
});
