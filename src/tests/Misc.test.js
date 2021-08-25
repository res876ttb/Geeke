/**
 * @file Misc.test.js
 * @description Test functions in Misc.js
 */

/*************************************************
 * IMPORT LIBRARIES
 *************************************************/

/*************************************************
 * COMPONENTS TO TEST
 *************************************************/
import { checkOverlap } from '../utils/Misc';

/*************************************************
 * REDUX REDUCER
 *************************************************/

/*************************************************
 * TEST CODE
 *************************************************/
describe(checkOverlap, () => {
  test('includeLast = false', () => {
    expect(checkOverlap(1, 2, 3, 4)).not.toBeTruthy();
    expect(checkOverlap(3, 4, 1, 2)).not.toBeTruthy();
    expect(checkOverlap(1, 3, 3, 5)).not.toBeTruthy();
    expect(checkOverlap(3, 5, 1, 3)).not.toBeTruthy();
    expect(checkOverlap(1, 4, 2, 5)).toBeTruthy();
    expect(checkOverlap(2, 5, 1, 4)).toBeTruthy();
    expect(checkOverlap(2, 6, 3, 5)).toBeTruthy();
    expect(checkOverlap(3, 5, 2, 6)).toBeTruthy();
  });

  test('includeLast = true', () => {
    expect(checkOverlap(1, 2, 3, 4, true)).not.toBeTruthy();
    expect(checkOverlap(3, 4, 1, 2, true)).not.toBeTruthy();
    expect(checkOverlap(1, 3, 3, 5, true)).toBeTruthy();
    expect(checkOverlap(3, 5, 1, 3, true)).toBeTruthy();
    expect(checkOverlap(1, 4, 2, 5, true)).toBeTruthy();
    expect(checkOverlap(2, 5, 1, 4, true)).toBeTruthy();
    expect(checkOverlap(2, 6, 3, 5, true)).toBeTruthy();
    expect(checkOverlap(3, 5, 2, 6, true)).toBeTruthy();
  });
});

describe('closestBsearchIdx', () => {
  const closestBsearchIdx = (blocks, target) => {
    // Find the element that is less then target but closest to the target
    let start = 0;
    let end = blocks.length;
    let middle = -1;
    let lastStart = start;
    let lastEnd = end;

    while (start < end) {
      middle = Math.floor((start + end) / 2);

      if (blocks[middle] === target) {
        lastStart = -1;
        return middle;
      } else if (blocks[middle] < target) {
        start = middle;
      } else {
        end = middle;
      }

      if (lastStart === start && lastEnd === end) break;

      lastStart = start;
      lastEnd = end;
    }

    if (lastStart >= 0) {
      if (blocks[lastEnd] < target) return lastEnd;
      else return lastStart;
    } else {
      return middle;
    }
  };

  test('Test', () => {
    expect(closestBsearchIdx([0, 1, 2, 3], 0)).toBe(0);
    expect(closestBsearchIdx([-1, 0, 1, 2, 3], 0)).toBe(1);
    expect(closestBsearchIdx([-2, -1, 0, 1, 2], 0)).toBe(2);
    expect(closestBsearchIdx([-3, -2, -1, 0], 0)).toBe(3);
    expect(closestBsearchIdx([-5, -4, -3, -2, -1], 0)).toBe(4);
    expect(closestBsearchIdx([-4, -3, -2, -1], 0)).toBe(3);
    expect(closestBsearchIdx([-3, -2, -1], 0)).toBe(2);
    expect(closestBsearchIdx([-2, -1], 0)).toBe(1);
    expect(closestBsearchIdx([-1], 0)).toBe(0);
    expect(closestBsearchIdx([0], 0)).toBe(0);
    expect(closestBsearchIdx([0, 1], 0)).toBe(0);
    expect(closestBsearchIdx([1], 0)).toBe(0);
    expect(closestBsearchIdx([1, 2], 0)).toBe(0);
    expect(closestBsearchIdx([1, 2, 3], 0)).toBe(0);
    expect(closestBsearchIdx([1, 2, 3, 4], 0)).toBe(0);
    expect(closestBsearchIdx([1, 2, 3, 4, 5], 0)).toBe(0);
    expect(closestBsearchIdx([-4, -2, 1, 3, 5], 0)).toBe(1);
    expect(closestBsearchIdx([-4, -2, 0, 3, 5], 0)).toBe(2);
  });
});
