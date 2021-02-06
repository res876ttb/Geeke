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
import {
  findBold,
  stylerBold,
} from '../utils/EditorUtils.js';

/*************************************************
 * REDUX REDUCER
 *************************************************/

/*************************************************
 * TEST CODE
 *************************************************/

// Find bold function
test('Find bold function', () => {
  let testResult;

  testResult = findBold('abcd«sb:efg:sb»higj');
  expect(testResult).toStrictEqual([{start: 8, end: 10}]);

  testResult = findBold('abcd«sb:efg:sb»«sb:higj:sb»klm');
  expect(testResult).toStrictEqual([{start: 8, end: 10}, {start: 19, end: 22}]);

  testResult = findBold('«sb:efg:sb»');
  expect(testResult).toStrictEqual([{start: 4, end: 6}]);

  testResult = findBold('«sb:efg:sb»123«sb:efg:sb»');
  expect(testResult).toStrictEqual([{start: 4, end: 6}, {start: 18, end: 20}]);

  testResult = findBold('abc');
  expect(testResult).toStrictEqual([]);
});

// Toggle bold
test('Toggle bold', () => {
  let testResult;

  // Remove bold
  // 1. Exactly overlapped
  testResult = stylerBold('abcd«sb:efg:sb»higj', 8, 10);
  expect(testResult).toStrictEqual('abcdefghigj');

  testResult = stylerBold('«sb:efg:sb»higj', 4, 6);
  expect(testResult).toStrictEqual('efghigj');

  testResult = stylerBold('abcd«sb:efg:sb»', 8, 10);
  expect(testResult).toStrictEqual('abcdefg');

  testResult = stylerBold('abcd«sb:e:sb»higj', 8, 8);
  expect(testResult).toStrictEqual('abcdehigj');

  // 2. Overlapped by another bigger range
  testResult = stylerBold('abcd«sb:efffg:sb»higj', 9, 11);
  expect(testResult).toStrictEqual('abcd«sb:e:sb»fff«sb:g:sb»higj');

  testResult = stylerBold('abcd«sb:efffg:sb»higj', 8, 11);
  expect(testResult).toStrictEqual('abcdefff«sb:g:sb»higj');

  testResult = stylerBold('abcd«sb:efffg:sb»higj', 9, 12);
  expect(testResult).toStrictEqual('abcd«sb:e:sb»fffghigj');
})