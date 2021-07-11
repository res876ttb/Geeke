/*************************************************
 * @file editor.js
 * @description Action and reducer of react-redux.
 *************************************************/

/*************************************************
 * IMPORT
 *************************************************/
import produce from 'immer';
import { GeekeMap } from '../utils/Misc';

/*************************************************
 * CONST
 *************************************************/
const type = 'editor';

// Permission
const permissionConst = {
  members: 0,
  everyone: 1,
  owner: 2,
  invitee: 3,
};

/**
 * Data structure
 * Target performance:
 *   * Cluster: 1M users, 1T blocks, 10M queries per seconds
 *   * Single CPU server: 100 users, 1M blocks, 1K queries per seconds
 * DB: NoSQL
 */
// Empty Page
const emptyPageObj = {
  // Page ID
  uuid: '11111111-2222-3333-4444-555555555555',
  // Author
  author: '',
  // Space
  space: '',
  // Title
  title: 'Untitled',
  // Editor content. It should be initialized as EditorState object
  content: null,
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
  // Read only
  readOnly: false,
  // Public: be able to be searched by search engine
  public: false,
  // Create date
  createDate: 0.0,
  // Last modified date
  lastModifiedDate: 0.0,
  // Ancestors
  ancestors: [],
};

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
  cachedPages: new Map(),
};

/*************************************************
 * ACTION
 *************************************************/
export const initPage = (dispatch, pageUuid) => {
  dispatch({type, callback: state => {
    state.cachedPages.set(pageUuid, new GeekeMap(Object.entries(emptyPageObj)));
    return state;
  }});
};

export const setReadOnly = (dispatch, pageUuid, readOnly) => {
  dispatch({type, callback: state => {
    let page = state.cachedPages.get(pageUuid);
    page.set('readOnly', readOnly);
    return state;
  }});
};

export const setEditorState = (dispatch, pageUuid, editorState) => {
  dispatch({type, callback: state => {
    let page = state.cachedPages.get(pageUuid);
    page.set('content', editorState);
    return state;
  }});
};

export const setSelectionState = (dispatch, pageUuid, selectionState) => {
  dispatch({type, callback: state => {
    return state;
  }});
};

/*************************************************
 * REDUCER
 * @brief Use immer to perform deep udpate of state.
 *************************************************/
export const editor = (oldState=initState, action) => action.type === type ? produce(oldState, state => action.callback ? action.callback(state) : state) : oldState;
