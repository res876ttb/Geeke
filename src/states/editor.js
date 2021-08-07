/*************************************************
 * @file editor.js
 * @description Action and reducer of react-redux.
 *************************************************/

/*************************************************
 * IMPORT
 *************************************************/
import { EditorState, Modifier, SelectionState } from 'draft-js';
import produce from 'immer';
import { checkOverlap, GeekeMap } from '../utils/Misc';

/*************************************************
 * CONST
 *************************************************/
import { colorList } from '../constant';

// The reducer is `editor`
const type = 'editor';

const magicMathStr = '¡™¡';

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

export const showEditorSelection = (dispatch, pageUuid, newSelectionState = null) => {
  dispatch({
    type,
    callback: (state) => {
      let page = state.cachedPages.get(pageUuid);
      const editorState = page.get('content');
      const selectionState = newSelectionState ? newSelectionState : editorState.getSelection();
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

export const toggleLink = (dispatch, pageUuid, link) => {
  dispatch({
    type,
    callback: (state) => {
      let page = state.cachedPages.get(pageUuid);
      let editorState = page.get('content');
      let validUrl = true;
      let plink = null;

      const selectionState = editorState.getSelection();
      const contentState = editorState.getCurrentContent();
      let newContentState = contentState;
      let newEditorState = editorState;

      // Check whether the selected text are all in the same block
      if (selectionState.getAnchorKey() !== selectionState.getFocusKey()) {
        return state;
      }

      // Get entities ranges
      const anchorBlock = contentState.getBlockForKey(selectionState.getAnchorKey());
      let firstLinkEntityKey = null;
      let curEntityKey = null;
      let clearMin = 10e9;
      let clearMax = -1;
      let rangesOfOverlapLink = [];
      anchorBlock.findEntityRanges(
        (value) => {
          curEntityKey = value.entity;
          return true;
        },
        (start, end) => {
          if (!curEntityKey) return;
          const curEntity = contentState.getEntity(curEntityKey);
          const startOffset = selectionState.getStartOffset();
          const endOffset = selectionState.getEndOffset();
          if (checkOverlap(start, end, startOffset, endOffset, false)) {
            if (curEntity.type === 'LINK') {
              if (!firstLinkEntityKey) firstLinkEntityKey = curEntityKey;
              rangesOfOverlapLink.push({ start, end });
            }
            clearMin = Math.min(start, clearMin);
            clearMax = Math.max(end, clearMax);
          }
        },
      );
      clearMin = Math.min(selectionState.getStartOffset(), clearMin);
      clearMax = Math.max(selectionState.getEndOffset(), clearMax);

      // Clear overlapping entities
      newContentState = Modifier.applyEntity(
        newContentState,
        new SelectionState({
          anchorKey: anchorBlock.getKey(),
          anchorOffset: clearMin,
          focusKey: anchorBlock.getKey(),
          focusOffset: clearMax,
        }),
        null,
      );

      // Try to parse the link first
      try {
        // If no http:// before the url, add it
        if (link && !link.match(/:\/\//)) {
          link = 'http://' + link;
        }
        plink = new URL(link);
      } catch {
        // Something went wrong when parsing the given link
        if (link) {
          console.warn(`Invalid url: ${link}`);
        }
        validUrl = false;
      }

      // If this is valid link
      if (validUrl) {
        // Get range of new link
        let left = 10e9;
        let right = -1;
        for (let i in rangesOfOverlapLink) {
          left = Math.min(left, rangesOfOverlapLink[i].start);
          right = Math.max(right, rangesOfOverlapLink[i].end);
        }
        left = Math.min(left, selectionState.getStartOffset());
        right = Math.max(right, selectionState.getEndOffset());

        // Create entity and apply url
        newContentState = newContentState.createEntity('LINK', 'MUTABLE', { url: plink.href });
        const entityKey = newContentState.getLastCreatedEntityKey();
        newEditorState = EditorState.set(newEditorState, { currentContent: newContentState });
        newContentState = Modifier.applyEntity(
          newContentState,
          new SelectionState({
            anchorKey: anchorBlock.getKey(),
            anchorOffset: left,
            focusKey: anchorBlock.getKey(),
            focusOffset: right,
          }),
          entityKey,
        );
      }

      // Push edit record
      newEditorState = EditorState.push(editorState, newContentState, 'apply-entity');
      // newEditorState = EditorState.push(newEditorState, newContentState, 'apply-entity'); // Why this?

      page.set('content', newEditorState);

      return state;
    },
  });
};

// Create empty inline math
export const createEmptyInlineMath = (
  dispatch,
  pageUuid,
  math = null,
  customSelection = null,
  getEntityKeyFunc = null,
) => {
  dispatch({
    type,
    callback: (state) => {
      let page = state.cachedPages.get(pageUuid);
      let editorState = page.get('content');

      let newEditorState = editorState;
      let newContentState = editorState.getCurrentContent();
      let selectionState = customSelection ? customSelection : editorState.getSelection();

      // Create entity key
      newContentState = newContentState.createEntity('MATH', 'IMMUTABLE', { math: math ? math : '1+e^{i\\pi}=0' });
      const entityKey = newContentState.getLastCreatedEntityKey();
      newEditorState = EditorState.set(newEditorState, { currentContent: newContentState });

      if (selectionState.isCollapsed()) {
        // If current selection is collapsed, let's insert an character to represent the inline math
        newContentState = Modifier.insertText(newContentState, selectionState, magicMathStr, null, entityKey);
      } else {
        // If current selection is not collapsed, let's apply the entity to the selected text
        newContentState = Modifier.applyEntity(newContentState, selectionState, entityKey);
      }

      // Push undo stack
      newEditorState = EditorState.push(editorState, newContentState, 'apply-entity');

      // Update reducer
      page.set('content', newEditorState);

      if (getEntityKeyFunc) getEntityKeyFunc(entityKey);

      return state;
    },
  });
};

// Remove inline math entity
export const removeInlineMath = (dispatch, pageUuid, blockKey, entityKey) => {
  dispatch({
    type,
    callback: (state) => {
      let page = state.cachedPages.get(pageUuid);
      let newEditorState = page.get('content');
      let newContentState = newEditorState.getCurrentContent();
      const curBlock = newContentState.getBlockForKey(blockKey);

      let anchorOffset = -1;
      let focusOffset = -1;

      // Find and clear target entity
      curBlock.findEntityRanges(
        (value) => {
          if (value.entity === entityKey) return true;
        },
        (start, end) => {
          anchorOffset = start;
          focusOffset = end;
        },
      );

      // Sanity check whether we find the target entity
      if (anchorOffset === -1) return state;

      // Check whether the entity string is magicMathStr. If true, it means that we have to remove this string as well.
      let text = curBlock.getText();
      if (text.slice(anchorOffset, focusOffset) === magicMathStr) {
        newContentState = Modifier.removeRange(
          newContentState,
          new SelectionState({
            anchorKey: blockKey,
            anchorOffset: anchorOffset,
            focusKey: blockKey,
            focusOffset: focusOffset,
          }),
          'backward',
        );
      }

      // Push undo stack (this operation should not be record, so we use insert-characters here)
      newEditorState = EditorState.push(newEditorState, newContentState, 'insert-characters');

      // Update reducer
      page.set('content', newEditorState);

      return state;
    },
  });
};

export const updateInlineMathData = (dispatch, pageUuid, entityKey, math) => {
  dispatch({
    type,
    callback: (state) => {
      if (!entityKey) return state;

      let page = state.cachedPages.get(pageUuid);
      let editorState = page.get('content');
      let newContentState = editorState.getCurrentContent();
      newContentState = newContentState.replaceEntityData(entityKey, { math });

      // Update with insert-characters type
      let newEditorState = EditorState.push(editorState, newContentState, 'insert-characters');

      // Update reducer
      page.set('content', newEditorState);

      return state;
    },
  });
};

export const removeEntity = (dispatch, pageUuid, selectionState, setSelectionState = false) => {
  dispatch({
    type,
    callback: (state) => {
      let page = state.cachedPages.get(pageUuid);
      let newEditorState = page.get('content');
      let newContentState = newEditorState.getCurrentContent();

      newContentState = Modifier.applyEntity(newContentState, selectionState, null);
      newEditorState = EditorState.push(newEditorState, newContentState, 'apply-entity');

      if (setSelectionState) {
        newEditorState = EditorState.forceSelection(newEditorState, selectionState);
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
