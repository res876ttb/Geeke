/**
 * @file editor.test.js
 * @description Test editor reducer
 */

/*************************************************
 * IMPORT LIBRARIES
 *************************************************/

/*************************************************
 * FUNCTIONS TO TEST
 *************************************************/
import * as redux from 'react-redux';

/*************************************************
 * REDUX REDUCER
 *************************************************/
import {_updateContent} from '../states/editor';

/*************************************************
 * TEST CODE
 *************************************************/

// Test _updateContent
test('Test addPage', () => {
  const content = '321';
  const blockUuid = '123';

  let state = {
    cachedBlock: {},
    dirtyItem: [],
  };

  state.cachedBlock[blockUuid] = {
    uuid: blockUuid,
    content: 'test',
  };

  _updateContent(action => {
    state = action.callback(state);
    expect(state.cachedBlock[blockUuid].content).toStrictEqual(content);
  }, blockUuid, content);
});