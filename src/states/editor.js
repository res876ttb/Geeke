/*************************************************
 * @file editor.js
 * @description Action and reducer of react-redux.
 *************************************************/

/*************************************************
 * IMPORT
 *************************************************/
import produce from 'immer';
import {newBlockId} from '../utils/Misc';
const _ = require('lodash');

/*************************************************
 * CONST
 *************************************************/

// Permission
const permissionConst = {
  members: 0,
  everyone: 1,
  owner: 2,
  invitee: 3,
};

// Block types
export const blockType = {
  basic: 0,
}

// Cursor move direction
export const cursorDirection = {
  up: 0,
  down: 1,
};

const type = null;
const rootPage = null;

/**
 * Data structure
 * Target performance:
 *   * Cluster: 1M users, 1T blocks, 10M queries per seconds
 *   * Single CPU server: 100 users, 1M blocks, 1K queries per seconds
 * DB: NoSQL
 */
// Empty Page
const emptyPage = {
  // Page ID
  uuid: '11111111-2222-3333-4444-555555555555',
  // Author
  author: '',
  // Space
  space: '',
  // Title
  title: 'Untitled',
  // Block list. There must be at least 1 block here.
  blocks: [],
  // Tags
  tags: [],
  // Background image above the title
  background: '',
  // Back links
  backLinks: [], // {page: pageUuid, block: blockUuid}
  // Page Comment
  comments: [],
  // Permision
  Permision: {
    read: permissionConst.members,
    write: permissionConst.members,
  },
  // Icon
  icon: '',
  // Readonly
  readonly: false,
  // Public: be able to be searched by search engine
  public: false,
  // Create date
  createDate: 0.0,
  // Last modified date
  lastModifiedDate: 0.0,
};

// Empty Block
const emptyBlock = {
  // Block ID
  uuid: '66666666-7777-8888-9999-000000000000',
  // Type
  type: blockType.basic,
  // Author
  author: '',
  // Space
  space: '',
  // Content
  content: '',
  // Children Block
  blocks: [],
  // Block comment
  comments: [],
  // Inline comment
  inlineComments: [],
  // Last modified date
  lastModifiedDate: 0.0,
}

// Empty Workspace
const emptyWorkspace = {
  // Space ID
  uuid: '11111111-3333-5555-7777-999999999999',
  // Name
  name: 'Workspace',
  // Private pages
  privates: [],
  // Shared: accessible by all workspace members by default
  shares: [],
  // Favorites
  favorites: [],
  // Members
  members: [],
  // Administrators
  administrators: [],
  // Root pages
  rootPages: [],
  // Permission: default permission
  permission: {
    read: permissionConst.members,
    write: permissionConst.members,
  },
  // Theme
  theme: 'default',
}

// Init state
const initState = {
  workspace: {},
  cachedPages: {},
  cachedBlocks: {},
  blockParents: {},
  focusedBlock: {},
  pageTree: {
    root: {},
    rLink: {}, // reverse link
  },
  editorState: {
    saving: false,
  },
}

/*************************************************
 * TEST HELPER
 *************************************************/
export function getInitState() {
  return _.cloneDeep(initState);
}

export function getNewPage() {
  return _.cloneDeep(emptyPage);
}

export function getNewBlock() {
  return _.cloneDeep(emptyBlock);
}

/*************************************************
 * ACTION
 *************************************************/

/**
 * @function updateContent
 * @description Update content of a block.
 * @param {func} dispatch 
 * @param {string} uuid UUID of the block to update
 * @param {EditorState} content Draftjs state object.
 */
export function updateContent(dispatch, uuid, content) {
  _updateContent(dispatch, uuid, content);
}

/**
 * @function updatePageTitle
 * @description Update title of a page.
 * @param {func} dispatch 
 * @param {string} pageUuid UUID of the page to update title
 * @param {String} newTitle Title of the target page.
 */
export function updatePageTitle(dispatch, pageUuid, newTitle) {
  _updatePageTitle(dispatch, pageUuid, newTitle);
}

/**
 * @function addPage
 * @description Add a child page under a page.
 * @param {func} dispatch 
 * @param {string} parentUuid UUID of the parent.
 */
export function addPage(dispatch, parentUuid) {
  let newPageId = newBlockId();
  _addPage(dispatch, newPageId, newBlockId(), parentUuid);
  _parseBlockParents(dispatch, newPageId);
}

/**
 * @function setSavingState
 * @description Set saving state. If true, editor is synchornizing between client and server.
 * @param {func} dispatch 
 * @param {boolean} state Saving state.
 */
export function setSavingState(dispatch, state) {
  _setSavingState(dispatch, state);
}

/**
 * @function addBlock
 * @description Add a block under a page/block.
 * @param {func} dispatch 
 * @param {string} pageUuid UUID of the page to add a block.
 * @param {string} parentUuid UUID of the parent page/block to add a block. If this uuid is null, then the new block will be the first one.
 * @param {string} aboveUuid UUID of the previous block.
 */
export function addBlock(dispatch, pageUuid, parentUuid, aboveUuid) {
  let blockId = newBlockId();
  _addBlock(dispatch, parentUuid, aboveUuid, blockId);
  _parseBlockParents(dispatch, pageUuid); // Need optimization
  return blockId;
}

/**
 * @function moveBlock
 * @description Move block from `originalParentUuid` to `parentUuid` after `aboveUuid`.
 * @param {func} dispatch 
 * @param {string} pageUuid UUID of the page to add a block.
 * @param {string} parentUuid UUID of the new parent block/page.
 * @param {string} originParentUuid UUID of the original parent block/page.
 * @param {string} aboveUuid UUID of the previous block.
 */
export function moveBlock(dispatch, pageUuid, parentUuid, originParentUuid, aboveUuid) {
  _moveBlock(dispatch, parentUuid, originParentUuid, aboveUuid);
  _parseBlockParents(dispatch, pageUuid); // Need optimization
}

export function fetchRootPages() {
  // TODO
}

export function fetchWorkspace() {
  // TODO
}

/**
 * @function loadAllBlocks
 * @description Load all blocks of a page from server.
 * @param {func} dispatch 
 * @param {string} pageUuid UUID of the page to load all blocks.
 */
export function loadAllBlocks(dispatch, pageUuid) {
  _loadAllBlocks(dispatch, pageUuid);
}

/**
 * @function parseBlockParents
 * @description Create a map from blocks to their parent block/page. This map will be used for moving cursor.
 * @param {func} dispatch 
 * @param {string} pageUuid UUID of the page to parse parent blocks.
 */
export function parseBlockParents(dispatch, pageUuid) {
  _parseBlockParents(dispatch, pageUuid);
}

/**
 * @function setFocusedBlock
 * @description Mark a block as focused.
 * @param {func} dispatch 
 * @param {string} pageUuid UUID of the focused page.
 * @param {string} blockUuid UUID of the focused block.
 */
export function setFocusedBlock(dispatch, pageUuid, blockUuid) {
  _setFocusedBlock(dispatch, pageUuid, blockUuid);
}

/**
 * @function getPreviousBlock
 * @description Find the previous block of current block. NOTE: This function is not an action function.
 * @param {state} state Redux State, which should be state.editor.
 * @param {string} pageUuid UUID of the focused page.
 * @param {string} blockUuid UUID of the block to find the previous block.
 */
export function getPreviousBlock(state, pageUuid, blockUuid) {
  let parentUuid = state.blockParents[blockUuid];

  if (!state.cachedBlocks[parentUuid] && !state.cachedPages[parentUuid]) {
    console.error(`Unable to get previous block because parent block ${parentUuid} has not been fetched!`);
    return undefined;
  }

  if (parentUuid === pageUuid) {
    let curIndex = state.cachedPages[pageUuid].blocks.indexOf(blockUuid);
    if (curIndex < 0) {
      console.error(`Unable to find current block ${blockUuid} from page ${pageUuid}.`);
      return undefined;
    }

    if (curIndex > 0) {
      return state.cachedPages[pageUuid].blocks[curIndex - 1];
    } else {
      return state.cachedPages[pageUuid].blocks[0];
    }
  } else {
    let parentBlock = state.cachedBlocks[parentUuid];
    let curIndex = parentBlock.blocks.indexOf(blockUuid);
    if (curIndex === -1) {
      console.error(`Unable to find block ${blockUuid} in page/block ${parentBlock}`);
      return undefined;
    }

    if (curIndex === 0) {
      return parentUuid;
    } else {
      return parentBlock.blocks[curIndex - 1];
    }
  }
}

/**
 * @function getNextBlock
 * @description Find the next block of current block. NOTE: This function is not an action function.
 * @param {state} state Redux State, which should be state.editor.
 * @param {string} pageUuid UUID of the focused page.
 * @param {string} blockUuid UUID of the block to find the next block.
 * @param {boolean} canChild Whether the next block can be the child of this block. Default value is true.
 */
export function getNextBlock(state, pageUuid, blockUuid, canChild=true) {
  let parentUuid = state.blockParents[blockUuid];

  if (!state.cachedBlocks[parentUuid] && !state.cachedPages[parentUuid]) {
    console.error(`Unable to get previous block because parent block ${parentUuid} has not been fetched!`);
    return undefined;
  }

  if (canChild && state.cachedBlocks[blockUuid].blocks.length > 0) {
    return state.cachedBlocks[blockUuid].blocks[0];
  }

  if (parentUuid === pageUuid) {
    let curIndex = state.cachedPages[pageUuid].blocks.indexOf(blockUuid);
    if (curIndex < 0) {
      console.error(`Unable to find current block ${blockUuid} from page ${pageUuid}.`);
      return undefined;
    }

    if (curIndex + 1 < state.cachedPages[pageUuid].blocks.length) {
      return state.cachedPages[pageUuid].blocks[curIndex + 1];
    } else {
      return state.cachedPages[pageUuid].blocks[state.cachedPages[pageUuid].blocks.length - 1];
    }
  } else {
    let parentBlock = state.cachedBlocks[parentUuid];
    let curIndex = parentBlock.blocks.indexOf(blockUuid);
    if (curIndex === -1) {
      console.error(`Unable to find block ${blockUuid} in page/block ${parentBlock}`);
      return undefined;
    }

    if (curIndex + 1 === parentBlock.blocks.length) {
      // It is able to return the result of getNewBlock() because the next block will always carry some content.
      let result = getNextBlock(state, pageUuid, parentUuid, false);
      if (result === parentUuid) return blockUuid;
      else return result;
    } else {
      return parentBlock.blocks[curIndex + 1];
    }
  }
}

/*************************************************
 * MIDDLE FUNCTION
 *************************************************/
export function _addPage(dispatch, pageUuid, blockUuid, parentUuid) {
  dispatch({type,
    callback: state => {
      let newPage = getNewPage();
      let newBlock = getNewBlock();
      newPage.uuid = pageUuid;
      newBlock.uuid = blockUuid;
      newPage.blocks.push(blockUuid);
      state.cachedPages[pageUuid] = newPage;
      state.cachedBlocks[blockUuid] = newBlock;

      // Update page tree structure
      _pageTreeAddPage(action => {
        state = action.callback(state);
      }, parentUuid, pageUuid);

      return state;
    }
  });
}

export function _updatePageTitle(dispatch, pageUuid, newTitle) {
  dispatch({type, 
    callback: state => {
      state.cachedPages[pageUuid].title = newTitle;

      return state;
    }
  });
}

export function _updateContent(dispatch, uuid, content) {
  dispatch({type,
    callback: state => {
      state.cachedBlocks[uuid].content = content;

      return state;
    }
  });
}

export function _setSavingState(dispatch, savingState) {
  dispatch({type,
    callback: state => {
      state.editorState.saving = savingState;

      return state;
    }
  });
}

export function _addBlock(dispatch, parentUuid, aboveUuid, newUuid) {
  dispatch({type,
    callback: state => {
      let newBlock = getNewBlock();
      let block = state.cachedBlocks[parentUuid] ? state.cachedBlocks[parentUuid] : state.cachedPages[parentUuid];

      if (!block) {
        console.error(`Block with uuid ${parentUuid} not found!`);
        return state;
      }

      newBlock.uuid = newUuid;
      let newBlockIndex = aboveUuid ? block.blocks.indexOf(aboveUuid) : 0;

      if (newBlockIndex === -1) {
        console.error(`Block with uuid ${aboveUuid} cannot be found in block ${parentUuid}`);
        return state;
      }

      block.blocks.splice(newBlockIndex + 1, 0, newBlock.uuid);
      state.cachedBlocks[newBlock.uuid] = newBlock;

      return state;
    }
  });
}

export function _moveBlock(dispatch, parentUuid, originParentUuid, aboveUuid) {
  dispatch({type,
    callback: state => {
      return state;
    }
  });
}

export function _pageTreeAddPage(dispatch, parentUuid, uuid) {
  dispatch({type,
    callback: state => {
      // 1. Update tree structure
      let getAncestors = cuuid => {
        if (cuuid === undefined || cuuid === null) return [];
        let ancestors = getAncestors(state.pageTree.rLink[cuuid]);
        ancestors.push(cuuid);
        return ancestors;
      };

      let ancestors = getAncestors(parentUuid);
      if (ancestors.length === 0) {
        state.pageTree.root[uuid] = {}
      } else {
        let curNode = state.pageTree.root;
        for (let i in ancestors) {
          curNode = curNode[ancestors[i]];
        }
        curNode[uuid] = {};
      }

      // 2. Update reverse link
      state.pageTree.rLink[uuid] = parentUuid;

      return state;
    }
  })
}

export function _loadAllBlocks(dispatch, pageUuid) {
  dispatch({type, 
    callback: state => {
      // To be implemented
      return state;
    }
  });
}

export function _parseBlockParents(dispatch, pageUuid) {
  dispatch({type,
    callback: state => {
      if (!state.cachedPages[pageUuid]) {
        console.error(`Page ${pageUuid} has not been fetched!`);
        return state;
      }
      
      let parseBlocks = blockUuid => {
        if (!state.cachedBlocks[blockUuid]) {
          console.error(`Block ${blockUuid} has not been fetched!`);
          return;
        }

        let childBlocks = state.cachedBlocks[blockUuid].blocks;

        for (let i in childBlocks) {
          state.blockParents[childBlocks[i]] = blockUuid;
          parseBlocks(childBlocks[i]);
        }
      };

      for (let i in state.cachedPages[pageUuid].blocks) {
        let blockUuid = state.cachedPages[pageUuid].blocks[i];
        state.blockParents[blockUuid] = pageUuid;
        parseBlocks(blockUuid);
      }
      
      return state;
    }
  });
}

export function _setFocusedBlock(dispatch, pageUuid, blockUuid) {
  dispatch({type, 
    callback: state => {
      state.focusedBlock[pageUuid] = blockUuid;
      return state;
    }
  });
}

/*************************************************
 * REDUCER
 * @brief Use immer to perform deep udpate of state.
 *************************************************/
export let editor = (oldState=initState, action) => produce(oldState, state => action.callback ? action.callback(state) : state);
