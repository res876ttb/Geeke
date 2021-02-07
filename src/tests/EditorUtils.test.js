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
  stylerConst,
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
test(`Find bold function`, () => {
  let testResult;
  const POST = stylerConst.POSTFIX_BOLD;
  const PRE = stylerConst.PREFIX_BOLD;

  // 1. Middle
  testResult = findBold(`abcd${PRE}efg${POST}higj`);
  expect(testResult).toStrictEqual([{start: 8, end: 10}]);

  // 2. 2 continuous bold
  testResult = findBold(`abcd${PRE}efg${POST}${PRE}higj${POST}klm`);
  expect(testResult).toStrictEqual([{start: 8, end: 10}, {start: 19, end: 22}]);

  // 3. only bold
  testResult = findBold(`${PRE}efg${POST}`);
  expect(testResult).toStrictEqual([{start: 4, end: 6}]);

  // 4. Most left & most right
  testResult = findBold(`${PRE}efg${POST}123${PRE}efg${POST}`);
  expect(testResult).toStrictEqual([{start: 4, end: 6}, {start: 18, end: 20}]);

  // 5. Nothing
  testResult = findBold(`abc`);
  expect(testResult).toStrictEqual([]);
});

// Toggle bold
test(`Toggle bold`, () => {
  let testResult;
  const POST = stylerConst.POSTFIX_BOLD;
  const PRE = stylerConst.PREFIX_BOLD;
  const PRE_LEN = stylerConst.PREFIX_LEN;
  const POST_LEN = stylerConst.POSTFIX_LEN;

  // 1 Remove bold
  // 1.1 Exactly overlapped
  // 1.1.1 Middle
  testResult = stylerBold(`0123${PRE}456${POST}789`, 4 + PRE_LEN, 6 + PRE_LEN);
  expect(testResult).toStrictEqual(`0123456789`);

  // 1.1.2 Left
  testResult = stylerBold(`${PRE}012${POST}3456`, PRE_LEN, 2 + PRE_LEN);
  expect(testResult).toStrictEqual(`0123456`);

  // 1.1.3 Right
  testResult = stylerBold(`0123${PRE}456${POST}`, 4 + PRE_LEN, 6 + PRE_LEN);
  expect(testResult).toStrictEqual(`0123456`);

  // 1.1.4 1 char
  testResult = stylerBold(`0123${PRE}4${POST}5678`, 4 + PRE_LEN, 4 + PRE_LEN);
  expect(testResult).toStrictEqual(`012345678`);

  // 1.2 Overlapped by another bigger range
  // 1.2.1 Middle
  testResult = stylerBold(`0123${PRE}45678${POST}9012`, 5 + PRE_LEN, 7 + PRE_LEN);
  expect(testResult).toStrictEqual(`0123${PRE}4${POST}567${PRE}8${POST}9012`);

  // 1.2.2 Left
  testResult = stylerBold(`0123${PRE}45678${POST}9012`, 4 + PRE_LEN, 7 + PRE_LEN);
  expect(testResult).toStrictEqual(`01234567${PRE}8${POST}9012`);

  // 1.2.3. Right
  testResult = stylerBold(`0123${PRE}45678${POST}9012`, 5 + PRE_LEN, 8 + PRE_LEN);
  expect(testResult).toStrictEqual(`0123${PRE}4${POST}56789012`);

  // 2 Add bold
  // 2.1 No overlap
  // 2.1.1 Middle
  testResult = stylerBold(`012345678`, 2, 4);
  expect(testResult).toStrictEqual(`01${PRE}234${POST}5678`);
  testResult = stylerBold(`${PRE}0${POST}123456${PRE}78${POST}`, 2 + PRE_LEN + POST_LEN, 4 + PRE_LEN + POST_LEN);
  expect(testResult).toStrictEqual(`${PRE}0${POST}1${PRE}234${POST}56${PRE}78${POST}`);

  // 2.1.2 Left
  testResult = stylerBold(`012345678`, 0, 4);
  expect(testResult).toStrictEqual(`${PRE}01234${POST}5678`);
  testResult = stylerBold(`0123456${PRE}78${POST}`, 0, 4);
  expect(testResult).toStrictEqual(`${PRE}01234${POST}56${PRE}78${POST}`);

  // 2.1.3 Right
  testResult = stylerBold(`012345678`, 2, 8);
  expect(testResult).toStrictEqual(`01${PRE}2345678${POST}`);
  testResult = stylerBold(`${PRE}0${POST}12345678`, 2 + PRE_LEN + POST_LEN, 8 + PRE_LEN + POST_LEN);
  expect(testResult).toStrictEqual(`${PRE}0${POST}1${PRE}2345678${POST}`);

  // 2.2 Left partial overlapping
  testResult = stylerBold(`${PRE}0123${POST}45678`, 2 + PRE_LEN, 4 + PRE_LEN + POST_LEN);
  expect(testResult).toStrictEqual(`${PRE}01234${POST}5678`);
  testResult = stylerBold(`${PRE}0123${POST}456${PRE}78${POST}`, 2 + PRE_LEN, 4 + PRE_LEN + POST_LEN);
  expect(testResult).toStrictEqual(`${PRE}01234${POST}56${PRE}78${POST}`);

  // 2.3 Right partial overlapping
  testResult = stylerBold(`0123${PRE}456${POST}78`, 2, 4 + PRE_LEN);
  expect(testResult).toStrictEqual(`01${PRE}23456${POST}78`);

  // 2.4 A small bold in the middle
  testResult = stylerBold(`012${PRE}3${POST}45678`, 2, 4 + PRE_LEN + POST_LEN);
  expect(testResult).toStrictEqual(`01${PRE}234${POST}5678`);

  // 2.5 Left & right partial overlapping
  testResult = stylerBold(`01${PRE}23${POST}45${PRE}67${POST}8`, 3 + PRE_LEN, 6 + PRE_LEN * 2 + POST_LEN);
  expect(testResult).toStrictEqual(`01${PRE}234567${POST}8`);

  // 2.6 Left partial overlapping with a small bold in the middle
  testResult = stylerBold(`0${PRE}12${POST}3${PRE}4${POST}5678`, 2 + PRE_LEN, 5 + PRE_LEN * 2 + POST_LEN * 2);
  expect(testResult).toStrictEqual(`0${PRE}12345${POST}678`);

  // 2.7 Right partial overlapping with a small bold in the middle
  testResult = stylerBold(`0123${PRE}4${POST}5${PRE}67${POST}8`, 3, 6 + PRE_LEN * 2 + POST_LEN);
  expect(testResult).toStrictEqual(`012${PRE}34567${POST}8`);

  // 2.8 Left & right partial overlapping with a small bold in the middle
  testResult = stylerBold(`0${PRE}12${POST}3${PRE}4${POST}5${PRE}67${POST}8`, 2 + PRE_LEN, 6 + PRE_LEN * 3 + POST_LEN * 2);
  expect(testResult).toStrictEqual(`0${PRE}1234567${POST}8`);

  // 2.8 Left & right partial overlapping with 2 small bolds in the middle
  testResult = stylerBold(`0${PRE}12${POST}3${PRE}4${POST}5${PRE}6${POST}7${PRE}89${POST}012345`, 2 + PRE_LEN, 8 + PRE_LEN * 4 + POST_LEN * 3);
  expect(testResult).toStrictEqual(`0${PRE}123456789${POST}012345`);
})