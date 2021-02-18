/*************************************************
 * @file editor.js
 * @description Action and reducer of react-redux.
 *************************************************/

/*************************************************
 * IMPORT
 *************************************************/
import produce from 'immer';
import {newBlockId} from '../utils/Misc.js';

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
  // Background
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

// Styled string
// const contentExample = 'This is «sb:bold:sb», and «cr:«sb:«si:bold and italic with color red:si»:sb»:cr»'

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
const UPDATE_CONTENT = 'EDITOR_UPDATE_CONTENT';
const ADD_PAGE = 'EDITOR_ADD_PAGE';
const ADD_BLOCK = 'EDITOR_ADD_BLOCK';
const SET_SAVING_STATE = 'EDITOR_SET_SAVING_STATE';

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

/*************************************************
 * MIDDLE FUNCTION
 *************************************************/
export function _addPage(dispatch, pageUuid, blockUuid) {
  dispatch({
    type: ADD_PAGE,
    pageUuid: pageUuid,
    blockUuid: blockUuid,
  });
}

export function _updateContent(dispatch, uuid, content) {
  dispatch({
    type: UPDATE_CONTENT,
    content: content,
    uuid: uuid,
  });
}

export function _setSavintState(dispatch, state) {
  dispatch({
    type: SET_SAVING_STATE,
    state: state,
  });
}

/*************************************************
 * REDUCER
 *************************************************/
export let editor = (oldState=initState, action) => produce(oldState, state => {
  switch(action.type) {
    case UPDATE_CONTENT:
      state.cachedBlock[action.uuid].content = action.content;

      state.dirtyItem.push(action.uuid);
      break;
    
    case ADD_PAGE:
      let newPage = emptyPage;
      let newBlock = emptyBlock;
      newPage.uuid = action.pageUuid;
      newBlock.uuid = action.blockUuid;
      newPage.blocks.push(newBlock);
      state.cachedPages[action.pageUuid] = newPage;

      state.dirtyAction.push({
        uuid: newPage.uuid,
        type: ADD_PAGE,
      });
      state.dirtyAction.push({
        uuid: newBlock.uuid,
        type: ADD_BLOCK,
      });
      break;
    
    case SET_SAVING_STATE:
      state.editorState.saving = action.state;
      break;

    default:
      break;  
  }
});
