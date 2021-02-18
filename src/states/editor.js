/*************************************************
 * @file editor.js
 * @description Action and reducer of react-redux.
 *************************************************/

/*************************************************
 * IMPORT
 *************************************************/
import produce from 'immer';
import {newBlockId} from '../utils/Misc';

/*************************************************
 * CONST
 *************************************************/
/*
 * Target performance:
 *   * Cluster: 1M users, 1T blocks, 10M queries per seconds
 *   * Single CPU server: 100 users, 1M blocks, 1K queries per seconds
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

// Init state
const initState = {
  cachedPages: {},
  cachedBlock: {},
  pageTree: {},
  dirtyItem: [],
  dirtyAction: [],
  editorState: {
    saving: false,
  },
}

// Types
const ADD_BLOCK = 'EDITOR_ADD_BLOCK';
const ADD_PAGE = 'EDITOR_ADD_PAGE';
const SET_SAVING_STATE = 'EDITOR_SET_SAVING_STATE';
const UPDATE_CONTENT = 'EDITOR_UPDATE_CONTENT';
const MOVE_BLOCK = 'EDITOR_MOVE_BLOCK';

/*************************************************
 * ACTOR
 *************************************************/
export function updateContent(dispatch, uuid, content) {
  _updateContent(dispatch, uuid, content);
}

export function addPage(dispatch) {
  _addPage(dispatch, newBlockId(), newBlockId());
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
export function _addPage(dispatch, pageUuid, blockUuid) {
  dispatch({
    type: ADD_PAGE,
    callback: state => {
      let newPage = emptyPage;
      let newBlock = emptyBlock;
      newPage.uuid = pageUuid;
      newBlock.uuid = blockUuid;
      newPage.blocks.push(newBlock);
      state.cachedPages[pageUuid] = newPage;

      state.dirtyAction.push({
        uuid: newPage.uuid,
        type: ADD_PAGE,
      });
      state.dirtyAction.push({
        uuid: newBlock.uuid,
        type: ADD_BLOCK,
      });
    }
  });
}

export function _updateContent(dispatch, uuid, content) {
  dispatch({
    type: UPDATE_CONTENT,
    callback: state => {
      state.cachedBlock[uuid].content = content;
      state.dirtyItem.push(uuid);
      return state;
    }
  });
}

export function _setSavintState(dispatch, savingState) {
  dispatch({
    type: SET_SAVING_STATE,
    callback: state => {
      state.editorState.saving = savingState;
      return state;
    }
  });
}

export function _addBlock(dispatch, parentUuid, aboveUuid) {
  dispatch({
    type: ADD_BLOCK,
    callback: state => {
      return state;
    }
  });
}

export function _moveBlock(dispatch, parentUuid, originParentUuid, aboveUuid) {
  dispatch({
    type: MOVE_BLOCK,
    callback: state => {
      return state;
    }
  });
}

/*************************************************
 * REDUCER
 *************************************************/
export let editor = (oldState=onePage, action) => produce(oldState, state => action.callback ? action.callback(state) : state);
