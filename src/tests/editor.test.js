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
  _setLessIndent,
  _moveBlocks,
  _deleteBlocks,
  _selectBlock,
  _enterSelectionMode,
  selectDirection,
} from '../states/editor';

/*************************************************
 * TEST HELPER FUNCTION
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

const createPageWithBlocks = (state, pageUuid, blockStructure, callback) => {
  const gvbi = (obj, i) => obj[Object.keys(obj)[i]]; // get value by index
  const gkbi = (obj, i) => Object.keys(obj)[i];      // get key by index
  const gl = obj => Object.keys(obj).length;         // get length

  const createBlockUnderBlock = (i, state, parentUuid, partialStructure, callback) => {
    if (i >= gl(partialStructure)) {
      callback(state);
      return;
    }

    run(state, _addBlock, [parentUuid, i === 0 ? null : gkbi(partialStructure, i - 1), gkbi(partialStructure, i)], state => {
      createBlockUnderBlock(0, state, gkbi(partialStructure, i), gvbi(partialStructure, i), state => {
        createBlockUnderBlock(i + 1, state, parentUuid, partialStructure, callback);
      });
    })
  };

  const createBlockAtRoot = (i, state, callback) => {
    if (i >= gl(blockStructure)) {
      callback(state);
      return;
    }

    run(state, _addBlock, [pageUuid, gkbi(blockStructure, i - 1), gkbi(blockStructure, i)], state => {
      createBlockUnderBlock(0, state, gkbi(blockStructure, i), gvbi(blockStructure, i), state => {
        createBlockAtRoot(i + 1, state, callback);
      });
    });
  };

  run(state, _addPage, [pageUuid, gkbi(blockStructure, 0), null], state => {
    createBlockUnderBlock(0, state, gkbi(blockStructure, 0), gvbi(blockStructure, 0), state => {
      createBlockAtRoot(1, state, callback);
    });
  });
}

const createPageWithBlocksAndParseParent = (state, pageUuid, blockStructure, callback) => {
  createPageWithBlocks(state, pageUuid, blockStructure, state => {
    run(state, _parseBlockParents, [pageUuids(1)], state => {
      callback(state);
    })
  });
};

const blockUuids = index => {
  return (100 + index).toString();
}

/*************************************************
 * TEST CODE
 *************************************************/

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
    run(state, _addBlock, [blockUuids(1), null, blockUuids(3)], state => {
      expect(state.cachedBlocks[blockUuids(2)]).not.toBeUndefined();
      expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(1))).toBe(0);
      expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(2))).toBe(-1);
      expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(3))).toBe(0);
      expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(2))).toBe(1);
    })})});
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

describe('Test test helper function createPageWithBlocks', () => {
  test('Root page only', () => {
    createPageWithBlocks(getInitState(), pageUuids(1), {
      [blockUuids(1)]: {},
      [blockUuids(2)]: {},
      [blockUuids(3)]: {}
    }, state => {
      expect(state.cachedPages[pageUuids(1)].blocks.length).toBe(3);
      expect(state.cachedBlocks[blockUuids(1)]).not.toBe(undefined);
      expect(state.cachedBlocks[blockUuids(2)]).not.toBe(undefined);
      expect(state.cachedBlocks[blockUuids(3)]).not.toBe(undefined);
      expect(state.cachedPages[pageUuids(1)].blocks[0]).toBe(blockUuids(1));
      expect(state.cachedPages[pageUuids(1)].blocks[1]).toBe(blockUuids(2));
      expect(state.cachedPages[pageUuids(1)].blocks[2]).toBe(blockUuids(3));
    });
  });

  test('2 levels page', () => {
    createPageWithBlocks(getInitState(), pageUuids(1), {
      [blockUuids(1)]: {
        [blockUuids(2)]: {}
      },
      [blockUuids(3)]: {}
    }, state => {
      expect(state.cachedPages[pageUuids(1)].blocks.length).toBe(2);
      expect(state.cachedBlocks[blockUuids(1)]).not.toBe(undefined);
      expect(state.cachedBlocks[blockUuids(2)]).not.toBe(undefined);
      expect(state.cachedBlocks[blockUuids(3)]).not.toBe(undefined);
      expect(state.cachedPages[pageUuids(1)].blocks[0]).toBe(blockUuids(1));
      expect(state.cachedPages[pageUuids(1)].blocks[1]).toBe(blockUuids(3));
      expect(state.cachedBlocks[blockUuids(1)].blocks[0]).toBe(blockUuids(2));
    });
  });

  test('3 levels page', () => {
    createPageWithBlocks(getInitState(), pageUuids(1), {
      [blockUuids(1)]: {
        [blockUuids(2)]: {
          [blockUuids(3)]: {}
        },
      },
      [blockUuids(4)]: {},
    }, state => {
      expect(state.cachedPages[pageUuids(1)].blocks.length).toBe(2);
      expect(state.cachedBlocks[blockUuids(1)]).not.toBe(undefined);
      expect(state.cachedBlocks[blockUuids(2)]).not.toBe(undefined);
      expect(state.cachedBlocks[blockUuids(3)]).not.toBe(undefined);
      expect(state.cachedBlocks[blockUuids(4)]).not.toBe(undefined);
      expect(state.cachedPages[pageUuids(1)].blocks[0]).toBe(blockUuids(1));
      expect(state.cachedPages[pageUuids(1)].blocks[1]).toBe(blockUuids(4));
      expect(state.cachedBlocks[blockUuids(1)].blocks[0]).toBe(blockUuids(2));
      expect(state.cachedBlocks[blockUuids(2)].blocks[0]).toBe(blockUuids(3));
    });
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

describe('Parse blocks parents', () => {
  test('1 level', () => {
    createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
      [blockUuids(1)]: {},
      [blockUuids(2)]: {},
      [blockUuids(3)]: {},
    }, state => {
      /**
       * root
       * > 1
       * > 2
       * > 3
       */
      expect(state.blockParents[blockUuids(1)]).toBe(pageUuids(1));
      expect(state.blockParents[blockUuids(2)]).toBe(pageUuids(1));
      expect(state.blockParents[blockUuids(3)]).toBe(pageUuids(1));
    });
  });

  test('Multiple levels', () => {
    createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
      [blockUuids(1)]: {},
      [blockUuids(2)]: {
        [blockUuids(3)]: {
          [blockUuids(4)]: {},
        },
        [blockUuids(5)]: {
          [blockUuids(6)]: {},
        },
      },
    }, state => {
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
    });
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
    createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
      [blockUuids(1)]: {},
      [blockUuids(2)]: {},
      [blockUuids(3)]: {},
    }, state => {
      /**
       * root
       * > 1
       * > 2
       * > 3
       */
      expect(getPreviousBlock(state, pageUuids(1), blockUuids(1))).toBe(blockUuids(1));
      expect(getPreviousBlock(state, pageUuids(1), blockUuids(2))).toBe(blockUuids(1));
      expect(getPreviousBlock(state, pageUuids(1), blockUuids(3))).toBe(blockUuids(2));
    });
  });

  test('Multiple layers', () => {
    createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
      [blockUuids(1)]: {
        [blockUuids(2)]: {
          [blockUuids(4)]: {},
        },
        [blockUuids(3)]: {},
      },
    }, state => {
      /**
       * root
       * > 1
       *   > 2
       *     > 4
       *   > 3
       */
      expect(getPreviousBlock(state, pageUuids(1), blockUuids(1))).toBe(blockUuids(1));
      expect(getPreviousBlock(state, pageUuids(1), blockUuids(2))).toBe(blockUuids(1));
      expect(getPreviousBlock(state, pageUuids(1), blockUuids(3))).toBe(blockUuids(4));
      expect(getPreviousBlock(state, pageUuids(1), blockUuids(4))).toBe(blockUuids(2));
    });
  });
});

describe('Test getNextBlock', () => {
  test('Root page only', () => {
    createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
      [blockUuids(1)]: {},
      [blockUuids(2)]: {},
      [blockUuids(3)]: {},
    }, state => {
      /**
       * root
       * > 1
       * > 2
       * > 3
       */
      expect(getNextBlock(state, pageUuids(1), blockUuids(1))).toBe(blockUuids(2));
      expect(getNextBlock(state, pageUuids(1), blockUuids(2))).toBe(blockUuids(3));
      expect(getNextBlock(state, pageUuids(1), blockUuids(3))).toBe(blockUuids(3));
    });
  });

  test('Multiple layers: type general', () => {
    createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
      [blockUuids(1)]: {
        [blockUuids(2)]: {
          [blockUuids(3)]: {},
        },
        [blockUuids(4)]: {},
        [blockUuids(5)]: {},
      },
      [blockUuids(6)]: {},
    }, state => {
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
    });
  });

  test('Multiple layers: type skew', () => {
    createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
      [blockUuids(1)]: {
        [blockUuids(2)]: {
          [blockUuids(3)]: {},
        },
      },
      [blockUuids(4)]: {
        [blockUuids(5)]: {
          [blockUuids(6)]: {},
        },
      },
    }, state => {
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
    });
  });
});

describe('Indent block', () => {
  describe('More indent', () => {
    test('Indent block at root', () => {
      createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
        [blockUuids(1)]: {},
        [blockUuids(2)]: {},
        [blockUuids(3)]: {},
      }, state => {
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
      })});
    });

    test('Indent first block at root', () => {
      createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
        [blockUuids(1)]: {},
        [blockUuids(2)]: {},
        [blockUuids(3)]: {},
      }, state => {
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
      })});
    });

    test('Indent block with child at root', () => {
      createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
        [blockUuids(1)]: {},
        [blockUuids(2)]: {
          [blockUuids(3)]: {},
        },
      }, state => {
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
      })});
    });

    test('Indent block not at root', () => {
      createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
        [blockUuids(1)]: {
          [blockUuids(2)]: {},
          [blockUuids(3)]: {},
          [blockUuids(4)]: {},
        },
      }, state => {
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
      })});
    });

    test('Indent first block not at root', () => {
      createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
        [blockUuids(1)]: {
          [blockUuids(2)]: {},
          [blockUuids(3)]: {},
        },
      }, state => {
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
      })});
    });

    test('Indent block with child not at root', () => {
      createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
        [blockUuids(1)]: {
          [blockUuids(2)]: {},
          [blockUuids(3)]: {
            [blockUuids(4)]: {},
          },
        },
      }, state => {
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
      })});
    });

    test('Indent block with multiple blocks, type 1', () => {
      createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
        [blockUuids(1)]: {
          [blockUuids(2)]: {},
          [blockUuids(3)]: {
            [blockUuids(4)]: {},
          },
        },
      }, state => {
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
      })});
    });

    test('Indent block with multiple blocks, type 2', () => {
      createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
        [blockUuids(1)]: {},
        [blockUuids(2)]: {},
        [blockUuids(3)]: {},
        [blockUuids(4)]: {
          [blockUuids(5)]: {},
        },
      }, state => {
      run(state, _setMoreIndent, [pageUuids(1), [blockUuids(2), blockUuids(3)]], state => {
        /**
         * root
         * > 1
         * > 2
         * > 3
         * > 4
         *   > 5
         * VVVV
         * root
         * > 1
         *   > 2
         *   > 3
         * > 4
         *   > 5
         */
        expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(1))).toBe(0);
        expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(2))).toBe(0);
        expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(3))).toBe(1);
        expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(4))).toBe(1);
        expect(state.cachedBlocks[blockUuids(4)].blocks.indexOf(blockUuids(5))).toBe(0);
      })});
    });
  });

  describe('Less indent', () => {
    test('Indent block to root type 1', () => {
      createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
        [blockUuids(1)]: {
          [blockUuids(2)]: {},
          [blockUuids(3)]: {},
          [blockUuids(4)]: {},
        },
      }, state => {
      run(state, _setLessIndent, [pageUuids(1), [blockUuids(4)]], state => {
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
         *   > 3
         * > 4
         */
        expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(1))).toBe(0);
        expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(2))).toBe(-1);
        expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(3))).toBe(-1);
        expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(4))).toBe(1);
        expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(2))).toBe(0);
        expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(3))).toBe(1);
      })});
    });

    test('Indent block to root type 2', () => {
      createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
        [blockUuids(1)]: {
          [blockUuids(2)]: {},
          [blockUuids(3)]: {},
          [blockUuids(4)]: {},
        },
      }, state => {
      run(state, _setLessIndent, [pageUuids(1), [blockUuids(3)]], state => {
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
         * > 3
         *   > 4
         */
        expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(1))).toBe(0);
        expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(2))).toBe(-1);
        expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(3))).toBe(1);
        expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(4))).toBe(-1);
        expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(2))).toBe(0);
        expect(state.cachedBlocks[blockUuids(3)].blocks.indexOf(blockUuids(4))).toBe(0);
      })});
    });

    test('Indent first block at root', () => {
      createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
        [blockUuids(1)]: {
          [blockUuids(2)]: {},
          [blockUuids(3)]: {},
        },
      }, state => {
      run(state, _setLessIndent, [pageUuids(1), [blockUuids(1)]], state => {
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
      })});
    });

    test('Indent second block at root', () => {
      createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
        [blockUuids(1)]: {},
        [blockUuids(2)]: {
          [blockUuids(3)]: {},
        },
      }, state => {
      run(state, _setLessIndent, [pageUuids(1), [blockUuids(2)]], state => {
        /**
         * root
         * > 1
         * > 2
         *   > 3
         * VVVV
         * root
         * > 1
         * > 2
         *   > 3
         */
        expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(1))).toBe(0);
        expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(2))).toBe(1);
        expect(state.cachedBlocks[blockUuids(2)].blocks.indexOf(blockUuids(3))).toBe(0);
      })});
    });

    test('Indent block with child to root', () => {
      createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
        [blockUuids(1)]: {
          [blockUuids(2)]: {
            [blockUuids(3)]: {},
          },
        },
      }, state => {
      run(state, _setLessIndent, [pageUuids(1), [blockUuids(2)]], state => {
        /**
         * root
         * > 1
         *   > 2
         *     > 3
         * VVVV
         * root
         * > 1
         * > 2
         *   > 3
         */
        expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(1))).toBe(0);
        expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(2))).toBe(1);
        expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(2))).toBe(-1);
        expect(state.cachedBlocks[blockUuids(2)].blocks.indexOf(blockUuids(3))).toBe(0);
      })});
    });

    test('Indent block not at root', () => {
      createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
        [blockUuids(1)]: {
          [blockUuids(2)]: {
            [blockUuids(3)]: {},
          },
          [blockUuids(4)]: {},
        },
      }, state => {
      run(state, _setLessIndent, [pageUuids(1), [blockUuids(3)]], state => {
        /**
         * root
         * > 1
         *   > 2
         *     > 3
         *   > 4
         * VVVV
         * root
         * > 1
         *   > 2
         *   > 3
         *   > 4
         */
        expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(1))).toBe(0);
        expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(2))).toBe(0);
        expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(3))).toBe(1);
        expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(4))).toBe(2);
        expect(state.cachedBlocks[blockUuids(2)].blocks.indexOf(blockUuids(3))).toBe(-1);
      })});
    });

    test('Indent block with child not at root', () => {
      createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
        [blockUuids(1)]: {
          [blockUuids(2)]: {
            [blockUuids(3)]: {
              [blockUuids(4)]: {},
            },
            [blockUuids(5)]: {},
          },
        },
      }, state => {
      run(state, _setLessIndent, [pageUuids(1), [blockUuids(3)]], state => {
        /**
         * root
         * > 1
         *   > 2
         *     > 3
         *       > 4
         *     > 5
         * VVVV
         * root
         * > 1
         *   > 2
         *   > 3
         *     > 4
         *     > 5
         */
        expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(1))).toBe(0);
        expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(2))).toBe(0);
        expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(3))).toBe(1);
        expect(state.cachedBlocks[blockUuids(2)].blocks.indexOf(blockUuids(3))).toBe(-1);
        expect(state.cachedBlocks[blockUuids(2)].blocks.indexOf(blockUuids(5))).toBe(-1);
        expect(state.cachedBlocks[blockUuids(3)].blocks.indexOf(blockUuids(4))).toBe(0);
        expect(state.cachedBlocks[blockUuids(3)].blocks.indexOf(blockUuids(5))).toBe(1);
      })});
    });
  });
});

describe('Test move block', () => {
  test('Move to first (from root)', () => {
    createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
      [blockUuids(1)]: {},
      [blockUuids(2)]: {},
      [blockUuids(3)]: {},
    }, state => {
    run(state, _moveBlocks, [pageUuids(1), pageUuids(1), pageUuids(1), null, [blockUuids(2)]], state => {
    run(state, _moveBlocks, [pageUuids(1), pageUuids(1), pageUuids(1), null, [blockUuids(3)]], state => {
      expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(1))).toBe(2);
      expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(2))).toBe(1);
      expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(3))).toBe(0);
    })})});
  });

  test('Move to first (from non root)', () => {
    createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
      [blockUuids(1)]: {
        [blockUuids(2)]: {},
        [blockUuids(3)]: {},
      },
    }, state => {
    run(state, _moveBlocks, [pageUuids(1), pageUuids(1), blockUuids(1), null, [blockUuids(2)]], state => {
      expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(1))).toBe(1);
      expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(2))).toBe(0);
      expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(3))).toBe(0);
      expect(state.cachedBlocks[blockUuids(1)].blocks.length).toBe(1);
    })});
  });

  test('Move multiple blocks to first', () => {
    createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
      [blockUuids(1)]: {
        [blockUuids(2)]: {},
        [blockUuids(3)]: {
          [blockUuids(4)]: {},
          [blockUuids(5)]: {},
        },
      },
    }, state => {
    run(state, _moveBlocks, [pageUuids(1), blockUuids(1), blockUuids(3), null, [blockUuids(4), blockUuids(5)]], state => {
      expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(1))).toBe(0);
      expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(2))).toBe(2);
      expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(3))).toBe(3);
      expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(4))).toBe(0);
      expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(5))).toBe(1);
      expect(state.cachedBlocks[blockUuids(3)].blocks.length).toBe(0);
    })});
  });

  test('Move multiple blocks', () => {
    createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
      [blockUuids(1)]: {
        [blockUuids(2)]: {},
        [blockUuids(3)]: {
          [blockUuids(4)]: {},
          [blockUuids(5)]: {},
        },
      },
    }, state => {
    run(state, _moveBlocks, [pageUuids(1), blockUuids(1), blockUuids(3), blockUuids(2), [blockUuids(4), blockUuids(5)]], state => {
      expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(1))).toBe(0);
      expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(2))).toBe(0);
      expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(3))).toBe(3);
      expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(4))).toBe(1);
      expect(state.cachedBlocks[blockUuids(1)].blocks.indexOf(blockUuids(5))).toBe(2);
      expect(state.cachedBlocks[blockUuids(3)].blocks.length).toBe(0);
    })});
  });
});

describe('Test _deleteBlocks', () => {
  test('Delete root first', () => {
    createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
      [blockUuids(1)]: {},
      [blockUuids(2)]: {},
      [blockUuids(3)]: {},
    }, state => {
    run(state, _deleteBlocks, [pageUuids(1), pageUuids(1), [blockUuids(1)]], state => {
      expect(state.cachedPages[pageUuids(1)].blocks.length).toBe(2);
      expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(2))).toBe(0);
      expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(3))).toBe(1);
      expect(state.cachedBlocks[blockUuids(1)]).toBeUndefined();
    })});
  });

  test('Delete root non first', () => {
    createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
      [blockUuids(1)]: {},
      [blockUuids(2)]: {},
      [blockUuids(3)]: {},
    }, state => {
    run(state, _deleteBlocks, [pageUuids(1), pageUuids(1), [blockUuids(2)]], state => {
      expect(state.cachedPages[pageUuids(1)].blocks.length).toBe(2);
      expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(1))).toBe(0);
      expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(3))).toBe(1);
      expect(state.cachedBlocks[blockUuids(2)]).toBeUndefined();
    })});
  });

  test('Delete non root first', () => {
    createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
      [blockUuids(1)]: {},
      [blockUuids(2)]: {
        [blockUuids(3)]: {},
        [blockUuids(4)]: {},
      },
    }, state => {
    run(state, _deleteBlocks, [pageUuids(1), blockUuids(2), [blockUuids(3)]], state => {
      expect(state.cachedBlocks[blockUuids(2)].blocks.length).toBe(1);
      expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(1))).toBe(0);
      expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(2))).toBe(1);
      expect(state.cachedBlocks[blockUuids(2)].blocks.indexOf(blockUuids(3))).toBe(-1);
      expect(state.cachedBlocks[blockUuids(2)].blocks.indexOf(blockUuids(4))).toBe(0);
      expect(state.cachedBlocks[blockUuids(3)]).toBeUndefined();
    })});
  });

  test('Delete non root non first', () => {
    createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
      [blockUuids(1)]: {},
      [blockUuids(2)]: {
        [blockUuids(3)]: {},
        [blockUuids(4)]: {},
      },
    }, state => {
    run(state, _deleteBlocks, [pageUuids(1), blockUuids(2), [blockUuids(4)]], state => {
      expect(state.cachedBlocks[blockUuids(2)].blocks.length).toBe(1);
      expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(1))).toBe(0);
      expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(2))).toBe(1);
      expect(state.cachedBlocks[blockUuids(2)].blocks.indexOf(blockUuids(3))).toBe(0);
      expect(state.cachedBlocks[blockUuids(2)].blocks.indexOf(blockUuids(4))).toBe(-1);
      expect(state.cachedBlocks[blockUuids(4)]).toBeUndefined();
    })});
  });

  test('Delete block with children', () => {
    createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
      [blockUuids(1)]: {},
      [blockUuids(2)]: {
        [blockUuids(3)]: {},
        [blockUuids(4)]: {},
      },
    }, state => {
    run(state, _deleteBlocks, [pageUuids(1), pageUuids(1), [blockUuids(2)]], state => {
      expect(state.cachedPages[pageUuids(1)].blocks.length).toBe(3);
      expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(1))).toBe(0);
      expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(2))).toBe(-1);
      expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(3))).toBe(1);
      expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(4))).toBe(2);
      expect(state.cachedBlocks[blockUuids(2)]).toBeUndefined();
    })});
  });

  test('Delete multiple blocks', () => {
    createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
      [blockUuids(1)]: {},
      [blockUuids(2)]: {
        [blockUuids(3)]: {},
        [blockUuids(4)]: {},
      },
    }, state => {
    run(state, _deleteBlocks, [pageUuids(1), blockUuids(2), [blockUuids(3), blockUuids(4)]], state => {
      expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(1))).toBe(0);
      expect(state.cachedPages[pageUuids(1)].blocks.indexOf(blockUuids(2))).toBe(1);
      expect(state.cachedBlocks[blockUuids(2)].blocks.length).toBe(0);
      expect(state.cachedBlocks[blockUuids(3)]).toBeUndefined();
      expect(state.cachedBlocks[blockUuids(4)]).toBeUndefined();
    })});
  });
});

describe('Test _selectBlock', () => {
  test('Up, all the same level', () => {
    createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
      [blockUuids(1)]: {},
      [blockUuids(2)]: {},
      [blockUuids(3)]: {},
      [blockUuids(4)]: {},
    }, state => {
    run(state, _enterSelectionMode,  [pageUuids(1), blockUuids(3)], state => {
    run(state, _selectBlock, [pageUuids(1), selectDirection.up], state => {
      expect(state.selectedBlocks[pageUuids(1)].anchorUuid).toBe(blockUuids(3));
      expect(state.selectedBlocks[pageUuids(1)].focusUuid).toBe(blockUuids(2));
      expect(state.selectedBlocks[pageUuids(1)].blocks.indexOf(blockUuids(2))).not.toBe(-1);
      expect(state.selectedBlocks[pageUuids(1)].blocks.indexOf(blockUuids(3))).not.toBe(-1);
    })})});
  });

  test('Up, bump into the first block', () => {
    createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
      [blockUuids(1)]: {},
      [blockUuids(2)]: {},
      [blockUuids(3)]: {},
      [blockUuids(4)]: {},
    }, state => {
    run(state, _enterSelectionMode,  [pageUuids(1), blockUuids(2)], state => {
    run(state, _selectBlock, [pageUuids(1), selectDirection.up], state => {
    run(state, _selectBlock, [pageUuids(1), selectDirection.up], state => {
      expect(state.selectedBlocks[pageUuids(1)].anchorUuid).toBe(blockUuids(2));
      expect(state.selectedBlocks[pageUuids(1)].focusUuid).toBe(blockUuids(1));
      expect(state.selectedBlocks[pageUuids(1)].blocks.indexOf(blockUuids(2))).not.toBe(-1);
      expect(state.selectedBlocks[pageUuids(1)].blocks.indexOf(blockUuids(1))).not.toBe(-1);
    })})})});
  });

  test('Up, different level, more to less', () => {
    createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
      [blockUuids(1)]: {},
      [blockUuids(2)]: {
        [blockUuids(3)]: {},
        [blockUuids(4)]: {},
      },
    }, state => {
    run(state, _enterSelectionMode,  [pageUuids(1), blockUuids(4)], state => {
    run(state, _selectBlock, [pageUuids(1), selectDirection.up], state => {
    run(state, _selectBlock, [pageUuids(1), selectDirection.up], state => {
      expect(state.selectedBlocks[pageUuids(1)].anchorUuid).toBe(blockUuids(2));
      expect(state.selectedBlocks[pageUuids(1)].focusUuid).toBe(blockUuids(2));
      expect(state.selectedBlocks[pageUuids(1)].blocks.indexOf(blockUuids(2))).not.toBe(-1);
      expect(state.selectedBlocks[pageUuids(1)].blocks.indexOf(blockUuids(3))).toBe(-1);
      expect(state.selectedBlocks[pageUuids(1)].blocks.indexOf(blockUuids(4))).toBe(-1);
    })})})});
  });

  test('Up, different level, less to more', () => {
    createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
      [blockUuids(1)]: {
        [blockUuids(2)]: {},
        [blockUuids(3)]: {},
      },
      [blockUuids(4)]: {},
    }, state => {
    run(state, _enterSelectionMode,  [pageUuids(1), blockUuids(4)], state => {
    run(state, _selectBlock, [pageUuids(1), selectDirection.up], state => {
    run(state, _selectBlock, [pageUuids(1), selectDirection.up], state => {
      expect(state.selectedBlocks[pageUuids(1)].anchorUuid).toBe(blockUuids(4));
      expect(state.selectedBlocks[pageUuids(1)].focusUuid).toBe(blockUuids(2));
      expect(state.selectedBlocks[pageUuids(1)].blocks.indexOf(blockUuids(2))).not.toBe(-1);
      expect(state.selectedBlocks[pageUuids(1)].blocks.indexOf(blockUuids(3))).not.toBe(-1);
      expect(state.selectedBlocks[pageUuids(1)].blocks.indexOf(blockUuids(4))).not.toBe(-1);
    })})})});
  });

  test('Up, different level, less to more to less', () => {
    createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
      [blockUuids(1)]: {
        [blockUuids(2)]: {
          [blockUuids(3)]: {},
        },
      },
      [blockUuids(4)]: {},
    }, state => {
    run(state, _enterSelectionMode,  [pageUuids(1), blockUuids(4)], state => {
    run(state, _selectBlock, [pageUuids(1), selectDirection.up], state => {
    run(state, _selectBlock, [pageUuids(1), selectDirection.up], state => {
      expect(state.selectedBlocks[pageUuids(1)].anchorUuid).toBe(blockUuids(4));
      expect(state.selectedBlocks[pageUuids(1)].focusUuid).toBe(blockUuids(2));
      expect(state.selectedBlocks[pageUuids(1)].blocks.indexOf(blockUuids(2))).not.toBe(-1);
      expect(state.selectedBlocks[pageUuids(1)].blocks.indexOf(blockUuids(3))).toBe(-1);
      expect(state.selectedBlocks[pageUuids(1)].blocks.indexOf(blockUuids(4))).not.toBe(-1);
    })})})});
  });

  test('Down, all the same level', () => {
    createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
      [blockUuids(1)]: {},
      [blockUuids(2)]: {},
      [blockUuids(3)]: {},
      [blockUuids(4)]: {},
    }, state => {
    run(state, _enterSelectionMode,  [pageUuids(1), blockUuids(2)], state => {
    run(state, _selectBlock, [pageUuids(1), selectDirection.down], state => {
      expect(state.selectedBlocks[pageUuids(1)].anchorUuid).toBe(blockUuids(2));
      expect(state.selectedBlocks[pageUuids(1)].focusUuid).toBe(blockUuids(3));
      expect(state.selectedBlocks[pageUuids(1)].blocks.indexOf(blockUuids(2))).not.toBe(-1);
      expect(state.selectedBlocks[pageUuids(1)].blocks.indexOf(blockUuids(3))).not.toBe(-1);
    })})});
  });

  test('Down, bump into the last block', () => {
    createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
      [blockUuids(1)]: {},
      [blockUuids(2)]: {},
      [blockUuids(3)]: {},
      [blockUuids(4)]: {},
    }, state => {
    run(state, _enterSelectionMode,  [pageUuids(1), blockUuids(3)], state => {
    run(state, _selectBlock, [pageUuids(1), selectDirection.down], state => {
    run(state, _selectBlock, [pageUuids(1), selectDirection.down], state => {
      expect(state.selectedBlocks[pageUuids(1)].anchorUuid).toBe(blockUuids(3));
      expect(state.selectedBlocks[pageUuids(1)].focusUuid).toBe(blockUuids(4));
      expect(state.selectedBlocks[pageUuids(1)].blocks.indexOf(blockUuids(3))).not.toBe(-1);
      expect(state.selectedBlocks[pageUuids(1)].blocks.indexOf(blockUuids(4))).not.toBe(-1);
    })})})});
  });

  test('Up, different level, more to less', () => {
    createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
      [blockUuids(1)]: {
        [blockUuids(2)]: {},
        [blockUuids(3)]: {},
      },
      [blockUuids(4)]: {},
    }, state => {
    run(state, _enterSelectionMode,  [pageUuids(1), blockUuids(2)], state => {
    run(state, _selectBlock, [pageUuids(1), selectDirection.down], state => {
    run(state, _selectBlock, [pageUuids(1), selectDirection.down], state => {
      expect(state.selectedBlocks[pageUuids(1)].anchorUuid).toBe(blockUuids(2));
      expect(state.selectedBlocks[pageUuids(1)].focusUuid).toBe(blockUuids(4));
      expect(state.selectedBlocks[pageUuids(1)].blocks.indexOf(blockUuids(2))).not.toBe(-1);
      expect(state.selectedBlocks[pageUuids(1)].blocks.indexOf(blockUuids(3))).not.toBe(-1);
      expect(state.selectedBlocks[pageUuids(1)].blocks.indexOf(blockUuids(4))).not.toBe(-1);
    })})})});
  });

  test('Up, different level, less to more to less', () => {
    createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
      [blockUuids(1)]: {
        [blockUuids(2)]: {
          [blockUuids(3)]: {},
        },
      },
      [blockUuids(4)]: {},
    }, state => {
    run(state, _enterSelectionMode,  [pageUuids(1), blockUuids(2)], state => {
    run(state, _selectBlock, [pageUuids(1), selectDirection.down], state => {
    run(state, _selectBlock, [pageUuids(1), selectDirection.down], state => {
      expect(state.selectedBlocks[pageUuids(1)].anchorUuid).toBe(blockUuids(2));
      expect(state.selectedBlocks[pageUuids(1)].focusUuid).toBe(blockUuids(4));
      expect(state.selectedBlocks[pageUuids(1)].blocks.indexOf(blockUuids(2))).not.toBe(-1);
      expect(state.selectedBlocks[pageUuids(1)].blocks.indexOf(blockUuids(3))).toBe(-1);
      expect(state.selectedBlocks[pageUuids(1)].blocks.indexOf(blockUuids(4))).not.toBe(-1);
      expect(state.selectedBlocks[pageUuids(1)].blocks.length).toBe(2);
    })})})});
  });

  test('Left', () => {
    createPageWithBlocksAndParseParent(getInitState(), pageUuids(1), {
      [blockUuids(1)]: {},
      [blockUuids(2)]: {
        [blockUuids(3)]: {},
        [blockUuids(4)]: {},
      },
    }, state => {
    run(state, _enterSelectionMode,  [pageUuids(1), blockUuids(4)], state => {
    run(state, _selectBlock, [pageUuids(1), selectDirection.left], state => {
      expect(state.selectedBlocks[pageUuids(1)].anchorUuid).toBe(blockUuids(2));
      expect(state.selectedBlocks[pageUuids(1)].focusUuid).toBe(blockUuids(2));
      expect(state.selectedBlocks[pageUuids(1)].blocks.indexOf(blockUuids(2))).toBe(0);
      expect(state.selectedBlocks[pageUuids(1)].blocks.indexOf(blockUuids(3))).toBe(-1);
      expect(state.selectedBlocks[pageUuids(1)].blocks.indexOf(blockUuids(4))).toBe(-1);
    })})});
  });
});