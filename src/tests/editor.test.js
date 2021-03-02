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
  _setSavingState,
  _addPage,
  _addBlock,
  _parseBlockParents,
  _setFocusedBlock,
  getPreviousBlock,
  getNextBlock,
  _setMoreIndent,
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

const pageUuids = index => {
  return index.toString();
}

const blockUuids = index => {
  return (100 + index).toString();
}

describe('Test _updateContent', () => {
  test('Change content', () => {
    const content = '1';
    let state = getInitState();
    state.cachedBlocks[blockUuids(1)] = getNewBlock();
    state.cachedBlocks[blockUuids(1)].content = content;
    state.cachedBlocks[blockUuids(1)].uuid = blockUuids(1);

    run(state, _updateContent, [blockUuids(1), content], state => {
      expect(state.cachedBlocks[blockUuids(1)].content).toStrictEqual(content);
    });
  });
});

describe('Test _setSavingState', () => {
  test('Change saving setting', () => {
    let state = getInitState();

    state.editorState.saving = false;

    run(state, _setSavingState, [true], state => {
      expect(state.editorState.saving).toBeTruthy();
    });
  });
});

describe('Test _addPage', () => {
  test('Add a page to root', () => {
    let state = getInitState();
    run(state, _addPage, [pageUuids(1), blockUuids(1), null], state => {
      expect(state.cachedPages[pageUuids(1)].uuid).toEqual(pageUuids(1));
      expect(state.cachedBlocks[blockUuids(1)].uuid).toEqual(blockUuids(1));
      expect(state.pageTree.root[pageUuids(1)]).not.toBeUndefined();
    });
  });

  test('Add a page to another page', () => {
    let state = getInitState();
    run(state, _addPage, [pageUuids(1), blockUuids(1), null], state => {
    run(state, _addPage, [pageUuids(2), blockUuids(2), pageUuids(1)], state => {
      expect(state.cachedPages[pageUuids(2)].uuid).toEqual(pageUuids(2));
      expect(state.cachedBlocks[blockUuids(2)].uuid).toEqual(blockUuids(2));
      expect(state.pageTree.root[pageUuids(1)][pageUuids(2)]).not.toBeUndefined();  
    })});
  });
});

describe('Test _updatePageTitle', () => {
  test('Change title', () => {
    let state = getInitState();
    const newTitle = 'Regression test';

    run(state, _addPage, [pageUuids(1), blockUuids(1), null], state => {
    run(state, _updatePageTitle, [pageUuids(1), newTitle], state => {
      expect(state.cachedPages[pageUuids(1)].title).toEqual(newTitle);
    })});
  });
});

describe('Test _addBlock', () => {
  test('Add a block under a page', () => {
    let state = getInitState();
    run(state, _addPage, [pageUuids(1), blockUuids(1), null], state => {
    run(state, _addBlock, [pageUuids(1), blockUuids(1), blockUuids(2)], state => {
      expect(state.cachedBlocks[blockUuids(2)]).not.toBeUndefined();
      expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(1))).toBe(0);
      expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(2))).toBe(1);
    })});
  });

  test('Add a block under another block', () => {
    let state = getInitState();
    run(state, _addPage, [pageUuids(1), blockUuids(1), null], state => {
    run(state, _addBlock, [blockUuids(1), null, blockUuids(2)], state => {
      expect(state.cachedBlocks[blockUuids(2)]).not.toBeUndefined();
      expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(1))).toBe(0);
      expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(2))).toBe(-1);
      expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(2))).toBe(0);
    })});
  });

  test('Add a block in the middle of blocks', () => {
    let state = getInitState();
    run(state, _addPage, [pageUuids(1), blockUuids(1), null], state => {
    run(state, _addBlock, [pageUuids(1), blockUuids(1), blockUuids(2)], state => {
    run(state, _addBlock, [pageUuids(1), blockUuids(1), blockUuids(3)], state => {
      expect(state.cachedBlocks[blockUuids(3)]).not.toBeUndefined();
      expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(1))).toBe(0);
      expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(2))).toBe(2);
      expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(3))).toBe(1);
    })})});
  });
});

describe('Parse blocks parents', () => {
  test('1 level', () => {
    let state = getInitState();
    run(state, _addPage, [pageUuids(1), blockUuids(1), null], state => {
    run(state, _addBlock, [pageUuids(1), blockUuids(1), blockUuids(2)], state => {
    run(state, _addBlock, [pageUuids(1), blockUuids(2), blockUuids(3)], state => {
    run(state, _parseBlockParents, [pageUuids(1)], state => {
      /**
       * root
       * > 1
       * > 2
       * > 3
       */
      expect(state.blockParents[blockUuids(1)]).toBe(pageUuids(1));
      expect(state.blockParents[blockUuids(2)]).toBe(pageUuids(1));
      expect(state.blockParents[blockUuids(3)]).toBe(pageUuids(1));
    })})})});
  });

  test('Multiple levels', () => {
    let state = getInitState();
    run(state, _addPage, [pageUuids(1), blockUuids(1), null], state => {
    run(state, _addBlock, [pageUuids(1), blockUuids(1), blockUuids(2)], state => {
    run(state, _addBlock, [blockUuids(2), null, blockUuids(3)], state => {
    run(state, _addBlock, [blockUuids(3), null, blockUuids(4)], state => {
    run(state, _addBlock, [blockUuids(2), blockUuids(3), blockUuids(5)], state => {
    run(state, _addBlock, [blockUuids(5), null, blockUuids(6)], state => {
    run(state, _parseBlockParents, [pageUuids(1)], state => {
      /**
       * root
       * > 1
       * > 2
       *   > 3
       *     > 4
       *   > 5
       *     > 6
       */
      expect(state.blockParents[blockUuids(1)]).toBe(pageUuids(1));
      expect(state.blockParents[blockUuids(2)]).toBe(pageUuids(1));
      expect(state.blockParents[blockUuids(3)]).toBe(blockUuids(2));
      expect(state.blockParents[blockUuids(4)]).toBe(blockUuids(3));
      expect(state.blockParents[blockUuids(5)]).toBe(blockUuids(2));
      expect(state.blockParents[blockUuids(6)]).toBe(blockUuids(5));
    })})})})})})});
  });
});

describe('Test setFocusedBlock', () => {
  test('Test setFocusedBlock', () => {
    let state = getInitState();
    
    run(state, _setFocusedBlock, [pageUuids(1), blockUuids(1)], state => {
      expect(state.focusedBlock[pageUuids(1)]).toBe(blockUuids(1));
    });
  });
});

describe('Test getPreviousBlock', () => {
  test('Root page only', () => {
    let state = getInitState();
    run(state, _addPage, [pageUuids(1), blockUuids(1), null], state => {
    run(state, _addBlock, [pageUuids(1), blockUuids(1), blockUuids(2)], state => {
    run(state, _addBlock, [pageUuids(1), blockUuids(2), blockUuids(3)], state => {
    run(state, _parseBlockParents, [pageUuids(1)], state => {
      /**
       * root
       * > 1
       * > 2
       * > 3
       */
      expect(getPreviousBlock(state, pageUuids(1), blockUuids(1))).toBe(blockUuids(1));
      expect(getPreviousBlock(state, pageUuids(1), blockUuids(2))).toBe(blockUuids(1));
      expect(getPreviousBlock(state, pageUuids(1), blockUuids(3))).toBe(blockUuids(2));
    })})})});
  });

  test('Multiple layers', () => {
    let state = getInitState();
    run(state, _addPage, [pageUuids(1), blockUuids(1), null], state => {
    run(state, _addBlock, [blockUuids(1), null, blockUuids(2)], state => {
    run(state, _addBlock, [blockUuids(1), blockUuids(2), blockUuids(3)], state => {
    run(state, _addBlock, [blockUuids(2), null, blockUuids(4)], state => {
    run(state, _parseBlockParents, [pageUuids(1)], state => {
      /**
       * root
       * > 1
       *   > 2
       *     > 4
       *   > 3
       */
      expect(getPreviousBlock(state, pageUuids(1), blockUuids(1))).toBe(blockUuids(1));
      expect(getPreviousBlock(state, pageUuids(1), blockUuids(2))).toBe(blockUuids(1));
      expect(getPreviousBlock(state, pageUuids(1), blockUuids(3))).toBe(blockUuids(2));
      expect(getPreviousBlock(state, pageUuids(1), blockUuids(4))).toBe(blockUuids(2));
    })})})})});
  });
});

describe('Test getNextBlock', () => {
  test('Root page only', () => {
    let state = getInitState();
    run(state, _addPage, [pageUuids(1), blockUuids(1), null], state => {
    run(state, _addBlock, [pageUuids(1), blockUuids(1), blockUuids(2)], state => {
    run(state, _addBlock, [pageUuids(1), blockUuids(2), blockUuids(3)], state => {
    run(state, _parseBlockParents, [pageUuids(1)], state => {
      /**
       * root
       * > 1
       * > 2
       * > 3
       */
      expect(getNextBlock(state, pageUuids(1), blockUuids(1))).toBe(blockUuids(2));
      expect(getNextBlock(state, pageUuids(1), blockUuids(2))).toBe(blockUuids(3));
      expect(getNextBlock(state, pageUuids(1), blockUuids(3))).toBe(blockUuids(3));
    })})})});
  });

  test('Multiple layers: type general', () => {
    let state = getInitState();
    run(state, _addPage, [pageUuids(1), blockUuids(1), null], state => {
    run(state, _addBlock, [blockUuids(1), null, blockUuids(2)], state => {
    run(state, _addBlock, [blockUuids(2), null, blockUuids(3)], state => {
    run(state, _addBlock, [blockUuids(1), blockUuids(2), blockUuids(4)], state => {
    run(state, _addBlock, [blockUuids(1), blockUuids(4), blockUuids(5)], state => {
    run(state, _addBlock, [pageUuids(1), blockUuids(1), blockUuids(6)], state => {
    run(state, _parseBlockParents, [pageUuids(1)], state => {
      /**
       * root
       * > 1
       *   > 2
       *     > 3
       *   > 4
       *   > 5
       * > 6
       */
      expect(getNextBlock(state, pageUuids(1), blockUuids(1))).toBe(blockUuids(2));
      expect(getNextBlock(state, pageUuids(1), blockUuids(2))).toBe(blockUuids(3));
      expect(getNextBlock(state, pageUuids(1), blockUuids(3))).toBe(blockUuids(4));
      expect(getNextBlock(state, pageUuids(1), blockUuids(4))).toBe(blockUuids(5));
      expect(getNextBlock(state, pageUuids(1), blockUuids(5))).toBe(blockUuids(6));
      expect(getNextBlock(state, pageUuids(1), blockUuids(6))).toBe(blockUuids(6));
    })})})})})})});
  });

  test('Multiple layers: type skew', () => {
    let state = getInitState();
    run(state, _addPage, [pageUuids(1), blockUuids(1), null], state => {
    run(state, _addBlock, [blockUuids(1), null, blockUuids(2)], state => {
    run(state, _addBlock, [blockUuids(2), null, blockUuids(3)], state => {
    run(state, _addBlock, [pageUuids(1), blockUuids(1), blockUuids(4)], state => {
    run(state, _addBlock, [blockUuids(4), null, blockUuids(5)], state => {
    run(state, _addBlock, [blockUuids(5), null, blockUuids(6)], state => {
    run(state, _parseBlockParents, [pageUuids(1)], state => {
      /**
       * root
       * > 1
       *   > 2
       *     > 3
       * > 4
       *   > 5
       *     > 6
       */
      expect(getNextBlock(state, pageUuids(1), blockUuids(1))).toBe(blockUuids(2));
      expect(getNextBlock(state, pageUuids(1), blockUuids(2))).toBe(blockUuids(3));
      expect(getNextBlock(state, pageUuids(1), blockUuids(3))).toBe(blockUuids(4));
      expect(getNextBlock(state, pageUuids(1), blockUuids(4))).toBe(blockUuids(5));
      expect(getNextBlock(state, pageUuids(1), blockUuids(5))).toBe(blockUuids(6));
      expect(getNextBlock(state, pageUuids(1), blockUuids(6))).toBe(blockUuids(6));
    })})})})})})});
  });
});

describe('Indent block', () => {
  describe('More indent', () => {
    test('Indent block at root', () => {
      let state = getInitState();
      run(state, _addPage, [pageUuids(1), blockUuids(1), null], state => {
      run(state, _addBlock, [pageUuids(1), blockUuids(1), blockUuids(2)], state => {
      run(state, _addBlock, [pageUuids(1), blockUuids(2), blockUuids(3)], state => {
      run(state, _parseBlockParents, [pageUuids(1)], state => {
      run(state, _setMoreIndent, [pageUuids(1), [blockUuids(2)]], state => {
        /**
         * root
         * > 1
         * > 2
         * > 3
         * VVVV
         * root
         * > 1
         *   > 2
         * > 3
         */
        expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(1))).toBe(0);
        expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(2))).toBe(-1);
        expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(3))).toBe(1);
        expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(2))).toBe(0);
      })})})})});
    });

    test('Indent first block at root', () => {
      let state = getInitState();
      run(state, _addPage, [pageUuids(1), blockUuids(1), null], state => {
      run(state, _addBlock, [pageUuids(1), blockUuids(1), blockUuids(2)], state => {
      run(state, _addBlock, [pageUuids(1), blockUuids(2), blockUuids(3)], state => {
      run(state, _parseBlockParents, [pageUuids(1)], state => {
      run(state, _setMoreIndent, [pageUuids(1), [blockUuids(1)]], state => {
        /**
         * root
         * > 1
         * > 2
         * > 3
         * VVVV
         * root
         * > 1
         * > 2
         * > 3
         */
        expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(1))).toBe(0);
        expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(2))).toBe(1);
        expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(3))).toBe(2);
      })})})})});
    });

    test('Indent block with child at root', () => {
      let state = getInitState();
      run(state, _addPage, [pageUuids(1), blockUuids(1), null], state => {
      run(state, _addBlock, [pageUuids(1), blockUuids(1), blockUuids(2)], state => {
      run(state, _addBlock, [blockUuids(2), null, blockUuids(3)], state => {
      run(state, _parseBlockParents, [pageUuids(1)], state => {
      run(state, _setMoreIndent, [pageUuids(1), [blockUuids(2)]], state => {
        /**
         * root
         * > 1
         * > 2
         *   > 3
         * VVVV
         * root
         * > 1
         *   > 2
         *     > 3
         */
        expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(1))).toBe(0);
        expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(2))).toBe(-1);
        expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(2))).toBe(0);
        expect(state.cachedBlocks[blockUuids(2)].blocks.indexOf(blockUuids(3))).toBe(0);
      })})})})});
    });

    test('Indent block not at root', () => {
      let state = getInitState();
      run(state, _addPage, [pageUuids(1), blockUuids(1), null], state => {
      run(state, _addBlock, [blockUuids(1), null, blockUuids(2)], state => {
      run(state, _addBlock, [blockUuids(1), blockUuids(2), blockUuids(3)], state => {
      run(state, _addBlock, [blockUuids(1), blockUuids(3), blockUuids(4)], state => {
      run(state, _parseBlockParents, [pageUuids(1)], state => {
      run(state, _setMoreIndent, [pageUuids(1), [blockUuids(3)]], state => {
        /**
         * root
         * > 1
         *   > 2
         *   > 3
         *   > 4
         * VVVV
         * root
         * > 1
         *   > 2
         *     > 3
         *   > 4
         */
        expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(1))).toBe(0);
        expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(2))).toBe(-1);
        expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(2))).toBe(0);
        expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(3))).toBe(-1);
        expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(4))).toBe(1);
        expect(state.cachedBlocks[blockUuids(2)].blocks.indexOf(blockUuids(3))).toBe(0);
      })})})})})});
    });

    test('Indent first block not at root', () => {
      let state = getInitState();
      run(state, _addPage, [pageUuids(1), blockUuids(1), null], state => {
      run(state, _addBlock, [blockUuids(1), null, blockUuids(2)], state => {
      run(state, _addBlock, [blockUuids(1), blockUuids(2), blockUuids(3)], state => {
      run(state, _parseBlockParents, [pageUuids(1)], state => {
      run(state, _setMoreIndent, [pageUuids(1), [blockUuids(2)]], state => {
        /**
         * root
         * > 1
         *   > 2
         *   > 3
         * VVVV
         * root
         * > 1
         *   > 2
         *   > 3
         */
        expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(1))).toBe(0);
        expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(2))).toBe(0);
        expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(3))).toBe(1);
      })})})})});
    });

    test('Indent block with child not at root', () => {
      let state = getInitState();
      run(state, _addPage, [pageUuids(1), blockUuids(1), null], state => {
      run(state, _addBlock, [blockUuids(1), null, blockUuids(2)], state => {
      run(state, _addBlock, [blockUuids(1), blockUuids(2), blockUuids(3)], state => {
      run(state, _addBlock, [blockUuids(3), null, blockUuids(4)], state => {
      run(state, _parseBlockParents, [pageUuids(1)], state => {
      run(state, _setMoreIndent, [pageUuids(1), [blockUuids(3)]], state => {
        /**
         * root
         * > 1
         *   > 2
         *   > 3
         *     > 4
         * VVVV
         * root
         * > 1
         *   > 2
         *     > 3
         *       > 4
         */
        expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(1))).toBe(0);
        expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(2))).toBe(0);
        expect(state.cachedBlocks[blockUuids(2)].blocks.indexOf(blockUuids(3))).toBe(0);
        expect(state.cachedBlocks[blockUuids(3)].blocks.indexOf(blockUuids(4))).toBe(0);
      })})})})})});
    });

    test('Indent block with multiple blocks, type 1', () => {
      let state = getInitState();
      run(state, _addPage, [pageUuids(1), blockUuids(1), null], state => {
      run(state, _addBlock, [blockUuids(1), null, blockUuids(2)], state => {
      run(state, _addBlock, [blockUuids(1), blockUuids(2), blockUuids(3)], state => {
      run(state, _addBlock, [blockUuids(3), null, blockUuids(4)], state => {
      run(state, _parseBlockParents, [pageUuids(1)], state => {
      run(state, _setMoreIndent, [pageUuids(1), [blockUuids(1), blockUuids(2), blockUuids(3), blockUuids(4)]], state => {
        /**
         * root
         * > 1
         *   > 2
         *   > 3
         *     > 4
         * VVVV
         * root
         * > 1
         *   > 2
         *     > 3
         *       > 4
         */
        expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(1))).toBe(0);
        expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(2))).toBe(0);
        expect(state.cachedBlocks[blockUuids(2)].blocks.indexOf(blockUuids(3))).toBe(0);
        expect(state.cachedBlocks[blockUuids(3)].blocks.indexOf(blockUuids(4))).toBe(0);
      })})})})})});
    });

    test('Indent block with multiple blocks, type 2', () => {
      let state = getInitState();
      run(state, _addPage, [pageUuids(1), blockUuids(1), null], state => {
      run(state, _addBlock, [pageUuids(1), blockUuids(1), blockUuids(2)], state => {
      run(state, _addBlock, [pageUuids(1), blockUuids(2), blockUuids(3)], state => {
      run(state, _addBlock, [blockUuids(3), null, blockUuids(4)], state => {
      run(state, _parseBlockParents, [pageUuids(1)], state => {
      run(state, _setMoreIndent, [pageUuids(1), [blockUuids(2), blockUuids(3), blockUuids(4)]], state => {
        /**
         * root
         * > 1
         * > 2
         * > 3
         *   > 4
         * VVVV
         * root
         * > 1
         *   > 2
         *   > 3
         *     > 4
         */
        expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(1))).toBe(0);
        expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(2))).toBe(0);
        expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(3))).toBe(1);
        expect(state.cachedBlocks[blockUuids(3)].blocks.indexOf(blockUuids(4))).toBe(0);
      })})})})})});
    });
  });
});