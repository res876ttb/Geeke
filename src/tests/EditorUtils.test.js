/**
 * @file EditorUtils.test.js
 * @description Test EditorUtils
 */

/*************************************************
 * IMPORT LIBRARIES
 *************************************************/

/*************************************************
 * FUNCTIONS TO TEST
 *************************************************/
import {findBold} from '../utils/EditorUtils.js';

/*************************************************
 * REDUX REDUCER
 *************************************************/

/*************************************************
 * TEST CODE
 *************************************************/

// findBold
test('findBold', () => {
  let testResult;
  testResult = findBold('abcd«sb:efg:sb»higj');
  expect(testResult).toStrictEqual([[8, 10]]);

  testResult = findBold('abcd«sb:efg:sb»«sb:higj:sb»klm');
  expect(testResult).toStrictEqual([[8, 10], [19, 22]]);

  testResult = findBold('«sb:efg:sb»');
  expect(testResult).toStrictEqual([[4, 6]]);

  testResult = findBold('«sb:efg:sb»123«sb:efg:sb»');
  expect(testResult).toStrictEqual([[4, 6], [18, 20]]);
});