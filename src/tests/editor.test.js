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
  _parseBlockParents,
} from '../states/editor';

/*************************************************
 * TEST CODE
 *************************************************/
const run = (state, testFunc, args, callback) => {
  testFunc(action => {
    state = action.callback(state);
    callback(state);
  }, ...args);
};

describe('Test _updateContent', () => {
  test('Change content', () => {
    const content = '1';
    const blockUuid = '2';
    let state = getInitState();

    state.cachedBlocks[blockUuid] = getNewBlock();
    state.cachedBlocks[blockUuid].content = content;
    state.cachedBlocks[blockUuid].uuid = blockUuid;

    run(state, _updateContent, [blockUuid, content], state => {
      expect(state.cachedBlocks[blockUuid].content).toStrictEqual(content);
    });
  });
});

describe('Test _setSavintState', () => {
  test('Change saving setting', () => {
    let state = getInitState();

    state.editorState.saving = false;

    run(state, _setSavintState, [true], state => {
      expect(state.editorState.saving).toBeTruthy();
    });
  });
});

describe('Test _addPage', () => {
  test('Add a page to root', () => {
    let state = getInitState();
    const pageUuid = '1';
    const blockUuid = '2';
    const parentUuid = null;

    run(state, _addPage, [pageUuid, blockUuid, parentUuid], state => {
      expect(state.cachedPages[pageUuid].uuid).toEqual(pageUuid);
      expect(state.cachedBlocks[blockUuid].uuid).toEqual(blockUuid);
      expect(state.pageTree.root[pageUuid]).not.toBeUndefined();
    });
  });

  test('Add a page to another page', () => {
    let state = getInitState();
    const pageUuid1 = '1';
    const pageUuid2 = '2';
    const blockUuid1 = '3';
    const blockUuid2 = '4';

    run(state, _addPage, [pageUuid1, blockUuid1, null], state => {
    run(state, _addPage, [pageUuid2, blockUuid2, pageUuid1], state => {
      expect(state.cachedPages[pageUuid2].uuid).toEqual(pageUuid2);
      expect(state.cachedBlocks[blockUuid2].uuid).toEqual(blockUuid2);
      expect(state.pageTree.root[pageUuid1][pageUuid2]).not.toBeUndefined();  
    })});
  });
});

describe('Test _updatePageTitle', () => {
  test('Change title', () => {
    let state = getInitState();
    const pageUuid = '1';
    const blockUuid = '2';
    const newTitle = 'Regression test';

    run(state, _addPage, [pageUuid, blockUuid, null], state => {
    run(state, _updatePageTitle, [pageUuid, newTitle], state => {
      expect(state.cachedPages[pageUuid].title).toEqual(newTitle);
    })});
  });
});

describe('Test _addBlock', () => {
  test('Add a block under a page', () => {
    let state = getInitState();
    const pageUuid = '1';
    const blockUuid = '2';
    const newUuid = '3';

    run(state, _addPage, [pageUuid, blockUuid, null], state => {
    run(state, _addBlock, [pageUuid, blockUuid, newUuid], state => {
      expect(state.cachedBlocks[newUuid]).not.toBeUndefined();
      expect(state.cachedPages[pageUuid].blocks.indexOf(blockUuid)).toBe(0);
      expect(state.cachedPages[pageUuid].blocks.indexOf(newUuid)).toBe(1);
    })});
  });

  test('Add a block under another block', () => {
    let state = getInitState();
    const pageUuid = '1';
    const blockUuid = '2';
    const newUuid = '3';

    run(state, _addPage, [pageUuid, blockUuid, null], state => {
    run(state, _addBlock, [blockUuid, null, newUuid], state => {
      expect(state.cachedBlocks[newUuid]).not.toBeUndefined();
      expect(state.cachedPages[pageUuid].blocks.indexOf(blockUuid)).toBe(0);
      expect(state.cachedPages[pageUuid].blocks.indexOf(newUuid)).toBe(-1);
      expect(state.cachedBlocks[blockUuid].blocks.indexOf(newUuid)).toBe(0);
    })});
  });

  test('Add a block in the middle of blocks', () => {
    let state = getInitState();
    const pageUuid = '1';
    const blockUuid1 = '2';
    const blockUuid2 = '3';
    const newUuid = '4';

    run(state, _addPage, [pageUuid, blockUuid1, null], state => {
    run(state, _addBlock, [pageUuid, blockUuid1, blockUuid2], state => {
    run(state, _addBlock, [pageUuid, blockUuid1, newUuid], state => {
      expect(state.cachedBlocks[newUuid]).not.toBeUndefined();
      expect(state.cachedPages[pageUuid].blocks.indexOf(blockUuid1)).toBe(0);
      expect(state.cachedPages[pageUuid].blocks.indexOf(blockUuid2)).toBe(2);
      expect(state.cachedPages[pageUuid].blocks.indexOf(newUuid)).toBe(1);
    })})});
  });
});

describe('Parse blocks parents', () => {
  test('1 level', () => {
    let state = getInitState();
    const pageUuid = '1';
    const blockUuid1 = '2';
    const blockUuid2 = '3';
    const blockUuid3 = '4';

    run(state, _addPage, [pageUuid, blockUuid1, null], state => {
    run(state, _addBlock, [pageUuid, blockUuid1, blockUuid2], state => {
    run(state, _addBlock, [pageUuid, blockUuid2, blockUuid3], state => {
    run(state, _parseBlockParents, [pageUuid], state => {
      /**
       * root
       * > 1
       * > 2
       * > 3
       */
      expect(state.blockParents[blockUuid1]).toBe(pageUuid);
      expect(state.blockParents[blockUuid2]).toBe(pageUuid);
      expect(state.blockParents[blockUuid3]).toBe(pageUuid);
    })})})});
  });

  test('Multiple levels', () => {
    let state = getInitState();
    const pageUuid = '1';
    const blockUuid1 = '2';
    const blockUuid2 = '3';
    const blockUuid3 = '4';
    const blockUuid4 = '5';
    const blockUuid5 = '6';
    const blockUuid6 = '7';

    run(state, _addPage, [pageUuid, blockUuid1, null], state => {
    run(state, _addBlock, [pageUuid, blockUuid1, blockUuid2], state => {
    run(state, _addBlock, [blockUuid2, null, blockUuid3], state => {
    run(state, _addBlock, [blockUuid3, null, blockUuid4], state => {
    run(state, _addBlock, [blockUuid2, blockUuid3, blockUuid5], state => {
    run(state, _addBlock, [blockUuid5, null, blockUuid6], state => {
    run(state, _parseBlockParents, [pageUuid], state => {
      /**
       * root
       * > 1
       * > 2
       *   > 3
       *     > 4
       *   > 5
       *     > 6
       */
      expect(state.blockParents[blockUuid1]).toBe(pageUuid);
      expect(state.blockParents[blockUuid2]).toBe(pageUuid);
      expect(state.blockParents[blockUuid3]).toBe(blockUuid2);
      expect(state.blockParents[blockUuid4]).toBe(blockUuid3);
      expect(state.blockParents[blockUuid5]).toBe(blockUuid2);
      expect(state.blockParents[blockUuid6]).toBe(blockUuid5);
    })})})})})})});
  });
});