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

/*************************************************
 * REDUX REDUCER
 *************************************************/
import {
  getInitState,
  getNewBlock,
  _updateContent,
  _updatePageTitle,
  _setSavintState,
  _addPage,
  _addBlock,
} from '../states/editor';

/*************************************************
 * TEST CODE
 *************************************************/

describe('Test _updateContent', () => {
  test('Change content', () => {
    const content = '1';
    const blockUuid = '2';
    let state = getInitState();

    state.cachedBlocks[blockUuid] = getNewBlock();
    state.cachedBlocks[blockUuid].content = content;
    state.cachedBlocks[blockUuid].uuid = blockUuid;

    _updateContent(action => {
      state = action.callback(state);
      expect(state.cachedBlocks[blockUuid].content).toStrictEqual(content);
    }, blockUuid, content);
  });
});

describe('Test _setSavintState', () => {
  test('Change saving setting', () => {
    let state = getInitState();

    state.editorState.saving = false;

    _setSavintState(action => {
      state = action.callback(state);
      expect(state.editorState.saving).toBeTruthy();
    }, true);
  });
});

describe('Test _addPage', () => {
  test('Add a page to root', () => {
    let state = getInitState();
    const pageUuid = '1';
    const blockUuid = '2';
    const parentUuid = null;

    _addPage(action => {
      state = action.callback(state);
      expect(state.cachedPages[pageUuid].uuid).toEqual(pageUuid);
      expect(state.cachedBlocks[blockUuid].uuid).toEqual(blockUuid);
      expect(state.pageTree.root[pageUuid]).not.toBeUndefined();
    }, pageUuid, blockUuid, parentUuid);
  });

  test('Add a page to another page', () => {
    let state = getInitState();
    const pageUuid1 = '1';
    const pageUuid2 = '2';
    const blockUuid1 = '3';
    const blockUuid2 = '4';

    _addPage(action1 => {
      state = action1.callback(state);
      _addPage(action => {
        state = action.callback(state);
        expect(state.cachedPages[pageUuid2].uuid).toEqual(pageUuid2);
        expect(state.cachedBlocks[blockUuid2].uuid).toEqual(blockUuid2);
        expect(state.pageTree.root[pageUuid1][pageUuid2]).not.toBeUndefined();
      }, pageUuid2, blockUuid2, pageUuid1);
    }, pageUuid1, blockUuid1, null);
  });
});

describe('Test _updatePageTitle', () => {
  test('Change title', () => {
    let state = getInitState();
    const pageUuid = '1';
    const blockUuid = '2';
    const newTitle = 'Regression test';

    _addPage(action1 => {
      state = action1.callback(state);
      _updatePageTitle(action2 => {
        state = action2.callback(state);
        expect(state.cachedPages[pageUuid].title).toEqual(newTitle);
      }, pageUuid, newTitle);
    }, pageUuid, blockUuid, null);
  });
});

describe('Test _addBlock', () => {
  test('Add a block under a page', () => {
    let state = getInitState();
    const pageUuid = '1';
    const blockUuid = '2';
    const newUuid = '3';

    _addPage(action1 => {
      state = action1.callback(state);
      _addBlock(action2 => {
        state = action2.callback(state);
        expect(state.cachedBlocks[newUuid]).not.toBeUndefined();
        expect(state.cachedPages[pageUuid].blocks.indexOf(blockUuid)).toBe(0);
        expect(state.cachedPages[pageUuid].blocks.indexOf(newUuid)).toBe(1);
      }, pageUuid, blockUuid, newUuid);
    }, pageUuid, blockUuid, null);
  });

  test('Add a block under another block', () => {
    let state = getInitState();
    const pageUuid = '1';
    const blockUuid = '2';
    const newUuid = '3';

    _addPage(action1 => {
      state = action1.callback(state);
      _addBlock(action2 => {
        state = action2.callback(state);
        expect(state.cachedBlocks[newUuid]).not.toBeUndefined();
        expect(state.cachedPages[pageUuid].blocks.indexOf(blockUuid)).toBe(0);
        expect(state.cachedPages[pageUuid].blocks.indexOf(newUuid)).toBe(-1);
        expect(state.cachedBlocks[blockUuid].blocks.indexOf(newUuid)).toBe(0);
      }, blockUuid, null, newUuid);
    }, pageUuid, blockUuid, null);
  });

  test('Add a block in the middle of blocks', () => {
    let state = getInitState();
    const pageUuid = '1';
    const blockUuid1 = '2';
    const blockUuid2 = '3';
    const newUuid = '4';

    _addPage(action1 => {
      state = action1.callback(state);
      _addBlock(action2 => {
        state = action2.callback(state);
        _addBlock(action3 => {
          state = action3.callback(state);
          expect(state.cachedBlocks[newUuid]).not.toBeUndefined();
          expect(state.cachedPages[pageUuid].blocks.indexOf(blockUuid1)).toBe(0);
          expect(state.cachedPages[pageUuid].blocks.indexOf(blockUuid2)).toBe(2);
          expect(state.cachedPages[pageUuid].blocks.indexOf(newUuid)).toBe(1);
        }, pageUuid, blockUuid1, newUuid);
      }, pageUuid, blockUuid1, blockUuid2);
    }, pageUuid, blockUuid1, null);
  });
});