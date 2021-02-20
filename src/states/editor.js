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
  Permision: 0,
  // Icon
  icon: '',
};

// Empty Block
const emptyBlock = {
  // Block ID
  uuid: '66666666-7777-8888-9999-000000000000',
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
  // Permission: default permission
  permission: {
    read: permissionConst.members,
    write: permissionConst.members,
  }
}

// Init state
const initState = {
  workspace: {},
  cachedPages: {},
  cachedBlocks: {},
  pageTree: {
    root: {},
    rLink: {}, // reverse link
  },
  editorState: {
    saving: false,
  },
}

/*************************************************
 * ACTOR
 *************************************************/
export function updateContent(dispatch, uuid, content) {
  _updateContent(dispatch, uuid, content);
}

export function addPage(dispatch, parentUuid) {
  _addPage(dispatch, newBlockId(), newBlockId(), parentUuid);
}

export function setSavintState(dispatch, state) {
  _setSavintState(dispatch, state);
}

export function addBlock(dispatch, parentUuid, aboveUuid) {
  _addBlock(dispatch, parentUuid, aboveUuid);
}

export function moveBlock(dispatch, parentUuid, originParentUuid, aboveUuid) {
  _moveBlock(dispatch, parentUuid, originParentUuid, aboveUuid);
}

/*************************************************
 * MIDDLE FUNCTION
 *************************************************/
export function _addPage(dispatch, pageUuid, blockUuid, parentUuid) {
  dispatch({type,
    callback: state => {
      let newPage = emptyPage;
      let newBlock = emptyBlock;
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

export function _updateContent(dispatch, uuid, content) {
  dispatch({type,
    callback: state => {
      state.cachedBlocks[uuid].content = content;
      return state;
    }
  });
}

export function _setSavintState(dispatch, savingState) {
  dispatch({type,
    callback: state => {
      state.editorState.saving = savingState;
      return state;
    }
  });
}

export function _addBlock(dispatch, parentUuid, aboveUuid) {
  dispatch({type,
    callback: state => {
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

/*************************************************
 * REDUCER
 * @brief Use immer to perform deep udpate of state.
 *************************************************/
export let editor = (oldState=initState, action) => produce(oldState, state => action.callback ? action.callback(state) : state);

/*************************************************
 * TEST HELPER
 *************************************************/
export function getInitState() {
  return _.cloneDeep(initState);
}

export function newPage() {
  return _.cloneDeep(emptyPage);
}

export function newBlock() {
  return _.cloneDeep(emptyBlock);
}
