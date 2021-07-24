/*************************************************
 * @file editor.js
 * @description Action and reducer of react-redux.
 *************************************************/

/*************************************************
 * IMPORT
 *************************************************/
import { EditorState, Modifier } from 'draft-js';
import produce from 'immer';
import { GeekeMap } from '../utils/Misc';

/*************************************************
 * CONST
 *************************************************/
import { colorList } from '../constant';

// The reducer is `editor`
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
  dispatch({
    type,
    callback: (state) => {
      state.cachedPages.set(pageUuid, new GeekeMap(Object.entries(emptyPageObj)));
      return state;
    },
  });
};

export const setReadOnly = (dispatch, pageUuid, readOnly) => {
  dispatch({
    type,
    callback: (state) => {
      let page = state.cachedPages.get(pageUuid);
      page.set('readOnly', readOnly);
      return state;
    },
  });
};

export const setEditorState = (dispatch, pageUuid, editorState) => {
  dispatch({
    type,
    callback: (state) => {
      let page = state.cachedPages.get(pageUuid);
      page.set('content', editorState);
      return state;
    },
  });
};

export const showEditorSelection = (dispatch, pageUuid) => {
  dispatch({
    type,
    callback: (state) => {
      let page = state.cachedPages.get(pageUuid);
      const editorState = page.get('content');
      const selectionState = editorState.getSelection();
      const newEditorState = EditorState.forceSelection(editorState, selectionState);
      page.set('content', newEditorState);

      return state;
    },
  });
};

export const toggleBold = (dispatch, pageUuid) => toggleStyle(dispatch, pageUuid, 'BOLD');
export const toggleItalic = (dispatch, pageUuid) => toggleStyle(dispatch, pageUuid, 'ITALIC');
export const toggleStrikethrough = (dispatch, pageUuid) => toggleStyle(dispatch, pageUuid, 'STRIKETHROUGH');
export const toggleUnderline = (dispatch, pageUuid) => toggleStyle(dispatch, pageUuid, 'UNDERLINE');
export const toggleCode = (dispatch, pageUuid) => toggleStyle(dispatch, pageUuid, 'CODE');

// Reference: https://github.com/facebook/draft-js/blob/10ca1ad44843e970c4314f85a8f37d26f842ebf9/src/model/modifier/RichTextEditorUtil.js
export const toggleStyle = (dispatch, pageUuid, inlineStyle) => {
  dispatch({
    type,
    callback: (state) => {
      let page = state.cachedPages.get(pageUuid);
      let editorState = page.get('content');

      let newContentState = editorState.getCurrentContent();
      let newEditorState = editorState;
      const selectionState = editorState.getSelection();
      const currentStyle = editorState.getCurrentInlineStyle();

      if (selectionState.isCollapsed()) {
        // If the selection is collapsed, toggle the specified style on or off and
        // set the result as the new inline style override. This will then be
        // used as the inline style for the next character to be inserted.
        newEditorState = EditorState.setInlineStyleOverride(
          editorState,
          currentStyle.has(inlineStyle) ? currentStyle.remove(inlineStyle) : currentStyle.add(inlineStyle),
        );
      } else {
        // If characters are selected, immediately apply or remove the
        // inline style on the document state itself.

        // If the style is already present for the selection range, remove it.
        // Otherwise, apply it.
        if (currentStyle.has(inlineStyle)) {
          newContentState = Modifier.removeInlineStyle(newContentState, selectionState, inlineStyle);
        } else {
          newContentState = Modifier.applyInlineStyle(newContentState, selectionState, inlineStyle);
        }

        // Push state
        newEditorState = EditorState.push(editorState, newContentState, 'change-inline-style');
      }

      page.set('content', newEditorState);

      return state;
    },
  });
};

export const setTextColor = (dispatch, pageUuid, color) => {
  dispatch({
    type,
    callback: (state) => {
      let page = state.cachedPages.get(pageUuid);
      let editorState = page.get('content');

      let newContentState = editorState.getCurrentContent();
      const selectionState = editorState.getSelection();

      // Clear test color
      for (let i in colorList) {
        let textColorStyle = `TEXT${colorList[i]}`;
        newContentState = Modifier.removeInlineStyle(newContentState, selectionState, textColorStyle);
      }

      // Set text color style
      const upperColor = color.toUpperCase();
      if (colorList.indexOf(upperColor) !== -1) {
        newContentState = Modifier.applyInlineStyle(newContentState, selectionState, `TEXT${upperColor}`);
      }

      let newEditorState = EditorState.push(editorState, newContentState, 'change-inline-style');
      newEditorState = EditorState.forceSelection(newEditorState, selectionState);
      page.set('content', newEditorState);

      return state;
    },
  });
};

export const setBackgroundColor = (dispatch, pageUuid, color) => {
  dispatch({
    type,
    callback: (state) => {
      let page = state.cachedPages.get(pageUuid);
      let editorState = page.get('content');

      let newContentState = editorState.getCurrentContent();
      const selectionState = editorState.getSelection();

      // Clear test color
      for (let i in colorList) {
        let textColorStyle = `BG${colorList[i]}`;
        newContentState = Modifier.removeInlineStyle(newContentState, selectionState, textColorStyle);
      }

      // Set text color style
      const upperColor = color.toUpperCase();
      if (colorList.indexOf(upperColor) !== -1) {
        newContentState = Modifier.applyInlineStyle(newContentState, selectionState, `BG${upperColor}`);
      }

      let newEditorState = EditorState.push(editorState, newContentState, 'change-inline-style');
      newEditorState = EditorState.forceSelection(newEditorState, selectionState);
      page.set('content', newEditorState);

      return state;
    },
  });
};

/*************************************************
 * REDUCER
 * @brief Use immer to perform deep udpate of state.
 *************************************************/
export const editor = (oldState = initState, action) =>
  action.type === type ? produce(oldState, (state) => (action.callback ? action.callback(state) : state)) : oldState;
