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
