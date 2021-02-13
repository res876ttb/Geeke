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
  colorConst,
  styleType,
  findStylerPair,
  styleToggler,
  contentStyler,
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
  testResult = findStylerPair(`abcd${PRE}efg${POST}higj`, PRE, POST);
  expect(testResult).toStrictEqual([{start: 8, end: 10}]);

  // 2. 2 continuous bold
  testResult = findStylerPair(`abcd${PRE}efg${POST}${PRE}higj${POST}klm`, PRE, POST);
  expect(testResult).toStrictEqual([{start: 8, end: 10}, {start: 19, end: 22}]);

  // 3. only bold
  testResult = findStylerPair(`${PRE}efg${POST}`, PRE, POST);
  expect(testResult).toStrictEqual([{start: 4, end: 6}]);

  // 4. Most left & most right
  testResult = findStylerPair(`${PRE}efg${POST}123${PRE}efg${POST}`, PRE, POST);
  expect(testResult).toStrictEqual([{start: 4, end: 6}, {start: 18, end: 20}]);

  // 5. Nothing
  testResult = findStylerPair(`abc`, PRE, POST);
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
  testResult = styleToggler(`0123${PRE}456${POST}789`, 4 + PRE_LEN, 6 + PRE_LEN, PRE, POST);
  expect(testResult).toStrictEqual(`0123456789`);

  // 1.1.2 Left
  testResult = styleToggler(`${PRE}012${POST}3456`, PRE_LEN, 2 + PRE_LEN, PRE, POST);
  expect(testResult).toStrictEqual(`0123456`);

  // 1.1.3 Right
  testResult = styleToggler(`0123${PRE}456${POST}`, 4 + PRE_LEN, 6 + PRE_LEN, PRE, POST);
  expect(testResult).toStrictEqual(`0123456`);

  // 1.1.4 1 char
  testResult = styleToggler(`0123${PRE}4${POST}5678`, 4 + PRE_LEN, 4 + PRE_LEN, PRE, POST);
  expect(testResult).toStrictEqual(`012345678`);

  // 1.2 Overlapped by another bigger range
  // 1.2.1 Middle
  testResult = styleToggler(`0123${PRE}45678${POST}9012`, 5 + PRE_LEN, 7 + PRE_LEN, PRE, POST);
  expect(testResult).toStrictEqual(`0123${PRE}4${POST}567${PRE}8${POST}9012`);

  // 1.2.2 Left
  testResult = styleToggler(`0123${PRE}45678${POST}9012`, 4 + PRE_LEN, 7 + PRE_LEN, PRE, POST);
  expect(testResult).toStrictEqual(`01234567${PRE}8${POST}9012`);

  // 1.2.3. Right
  testResult = styleToggler(`0123${PRE}45678${POST}9012`, 5 + PRE_LEN, 8 + PRE_LEN, PRE, POST);
  expect(testResult).toStrictEqual(`0123${PRE}4${POST}56789012`);

  // 2 Add bold
  // 2.1 No overlap
  // 2.1.1 Middle
  testResult = styleToggler(`012345678`, 2, 4, PRE, POST);
  expect(testResult).toStrictEqual(`01${PRE}234${POST}5678`);
  testResult = styleToggler(`${PRE}0${POST}123456${PRE}78${POST}`, 2 + PRE_LEN + POST_LEN, 4 + PRE_LEN + POST_LEN, PRE, POST);
  expect(testResult).toStrictEqual(`${PRE}0${POST}1${PRE}234${POST}56${PRE}78${POST}`);

  // 2.1.2 Left
  testResult = styleToggler(`012345678`, 0, 4, PRE, POST);
  expect(testResult).toStrictEqual(`${PRE}01234${POST}5678`);
  testResult = styleToggler(`0123456${PRE}78${POST}`, 0, 4, PRE, POST);
  expect(testResult).toStrictEqual(`${PRE}01234${POST}56${PRE}78${POST}`);

  // 2.1.3 Right
  testResult = styleToggler(`012345678`, 2, 8, PRE, POST);
  expect(testResult).toStrictEqual(`01${PRE}2345678${POST}`);
  testResult = styleToggler(`${PRE}0${POST}12345678`, 2 + PRE_LEN + POST_LEN, 8 + PRE_LEN + POST_LEN, PRE, POST);
  expect(testResult).toStrictEqual(`${PRE}0${POST}1${PRE}2345678${POST}`);

  // 2.2 Left partial overlapping
  testResult = styleToggler(`${PRE}0123${POST}45678`, 2 + PRE_LEN, 4 + PRE_LEN + POST_LEN, PRE, POST);
  expect(testResult).toStrictEqual(`${PRE}01234${POST}5678`);
  testResult = styleToggler(`${PRE}0123${POST}456${PRE}78${POST}`, 2 + PRE_LEN, 4 + PRE_LEN + POST_LEN, PRE, POST);
  expect(testResult).toStrictEqual(`${PRE}01234${POST}56${PRE}78${POST}`);

  // 2.3 Right partial overlapping
  testResult = styleToggler(`0123${PRE}456${POST}78`, 2, 4 + PRE_LEN, PRE, POST);
  expect(testResult).toStrictEqual(`01${PRE}23456${POST}78`);

  // 2.4 A small bold in the middle
  testResult = styleToggler(`012${PRE}3${POST}45678`, 2, 4 + PRE_LEN + POST_LEN, PRE, POST);
  expect(testResult).toStrictEqual(`01${PRE}234${POST}5678`);

  // 2.5 Left & right partial overlapping
  testResult = styleToggler(`01${PRE}23${POST}45${PRE}67${POST}8`, 3 + PRE_LEN, 6 + PRE_LEN * 2 + POST_LEN, PRE, POST);
  expect(testResult).toStrictEqual(`01${PRE}234567${POST}8`);

  // 2.6 Left partial overlapping with a small bold in the middle
  testResult = styleToggler(`0${PRE}12${POST}3${PRE}4${POST}5678`, 2 + PRE_LEN, 5 + PRE_LEN * 2 + POST_LEN * 2, PRE, POST);
  expect(testResult).toStrictEqual(`0${PRE}12345${POST}678`);

  // 2.7 Right partial overlapping with a small bold in the middle
  testResult = styleToggler(`0123${PRE}4${POST}5${PRE}67${POST}8`, 3, 6 + PRE_LEN * 2 + POST_LEN, PRE, POST);
  expect(testResult).toStrictEqual(`012${PRE}34567${POST}8`);

  // 2.8 Left & right partial overlapping with a small bold in the middle
  testResult = styleToggler(`0${PRE}12${POST}3${PRE}4${POST}5${PRE}67${POST}8`, 2 + PRE_LEN, 6 + PRE_LEN * 3 + POST_LEN * 2, PRE, POST);
  expect(testResult).toStrictEqual(`0${PRE}1234567${POST}8`);

  // 2.8 Left & right partial overlapping with 2 small bolds in the middle
  testResult = styleToggler(`0${PRE}12${POST}3${PRE}4${POST}5${PRE}6${POST}7${PRE}89${POST}012345`, 2 + PRE_LEN, 8 + PRE_LEN * 4 + POST_LEN * 3, PRE, POST);
  expect(testResult).toStrictEqual(`0${PRE}123456789${POST}012345`);
});

// Toggle general test cases
test(`Toggle bold, italic, underline, strikethrough, link, math, code`, () => {
  let testResult;
  const PRE_LEN = stylerConst.PREFIX_LEN;
  const POST_LEN = stylerConst.POSTFIX_LEN;
  let POST, PRE;

  // 1. BOLD
  POST = stylerConst.POSTFIX_BOLD;
  PRE = stylerConst.PREFIX_BOLD;
  testResult = styleToggler(`0123${PRE}456${POST}789`, 4 + PRE_LEN, 6 + PRE_LEN, PRE, POST);
  expect(testResult).toStrictEqual(`0123456789`);

  // 2. ITALIC
  POST = stylerConst.POSTFIX_ITALIC;
  PRE = stylerConst.PREFIX_ITALIC;
  testResult = styleToggler(`0123${PRE}456${POST}789`, 4 + PRE_LEN, 6 + PRE_LEN, PRE, POST);
  expect(testResult).toStrictEqual(`0123456789`);

  // 3. UNDERLINE
  POST = stylerConst.POSTFIX_UNDERLINE;
  PRE = stylerConst.PREFIX_UNDERLINE;
  testResult = styleToggler(`0123${PRE}456${POST}789`, 4 + PRE_LEN, 6 + PRE_LEN, PRE, POST);
  expect(testResult).toStrictEqual(`0123456789`);

  // 4. STRIKETHROUGH
  POST = stylerConst.POSTFIX_STRIKETHROUGH;
  PRE = stylerConst.PREFIX_STRIKETHROUGH;
  testResult = styleToggler(`0123${PRE}456${POST}789`, 4 + PRE_LEN, 6 + PRE_LEN, PRE, POST);
  expect(testResult).toStrictEqual(`0123456789`);

  // 5. LINK
  POST = stylerConst.POSTFIX_LINK;
  PRE = stylerConst.PREFIX_LINK;
  testResult = styleToggler(`0123${PRE}456${POST}789`, 4 + PRE_LEN, 6 + PRE_LEN, PRE, POST);
  expect(testResult).toStrictEqual(`0123456789`);

  // 6. MATH
  POST = stylerConst.POSTFIX_MATH;
  PRE = stylerConst.PREFIX_MATH;
  testResult = styleToggler(`0123${PRE}456${POST}789`, 4 + PRE_LEN, 6 + PRE_LEN, PRE, POST);
  expect(testResult).toStrictEqual(`0123456789`);

  // 7. CODE
  POST = stylerConst.POSTFIX_CODE;
  PRE = stylerConst.PREFIX_CODE;
  testResult = styleToggler(`0123${PRE}456${POST}789`, 4 + PRE_LEN, 6 + PRE_LEN, PRE, POST);
  expect(testResult).toStrictEqual(`0123456789`);
});

// Test contentStyler
test('Test contentStyler', () => {
  let testResult;
  const PRE_LEN = stylerConst.PREFIX_LEN;
  const POST_LEN = stylerConst.POSTFIX_LEN;
  let POST, PRE;

  // 1. Color
  // 1.1 BLUE
  POST = stylerConst.POSTFIX_COLOR_BLUE;
  PRE = stylerConst.PREFIX_COLOR_BLUE;
  testResult = contentStyler(`0123${PRE}456${POST}789`, styleType.COLOR, 4 + PRE_LEN, 6 + PRE_LEN, colorConst.BLUE);
  expect(testResult).toStrictEqual(`0123456789`);

  // 1.2 BROWN
  POST = stylerConst.POSTFIX_COLOR_BROWN;
  PRE = stylerConst.PREFIX_COLOR_BROWN;
  testResult = contentStyler(`0123${PRE}456${POST}789`, styleType.COLOR, 4 + PRE_LEN, 6 + PRE_LEN, colorConst.BROWN);
  expect(testResult).toStrictEqual(`0123456789`);

  // 1.3 DEFAULT
  POST = stylerConst.POSTFIX_COLOR_DEFAULT;
  PRE = stylerConst.PREFIX_COLOR_DEFAULT;
  testResult = contentStyler(`0123${PRE}456${POST}789`, styleType.COLOR, 4 + PRE_LEN, 6 + PRE_LEN, colorConst.DEFAULT);
  expect(testResult).toStrictEqual(`0123456789`);

  // 1.4 GRAY
  POST = stylerConst.POSTFIX_COLOR_GRAY;
  PRE = stylerConst.PREFIX_COLOR_GRAY;
  testResult = contentStyler(`0123${PRE}456${POST}789`, styleType.COLOR, 4 + PRE_LEN, 6 + PRE_LEN, colorConst.GRAY);
  expect(testResult).toStrictEqual(`0123456789`);

  // 1.5 GREEN
  POST = stylerConst.POSTFIX_COLOR_GREEN;
  PRE = stylerConst.PREFIX_COLOR_GREEN;
  testResult = contentStyler(`0123${PRE}456${POST}789`, styleType.COLOR, 4 + PRE_LEN, 6 + PRE_LEN, colorConst.GREEN);
  expect(testResult).toStrictEqual(`0123456789`);

  // 1.6 ORANGE
  POST = stylerConst.POSTFIX_COLOR_ORANGE;
  PRE = stylerConst.PREFIX_COLOR_ORANGE;
  testResult = contentStyler(`0123${PRE}456${POST}789`, styleType.COLOR, 4 + PRE_LEN, 6 + PRE_LEN, colorConst.ORANGE);
  expect(testResult).toStrictEqual(`0123456789`);

  // 1.7 PINK
  POST = stylerConst.POSTFIX_COLOR_PINK;
  PRE = stylerConst.PREFIX_COLOR_PINK;
  testResult = contentStyler(`0123${PRE}456${POST}789`, styleType.COLOR, 4 + PRE_LEN, 6 + PRE_LEN, colorConst.PINK);
  expect(testResult).toStrictEqual(`0123456789`);

  // 1.8 PURPLE
  POST = stylerConst.POSTFIX_COLOR_PURPLE;
  PRE = stylerConst.PREFIX_COLOR_PURPLE;
  testResult = contentStyler(`0123${PRE}456${POST}789`, styleType.COLOR, 4 + PRE_LEN, 6 + PRE_LEN, colorConst.PURPLE);
  expect(testResult).toStrictEqual(`0123456789`);

  // 1.9 RED
  POST = stylerConst.POSTFIX_COLOR_RED;
  PRE = stylerConst.PREFIX_COLOR_RED;
  testResult = contentStyler(`0123${PRE}456${POST}789`, styleType.COLOR, 4 + PRE_LEN, 6 + PRE_LEN, colorConst.RED);
  expect(testResult).toStrictEqual(`0123456789`);

  // 1.10 YELLOW
  POST = stylerConst.POSTFIX_COLOR_YELLOW;
  PRE = stylerConst.PREFIX_COLOR_YELLOW;
  testResult = contentStyler(`0123${PRE}456${POST}789`, styleType.COLOR, 4 + PRE_LEN, 6 + PRE_LEN, colorConst.YELLOW);
  expect(testResult).toStrictEqual(`0123456789`);

  // 2. Background
  // 2.1 BLUE
  POST = stylerConst.POSTFIX_BACKGROUND_BLUE;
  PRE = stylerConst.PREFIX_BACKGROUND_BLUE;
  testResult = contentStyler(`0123${PRE}456${POST}789`, styleType.BACKGROUND, 4 + PRE_LEN, 6 + PRE_LEN, colorConst.BLUE);
  expect(testResult).toStrictEqual(`0123456789`);

  // 2.2 BROWN
  POST = stylerConst.POSTFIX_BACKGROUND_BROWN;
  PRE = stylerConst.PREFIX_BACKGROUND_BROWN;
  testResult = contentStyler(`0123${PRE}456${POST}789`, styleType.BACKGROUND, 4 + PRE_LEN, 6 + PRE_LEN, colorConst.BROWN);
  expect(testResult).toStrictEqual(`0123456789`);

  // 2.3 DEFAULT
  POST = stylerConst.POSTFIX_BACKGROUND_DEFAULT;
  PRE = stylerConst.PREFIX_BACKGROUND_DEFAULT;
  testResult = contentStyler(`0123${PRE}456${POST}789`, styleType.BACKGROUND, 4 + PRE_LEN, 6 + PRE_LEN, colorConst.DEFAULT);
  expect(testResult).toStrictEqual(`0123456789`);

  // 2.4 GRAY
  POST = stylerConst.POSTFIX_BACKGROUND_GRAY;
  PRE = stylerConst.PREFIX_BACKGROUND_GRAY;
  testResult = contentStyler(`0123${PRE}456${POST}789`, styleType.BACKGROUND, 4 + PRE_LEN, 6 + PRE_LEN, colorConst.GRAY);
  expect(testResult).toStrictEqual(`0123456789`);

  // 2.5 GREEN
  POST = stylerConst.POSTFIX_BACKGROUND_GREEN;
  PRE = stylerConst.PREFIX_BACKGROUND_GREEN;
  testResult = contentStyler(`0123${PRE}456${POST}789`, styleType.BACKGROUND, 4 + PRE_LEN, 6 + PRE_LEN, colorConst.GREEN);
  expect(testResult).toStrictEqual(`0123456789`);

  // 2.6 ORANGE
  POST = stylerConst.POSTFIX_BACKGROUND_ORANGE;
  PRE = stylerConst.PREFIX_BACKGROUND_ORANGE;
  testResult = contentStyler(`0123${PRE}456${POST}789`, styleType.BACKGROUND, 4 + PRE_LEN, 6 + PRE_LEN, colorConst.ORANGE);
  expect(testResult).toStrictEqual(`0123456789`);

  // 2.7 PINK
  POST = stylerConst.POSTFIX_BACKGROUND_PINK;
  PRE = stylerConst.PREFIX_BACKGROUND_PINK;
  testResult = contentStyler(`0123${PRE}456${POST}789`, styleType.BACKGROUND, 4 + PRE_LEN, 6 + PRE_LEN, colorConst.PINK);
  expect(testResult).toStrictEqual(`0123456789`);

  // 2.8 PURPLE
  POST = stylerConst.POSTFIX_BACKGROUND_PURPLE;
  PRE = stylerConst.PREFIX_BACKGROUND_PURPLE;
  testResult = contentStyler(`0123${PRE}456${POST}789`, styleType.BACKGROUND, 4 + PRE_LEN, 6 + PRE_LEN, colorConst.PURPLE);
  expect(testResult).toStrictEqual(`0123456789`);

  // 2.9 RED
  POST = stylerConst.POSTFIX_BACKGROUND_RED;
  PRE = stylerConst.PREFIX_BACKGROUND_RED;
  testResult = contentStyler(`0123${PRE}456${POST}789`, styleType.BACKGROUND, 4 + PRE_LEN, 6 + PRE_LEN, colorConst.RED);
  expect(testResult).toStrictEqual(`0123456789`);

  // 2.10 YELLOW
  POST = stylerConst.POSTFIX_BACKGROUND_YELLOW;
  PRE = stylerConst.PREFIX_BACKGROUND_YELLOW;
  testResult = contentStyler(`0123${PRE}456${POST}789`, styleType.BACKGROUND, 4 + PRE_LEN, 6 + PRE_LEN, colorConst.YELLOW);
  expect(testResult).toStrictEqual(`0123456789`);
});
