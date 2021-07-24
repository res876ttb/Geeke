/*************************************************
 * @file Mockup.js
 * @description Mockup the un-implemented features.
 *************************************************/

/*************************************************
 * IMPORT LIBRARIES
 *************************************************/
import { ContentState, EditorState } from 'draft-js'
import { getInitState, _addPage, _addBlock, _parseBlockParents, _updateContent } from '../states/editor'

/*************************************************
 * CONSTANTS
 *************************************************/

/*************************************************
 * FUNCTIONS
 *************************************************/
export const runMockup = (state, testFunc, args, callback) => {
  testFunc((action) => {
    state = action.callback(state)
    callback(state)
  }, ...args)
}

export const getMockupPageUuid = (index) => {
  return index.toString()
}

export const getMockupBlockUuid = (index) => {
  return (100 + index).toString()
}

export const createMockupPageWithBlocks = (state, pageUuid, blockStructure, callback) => {
  const gvbi = (obj, i) => obj[Object.keys(obj)[i]] // get value by index
  const gkbi = (obj, i) => Object.keys(obj)[i] // get key by index
  const gl = (obj) => Object.keys(obj).length // get length

  const createBlockUnderBlock = (i, state, parentUuid, partialStructure, callback) => {
    if (i >= gl(partialStructure)) {
      callback(state)
      return
    }

    runMockup(
      state,
      _addBlock,
      [parentUuid, i === 0 ? null : gkbi(partialStructure, i - 1), gkbi(partialStructure, i)],
      (state) => {
        createBlockUnderBlock(0, state, gkbi(partialStructure, i), gvbi(partialStructure, i), (state) => {
          createBlockUnderBlock(i + 1, state, parentUuid, partialStructure, callback)
        })
      },
    )
  }

  const createBlockAtRoot = (i, state, callback) => {
    if (i >= gl(blockStructure)) {
      callback(state)
      return
    }

    runMockup(state, _addBlock, [pageUuid, gkbi(blockStructure, i - 1), gkbi(blockStructure, i)], (state) => {
      createBlockUnderBlock(0, state, gkbi(blockStructure, i), gvbi(blockStructure, i), (state) => {
        createBlockAtRoot(i + 1, state, callback)
      })
    })
  }

  runMockup(state, _addPage, [pageUuid, gkbi(blockStructure, 0), null], (state) => {
    createBlockUnderBlock(0, state, gkbi(blockStructure, 0), gvbi(blockStructure, 0), (state) => {
      createBlockAtRoot(1, state, callback)
    })
  })
}

export const createMockupPageWithBlocksAndParseParent = (state, pageUuid, blockStructure, callback) => {
  createMockupPageWithBlocks(state, pageUuid, blockStructure, (state) => {
    runMockup(state, _parseBlockParents, [pageUuid], (state) => {
      callback(state)
    })
  })
}

/**
 *
 * @param {function} dispatch
 * @param {function} callback Callback function if there are any further change. Args: [state, dispatch]. This callback function should call dispatch(state) before it ends.
 */
export function createFakePage(dispatch, callback) {
  let runDisaptch = (state) => {
    dispatch({
      type: 'type',
      callback: () => {
        state.focusedBlock[getMockupPageUuid(1)] = getMockupBlockUuid(1)
        return state
      },
    })
  }

  createMockupPageWithBlocksAndParseParent(
    getInitState(),
    getMockupPageUuid(1),
    {
      [getMockupBlockUuid(1)]: {},
      [getMockupBlockUuid(2)]: {
        [getMockupBlockUuid(3)]: {},
        [getMockupBlockUuid(4)]: {},
      },
    },
    (state) => {
      let contentOfBlock1 = EditorState.createWithContent(ContentState.createFromText('This is block 1'))
      let contentOfBlock2 = EditorState.createWithContent(ContentState.createFromText('This is block 2'))
      let contentOfBlock3 = EditorState.createWithContent(ContentState.createFromText('This is block 3'))
      let contentOfBlock4 = EditorState.createWithContent(ContentState.createFromText('This is block 4'))
      runMockup(state, _updateContent, [getMockupBlockUuid(1), contentOfBlock1], (state) => {
        runMockup(state, _updateContent, [getMockupBlockUuid(2), contentOfBlock2], (state) => {
          runMockup(state, _updateContent, [getMockupBlockUuid(3), contentOfBlock3], (state) => {
            runMockup(state, _updateContent, [getMockupBlockUuid(4), contentOfBlock4], (state) => {
              if (callback) callback(state, runDisaptch)
              else runDisaptch(state)
            })
          })
        })
      })
    },
  )
}
