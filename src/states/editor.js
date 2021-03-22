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
export const selectDirection = {
  up: 0,
  down: 1,
  left: 2,
  right: 3,
};

const defaultSelectedBlock = {
  anchorUuid: undefined,
  focusUuid: undefined,
  blocks: [],
};

const type = null;

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
  // Ancestors
  ancestors: [],
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
// const emptyWorkspace = {
//   // Space ID
//   uuid: '11111111-3333-5555-7777-999999999999',
//   // Name
//   name: 'Workspace',
//   // Private pages
//   privates: [],
//   // Shared: accessible by all workspace members by default
//   shares: [],
//   // Favorites
//   favorites: [],
//   // Members
//   members: [],
//   // Administrators
//   administrators: [],
//   // Root pages
//   rootPages: [],
//   // Opened page
//   openedPages: [],
//   // Permission: default permission
//   permission: {
//     read: permissionConst.members,
//     write: permissionConst.members,
//   },
//   // Theme
//   theme: 'default',
// }

// Init state
const initState = {
  workspace: {},
  cachedPages: {},
  cachedBlocks: {},
  blockParents: {},
  focusedBlock: {},
  selectedBlocks: {},
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
 * @param {function} dispatch 
 * @param {string} uuid UUID of the block to update
 * @param {EditorState} content Draftjs state object.
 */
export function updateContent(dispatch, uuid, content) {
  _updateContent(dispatch, uuid, content);
}

/**
 * @function updatePageTitle
 * @description Update title of a page.
 * @param {function} dispatch 
 * @param {string} pageUuid UUID of the page to update title
 * @param {String} newTitle Title of the target page.
 */
export function updatePageTitle(dispatch, pageUuid, newTitle) {
  _updatePageTitle(dispatch, pageUuid, newTitle);
}

/**
 * @function addPage
 * @description Add a child page under a page.
 * @param {function} dispatch 
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
 * @param {function} dispatch 
 * @param {boolean} state Saving state.
 */
export function setSavingState(dispatch, state) {
  _setSavingState(dispatch, state);
}

/**
 * @function addBlock
 * @description Add a block under a page/block.
 * @param {function} dispatch 
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
 * @function moveBlocks
 * @description Move blocks from `originalParentUuid` to `parentUuid` after `aboveUuid`. 
 *              Note: 1. All blocks should have the same parent.
 *                    2. Blocks in blockUuids should be continuous blocks.
 * @param {function} dispatch 
 * @param {string} pageUuid UUID of the page to add a block.
 * @param {string} parentUuid UUID of the new parent block/page.
 * @param {string} originParentUuid UUID of the original parent block/page.
 * @param {string} aboveUuid UUID of the block at target position.
 * @param {array} blockUuids UUIDs of the blocks to move.
 */
export function moveBlocks(dispatch, pageUuid, parentUuid, originParentUuid, aboveUuid, blockUuids) {
  _moveBlocks(dispatch, pageUuid, parentUuid, originParentUuid, aboveUuid, blockUuids);
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
 * @param {function} dispatch 
 * @param {string} pageUuid UUID of the page to load all blocks.
 */
export function loadAllBlocks(dispatch, pageUuid) {
  _loadAllBlocks(dispatch, pageUuid);
}

/**
 * @function parseBlockParents
 * @description Create a map from blocks to their parent block/page. This map will be used for moving cursor.
 * @param {function} dispatch 
 * @param {string} pageUuid UUID of the page to parse parent blocks.
 */
export function parseBlockParents(dispatch, pageUuid) {
  _parseBlockParents(dispatch, pageUuid);
}

/**
 * @function setFocusedBlock
 * @description Mark a block as focused.
 * @param {function} dispatch 
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

  let getLastBlock = blockUuid => {
    if (!blockUuid) {
      console.error(`Invalid blockUuid: ${blockUuid}`);
      return blockUuid;
    }

    let blocksLength = state.cachedBlocks[blockUuid].blocks.length;
    if (blocksLength > 0) {
      return getLastBlock(state.cachedBlocks[blockUuid].blocks[blocksLength - 1]);
    } else {
      return blockUuid;
    }
  };

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
      return getLastBlock(state.cachedPages[pageUuid].blocks[curIndex - 1]);
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
      return getLastBlock(parentBlock.blocks[curIndex - 1]);
    }
  }
}

/**
 * @function getNextBlock
 * @description Find the next block of current block. NOTE: This function is not an action function.
 * @param {state} state Redux State, which should be state.editor.
 * @param {string} pageUuid UUID of the focused page.
 * @param {string} blockUuid UUID of the block to find the next block.
 * @param {boolean} canBeChild Whether the next block can be the child of this block. Default value is true.
 */
export function getNextBlock(state, pageUuid, blockUuid, canBeChild=true) {
  let parentUuid = state.blockParents[blockUuid];

  if (!state.cachedBlocks[parentUuid] && !state.cachedPages[parentUuid]) {
    console.error(`Unable to get previous block because parent block ${parentUuid} has not been fetched!`);
    return undefined;
  }

  if (canBeChild && state.cachedBlocks[blockUuid].blocks.length > 0) {
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

/**
 * @function setMoreIndent
 * @description Make blocks have 1 more indent level.
 * @param {function} dispatch 
 * @param {string} pageUuid UUID of the page where the block belongs to.
 * @param {array} blockUuids Array of UUIDs of the blocks to indent.
 */
export function setMoreIndent(dispatch, pageUuid, blockUuids) {
  _setMoreIndent(dispatch, pageUuid, blockUuids);
  _parseBlockParents(dispatch, pageUuid); // Need optimization
}

/**
 * @function setLessIndent
 * @description Make blocks have 1 less indent level.
 * @param {function} dispatch 
 * @param {string} pageUuid UUID of the page where the block belongs to.
 * @param {array} blockUuids Array of UUIDs of the blocks to less indent.
 */
export function setLessIndent(dispatch, pageUuid, blockUuids) {
  _setLessIndent(dispatch, pageUuid, blockUuids);
  _parseBlockParents(dispatch, pageUuid); // Need optimization
}

/**
 * @function deleteBlocks
 * @description Delete blocks.
 * @param {function} dispatch 
 * @param {string} pageUuid UUID of the page to delete block.
 * @param {string} parentUuid UUID of the parent of the block to be deleted.
 * @param {array} blockUuids UUIDs of the blocks to delete.
 * @param {boolean} deleteChild Whether to delete child blocks at the same time.
 */
export function deleteBlocks(dispatch, pageUuid, parentUuid, blockUuids, deleteChild) {
  _deleteBlocks(dispatch, pageUuid, parentUuid, blockUuids, deleteChild);
  _parseBlockParents(dispatch, pageUuid);
}

/**
 * @function enterSelectionMode
 * @description Enter selection mode.
 * @param {function} dispatch 
 * @param {string} pageUuid UUID of the page that enters selection mode.
 * @param {string} blockUuid UUID of the fisrt selected block.
 */
export function enterSelectionMode(dispatch, pageUuid, blockUuid) {
  _enterSelectionMode(dispatch, pageUuid, blockUuid);
}

/**
 * @function escapeSelectionMode
 * @description Escape selection mode.
 * @param {function} dispatch 
 * @param {string} pageUuid UUID of the page that escapes selection mode.
 */
export function escapeSelectionMode(dispatch, pageUuid) {
  _escapeSelectionMode(dispatch, pageUuid);
}

/**
 * @function selectBlock
 * @description Select/unselecte new block with direction.
 * @param {function} dispatch 
 * @param {string} pageUuid UUID of the page that change selection.
 * @param {selectDirection} direction Direction of new selection.
 */
export function selectBlock(dispatch, pageUuid, direction) {
  _selectBlock(dispatch, pageUuid, direction);
}

/**
 * @function removeBlockSelection
 * @description Remove block selection of a certain page.
 * @param {function} dispatch 
 * @param {string} pageUuid UUID of the page that want to remove block selection.
 */
export function removeBlockSelection(dispatch, pageUuid) {
  _removeBlockSelection(dispatch, pageUuid);
}

/*************************************************
 * MIDDLE FUNCTION
 *************************************************/
export function _addPage(dispatch, pageUuid, blockUuid, parentUuid) {
  dispatch({type, callback: state => {
    let newPage = getNewPage();
    let newBlock = getNewBlock();
    newPage.uuid = pageUuid;
    newBlock.uuid = blockUuid;
    newPage.blocks.push(blockUuid);
    state.cachedPages[pageUuid] = newPage;
    state.cachedBlocks[blockUuid] = newBlock;

    // Update page tree structure
    // TODO: Move this step out of function _addPage
    _pageTreeAddPage(action => {
      state = action.callback(state);
    }, parentUuid, pageUuid);

    state.selectedBlocks[pageUuid] = defaultSelectedBlock;

    return state;
  }});
}

export function _updatePageTitle(dispatch, pageUuid, newTitle) {
  dispatch({type, callback: state => {
    state.cachedPages[pageUuid].title = newTitle;

    return state;
  }});
}

export function _updateContent(dispatch, uuid, content) {
  dispatch({type, callback: state => {
    state.cachedBlocks[uuid].content = content;

    return state;
  }});
}

export function _setSavingState(dispatch, savingState) {
  dispatch({type, callback: state => {
    state.editorState.saving = savingState;

    return state;
  }});
}

export function _addBlock(dispatch, parentUuid, aboveUuid, newUuid) {
  dispatch({type, callback: state => {
    let newBlock = getNewBlock();
    let block = state.cachedBlocks[parentUuid] ? state.cachedBlocks[parentUuid] : state.cachedPages[parentUuid];

    if (!block) {
      console.error(`Block with uuid ${parentUuid} not found!`);
      return state;
    }

    newBlock.uuid = newUuid;
    let newBlockIndex = block.blocks.indexOf(aboveUuid);

    if (newBlockIndex === -1 && aboveUuid) {
      console.error(`Block with uuid ${aboveUuid} cannot be found in block ${parentUuid}`);
      return state;
    }

    block.blocks.splice(newBlockIndex + 1, 0, newBlock.uuid);
    state.cachedBlocks[newBlock.uuid] = newBlock;

    return state;
  }});
}

export function _moveBlocks(dispatch, pageUuid, newParentUuid, originParentUuid, aboveUuid, blockUuids) {
  dispatch({type, callback: state => {
    let blockUuid = blockUuids[0];
    let newParentBlock = newParentUuid === pageUuid ? state.cachedPages[newParentUuid] : state.cachedBlocks[newParentUuid];
    let originParentBlock = originParentUuid === pageUuid ? state.cachedPages[originParentUuid] : state.cachedBlocks[originParentUuid];
    let curIndex = originParentBlock.blocks.indexOf(blockUuid);
    let aboveBlockIndex = aboveUuid ? newParentBlock.blocks.indexOf(aboveUuid) : -1;

    originParentBlock.blocks.splice(curIndex, 1);
    newParentBlock.blocks.splice(aboveBlockIndex + 1, 0, blockUuid);

    for (let i = 1; i < blockUuids.length; i++) {
      let blockUuid = blockUuids[i];
      let curIndex = originParentBlock.blocks.indexOf(blockUuid);
      let aboveBlockIndex = newParentBlock.blocks.indexOf(blockUuids[i - 1]);

      originParentBlock.blocks.splice(curIndex, 1);
      newParentBlock.blocks.splice(aboveBlockIndex + 1, 0, blockUuid);
    }

    return state;
  }});
}

export function _pageTreeAddPage(dispatch, parentUuid, uuid) {
  dispatch({type, callback: state => {
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
  }});
}

export function _loadAllBlocks(dispatch, pageUuid) {
  dispatch({type, callback: state => {
    // To be implemented
    return state;
  }});
}

export function _parseBlockParents(dispatch, pageUuid) {
  dispatch({type, callback: state => {
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
  }});
}

export function _setFocusedBlock(dispatch, pageUuid, blockUuid) {
  dispatch({type, callback: state => {
    state.focusedBlock[pageUuid] = blockUuid;
    return state;
  }});
}

export function _setMoreIndent(dispatch, pageUuid, blockUuids) {
  dispatch({type, callback: state => {
    for (let i = 0; i < blockUuids.length; i++) {
      let blockUuid = blockUuids[i];
      let parentUuid = state.blockParents[blockUuid];

      if (pageUuid === parentUuid) {
        let curIndex = state.cachedPages[pageUuid].blocks.indexOf(blockUuid);
        if (curIndex === 0) continue;

        let previousBlockUuid = state.cachedPages[pageUuid].blocks[curIndex - 1];
        state.cachedBlocks[previousBlockUuid].blocks.push(blockUuid);

        state.cachedPages[pageUuid].blocks.splice(curIndex, 1);
      } else {
        let curIndex = state.cachedBlocks[parentUuid].blocks.indexOf(blockUuid);
        if (curIndex === 0) continue;

        let previousBlockUuid = state.cachedBlocks[parentUuid].blocks[curIndex - 1];
        state.cachedBlocks[previousBlockUuid].blocks.push(blockUuid);

        state.cachedBlocks[parentUuid].blocks.splice(curIndex, 1);
      }
    }

    return state;
  }});
}

export function _setLessIndent(dispatch, pageUuid, blockUuids) {
  dispatch({type, callback: state => {
    for (let i = blockUuids.length - 1; i >= 0; i--) {
      let blockUuid = blockUuids[i];
      let parentUuid = state.blockParents[blockUuid];

      if (pageUuid === parentUuid) {
        continue;
      } else {
        let parentOfParentUuid = state.blockParents[parentUuid];
        if (pageUuid === parentOfParentUuid) {
          let curIndex = state.cachedBlocks[parentUuid].blocks.indexOf(blockUuid);
          let parentIndex = state.cachedPages[pageUuid].blocks.indexOf(parentUuid);
          let restChildOfParent = state.cachedBlocks[parentUuid].blocks.splice(curIndex);

          state.cachedPages[pageUuid].blocks.splice(parentIndex + 1, 0, blockUuid);
          for (let i = 1; i < restChildOfParent.length; i++) {
            state.cachedBlocks[blockUuid].blocks.push(restChildOfParent[i]);
          }
        } else {
          let curIndex = state.cachedBlocks[parentUuid].blocks.indexOf(blockUuid);
          let parentIndex = state.cachedBlocks[parentOfParentUuid].blocks.indexOf(parentUuid);
          let restChildOfParent = state.cachedBlocks[parentUuid].blocks.splice(curIndex);

          state.cachedBlocks[parentOfParentUuid].blocks.splice(parentIndex + 1, 0, blockUuid);
          for (let i = 1; i < restChildOfParent.length; i++) {
            state.cachedBlocks[blockUuid].blocks.push(restChildOfParent[i]);
          }
        }
      }
    }

    return state;
  }});
}

export function _deleteBlocks(dispatch, pageUuid, parentUuid, blockUuids, deleteChild=false) {
  dispatch({type, callback: state => {
    let parentBlock = parentUuid === pageUuid ? state.cachedPages[parentUuid] : state.cachedBlocks[parentUuid];
    for (let i = 0; i < blockUuids.length; i++) {
      let blockUuid = blockUuids[i];
      let curIndex = parentBlock.blocks.indexOf(blockUuid);
      if (curIndex === -1) {
        console.error(`Unable to find block ${blockUuid} under block ${parentUuid}!`);
        continue;
      }

      if (!deleteChild && state.cachedBlocks[blockUuid].blocks.length > 0) {
        parentBlock.blocks.splice(curIndex, 1, ...state.cachedBlocks[blockUuid].blocks);
      } else {
        parentBlock.blocks.splice(curIndex, 1);
      }
      delete state.cachedBlocks[blockUuid];
    }
    return state;
  }});
}

export function _enterSelectionMode(dispatch, pageUuid, blockUuid) {
  dispatch({type, callback: state => {
    state.selectedBlocks[pageUuid] = {
      anchorUuid: blockUuid,
      focusUuid: blockUuid,
      blocks: [blockUuid],
    };
    state.focusedBlock[pageUuid] = `${pageUuid}_blockSelector`;

    return state;
  }});
}

export function _escapeSelectionMode(dispatch, pageUuid) {
  dispatch({type, callback: state => {
    state.focusedBlock[pageUuid] = state.selectedBlocks[pageUuid].focusUuid;
    state.selectedBlocks[pageUuid] = defaultSelectedBlock;

    return state;
  }});
}

function _removeBlockSelection(dispatch, pageUuid) {
  dispatch({type, callback: state => {
    state.selectedBlocks[pageUuid] = defaultSelectedBlock;
    return state;
  }});
}

export function _selectBlock(dispatch, pageUuid, direction) {
  dispatch({type, callback: state => {
    let selectedBlocks = state.selectedBlocks[pageUuid];

    switch (direction) {
      case selectDirection.up: {
        let parentUuid = state.blockParents[selectedBlocks.focusUuid];
        let previousUuid = getPreviousBlock(state, pageUuid, selectedBlocks.focusUuid);

        if (previousUuid === parentUuid) {
          // Remove the blocks that is the child of the previous block
          let toRemove = [];
          for (let i = 0; i < selectedBlocks.blocks.length; i++) {
            if (state.blockParents[selectedBlocks.blocks[i]] === parentUuid) {
              toRemove.push(i);
            }
          }
          for (let i = toRemove.length - 1; i >= 0; i--) {
            selectedBlocks.blocks.splice(toRemove[i], 1);
          }

          // If anchor or focus block is child of previou block, then set focus/anchor block as previous block
          if (selectedBlocks.blocks.indexOf(selectedBlocks.focusUuid) === -1) {
            selectedBlocks.focusUuid = previousUuid;
          }
          if (selectedBlocks.blocks.indexOf(selectedBlocks.anchorUuid) === -1) {
            selectedBlocks.anchorUuid = previousUuid;
          }

          // Put the previous block into selectedBlocks
          selectedBlocks.blocks.push(parentUuid);
        } else {
          if (selectedBlocks.blocks.indexOf(previousUuid) !== -1) {
            if (selectedBlocks.focusUuid !== previousUuid) {
              // Previous block has been in current selection. As a result, this movement is to remove the current focus block.
              let focusOffset = selectedBlocks.blocks.indexOf(selectedBlocks.focusUuid);
              selectedBlocks.blocks.splice(focusOffset, 1);
              selectedBlocks.focusUuid = previousUuid;
            } // Else: current block is the first block. Do not need to do anything.
          } else {
            // Check whether previous block is selected
            let selected = false;
            let c = previousUuid;
            while (c !== pageUuid) {
              if (selectedBlocks.blocks.indexOf(c) !== -1) {
                selected = true;
                break;
              }

              c = state.blockParents[c];
            }

            if (selected) {
              // One of the ancestors of the previous block is in current selection. As a result, set focus block as this ancestor and do not add this block into the list of selected blocks, and remove the previous focus block.
              let focusOffset = selectedBlocks.blocks.indexOf(selectedBlocks.focusUuid);
              selectedBlocks.blocks.splice(focusOffset, 1);
              selectedBlocks.focusUuid = c;
            } else {
              // Previous block is not in current selection. As a result, this movement is to add a new block into current selection range.
              selectedBlocks.blocks.push(previousUuid);
              selectedBlocks.focusUuid = previousUuid;
            }
          }
        }
      } break;

      case selectDirection.down: {
        let nextUuid = getNextBlock(state, pageUuid, selectedBlocks.focusUuid, false);

        if (selectedBlocks.blocks.indexOf(nextUuid) !== -1) {
          if (selectedBlocks.focusUuid !== nextUuid) {
            // Next block has been in current selection. As a result, this movement is to remove the current focus block.
            let focusOffset = selectedBlocks.blocks.indexOf(selectedBlocks.focusUuid);
            selectedBlocks.blocks.splice(focusOffset, 1);
            selectedBlocks.focusUuid = nextUuid;
          } // Else: current block is the last block. Do not need to do anything.
        } else {
          // Next block is not in current selection. As a result, this movement is to add a new block into current selection range.
          selectedBlocks.blocks.push(nextUuid);
          selectedBlocks.focusUuid = nextUuid;
        }
      } break;

      case selectDirection.left: {
        let parentUuid = state.blockParents[selectedBlocks.focusUuid];
        if (parentUuid === pageUuid) {
          // Just select current focused block
          selectedBlocks.anchorUuid = selectedBlocks.focusUuid;
          selectedBlocks.blocks = [selectedBlocks.focusUuid];
        } else {
          // Remove the blocks that is the child of the parent block
          let toRemove = [];
          for (let i = 0; i < selectedBlocks.blocks.length; i++) {
            if (state.blockParents[selectedBlocks.blocks[i]] === parentUuid) {
              toRemove.push(i);
            }
          }
          for (let i = toRemove.length - 1; i >= 0; i--) {
            selectedBlocks.blocks.splice(toRemove[i], 1);
          }

          // If anchor or focus block is child of the parent block, then set focus/anchor block as the parent block
          if (selectedBlocks.blocks.indexOf(selectedBlocks.focusUuid) === -1) {
            selectedBlocks.focusUuid = parentUuid;
          }
          if (selectedBlocks.blocks.indexOf(selectedBlocks.anchorUuid) === -1) {
            selectedBlocks.anchorUuid = parentUuid;
          }

          // Put the previous block into selectedBlocks
          selectedBlocks.blocks.push(parentUuid);
        }
      } break;

      case selectDirection.right:
        if (state.cachedBlocks[selectedBlocks.focusUuid].blocks.length > 0) {
          // If this block has children blocks, then just focus the first child block.
          let firstChildUuid = state.cachedBlocks[selectedBlocks.focusUuid].blocks[0];
          selectedBlocks.focusUuid = firstChildUuid;
          selectedBlocks.anchorUuid = firstChildUuid;
          selectedBlocks.blocks = [firstChildUuid];
        } else {
          // Just select current focused block
          selectedBlocks.anchorUuid = selectedBlocks.focusUuid;
          selectedBlocks.blocks = [selectedBlocks.focusUuid];
        }
        break;

      default:
        console.error(`Unknown select direction: ${direction}`);
        return state;
    }

    return state;
  }});
}

/*************************************************
 * REDUCER
 * @brief Use immer to perform deep udpate of state.
 *************************************************/
export const editor = (oldState=initState, action) => produce(oldState, state => action.callback ? action.callback(state) : state);
