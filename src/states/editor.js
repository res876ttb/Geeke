/*************************************************
 * @file editor.js
 * @description Action and reducer of react-redux.
 *************************************************/

/*************************************************
 * IMPORT
 *************************************************/
import produce from 'immer';

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
// const contentExample = 'This is «sb:bold», and «cr:«sb:«si:bold and italic with color red»»»'

// Init state
const initState = {
  cachedPages: {},
  cachedBlock: {},
  pageTree: {},
}

// Types
const UPDATE_CONTENT = 'EDITOR_UPDATE_CONTENT';

/*************************************************
 * ACTOR
 *************************************************/
export function updateContent(uuid, content) {
  return {
    type: UPDATE_CONTENT,
    content: content,
    uuid: uuid,
  };
}

/*************************************************
 * REDUCER
 *************************************************/
export let editor = (oldState=initState, action) => produce(oldState, state => {
  switch(action.type) {
    case UPDATE_CONTENT:
      state.cachedBlock[action.uuid].content = action.content;
      break;

    default:
      break;  
  }
});
